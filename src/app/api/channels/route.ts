import { createChannel, getChannels, updateChannel, deleteChannel } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }
    
    const channels = await getChannels(workspaceId);
    return NextResponse.json(channels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { workspaceId, name } = await request.json();
    if (!workspaceId || !name) {
      return NextResponse.json({ error: 'Workspace ID and name are required' }, { status: 400 });
    }
    
    const channel = await createChannel(workspaceId, name);
    return NextResponse.json(channel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }
    
    const channel = await updateChannel(id, name);
    return NextResponse.json(channel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await deleteChannel(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
} 