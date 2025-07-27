-- Migration: Add 'quick-tasting' to evaluation_system constraint
-- Issue: recipes_evaluation_system_check constraint missing 'quick-tasting' value
-- Date: 2025-07-27

-- Drop the existing constraint
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_evaluation_system_check;

-- Add the new constraint with 'quick-tasting' included
ALTER TABLE recipes ADD CONSTRAINT recipes_evaluation_system_check 
  CHECK (evaluation_system IN ('traditional-sca', 'cva-descriptive', 'cva-affective', 'quick-tasting', 'legacy'));

-- Verify the constraint was added successfully
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'recipes_evaluation_system_check';