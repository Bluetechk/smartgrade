-- Remove default assessment types that were auto-inserted
DELETE FROM public.assessment_types 
WHERE name IN ('Attendance', 'Participation', 'Project', 'Assignment', 'Quiz', 'Test');
