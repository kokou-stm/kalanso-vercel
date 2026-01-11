-- SQL function for getting practice summary
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_practice_summary(
  p_student_id UUID,
  p_glo_id VARCHAR
)
RETURNS TABLE (
  count BIGINT,
  avg_accuracy DECIMAL,
  total_time BIGINT,
  last_session TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as count,
    AVG(accuracy)::DECIMAL as avg_accuracy,
    SUM(time_spent_seconds)::BIGINT as total_time,
    MAX(created_at) as last_session
  FROM practice_sessions
  WHERE student_id = p_student_id
    AND glo_id = p_glo_id
    AND created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
