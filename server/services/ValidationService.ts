// ValidationService.ts - Server-side input validation and security utilities
import { z } from 'zod';

export class ValidationService {
  // Email validation schema
  static emailSchema = z.string().email('Please enter a valid email address');

  // Name validation schema  
  static nameSchema = z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

  // Password validation schema
  static passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

  // Verification code schema
  static verificationCodeSchema = z.string()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits');

  /**
   * Validate email address
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    try {
      this.emailSchema.parse(email.trim().toLowerCase());
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0].message };
      }
      return { isValid: false, error: 'Invalid email format' };
    }
  }

  /**
   * Validate name
   */
  static validateName(name: string): { isValid: boolean; error?: string } {
    try {
      this.nameSchema.parse(name.trim());
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0].message };
      }
      return { isValid: false, error: 'Invalid name format' };
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    try {
      this.passwordSchema.parse(password);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0].message };
      }
      return { isValid: false, error: 'Password does not meet requirements' };
    }
  }

  /**
   * Validate verification code format
   */
  static validateVerificationCode(code: string): { isValid: boolean; error?: string } {
    try {
      this.verificationCodeSchema.parse(code.trim());
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0].message };
      }
      return { isValid: false, error: 'Invalid verification code format' };
    }
  }

  /**
   * Generate cryptographically secure 6-digit verification code
   */
  static generateVerificationCode(): string {
    // Generate cryptographically secure random 6-digit code
    const crypto = require('crypto');
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Check if verification code is expired
   */
  static isCodeExpired(createdAt: Date, expiryMinutes: number = 15): boolean {
    const now = new Date();
    const expiryTime = new Date(createdAt.getTime() + (expiryMinutes * 60 * 1000));
    return now > expiryTime;
  }

  /**
   * Sanitize and format email
   */
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Sanitize and format name
   */
  static sanitizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  }
}