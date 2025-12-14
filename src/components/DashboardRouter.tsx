import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Dashboard from "@/pages/Dashboard";
import AdminLayout from "@/components/AdminLayout";
import TeacherLayout from "@/components/TeacherLayout";
import StatisticalDashboard from "@/components/StatisticalDashboard";

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
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
        console.error("Error fetching roles for dashboard router:", err);
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    check();
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
    return (
      <AdminLayout>
        <StatisticalDashboard embedded />
      </AdminLayout>
    );
  }

  return (
    <TeacherLayout>
      <Dashboard />
    </TeacherLayout>
  );
};

export default DashboardRouter;
