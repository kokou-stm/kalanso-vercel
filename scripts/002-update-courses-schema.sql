-- Add missing fields to courses table for Academic Space UI requirements

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS code VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS term VARCHAR(50);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Add a view to easily fetch courses with enrollment count
CREATE OR REPLACE VIEW courses_with_stats AS
SELECT 
  c.id,
  c.title,
  c.code,
  c.description,
  c.status,
  c.term,
  c.created_at,
  c.updated_at,
  d.name as domain,
  COUNT(DISTINCT ce.student_id) as enrolled_students,
  COUNT(DISTINCT cl.id) as class_count
FROM courses c
LEFT JOIN domains d ON c.domain_id = d.id
LEFT JOIN class_enrollments ce ON c.id = ce.course_id AND ce.enrollment_status = 'active'
LEFT JOIN classes cl ON c.id = cl.course_id
GROUP BY c.id, c.title, c.code, c.description, c.status, c.term, c.created_at, c.updated_at, d.name;
