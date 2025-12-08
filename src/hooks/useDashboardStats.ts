import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        // Get total students
        const { count: totalStudents, error: studentsError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        if (studentsError) {
          console.error("Students query error:", studentsError);
          // Return default values if table doesn't exist
          if (studentsError.code === "406" || studentsError.code === "PGRST116") {
            console.warn("Students table not found - migrations may not be executed");
            return {
              totalStudents: 0,
              totalClasses: 0,
              currentYear: "Not Set",
            };
          }
          throw studentsError;
        }

        // Get total classes
        const { count: totalClasses, error: classesError } = await supabase
          .from("classes")
          .select("*", { count: "exact", head: true });

        if (classesError) {
          console.error("Classes query error:", classesError);
          throw classesError;
        }

        // Get current academic year
        let currentYear = "Not Set";
        const { data: academicYears, error: yearError } = await supabase
          .from("academic_years")
          .select("year_name")
          .eq("is_current", true);

        if (yearError) {
          console.warn("Academic years query error:", yearError);
          // Don't throw - just use default value
        } else if (academicYears && academicYears.length > 0) {
          currentYear = academicYears[0].year_name;
        }

        return {
          totalStudents: totalStudents || 0,
          totalClasses: totalClasses || 0,
          currentYear: currentYear,
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
