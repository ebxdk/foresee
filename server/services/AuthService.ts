// AuthService.ts - Server-side authentication service handling user management
import * as bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db, schema, type User, type NewUser, type NewVerificationCode } from '../database';
import { EmailService } from './EmailService';
import { ValidationService } from './ValidationService';
import { TokenService } from './TokenService';

const { users, verificationCodes } = schema;

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly CODE_EXPIRY_MINUTES = 15;

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

      // Check if email already exists (but don't reveal this to prevent enumeration)
      const emailExists = await this.checkEmailExists(sanitizedEmail);
      if (emailExists) {
        // Return success to prevent account enumeration, but don't actually send email
        return { 
          success: true, 
          message: 'Verification code sent to your email!' 
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

      // SECURITY: Verify that email was actually verified recently before allowing signup
      const recentVerificationRecord = await db.select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.email, sanitizedEmail),
            eq(verificationCodes.used, true),
            eq(verificationCodes.type, 'email_verification')
          )
        )
        .limit(1);

      if (recentVerificationRecord.length === 0) {
        return { 
          success: false, 
          message: 'Email must be verified before creating account. Please complete email verification first.' 
        };
      }

      // Check if verification is still recent (within 60 minutes)
      const record = recentVerificationRecord[0];
      const verificationAge = Date.now() - record.createdAt.getTime();
      const maxVerificationAge = 60 * 60 * 1000; // 60 minutes

      if (verificationAge > maxVerificationAge) {
        return { 
          success: false, 
          message: 'Email verification has expired. Please verify your email again.' 
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

      // Generate JWT token
      const tokenResult = TokenService.generateToken(user);
      if (!tokenResult.success) {
        return { 
          success: false, 
          message: tokenResult.message || 'Failed to create authentication token' 
        };
      }

      // Send welcome email
      await EmailService.sendWelcomeEmail(sanitizedEmail, sanitizedName);

      return {
        success: true,
        message: 'Account created successfully!',
        user,
        token: tokenResult.token,
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
   * Authenticate user and return JWT token
   */
  static async authenticateUser(email: string, password: string): Promise<AuthResult> {
    try {
      const emailValidation = ValidationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error! };
      }

      const sanitizedEmail = ValidationService.sanitizeEmail(email);

      // Find user by email
      const userRecord = await db.select().from(users).where(eq(users.email, sanitizedEmail)).limit(1);
      
      if (userRecord.length === 0) {
        return { 
          success: false, 
          message: 'Invalid email or password' 
        };
      }

      const user = userRecord[0];

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return { 
          success: false, 
          message: 'Invalid email or password' 
        };
      }

      // Generate JWT token
      const tokenResult = TokenService.generateToken(user);
      if (!tokenResult.success) {
        return { 
          success: false, 
          message: tokenResult.message || 'Failed to create authentication token' 
        };
      }

      return {
        success: true,
        message: 'Login successful',
        user,
        token: tokenResult.token,
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { 
        success: false, 
        message: 'Authentication failed. Please try again.' 
      };
    }
  }

  /**
   * Validate JWT token and return user data
   */
  static async validateToken(token: string): Promise<AuthResult> {
    try {
      const tokenResult = TokenService.verifyToken(token);
      if (!tokenResult.success) {
        return { 
          success: false, 
          message: tokenResult.message || 'Invalid token' 
        };
      }

      // Get fresh user data from database
      const userRecord = await db.select().from(users).where(eq(users.id, tokenResult.payload!.userId)).limit(1);
      
      if (userRecord.length === 0) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      return {
        success: true,
        message: 'Token is valid',
        user: userRecord[0],
        token,
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { 
        success: false, 
        message: 'Token validation failed' 
      };
    }
  }
}