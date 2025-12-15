CREATE OR REPLACE FUNCTION public.upsert_student_grades(p_grades jsonb)
 RETURNS TABLE(id uuid, student_id uuid, class_subject_id uuid, period period_type, assessment_type_id uuid, score numeric, max_score numeric, is_locked boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
DECLARE
  grade_record JSONB;
  result_row RECORD;
  v_id UUID;
  v_student_id UUID;
  v_class_subject_id UUID;
  v_period period_type;
  v_assessment_type_id UUID;
  v_score NUMERIC;
  v_max_score NUMERIC;
  v_is_locked BOOLEAN;
  v_dept_id UUID;
  v_assessment_max_points INTEGER;
  v_total_weights INTEGER;
BEGIN
  -- Check if p_grades is null or empty
  IF p_grades IS NULL OR jsonb_array_length(p_grades) = 0 THEN
    RAISE WARNING 'No grades provided to upsert_student_grades';
    RETURN;
  END IF;

  -- Loop through each grade in the JSONB array
  FOR grade_record IN SELECT * FROM jsonb_array_elements(p_grades)
  LOOP
    BEGIN
      -- Extract and validate each field
      v_id := CASE 
        WHEN grade_record->>'id' IS NOT NULL AND grade_record->>'id' != '' 
        THEN (grade_record->>'id')::UUID 
        ELSE gen_random_uuid()
      END;

      v_student_id := (grade_record->>'student_id')::UUID;
      v_class_subject_id := (grade_record->>'class_subject_id')::UUID;
      
      -- Validate period - ensure it's a valid enum value
      v_period := CASE 
        WHEN grade_record->>'period' IN ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'exam_s1', 'exam_s2', 'semester1', 'semester2', 'yearly')
        THEN (grade_record->>'period')::period_type
        ELSE 'p1'::period_type  -- Default to p1 if invalid
      END;
      
      v_assessment_type_id := (grade_record->>'assessment_type_id')::UUID;
      v_score := COALESCE((grade_record->>'score')::NUMERIC(5,2), 0);
      v_max_score := COALESCE((grade_record->>'max_score')::NUMERIC(5,2), 100);

      -- Determine department for class_subject and validate assessment weights
      SELECT c.department_id
      FROM class_subjects cs
      JOIN classes c ON cs.class_id = c.id
      WHERE cs.id = v_class_subject_id
      INTO v_dept_id;

      IF v_dept_id IS NULL THEN
        RAISE WARNING 'Class subject % has no linked class/department', v_class_subject_id;
        CONTINUE;
      END IF;

      SELECT COALESCE(SUM(max_points), 0) FROM assessment_types WHERE department_id = v_dept_id INTO v_total_weights;
      IF v_total_weights <> 100 THEN
        RAISE WARNING 'Assessment types for department % sum to % (expected 100). Skipping grade.', v_dept_id, v_total_weights;
        CONTINUE;
      END IF;

      -- Enforce admin-defined max_points for the assessment type
      SELECT max_points FROM assessment_types WHERE id = v_assessment_type_id INTO v_assessment_max_points;
      IF v_assessment_max_points IS NULL THEN
        RAISE WARNING 'Assessment type % not found for grade record', v_assessment_type_id;
        CONTINUE;
      END IF;

      -- Override provided max_score with admin max_points to ensure consistency
      v_max_score := v_assessment_max_points;

      -- Cap score to max_points
      IF v_score > v_max_score THEN
        RAISE WARNING 'Score % exceeds assessment max %; capping to max', v_score, v_max_score;
        v_score := v_max_score;
      END IF;
      v_is_locked := COALESCE((grade_record->>'is_locked')::BOOLEAN, false);

      -- Validate required fields
      IF v_student_id IS NULL THEN
        RAISE WARNING 'Missing student_id in grade record';
        CONTINUE;
      END IF;
      
      IF v_class_subject_id IS NULL THEN
        RAISE WARNING 'Missing class_subject_id in grade record';
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
      RAISE WARNING 'Error processing grade record: % - %', SQLSTATE, SQLERRM;
      CONTINUE;
    END;
  END LOOP;
END;
$function$

