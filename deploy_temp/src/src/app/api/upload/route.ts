import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { saveFileToMongoDB, FileUploadData } from '@/models/FileUpload';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ensureUploadsDirectory } from '@/lib/uploadUtils';
import fs from 'fs';
import { dbConnect } from '@/lib/dbconnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
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

// Helper to generate a unique filename
const generateUniqueFilename = (originalFilename: string) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalFilename);
  const filename = `${timestamp}-${randomString}${extension}`;
  return filename;
};

// Helper to get folder path based on file type
const getUploadFolder = (fileType: string) => {
  const extension = fileType.toLowerCase();
  
  if (['.ged'].includes(extension)) return 'gedcom';
  if (['.pdf', '.txt', '.doc', '.docx'].includes(extension)) return 'documents';
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) return 'images';
  if (['.mp3', '.wav', '.ogg'].includes(extension)) return 'audio';
  if (['.mp4', '.mov', '.avi'].includes(extension)) return 'video';
  if (['.csv'].includes(extension)) return 'dna_data';
  return 'other';
};

// List of blocked dangerous file extensions
const BLOCKED_EXTENSIONS = [
  '.exe', '.msi', '.bat', '.cmd', '.sh', '.js', '.jse', '.vbs',
  '.ps1', '.psm1', '.psd1', '.jar', '.class', '.php', '.py',
  '.pl', '.rb', '.app', '.dmg', '.pkg', '.scr', '.hta', '.cpl'
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content type must be multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = session.user.id;
    const fileCategory = formData.get('fileCategory') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type for GEDCOM
    if (fileCategory === 'GEDCOM' && !file.name.toLowerCase().endsWith('.ged')) {
      return NextResponse.json({ error: 'Invalid file type. GEDCOM files must have .ged extension' }, { status: 400 });
    }

    const fileExt = path.extname(file.name).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: 'This file type is not allowed for security reasons' },
        { status: 403 }
      );
    }

    // Create a unique filename for storage
    const uniqueFilename = generateUniqueFilename(file.name);
    const fileType = path.extname(file.name).toLowerCase();
    const uploadFolder = getUploadFolder(fileType);
    
    // Ensure the upload folder exists and get its path
    const uploadsDir = await ensureUploadsDirectory(uploadFolder);
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Log directory contents for debugging
    console.log(`Upload directory: ${uploadsDir}`);
    if (fs.existsSync(uploadsDir)) {
      const dirContents = fs.readdirSync(uploadsDir);
      console.log(`Directory contents (${dirContents.length} files):`, dirContents.slice(0, 5));
    } else {
      console.log(`Warning: Upload directory does not exist`);
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // For GEDCOM files, read the content
    let fileContent: string | undefined;
    if (fileCategory === 'GEDCOM') {
      fileContent = buffer.toString('utf-8');
    }
    
    // Write file to disk if needed
    try {
      await writeFile(filePath, buffer);
      console.log(`File saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving file to disk:', error);
      return NextResponse.json({ error: 'Error saving file to disk' }, { status: 500 });
    }

    // Calculate file hash for verification
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Save file metadata to MongoDB
    const fileData: FileUploadData & { content?: string } = {
      filename: uniqueFilename,
      originalName: file.name,
      fileSize: file.size,
      fileType: fileType.substring(1), // Remove the dot
      uploadDate: new Date(),
      userId: new ObjectId(userId),
      path: filePath,
      status: 'Pending',
      fileCategory: fileCategory === 'All' ? uploadFolder : fileCategory,
      verificationHash: fileHash,
      ...(fileContent && { content: fileContent }) // Only include content for text-based files
    };

    console.log(`Uploading file with metadata:`, {
      id: userId,
      filename: uniqueFilename,
      originalName: file.name,
      path: filePath,
      category: fileCategory === 'All' ? uploadFolder : fileCategory
    });
    
    const result = await saveFileToMongoDB(fileData);

    return NextResponse.json({ 
      success: true, 
      fileId: result.insertedId.toString(),
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET handler to list files from the database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // For development, if userId is not provided or invalid, use a default ObjectId
    if (!userId) {
      userId = '000000000000000000000000'; // Valid ObjectId format (24 hex characters)
    }
    
    // Validate if the userId is a valid ObjectId format
    if (!ObjectId.isValid(userId)) {
      userId = '000000000000000000000000'; // Use default if invalid
    }

    const db = await getDatabase();
    
    // List all collections for debugging
    const collections = await db.listCollections().toArray();
    console.log(`Available collections in database:`, collections.map(c => c.name));
    
    const collection = db.collection('fileUploads'); // Using consistent collection name
    console.log(`Querying fileUploads collection for userId: ${userId}`);
    
    const files = await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ uploadDate: -1 })
      .toArray();
      
    console.log(`Found ${files.length} files for user ${userId}`);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error retrieving files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
