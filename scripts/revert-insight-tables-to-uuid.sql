-- Migration script to revert student_id columns back to UUID (proper approach)
-- This maintains consistency with other tables like student_enrollments, student_session_progress, etc.
-- Run this AFTER creating the tables with VARCHAR to convert them back to UUID

-- Note: This will fail if there are non-UUID values in the columns
-- You may need to delete existing data first if you used "student_123"

-- Revert insight_engagement
ALTER TABLE IF EXISTS insight_engagement
ALTER COLUMN student_id TYPE UUID USING student_id::uuid;

-- Revert insight_feedback  
ALTER TABLE IF EXISTS insight_feedback
ALTER COLUMN student_id TYPE UUID USING student_id::uuid;

-- Revert insight_shares
ALTER TABLE IF EXISTS insight_shares
ALTER COLUMN student_id TYPE UUID USING student_id::uuid;

-- Revert insight_learning_impact
ALTER TABLE IF EXISTS insight_learning_impact
ALTER COLUMN student_id TYPE UUID USING student_id::uuid;

-- Revert student_insight_views (this table was created with UUID originally)
-- No change needed

-- Recreate indexes for performance
CREATE INDEX IF NOT EXISTS idx_insight_engagement_student_uuid ON insight_engagement(student_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_student_uuid ON insight_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_insight_shares_student_uuid ON insight_shares(student_id);
CREATE INDEX IF NOT EXISTS idx_insight_learning_impact_student_uuid ON insight_learning_impact(student_id);

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'student_id'
  AND table_name LIKE 'insight%'
ORDER BY table_name;
