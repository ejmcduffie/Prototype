import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getFileById } from '@/models/FileUpload';
import { dbConnect } from '@/lib/dbconnect';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions) as any;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const userId = session.user.id;
    
    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '') {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }
    
    // Get the file from the database
    const file = await getFileById(fileId);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Verify file ownership
    if (file.userId.toString() !== userId.toString()) {
      return NextResponse.json({ error: 'You do not own this file' }, { status: 403 });
    }
    
    // Verify file path exists (use stored path directly)
    if (!fs.existsSync(file.path)) {
      console.error(`File not found at path: ${file.path}`);
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }
    
    // Get file stats for content length
    const stats = fs.statSync(file.path);
    const fileSize = stats.size;
    
    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(file.path);
    
    // Return file as download with proper headers
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize.toString(),
      }
    });
    
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}