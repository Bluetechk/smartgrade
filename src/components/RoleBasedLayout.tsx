import React, { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import TeacherLayout from "./TeacherLayout";

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkRole = async () => {
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        if (!mounted) return;
        const roles = Array.isArray(data) ? data.map((r: any) => r.role) : [];
        setIsAdmin(roles.includes("admin"));
      } catch (err) {
        console.error("Error fetching roles for layout:", err);
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkRole();
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <TeacherLayout>{children}</TeacherLayout>;
}
