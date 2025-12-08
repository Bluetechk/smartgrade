import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, BookOpen, Settings, Home, Menu, ChevronLeft, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Drawer, DrawerTrigger, DrawerContent, DrawerOverlay, DrawerClose } from "@/components/ui/drawer";

const SidebarLink = ({ to, label, icon: Icon, collapsed = false }: { to: string; label: string; icon: any; collapsed?: boolean }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 ${collapsed ? 'px-3 py-2 justify-center' : 'px-4 py-3'} rounded-md transition-colors ${active ? 'bg-blue-800/80 text-white' : 'text-slate-100 hover:bg-blue-800/60'}`}>
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className={`font-medium text-sm transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>{label}</span>
    </Link>
  );
};

const AdminLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { user } = useAuth();
  const name = (user && (user.user_metadata?.full_name || user.email)) || "Admin User";
  const avatarSrc = user?.user_metadata?.avatar_url || undefined;
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile drawer trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="p-2 rounded-md bg-[#072042] text-white shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <Drawer open={open} onOpenChange={(val) => setOpen(val)}>
        <DrawerTrigger asChild>
          {/* hidden because we use explicit button above on mobile */}
          <span className="hidden" />
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-6 bg-[#072042] min-h-screen text-slate-100">
            <div className="p-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-blue-700 text-white">{name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-blue-200">Administrator</div>
                </div>
                <div className="ml-auto">
                  <DrawerClose className="p-2 rounded-md bg-blue-800/60">
                    <Menu className="w-4 h-4" />
                  </DrawerClose>
                </div>
              </div>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-100 hover:bg-blue-800/60"> <Home className="w-5 h-5"/> <span>Dashboard</span></Link>
              <Link to="/gradebook" className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-100 hover:bg-blue-800/60"> <BookOpen className="w-5 h-5"/> <span>Gradebook</span></Link>
              <Link to="/reports" className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-100 hover:bg-blue-800/60"> <FileText className="w-5 h-5"/> <span>Reports</span></Link>
              <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-100 hover:bg-blue-800/60"> <Users className="w-5 h-5"/> <span>Users</span></Link>
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-md text-slate-100 hover:bg-blue-800/60"> <Settings className="w-5 h-5"/> <span>Settings</span></Link>
            </nav>
          </div>
        </DrawerContent>
      </Drawer>

      <aside className={`${collapsed ? 'w-20' : 'w-72'} hidden md:flex flex-col bg-[#072042] text-slate-100 shadow-lg transition-all duration-200 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <Avatar className={`${collapsed ? 'w-10 h-10' : 'w-14 h-14'}`}>
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt={name} />
              ) : (
                <AvatarFallback className="bg-blue-700 text-white">{name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback>
              )}
            </Avatar>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-blue-200">Administrator</div>
              </div>
            )}
          </div>

          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md bg-blue-800/30 text-slate-100 hover:bg-blue-800/50"
          >
            <ChevronLeft className={`w-5 h-5 transform transition-transform duration-200 ${collapsed ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

          <nav className="p-4 space-y-1 mt-2 flex-1 overflow-y-auto">
          <SidebarLink to="/dashboard" label="Dashboard" icon={Home} collapsed={collapsed} />
          <SidebarLink to="/gradebook" label="Gradebook" icon={BookOpen} collapsed={collapsed} />
          <SidebarLink to="/reports" label="Reports" icon={FileText} collapsed={collapsed} />
          <SidebarLink to="/analytics" label="Analytics" icon={BarChart3} collapsed={collapsed} />
          <SidebarLink to="/admin" label="Users & Settings" icon={Users} collapsed={collapsed} />
          <SidebarLink to="/settings" label="Settings" icon={Settings} collapsed={collapsed} />
        </nav>

        <div className="p-4 border-t border-blue-900/40">
          {!collapsed ? (
            <div className="text-xs text-blue-200">SmartGrade • v1</div>
          ) : (
            <div className="text-center text-xs text-blue-200">v1</div>
          )}
        </div>
      </aside>

      <div className="flex-1">
        <div className="md:pl-0">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
