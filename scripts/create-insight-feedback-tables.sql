-- Real-World Insight Feedback System
-- Complete schema for collecting and analyzing student feedback

-- Main feedback table (explicit feedback)
CREATE TABLE IF NOT EXISTS insight_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id VARCHAR(100) NOT NULL,
  student_id VARCHAR(255) NOT NULL, -- Changed from UUID to VARCHAR to accept any student ID format
  
  -- Feedback type
  feedback_type VARCHAR(50) NOT NULL, -- 'thumbs_up', 'thumbs_down', 'suggestion', 'share', 'learning_impact'
  section VARCHAR(50) NOT NULL, -- 'level_1_expanded', 'level_2_chat', 'level_3_article', 'section_specific'
  
  -- Categorized feedback
  category VARCHAR(100), -- 'not_relevant', 'outdated', 'too_technical', 'missing_details', 'poor_example', 'incorrect_facts'
  comment TEXT,
  suggestion_text TEXT,
  
  -- Context at time of feedback
  student_mastery_at_time DECIMAL(3,2),
  bloom_cell VARCHAR(50),
  course_id UUID,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes separately for Postgres
CREATE INDEX IF NOT EXISTS idx_insight_feedback_insight ON insight_feedback(insight_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_student ON insight_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_type ON insight_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_category ON insight_feedback(category);

-- Engagement tracking (implicit feedback)
CREATE TABLE IF NOT EXISTS insight_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id VARCHAR(100) NOT NULL,
  student_id VARCHAR(255) NOT NULL, -- Changed from UUID to VARCHAR to accept any student ID format
  
  -- View behavior
  viewed_teaser BOOLEAN DEFAULT FALSE,
  expanded_level_1 BOOLEAN DEFAULT FALSE,
  reached_level INT DEFAULT 0, -- 0, 1, 2, or 3
  
  -- Timing
  time_on_level_1 INT DEFAULT 0, -- seconds
  time_per_section JSONB, -- {"what": 6, "how": 18, "why": 12, "connection": 16}
  time_before_dismissal INT,
  
  -- Actions
  dismissed BOOLEAN DEFAULT FALSE,
  dismissal_type VARCHAR(20), -- 'temporary', 'permanent', null
  shared BOOLEAN DEFAULT FALSE,
  share_platform VARCHAR(20),
  bookmarked BOOLEAN DEFAULT FALSE,
  returned_to_reread BOOLEAN DEFAULT FALSE,
  
  -- Completion
  completed_full_read BOOLEAN DEFAULT FALSE,
  scroll_depth DECIMAL(3,2), -- 0.0 to 1.0
  sections_viewed TEXT[], -- array of section names: ['what', 'how', 'why', 'connection']
  
  -- Depth of engagement
  clicked_video BOOLEAN DEFAULT FALSE,
  clicked_demo BOOLEAN DEFAULT FALSE,
  opened_ai_chat BOOLEAN DEFAULT FALSE,
  read_full_article BOOLEAN DEFAULT FALSE,
  
  -- Session info
  session_duration INT, -- total seconds spent
  -- Removed course_id field that was causing the error
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes separately for Postgres
CREATE INDEX IF NOT EXISTS idx_insight_engagement_insight ON insight_engagement(insight_id);
CREATE INDEX IF NOT EXISTS idx_insight_engagement_student ON insight_engagement(student_id);
CREATE INDEX IF NOT EXISTS idx_insight_engagement_dismissed ON insight_engagement(dismissed);

-- Aggregated quality scores
CREATE TABLE IF NOT EXISTS insight_quality_scores (
  insight_id VARCHAR(100) PRIMARY KEY,
  
  -- Overall scores
  overall_score DECIMAL(3,2) DEFAULT 0.50,
  confidence DECIMAL(3,2) DEFAULT 0.00, -- 0-1, based on sample size
  
  -- Component scores
  engagement_score DECIMAL(3,2) DEFAULT 0.50,
  helpfulness_score DECIMAL(3,2) DEFAULT 0.50,
  shareability_score DECIMAL(3,2) DEFAULT 0.00,
  learning_impact_score DECIMAL(3,2) DEFAULT 0.50,
  
  -- Trending
  trending_score DECIMAL(3,2) DEFAULT 0.00,
  is_trending BOOLEAN DEFAULT FALSE,
  
  -- Sample sizes
  total_views INT DEFAULT 0,
  total_interactions INT DEFAULT 0,
  total_feedback_items INT DEFAULT 0,
  
  -- Aggregated metrics
  thumbs_up_count INT DEFAULT 0,
  thumbs_down_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  dismissal_count INT DEFAULT 0,
  avg_time_spent INT DEFAULT 0,
  completion_rate DECIMAL(3,2) DEFAULT 0.00,
  
  -- Timestamps
  last_calculated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes separately for Postgres
CREATE INDEX IF NOT EXISTS idx_quality_scores_overall ON insight_quality_scores(overall_score);
CREATE INDEX IF NOT EXISTS idx_quality_scores_trending ON insight_quality_scores(is_trending);

-- Share tracking
CREATE TABLE IF NOT EXISTS insight_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id VARCHAR(100) NOT NULL,
  student_id VARCHAR(255) NOT NULL, -- Changed from UUID to VARCHAR to accept any student ID format
  
  platform VARCHAR(20), -- 'email', 'slack', 'copy_link'
  motivation VARCHAR(100), -- 'helped_understand', 'great_example', 'motivating', 'help_others'
  motivation_text TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes separately for Postgres
CREATE INDEX IF NOT EXISTS idx_insight_shares_insight ON insight_shares(insight_id);
CREATE INDEX IF NOT EXISTS idx_insight_shares_platform ON insight_shares(platform);

-- Learning impact tracking
CREATE TABLE IF NOT EXISTS insight_learning_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id VARCHAR(100) NOT NULL,
  student_id VARCHAR(255) NOT NULL, -- Changed from UUID to VARCHAR to accept any student ID format
  
  -- Assessment connection
  assessment_id UUID,
  assessment_score DECIMAL(3,2),
  
  -- Impact rating
  helpfulness VARCHAR(50), -- 'very_helpful', 'somewhat_helpful', 'not_helpful', 'didnt_view'
  
  -- Timing
  time_between_view_and_assessment INT, -- seconds
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes separately for Postgres
CREATE INDEX IF NOT EXISTS idx_learning_impact_insight ON insight_learning_impact(insight_id);
CREATE INDEX IF NOT EXISTS idx_learning_impact_helpfulness ON insight_learning_impact(helpfulness);

-- Enable Row Level Security
ALTER TABLE insight_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_learning_impact ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - refine based on your auth setup)
CREATE POLICY "Allow all operations on insight_feedback" ON insight_feedback FOR ALL USING (true);
CREATE POLICY "Allow all operations on insight_engagement" ON insight_engagement FOR ALL USING (true);
CREATE POLICY "Allow all operations on insight_quality_scores" ON insight_quality_scores FOR ALL USING (true);
CREATE POLICY "Allow all operations on insight_shares" ON insight_shares FOR ALL USING (true);
CREATE POLICY "Allow all operations on insight_learning_impact" ON insight_learning_impact FOR ALL USING (true);
