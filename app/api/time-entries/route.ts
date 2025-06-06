import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET all time entries
export async function GET() {
  try {
    const timeEntries = await redis.get('shovel-time-entries') || '[]';
    return NextResponse.json(JSON.parse(timeEntries));
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}

// POST to save time entries
export async function POST(request: NextRequest) {
  try {
    const timeEntries = await request.json();
    await redis.set('shovel-time-entries', JSON.stringify(timeEntries));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving time entries:', error);
    return NextResponse.json({ error: 'Failed to save time entries' }, { status: 500 });
  }
}
