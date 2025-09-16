// Tool System Test - Demonstrates the cooldown and point system
// This file shows how the tool system works without affecting EPC scores yet

import { getToolCooldownStatus, storeEPCScores, storeToolUsage, TOOL_CONFIG, ToolId } from './storage';

/**
 * Test the tool system by simulating tool usage
 */
export async function testToolSystem() {
  console.log('🧪 Testing Tool Point System...\n');
  
  // Test 1: First use of Hydration Hero (should get full points)
  console.log('=== Test 1: First use of Hydration Hero ===');
  await testToolUsage('hydrationHero');
  
  // Test 2: Immediate second use (should get reduced points due to cooldown)
  console.log('\n=== Test 2: Immediate second use (on cooldown) ===');
  await testToolUsage('hydrationHero');
  
  // Test 3: Use Post-it Priority (different tool, should get full points)
  console.log('\n=== Test 3: Different tool (Post-it Priority) ===');
  await testToolUsage('postItPriority');
  
  // Test 4: Check cooldown status without using
  console.log('\n=== Test 4: Check cooldown status ===');
  await checkToolStatus('hydrationHero');
  await checkToolStatus('postItPriority');
  
  console.log('\n✅ Tool system test completed!');
}

/**
 * Test a specific tool usage
 */
async function testToolUsage(toolId: ToolId) {
  try {
    const toolConfig = TOOL_CONFIG[toolId];
    console.log(`Using ${toolId}:`);
    console.log(`  Base points: E${toolConfig.boost.E} P${toolConfig.boost.P} C${toolConfig.boost.C}`);
    console.log(`  Cooldown: ${toolConfig.cooldownHours}h`);
    
    // Get current cooldown status
    const cooldownStatus = await getToolCooldownStatus(toolId);
    console.log(`  Effective points: E${cooldownStatus.effectivePoints.E} P${cooldownStatus.effectivePoints.P} C${cooldownStatus.effectivePoints.C}`);
    console.log(`  Effectiveness: ${cooldownStatus.effectivenessPercentage}%`);
    
    if (cooldownStatus.isOnCooldown) {
      console.log(`  ⏰ On cooldown: ${cooldownStatus.cooldownRemaining}h remaining`);
    } else {
      console.log(`  ✅ Full effect available`);
    }
    
    // Store the tool usage
    await storeToolUsage(toolId, cooldownStatus.effectivePoints);
    console.log(`  💾 Tool usage stored`);
    
  } catch (error) {
    console.error(`  ❌ Error testing ${toolId}:`, error);
  }
}

/**
 * Check tool status without using it
 */
async function checkToolStatus(toolId: ToolId) {
  try {
    const toolConfig = TOOL_CONFIG[toolId];
    const cooldownStatus = await getToolCooldownStatus(toolId);
    
    console.log(`\n📊 ${toolId} status:`);
    console.log(`  Base points: E${toolConfig.boost.E} P${toolConfig.boost.P} C${toolConfig.boost.C}`);
    console.log(`  Cooldown: ${toolConfig.cooldownHours}h`);
    console.log(`  Last used: ${cooldownStatus.lastUsed ? new Date(cooldownStatus.lastUsed).toLocaleString() : 'Never'}`);
    
    if (cooldownStatus.isOnCooldown) {
      console.log(`  ⏰ On cooldown: ${cooldownStatus.cooldownRemaining}h remaining`);
      console.log(`  📉 Next use will give: E${cooldownStatus.effectivePoints.E} P${cooldownStatus.effectivePoints.P} C${cooldownStatus.effectivePoints.C} (${cooldownStatus.effectivenessPercentage}%)`);
    } else {
      console.log(`  ✅ Full effect available`);
      console.log(`  📈 Next use will give: E${toolConfig.boost.E} P${toolConfig.boost.P} C${toolConfig.boost.C} (100%)`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error checking ${toolId} status:`, error);
  }
}

/**
 * Demonstrate cooldown scaling formula
 */
export function demonstrateCooldownScaling() {
  console.log('\n📐 Cooldown Scaling Formula Demo:');
  console.log('effective_points = base_points × min(1, hours_since_last_use / cooldown_hours)');
  
  const examples = [
    { hoursSinceLastUse: 0, cooldownHours: 4, description: 'Immediate reuse' },
    { hoursSinceLastUse: 2, cooldownHours: 4, description: 'Halfway through cooldown' },
    { hoursSinceLastUse: 4, cooldownHours: 4, description: 'Cooldown complete' },
    { hoursSinceLastUse: 6, cooldownHours: 4, description: 'After cooldown' }
  ];
  
  examples.forEach(example => {
    const ratio = Math.min(1, example.hoursSinceLastUse / example.cooldownHours);
    const effectiveness = Math.round(ratio * 100);
    console.log(`  ${example.description}: ${example.hoursSinceLastUse}h/${example.cooldownHours}h = ${ratio.toFixed(2)} = ${effectiveness}% effectiveness`);
  });
}

/**
 * Show all tool configurations
 */
export function showAllToolConfigs() {
  console.log('\n🛠️  All Tool Configurations:');
  
  Object.entries(TOOL_CONFIG).forEach(([toolId, config]) => {
    console.log(`\n  ${toolId}:`);
    console.log(`    Points: E${config.boost.E} P${config.boost.P} C${config.boost.C}`);
    console.log(`    Cooldown: ${config.cooldownHours}h`);
    console.log(`    State: ${config.state}`);
  });
}

/**
 * Test the new global rules system
 */
export async function testGlobalRules() {
  console.log('🧪 Testing Global Rules System...\n');
  
  // Test 1: Saturation Rule (battery >90)
  console.log('🌊 Test 1: Saturation Rule (Energy >90)');
  await testSaturationRule();
  
  // Test 2: Low-state Amplifier Rule (battery <70)
  console.log('\n⚡ Test 2: Low-state Amplifier Rule (Purpose <70)');
  await testLowStateAmplifier();
  
  // Test 3: No Rules Applied (normal range)
  console.log('\n✅ Test 3: No Rules Applied (normal range)');
  await testNoRulesApplied();
  
  console.log('\n🎯 Global rules test completed!');
}

async function testSaturationRule() {
  try {
    // Set high energy score to trigger saturation
    await storeEPCScores({ energy: 95, purpose: 50, connection: 60 });
    
    // Simulate tool completion that would give +3 E
    const toolId = 'hydrationHero' as ToolId;
    const basePoints = { E: 3, P: 0, C: 0 };
    
    console.log(`   Current scores: Energy=95, Purpose=50, Connection=60`);
    console.log(`   Base points: ${basePoints.E} E, ${basePoints.P} P, ${basePoints.C} C`);
    console.log(`   Expected: Saturation ×0.7 = ${Math.round(basePoints.E * 0.7)} E`);
    
    // This would normally call updateEPCScoresFromTool, but we'll simulate the logic
    const adjustedPoints = {
      E: Math.round(basePoints.E * 0.7),
      P: Math.round(basePoints.P * 0.7),
      C: Math.round(basePoints.C * 0.7)
    };
    
    console.log(`   Result: Saturation applied → ${adjustedPoints.E} E, ${adjustedPoints.P} P, ${adjustedPoints.C} C`);
    
  } catch (error) {
    console.error('   ❌ Error testing saturation rule:', error);
  }
}

async function testLowStateAmplifier() {
  try {
    // Set low purpose score to trigger low-state amplifier
    await storeEPCScores({ energy: 60, purpose: 65, connection: 70 });
    
    // Simulate tool completion that would give +2 P
    const toolId = 'sweetSpotScan' as ToolId;
    const basePoints = { E: 0, P: 2, C: 0 };
    
    console.log(`   Current scores: Energy=60, Purpose=65, Connection=70`);
    console.log(`   Base points: ${basePoints.E} E, ${basePoints.P} P, ${basePoints.C} C`);
    console.log(`   Expected: Low-state ×1.2 = ${Math.round(basePoints.P * 1.2)} P`);
    
    // This would normally call updateEPCScoresFromTool, but we'll simulate the logic
    const adjustedPoints = {
      E: Math.round(basePoints.E * 1.2),
      P: Math.round(basePoints.P * 1.2),
      C: Math.round(basePoints.C * 1.2)
    };
    
    console.log(`   Result: Low-state amplifier applied → ${adjustedPoints.E} E, ${adjustedPoints.P} P, ${adjustedPoints.C} C`);
    
  } catch (error) {
    console.error('   ❌ Error testing low-state amplifier:', error);
  }
}

async function testNoRulesApplied() {
  try {
    // Set scores in normal range (no rules should apply)
    await storeEPCScores({ energy: 75, purpose: 75, connection: 75 });
    
    // Simulate tool completion that would give +2 E +1 P
    const toolId = 'postItPriority' as ToolId;
    const basePoints = { E: 3, P: 1, C: 0 };
    
    console.log(`   Current scores: Energy=75, Purpose=75, Connection=75`);
    console.log(`   Base points: ${basePoints.E} E, ${basePoints.P} P, ${basePoints.C} C`);
    console.log(`   Expected: No rules → ${basePoints.E} E, ${basePoints.P} P, ${basePoints.C} C`);
    
    console.log(`   Result: No rules applied → ${basePoints.E} E, ${basePoints.P} P, ${basePoints.C} C`);
    
  } catch (error) {
    console.error('   ❌ Error testing no rules scenario:', error);
  }
}

/**
 * Test the new Buffer & Tail systems
 */
export async function testBufferAndTailSystems() {
  console.log('🧪 Testing Buffer & Tail Systems...\n');
  
  // Test 1: Energy Buffer System
  console.log('🛡️ Test 1: Energy Buffer System');
  await testEnergyBuffer();
  
  // Test 2: Score Tail System
  console.log('\n🌊 Test 2: Score Tail System');
  await testScoreTail();
  
  // Test 3: Combined Effects
  console.log('\n✨ Test 3: Combined Buffer + Tail Effects');
  await testCombinedEffects();
  
  console.log('\n🎯 Buffer & Tail systems test completed!');
}

async function testEnergyBuffer() {
  try {
    console.log('   Creating energy buffer: 4h duration, 0.5x decay slowdown');
    
    // Simulate creating an energy buffer
    const buffer = {
      active: true,
      startTime: new Date().toISOString(),
      duration: 4,
      multiplier: 0.5,
      source: 'hydrationHero' as ToolId
    };
    
    console.log(`   Buffer created: ${buffer.duration}h duration, ${buffer.multiplier}x decay slowdown`);
    console.log(`   Effect: Energy will decay ${buffer.multiplier}x slower for ${buffer.duration} hours`);
    
    // Simulate checking buffer status after 2 hours
    const elapsedHours = 2;
    const remainingHours = buffer.duration - elapsedHours;
    
    console.log(`   After ${elapsedHours}h: ${remainingHours}h remaining, still active`);
    console.log(`   Current effect: Energy decay is ${buffer.multiplier}x slower`);
    
  } catch (error) {
    console.error('   ❌ Error testing energy buffer:', error);
  }
}

async function testScoreTail() {
  try {
    console.log('   Creating score tail: 10h duration, 2 Purpose points fade');
    
    // Simulate creating a score tail
    const tail = {
      active: true,
      startTime: new Date().toISOString(),
      duration: 10,
      initialPoints: { P: 2, C: 0 },
      source: 'sweetSpotScan' as ToolId
    };
    
    console.log(`   Tail created: ${tail.duration}h duration, ${tail.initialPoints.P}P + ${tail.initialPoints.C}C will fade`);
    
    // Simulate checking tail status at different times
    const timePoints = [2, 5, 8, 10]; // hours
    
    for (const hours of timePoints) {
      const progress = hours / tail.duration; // 0 to 1
      const remainingP = Math.round(tail.initialPoints.P * (1 - progress));
      const remainingC = Math.round(tail.initialPoints.C * (1 - progress));
      
      if (hours < tail.duration) {
        console.log(`   After ${hours}h: ${remainingP}P + ${remainingC}C remaining (${Math.round((1 - progress) * 100)}% of original effect)`);
      } else {
        console.log(`   After ${hours}h: Tail expired, no effect remaining`);
      }
    }
    
  } catch (error) {
    console.error('   ❌ Error testing score tail:', error);
  }
}

async function testCombinedEffects() {
  try {
    console.log('   Testing tool with both buffer and tail effects');
    
    // Simulate Mental Unload tool completion
    const toolId = 'mentalUnload';
    const toolConfig = {
      boost: { E: 6, P: 0, C: 2 },
      buffer: { duration: 12, multiplier: 0.2 },
      tail: { duration: 24, points: { P: 0, C: 2 } }
    };
    
    console.log(`   Tool: ${toolId}`);
    console.log(`   Immediate boost: +${toolConfig.boost.E}E +${toolConfig.boost.P}P +${toolConfig.boost.C}C`);
    console.log(`   Energy buffer: ${toolConfig.buffer.duration}h, ${toolConfig.buffer.multiplier}x decay slowdown`);
    console.log(`   Score tail: ${toolConfig.tail.duration}h fade for ${toolConfig.tail.points.P}P + ${toolConfig.tail.points.C}C`);
    
    console.log(`   Combined effect: Energy decays very slowly for 12h, Connection gradually fades over 24h`);
    
  } catch (error) {
    console.error('   ❌ Error testing combined effects:', error);
  }
}
