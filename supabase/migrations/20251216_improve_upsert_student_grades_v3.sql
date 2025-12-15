-- Enhanced upsert_student_grades with comprehensive logging and validation

DROP FUNCTION IF EXISTS upsert_student_grades(JSONB);
DROP FUNCTION IF EXISTS validate_grade_dependencies(UUID, UUID, UUID);

-- Helper function to validate grade dependencies
CREATE OR REPLACE FUNCTION validate_grade_dependencies(
  p_student_id UUID,
  p_class_subject_id UUID,
  p_assessment_type_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_student_exists BOOLEAN;
  v_class_subject_exists BOOLEAN;
  v_assessment_type_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM students WHERE id = p_student_id) INTO v_student_exists;
  SELECT EXISTS(SELECT 1 FROM class_subjects WHERE id = p_class_subject_id) INTO v_class_subject_exists;
  SELECT EXISTS(SELECT 1 FROM assessment_types WHERE id = p_assessment_type_id) INTO v_assessment_type_exists;

  IF NOT v_student_exists THEN
    RETURN QUERY SELECT false, 'Student not found: ' || p_student_id::TEXT;
  ELSIF NOT v_class_subject_exists THEN
    RETURN QUERY SELECT false, 'Class subject not found: ' || p_class_subject_id::TEXT;
  ELSIF NOT v_assessment_type_exists THEN
    RETURN QUERY SELECT false, 'Assessment type not found: ' || p_assessment_type_id::TEXT;
  ELSE
    RETURN QUERY SELECT true, 'All dependencies valid';
  END IF;
END;
$$;

-- Main upsert function with detailed logging
-- RETURNS aggregated totals (from student_period_totals), not individual assessments
CREATE OR REPLACE FUNCTION upsert_student_grades(
  p_grades JSONB DEFAULT '[]'::JSONB
)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  class_subject_id UUID,
  period period_type,
  total_score NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  diagnostics TEXT
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
  v_processed_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
  v_student_exists BOOLEAN;
  v_class_subject_exists BOOLEAN;
  v_assessment_type_exists BOOLEAN;
  v_validation_result RECORD;
  v_aggregated_total RECORD;
  v_processed_groups_set text[] := ARRAY[]::text[];
  v_group_key text;
BEGIN
  -- Check if p_grades is null or empty
  IF p_grades IS NULL OR jsonb_array_length(p_grades) = 0 THEN
    RAISE NOTICE 'upsert_student_grades: No grades provided';
    RETURN;
  END IF;

  RAISE NOTICE 'upsert_student_grades: Processing % grades', jsonb_array_length(p_grades);

  -- Loop through each grade in the JSONB array
  FOR grade_record IN SELECT * FROM jsonb_array_elements(p_grades)
  LOOP
    v_grade_count := v_grade_count + 1;
    
    BEGIN
      -- Extract and validate each field
      v_id := CASE 
        WHEN grade_record->>'id' IS NOT NULL AND grade_record->>'id' != '' 
        THEN (grade_record->>'id')::UUID 
        ELSE gen_random_uuid()
      END;

      -- Required: student_id
      v_student_id := (grade_record->>'student_id')::UUID;
      IF v_student_id IS NULL THEN
        RAISE NOTICE 'Grade %: Missing student_id', v_grade_count;
        v_skipped_count := v_skipped_count + 1;
        RETURN QUERY SELECT 
          NULL::uuid AS id,
          NULL::uuid AS student_id,
          (grade_record->>'class_subject_id')::UUID AS class_subject_id,
          'p1'::period_type AS period,
          0::numeric AS total_score,
          now() AS created_at,
          now() AS updated_at,
          'SKIPPED: Missing student_id' AS diagnostics;
        CONTINUE;
      END IF;

      -- Required: class_subject_id
      v_class_subject_id := (grade_record->>'class_subject_id')::UUID;
      IF v_class_subject_id IS NULL THEN
        RAISE NOTICE 'Grade %: Missing class_subject_id', v_grade_count;
        v_skipped_count := v_skipped_count + 1;
        RETURN QUERY SELECT 
          NULL::uuid AS id,
          v_student_id AS student_id,
          NULL::uuid AS class_subject_id,
          'p1'::period_type AS period,
          0::numeric AS total_score,
          now() AS created_at,
          now() AS updated_at,
          'SKIPPED: Missing class_subject_id' AS diagnostics;
        CONTINUE;
      END IF;

      -- Required: assessment_type_id
      v_assessment_type_id := (grade_record->>'assessment_type_id')::UUID;
      IF v_assessment_type_id IS NULL THEN
        RAISE NOTICE 'Grade %: Missing assessment_type_id', v_grade_count;
        v_skipped_count := v_skipped_count + 1;
        RETURN QUERY SELECT 
          NULL::uuid AS id,
          v_student_id AS student_id,
          v_class_subject_id AS class_subject_id,
          'p1'::period_type AS period,
          0::numeric AS total_score,
          now() AS created_at,
          now() AS updated_at,
          'SKIPPED: Missing assessment_type_id' AS diagnostics;
        CONTINUE;
      END IF;
      
      -- Period with validation
      v_period := CASE 
        WHEN grade_record->>'period' IN ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'exam_s1', 'exam_s2', 'semester1', 'semester2', 'yearly')
        THEN (grade_record->>'period')::period_type
        ELSE 'p1'::period_type
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

      -- Verify referenced rows exist
      SELECT EXISTS(SELECT 1 FROM students WHERE id = v_student_id) INTO v_student_exists;
      SELECT EXISTS(SELECT 1 FROM class_subjects WHERE id = v_class_subject_id) INTO v_class_subject_exists;
      SELECT EXISTS(SELECT 1 FROM assessment_types WHERE id = v_assessment_type_id) INTO v_assessment_type_exists;

      IF NOT v_student_exists THEN
        RAISE NOTICE 'Grade %: Student not found (id: %)', v_grade_count, v_student_id;
        v_skipped_count := v_skipped_count + 1;
        -- Return a diagnostic row for visibility in client
        RETURN QUERY SELECT 
          NULL::uuid AS id,
          v_student_id AS student_id,
          v_class_subject_id AS class_subject_id,
          v_period AS period,
          0::numeric AS total_score,
          now() AS created_at,
          now() AS updated_at,
          ('SKIPPED: Student not found: ' || v_student_id::text) AS diagnostics;
        CONTINUE;
      END IF;

      IF NOT v_class_subject_exists THEN
        RAISE NOTICE 'Grade %: Class subject not found (id: %)', v_grade_count, v_class_subject_id;
        v_skipped_count := v_skipped_count + 1;
        RETURN QUERY SELECT 
          NULL::uuid AS id,
          v_student_id AS student_id,
          v_class_subject_id AS class_subject_id,
          v_period AS period,
          0::numeric AS total_score,
          now() AS created_at,
          now() AS updated_at,
          ('SKIPPED: Class subject not found: ' || v_class_subject_id::text) AS diagnostics;
        CONTINUE;
      END IF;

      IF NOT v_assessment_type_exists THEN
        RAISE NOTICE 'Grade %: Assessment type not found (id: %)', v_grade_count, v_assessment_type_id;
        v_skipped_count := v_skipped_count + 1;
        RETURN QUERY SELECT 
          NULL::uuid AS id,
          v_student_id AS student_id,
          v_class_subject_id AS class_subject_id,
          v_period AS period,
          0::numeric AS total_score,
          now() AS created_at,
          now() AS updated_at,
          ('SKIPPED: Assessment type not found: ' || v_assessment_type_id::text) AS diagnostics;
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
      
      v_processed_count := v_processed_count + 1;

      -- Track this group (student + subject + period) for aggregation
      v_group_key := v_student_id::text || '|' || v_class_subject_id::text || '|' || v_period::text;
      IF NOT v_processed_groups_set @> ARRAY[v_group_key] THEN
        v_processed_groups_set := v_processed_groups_set || v_group_key;
      END IF;
        
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Grade %: Unexpected error: % - %', v_grade_count, SQLSTATE, SQLERRM;
      v_skipped_count := v_skipped_count + 1;
      CONTINUE;
    END;
  END LOOP;
  
  
  -- Return aggregated totals for each processed (student, subject, period) group
  -- This is what the frontend expects: ONE row per subject per period
  FOR v_group_key IN SELECT unnest(v_processed_groups_set)
  LOOP
    -- Parse the group key
    v_student_id := (regexp_split_to_array(v_group_key, '\|'))[1]::UUID;
    v_class_subject_id := (regexp_split_to_array(v_group_key, '\|'))[2]::UUID;
    v_period := (regexp_split_to_array(v_group_key, '\|'))[3]::period_type;

    -- Fetch the aggregated total from student_period_totals
    -- The trigger already inserted/updated this row
    SELECT spt.* INTO v_aggregated_total
    FROM student_period_totals spt
    WHERE spt.student_id = v_student_id
      AND spt.class_subject_id = v_class_subject_id
      AND spt.period = v_period;

    IF v_aggregated_total IS NOT NULL THEN
      RETURN QUERY SELECT 
        v_aggregated_total.id,
        v_aggregated_total.student_id,
        v_aggregated_total.class_subject_id,
        v_aggregated_total.period,
        v_aggregated_total.total_score,
        v_aggregated_total.created_at,
        v_aggregated_total.updated_at,
        NULL::text AS diagnostics;
    ELSE
      -- This should not happen if trigger works, but surface it as an error
      RETURN QUERY SELECT 
        NULL::uuid AS id,
        v_student_id AS student_id,
        v_class_subject_id AS class_subject_id,
        v_period AS period,
        0::numeric AS total_score,
        now() AS created_at,
        now() AS updated_at,
        ('ERROR: Aggregation failed - no row in student_period_totals for ' || v_group_key) AS diagnostics;
    END IF;
  END LOOP;

  -- If nothing was processed, return error summary
  IF v_processed_count = 0 THEN
    RETURN QUERY SELECT 
      NULL::uuid AS id,
      NULL::uuid AS student_id,
      NULL::uuid AS class_subject_id,
      'p1'::period_type AS period,
      0::numeric AS total_score,
      now() AS created_at,
      now() AS updated_at,
      ('ERROR: Processed=0 Skipped=' || v_skipped_count::text || ' - Check diagnostics above') AS diagnostics;
  END IF;

  RAISE NOTICE 'upsert_student_grades: Summary - Total: %, Processed: %, Skipped: %, Aggregated Groups: %', v_grade_count, v_processed_count, v_skipped_count, array_length(v_processed_groups_set, 1);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_student_grades(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_grade_dependencies(UUID, UUID, UUID) TO authenticated;
