/**
 * HealthKit Data Test Script
 * 
 * This script tests reading all HealthKit data types and validates the data structure.
 * It works with both mock data (for development) and real HealthKit data (when available).
 * 
 * Usage:
 *   npm run test:healthkit
 *   or
 *   tsx test-healthkit-data.ts
 */

import {
    convertAppleHealthToEPCAdjustments,
    generateMockAppleHealthData,
    getAppleHealthSummary,
    getMockAppleHealthData
} from './utils/mockAppleHealthData';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  data?: any;
}

class HealthKitDataTester {
  private results: TestResult[] = [];

  private log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  private addResult(testName: string, passed: boolean, message: string, data?: any) {
    this.results.push({ testName, passed, message, data });
    const status = passed ? '✅' : '❌';
    const color = passed ? colors.green : colors.red;
    this.log(`${status} ${testName}: ${message}`, color);
  }

  /**
   * Test 1: Mock Data Generation
   */
  async testMockDataGeneration(): Promise<void> {
    this.log('\n🔬 Testing Mock Data Generation...', colors.cyan);
    
    try {
      const mockData = generateMockAppleHealthData();
      
      // Validate data structure
      const requiredFields = [
        'steps', 'activityRings', 'sleep', 'heartRate', 
        'mindfulness', 'mood', 'workouts', 'environmental', 'lastUpdated'
      ];
      
      const hasAllFields = requiredFields.every(field => field in mockData);
      this.addResult(
        'Mock Data Structure', 
        hasAllFields, 
        hasAllFields ? 'All required fields present' : 'Missing required fields'
      );

      // Validate steps data
      const stepsValid = mockData.steps.count >= 0 && 
                        mockData.steps.goal > 0 && 
                        mockData.steps.percentage >= 0 && 
                        mockData.steps.percentage <= 200;
      this.addResult(
        'Steps Data Validation',
        stepsValid,
        stepsValid ? 'Steps data is valid' : 'Steps data has invalid values'
      );

      // Validate activity rings
      const ringsValid = mockData.activityRings.move.percentage >= 0 &&
                        mockData.activityRings.exercise.percentage >= 0 &&
                        mockData.activityRings.stand.percentage >= 0;
      this.addResult(
        'Activity Rings Validation',
        ringsValid,
        ringsValid ? 'Activity rings data is valid' : 'Activity rings data has invalid values'
      );

      // Validate sleep data
      const sleepValid = mockData.sleep.hoursSlept >= 0 &&
                          ['Poor', 'Fair', 'Good', 'Excellent'].includes(mockData.sleep.sleepQuality);
      this.addResult(
        'Sleep Data Validation',
        sleepValid,
        sleepValid ? 'Sleep data is valid' : 'Sleep data has invalid values'
      );

      // Validate heart rate data
      const hrValid = mockData.heartRate.resting > 0 &&
                     mockData.heartRate.current > 0 &&
                     mockData.heartRate.hrv > 0;
      this.addResult(
        'Heart Rate Data Validation',
        hrValid,
        hrValid ? 'Heart rate data is valid' : 'Heart rate data has invalid values'
      );

      // Validate mood data
      const moodValid = ['Very Pleasant', 'Pleasant', 'Neutral', 'Unpleasant', 'Very Unpleasant'].includes(mockData.mood.currentMood) &&
                       mockData.mood.stressLevel >= 1 && mockData.mood.stressLevel <= 10;
      this.addResult(
        'Mood Data Validation',
        moodValid,
        moodValid ? 'Mood data is valid' : 'Mood data has invalid values'
      );

    } catch (error) {
      this.addResult(
        'Mock Data Generation',
        false,
        `Error generating mock data: ${error}`
      );
    }
  }

  /**
   * Test 2: Async Data Fetching
   */
  async testAsyncDataFetching(): Promise<void> {
    this.log('\n⏱️  Testing Async Data Fetching...', colors.cyan);
    
    try {
      const startTime = Date.now();
      const healthData = await getMockAppleHealthData();
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.addResult(
        'Async Data Fetch',
        true,
        `Data fetched successfully in ${duration}ms`
      );

      // Test that data is properly formatted
      const summary = getAppleHealthSummary(healthData);
      const hasSummary = Object.keys(summary).length > 0;
      this.addResult(
        'Data Summary Generation',
        hasSummary,
        hasSummary ? 'Summary generated successfully' : 'Failed to generate summary'
      );

    } catch (error) {
      this.addResult(
        'Async Data Fetch',
        false,
        `Error fetching data: ${error}`
      );
    }
  }

  /**
   * Test 3: EPC Score Conversion
   */
  async testEPCScoreConversion(): Promise<void> {
    this.log('\n📊 Testing EPC Score Conversion...', colors.cyan);
    
    try {
      const healthData = generateMockAppleHealthData();
      const adjustments = convertAppleHealthToEPCAdjustments(healthData);

      // Validate adjustment ranges
      const energyValid = adjustments.energyAdjustment >= -20 && adjustments.energyAdjustment <= 20;
      const purposeValid = adjustments.purposeAdjustment >= -15 && adjustments.purposeAdjustment <= 15;
      const connectionValid = adjustments.connectionAdjustment >= -15 && adjustments.connectionAdjustment <= 15;

      this.addResult(
        'EPC Energy Adjustment',
        energyValid,
        `Energy adjustment: ${adjustments.energyAdjustment} (${energyValid ? 'valid' : 'out of range'})`
      );

      this.addResult(
        'EPC Purpose Adjustment',
        purposeValid,
        `Purpose adjustment: ${adjustments.purposeAdjustment} (${purposeValid ? 'valid' : 'out of range'})`
      );

      this.addResult(
        'EPC Connection Adjustment',
        connectionValid,
        `Connection adjustment: ${adjustments.connectionAdjustment} (${connectionValid ? 'valid' : 'out of range'})`
      );

    } catch (error) {
      this.addResult(
        'EPC Score Conversion',
        false,
        `Error converting to EPC scores: ${error}`
      );
    }
  }

  /**
   * Test 4: Data Consistency
   */
  async testDataConsistency(): Promise<void> {
    this.log('\n🔄 Testing Data Consistency...', colors.cyan);
    
    try {
      // Generate multiple data sets and check for consistency
      const dataSets = [];
      for (let i = 0; i < 5; i++) {
        dataSets.push(generateMockAppleHealthData());
      }

      // Check that all data sets have the same structure
      const firstDataSet = dataSets[0];
      const allConsistent = dataSets.every(data => 
        Object.keys(data).length === Object.keys(firstDataSet).length
      );

      this.addResult(
        'Data Structure Consistency',
        allConsistent,
        allConsistent ? 'All data sets have consistent structure' : 'Data structure inconsistency detected'
      );

      // Check that timestamps are recent
      const now = new Date();
      const allRecent = dataSets.every(data => 
        (now.getTime() - data.lastUpdated.getTime()) < 1000 // Within 1 second
      );

      this.addResult(
        'Timestamp Consistency',
        allRecent,
        allRecent ? 'All timestamps are recent' : 'Some timestamps are outdated'
      );

    } catch (error) {
      this.addResult(
        'Data Consistency',
        false,
        `Error testing data consistency: ${error}`
      );
    }
  }

  /**
   * Test 5: Real HealthKit Integration (Framework)
   */
  async testRealHealthKitFramework(): Promise<void> {
    this.log('\n🍎 Testing Real HealthKit Integration Framework...', colors.cyan);
    
    // This is a framework for when you have real HealthKit access
    const healthKitAvailable = await this.checkHealthKitAvailability();
    
    if (healthKitAvailable) {
      this.log('✅ HealthKit is available - implementing real data reading...', colors.green);
      await this.readRealHealthKitData();
    } else {
      this.log('⚠️  HealthKit not available - using mock data framework', colors.yellow);
      this.addResult(
        'HealthKit Availability',
        false,
        'HealthKit not available - using mock data instead'
      );
    }
  }

  /**
   * Check if HealthKit is available (placeholder for real implementation)
   */
  private async checkHealthKitAvailability(): Promise<boolean> {
    // In a real implementation, this would check for:
    // 1. iOS device
    // 2. HealthKit framework availability
    // 3. User permissions
    // 4. Apple Developer account access
    
    // For now, return false to use mock data
    return false;
  }

  /**
   * Read real HealthKit data (placeholder for real implementation)
   */
  private async readRealHealthKitData(): Promise<void> {
    // This is where you would implement real HealthKit data reading
    // Example structure:
    
    /*
    try {
      // Request HealthKit permissions
      const permissions = await requestHealthKitPermissions();
      
      // Read different data types
      const stepsData = await readStepsData();
      const heartRateData = await readHeartRateData();
      const sleepData = await readSleepData();
      const activityData = await readActivityData();
      const mindfulnessData = await readMindfulnessData();
      const moodData = await readMoodData();
      
      // Combine into AppleHealthData structure
      const realHealthData: AppleHealthData = {
        steps: stepsData,
        activityRings: activityData,
        sleep: sleepData,
        heartRate: heartRateData,
        mindfulness: mindfulnessData,
        mood: moodData,
        workouts: await readWorkoutData(),
        environmental: await readEnvironmentalData(),
        lastUpdated: new Date()
      };
      
      this.addResult(
        'Real HealthKit Data',
        true,
        'Successfully read real HealthKit data'
      );
      
    } catch (error) {
      this.addResult(
        'Real HealthKit Data',
        false,
        `Error reading real HealthKit data: ${error}`
      );
    }
    */
    
    this.addResult(
      'Real HealthKit Implementation',
      false,
      'Real HealthKit integration not yet implemented - requires Apple Developer account'
    );
  }

  /**
   * Display comprehensive test results
   */
  displayResults(): void {
    this.log('\n📋 Test Results Summary', colors.bright);
    this.log('='.repeat(50), colors.cyan);
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);
    
    this.log(`\nTotal Tests: ${total}`, colors.blue);
    this.log(`Passed: ${passed}`, colors.green);
    this.log(`Failed: ${total - passed}`, colors.red);
    this.log(`Success Rate: ${percentage}%`, percentage >= 80 ? colors.green : colors.yellow);
    
    if (total - passed > 0) {
      this.log('\n❌ Failed Tests:', colors.red);
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          this.log(`  • ${result.testName}: ${result.message}`, colors.red);
        });
    }
    
    this.log('\n🎯 Next Steps:', colors.bright);
    this.log('1. For real HealthKit integration, you need:', colors.blue);
    this.log('   • Apple Developer account', colors.blue);
    this.log('   • iOS device with HealthKit', colors.blue);
    this.log('   • Proper app permissions', colors.blue);
    this.log('2. Replace mock functions with real HealthKit calls', colors.blue);
    this.log('3. Test on actual iOS device', colors.blue);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    this.log('🚀 Starting HealthKit Data Tests...', colors.bright);
    this.log('='.repeat(50), colors.cyan);
    
    await this.testMockDataGeneration();
    await this.testAsyncDataFetching();
    await this.testEPCScoreConversion();
    await this.testDataConsistency();
    await this.testRealHealthKitFramework();
    
    this.displayResults();
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const tester = new HealthKitDataTester();
  await tester.runAllTests();
}

// Run the tests if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export { HealthKitDataTester };
