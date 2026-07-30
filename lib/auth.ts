import crypto from 'crypto';
import { getAuthCookie, verifyJWT } from './jwt';
import { JWTPayload } from '@/types';

/**
 * Hash password securely using Node crypto pbkdf2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against hashed password
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash), Buffer.from(verifyHash));
  } catch (error) {
    return false;
  }
}

/**
 * Get current logged in session from server cookies
 */
export async function getSession(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyJWT(token);
}
