// AuthService.ts - Main authentication service handling user management
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { db } from '../lib/database';
import { users, verificationCodes, userSessions, type User, type NewUser, type NewVerificationCode, type NewUserSession } from '../lib/schema';
import { EmailService } from './EmailService';
import { ValidationService } from './ValidationService';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  sessionToken?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly CODE_EXPIRY_MINUTES = 15;
  private static readonly SESSION_EXPIRY_DAYS = 30;

  /**
   * Check if email already exists in database
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const sanitizedEmail = ValidationService.sanitizeEmail(email);
      const existingUser = await db.select().from(users).where(eq(users.email, sanitizedEmail)).limit(1);
      return existingUser.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Database error occurred');
    }
  }

  /**
   * Generate and send verification code
   */
  static async generateVerificationCode(email: string, name?: string): Promise<AuthResult> {
    try {
      // Validate email
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error! };
      }

      const sanitizedEmail = ValidationService.sanitizeEmail(email);

      // Check if email already exists
      const emailExists = await this.checkEmailExists(sanitizedEmail);
      if (emailExists) {
        return { 
          success: false, 
          message: 'This email is already registered. Try logging in instead.' 
        };
      }

      // Generate verification code
      const code = ValidationService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + (this.CODE_EXPIRY_MINUTES * 60 * 1000));

      // Delete any existing verification codes for this email
      await db.delete(verificationCodes).where(eq(verificationCodes.email, sanitizedEmail));

      // Insert new verification code
      const newCode: NewVerificationCode = {
        email: sanitizedEmail,
        code,
        type: 'email_verification',
        expiresAt,
        used: false,
      };

      await db.insert(verificationCodes).values(newCode);

      // Send verification email
      const emailSent = await EmailService.sendVerificationEmail(sanitizedEmail, code, name);
      
      if (!emailSent) {
        return { 
          success: false, 
          message: 'Failed to send verification email. Please try again.' 
        };
      }

      return { 
        success: true, 
        message: 'Verification code sent to your email!' 
      };
    } catch (error) {
      console.error('Error generating verification code:', error);
      return { 
        success: false, 
        message: 'Something went wrong. Please try again.' 
      };
    }
  }

  /**
   * Validate verification code
   */
  static async validateVerificationCode(email: string, code: string): Promise<AuthResult> {
    try {
      // Validate inputs
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error! };
      }

      const codeValidation = ValidationService.validateVerificationCode(code);
      if (!codeValidation.isValid) {
        return { success: false, message: codeValidation.error! };
      }

      const sanitizedEmail = ValidationService.sanitizeEmail(email);

      // Find verification code
      const verificationRecord = await db.select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.email, sanitizedEmail),
            eq(verificationCodes.code, code.trim()),
            eq(verificationCodes.used, false)
          )
        )
        .limit(1);

      if (verificationRecord.length === 0) {
        return { 
          success: false, 
          message: 'Invalid verification code. Please check and try again.' 
        };
      }

      const record = verificationRecord[0];

      // Check if code is expired
      if (ValidationService.isCodeExpired(record.createdAt, this.CODE_EXPIRY_MINUTES)) {
        // Delete expired code
        await db.delete(verificationCodes).where(eq(verificationCodes.id, record.id));
        return { 
          success: false, 
          message: 'Verification code has expired. Please request a new one.' 
        };
      }

      // Mark code as used
      await db.update(verificationCodes)
        .set({ used: true })
        .where(eq(verificationCodes.id, record.id));

      return { 
        success: true, 
        message: 'Email verified successfully!' 
      };
    } catch (error) {
      console.error('Error validating verification code:', error);
      return { 
        success: false, 
        message: 'Something went wrong. Please try again.' 
      };
    }
  }

  /**
   * Create new user account
   */
  static async createUser(signupData: SignupData): Promise<AuthResult> {
    try {
      // Validate all inputs
      const nameValidation = ValidationService.validateName(signupData.name);
      if (!nameValidation.isValid) {
        return { success: false, message: nameValidation.error! };
      }

      const emailValidation = ValidationService.validateEmail(signupData.email);
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error! };
      }

      const passwordValidation = ValidationService.validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.error! };
      }

      const sanitizedEmail = ValidationService.sanitizeEmail(signupData.email);
      const sanitizedName = ValidationService.sanitizeName(signupData.name);

      // Check if email already exists
      const emailExists = await this.checkEmailExists(sanitizedEmail);
      if (emailExists) {
        return { 
          success: false, 
          message: 'This email is already registered.' 
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(signupData.password, this.SALT_ROUNDS);

      // Create user
      const newUser: NewUser = {
        name: sanitizedName,
        email: sanitizedEmail,
        passwordHash,
        emailVerified: true, // Since they completed email verification
      };

      const createdUsers = await db.insert(users).values(newUser).returning();
      const user = createdUsers[0];

      // Clean up verification codes for this email
      await db.delete(verificationCodes).where(eq(verificationCodes.email, sanitizedEmail));

      // Create session
      const sessionResult = await this.createSession(user.id);
      if (!sessionResult.success) {
        return sessionResult;
      }

      // Send welcome email
      await EmailService.sendWelcomeEmail(sanitizedEmail, sanitizedName);

      return {
        success: true,
        message: 'Account created successfully!',
        user,
        sessionToken: sessionResult.sessionToken,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        message: 'Failed to create account. Please try again.' 
      };
    }
  }

  /**
   * Create user session
   */
  static async createSession(userId: string): Promise<AuthResult> {
    try {
      const sessionToken = uuidv4();
      const expiresAt = new Date(Date.now() + (this.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000));

      const newSession: NewUserSession = {
        userId,
        sessionToken,
        expiresAt,
      };

      await db.insert(userSessions).values(newSession);

      return {
        success: true,
        message: 'Session created successfully',
        sessionToken,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      return { 
        success: false, 
        message: 'Failed to create session' 
      };
    }
  }

  /**
   * Validate user session
   */
  static async validateSession(sessionToken: string): Promise<AuthResult> {
    try {
      if (!sessionToken) {
        return { success: false, message: 'No session token provided' };
      }

      // Find session with user data
      const sessionData = await db.select({
        session: userSessions,
        user: users,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(eq(userSessions.sessionToken, sessionToken))
      .limit(1);

      if (sessionData.length === 0) {
        return { success: false, message: 'Invalid session' };
      }

      const { session, user } = sessionData[0];

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        // Delete expired session
        await db.delete(userSessions).where(eq(userSessions.id, session.id));
        return { success: false, message: 'Session expired' };
      }

      return {
        success: true,
        message: 'Valid session',
        user,
        sessionToken,
      };
    } catch (error) {
      console.error('Error validating session:', error);
      return { 
        success: false, 
        message: 'Session validation failed' 
      };
    }
  }

  /**
   * Log out user (delete session)
   */
  static async logout(sessionToken: string): Promise<AuthResult> {
    try {
      await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, message: 'Logout failed' };
    }
  }
}