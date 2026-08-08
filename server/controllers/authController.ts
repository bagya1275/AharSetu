import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { memoryDb, isMongoConnected } from '../config/db.js';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/authMiddleware.js';

// Helper to generate JWT token
const generateToken = (id: string, email: string, role: string, name: string) => {
  return jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 numeric digits' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check existing user in MongoDB or Memory
    let existingUser = null;
    if (isMongoConnected()) {
      try {
        existingUser = await (User as any).findOne({ email: lowerEmail });
      } catch {
        existingUser = memoryDb.users.get(lowerEmail);
      }
    } else {
      existingUser = memoryDb.users.get(lowerEmail);
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newUserObj = {
      _id: userId,
      id: userId,
      name,
      email: lowerEmail,
      password: hashedPassword,
      role: 'UNASSIGNED', // Mandatory default as per requirement
      phone: phone || '',
      address: address || '',
      verificationStatus: true,
      createdAt: new Date()
    };

    // Save to Mongoose if available, or Memory
    let savedInMongo = false;
    if (isMongoConnected()) {
      try {
        const dbUser = new User(newUserObj);
        await dbUser.save();
        savedInMongo = true;
      } catch {
        // Fallback
      }
    }
    if (!savedInMongo) {
      memoryDb.users.set(lowerEmail, newUserObj);
    }

    const token = generateToken(userId, lowerEmail, 'UNASSIGNED', name);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please select your role.',
      token,
      user: {
        id: userId,
        name,
        email: lowerEmail,
        role: 'UNASSIGNED',
        phone: newUserObj.phone,
        address: newUserObj.address
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server registration error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const lowerEmail = email.toLowerCase().trim();
    let user: any = null;

    if (isMongoConnected()) {
      try {
        user = await (User as any).findOne({ email: lowerEmail });
      } catch {
        user = memoryDb.users.get(lowerEmail);
      }
    } else {
      user = memoryDb.users.get(lowerEmail);
    }

    if (!user) {
      user = memoryDb.users.get(lowerEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId, user.email, user.role, user.name);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        shelterLocation: user.shelterLocation || ''
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server login error', error: error.message });
  }
};

export const setRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, shelterLocation } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validRoles = ['DONOR', 'NGO', 'VOLUNTEER', 'REQUESTER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` 
      });
    }

    if (role === 'ADMIN' && req.user?.email?.toLowerCase().trim() !== 'bagya1725@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin portal access is strictly restricted to bagya1725@gmail.com'
      });
    }

    let updatedUser: any = null;

    if (isMongoConnected()) {
      try {
        updatedUser = await (User as any).findByIdAndUpdate(
          userId,
          { role, shelterLocation: shelterLocation || '' },
          { new: true }
        );
      } catch {
        // Memory fallback
      }
    }

    if (!updatedUser) {
      for (const [email, u] of memoryDb.users.entries()) {
        if (u.id === userId || u._id === userId) {
          u.role = role;
          if (shelterLocation) u.shelterLocation = shelterLocation;
          updatedUser = u;
          memoryDb.users.set(email, u);
          break;
        }
      }
    }

    const userEmail = req.user?.email || updatedUser?.email || '';
    const userName = req.user?.name || updatedUser?.name || '';
    const token = generateToken(userId, userEmail, role, userName);

    return res.json({
      success: true,
      message: `Role successfully updated to ${role}`,
      token,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: role,
        shelterLocation: shelterLocation || updatedUser?.shelterLocation || ''
      }
    });
  } catch (error: any) {
    console.error('Set role error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    let user: any = null;

    if (isMongoConnected()) {
      try {
        user = await (User as any).findById(userId);
      } catch {
        // Fallthrough
      }
    }

    if (!user) {
      for (const u of memoryDb.users.values()) {
        if (u.id === userId || u._id === userId) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(444).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        shelterLocation: user.shelterLocation || ''
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

