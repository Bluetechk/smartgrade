/// <reference types="react-router-dom" />

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardRouter from "@/components/DashboardRouter";
import Gradebook from "./pages/Gradebook";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import AdminLayout from "@/components/AdminLayout";
import AdminOnly from "@/components/AdminOnly";
import StatisticalDashboard from "@/components/StatisticalDashboard";
import TeacherLayout from "@/components/TeacherLayout";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <RouterProvider
            router={createBrowserRouter(
              createRoutesFromElements(
                <Route element={<AuthProvider><Outlet /></AuthProvider>}>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/statistical"
                    element={
                      <ProtectedRoute>
                        <AdminOnly>
                          <AdminLayout>
                            <StatisticalDashboard embedded />
                          </AdminLayout>
                        </AdminOnly>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/gradebook" element={<ProtectedRoute><RoleBasedLayout><Gradebook /></RoleBasedLayout></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><RoleBasedLayout><Reports /></RoleBasedLayout></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><RoleBasedLayout><Analytics /></RoleBasedLayout></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><AdminOnly><Admin /></AdminOnly></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              ),
              {
                future: {
                  // @ts-ignore
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                },
              }
            )}
          />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
