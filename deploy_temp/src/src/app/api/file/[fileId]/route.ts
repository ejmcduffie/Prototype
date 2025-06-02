import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getFileById } from '@/models/FileUpload';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbconnect';
import { Session } from 'next-auth';

// Define session type with user ID
interface CustomSession extends Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  }
}

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  console.log('Fetching file with ID:', params.fileId);
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { fileId } = params;
    const userId = session.user.id;
    
    console.log('Authenticated user ID:', userId);
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    // Connect to the database
    await dbConnect();
    
    // Log database connection state
    console.log(`MongoDB connection state: ${mongoose.connection.readyState}`);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections:`, collections.map(c => c.name));
    
    // Get the file from the database using our enhanced getFileById function
    console.log(`Attempting to retrieve file with ID: ${fileId}`);
    const file = await getFileById(fileId);
    console.log('Found file:', file ? file._id : 'Not found');
    
    if (!file) {
      console.log('File not found in database');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Verify file ownership
    if (file.userId.toString() !== userId) {
      return NextResponse.json({ error: 'You do not own this file' }, { status: 403 });
    }
    
    // Return file details (with NFT details if available)
    return NextResponse.json({
      success: true,
      file: {
        id: file._id,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        fileCategory: file.fileCategory,
        uploadDate: file.uploadDate,
        status: file.status,
        verificationHash: file.verificationHash,
        path: file.path,
        nftDetails: file.nftDetails
      }
    });
    
  } catch (error) {
    console.error('Error fetching file details:', error);
    return NextResponse.json({ error: 'Failed to fetch file details' }, { status: 500 });
  }
}
