import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getFileById } from '@/models/FileUpload';

interface Params {
  params: {
    fileId: string;
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { fileId } = params;
    const userId = session.user.id;
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    // Get the file from the database
    const file = await getFileById(fileId);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Verify file ownership
    if (file.userId.toString() !== userId) {
      return NextResponse.json({ error: 'You do not own this file' }, { status: 403 });
    }
    
    // Check if file has been minted
    if (file.status !== 'NFT_Minted' || !file.nftDetails) {
      return NextResponse.json({ 
        error: 'This file has not been minted as an NFT',
        status: file.status
      }, { status: 400 });
    }
    
    // Return NFT details
    return NextResponse.json({
      success: true,
      nftDetails: file.nftDetails,
      file: {
        id: file._id,
        originalName: file.originalName,
        fileType: file.fileType,
        fileCategory: file.fileCategory,
        uploadDate: file.uploadDate,
        status: file.status,
        verificationHash: file.verificationHash
      }
    });
    
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return NextResponse.json({ error: 'Failed to fetch NFT details' }, { status: 500 });
  }
}
