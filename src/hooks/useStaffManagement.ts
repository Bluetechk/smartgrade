import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStaffManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all teachers/staff with their details
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      // Get all users with teacher role
      const { data: teacherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "teacher");

      if (rolesError) throw rolesError;

      if (!teacherRoles || teacherRoles.length === 0) return [];

      const userIds = teacherRoles.map(tr => tr.user_id);

      // Get profiles for teachers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get classes where they are sponsors
      const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select("id, name, teacher_id, departments:department_id(name), academic_years:academic_year_id(year_name)")
        .in("teacher_id", profiles?.map(p => p.id) || []);

      if (classesError) throw classesError;

      // Get class_subjects where they teach
      const { data: classSubjects, error: subjectsError } = await supabase
        .from("class_subjects")
        .select("id, teacher_id, subjects:subject_id(name, code), classes:class_id(name)")
        .in("teacher_id", profiles?.map(p => p.id) || []);

      if (subjectsError) throw subjectsError;

      // Combine data
      return profiles?.map(profile => ({
        ...profile,
        classes: classes?.filter(c => c.teacher_id === profile.id) || [],
        subjects: classSubjects?.filter(cs => cs.teacher_id === profile.id) || [],
      })) || [];
    },
  });

  // Approve teacher
  const approveTeacher = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({ title: "Teacher approved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving teacher",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject/Unapprove teacher
  const rejectTeacher = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: false })
        .eq("id", profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({ title: "Teacher access revoked" });
    },
    onError: (error: any) => {
      toast({
        title: "Error revoking access",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign subject to teacher
  const assignSubject = useMutation({
    mutationFn: async ({ teacherId, classSubjectId }: { teacherId: string; classSubjectId: string }) => {
      const { error } = await supabase
        .from("class_subjects")
        .update({ teacher_id: teacherId })
        .eq("id", classSubjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["class-subjects"] });
      toast({ title: "Subject assigned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning subject",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove subject from teacher
  const removeSubject = useMutation({
    mutationFn: async (classSubjectId: string) => {
      const { error } = await supabase
        .from("class_subjects")
        .update({ teacher_id: null })
        .eq("id", classSubjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["class-subjects"] });
      toast({ title: "Subject removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing subject",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign class sponsorship
  const assignClassSponsor = useMutation({
    mutationFn: async ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      const { error } = await supabase
        .from("classes")
        .update({ teacher_id: teacherId })
        .eq("id", classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Class sponsor assigned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning class sponsor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove class sponsorship
  const removeClassSponsor = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from("classes")
        .update({ teacher_id: null })
        .eq("id", classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({ title: "Class sponsor removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing class sponsor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    staff,
    staffLoading,
    approveTeacher,
    rejectTeacher,
    assignSubject,
    removeSubject,
    assignClassSponsor,
    removeClassSponsor,
  };
};

