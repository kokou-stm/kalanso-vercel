-- Fix the triggers column in insights table to use array default

-- Update existing records with empty object to empty array
UPDATE insights 
SET triggers = '[]'::jsonb 
WHERE triggers = '{}'::jsonb OR triggers IS NULL;

-- Set default value for future inserts
ALTER TABLE insights 
ALTER COLUMN triggers SET DEFAULT '[]'::jsonb;

-- Optional: Add example triggers for the existing insight
UPDATE insights 
SET triggers = '[
  {
    "type": "mastery_milestone",
    "condition": {
      "glo_id": "glo_ml_001",
      "mastery_level": "remember",
      "message": "You just learned the basics of backpropagation!"
    }
  },
  {
    "type": "progress_threshold",
    "condition": {
      "cells_mastered": 3,
      "message": "You''re making great progress! Here''s how backprop connects to real AI applications."
    }
  }
]'::jsonb
WHERE id = 'chatgpt-backpropagation';
