import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'UNASSIGNED' | 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN' | 'REQUESTER';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  verificationStatus: boolean;
  shelterLocation?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['UNASSIGNED', 'DONOR', 'NGO', 'VOLUNTEER', 'ADMIN', 'REQUESTER'], 
    default: 'UNASSIGNED' 
  },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  verificationStatus: { type: Boolean, default: false },
  shelterLocation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
