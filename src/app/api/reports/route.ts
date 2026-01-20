import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, getDonationsWithFilters, getExpensesWithFilters, getDistinctServiceTimes } from '@/lib/database';
import { RawMember, RawDonation, RawExpense } from '@/lib/types';

// Type for donations after mapping
type MappedDonation = {
  id: string;
  donor_name: string;
  member_id: string;
  amount: number;
  date: string;
  category: string;
  giving_type_id?: string;
  service_time?: string;
  recorded_by_id?: string;
  reference?: string;
  donorName: string;
  memberId: string;
  serviceTime?: string;
  recordedById?: string;
};

// Helper function to generate membership growth data
async function generateMembershipGrowthData(startDate: string, endDate: string) {
  const allMembers: RawMember[] = await getAllMembers();

  // Parse the date range
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Create monthly data points
  const monthlyData: { month: string, new: number, total: number }[] = [];
  const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
  let runningTotal = 0;

  // Calculate initial total (members who joined before the start date)
  runningTotal = allMembers.filter((member: RawMember) => {
    const joinDate = new Date(member.join_date);
    return joinDate < start;
  }).length;

  // Generate monthly data points within the date range
  while (currentDate <= end) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Count new members for this month
    const newMembers = allMembers.filter((member: RawMember) => {
      const joinDate = new Date(member.join_date);
      return joinDate >= monthStart && joinDate <= monthEnd;
    });

    const newCount = newMembers.length;
    runningTotal += newCount;

    // Format month label (e.g., 'Jan 2025', 'Feb 2025')
    const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    monthlyData.push({
      month: monthLabel,
      new: newCount,
      total: runningTotal
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return monthlyData;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const serviceFilter = url.searchParams.get('service');
    const networkFilter = url.searchParams.get('network');

    // Get all necessary data
    const members: RawMember[] = await getAllMembers();

    // Get donations with filters - for now, get all and filter in memory
    // TODO: Could optimize this with more specific helper functions
    const allDonations: RawDonation[] = await getDonationsWithFilters(startDate || undefined, endDate || undefined);
    let donations: MappedDonation[] = allDonations.map((d: RawDonation) => ({
      ...d,
      amount: Number(d.amount),
      donorName: d.donor_name,
      memberId: d.member_id,
      serviceTime: d.service_time,
      recordedById: d.recorded_by_id
    }));

    // Apply service filter if specified
    if (serviceFilter && serviceFilter !== 'all') {
      donations = donations.filter(d => d.serviceTime === serviceFilter);
    }

    // Get expenses with filters
    const expenses: RawExpense[] = await getExpensesWithFilters(startDate || undefined, endDate || undefined);

    // Filter donations by network if specified
    const filteredDonations = donations.filter((d: MappedDonation) => {
      if (!networkFilter || networkFilter === 'all') return true;
      const member = members.find((m: RawMember) => m.id === d.memberId);
      return member && member.network === networkFilter;
    });

    // Create member lookup map
    const memberMap = new Map(members.map((m: RawMember) => [m.id, m]));

    // Calculations
    const totalDonations = filteredDonations.reduce((sum: number, d: MappedDonation) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, e: RawExpense) => sum + Number(e.amount), 0);
    const totalMembers = members.length;

    // Recent donations
    const recentDonations = filteredDonations
      .sort((a: MappedDonation, b: MappedDonation) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Donations by category
    const donationsByCategory = filteredDonations.reduce((acc: Record<string, number>, d: MappedDonation) => {
      acc[d.category] = (acc[d.category] || 0) + d.amount;
      return acc;
    }, {});
    const donationsByCategoryData = Object.entries(donationsByCategory).map(([category, amount]) => ({
      category,
      amount,
      fill: `var(--color-${category.replace(' ', '')})`,
    }));

    // Donations by service time (include all donations, group unknown service times)
    const donationsByServiceTime = filteredDonations.reduce((acc: Record<string, number>, d: MappedDonation) => {
      const serviceTime = d.serviceTime && d.serviceTime.trim() !== '' ? d.serviceTime : 'Unknown Service Time';
      acc[serviceTime] = (acc[serviceTime] || 0) + d.amount;
      return acc;
    }, {});
    const donationsByServiceTimeData = Object.entries(donationsByServiceTime).map(([name, amount]) => ({
      name,
      amount,
    }));

    // Donations by network
    const donationsByNetwork = filteredDonations.reduce((acc: Record<string, number>, d: MappedDonation) => {
      const member = memberMap.get(d.memberId);
      const network = member ? member.network : 'Unknown';
      acc[network] = (acc[network] || 0) + d.amount;
      return acc;
    }, {});
    const donationsByNetworkData = Object.entries(donationsByNetwork).map(([name, amount]) => ({
      name,
      amount,
    }));

    // Income vs expenses data
    const incomeVsExpensesData = [
      { name: 'Financials', income: totalDonations, expenses: totalExpenses },
    ];

    // Membership growth data - calculate from member join dates
    const membershipGrowthData = await generateMembershipGrowthData(startDate || '2024-01-01', endDate || '2024-12-31');

    // Service times
    const serviceTimes = await getDistinctServiceTimes();

    return NextResponse.json({
      summary: {
        totalMembers,
        totalDonations,
        totalExpenses,
      },
      data: {
        recentDonations,
        donationsByCategory: donationsByCategoryData,
        donationsByServiceTime: donationsByServiceTimeData,
        donationsByNetwork: donationsByNetworkData,
        incomeVsExpensesData,
        membershipGrowthData,
        serviceTimes,
      }
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
