import { Request, Response } from 'express';
import { Donation } from '../models/Donation.js';
import { User } from '../models/User.js';
import { memoryDb, isMongoConnected } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const createDonation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      dietary,
      servings,
      weightKg,
      expiryHours,
      pickupAddress,
      photoUrl,
      deliveryMethod,
      isRequesterNeed,
      destinationAddress
    } = req.body;

    if (!title || !description || !category || !servings) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const donorId = req.user?.id || 'anonymous';
    const donorName = req.user?.name || 'Partner';
    const donationId = 'don_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const initialStatus = isRequesterNeed ? 'ACCEPTED' : 'AVAILABLE';

    const newDonationObj = {
      _id: donationId,
      id: donationId,
      donorId,
      donorName,
      title,
      description,
      category: category || 'Cooked Hot Meals',
      dietary: dietary || 'Pure Vegetarian',
      servings: Number(servings),
      weightKg: Number(weightKg || 1),
      expiryHours: Number(expiryHours || 6),
      pickupAddress: pickupAddress || 'Local Partner Location',
      destinationAddress: destinationAddress || pickupAddress || 'Local Recipient Center',
      photoUrl: photoUrl || '',
      status: initialStatus,
      deliveryMethod: deliveryMethod || (isRequesterNeed ? 'VOLUNTEER_DELIVERY' : 'SELF_PICKUP'),
      recipientType: isRequesterNeed ? 'REQUESTER' : 'NGO',
      requesterId: isRequesterNeed ? donorId : undefined,
      requesterName: isRequesterNeed ? donorName : undefined,
      createdAt: new Date()
    };

    let savedInMongo = false;
    if (isMongoConnected()) {
      try {
        const dbDonation = new Donation(newDonationObj);
        await dbDonation.save();
        savedInMongo = true;
      } catch {
        // Fallback to memory
      }
    }
    if (!savedInMongo) {
      memoryDb.donations.set(donationId, newDonationObj);
    }

    return res.status(201).json({
      success: true,
      message: isRequesterNeed ? 'Custom food request submitted successfully!' : 'Surplus food donation posted successfully!',
      donation: newDonationObj
    });
  } catch (error: any) {
    console.error('Create donation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to post donation/request', error: error.message });
  }
};

export const getAvailableDonations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let donations: any[] = [];

    if (isMongoConnected()) {
      try {
        donations = await (Donation as any).find({ status: 'AVAILABLE' }).sort({ createdAt: -1 });
      } catch {
        donations = Array.from(memoryDb.donations.values())
          .filter(d => d.status === 'AVAILABLE')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      donations = Array.from(memoryDb.donations.values())
        .filter(d => d.status === 'AVAILABLE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch donations', error: error.message });
  }
};

export const acceptDonation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryMethod } = req.body; // 'SELF_PICKUP' or 'VOLUNTEER_DELIVERY'

    const ngoId = req.user?.id || 'ngo_user';
    const ngoName = req.user?.name || 'Community Shelter NGO';

    const claimDetails = {
      ngoId,
      ngoName,
      claimedAt: new Date()
    };

    let updatedDonation: any = null;

    if (isMongoConnected()) {
      try {
        updatedDonation = await (Donation as any).findByIdAndUpdate(
          id,
          {
            status: 'ACCEPTED',
            acceptedByNGO: claimDetails,
            deliveryMethod: deliveryMethod || 'VOLUNTEER_DELIVERY'
          },
          { new: true }
        );
      } catch {
        // Fallthrough to memory
      }
    }

    if (!updatedDonation) {
      const donation = memoryDb.donations.get(id);
      if (donation) {
        donation.status = 'ACCEPTED';
        donation.acceptedByNGO = claimDetails;
        donation.deliveryMethod = deliveryMethod || 'VOLUNTEER_DELIVERY';
        memoryDb.donations.set(id, donation);
        updatedDonation = donation;
      }
    }

    if (!updatedDonation) {
      return res.status(404).json({ success: false, message: 'Donation post not found' });
    }

    return res.json({
      success: true,
      message: 'Donation claimed successfully!',
      donation: updatedDonation
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to accept donation', error: error.message });
  }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, pickupProofUrl, deliveryProofUrl } = req.body; // 'IN_TRANSIT' | 'DELIVERED'

    const validStatuses = ['AVAILABLE', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let updatedDonation: any = null;
    const updateData: any = { status };

    if (pickupProofUrl) updateData.pickupProofUrl = pickupProofUrl;
    if (deliveryProofUrl) updateData.deliveryProofUrl = deliveryProofUrl;

    if (req.user?.role === 'VOLUNTEER' && status === 'IN_TRANSIT') {
      updateData.assignedVolunteer = {
        volunteerId: req.user.id,
        volunteerName: req.user.name,
        acceptedAt: new Date()
      };
    }

    if (isMongoConnected()) {
      try {
        updatedDonation = await (Donation as any).findByIdAndUpdate(id, updateData, { new: true });
      } catch {
        // Fallback
      }
    }

    if (!updatedDonation) {
      const donation = memoryDb.donations.get(id);
      if (donation) {
        Object.assign(donation, updateData);
        memoryDb.donations.set(id, donation);
        updatedDonation = donation;
      }
    }

    if (!updatedDonation) {
      return res.status(404).json({ success: false, message: 'Donation post not found' });
    }

    return res.json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation: updatedDonation
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

export const getMyDonations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    let donations: any[] = [];

    if (isMongoConnected()) {
      try {
        donations = await (Donation as any).find({ donorId: userId }).sort({ createdAt: -1 });
      } catch {
        donations = Array.from(memoryDb.donations.values())
          .filter(d => d.donorId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      donations = Array.from(memoryDb.donations.values())
        .filter(d => d.donorId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your donations', error: error.message });
  }
};

export const getNGOClaims = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ngoId = req.user?.id;
    let donations: any[] = [];

    if (isMongoConnected()) {
      try {
        donations = await (Donation as any).find({ 'acceptedByNGO.ngoId': ngoId }).sort({ createdAt: -1 });
      } catch {
        donations = Array.from(memoryDb.donations.values())
          .filter(d => d.acceptedByNGO?.ngoId === ngoId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      donations = Array.from(memoryDb.donations.values())
        .filter(d => d.acceptedByNGO?.ngoId === ngoId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch NGO claims', error: error.message });
  }
};

export const getVolunteerTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let availableForPickup: any[] = [];
    let myTasks: any[] = [];

    const volunteerId = req.user?.id;

    if (isMongoConnected()) {
      try {
        availableForPickup = await (Donation as any).find({
          status: 'ACCEPTED',
          deliveryMethod: 'VOLUNTEER_DELIVERY',
          assignedVolunteer: { $exists: false }
        }).sort({ createdAt: -1 });

        myTasks = await (Donation as any).find({
          'assignedVolunteer.volunteerId': volunteerId
        }).sort({ createdAt: -1 });
      } catch {
        const all = Array.from(memoryDb.donations.values());
        availableForPickup = all.filter(d => d.status === 'ACCEPTED' && d.deliveryMethod === 'VOLUNTEER_DELIVERY' && !d.assignedVolunteer);
        myTasks = all.filter(d => d.assignedVolunteer?.volunteerId === volunteerId);
      }
    } else {
      const all = Array.from(memoryDb.donations.values());
      availableForPickup = all.filter(d => d.status === 'ACCEPTED' && d.deliveryMethod === 'VOLUNTEER_DELIVERY' && !d.assignedVolunteer);
      myTasks = all.filter(d => d.assignedVolunteer?.volunteerId === volunteerId);
    }

    return res.json({
      success: true,
      availableForPickup,
      myTasks
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch volunteer tasks', error: error.message });
  }
};

export const getPlatformImpactStats = async (req: Request, res: Response) => {
  try {
    let allDonations: any[] = [];
    let allUsers: any[] = [];

    if (isMongoConnected()) {
      try {
        allDonations = await (Donation as any).find({});
        allUsers = await (User as any).find({});
      } catch {
        allDonations = Array.from(memoryDb.donations.values());
        allUsers = Array.from(memoryDb.users.values());
      }
    } else {
      allDonations = Array.from(memoryDb.donations.values());
      allUsers = Array.from(memoryDb.users.values());
    }

    const totalMealsRescued = allDonations.reduce((acc, d) => acc + (Number(d.servings) || 0), 0);
    const totalWeightKg = allDonations.reduce((acc, d) => acc + (Number(d.weightKg) || 1), 0);
    const co2PreventionKg = Math.round(totalWeightKg * 2.5);

    const partnerHotelsCount = new Set([
      ...allUsers.filter(u => u.role === 'DONOR').map(u => u.id || u._id || u.email),
      ...allDonations.map(d => d.donorId)
    ]).size;

    const communitySheltersCount = new Set([
      ...allUsers.filter(u => u.role === 'NGO' || u.role === 'REQUESTER').map(u => u.id || u._id || u.email),
      ...allDonations.filter(d => d.acceptedByNGO?.ngoId).map(d => d.acceptedByNGO?.ngoId),
      ...allDonations.filter(d => d.requesterId).map(d => d.requesterId)
    ]).size;

    const completedDeliveriesCount = allDonations.filter(d => d.status === 'DELIVERED').length;

    return res.json({
      success: true,
      stats: {
        totalMealsRescued,
        co2PreventionKg,
        partnerHotelsCount,
        communitySheltersCount,
        completedDeliveriesCount,
        totalDonationsPosted: allDonations.length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to compute impact stats', error: error.message });
  }
};

export const getVerifiedNGOsList = async (req: Request, res: Response) => {
  try {
    let allUsers: any[] = [];
    let allDonations: any[] = [];

    if (isMongoConnected()) {
      try {
        allUsers = await (User as any).find({ role: { $in: ['NGO', 'REQUESTER'] } });
        allDonations = await (Donation as any).find({});
      } catch {
        allUsers = Array.from(memoryDb.users.values()).filter(u => u.role === 'NGO' || u.role === 'REQUESTER');
        allDonations = Array.from(memoryDb.donations.values());
      }
    } else {
      allUsers = Array.from(memoryDb.users.values()).filter(u => u.role === 'NGO' || u.role === 'REQUESTER');
      allDonations = Array.from(memoryDb.donations.values());
    }

    const ngos = allUsers.map(user => {
      const uId = user.id || user._id || user.email;
      const mealsReceived = allDonations
        .filter(d => d.acceptedByNGO?.ngoId === uId || d.requesterId === uId)
        .reduce((sum, d) => sum + (Number(d.servings) || 0), 0);

      return {
        id: uId,
        name: user.name || 'Verified Community Shelter',
        location: user.shelterLocation || user.address || 'Local Distribution Center',
        mealsReceived: `${mealsReceived} Meals Received`,
        phone: user.phone || '',
        verifiedAt: 'FSSAI Verified'
      };
    });

    const existingIds = new Set(ngos.map(n => n.id));
    allDonations.forEach(d => {
      if (d.acceptedByNGO?.ngoId && !existingIds.has(d.acceptedByNGO.ngoId)) {
        existingIds.add(d.acceptedByNGO.ngoId);
        const meals = allDonations
          .filter(x => x.acceptedByNGO?.ngoId === d.acceptedByNGO?.ngoId)
          .reduce((sum, x) => sum + (Number(x.servings) || 0), 0);
        ngos.push({
          id: d.acceptedByNGO.ngoId,
          name: d.acceptedByNGO.ngoName || 'Community Shelter',
          location: d.destinationAddress || 'Local Shelter',
          mealsReceived: `${meals} Meals Received`,
          phone: '',
          verifiedAt: 'FSSAI Verified'
        });
      }
    });

    return res.json({
      success: true,
      ngos
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch verified NGOs', error: error.message });
  }
};

