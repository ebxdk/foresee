import { AppState, AppStateStatus } from 'react-native';
import { getCurrentSleepStatus } from './mockSleepSystem';
import { applyScoreTailEffects, checkAndApplyEnergyDecay } from './storage';

// Event emitter for UI updates
type DecayUpdateListener = (update: {
  energyLost: number;
  newEnergy: number;
  previousEnergy: number;
  decayRate: number;
  isSleeping: boolean;
  tailsApplied?: number;
  pointsFaded?: { P: number; C: number };
}) => void;

class BackgroundDecayService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: DecayUpdateListener[] = [];
  private isRunning = false;
  private lastCheckTime: Date | null = null;
  private appStateListener: ((nextAppState: AppStateStatus) => void) | null = null;

  /**
   * Start the background decay service
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Background decay service already running');
      return;
    }

    console.log('🚀 Starting background decay service...');
    this.isRunning = true;

    // Check immediately on start
    this.checkDecay();

    // Set up hourly interval
    this.intervalId = setInterval(() => {
      this.checkDecay();
    }, 60 * 60 * 1000); // Every hour

    // Listen for app state changes
    this.appStateListener = this.handleAppStateChange.bind(this);
    AppState.addEventListener('change', this.appStateListener);

    console.log('✅ Background decay service started successfully');
  }

  /**
   * Stop the background decay service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping background decay service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.appStateListener) {
      // Note: React Native AppState doesn't have removeEventListener
      // The listener will be cleaned up when the component unmounts
      this.appStateListener = null;
    }
    
    console.log('✅ Background decay service stopped');
  }

  /**
   * Check and apply energy decay
   */
  private async checkDecay(): Promise<void> {
    try {
      const now = new Date();
      this.lastCheckTime = now;

      console.log(`🕐 Background decay check at ${now.toLocaleTimeString()}`);

      // Get current sleep status
      const sleepStatus = await getCurrentSleepStatus();
      
      // Check if decay is due and apply it
      const decayResult = await checkAndApplyEnergyDecay();
      
      // Apply score tail effects (P/C score fading)
      const tailResult = await applyScoreTailEffects();

      if (decayResult.decayApplied) {
        console.log('⚡ Background decay applied:', {
          energyLost: decayResult.energyLost,
          newEnergy: decayResult.newEnergy,
          isSleeping: sleepStatus.isSleeping,
        });

        // Notify listeners of the update
        this.notifyListeners({
          energyLost: decayResult.energyLost,
          newEnergy: decayResult.newEnergy,
          previousEnergy: decayResult.newEnergy + decayResult.energyLost,
          decayRate: decayResult.energyLost, // For this hour
          isSleeping: sleepStatus.isSleeping,
          tailsApplied: tailResult.tailsApplied,
          pointsFaded: tailResult.totalPointsFaded,
        });
      } else {
        console.log('⏰ Background decay check: decay not due yet');
      }

      // Log tail effects even if no decay was applied
      if (tailResult.tailsApplied > 0) {
        console.log('🌊 Background score tail effects applied:', {
          tailsApplied: tailResult.tailsApplied,
          pointsFaded: tailResult.totalPointsFaded,
        });
      }

    } catch (error) {
      console.error('❌ Error in background decay check:', error);
    }
  }

  /**
   * Handle app state changes (foreground/background)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      // App came to foreground, check if we missed any decay
      console.log('📱 App came to foreground, checking for missed decay...');
      this.checkDecay();
    }
  };

  /**
   * Add a listener for decay updates
   */
  addListener(listener: DecayUpdateListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: DecayUpdateListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of decay updates
   */
  private notifyListeners(update: Parameters<DecayUpdateListener>[0]): void {
    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in decay update listener:', error);
      }
    });
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    lastCheckTime: Date | null;
    nextCheckTime: Date | null;
  } {
    const nextCheckTime = this.lastCheckTime 
      ? new Date(this.lastCheckTime.getTime() + 60 * 60 * 1000)
      : null;

    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      nextCheckTime,
    };
  }

  /**
   * Force an immediate decay check (for testing)
   */
  async forceCheck(): Promise<void> {
    console.log('🔧 Forcing immediate decay check...');
    await this.checkDecay();
  }
}

// Create singleton instance
export const backgroundDecayService = new BackgroundDecayService();

/**
 * Start background decay service
 */
export function startBackgroundDecayService(): void {
  backgroundDecayService.start();
}

/**
 * Stop background decay service
 */
export function stopBackgroundDecayService(): void {
  backgroundDecayService.stop();
}

/**
 * Get background decay service status
 */
export function getBackgroundDecayServiceStatus() {
  return backgroundDecayService.getStatus();
}

/**
 * Force immediate decay check (for testing)
 */
export async function forceBackgroundDecayCheck(): Promise<void> {
  await backgroundDecayService.forceCheck();
}
