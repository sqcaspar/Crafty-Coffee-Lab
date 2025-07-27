// Migration script to add 'quick-tasting' to evaluation_system constraint
// Run with: node scripts/migrate-evaluation-system.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting migration: Add quick-tasting to evaluation_system constraint');
  
  try {
    // Step 1: Check current constraint
    console.log('📋 Checking current constraint...');
    const { data: currentConstraints, error: checkError } = await supabase
      .rpc('get_constraint_definition', { 
        table_name: 'recipes', 
        constraint_name: 'recipes_evaluation_system_check' 
      });
    
    if (checkError) {
      console.log('⚠️  Could not check current constraint (this is normal):', checkError.message);
    } else {
      console.log('📋 Current constraint:', currentConstraints);
    }

    // Step 2: Drop existing constraint
    console.log('🗑️  Dropping existing constraint...');
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_evaluation_system_check' 
      });
    
    if (dropError) {
      console.error('❌ Failed to drop constraint:', dropError);
      throw dropError;
    }
    console.log('✅ Constraint dropped successfully');

    // Step 3: Add new constraint with quick-tasting
    console.log('➕ Adding new constraint with quick-tasting...');
    const { error: addError } = await supabase
      .rpc('exec_sql', { 
        sql: `ALTER TABLE recipes ADD CONSTRAINT recipes_evaluation_system_check 
              CHECK (evaluation_system IN ('traditional-sca', 'cva-descriptive', 'cva-affective', 'quick-tasting', 'legacy'))` 
      });
    
    if (addError) {
      console.error('❌ Failed to add new constraint:', addError);
      throw addError;
    }
    console.log('✅ New constraint added successfully');

    // Step 4: Test the constraint
    console.log('🧪 Testing constraint with quick-tasting value...');
    const testId = crypto.randomUUID();
    
    // Try to insert a test record with quick-tasting
    const { error: testError } = await supabase
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
    
    if (testError) {
      console.error('❌ Test insertion failed:', testError);
      throw testError;
    }
    
    // Clean up test record
    await supabase.from('recipes').delete().eq('recipe_id', testId);
    console.log('✅ Constraint test passed - quick-tasting value accepted');

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Constraint now accepts: traditional-sca, cva-descriptive, cva-affective, quick-tasting, legacy');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();