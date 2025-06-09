// app/api/family-stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get the latest verified GEDCOM file
    const { data: latestGedcom, error: gedcomError } = await supabase
      .from('gedcom_files')
      .select('id')
      .eq('user_id', profile.id)
      .eq('status', 'verified')
      .order('upload_date', { ascending: false })
      .limit(1)
      .single();

    if (gedcomError || !latestGedcom) {
      return NextResponse.json({
        totalAncestors: 0,
        verifiedAncestors: 0,
        generations: 0,
        earliestRecord: null,
        primaryLocation: 'Unknown',
        slaveRecordMatches: 0,
        blockchainVerification: 'Inactive'
      });
    }

    // Get family member statistics
    const { data: memberStats, error: statsError } = await supabase
      .from('family_members')
      .select('birth_date, verification_status, location')
      .eq('gedcom_file_id', latestGedcom.id);

    if (statsError) {
      console.error('Error fetching member stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalAncestors = memberStats?.length || 0;
    const verifiedAncestors = memberStats?.filter(m => m.verification_status === 'verified').length || 0;
    
    // Find earliest birth date
    const birthDates = memberStats
      ?.map(m => m.birth_date)
      .filter(date => date)
      .sort();
    const earliestRecord = birthDates?.[0] ? new Date(birthDates[0]).getFullYear().toString() : null;

    // Calculate generations
    const latestBirthYear = birthDates?.[birthDates.length - 1] ? new Date(birthDates[birthDates.length - 1]).getFullYear() : null;
    const earliestBirthYear = birthDates?.[0] ? new Date(birthDates[0]).getFullYear() : null;
    const generations = (latestBirthYear && earliestBirthYear) 
      ? Math.ceil((latestBirthYear - earliestBirthYear) / 25)
      : 0;

    // Find most common location
    const locationCounts = memberStats?.reduce((acc: any, member) => {
      if (member.location) {
        acc[member.location] = (acc[member.location] || 0) + 1;
      }
      return acc;
    }, {});
    
    const primaryLocation = locationCounts 
      ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b, 'Unknown')
      : 'Unknown';

    // Get slave record matches
    const { count: slaveRecordCount, error: slaveError } = await supabase
      .from('verification_results')
      .select('*', { count: 'exact', head: true })
      .eq('gedcom_file_id', latestGedcom.id)
      .eq('record_type', 'slave_record');

    const slaveRecordMatches = slaveError ? 0 : (slaveRecordCount || 0);

    return NextResponse.json({
      totalAncestors,
      verifiedAncestors,
      generations,
      earliestRecord,
      primaryLocation,
      slaveRecordMatches,
      blockchainVerification: verifiedAncestors > 0 ? 'Active' : 'Inactive'
    });

  } catch (error) {
    console.error('Family stats API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}