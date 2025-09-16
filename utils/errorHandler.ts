// Error Handling Utility for Production

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export class ErrorHandler {
  private static errors: AppError[] = [];
  private static maxErrors = 100; // Keep last 100 errors

  static handleError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: this.getErrorDetails(error),
      timestamp: new Date(),
      context
    };

    this.logError(appError);
    this.storeError(appError);
    
    return appError;
  }

  static handleAsyncError<T>(
    promise: Promise<T>, 
    context?: string,
    fallback?: T
  ): Promise<T> {
    return promise.catch(error => {
      const appError = this.handleError(error, context);
      console.error(`Async error in ${context}:`, appError);
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw appError;
    });
  }

  static validateEPCScores(scores: any): boolean {
    try {
      if (!scores || typeof scores !== 'object') {
        throw new Error('EPC scores must be an object');
      }

      const requiredKeys = ['energy', 'purpose', 'connection'];
      for (const key of requiredKeys) {
        if (!(key in scores)) {
          throw new Error(`Missing required key: ${key}`);
        }
        
        const value = scores[key];
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error(`Invalid value for ${key}: ${value}`);
        }
        
        if (value < 0 || value > 100) {
          throw new Error(`Value out of range for ${key}: ${value} (must be 0-100)`);
        }
      }

      return true;
    } catch (error) {
      this.handleError(error, 'EPC Score Validation');
      return false;
    }
  }

  static validateToolId(toolId: string): boolean {
    try {
      if (!toolId || typeof toolId !== 'string') {
        throw new Error('Tool ID must be a non-empty string');
      }

      const validToolIds = [
        'hydrationHero', 'postItPriority', 'oxygenMask', 'nourishmentCheck',
        'freshAirFix', 'phoneFreePause', 'pleasurePlaylist', 'mentalUnload',
        'connectionSpark', 'sweetSpotScan', 'boundaryBuilder', 'scheduleScrub',
        'energyBudgetCheck', 'gratitudeGuardrail', 'capacityAudit',
        'recoveryRitual', 'teachItForward', 'aimReview'
      ];

      if (!validToolIds.includes(toolId)) {
        throw new Error(`Invalid tool ID: ${toolId}`);
      }

      return true;
    } catch (error) {
      this.handleError(error, 'Tool ID Validation');
      return false;
    }
  }

  static validateBufferParams(multiplier: number, duration: number): boolean {
    try {
      if (typeof multiplier !== 'number' || isNaN(multiplier)) {
        throw new Error('Buffer multiplier must be a valid number');
      }

      if (multiplier < 0 || multiplier > 1) {
        throw new Error('Buffer multiplier must be between 0 and 1');
      }

      if (typeof duration !== 'number' || isNaN(duration)) {
        throw new Error('Buffer duration must be a valid number');
      }

      if (duration <= 0 || duration > 168) { // Max 1 week
        throw new Error('Buffer duration must be between 0 and 168 hours');
      }

      return true;
    } catch (error) {
      this.handleError(error, 'Buffer Parameter Validation');
      return false;
    }
  }

  static validateTailParams(points: any, duration: number): boolean {
    try {
      if (!points || typeof points !== 'object') {
        throw new Error('Tail points must be an object');
      }

      if (!('P' in points) || !('C' in points)) {
        throw new Error('Tail points must have P and C properties');
      }

      if (typeof points.P !== 'number' || typeof points.C !== 'number') {
        throw new Error('Tail points P and C must be numbers');
      }

      if (points.P < 0 || points.C < 0) {
        throw new Error('Tail points cannot be negative');
      }

      if (typeof duration !== 'number' || isNaN(duration)) {
        throw new Error('Tail duration must be a valid number');
      }

      if (duration <= 0 || duration > 168) { // Max 1 week
        throw new Error('Tail duration must be between 0 and 168 hours');
      }

      return true;
    } catch (error) {
      this.handleError(error, 'Tail Parameter Validation');
      return false;
    }
  }

  static getErrorStats(): { total: number; recent: number; byCode: Record<string, number> } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recent = this.errors.filter(error => error.timestamp > oneHourAgo).length;
    const byCode: Record<string, number> = {};
    
    this.errors.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1;
    });

    return {
      total: this.errors.length,
      recent,
      byCode
    };
  }

  static clearErrors(): void {
    this.errors = [];
  }

  private static getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.name) return error.name;
    return 'UNKNOWN_ERROR';
  }

  private static getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  }

  private static getErrorDetails(error: any): any {
    if (error?.details) return error.details;
    if (error?.stack) return { stack: error.stack };
    return error;
  }

  private static logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      context: error.context,
      details: error.details,
      timestamp: error.timestamp.toISOString()
    });
  }

  private static storeError(error: AppError): void {
    this.errors.push(error);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }
}
