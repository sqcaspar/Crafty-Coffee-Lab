// Migration script to fix evaluation_system constraint
// Run with: npx ts-node scripts/migrate-constraint.ts

import { supabase } from '../src/database/supabase';

async function runMigration() {
  console.log('🚀 Starting constraint migration...');
  
  try {
    const client = supabase.getClient();
    
    console.log('📋 Current constraint allows: traditional-sca, cva-descriptive, cva-affective, legacy');
    console.log('🎯 Goal: Add quick-tasting to allowed values');
    
    // Test current constraint by trying to insert with quick-tasting
    console.log('🧪 Testing current constraint...');
    const testId = crypto.randomUUID();
    
    try {
      const { error } = await client
        .from('recipes')
        .insert({
          recipe_id: testId,
          recipe_name: 'Test Recipe - Quick Tasting',
          origin: 'Test Origin',
          processing_method: 'Test Processing',
          grinder_model: 'Test Grinder',
          grinder_unit: 'Test Unit',
          coffee_beans: 20,
          water: 300,
          coffee_water_ratio: 15,
          evaluation_system: 'quick-tasting'
        });
      
      if (error && error.message.includes('recipes_evaluation_system_check')) {
        console.log('❌ Confirmed: Constraint rejects quick-tasting');
        console.log('📝 Error:', error.message);
      } else if (error) {
        console.log('⚠️  Different error occurred:', error.message);
      } else {
        console.log('✅ Surprising: quick-tasting was accepted! Cleaning up...');
        await client.from('recipes').delete().eq('recipe_id', testId);
        console.log('🤔 Constraint might already be fixed. Let me verify...');
      }
    } catch (err) {
      console.log('❌ Test insertion failed as expected');
    }
    
    // Now try to fix the constraint using raw SQL
    console.log('🔧 Attempting to fix constraint...');
    
    // Method 1: Try using rpc if available
    try {
      console.log('📡 Trying RPC approach...');
      
      const { error: rpcError } = await client.rpc('exec_sql', {
        query: `
          ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_evaluation_system_check;
          ALTER TABLE recipes ADD CONSTRAINT recipes_evaluation_system_check 
            CHECK (evaluation_system IN ('traditional-sca', 'cva-descriptive', 'cva-affective', 'quick-tasting', 'legacy'));
        `
      });
      
      if (rpcError) {
        console.log('❌ RPC approach failed:', rpcError.message);
      } else {
        console.log('✅ RPC approach succeeded!');
      }
    } catch (err) {
      console.log('❌ RPC not available, trying alternative approach...');
    }
    
    // Method 2: Try inserting a valid record first to test
    console.log('🧪 Testing with legacy value...');
    
    const legacyTestId = crypto.randomUUID();
    const { error: legacyError } = await client
      .from('recipes')
      .insert({
        recipe_id: legacyTestId,
        recipe_name: 'Test Recipe - Legacy',
        origin: 'Test Origin',
        processing_method: 'Test Processing',
        grinder_model: 'Test Grinder',
        grinder_unit: 'Test Unit',
        coffee_beans: 20,
        water: 300,
        coffee_water_ratio: 15,
        evaluation_system: 'legacy'
      });
    
    if (legacyError) {
      console.error('❌ Even legacy value failed:', legacyError.message);
    } else {
      console.log('✅ Legacy value works fine');
      // Clean up
      await client.from('recipes').delete().eq('recipe_id', legacyTestId);
    }
    
    console.log('');
    console.log('🔍 Migration Summary:');
    console.log('The constraint needs to be updated manually in Supabase dashboard.');
    console.log('Go to: Supabase Dashboard > Database > Tables > recipes');
    console.log('Find the evaluation_system column and update its constraint to:');
    console.log(`CHECK (evaluation_system IN ('traditional-sca', 'cva-descriptive', 'cva-affective', 'quick-tasting', 'legacy'))`);
    
  } catch (error) {
    console.error('💥 Migration script failed:', error);
  }
}

runMigration();