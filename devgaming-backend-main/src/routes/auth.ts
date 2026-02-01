import { Router, Response } from 'express';
import passport from '../config/passport';
import { AuthRequest } from '../types/auth';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${config.frontendUrl}/login?error=auth_failed` }),
  (req: AuthRequest, res: Response) => {
    const token = jwt.sign({ userId: req.user!.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
  }
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${config.frontendUrl}/login?error=auth_failed` }),
  (req: AuthRequest, res: Response) => {
    const token = jwt.sign({ userId: req.user!.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', isAuthenticated, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req: AuthRequest, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.json({ message: 'Déconnexion réussie' });
  });
});

export default router;
