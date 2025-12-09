import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loginMode, setLoginMode] = useState<"staff" | "student">("staff");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Ensure profile and teacher role exist for staff users
  const ensureProfileAndRole = async (userId: string, fullNameValue: string, emailValue: string) => {
    // Create profile if missing
    const { data: profileExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profileExists) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        user_id: userId,
        full_name: fullNameValue,
        email: emailValue,
        is_approved: false, // staff need admin approval
      });
      if (profileError) throw profileError;
    }

    // Assign teacher role if missing
    const { data: roleExists } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "teacher")
      .maybeSingle();

    if (!roleExists) {
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "teacher",
      });
      if (roleError) throw roleError;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Session present: create profile and assign role now
        await ensureProfileAndRole(data.user.id, fullName, email);
        toast({
          title: "Account created!",
          description: "Your account is pending admin approval. You will be notified once approved.",
        });
        setEmail("");
        setPassword("");
        setFullName("");
      } else if (data.user && !data.session) {
        // No session (email confirmation required) — defer profile creation until first sign-in
        toast({
          title: "Account created!",
          description: "Please verify your email, then sign in. Your profile will be created and sent for admin approval on first sign-in.",
        });
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For student login, convert student ID to email format
      const loginEmail = loginMode === "student" 
        ? `${studentId}@student.local` 
        : email;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;

      // After successful sign-in, ensure profile and teacher role exist (staff path)
      const { data: sessionData } = await supabase.auth.getSession();
      const authedUser = sessionData.session?.user;
      if (authedUser && loginMode === "staff") {
        try {
          await ensureProfileAndRole(authedUser.id, fullName || authedUser.user_metadata?.full_name || "", loginEmail);
        } catch (profileErr: any) {
          console.error("Profile/role setup error:", profileErr?.message || profileErr);
          // Don't block login, just surface a warning
          toast({
            title: "Signed in, but setup incomplete",
            description: "Your profile or teacher role could not be created automatically. Please contact an admin.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">SmartGrade</span>
          </div>
          <p className="text-muted-foreground">School Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up (Staff)</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={loginMode === "staff" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setLoginMode("staff")}
                    >
                      Staff Login
                    </Button>
                    <Button
                      type="button"
                      variant={loginMode === "student" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setLoginMode("student")}
                    >
                      Student Login
                    </Button>
                  </div>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                  {loginMode === "student" ? (
                    <div className="space-y-2">
                      <Label htmlFor="signin-studentid">Student ID</Label>
                      <Input
                        id="signin-studentid"
                        type="text"
                        placeholder="Enter your Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
