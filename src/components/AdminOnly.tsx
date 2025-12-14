import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminOnly: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      if (!user) return; // ProtectedRoute already handles redirect to auth
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const isAdmin = Array.isArray(data) && data.some((r: any) => r.role === "admin");
        if (!isAdmin && mounted) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
        if (mounted) navigate("/dashboard");
      } finally {
        if (mounted) setChecking(false);
      }
    };

    if (!loading && user) {
      checkAdmin();
    } else if (!loading && !user) {
      // Let ProtectedRoute handle redirect
      setChecking(false);
    }

    return () => { mounted = false; };
  }, [user, loading, navigate]);

  if (loading || checking) return null;
  return <>{children}</>;
};

export default AdminOnly;
