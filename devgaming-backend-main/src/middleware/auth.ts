import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';

// Middleware to check if user is authenticated
export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ error: 'Non authentifié' });
};

// Middleware to check if user is active
export const isActive = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isActive) {
    return next();
  }
  return res.status(403).json({ error: 'Compte désactivé' });
};

// Middleware to check if user has specific role
export const hasRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));
    
    if (hasRequiredRole) {
      return next();
    }

    return res.status(403).json({ error: 'Permissions insuffisantes' });
  };
};

// Middleware to check if user has specific permission
export const hasPermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const hasRequiredPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );
    
    if (hasRequiredPermission) {
      return next();
    }

    return res.status(403).json({ error: 'Permissions insuffisantes' });
  };
};

// Middleware to check if user has ANY of the specified permissions
export const hasAnyPermission = (...permissions: string[]) => {
  return hasPermission(...permissions);
};

// Middleware to check if user has ALL of the specified permissions
export const hasAllPermissions = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const hasAllRequired = permissions.every(permission => 
      req.user!.permissions.includes(permission)
    );
    
    if (hasAllRequired) {
      return next();
    }

    return res.status(403).json({ error: 'Permissions insuffisantes' });
  };
};

// Middleware to check if user is admin
export const isAdmin = hasPermission('admin.access');

// Middleware to check if user is moderator
export const isModerator = hasAnyPermission('admin.access', 'moderate.content', 'moderate.users');
