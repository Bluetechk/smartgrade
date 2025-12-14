import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DebugUserInfo: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[] | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!user) return;
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const { data: p } = await supabase.from("profiles").select("*, is_approved").eq("user_id", user.id).maybeSingle();
      if (!mounted) return;
      setRoles(Array.isArray(r) ? r.map((x: any) => x.role) : []);
      setProfile(p || null);
    };
    fetch();
    return () => { mounted = false; };
  }, [user]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-300 text-sm">
      <strong>Debug — Current User</strong>
      <div className="mt-2">
        <div><strong>id:</strong> {user?.id}</div>
        <div><strong>email:</strong> {user?.email}</div>
        <div><strong>roles:</strong> {roles ? roles.join(", ") : "(loading)"}</div>
        <div><strong>profile.is_approved:</strong> {profile ? String(profile.is_approved) : "(none)"}</div>
      </div>
    </div>
  );
};

export default DebugUserInfo;
