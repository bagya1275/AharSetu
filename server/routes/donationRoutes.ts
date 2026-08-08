import { Router } from 'express';
import {
  createDonation,
  getAvailableDonations,
  acceptDonation,
  updateStatus,
  getMyDonations,
  getNGOClaims,
  getVolunteerTasks,
  getPlatformImpactStats,
  getVerifiedNGOsList
} from '../controllers/donationController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/impact-stats', getPlatformImpactStats);
router.get('/verified-ngos', getVerifiedNGOsList);

router.post('/', authenticateToken, requireRole(['DONOR', 'ADMIN']), createDonation);
router.get('/', authenticateToken, getAvailableDonations);
router.put('/:id/accept', authenticateToken, requireRole(['NGO', 'REQUESTER', 'ADMIN']), acceptDonation);
router.put('/:id/status', authenticateToken, updateStatus);
router.get('/my', authenticateToken, requireRole(['DONOR', 'ADMIN']), getMyDonations);
router.get('/ngo-claims', authenticateToken, requireRole(['NGO', 'REQUESTER', 'ADMIN']), getNGOClaims);
router.get('/volunteer-tasks', authenticateToken, requireRole(['VOLUNTEER', 'ADMIN']), getVolunteerTasks);

export default router;
