import { updateStatus, getUserStatus, getUserStatuses } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userIds = searchParams.get('userIds');
    
    if (userId) {
      const status = await getUserStatus(userId);
      return NextResponse.json(status);
    } else if (userIds) {
      const userIdArray = userIds.split(',');
      const statuses = await getUserStatuses(userIdArray);
      return NextResponse.json(statuses);
    }
    
    return NextResponse.json({ error: 'Either userId or userIds is required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { status, customStatus } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    const updatedStatus = await updateStatus(status, customStatus);
    return NextResponse.json(updatedStatus);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
} 