import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      // Check if user is a teacher and if they're approved (but admins skip this)
      const checkTeacherApproval = async () => {
        try {
          // Check if user has admin role first — admins bypass approval
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          const hasAdminRole = roles?.some(r => r.role === "admin") || false;
          if (hasAdminRole) {
            // Admins are always approved
            setIsApproved(true);
            setCheckingApproval(false);
            return;
          }

          const hasTeacherRole = roles?.some(r => r.role === "teacher") || false;
          setIsTeacher(hasTeacherRole);

          if (hasTeacherRole) {
            // Check approval status
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_approved")
              .eq("user_id", user.id)
              .single();

            setIsApproved(profile?.is_approved || false);
          } else {
            // Not a teacher, allow access
            setIsApproved(true);
          }
        } catch (error) {
          console.error("Error checking teacher approval:", error);
          // On error, allow access (fail open)
          setIsApproved(true);
        } finally {
          setCheckingApproval(false);
        }
      };

      checkTeacherApproval();
    }
  }, [user, loading, navigate]);

  if (loading || checkingApproval) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If teacher is not approved, show approval pending message
  if (isTeacher && !isApproved) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Access Pending Approval
            </CardTitle>
            <CardDescription>
              Your account is waiting for administrator approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have been assigned the teacher role, but an administrator needs to approve your account before you can access the system.
              Please contact your administrator for access.
            </p>
            <button
              onClick={() => {
                supabase.auth.signOut();
                navigate("/auth");
              }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Sign Out
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
