// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    let dbStatus = 'disconnected';
    let dbOk = false;
    let errorMessage = '';

    try {
      // Test database connection by making a simple query
      const { data, error } = await supabase
        .from('_tables')
        .select('*')
        .limit(1);

      if (error) {
        dbStatus = `error: ${error.message}`;
        errorMessage = error.message;
        console.error('Supabase error:', error);
      } else {
        dbOk = true;
        dbStatus = 'connected';
      }
    } catch (error: any) {
      errorMessage = `Connection error: ${error.message}`;
      console.error('Connection error:', error);
      dbStatus = `connection failed: ${error.message}`;
    }

    const responseData = {
      status: dbOk ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        version: process.env.npm_package_version || '1.0.0'
      },
      ...(errorMessage ? { error: errorMessage } : {})
    };

    return NextResponse.json(responseData, { 
      status: dbOk ? 200 : 503 
    });

  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}