import { NextRequest, NextResponse } from 'next/server';
import {
  getAllNetworks,
  createNetwork,
  updateNetwork,
  deleteNetwork
} from '@/lib/database';

export async function GET() {
  try {
    const networks = await getAllNetworks();
    return NextResponse.json(networks);
  } catch (error) {
    console.error('Error fetching networks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const network = await request.json();

    if (!network.name || !network.name.trim()) {
      return NextResponse.json(
        { error: 'Network name is required' },
        { status: 400 }
      );
    }

    const newNetwork = {
      id: `n${Date.now()}`,
      name: network.name.trim()
    };

    await createNetwork(newNetwork);

    return NextResponse.json({ success: true, network: newNetwork });
  } catch (error) {
    console.error('Error creating network:', error);
    return NextResponse.json(
      { error: 'Failed to create network' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const network = await request.json();

    if (!network.id || !network.name || !network.name.trim()) {
      return NextResponse.json(
        { error: 'Network ID and name are required' },
        { status: 400 }
      );
    }

    await updateNetwork(network.id, network.name.trim());

    return NextResponse.json({ success: true, network });
  } catch (error) {
    console.error('Error updating network:', error);
    return NextResponse.json(
      { error: 'Failed to update network' },
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
        { error: 'Network ID is required' },
        { status: 400 }
      );
    }

    await deleteNetwork(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting network:', error);
    return NextResponse.json(
      { error: 'Failed to delete network' },
      { status: 500 }
    );
  }
}
