import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  FileText,
  BarChart3,
  Settings,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();

  const statItems = [
    { 
      icon: Users, 
      label: "Total Students", 
      value: stats?.totalStudents.toString() || "0",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12% from last month"
    },
    { 
      icon: BookOpen, 
      label: "Active Classes", 
      value: stats?.totalClasses.toString() || "0",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "Current semester"
    },
    { 
      icon: GraduationCap, 
      label: "Academic Year", 
      value: stats?.currentYear || "N/A",
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "Active"
    },
    { 
      icon: TrendingUp, 
      label: "Average GPA", 
      value: "3.45",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "+0.15 from last period"
    },
  ];

  const recentStudents = [
    { id: "547030", name: "Cody Fisher", class: "Senior High", role: "Science Student", avatar: "CF" },
    { id: "870326", name: "Michelle Rivera", class: "Junior High", role: "Math Student", avatar: "MR" },
    { id: "870337", name: "Mercy Miles", class: "Senior High", role: "English Student", avatar: "MM" },
    { id: "370357", name: "Debbie Baker", class: "Elementary", role: "General Student", avatar: "DB" },
    { id: "270374", name: "Benjamin McKinney", class: "Junior High", role: "Science Student", avatar: "BM" },
  ];

  const menuItems = [
    { label: "Dashboard", icon: BarChart3, path: "/dashboard", current: true },
    { label: "Teachers", icon: Users, path: "/admin" },
    { label: "Students/ classes", icon: BookOpen, path: "/admin" },
    { label: "Billing", icon: FileText, path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Export and Add Student */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-600">Welcome back to Udemy Inter. school</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="text-slate-700 border-slate-300"
                onClick={() => {/* Export CSV functionality */}}
              >
                Export CSV
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                onClick={() => navigate("/admin")}
              >
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              statItems.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.bgColor} p-3 rounded-lg`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        {stat.trend}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students List */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg text-slate-900">Recent Students</CardTitle>
                      <CardDescription className="text-slate-600 mt-1">
                        Latest enrolled students in your school
                      </CardDescription>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search for a student by name or email"
                      className="hidden md:block px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-slate-700 px-4 py-2 bg-slate-50 rounded">
                      <div>Student ID</div>
                      <div>Email address</div>
                      <div>Class</div>
                      <div>Gender</div>
                      <div></div>
                    </div>

                    {/* Student Rows */}
                    {recentStudents.map((student) => (
                      <div 
                        key={student.id}
                        className="grid grid-cols-5 gap-4 items-center px-4 py-3 rounded hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="text-sm font-medium text-slate-900">{student.id}</div>
                        <div className="text-sm text-slate-600">{student.name.toLowerCase().replace(" ", ".")}@example.com</div>
                        <div className="text-sm text-slate-600">{student.class}</div>
                        <div className="text-sm text-slate-600">Female</div>
                        <div className="text-right">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Student Profile Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-blue-100">
                      <AvatarImage src="/api/placeholder/96/96" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">CF</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Cody Fisher</h3>
                    <p className="text-slate-600 text-sm mb-4">Science Student</p>
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Gender:</span>
                        <span className="font-medium text-slate-900">Female</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Age:</span>
                        <span className="font-medium text-slate-900">17</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">People from the same class</p>
                    <div className="flex justify-center gap-2 mb-6">
                      {Array(4).fill(0).map((_, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-900">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Gender</p>
                    <Badge variant="outline" className="bg-slate-50">Female</Badge>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Age</p>
                    <p className="font-medium text-slate-900">17 years old</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-medium transition-colors">
                      💬
                    </button>
                    <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-medium transition-colors">
                      ✉️
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
