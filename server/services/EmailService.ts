// EmailService.ts - Server-side email service using Replit Mail integration
import { sendEmail } from '../../src/utils/replitmail';

export class EmailService {
  /**
   * Get the base URL for assets based on environment
   */
  private static getAssetBaseUrl(): string {
    if (process.env.NODE_ENV === 'production') {
      // Use your production domain
      return process.env.API_BASE_URL || 'https://your-domain.com';
    }
    
    // Development - use Replit or localhost
    const replitDomain = process.env.REPLIT_DEV_DOMAIN;
    if (replitDomain) {
      return `https://${replitDomain}:8080`;
    }
    
    return 'http://localhost:8080';
  }

  /**
   * Get the logo image URL
   */
  private static getLogoUrl(): string {
    return `${this.getAssetBaseUrl()}/assets/images/foreseelogoimg.png`;
  }
  /**
   * Send verification code email to user
   */
  static async sendVerificationEmail(email: string, code: string, name?: string): Promise<boolean> {
    try {
      const greeting = name ? `Hi ${name}!` : 'Hi there!';
      const logoUrl = this.getLogoUrl();
      
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${logoUrl}" alt="Foresee" style="height: 100px; width: auto;" />
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
            <h2 style="font-size: 24px; font-weight: 600; color: #000000; margin: 0 0 16px 0;">${greeting}</h2>
            <p style="font-size: 16px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.5;">
              Welcome to Foresee! Here's your verification code to complete your signup:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
               <div style="background-color: #000000; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 20px 32px; border-radius: 12px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; margin: 24px 0 0 0; text-align: center;">
              This code expires in 15 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Foresee - Track your wellbeing in real-time</p>
          </div>
        </div>
      `;

      const textContent = `${greeting}

Welcome to Foresee! Here's your verification code to complete your signup:

${code}

This code expires in 15 minutes. If you didn't request this, please ignore this email.

Foresee - Track your wellbeing in real-time`;

      const result = await sendEmail({
        to: email,
        subject: 'Your Foresee verification code',
        html: htmlContent,
        text: textContent,
      });

      console.log('Verification email sent successfully:', result.accepted);
      return result.accepted.length > 0;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Send welcome email after successful signup
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const logoUrl = this.getLogoUrl();
      
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${logoUrl}" alt="Foresee" style="height: 100px; width: auto;" />
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 16px; padding: 32px;">
            <h2 style="font-size: 24px; font-weight: 600; color: #000000; margin: 0 0 16px 0;">Welcome to Foresee, ${name}! 🎉</h2>
            <p style="font-size: 16px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.5;">
              Your account is now set up and ready to go. You're about to start an amazing journey toward better wellbeing and burnout prevention.
            </p>
            
            <div style="margin: 24px 0;">
              <h3 style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px 0;">What's next?</h3>
              <ul style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Complete your onboarding questionnaire</li>
                <li>Connect your health apps (optional)</li>
                <li>Start tracking your daily wellbeing</li>
                <li>Discover personalized tools to prevent burnout</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; color: #6b7280; margin: 24px 0 0 0; line-height: 1.5;">
              We're excited to have you on board! If you have any questions, just reply to this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 32px;">
            <p>Foresee - Track your wellbeing in real-time</p>
          </div>
        </div>
      `;

      const textContent = `Welcome to Foresee, ${name}! 🎉

Your account is now set up and ready to go. You're about to start an amazing journey toward better wellbeing and burnout prevention.

What's next?
• Complete your onboarding questionnaire
• Connect your health apps (optional)
• Start tracking your daily wellbeing
• Discover personalized tools to prevent burnout

We're excited to have you on board! If you have any questions, just reply to this email.

Foresee - Track your wellbeing in real-time`;

      const result = await sendEmail({
        to: email,
        subject: 'Welcome to Foresee! Your journey begins now',
        html: htmlContent,
        text: textContent,
      });

      console.log('Welcome email sent successfully:', result.accepted);
      return result.accepted.length > 0;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

