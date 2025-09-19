import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { applyScoreTailEffects, checkAndApplyEnergyDecay } from './storage';

export const DECAY_FETCH_TASK = 'DECAY_BACKGROUND_FETCH_TASK';

// Define the background task once at module load
TaskManager.defineTask(DECAY_FETCH_TASK, async () => {
  try {
    // Run energy decay and score tail effects just like the in-app service
    const decay = await checkAndApplyEnergyDecay();
    const tails = await applyScoreTailEffects();

    const newData = (decay.decayApplied || tails.tailsApplied > 0);
    if (newData) {
      console.log('✅ Background fetch: applied updates', {
        decayApplied: decay.decayApplied,
        energyLost: decay.energyLost,
        tailsApplied: tails.tailsApplied,
        pointsFaded: tails.totalPointsFaded,
      });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log('ℹ️ Background fetch: no updates needed');
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('❌ Background fetch task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerDecayBackgroundFetch(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.warn('Background fetch is disabled or restricted by the OS');
      return;
    }

    // Optional: ensure minimum interval (seconds). iOS ignores exact interval, Android uses it.
    await BackgroundFetch.setMinimumIntervalAsync(15 * 60);

    const tasks = await TaskManager.getRegisteredTasksAsync();
    const alreadyRegistered = tasks.some(t => t.taskName === DECAY_FETCH_TASK);
    if (!alreadyRegistered) {
      await BackgroundFetch.registerTaskAsync(DECAY_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,   // Android: continue after app quit
        startOnBoot: true,        // Android: auto-start on device boot
      });
      console.log('✅ Registered background fetch task:', DECAY_FETCH_TASK);
    } else {
      console.log('🔄 Background fetch task already registered');
    }
  } catch (error) {
    console.error('❌ Failed to register background fetch task:', error);
  }
}

export async function unregisterDecayBackgroundFetch(): Promise<void> {
  try {
    const tasks = await TaskManager.getRegisteredTasksAsync();
    const isRegistered = tasks.some(t => t.taskName === DECAY_FETCH_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(DECAY_FETCH_TASK);
      console.log('🛑 Unregistered background fetch task:', DECAY_FETCH_TASK);
    }
  } catch (error) {
    console.error('❌ Failed to unregister background fetch task:', error);
  }
}


