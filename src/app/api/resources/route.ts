import { NextRequest, NextResponse } from 'next/server';
import { getAllResources, createResource, deleteResource } from '@/lib/database';

export async function GET() {
    try {
        const resources = await getAllResources();
        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resources' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        const newResource = {
            id: body.id || `res${Date.now()}`,
            name: body.name
        };

        await createResource(newResource);

        return NextResponse.json({ success: true, resource: newResource });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json(
            { error: 'Failed to create resource' },
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
                { error: 'Resource ID is required' },
                { status: 400 }
            );
        }

        await deleteResource(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource' },
            { status: 500 }
        );
    }
}
