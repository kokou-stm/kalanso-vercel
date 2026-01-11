-- Seed the insights table with the ChatGPT Backpropagation insight
-- This ensures foreign key constraints are satisfied

INSERT INTO insights (
  id,
  title,
  slug,
  teaser,
  level_1_content,
  level_1_enabled,
  level_2_enabled,
  level_2_config,
  level_3_enabled,
  level_3_content,
  category,
  status,
  teaser_icon,
  version,
  created_at,
  updated_at,
  published_at
) VALUES (
  'chatgpt-backpropagation',
  'Real-World Connection: ChatGPT & Backpropagation',
  'chatgpt-backpropagation',
  'Did you know? The backpropagation algorithm you''re learning right now powers ChatGPT''s training process, enabling it to understand and respond to billions of conversations!',
  jsonb_build_object(
    'what', jsonb_build_object(
      'text', 'ChatGPT uses backpropagation to adjust 175 billion neural network parameters during training, learning from massive text datasets to generate human-like responses to any question or prompt.',
      'durationSeconds', 5
    ),
    'how', jsonb_build_object(
      'diagram', jsonb_build_object(
        'steps', jsonb_build_array(
          jsonb_build_object('label', 'Input Text', 'example', 'What is machine learning?', 'description', 'User submits a question or prompt', 'bloomLevel', 'understand', 'studentProgress', 'mastered'),
          jsonb_build_object('label', 'Forward Pass', 'description', 'Generate response through neural network', 'bloomLevel', 'understand', 'studentProgress', 'mastered'),
          jsonb_build_object('label', 'Calculate Error', 'description', 'How accurate was the answer?', 'bloomLevel', 'understand', 'studentProgress', 'mastered'),
          jsonb_build_object('label', 'BACKPROPAGATION', 'description', 'Adjust 175B weights to reduce error', 'bloomLevel', 'apply', 'studentProgress', 'current', 'highlight', true),
          jsonb_build_object('label', 'Repeat millions of times', 'description', 'Optimize and iterate continuously', 'bloomLevel', 'analyze', 'studentProgress', 'upcoming')
        )
      ),
      'durationSeconds', 15
    ),
    'whyItMatters', jsonb_build_object(
      'scaleOfUse', jsonb_build_array(
        'ChatGPT: 100M+ weekly conversations',
        'Google Translate: 500M+ daily translations',
        'Grammarly: 30M+ documents improved daily'
      ),
      'specificImpact', jsonb_build_object(
        'challenge', 'Before 2018, AI language models could barely write coherent paragraphs.',
        'solution', jsonb_build_array(
          'Trained on 300 billion words using backprop to learn patterns',
          'Adjusted 175B parameters through billions of training iterations',
          'Learned to understand context across entire conversations'
        ),
        'humanImpact', 'Students using ChatGPT for homework help report 40% faster learning of complex topics.'
      ),
      'durationSeconds', 10
    ),
    'yourConnection', jsonb_build_object(
      'currentBloomCell', 'apply_procedural',
      'masteryPercentage', 65,
      'gapToProduction', 35,
      'durationSeconds', 10
    ),
    'goDeeperOptions', jsonb_build_array(
      jsonb_build_object('type', 'video', 'title', 'Watch: How ChatGPT Learns', 'durationMinutes', 3, 'url', '/videos/chatgpt-training'),
      jsonb_build_object('type', 'ai_chat', 'title', 'Ask AI Assistant'),
      jsonb_build_object('type', 'article', 'title', 'Read Full Technical Case Study', 'durationMinutes', 8, 'url', '/insights/chatgpt-backpropagation'),
      jsonb_build_object('type', 'demo', 'title', 'Try Interactive Backprop Visualizer', 'url', '/demos/backprop-visualizer')
    )
  ),
  true,  -- level_1_enabled
  true,  -- level_2_enabled
  jsonb_build_object(
    'aiModel', 'gpt-4',
    'systemPrompt', 'You are an educational AI assistant helping students understand backpropagation.',
    'suggestedQuestions', jsonb_build_array(
      'How does this relate to my learning?',
      'Show me the math step-by-step',
      'What makes backprop so powerful?',
      'How can I practice this myself?'
    )
  ),
  true,  -- level_3_enabled
  jsonb_build_object(
    'articleUrl', '/insights/chatgpt-backpropagation',
    'estimatedMinutes', 8
  ),
  'ml_fundamentals',  -- category
  'published',        -- status
  'brain',           -- teaser_icon
  1,                 -- version
  NOW(),             -- created_at
  NOW(),             -- updated_at
  NOW()              -- published_at
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  teaser = EXCLUDED.teaser,
  level_1_content = EXCLUDED.level_1_content,
  updated_at = NOW();

-- Initialize quality scores for this insight
INSERT INTO insight_quality_scores (
  insight_id,
  overall_score,
  confidence,
  engagement_score,
  helpfulness_score,
  shareability_score,
  learning_impact_score,
  last_calculated_at
) VALUES (
  'chatgpt-backpropagation',
  0.75,  -- Good initial score
  0.20,  -- Low confidence (not much data yet)
  0.70,
  0.80,
  0.50,
  0.75,
  NOW()
)
ON CONFLICT (insight_id) DO NOTHING;
