import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useClasses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["classes", user?.id],
    queryFn: async () => {
      try {
        let query = supabase
          .from("classes")
          .select(`
            *,
            departments:department_id (
              id,
              name
            ),
            academic_years:academic_year_id (
              id,
              year_name
            )
          `)
          .order("name");

        if (user) {
          const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
          const isTeacher = Array.isArray(roles) && roles.some((r: any) => r.role === "teacher");
          const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
          // Only filter if teacher AND not admin. Admins see all classes.
          if (isTeacher && !isAdmin) {
            query = query.eq("teacher_id", user.id);
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error("Classes query error:", error);
          // Return empty array if table doesn't exist
          if (error.code === "406" || error.code === "PGRST116") {
            console.warn("Classes table not found - migrations may not be executed");
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error fetching classes:", error);
        return [];
      }
    },
    staleTime: 60000,
  });
};

export const useClassSubjects = (classId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["class-subjects", classId, user?.id],
    queryFn: async () => {
      try {
        console.log("[useClassSubjects] Fetching for classId:", classId, "user:", user?.id);
        
        if (!classId) {
          console.log("[useClassSubjects] No classId provided, returning empty");
          return [];
        }

        // First, get the class with its department and teacher_id
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("id, department_id, teacher_id")
          .eq("id", classId)
          .single();

        console.log("[useClassSubjects] Class data:", classData, "error:", classError);

        if (classError || !classData) {
          console.warn("[useClassSubjects] Could not fetch class");
          return [];
        }

        const departmentId = classData.department_id;

        // Get user roles once
        let isTeacher = false;
        let isAdmin = false;
        let isTeacherForThisClass = false;
        
        if (user) {
          const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
          isTeacher = Array.isArray(roles) && roles.some((r: any) => r.role === "teacher");
          isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
          console.log("[useClassSubjects] User roles:", { isTeacher, isAdmin });
          
          // Check if this teacher teaches the class (is the class teacher)
          if (isTeacher && !isAdmin) {
            isTeacherForThisClass = classData.teacher_id === user.id;
            console.log("[useClassSubjects] Is teacher for this class:", isTeacherForThisClass, "class teacher_id:", classData.teacher_id, "user id:", user.id);
          }
        }

        // Now fetch subjects for this department and create class_subjects
        let query = supabase
          .from("class_subjects")
          .select(`
            id,
            class_id,
            subject_id,
            teacher_id,
            period_number,
            subjects:subject_id (
              id,
              name,
              code,
              department_id
            )
          `)
          .eq("class_id", classId);

        // For teachers: show all subjects for classes they teach, OR subjects specifically assigned to them
        // For admins: show all subjects
        if (isTeacher && !isAdmin) {
          // Teachers see subjects if:
          // 1. They are the class teacher (teach the whole class), OR
          // 2. The subject is specifically assigned to them (teacher_id = user.id), OR
          // 3. The subject has no teacher assigned (teacher_id IS NULL)
          if (!isTeacherForThisClass) {
            // Not the class teacher, only show subjects assigned to them or unassigned
            query = query.or(`teacher_id.eq.${user.id},teacher_id.is.null`);
          }
          // If they are the class teacher, no filter needed - they see all subjects
        }

        query = query.order("id");

        const { data, error } = await query;
        console.log("[useClassSubjects] Final query result:", data, "error:", error);
        
        if (error) {
          console.error("Class subjects query error:", error);
          if (error.code === "406" || error.code === "PGRST116") {
            console.warn("Class subjects table not found - migrations may not be executed");
            return [];
          }
          throw error;
        }

        // Filter to only show subjects from the class's department
        const filtered = (data || []).filter((cs: any) => {
          const subjectDept = cs.subjects?.department_id;
          const match = subjectDept === departmentId;
          console.log("[useClassSubjects] Checking subject:", cs.subjects?.name, "subject dept:", subjectDept, "class dept:", departmentId, "match:", match);
          return match;
        });

        console.log("[useClassSubjects] Filtered result:", filtered);
        return filtered;
      } catch (error) {
        console.error("Error fetching class subjects:", error);
        return [];
      }
    },
    enabled: !!classId,
    staleTime: 60000,
  });
};
