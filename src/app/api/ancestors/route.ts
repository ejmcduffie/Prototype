// app/api/ancestors/route.ts
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
      return NextResponse.json(
        { ancestors: [] },
        { status: 200 }
      );
    }

    // Get family members with relationships to determine hierarchy
    const { data: familyMembers, error: membersError } = await supabase
      .from('family_members')
      .select(`
        id,
        given_name,
        surname,
        birth_date,
        death_date,
        gender,
        location,
        verification_status,
        relationships:relationships!family_member_id(
          relationship_type,
          related_family_member_id
        )
      `)
      .eq('gedcom_file_id', latestGedcom.id)
      .order('birth_date', { ascending: true }); // Order by birth date to get oldest first

    if (membersError || !familyMembers?.length) {
      return NextResponse.json(
        { ancestors: [] },
        { status: 200 }
      );
    }

    // Function to determine relationship level
    const getRelationshipLevel = (member: any, level = 0, visited = new Set()): number => {
      if (visited.has(member.id)) return level;
      visited.add(member.id);

      const parentRelations = member.relationships?.filter((r: any) => 
        r.relationship_type === 'parent'
      ) || [];

      if (parentRelations.length === 0) return level;

      const parentLevels = parentRelations.map((rel: any) => {
        const parent = familyMembers.find((m: any) => m.id === rel.related_family_member_id);
        return parent ? getRelationshipLevel(parent, level + 1, new Set(visited)) : level;
      });

      return Math.max(...parentLevels, level);
    };

    // Process ancestors
    const ancestors = familyMembers
      .map((member: any) => {
        const level = getRelationshipLevel(member);
        let relation = 'Ancestor';
        
        if (level === 0) relation = 'Yourself';
        else if (level === 1) relation = 'Parent';
        else if (level === 2) relation = 'Grandparent';
        else if (level > 2) relation = 'Great-'.repeat(level - 2) + 'Grandparent';

        return {
          id: member.id,
          name: `${member.given_name} ${member.surname}`.trim(),
          birthYear: member.birth_date ? new Date(member.birth_date).getFullYear().toString() : 'Unknown',
          location: member.location || 'Unknown',
          relation,
          verificationStatus: member.verification_status || 'unverified'
        };
      })
      .filter((a: any) => a.relation !== 'Yourself') // Exclude self
      .sort((a: any, b: any) => {
        // Sort by generation level, then by name
        const levelA = a.relation.split(' ')[0] === 'Great' ? 
          a.relation.split('-').length + 1 : 
          (a.relation === 'Parent' ? 1 : 2);
        const levelB = b.relation.split(' ')[0] === 'Great' ? 
          b.relation.split('-').length + 1 : 
          (b.relation === 'Parent' ? 1 : 2);
        
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ ancestors });

  } catch (error) {
    console.error('Ancestors API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}