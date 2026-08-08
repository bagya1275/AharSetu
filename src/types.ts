export type UserRole = 'unassigned' | 'donor' | 'ngo' | 'requester' | 'volunteer' | 'admin';

export type FoodType = 
  | 'cooked_meal' 
  | 'packaged_food' 
  | 'raw_ingredients' 
  | 'baked_goods' 
  | 'fruits_veggies' 
  | 'beverages';

export type DietaryType = 'veg' | 'non_veg' | 'vegan' | 'jain';

export type DonationStatus = 
  | 'draft' 
  | 'pending' 
  | 'accepted' 
  | 'assigned' 
  | 'picked_up' 
  | 'delivered' 
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone: string;
  organization?: string;
  address: string;
  verified: boolean;
  avatar?: string;
  rating?: number;
  badges: string[];
  impactScore: number;
  createdAt: string;
}

export interface FoodNeedRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  organizationName: string;
  phone: string;
  address: string;
  title: string;
  servingsNeeded: number;
  dietaryPreference: DietaryType;
  urgency: 'high' | 'medium' | 'normal';
  status: 'open' | 'fulfilled' | 'closed';
  notes?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorOrg?: string;
  title: string;
  description: string;
  foodType: FoodType;
  dietaryType: DietaryType;
  quantityServings: number;
  quantityWeightKg?: number;
  cookedTime: string; // ISO string
  expiryHours: number;
  expiryTimestamp: string; // ISO string
  images: string[];
  address: string;
  status: DonationStatus;
  
  // Claim / Pickup / Delivery Details
  ngoId?: string;
  ngoName?: string;
  ngoPhone?: string;
  
  pickupMethod?: 'self_pickup' | 'volunteer';
  
  volunteerId?: string;
  volunteerName?: string;
  volunteerPhone?: string;
  
  pickupNotes?: string;
  pickupProof?: string;
  pickupTimestamp?: string;
  
  deliveryNotes?: string;
  deliveryProof?: string;
  deliveryTimestamp?: string;
  
  recipientCount?: number;
  temperatureNote?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'donor' | 'volunteer' | 'ngo' | 'all';
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
  totalMealsDonated: number;
  totalDeliveries: number;
  impactScore: number;
  badgesCount: number;
}

export interface PlatformAnalytics {
  totalMealsServed: number;
  totalDonationsCompleted: number;
  totalActiveDonors: number;
  totalNgosVerified: number;
  totalVolunteersActive: number;
  co2SavedKg: number;
  foodSavedKg: number;
  activePendingDonations: number;
}
