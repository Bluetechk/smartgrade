import React from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LayoutDashboard, BookOpen, FileText, BarChart3 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLayoutContext } from "@/contexts/LayoutContext";

const Navbar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const layout = useLayoutContext();


  React.useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      if (!user) return setIsAdmin(false);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!mounted) return;
      setIsAdmin(Array.isArray(data) && data.some((r: any) => r.role === "admin"));
    };
    fetchRoles();
    return () => { mounted = false; };
  }, [user]);

  // If we're inside the AdminLayout and the user is an admin, don't render the global Navbar
  if (layout?.insideAdminLayout && layout?.isAdmin) return null;

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/gradebook", icon: BookOpen, label: "Gradebook" },
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">SmartGrade</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-white">SG</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8}>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && <DropdownMenuItem onClick={() => { navigate('/admin'); }}>Admin Panel</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => { navigate('/auth'); }}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
