// app/api/family-tree/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type FamilyMember = {
  id: string;
  name: string;
  givenName: string;
  surname: string;
  birthDate?: string;
  deathDate?: string;
  gender: 'M' | 'F' | 'U';
  children?: FamilyMember[];
  partners?: FamilyMember[];
};

type FamilyTreeResponse = {
  tree: FamilyMember;
  fileName: string;
  uploadDate: string;
  verification?: {
    status: 'verified' | 'pending' | 'unverified';
    verifiedAt?: string;
    blockchainHash?: string;
  };
  warning?: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
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
        { error: 'User profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get latest verified GEDCOM file with verification status
    const { data: gedcomFiles, error: gedcomError } = await supabase
      .from('gedcom_files')
      .select(`
        *,
        verifications:verification_results(
          status,
          verified_at,
          blockchain_hash
        )
      `)
      .eq('user_id', profile.id)
      .eq('status', 'verified')
      .order('upload_date', { ascending: false })
      .limit(1)
      .single();

    if (gedcomError || !gedcomFiles) {
      return NextResponse.json(
        { error: 'No verified GEDCOM files found', code: 'NO_GEDCOM_FILES' },
        { status: 404 }
      );
    }

    // Get family members with relationships
    const { data: familyMembers, error: membersError } = await supabase
      .from('family_members')
      .select(`
        *,
        relationships_as_child:relationships!family_member_id(
          relationship_type,
          related_family_member_id
        ),
        relationships_as_parent:relationships!related_family_member_id(
          relationship_type,
          family_member_id
        )
      `)
      .eq('gedcom_file_id', gedcomFiles.id);

    if (membersError || !familyMembers?.length) {
      return NextResponse.json(
        { error: 'No family members found', code: 'NO_FAMILY_MEMBERS' },
        { status: 404 }
      );
    }

    // Build the family tree structure
    const buildTree = (memberId: string, level = 0): FamilyMember | null => {
      if (level > 10) return null; // Prevent infinite recursion
      
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) return null;

      const treeMember: FamilyMember = {
        id: member.id,
        name: `${member.given_name} ${member.surname}`.trim(),
        givenName: member.given_name,
        surname: member.surname,
        birthDate: member.birth_date,
        deathDate: member.death_date,
        gender: member.gender || 'U',
        children: [],
        partners: []
      };

      // Find children
      const children = member.relationships_as_parent
        ?.filter((rel: any) => rel.relationship_type === 'parent')
        .map((rel: any) => buildTree(rel.family_member_id, level + 1))
        .filter(Boolean) as FamilyMember[];

      if (children?.length) {
        treeMember.children = children;
      }

      // Find partners
      const partners = member.relationships_as_child
        ?.filter((rel: any) => rel.relationship_type === 'partner')
        .map((rel: any) => {
          const partner = familyMembers.find(m => m.id === rel.related_family_member_id);
          return partner ? {
            id: partner.id,
            name: `${partner.given_name} ${partner.surname}`.trim(),
            givenName: partner.given_name,
            surname: partner.surname,
            birthDate: partner.birth_date,
            deathDate: partner.death_date,
            gender: partner.gender || 'U'
          } : null;
        })
        .filter(Boolean) as FamilyMember[];

      if (partners?.length) {
        treeMember.partners = partners;
      }

      return treeMember;
    };

    // Find root person (oldest ancestor or first person)
    const rootPerson = familyMembers[0]; // Simple approach - in a real app, you'd want a better way to find the root
    const tree = buildTree(rootPerson.id);

    if (!tree) {
      throw new Error('Failed to build family tree');
    }

    // Prepare verification status
    const verification = gedcomFiles.verifications?.[0] ? {
      status: gedcomFiles.verifications[0].status,
      verifiedAt: gedcomFiles.verifications[0].verified_at,
      blockchainHash: gedcomFiles.verifications[0].blockchain_hash
    } : undefined;

    const response: FamilyTreeResponse = {
      tree,
      fileName: gedcomFiles.filename,
      uploadDate: gedcomFiles.upload_date,
      verification,
      warning: familyMembers.length > 100 ? 'Large family tree - some features may be limited' : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Family tree API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}