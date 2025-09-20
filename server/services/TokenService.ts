import jwt from 'jsonwebtoken';
import { User } from '../database';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export interface TokenResult {
  success: boolean;
  token?: string;
  payload?: JWTPayload;
  message?: string;
}

export class TokenService {
  private static readonly JWT_SECRET = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return secret || 'dev-only-secret-key-never-use-in-production';
  })();
  private static readonly JWT_EXPIRES_IN = '30d'; // 30 days

  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): TokenResult {
    try {
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      };

      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
        issuer: 'foresee-app',
        audience: 'foresee-users'
      });

      return {
        success: true,
        token,
        payload
      };
    } catch (error) {
      console.error('Error generating JWT token:', error);
      return {
        success: false,
        message: 'Failed to generate authentication token'
      };
    }
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): TokenResult {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'foresee-app',
        audience: 'foresee-users'
      }) as JWTPayload;

      return {
        success: true,
        payload
      };
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          message: 'Invalid authentication token'
        };
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return {
          success: false,
          message: 'Authentication token has expired'
        };
      }

      return {
        success: false,
        message: 'Token verification failed'
      };
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}