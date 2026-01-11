-- Reordered tables to create referenced tables first

-- TENANTS (multi-tenancy support)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DOMAINS (academic domains/disciplines)
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROGRAMS (degree programs or curricula)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- USERS (students and instructors)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'student', 'instructor', 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- COURSES (instructor-facing container)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  domain_id UUID REFERENCES domains(id),
  program_id UUID REFERENCES programs(id), -- optional
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  bloom_focus VARCHAR(50), -- 'understand_apply_analyze'
  is_published BOOLEAN DEFAULT false,
  enrollment_mode VARCHAR(50), -- 'open', 'approval_required', 'closed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CLASSES (instructor-defined teaching units, e.g., weekly classes)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  class_number INTEGER NOT NULL, -- 1, 2, 3, ...
  title VARCHAR(255) NOT NULL,
  description TEXT,
  schedule_week INTEGER, -- which week (1-16 for semester)
  schedule_date DATE, -- specific date if applicable
  sequence_order INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, class_number)
);

-- SESSIONS (fine-grained learning structure within a class)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  session_number VARCHAR(10) NOT NULL, -- "1.1", "1.2", etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_minutes INTEGER,
  sequence_order INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, session_number)
);

-- LEARNING_UNITS (mastery-based concept groups)
CREATE TABLE IF NOT EXISTS learning_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  title VARCHAR(255) NOT NULL,
  concept_focus VARCHAR(255), -- e.g., "Binary Search Algorithm"
  bloom_cognitive VARCHAR(50), -- 'remember', 'understand', 'apply', etc.
  bloom_knowledge VARCHAR(50), -- 'factual', 'conceptual', 'procedural', 'metacognitive'
  mastery_threshold DECIMAL(3,2) DEFAULT 0.80,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LEARNING_OBJECTS (atomic Bloom-aligned elements)
CREATE TABLE IF NOT EXISTS learning_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_unit_id UUID REFERENCES learning_units(id),
  lo_type VARCHAR(50), -- 'micro', 'lesson', 'assessment_only'
  title VARCHAR(255) NOT NULL,
  learning_objective JSONB NOT NULL, -- {statement, bloom{cognitive_process, level, knowledge_dimension}, success_criteria[]}
  content_items JSONB DEFAULT '[]',
  assessment_items JSONB DEFAULT '[]',
  mastery_threshold DECIMAL(3,2) DEFAULT 0.80,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CONTENT_MAPPINGS (links external content to sessions)
CREATE TABLE IF NOT EXISTS content_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  content_type VARCHAR(50), -- 'slides', 'video', 'reading', 'link', 'exercise'
  content_source VARCHAR(50), -- 'upload', 'lms_import', 'external_link'
  content_uri VARCHAR(500), -- file path or URL
  content_metadata JSONB, -- {title, file_size, upload_date, etc.}
  sequence_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PREREQUISITES (defines unlock logic)
CREATE TABLE IF NOT EXISTS prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50), -- 'class', 'session', 'learning_unit'
  entity_id UUID,
  prerequisite_type VARCHAR(50), -- 'class', 'session', 'learning_unit'
  prerequisite_id UUID,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- STUDENT_PROGRESS (tracks mastery at all levels)
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  entity_type VARCHAR(50), -- 'class', 'session', 'learning_unit', 'learning_object'
  entity_id UUID,
  status VARCHAR(50), -- 'not_started', 'in_progress', 'completed', 'mastered'
  mastery_score DECIMAL(5,2), -- 0.00 to 100.00
  attempts_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  mastered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, entity_type, entity_id)
);

-- CLASS_ENROLLMENTS (student enrollment in courses and classes)
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrollment_status VARCHAR(50), -- 'pending', 'active', 'completed', 'withdrawn'
  enrollment_date TIMESTAMP DEFAULT NOW(),
  completion_date TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_programs_tenant ON programs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_courses_tenant ON courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_course ON classes(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_class ON sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_learning_units_session ON learning_units(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_objects_unit ON learning_objects(learning_unit_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_course ON class_enrollments(course_id);
