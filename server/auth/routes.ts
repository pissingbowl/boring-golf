import type { Express } from 'express';
import { z } from 'zod';
import { getUser, updateUserProfile, upsertUser } from './supabaseAuth';
import { requireAuth } from '../middleware/auth';

const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  handicap: z.string().nullable().optional(),
  dietary: z.string().optional(),
  tshirtSize: z.string().optional(),
  homeAirport: z.string().optional(),
  shippingStreet: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZip: z.string().optional(),
  shippingCountry: z.string().optional(),
  profileComplete: z.boolean().optional(),
});

export function registerAuthRoutes(app: Express): void {
  
  // Get current authenticated user
  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      let user = await getUser(userId);
      
      if (!user) {
        // Create user profile if it doesn't exist
        user = await upsertUser({
          id: userId,
          email: req.user!.email || '',
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error in /api/auth/me:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Get user profile (same as /me but for compatibility)
  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Update user profile
  app.patch('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const data = profileUpdateSchema.parse(req.body);
      
      const updatedUser = await updateUserProfile(userId, data);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid profile data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Sync user to database after client-side auth
  // Called after supabase.auth.exchangeCodeForSession on frontend
  app.post('/api/auth/sync', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const email = req.user!.email || '';

      // Upsert user in our database
      await upsertUser({
        id: userId,
        email: email,
      });

      // Check for pending invites matching this email and convert them
      // This will be handled by the trip service

      res.json({ success: true, userId });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Logout is now client-side only via supabase.auth.signOut()
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
  });
}
