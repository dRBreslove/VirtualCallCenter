import express from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = req.user;

    // Only allow admins to change roles
    if (role && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can change roles' });
    }

    // Update user data
    const updatedUser = {
      ...user,
      name: name || user.name,
      email: email || user.email,
      role: role || user.role
    };

    // Generate new token with updated user data
    const token = jwt.sign(updatedUser, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can view all users' });
    }

    // In a real application, you would fetch users from a database
    // For now, we'll return a mock list of users
    const users = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      {
        id: 2,
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager'
      },
      {
        id: 3,
        name: 'Agent User',
        email: 'agent@example.com',
        role: 'agent'
      }
    ];

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin only)
router.put('/:userId/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can change roles' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // In a real application, you would update the user's role in the database
    // For now, we'll just return a success message
    res.json({ message: `User ${userId} role updated to ${role}` });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 