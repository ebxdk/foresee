import { getBackgroundDecayServiceStatus, startBackgroundDecayService, stopBackgroundDecayService } from './backgroundDecayService';
import { getSleepPatterns, initializeMockSleepSystem } from './mockSleepSystem';
import {
    applySleepQualityAdjustment,
    calculateEnergyDecay,
    createEnergyBuffer,
    createScoreTail,
    getDailyActivity,
    getEnergyBuffer,
    getEPCScores,
    getScoreTails,
    getToolCooldownStatus,
    getToolUsage,
    storeDailyActivity,
    storeEPCScores,
    storeToolUsage
} from './storage';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export class ProductionTestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Production Test Suite...');
    
    try {
      // Core System Tests
      await this.testEPCScoreSystem();
      await this.testToolSystem();
      await this.testBufferAndTailSystem();
      await this.testEnergyDecaySystem();
      await this.testBackgroundService();
      await this.testSleepSystem();
      await this.testIntegration();
      
      // Performance Tests
      await this.testPerformance();
      
      // Edge Case Tests
      await this.testEdgeCases();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }

    this.printResults();
    return this.results;
  }

  private async testEPCScoreSystem(): Promise<void> {
    console.log('📊 Testing EPC Score System...');
    
    try {
      // Test basic storage and retrieval
      const testScores = { energy: 75, purpose: 80, connection: 70 };
      await storeEPCScores(testScores);
      const retrievedScores = await getEPCScores();
      
      if (JSON.stringify(retrievedScores) === JSON.stringify(testScores)) {
        this.addResult('EPC Score Storage', true);
      } else {
        this.addResult('EPC Score Storage', false, 'Scores mismatch', { expected: testScores, got: retrievedScores });
      }

      // Test score updates
      const updatedScores = { energy: 85, purpose: 90, connection: 75 };
      await storeEPCScores(updatedScores);
      const finalScores = await getEPCScores();
      
      if (JSON.stringify(finalScores) === JSON.stringify(updatedScores)) {
        this.addResult('EPC Score Updates', true);
      } else {
        this.addResult('EPC Score Updates', false, 'Update failed', { expected: updatedScores, got: finalScores });
      }

    } catch (error) {
      this.addResult('EPC Score System', false, error.message);
    }
  }

  private async testToolSystem(): Promise<void> {
    console.log('🛠️ Testing Tool System...');
    
    try {
      // Test tool usage storage with correct parameters
      const toolId = 'hydrationHero';
      const pointsEarned = { E: 2, P: 0, C: 0 };
      
      await storeToolUsage(toolId, pointsEarned);
      const retrievedUsage = await getToolUsage(toolId);
      
      if (retrievedUsage && retrievedUsage.pointsEarned) {
        this.addResult('Tool Usage Storage', true);
      } else {
        this.addResult('Tool Usage Storage', false, 'Usage not stored correctly');
      }

      // Test cooldown calculation using the correct function
      const cooldownStatus = await getToolCooldownStatus(toolId);
      if (cooldownStatus && typeof cooldownStatus.effectivePoints === 'object') {
        this.addResult('Tool Cooldown Calculation', true);
      } else {
        this.addResult('Tool Cooldown Calculation', false, 'Cooldown calculation failed');
      }

    } catch (error) {
      this.addResult('Tool System', false, error.message);
    }
  }

  private async testBufferAndTailSystem(): Promise<void> {
    console.log('🛡️ Testing Buffer and Tail System...');
    
    try {
      // Test energy buffer creation with valid tool ID
      const buffer = await createEnergyBuffer('hydrationHero', 0.5, 2);
      if (buffer && buffer.multiplier === 2) {
        this.addResult('Energy Buffer Creation', true);
      } else {
        this.addResult('Energy Buffer Creation', false, 'Buffer creation failed');
      }

      // Test score tail creation with correct parameter order
      const tail = await createScoreTail('hydrationHero', 4, { P: 5, C: 3 });
      if (tail && tail.initialPoints.P === 5) {
        this.addResult('Score Tail Creation', true);
      } else {
        this.addResult('Score Tail Creation', false, 'Tail creation failed');
      }

      // Test effects application
      const tails = await getScoreTails();
      if (tails.activeTails.length > 0) {
        this.addResult('Score Tails Retrieval', true);
      } else {
        this.addResult('Score Tails Retrieval', false, 'No active tails found');
      }

    } catch (error) {
      this.addResult('Buffer and Tail System', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testEnergyDecaySystem(): Promise<void> {
    console.log('⚡ Testing Energy Decay System...');
    
    try {
      // Test daily activity storage
      const activity = {
        steps: 8000,
        activeMinutes: 60,
        exerciseMinutes: 30,
        sleepHours: 7.5,
        sleepQuality: 4
      };
      
      await storeDailyActivity(activity);
      const retrievedActivity = await getDailyActivity();
      
      if (retrievedActivity && retrievedActivity.steps === 8000) {
        this.addResult('Daily Activity Storage', true);
      } else {
        this.addResult('Daily Activity Storage', false, 'Activity not stored');
      }

      // Test energy decay calculation
      const decayResult = await calculateEnergyDecay();
      if (decayResult && typeof decayResult.energyLost === 'number') {
        this.addResult('Energy Decay Calculation', true);
      } else {
        this.addResult('Energy Decay Calculation', false, 'Decay calculation failed');
      }

      // Test sleep quality adjustment
      const adjustedScores = await applySleepQualityAdjustment(4, 7.5);
      if (adjustedScores && typeof adjustedScores.newEnergy === 'number') {
        this.addResult('Sleep Quality Adjustment', true);
      } else {
        this.addResult('Sleep Quality Adjustment', false, 'Sleep adjustment failed');
      }

    } catch (error) {
      this.addResult('Energy Decay System', false, error.message);
    }
  }

  private async testBackgroundService(): Promise<void> {
    console.log('🔄 Testing Background Service...');
    
    try {
      // Test service status
      const status = getBackgroundDecayServiceStatus();
      if (status && typeof status.isRunning === 'boolean') {
        this.addResult('Background Service Status', true);
      } else {
        this.addResult('Background Service Status', false, 'Status check failed');
      }

      // Test service start
      startBackgroundDecayService();
      const runningStatus = getBackgroundDecayServiceStatus();
      if (runningStatus.isRunning) {
        this.addResult('Background Service Start', true);
      } else {
        this.addResult('Background Service Start', false, 'Service not starting');
      }

      // Test service stop
      stopBackgroundDecayService();
      const stoppedStatus = getBackgroundDecayServiceStatus();
      if (!stoppedStatus.isRunning) {
        this.addResult('Background Service Stop', true);
      } else {
        this.addResult('Background Service Stop', false, 'Service not stopping');
      }

    } catch (error) {
      this.addResult('Background Service', false, error.message);
    }
  }

  private async testSleepSystem(): Promise<void> {
    console.log('😴 Testing Sleep System...');
    
    try {
      // Test sleep system initialization
      await initializeMockSleepSystem();
      const patterns = await getSleepPatterns();
      
      if (patterns && patterns.typicalBedtime !== undefined) {
        this.addResult('Sleep System Initialization', true);
      } else {
        this.addResult('Sleep System Initialization', false, 'Sleep system not initialized');
      }

      // Test sleep pattern retrieval
      if (patterns.isNightOwl !== undefined) {
        this.addResult('Sleep Pattern Retrieval', true);
      } else {
        this.addResult('Sleep Pattern Retrieval', false, 'Pattern retrieval failed');
      }

    } catch (error) {
      this.addResult('Sleep System', false, error.message);
    }
  }

  private async testIntegration(): Promise<void> {
    console.log('🔗 Testing System Integration...');
    
    try {
      // Test complete workflow
      const testScores = { energy: 70, purpose: 75, connection: 80 };
      await storeEPCScores(testScores);
      
      // Create effects
      await createEnergyBuffer('hydrationHero', 0.6, 1);
      await createScoreTail('hydrationHero', 2, { P: 3, C: 2 });
      
      // Check integration
      const [buffer, tails] = await Promise.all([
        getEnergyBuffer(),
        getScoreTails()
      ]);
      
      if (buffer && tails.activeTails.length > 0) {
        this.addResult('System Integration', true);
      } else {
        this.addResult('System Integration', false, 'Integration test failed');
      }

    } catch (error) {
      this.addResult('System Integration', false, error.message);
    }
  }

  private async testPerformance(): Promise<void> {
    console.log('⚡ Testing Performance...');
    
    try {
      const startTime = Date.now();
      
      // Test multiple operations
      for (let i = 0; i < 10; i++) {
        await storeEPCScores({ energy: 70 + i, purpose: 75 + i, connection: 80 + i });
        await getEPCScores();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration < 1000) { // Should complete in under 1 second
        this.addResult('Performance Test', true, undefined, { duration: `${duration}ms` });
      } else {
        this.addResult('Performance Test', false, 'Performance too slow', { duration: `${duration}ms` });
      }

    } catch (error) {
      this.addResult('Performance Test', false, error.message);
    }
  }

  private async testEdgeCases(): Promise<void> {
    console.log('🔍 Testing Edge Cases...');
    
    try {
      // Test invalid data handling
      try {
        await storeEPCScores({ energy: -5, purpose: 150, connection: 0 });
        this.addResult('Invalid Data Handling', false, 'Should have rejected invalid scores');
      } catch (error) {
        this.addResult('Invalid Data Handling', true);
      }

      // Test empty data
      try {
        const emptyScores = await getEPCScores();
        if (emptyScores && typeof emptyScores.energy === 'number') {
          this.addResult('Empty Data Handling', true);
        } else {
          this.addResult('Empty Data Handling', false, 'Empty data not handled properly');
        }
      } catch (error) {
        this.addResult('Empty Data Handling', false, error.message);
      }

    } catch (error) {
      this.addResult('Edge Cases', false, error.message);
    }
  }

  private async calculateToolCooldown(toolId: string): Promise<any> {
    try {
      const usage = await getToolUsage(toolId);
      if (!usage) return null;
      
      const now = new Date();
      const hoursSinceLastUse = (now.getTime() - usage.lastUsed.getTime()) / (1000 * 60 * 60);
      
      return {
        toolId,
        hoursSinceLastUse,
        isOnCooldown: hoursSinceLastUse < 24 // Example cooldown
      };
    } catch (error) {
      return null;
    }
  }

  private addResult(testName: string, passed: boolean, error?: string, details?: any): void {
    this.results.push({
      testName,
      passed,
      error,
      details
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    if (error) console.log(`   Error: ${error}`);
    if (details) console.log(`   Details:`, details);
  }

  private printResults(): void {
    console.log('\n📊 PRODUCTION TEST RESULTS:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${percentage}%)`);
    
    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Your app is ready for production! 🚀');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues before production.');
      
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   - ${result.testName}: ${result.error}`);
      });
    }
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}`);
    });
  }
}

export const productionTestSuite = new ProductionTestSuite();

