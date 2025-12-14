import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      try {
        let isTeacher = false;
        let isAdmin = false;
        if (user) {
          const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
          isTeacher = Array.isArray(roles) && roles.some((r: any) => r.role === "teacher");
          isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
        }

        // Get total students (global for admins; limited to teacher's classes for teachers)
        let totalStudents = 0;
        if (isTeacher && !isAdmin && user) {
          const { count, error } = await supabase
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("classes.teacher_id", user.id);
          if (error) throw error;
          totalStudents = count || 0;
        } else {
          const { count, error } = await supabase
            .from("students")
            .select("id", { count: "exact", head: true });
          if (error) throw error;
          totalStudents = count || 0;
        }

        // Get total classes
        let totalClasses = 0;
        if (isTeacher && !isAdmin && user) {
          const { count, error } = await supabase
            .from("classes")
            .select("id", { count: "exact", head: true })
            .eq("teacher_id", user.id);
          if (error) throw error;
          totalClasses = count || 0;
        } else {
          const { count, error } = await supabase
            .from("classes")
            .select("id", { count: "exact", head: true });
          if (error) throw error;
          totalClasses = count || 0;
        }

        // Get current academic year
        let currentYear = "Not Set";
        const { data: academicYears, error: yearError } = await supabase
          .from("academic_years")
          .select("year_name")
          .eq("is_current", true);

        if (!yearError && academicYears && academicYears.length > 0) {
          currentYear = academicYears[0].year_name;
        }

        return {
          totalStudents,
          totalClasses,
          currentYear,
        };
      } catch (error) {
        console.error("Dashboard stats error:", error);
        // Return default values instead of throwing
        return {
          totalStudents: 0,
          totalClasses: 0,
          currentYear: "Error - Check Migrations",
        };
      }
    },
    staleTime: 60000, // Cache for 1 minute
  });
};
