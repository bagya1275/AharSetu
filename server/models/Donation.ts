import mongoose, { Schema, Document } from 'mongoose';

export type DonationStatus = 'AVAILABLE' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
export type DeliveryMethod = 'SELF_PICKUP' | 'VOLUNTEER_DELIVERY';

export interface IDonation extends Document {
  donorId: string;
  donorName: string;
  title: string;
  description: string;
  category: string;
  dietary: string;
  servings: number;
  weightKg: number;
  expiryHours: number;
  pickupAddress: string;
  photoUrl: string;
  status: DonationStatus;
  pickupProofUrl?: string;
  deliveryProofUrl?: string;
  requesterId?: string;
  requesterName?: string;
  destinationAddress?: string;
  recipientType?: 'NGO' | 'REQUESTER' | 'COMMUNITY';
  acceptedByNGO?: {
    ngoId: string;
    ngoName: string;
    claimedAt: Date;
  };
  deliveryMethod?: DeliveryMethod;
  assignedVolunteer?: {
    volunteerId: string;
    volunteerName: string;
    acceptedAt: Date;
  };
  createdAt: Date;
}

const DonationSchema: Schema = new Schema({
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dietary: { type: String, required: true },
  servings: { type: Number, required: true, min: 1 },
  weightKg: { type: Number, required: true, min: 0 },
  expiryHours: { type: Number, required: true, min: 1 },
  pickupAddress: { type: String, required: true },
  photoUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'], 
    default: 'AVAILABLE' 
  },
  pickupProofUrl: { type: String, default: '' },
  deliveryProofUrl: { type: String, default: '' },
  requesterId: { type: String },
  requesterName: { type: String },
  destinationAddress: { type: String },
  recipientType: { type: String, enum: ['NGO', 'REQUESTER', 'COMMUNITY'], default: 'NGO' },
  acceptedByNGO: {
    ngoId: String,
    ngoName: String,
    claimedAt: Date
  },
  deliveryMethod: {
    type: String,
    enum: ['SELF_PICKUP', 'VOLUNTEER_DELIVERY']
  },
  assignedVolunteer: {
    volunteerId: String,
    volunteerName: String,
    acceptedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

export const Donation = mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
