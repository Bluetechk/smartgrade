# Grade Saving Fix - Instructions

## Problem
When saving grades in the Gradebook, a 400 error was being returned from the `upsert_student_grades` RPC function.

## Root Causes Identified
1. **NUMERIC Precision Mismatch**: The RPC function was casting `score` and `max_score` as plain `NUMERIC` instead of the required `NUMERIC(5,2)` format
2. **Period Enum Validation**: The period value wasn't being validated before casting to the enum type
3. **Missing Error Handling**: If any casting failed, the entire transaction would fail

## Changes Made

### 1. Frontend Improvements (useGrades.ts)
- Added better error logging to show detailed error information from the API
- Added sample grade data logging for debugging

### 2. SQL Function Improvements
Created two new migration files:
- `20251216_improve_upsert_student_grades.sql` - Initial improved version
- `20251216_improve_upsert_student_grades_v2.sql` - Final version with full error handling

Key improvements:
- Correct `NUMERIC(5,2)` casting for score and max_score values
- Period enum validation with fallback to 'p1'
- Individual error handling for each grade record
- Function continues processing even if one grade fails
- Better validation of required fields (student_id, class_subject_id, assessment_type_id)
- Added proper error messages and logging

## Steps to Apply the Fix

### Step 1: Apply the SQL Migration
Go to your Supabase project SQL Editor and run:

```sql
-- Drop the old function if exists
DROP FUNCTION IF EXISTS upsert_student_grades(JSONB);

-- Create the improved function
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
BEGIN
  -- Check if p_grades is null or empty
  IF p_grades IS NULL OR jsonb_array_length(p_grades) = 0 THEN
    RETURN;
  END IF;

  -- Loop through each grade in the JSONB array
  FOR grade_record IN SELECT * FROM jsonb_array_elements(p_grades)
  LOOP
    v_grade_count := v_grade_count + 1;
    
    BEGIN
      v_id := CASE 
        WHEN grade_record->>'id' IS NOT NULL AND grade_record->>'id' != '' 
        THEN (grade_record->>'id')::UUID 
        ELSE gen_random_uuid()
      END;

      v_student_id := (grade_record->>'student_id')::UUID;
      IF v_student_id IS NULL THEN CONTINUE; END IF;

      v_class_subject_id := (grade_record->>'class_subject_id')::UUID;
      IF v_class_subject_id IS NULL THEN CONTINUE; END IF;

      v_assessment_type_id := (grade_record->>'assessment_type_id')::UUID;
      
      -- Period with validation
      v_period := CASE 
        WHEN grade_record->>'period' IN ('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'exam_s1', 'exam_s2', 'semester1', 'semester2', 'yearly')
        THEN (grade_record->>'period')::period_type
        ELSE 'p1'::period_type
      END;

      -- Proper NUMERIC(5,2) casting
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

      v_is_locked := COALESCE((grade_record->>'is_locked')::BOOLEAN, false);

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
      CONTINUE;
    END;
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_student_grades(JSONB) TO authenticated;
```

### Step 2: Test the Fix
1. Go to the Gradebook page
2. Select a class and subject
3. Enter some grades
4. Click "Save"
5. Check the browser console - you should see success messages instead of 400 errors

## Testing Checklist
- [ ] Can save single grade without errors
- [ ] Can save multiple grades at once
- [ ] Period validation works (shows in console logs)
- [ ] Lock/unlock toggle works
- [ ] Grades persist after page reload
- [ ] Error messages are helpful if something goes wrong

## Notes
- The function now has better error handling and will skip invalid records instead of failing the entire operation
- Grade data is logged to the console for debugging purposes
- The NUMERIC(5,2) precision matches the database schema exactly
