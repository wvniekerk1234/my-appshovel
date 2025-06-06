import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET all team members
export async function GET() {
  try {
    const teamMembers = await redis.get('shovel-team-members') || '[]';
    return NextResponse.json(JSON.parse(teamMembers));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST to save team members
export async function POST(request: NextRequest) {
  try {
    const teamMembers = await request.json();
    await redis.set('shovel-team-members', JSON.stringify(teamMembers));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving team members:', error);
    return NextResponse.json({ error: 'Failed to save team members' }, { status: 500 });
  }
}
