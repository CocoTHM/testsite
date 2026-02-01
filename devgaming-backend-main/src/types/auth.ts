import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  provider: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
