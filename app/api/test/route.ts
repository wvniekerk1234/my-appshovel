import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Try to get a value
    const testValue = await redis.get('test-key') || 'No value found';
    
    // Try to set a value
    await redis.set('test-key', 'Connection working at ' + new Date().toISOString());
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis connection test', 
      value: testValue,
      env: {
        url_exists: !!process.env.UPSTASH_REDIS_REST_URL,
        token_exists: !!process.env.UPSTASH_REDIS_REST_TOKEN
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      env: {
        url_exists: !!process.env.UPSTASH_REDIS_REST_URL,
        token_exists: !!process.env.UPSTASH_REDIS_REST_TOKEN
      }
    }, { status: 500 });
  }
}
