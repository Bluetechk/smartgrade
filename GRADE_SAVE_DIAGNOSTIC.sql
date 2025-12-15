-- Diagnostic queries to identify missing foreign key references
-- Run these in Supabase SQL Editor to see which IDs don't exist

-- Replace these IDs with the ones from your console logs
-- From the console: student_id, class_subject_id, assessment_type_id

-- Check if the student exists
SELECT 'Student Check' as check_type, 
  EXISTS(SELECT 1 FROM students WHERE id = '5957e06b-1c03-40aa-95d9-cd1122471e52') as exists;

-- Check if the class_subject exists
SELECT 'ClassSubject Check' as check_type,
  EXISTS(SELECT 1 FROM class_subjects WHERE id = '2205c7d1-c6ad-4440-a396-bf4522cfd0a4') as exists;

-- Check if the assessment_type exists
SELECT 'AssessmentType Check' as check_type,
  EXISTS(SELECT 1 FROM assessment_types WHERE id = '8b375e1b-78a6-4811-9bc5-86c434826193') as exists;

-- Show actual counts
SELECT 
  (SELECT COUNT(*) FROM students) as total_students,
  (SELECT COUNT(*) FROM class_subjects) as total_class_subjects,
  (SELECT COUNT(*) FROM assessment_types) as total_assessment_types;

-- Show the specific student if it exists
SELECT * FROM students WHERE id = '5957e06b-1c03-40aa-95d9-cd1122471e52';

-- Show the specific class_subject if it exists (with names)
SELECT cs.id, c.name as class_name, s.name as subject_name
FROM class_subjects cs
LEFT JOIN classes c ON cs.class_id = c.id
LEFT JOIN subjects s ON cs.subject_id = s.id
WHERE cs.id = '2205c7d1-c6ad-4440-a396-bf4522cfd0a4';

-- Show the specific assessment_type if it exists
SELECT * FROM assessment_types WHERE id = '8b375e1b-78a6-4811-9bc5-86c434826193';

-- Show all students in class 9ab12caf-a37b-4202-b747-06d2f6abfe6e (the class being graded)
SELECT s.id, s.full_name, s.student_id 
FROM students s 
WHERE s.class_id = '9ab12caf-a37b-4202-b747-06d2f6abfe6e'
LIMIT 20;

-- Show all assessment_types for department 6ce3031c-a2b3-4c80-bd08-76ad4ac2e479
SELECT id, name FROM assessment_types 
WHERE department_id = '6ce3031c-a2b3-4c80-bd08-76ad4ac2e479'
LIMIT 20;
