import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Health check endpoint called');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'School Management API is running'
    })
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 })
  }
}
