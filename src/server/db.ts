import { User, Donation, Notification, LeaderboardEntry, PlatformAnalytics, Badge, UserRole } from '../types.js';

// Available Badges definition
export const availableBadges: Badge[] = [
  { id: 'zero_waste_hero', title: 'Zero Waste Hero', description: 'Donated over 500+ meals to community shelters.', icon: '🏆', category: 'donor' },
  { id: '100_meals_club', title: '100 Meals Pioneer', description: 'Provided 100+ fresh wholesome meals.', icon: '🍲', category: 'donor' },
  { id: '50_meals_club', title: '50 Meals Supporter', description: 'Reallocated 50+ meals to families in need.', icon: '🥗', category: 'donor' },
  { id: 'speedy_delivery', title: 'Speedy Express', description: 'Completed 10+ deliveries within 30 minutes of pickup.', icon: '⚡', category: 'volunteer' },
  { id: 'super_volunteer', title: 'Super Volunteer', description: 'Completed over 30 successful food rescue runs.', icon: '🛵', category: 'volunteer' },
  { id: 'verified_ngo', title: 'Verified Impact NGO', description: 'Officially verified by AharSetu admin team.', icon: '🛡️', category: 'ngo' },
  { id: 'community_champion', title: 'Community Champion', description: 'Distributed 1,000+ meals to children and elderly.', icon: '❤️', category: 'ngo' },
];

// Memory Store initialized with NO hardcoded demo data
class DatabaseStore {
  private users: User[] = [];
  private donations: Donation[] = [];
  private notifications: Notification[] = [];

  // User operations
  getUsers(): User[] { return this.users; }
  getUserById(id: string): User | undefined { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string): User | undefined { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  
  createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return undefined;
  }

  setUserRole(id: string, role: UserRole): User | undefined {
    return this.updateUser(id, { role });
  }

  // Donation operations
  getDonations(): Donation[] { return this.donations; }
  getDonationById(id: string): Donation | undefined { return this.donations.find(d => d.id === id); }
  
  createDonation(donation: Donation): Donation {
    this.donations.unshift(donation);
    
    // Add notification to all active NGOs
    const ngos = this.users.filter(u => u.role === 'ngo');
    ngos.forEach(ngo => {
      this.addNotification({
        id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
        userId: ngo.id,
        title: 'New Surplus Food Available!',
        message: `${donation.donorName} posted ${donation.quantityServings} servings of ${donation.title}`,
        type: 'info',
        read: false,
        link: `/donations/${donation.id}`,
        createdAt: new Date().toISOString()
      });
    });

    return donation;
  }

  updateDonation(id: string, updates: Partial<Donation>): Donation | undefined {
    const idx = this.donations.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.donations[idx] = { ...this.donations[idx], ...updates, updatedAt: new Date().toISOString() };
      return this.donations[idx];
    }
    return undefined;
  }

  // Notifications
  getNotificationsForUser(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notif: Notification): Notification {
    this.notifications.unshift(notif);
    return notif;
  }

  markNotificationRead(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
  }

  // Analytics & Leaderboard derived strictly from stored data
  getAnalytics(): PlatformAnalytics {
    const completed = this.donations.filter(d => d.status === 'delivered');
    const totalServings = completed.reduce((sum, d) => sum + d.quantityServings, 0);
    const totalKg = completed.reduce((sum, d) => sum + (d.quantityWeightKg || (d.quantityServings * 0.35)), 0);
    
    return {
      totalMealsServed: totalServings,
      totalDonationsCompleted: completed.length,
      totalActiveDonors: this.users.filter(u => u.role === 'donor').length,
      totalNgosVerified: this.users.filter(u => u.role === 'ngo' && u.verified).length,
      totalVolunteersActive: this.users.filter(u => u.role === 'volunteer').length,
      co2SavedKg: Math.round(totalKg * 2.5),
      foodSavedKg: Math.round(totalKg),
      activePendingDonations: this.donations.filter(d => d.status === 'pending' || d.status === 'accepted' || d.status === 'assigned').length
    };
  }

  getLeaderboard(): LeaderboardEntry[] {
    // Rank registered users based on actual completed activity
    const userStatsMap = new Map<string, { meals: number; deliveries: number; impact: number }>();

    this.donations.forEach(d => {
      if (d.status === 'delivered') {
        // Donor impact
        const donorStat = userStatsMap.get(d.donorId) || { meals: 0, deliveries: 0, impact: 0 };
        donorStat.meals += d.quantityServings;
        donorStat.impact += d.quantityServings * 10;
        userStatsMap.set(d.donorId, donorStat);

        // NGO / Shelter impact
        if (d.ngoId) {
          const ngoStat = userStatsMap.get(d.ngoId) || { meals: 0, deliveries: 0, impact: 0 };
          ngoStat.deliveries += 1;
          ngoStat.impact += d.quantityServings * 8;
          userStatsMap.set(d.ngoId, ngoStat);
        }

        // Volunteer impact
        if (d.volunteerId) {
          const volStat = userStatsMap.get(d.volunteerId) || { meals: 0, deliveries: 0, impact: 0 };
          volStat.deliveries += 1;
          volStat.impact += 100;
          userStatsMap.set(d.volunteerId, volStat);
        }
      }
    });

    const entries: LeaderboardEntry[] = this.users
      .filter(u => u.role !== 'unassigned')
      .map(u => {
        const stats = userStatsMap.get(u.id) || { meals: 0, deliveries: 0, impact: u.impactScore || 0 };
        return {
          rank: 0,
          id: u.id,
          name: u.name,
          role: u.role,
          organization: u.organization,
          avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
          totalMealsDonated: stats.meals,
          totalDeliveries: stats.deliveries,
          impactScore: stats.impact,
          badgesCount: u.badges ? u.badges.length : 0
        };
      })
      .sort((a, b) => b.impactScore - a.impactScore);

    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }
}

export const db = new DatabaseStore();
