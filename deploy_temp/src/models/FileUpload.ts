import mongoose, { Document, Schema } from 'mongoose';
import { dbConnect } from '@/lib/dbconnect';

export interface IFileUpload extends Document {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileCategory: string;
  uploadDate: Date;
  status: 'Pending' | 'Processing' | 'Verified' | 'Failed' | 'NFT_Minted';
  verificationHash?: string;
  path: string;
  content?: string; // Store file content for text-based files like GEDCOM
  nftDetails?: {
    tokenId: string;
    contractAddress: string;
    transactionHash: string;
    tokenUri: string;
    mintDate: Date;
    blockchain: string;
    owner: string;
  };
}

const FileUploadSchema = new Schema<IFileUpload>({
  userId: { type: Schema.Types.ObjectId, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileCategory: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Verified', 'Failed', 'NFT_Minted'],
    default: 'Pending'
  },
  verificationHash: { type: String },
  path: { type: String, required: true },
  content: { type: String, select: false }, // Store file content for text-based files like GEDCOM
  nftDetails: {
    tokenId: String,
    contractAddress: String,
    transactionHash: String,
    tokenUri: String,
    mintDate: Date,
    blockchain: String,
    owner: String
  }
}, { timestamps: true });

// Create model or use existing with explicit collection name
const COLLECTION_NAME = 'fileUploads'; // Use consistent collection name
const FileUploadModel = mongoose.models.FileUpload || 
  mongoose.model<IFileUpload>('FileUpload', FileUploadSchema, COLLECTION_NAME);

console.log(`FileUploadModel initialized with collection: ${COLLECTION_NAME}`);

export const FileUpload = FileUploadModel;

export async function getFileById(id: string) {
  await dbConnect();
  try {
    console.log(`MongoDB connection state: ${mongoose.connection.readyState}`);
    
    // List available collections for debugging
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections:`, collections.map(c => c.name));
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid ObjectID format: ${id}`);
      return null;
    }
    
    // Try to find the file using the model first
    const file = await FileUploadModel.findById(id).exec();
    console.log(`File lookup result for ID ${id}:`, file ? 'Found' : 'Not found');
    
    return file;
  } catch (error) {
    console.error('Error finding file by ID:', error);
    return null;
  }
}

export async function updateFileStatus(fileId: string, status: IFileUpload['status'], updateData: Partial<IFileUpload> = {}) {
  await dbConnect();
  return FileUploadModel.updateOne(
    { _id: fileId },
    { $set: { status, ...updateData, updatedAt: new Date() } }
  );
}

export async function listUserFiles(userId: string) {
  await dbConnect();
  return FileUploadModel.find({ userId }).sort({ uploadDate: -1 });
}

// Define the interface for file upload data
export interface FileUploadData {
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  userId: mongoose.Types.ObjectId;
  path: string;
  status: 'Pending' | 'Processing' | 'Verified' | 'Failed' | 'NFT_Minted';
  fileCategory: string;
  verificationHash?: string;
  content?: string; // Add content field for text-based files
}

// Function to save file metadata to MongoDB
export async function saveFileToMongoDB(fileData: FileUploadData & { content?: string }) {
  try {
    await dbConnect();
    
    // Create a new file document
    const newFile = new FileUploadModel({
      filename: fileData.filename,
      originalName: fileData.originalName,
      fileSize: fileData.fileSize,
      fileType: fileData.fileType,
      uploadDate: fileData.uploadDate,
      userId: fileData.userId,
      path: fileData.path,
      status: fileData.status,
      fileCategory: fileData.fileCategory,
      verificationHash: fileData.verificationHash,
      // Only include content for GEDCOM files
      ...(fileData.fileType === 'ged' || fileData.fileCategory === 'GEDCOM' 
        ? { content: fileData.content }
        : {})
    });
    
    console.log(`Saving file to MongoDB collection: ${COLLECTION_NAME}`);
    console.log('File metadata:', {
      id: newFile._id,
      name: newFile.originalName,
      path: newFile.path,
      userId: newFile.userId,
      hasContent: !!(fileData.fileType === 'ged' || fileData.fileCategory === 'GEDCOM')
    });
    
    const result = await newFile.save();
    return { insertedId: result._id };
  } catch (error) {
    console.error('Error saving file metadata to MongoDB:', error);
    throw error;
  }
}
