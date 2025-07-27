// Simple script to test current constraint and provide guidance
// Run with: node scripts/test-constraint.js

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://hgqcuesummlopvgfnces.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncWN1ZXN1bW1sb3B2Z2ZuY2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDI2MDQsImV4cCI6MjA2OTA3ODYwNH0.G7y7Ep2whkmtMZ-fHQr3VCGweQyRv4MS6AkpkDBtw08';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConstraint() {
  console.log('🔍 Testing Supabase constraint for evaluation_system field...');
  
  const testRecords = [
    { evaluationSystem: 'legacy', description: 'Legacy evaluation system' },
    { evaluationSystem: 'traditional-sca', description: 'Traditional SCA cupping protocol' },
    { evaluationSystem: 'cva-descriptive', description: 'CVA descriptive assessment' },
    { evaluationSystem: 'cva-affective', description: 'CVA affective assessment' },
    { evaluationSystem: 'quick-tasting', description: 'Quick tasting evaluation (THE PROBLEM)' },
    { evaluationSystem: null, description: 'NULL value' }
  ];
  
  console.log('📊 Testing each evaluation system value:\n');
  
  for (const test of testRecords) {
    const testId = randomUUID();
    
    try {
      const { error } = await supabase
        .from('recipes')
        .insert({
          recipe_id: testId,
          recipe_name: `Test Recipe - ${test.evaluationSystem || 'NULL'}`,
          origin: 'Test Origin',
          processing_method: 'Test Processing',
          grinder_model: 'Test Grinder',
          grinder_unit: 'Test Unit',
          coffee_beans: 20,
          water: 300,
          coffee_water_ratio: 15,
          evaluation_system: test.evaluationSystem
        });
      
      if (error) {
        if (error.message.includes('recipes_evaluation_system_check')) {
          console.log(`❌ ${test.evaluationSystem || 'NULL'}: REJECTED by constraint`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`⚠️  ${test.evaluationSystem || 'NULL'}: OTHER ERROR - ${error.message}`);
        }
      } else {
        console.log(`✅ ${test.evaluationSystem || 'NULL'}: ACCEPTED`);
        // Clean up successful inserts
        await supabase.from('recipes').delete().eq('recipe_id', testId);
      }
    } catch (err) {
      console.log(`💥 ${test.evaluationSystem || 'NULL'}: EXCEPTION - ${err.message}`);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('If quick-tasting is REJECTED, the constraint needs to be updated.');
  console.log('To fix this:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Navigate to Database > Tables > recipes');
  console.log('3. Find the evaluation_system column');
  console.log('4. Edit the constraint to include "quick-tasting"');
  console.log('5. Or run this SQL in the SQL Editor:');
  console.log('');
  console.log('   ALTER TABLE recipes DROP CONSTRAINT recipes_evaluation_system_check;');
  console.log('   ALTER TABLE recipes ADD CONSTRAINT recipes_evaluation_system_check');
  console.log(`     CHECK (evaluation_system IN ('traditional-sca', 'cva-descriptive', 'cva-affective', 'quick-tasting', 'legacy'));`);
}

testConstraint().catch(console.error);