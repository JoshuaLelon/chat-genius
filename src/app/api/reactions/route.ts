import { addReaction, removeReaction, getReactions } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }
    
    const reactions = await getReactions(messageId);
    return NextResponse.json(reactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { messageId, emoji } = await request.json();
    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji are required' }, { status: 400 });
    }
    
    const reaction = await addReaction(messageId, emoji);
    return NextResponse.json(reaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { messageId, emoji } = await request.json();
    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji are required' }, { status: 400 });
    }
    
    await removeReaction(messageId, emoji);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
} 