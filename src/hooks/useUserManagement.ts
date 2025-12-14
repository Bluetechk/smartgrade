import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all profiles with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles separately
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      return profiles?.map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.user_id) || []
      }));
    },
  });

  // Assign role to user
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: role as any }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast({ title: "Role assigned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove role from user
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast({ title: "Role removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve user (set is_approved = true)
  const approveUser = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("Approval error:", error);
        throw error;
      }
      console.log("Approval successful:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast({ title: "User approved successfully" });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error approving user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disapprove user (set is_approved = false)
  const disapproveUser = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_approved: false })
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("Disapproval error:", error);
        throw error;
      }
      console.log("Disapproval successful:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast({ title: "User disapproved" });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error disapproving user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users,
    usersLoading,
    assignRole,
    removeRole,
    approveUser,
    disapproveUser,
  };
};
