-- Drop the function if it exists
DROP FUNCTION IF EXISTS upsert_student_grades(JSONB);

-- Create a function to upsert student grades that properly handles enum types
CREATE OR REPLACE FUNCTION upsert_student_grades(
  p_grades JSONB
)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  class_subject_id UUID,
  period period_type,
  assessment_type_id UUID,
  score NUMERIC,
  max_score NUMERIC,
  is_locked BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  grade_record JSONB;
  result_row RECORD;
BEGIN
  -- Loop through each grade in the JSONB array
  FOR grade_record IN SELECT * FROM jsonb_array_elements(p_grades)
  LOOP
    -- Perform the upsert using RETURNING into a record
    INSERT INTO student_grades (
      id,
      student_id,
      class_subject_id,
      period,
      assessment_type_id,
      score,
      max_score,
      is_locked
    )
    VALUES (
      CASE 
        WHEN grade_record->>'id' IS NOT NULL AND grade_record->>'id' != '' 
        THEN (grade_record->>'id')::UUID 
        ELSE gen_random_uuid()
      END,
      (grade_record->>'student_id')::UUID,
      (grade_record->>'class_subject_id')::UUID,
      (grade_record->>'period')::period_type,
      (grade_record->>'assessment_type_id')::UUID,
      COALESCE((grade_record->>'score')::NUMERIC(5,2), 0),
      (grade_record->>'max_score')::NUMERIC(5,2),
      COALESCE((grade_record->>'is_locked')::BOOLEAN, false)
    )
    ON CONFLICT (student_id, class_subject_id, period, assessment_type_id)
    DO UPDATE SET
      score = EXCLUDED.score,
      max_score = EXCLUDED.max_score,
      is_locked = EXCLUDED.is_locked,
      updated_at = now()
    RETURNING * INTO result_row;
    
    -- Return the result using the record
    RETURN QUERY SELECT 
      result_row.id,
      result_row.student_id,
      result_row.class_subject_id,
      result_row.period,
      result_row.assessment_type_id,
      result_row.score,
      result_row.max_score,
      result_row.is_locked,
      result_row.created_at,
      result_row.updated_at;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_student_grades(JSONB) TO authenticated;
