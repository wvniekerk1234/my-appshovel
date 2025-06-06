import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// GET all projects
export async function GET() {
  try {
    const projects = await redis.get('shovel-projects') || '[]';
    return NextResponse.json(JSON.parse(projects));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST to save projects
export async function POST(request: NextRequest) {
  try {
    const projects = await request.json();
    await redis.set('shovel-projects', JSON.stringify(projects));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving projects:', error);
    return NextResponse.json({ error: 'Failed to save projects' }, { status: 500 });
  }
}
