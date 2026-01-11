-- Migration: Update student_enrollments and student_session_progress tables
-- This script aligns the tables with the required schema definitions

-- ============================================================
-- Update student_enrollments table
-- ============================================================

-- Drop the old table and recreate with new schema
DROP TABLE IF EXISTS student_enrollments CASCADE;

CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    current_session_id UUID REFERENCES sessions(id),
    overall_progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    UNIQUE(student_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations
CREATE POLICY "Allow all operations on student_enrollments" ON student_enrollments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX idx_student_enrollments_current_session ON student_enrollments(current_session_id);
CREATE INDEX idx_student_enrollments_status ON student_enrollments(status);

-- ============================================================
-- Update student_session_progress table
-- ============================================================

-- Drop the old table and recreate with new schema
DROP TABLE IF EXISTS student_session_progress CASCADE;

CREATE TABLE student_session_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'current', 'completed', 'mastered')),
    mastery_score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE student_session_progress ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations
CREATE POLICY "Allow all operations on student_session_progress" ON student_session_progress
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_student_session_progress_student_id ON student_session_progress(student_id);
CREATE INDEX idx_student_session_progress_session_id ON student_session_progress(session_id);
CREATE INDEX idx_student_session_progress_status ON student_session_progress(status);
CREATE INDEX idx_student_session_progress_student_session ON student_session_progress(student_id, session_id);
