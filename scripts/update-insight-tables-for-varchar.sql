-- Migration script to update student_id columns from UUID to VARCHAR
-- and add missing share_platform column to insight_engagement
-- Run this AFTER the initial create-insight-feedback-tables.sql

-- Adding share_platform column to insight_engagement table
ALTER TABLE insight_engagement 
  ADD COLUMN IF NOT EXISTS share_platform VARCHAR(50);

-- Update insight_feedback table
ALTER TABLE insight_feedback 
  ALTER COLUMN student_id TYPE VARCHAR(255);

-- Update insight_engagement table  
ALTER TABLE insight_engagement
  ALTER COLUMN student_id TYPE VARCHAR(255);

-- Update insight_shares table
ALTER TABLE insight_shares
  ALTER COLUMN student_id TYPE VARCHAR(255);

-- Update insight_learning_impact table
ALTER TABLE insight_learning_impact
  ALTER COLUMN student_id TYPE VARCHAR(255);
