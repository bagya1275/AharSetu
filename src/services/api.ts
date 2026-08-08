import { User, Donation, UserRole, DeliveryMethod, DonationStatus } from '../types/index.js';

const getHeaders = () => {
  const token = localStorage.getItem('aharsetu_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async setRole(role: UserRole, shelterLocation?: string) {
    const res = await fetch('/api/auth/set-role', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role, shelterLocation })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders()
    });
    return res.json();
  },

  // Donations
  async createDonation(data: Partial<Donation>) {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAvailableDonations() {
    const res = await fetch('/api/donations', {
      headers: getHeaders()
    });
    return res.json();
  },

  async acceptDonation(id: string, deliveryMethod: DeliveryMethod) {
    const res = await fetch(`/api/donations/${id}/accept`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ deliveryMethod })
    });
    return res.json();
  },

  async updateStatus(id: string, status: DonationStatus, proofData?: { pickupProofUrl?: string; deliveryProofUrl?: string }) {
    const res = await fetch(`/api/donations/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, ...proofData })
    });
    return res.json();
  },

  async getMyDonations() {
    const res = await fetch('/api/donations/my', {
      headers: getHeaders()
    });
    return res.json();
  },

  async getNGOClaims() {
    const res = await fetch('/api/donations/ngo-claims', {
      headers: getHeaders()
    });
    return res.json();
  },

  async getVolunteerTasks() {
    const res = await fetch('/api/donations/volunteer-tasks', {
      headers: getHeaders()
    });
    return res.json();
  },

  async getImpactStats() {
    const res = await fetch('/api/donations/impact-stats');
    return res.json();
  },

  async getVerifiedNGOs() {
    const res = await fetch('/api/donations/verified-ngos');
    return res.json();
  }
};
