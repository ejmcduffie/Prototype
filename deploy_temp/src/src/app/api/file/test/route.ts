import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbconnect';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const conn = await dbConnect();
    const isConnected = conn.connection.readyState === 1;
    
    return NextResponse.json({
      connected: isConnected,
      dbState: mongoose.STATES[conn.connection.readyState],
      host: conn.connection.host,
      port: conn.connection.port,
      database: conn.connection.name
    });
    
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
