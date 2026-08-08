export type UserRole = 'UNASSIGNED' | 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN' | 'REQUESTER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  shelterLocation?: string;
}

export type DonationStatus = 'AVAILABLE' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
export type DeliveryMethod = 'SELF_PICKUP' | 'VOLUNTEER_DELIVERY';

export interface Donation {
  id: string;
  _id?: string;
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
    claimedAt: string;
  };
  deliveryMethod?: DeliveryMethod;
  assignedVolunteer?: {
    volunteerId: string;
    volunteerName: string;
    acceptedAt: string;
  };
  createdAt: string;
}

export interface InspectionTemplate {
  id: string;
  label: string;
  url: string;
}
