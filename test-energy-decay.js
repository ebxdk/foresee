// Test Energy Decay System
// Run this to test the new energy decay functionality

import { runAllEnergyDecayTests } from './utils/energyDecayTest';

console.log('🚀 Starting Energy Decay System Tests...\n');

// Run all tests
runAllEnergyDecayTests()
  .then(() => {
    console.log('\n✅ All tests completed successfully!');
    console.log('The energy decay system is ready for use.');
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
  });
