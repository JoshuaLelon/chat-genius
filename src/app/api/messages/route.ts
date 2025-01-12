import { createMessage, getMessages, updateMessage, deleteMessage } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const before = searchParams.get('before') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }
    
    const messages = await getMessages(channelId, limit, before);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { channelId, content } = await request.json();
    if (!channelId || !content) {
      return NextResponse.json({ error: 'Channel ID and content are required' }, { status: 400 });
    }
    
    const message = await createMessage(channelId, content);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, content } = await request.json();
    if (!id || !content) {
      return NextResponse.json({ error: 'ID and content are required' }, { status: 400 });
    }
    
    const message = await updateMessage(id, content);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await deleteMessage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
} 