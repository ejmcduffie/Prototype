import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const fileCategory = searchParams.get('fileCategory') || '';
    const sortBy = searchParams.get('sortBy') || 'uploadDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { userId: new ObjectId(userId) };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add file category filter if provided
    if (fileCategory) {
      query.fileCategory = fileCategory;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { fileType: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Connect to database
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Get files collection
    const filesCollection = db.collection('fileUploads');
    
    // Get total count for pagination
    const total = await filesCollection.countDocuments(query);
    
    // Fetch files with pagination, filtering, and sorting
    const files = await filesCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Format the response
    const result = {
      files,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      },
      filters: {
        status,
        fileCategory,
        search
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
