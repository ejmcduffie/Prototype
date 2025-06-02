import mongoose, { Schema, Document, Model, UpdateQuery } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  image?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAccountLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

interface IUserModel extends Model<IUser> {
  // Static methods
  findByEmail(email: string): Promise<IUser | null>;
}

const UserSchema: Schema = new Schema<IUser, IUserModel>(
  {
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
    },
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be longer than 100 characters']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long']
    },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'moderator'],
      default: 'user' 
    },
    image: { 
      type: String,
      default: ''
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    lastLogin: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      }
    }
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

// Check if account is locked
UserSchema.methods.isAccountLocked = function(): boolean {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates: UpdateQuery<IUser> = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    (updates as any).$set = { lockUntil: new Date(Date.now() + 60 * 60 * 1000) }; // Lock for 1 hour
  }
  
  return this.updateOne(updates);
};

// Static method to find by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password = this.get('password') as string;
    this.set('password', await bcrypt.hash(password, salt));
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Export the model
const User = mongoose.models.User as IUserModel || 
  mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
