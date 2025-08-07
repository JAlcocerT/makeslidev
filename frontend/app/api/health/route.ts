import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - could be extended with database connectivity, etc.
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      service: 'makeslidev-frontend'
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'makeslidev-frontend'
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}
