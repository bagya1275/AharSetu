import express from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { db } from './src/server/db.js';
import { Donation, User, UserRole } from './src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aharsetu-super-secret-jwt-key-2026';
const SYSTEM_ADMIN_EMAIL = 'bagya1275@gmail.com';

// Initialize mock/logged nodemailer transport
const mailTransporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'aharsetu_system@ethereal.email',
    pass: 'secret_email_pass'
  }
});

async function sendDeliveryNotificationEmail(donorEmail: string, donationTitle: string, recipientCount: number) {
  try {
    const info = await mailTransporter.sendMail({
      from: '"AharSetu Redistribution Network" <notifications@aharsetu.org>',
      to: donorEmail,
      subject: `🎉 Mission Accomplished: Your donation "${donationTitle}" was delivered!`,
      text: `Hello,\n\nYour generous food donation "${donationTitle}" has been successfully delivered and distributed to ${recipientCount} recipients today!\n\nThank you for ensuring zero food waste.\n\nWarm regards,\nTeam AharSetu`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #F9FBFA;">
        <h2 style="color: #16A34A;">AharSetu Delivery Confirmation</h2>
        <p>Your generous surplus food donation <strong>"${donationTitle}"</strong> has been successfully picked up, transported, and distributed to <strong>${recipientCount}</strong> souls today!</p>
        <p style="margin-top: 15px;">Your tax 80G impact certificate is now available for download in your donor dashboard.</p>
        <hr style="border: none; border-top: 1px solid #E8EEEA;" />
        <p style="font-size: 12px; color: #6B7280;">AharSetu Zero Hunger Platform | 100% Non-Monetary Food Redistribution</p>
      </div>`
    }).catch(err => {
      console.log('Nodemailer simulated email sent for:', donorEmail, donationTitle);
    });
  } catch (err) {
    console.log('Email delivery notification logged for:', donorEmail);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Helper Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = db.getUserById(decoded.id) || null;
    } catch (err) {
      req.user = null;
    }
    next();
  };

  app.use(authenticateToken);

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AharSetu Express API operational', timestamp: new Date().toISOString() });
  });

  // Auth: Register (Role defaults to UNASSIGNED if not provided)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role, phone, organization, address } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const isSystemAdmin = cleanEmail === SYSTEM_ADMIN_EMAIL;

      if (role === 'admin' && !isSystemAdmin) {
        return res.status(403).json({ error: 'Admin registration is restricted exclusively to authorized administrators.' });
      }

      const existing = db.getUserByEmail(cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'Account with this email already exists.' });
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('defaultpass123', 10);
      const assignedRole: UserRole = isSystemAdmin ? 'admin' : (role && role !== 'admin' ? role : 'unassigned');

      const newUser: User = {
        id: 'usr_' + Date.now(),
        name: isSystemAdmin ? 'System Administrator' : name,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: phone || (isSystemAdmin ? '+91 99999 00000' : '+91 98000 00000'),
        organization: organization || (isSystemAdmin ? 'AharSetu Central Administration' : name),
        address: address || 'New Delhi, India',
        verified: true,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        rating: 5.0,
        badges: isSystemAdmin ? ['system_admin'] : ['new_member'],
        impactScore: 0,
        createdAt: new Date().toISOString(),
      };

      db.createUser(newUser);

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Registration successful',
        token,
        user: newUser
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Registration failed', details: err.message });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const isSystemAdmin = cleanEmail === SYSTEM_ADMIN_EMAIL;

      let user = db.getUserByEmail(cleanEmail);
      
      // Dynamic user creation if user logs in first time
      if (!user) {
        const hashedPassword = await bcrypt.hash(password || 'default123', 10);
        const rawName = cleanEmail.split('@')[0];
        const formattedName = rawName ? (rawName.charAt(0).toUpperCase() + rawName.slice(1)) : 'User';
        user = {
          id: 'usr_' + Date.now(),
          name: isSystemAdmin ? 'System Administrator' : formattedName,
          email: cleanEmail,
          password: hashedPassword,
          role: isSystemAdmin ? 'admin' : 'unassigned', // System admin email automatically receives admin role
          phone: isSystemAdmin ? '+91 99999 00000' : '+91 98765 00000',
          organization: isSystemAdmin ? 'AharSetu Central Administration' : formattedName,
          address: 'Delhi NCR, India',
          verified: true,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          rating: 5.0,
          badges: isSystemAdmin ? ['system_admin'] : ['new_member'],
          impactScore: 0,
          createdAt: new Date().toISOString()
        };
        db.createUser(user);
      } else if (isSystemAdmin && user.role !== 'admin') {
        user = db.updateUser(user.id, { role: 'admin' }) || user;
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Login successful',
        token,
        user
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  });

  // Auth: Reset / Forgot Password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = db.getUserByEmail(cleanEmail);

      if (!user) {
        return res.status(404).json({ error: 'No account found with this email address. Please check your email or register.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = db.updateUser(user.id, { password: hashedPassword });

      res.json({ message: 'Password updated successfully! You can now log in with your new password.', user: updatedUser });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to reset password', details: err.message });
    }
  });

  // Auth: Post-Login Role Selection Route (PUT /api/auth/set-role)
  app.put('/api/auth/set-role', (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const { role } = req.body;
    if (!role || !['donor', 'ngo', 'requester', 'volunteer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (donor, ngo, requester, volunteer) is required' });
    }

    if (role === 'admin' && req.user.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin role is restricted strictly to authorized administrators.' });
    }

    const updatedUser = db.setUserRole(req.user.id, role);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: `Role set to ${role} successfully`,
      token,
      user: updatedUser
    });
  });

  // Auth: Get Current Profile
  app.get('/api/auth/me', (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    res.json({ user: req.user });
  });

  // Auth: Update Profile
  app.put('/api/auth/profile', (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const updated = db.updateUser(req.user.id, req.body);
    res.json({ user: updated });
  });

  // Donations: Get All / Filter
  app.get('/api/donations', (req, res) => {
    const { status, foodType, dietaryType, donorId, ngoId, volunteerId, search } = req.query;
    let list = db.getDonations();

    if (status) {
      list = list.filter(d => d.status === status);
    }
    if (foodType) {
      list = list.filter(d => d.foodType === foodType);
    }
    if (dietaryType) {
      list = list.filter(d => d.dietaryType === dietaryType);
    }
    if (donorId) {
      list = list.filter(d => d.donorId === donorId);
    }
    if (ngoId) {
      list = list.filter(d => d.ngoId === ngoId);
    }
    if (volunteerId) {
      list = list.filter(d => d.volunteerId === volunteerId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.description.toLowerCase().includes(q) || 
        d.address.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q)
      );
    }

    res.json({ donations: list });
  });

  // Donations: Get Single
  app.get('/api/donations/:id', (req, res) => {
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    res.json({ donation });
  });

  // Donations: Post New Donation
  app.post('/api/donations', (req: any, res) => {
    const user = req.user;
    const body = req.body;

    if (!body.title || !body.quantityServings) {
      return res.status(400).json({ error: 'Title and servings quantity are required' });
    }

    const expiryHours = Number(body.expiryHours) || 6;
    const now = new Date();
    const expiryTimestamp = new Date(now.getTime() + expiryHours * 3600 * 1000).toISOString();

    const newDonation: Donation = {
      id: 'don_' + Date.now(),
      donorId: user ? user.id : 'usr_anon',
      donorName: user ? user.name : (body.donorName || 'Surplus Food Donor'),
      donorPhone: user ? user.phone : (body.donorPhone || '+91 98000 00000'),
      donorOrg: user ? user.organization : (body.donorOrg || 'Food Outlet'),
      title: body.title,
      description: body.description || '',
      foodType: body.foodType || 'cooked_meal',
      dietaryType: body.dietaryType || 'veg',
      quantityServings: Number(body.quantityServings),
      quantityWeightKg: Number(body.quantityWeightKg) || Math.round(Number(body.quantityServings) * 0.35),
      cookedTime: body.cookedTime || now.toISOString(),
      expiryHours,
      expiryTimestamp,
      images: body.images && body.images.length ? body.images : ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600'],
      address: body.address || 'Central Delhi, New Delhi',
      status: body.isDraft ? 'draft' : 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.createDonation(newDonation);

    res.status(201).json({
      message: body.isDraft ? 'Draft saved successfully' : 'Surplus food donation posted!',
      donation: newDonation
    });
  });

  // Food Requesters / NGO Accept Donation
  app.post('/api/donations/:id/accept', (req: any, res) => {
    const user = req.user;
    const donation = db.getDonationById(req.params.id);
    const { pickupMethod, pickupNotes, ngoName } = req.body || {};

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updated = db.updateDonation(donation.id, {
      status: 'accepted',
      ngoId: user ? user.id : 'usr_ngo',
      ngoName: ngoName || (user ? (user.organization || user.name) : 'Verified Beneficiary / NGO'),
      ngoPhone: user ? user.phone : '+91 98000 11111',
      pickupMethod: pickupMethod || 'volunteer',
      pickupNotes: pickupNotes || ''
    });

    // Notify Donor
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: donation.donorId,
      title: 'Donation Claimed!',
      message: `${updated?.ngoName} claimed your food donation "${donation.title}". Pickup Method: ${pickupMethod === 'self_pickup' ? 'Self Pickup' : 'Volunteer Courier'}.`,
      type: 'success',
      read: false,
      link: `/donations/${donation.id}`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Donation claimed successfully', donation: updated });
  });

  // Food Needs Requests Store (In-Memory)
  const foodRequestsList: any[] = [
    {
      id: 'req_101',
      requesterId: 'usr_req1',
      requesterName: 'Anand Dham Orphanage',
      organizationName: 'Anand Dham Trust',
      phone: '+91 98111 22334',
      address: 'Lajpat Nagar IV, New Delhi',
      title: 'Need 40 Servings Cooked Meal for Evening Dinner',
      servingsNeeded: 40,
      dietaryPreference: 'veg',
      urgency: 'high',
      status: 'open',
      notes: 'Prefer fresh rice & dal or sabzi rotis before 7:00 PM.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];

  app.get('/api/food-requests', (req, res) => {
    res.json({ requests: foodRequestsList });
  });

  app.post('/api/food-requests', (req: any, res) => {
    const user = req.user;
    const body = req.body;

    if (!body.title || !body.servingsNeeded) {
      return res.status(400).json({ error: 'Title and servings needed are required' });
    }

    const newReq = {
      id: 'req_' + Date.now(),
      requesterId: user ? user.id : 'usr_req_anon',
      requesterName: user ? user.name : 'Food Requester',
      organizationName: body.organizationName || (user ? user.organization : 'Community Shelter'),
      phone: user ? user.phone : '+91 98000 00000',
      address: body.address || 'Delhi NCR',
      title: body.title,
      servingsNeeded: Number(body.servingsNeeded),
      dietaryPreference: body.dietaryPreference || 'veg',
      urgency: body.urgency || 'normal',
      status: 'open',
      notes: body.notes || '',
      createdAt: new Date().toISOString()
    };

    foodRequestsList.unshift(newReq);
    res.status(201).json({ message: 'Food request posted successfully', request: newReq });
  });

  // Assign Volunteer
  app.post('/api/donations/:id/assign-volunteer', (req: any, res) => {
    const { volunteerId, volunteerName, volunteerPhone } = req.body;
    const donation = db.getDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const vId = volunteerId || (req.user ? req.user.id : 'usr_volunteer');
    const vName = volunteerName || (req.user ? req.user.name : 'Express Volunteer');
    const vPhone = volunteerPhone || '+91 97000 22222';

    const updated = db.updateDonation(donation.id, {
      status: 'assigned',
      volunteerId: vId,
      volunteerName: vName,
      volunteerPhone: vPhone
    });

    // Notify Volunteer
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: vId,
      title: 'Pickup Task Assigned',
      message: `You have been assigned to pick up food from ${donation.donorName}`,
      type: 'warning',
      read: false,
      link: `/volunteer/dashboard`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Volunteer assigned successfully', donation: updated });
  });

  // Volunteer Pickup Proof
  app.post('/api/donations/:id/pickup', (req: any, res) => {
    const { proofImage, pickupNotes } = req.body;
    const donation = db.getDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updated = db.updateDonation(donation.id, {
      status: 'picked_up',
      pickupProof: proofImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
      pickupNotes: pickupNotes || 'Picked up in pristine condition.',
      pickupTimestamp: new Date().toISOString()
    });

    res.json({ message: 'Food pickup marked complete', donation: updated });
  });

  // Volunteer Delivery Confirmation & Email Trigger
  app.post('/api/donations/:id/deliver', async (req: any, res) => {
    const { deliveryProof, deliveryNotes, recipientCount } = req.body;
    const donation = db.getDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updated = db.updateDonation(donation.id, {
      status: 'delivered',
      deliveryProof: deliveryProof || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=300',
      deliveryNotes: deliveryNotes || 'Food successfully delivered and distributed to families.',
      recipientCount: Number(recipientCount) || donation.quantityServings,
      deliveryTimestamp: new Date().toISOString()
    });

    // Trigger Nodemailer / Email notification to donor
    const donor = db.getUserById(donation.donorId);
    if (donor && donor.email) {
      sendDeliveryNotificationEmail(donor.email, donation.title, updated?.recipientCount || donation.quantityServings);
    }

    // Notify Donor in-app
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: donation.donorId,
      title: '🎉 Mission Complete! Food Delivered',
      message: `Your donation "${donation.title}" fed ${updated?.recipientCount || donation.quantityServings} people today!`,
      type: 'success',
      read: false,
      link: `/donations/${donation.id}`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Food delivery confirmed and completed!', donation: updated });
  });

  // PDF Receipt Download Route (using PDFKit)
  app.get('/api/donations/:id/receipt', (req, res) => {
    const donation = db.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation record not found' });
    }

    try {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="AharSetu_Receipt_${donation.id}.pdf"`);

      doc.pipe(res);

      // Header
      doc.fillColor('#16A34A').fontSize(24).text('AharSetu Food Rescue Network', { align: 'center' });
      doc.fillColor('#6B7280').fontSize(10).text('100% Non-Monetary Surplus Food Redistribution', { align: 'center' });
      doc.moveDown();

      doc.strokeColor('#E8EEEA').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Title
      doc.fillColor('#111827').fontSize(16).text('OFFICIAL DONATION IMPACT RECEIPT (80G CERTIFICATE)', { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(11).fillColor('#374151');
      doc.text(`Receipt Reference ID: ${donation.id}`);
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`);
      doc.text(`Donation Status: ${donation.status.toUpperCase()}`);
      doc.moveDown();

      // Donor & Item Details
      doc.fillColor('#16A34A').fontSize(13).text('Donor Details:');
      doc.fillColor('#374151').fontSize(11);
      doc.text(`Donor Name: ${donation.donorName}`);
      doc.text(`Organization: ${donation.donorOrg || 'Individual Partner'}`);
      doc.text(`Contact: ${donation.donorPhone}`);
      doc.moveDown();

      doc.fillColor('#16A34A').fontSize(13).text('Food Rescue Details:');
      doc.fillColor('#374151').fontSize(11);
      doc.text(`Item Title: ${donation.title}`);
      doc.text(`Food Category: ${donation.foodType.toUpperCase()} (${donation.dietaryType.toUpperCase()})`);
      doc.text(`Quantity Servings: ${donation.quantityServings} Portions (${donation.quantityWeightKg || 'N/A'} kg)`);
      doc.text(`Pickup Address: ${donation.address}`);
      doc.moveDown();

      if (donation.ngoName) {
        doc.fillColor('#16A34A').fontSize(13).text('Recipient NGO / Shelter:');
        doc.fillColor('#374151').fontSize(11);
        doc.text(`Claimed By: ${donation.ngoName}`);
        doc.text(`Beneficiaries Fed: ${donation.recipientCount || donation.quantityServings} Individuals`);
        doc.moveDown();
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#9CA3AF').text('This digital document certifies non-monetary food donation under Section 80G tax exemptions.', { align: 'center' });
      doc.text('Thank you for helping eliminate hunger across India.', { align: 'center' });

      doc.end();
    } catch (err: any) {
      console.error('PDF Receipt Generation Error:', err);
      res.status(500).json({ error: 'Failed to generate PDF receipt', details: err.message });
    }
  });

  // Notifications
  app.get('/api/notifications', (req: any, res) => {
    if (!req.user) {
      return res.json({ notifications: [] });
    }
    const notifs = db.getNotificationsForUser(req.user.id);
    res.json({ notifications: notifs });
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  // Leaderboard & Analytics
  app.get('/api/leaderboard', (req, res) => {
    res.json({ leaderboard: db.getLeaderboard(), badges: db.getUsers() });
  });

  app.get('/api/analytics', (req, res) => {
    res.json({ analytics: db.getAnalytics() });
  });

  // Admin APIs (restricted to admin@aharsetu.org)
  app.get('/api/admin/users', (req: any, res) => {
    if (!req.user || req.user.role !== 'admin' || req.user.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied. System administrator privileges required.' });
    }
    res.json({ users: db.getUsers() });
  });

  app.post('/api/admin/verify-user', (req: any, res) => {
    if (!req.user || req.user.role !== 'admin' || req.user.email.trim().toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied. System administrator privileges required.' });
    }
    const { userId, verified } = req.body;
    const updated = db.updateUser(userId, { verified });
    res.json({ user: updated });
  });

  // Vite Middleware or Static Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
