import { NextRequest, NextResponse } from 'next/server';
import { getAllDonations, createDonation, updateDonation, deleteDonation } from '@/lib/database';
import { RawDonation } from '@/lib/types';

export async function GET() {
  try {
    const donations = await getAllDonations() as RawDonation[];
    // Transform field names to match frontend expectations
    const transformedDonations = donations.map((donation: RawDonation) => ({
      ...donation,
      amount: typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount, // Convert string to number for MySQL DECIMAL
      donorName: donation.donor_name,
      memberId: donation.member_id,
      givingTypeId: donation.giving_type_id,
      serviceTime: donation.service_time,
      recordedById: donation.recorded_by_id
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(transformedDonations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const donation = await request.json();

    const donationToCreate = {
      id: donation.id,
      donor_name: donation.donorName,
      member_id: donation.memberId,
      amount: donation.amount,
      date: donation.date,
      category: donation.category,
      giving_type_id: donation.givingTypeId || null,
      service_time: donation.serviceTime || null,
      recorded_by_id: donation.recordedById || null,
      reference: donation.reference || null
    };

    await createDonation(donationToCreate);

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const donation = await request.json();

    const donationToUpdate = {
      id: donation.id,
      donor_name: donation.donorName,
      member_id: donation.memberId,
      amount: donation.amount,
      date: donation.date,
      category: donation.category,
      giving_type_id: donation.givingTypeId || null,
      service_time: donation.serviceTime || null,
      recorded_by_id: donation.recordedById || null,
      reference: donation.reference || null
    };

    await updateDonation(donation.id, donationToUpdate);

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { error: 'Failed to update donation' },
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
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }

    await deleteDonation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
}
