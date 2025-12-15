-- Improved version of upsert_student_grades function with robust error handling and correct NUMERIC casting

DROP FUNCTION IF EXISTS upsert_student_grades(JSONB);

CREATE OR REPLACE FUNCTION upsert_student_grades(
  p_grades JSONB DEFAULT '[]'::JSONB
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
  v_id UUID;
  v_student_id UUID;
  v_class_subject_id UUID;
  v_period period_type;
  v_assessment_type_id UUID;
  v_score NUMERIC(5,2);
  v_max_score NUMERIC(5,2);
  v_is_locked BOOLEAN;
  v_grade_count INTEGER := 0;
  v_error_msg TEXT;
BEGIN
  -- Check if p_grades is null or empty
  IF p_grades IS NULL OR jsonb_array_length(p_grades) = 0 THEN
    RAISE NOTICE 'No grades provided to upsert_student_grades';
    RETURN;
  END IF;

  -- Log the incoming data for debugging
  RAISE NOTICE 'Processing % grades', jsonb_array_length(p_grades);

  -- Loop through each grade in the JSONB array
  FOR grade_record IN SELECT * FROM jsonb_array_elements(p_grades)
  LOOP
    v_grade_count := v_grade_count + 1;
    v_error_msg := NULL;
    
    BEGIN
      -- Extract and validate each field with proper error messages
      v_id := CASE 
        WHEN grade_record->>'id' IS NOT NULL AND grade_record->>'id' != '' 
        THEN (grade_record->>'id')::UUID 
        ELSE gen_random_uuid()
      END;

      -- Required: student_id
      v_student_id := (grade_record->>'student_id')::UUID;
      IF v_student_id IS NULL THEN
        v_error_msg := 'Missing or invalid student_id';
        RAISE EXCEPTION '%', v_error_msg;
      END IF;

      -- Required: class_subject_id
      v_class_subject_id := (grade_record->>'class_subject_id')::UUID;
      IF v_class_subject_id IS NULL THEN
        v_error_msg := 'Missing or invalid class_subject_id';
        RAISE EXCEPTION '%', v_error_msg;
      END IF;

      -- Required: assessment_type_id
      v_assessment_type_id := (grade_record->>'assessment_type_id')::UUID;
      IF v_assessment_type_id IS NULL THEN
        v_error_msg := 'Missing or invalid assessment_type_id';
        RAISE EXCEPTION '%', v_error_msg;
      END IF;
      
      -- Period with validation - ensure it's a valid enum value
      v_period := CASE 
        WHEN grade_record->>'period' IN ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'exam_s1', 'exam_s2', 'semester1', 'semester2', 'yearly')
        THEN (grade_record->>'period')::period_type
        ELSE 'p1'::period_type  -- Default to p1 if invalid
      END;

      -- Score and max_score with proper NUMERIC(5,2) casting
      BEGIN
        v_score := COALESCE((grade_record->>'score')::NUMERIC(5,2), 0.00);
      EXCEPTION WHEN OTHERS THEN
        v_score := 0.00;
      END;

      BEGIN
        v_max_score := COALESCE((grade_record->>'max_score')::NUMERIC(5,2), 100.00);
      EXCEPTION WHEN OTHERS THEN
        v_max_score := 100.00;
      END;

      -- is_locked
      v_is_locked := COALESCE((grade_record->>'is_locked')::BOOLEAN, false);

      -- Verify referenced rows exist to avoid FK violation
      PERFORM 1 FROM students WHERE id = v_student_id;
      IF NOT FOUND THEN
        RAISE NOTICE 'Grade % - student not found: %', v_grade_count, v_student_id;
        CONTINUE;
      END IF;

      PERFORM 1 FROM class_subjects WHERE id = v_class_subject_id;
      IF NOT FOUND THEN
        RAISE NOTICE 'Grade % - class_subject not found: %', v_grade_count, v_class_subject_id;
        CONTINUE;
      END IF;

      PERFORM 1 FROM assessment_types WHERE id = v_assessment_type_id;
      IF NOT FOUND THEN
        RAISE NOTICE 'Grade % - assessment_type not found: %', v_grade_count, v_assessment_type_id;
        CONTINUE;
      END IF;

      -- Perform the upsert
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
        v_id,
        v_student_id,
        v_class_subject_id,
        v_period,
        v_assessment_type_id,
        v_score,
        v_max_score,
        v_is_locked
      )
      ON CONFLICT (student_id, class_subject_id, period, assessment_type_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        max_score = EXCLUDED.max_score,
        is_locked = EXCLUDED.is_locked,
        updated_at = now()
      RETURNING * INTO result_row;
      
      -- Return the result
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
        
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error processing grade %: % - %', v_grade_count, SQLSTATE, SQLERRM;
      -- Continue processing other grades even if one fails
      CONTINUE;
    END;
  END LOOP;
  
  RAISE DEBUG 'Processed % grades successfully', v_grade_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_student_grades(JSONB) TO authenticated;
