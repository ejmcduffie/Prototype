import mongoose, { Schema, Document } from 'mongoose';

export interface IAncestor extends Document {
  name: string;
  birthYear: string;
  deathYear?: string;
  location: string;
  gender: string;
  userId: mongoose.Types.ObjectId;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  verificationDate?: Date;
  blockchainTxHash?: string;
  slaveRecordMatch?: {
    recordId: string;
    matchConfidence: number;
    recordDetails: any;
  };
  parents: mongoose.Types.ObjectId[];
  children: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AncestorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    birthYear: { type: String, required: true },
    deathYear: { type: String },
    location: { type: String, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Unknown'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verificationStatus: { 
      type: String, 
      required: true, 
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending' 
    },
    verificationDate: { type: Date },
    blockchainTxHash: { type: String },
    slaveRecordMatch: {
      recordId: { type: String },
      matchConfidence: { type: Number },
      recordDetails: { type: Schema.Types.Mixed }
    },
    parents: [{ type: Schema.Types.ObjectId, ref: 'Ancestor' }],
    children: [{ type: Schema.Types.ObjectId, ref: 'Ancestor' }],
  },
  { timestamps: true }
);

export default mongoose.models.Ancestor || mongoose.model<IAncestor>('Ancestor', AncestorSchema);
