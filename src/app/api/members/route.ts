import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, createMember, updateMember, deleteMember } from '@/lib/database';

export async function GET() {
  try {
    const members = await getAllMembers();
    // Transform field names to match frontend expectations
    const transformedMembers = members.map((member: any) => ({
      ...member,
      joinDate: member.join_date,
      avatarUrl: member.avatar_url
    }));
    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const member = await request.json();

    const memberToCreate = {
      id: member.id,
      name: member.name,
      email: member.email || null,
      phone: member.phone || null,
      join_date: member.joinDate,
      avatar_url: member.avatarUrl || null,
      address: member.address || null,
      network: member.network
    };

    await createMember(memberToCreate);

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const member = await request.json();

    const memberToUpdate = {
      id: member.id,
      name: member.name,
      email: member.email || null,
      phone: member.phone || null,
      join_date: member.joinDate,
      avatar_url: member.avatarUrl || null,
      address: member.address || null,
      network: member.network
    };

    await updateMember(member.id, memberToUpdate);

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    await deleteMember(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
