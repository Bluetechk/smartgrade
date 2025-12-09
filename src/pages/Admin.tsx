import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, UserPlus, School, BookOpen, Users, GraduationCap, Building, X, BarChart3, TrendingUp } from "lucide-react";
import { StudentManagementTab } from "@/components/StudentManagementTab";
import { ClassManagementTab } from "@/components/ClassManagementTab";
import { SubjectManagementTab } from "@/components/SubjectManagementTab";
import { DepartmentManagementTab } from "@/components/DepartmentManagementTab";
import AdminLayout from "@/components/AdminLayout";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const Admin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { users, usersLoading, assignRole, removeRole } = useUserManagement();

  const [academicYearForm, setAcademicYearForm] = useState({
    year_name: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const handleCreateAcademicYear = async () => {
    const { error } = await supabase.from("academic_years").insert(academicYearForm);
    if (error) {
      toast({ title: "Error creating academic year", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Academic year created successfully" });
      setAcademicYearForm({ year_name: "", start_date: "", end_date: "", is_current: false });
    }
  };

  const handleCreateDepartment = async () => {
    const { error } = await supabase.from("departments").insert([departmentForm]);
    if (error) {
      toast({ title: "Error creating department", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Department created successfully" });
      setDepartmentForm({ name: "", description: "" });
    }
  };

  const handleCreateSubject = async () => {
    const { error } = await supabase.from("subjects").insert(subjectForm);
    if (error) {
      toast({ title: "Error creating subject", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subject created successfully" });
      setSubjectForm({ name: "", code: "", description: "" });
    }
  };


  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserPlus className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="students">
              <GraduationCap className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="classes">
              <Building className="h-4 w-4 mr-2" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="subjects">
              <BookOpen className="h-4 w-4 mr-2" />
              Subjects
            </TabsTrigger>
            <TabsTrigger value="academic">
              <School className="h-4 w-4 mr-2" />
              Years
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Users className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminAnalyticsTab />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User & Role Management</CardTitle>
                <CardDescription>Assign roles to users for testing</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {user.user_roles && user.user_roles.length > 0 ? (
                              user.user_roles.map((ur: any) => (
                                <span key={ur.role} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                                  {ur.role}
                                  <button
                                    onClick={() => removeRole.mutate({ userId: user.user_id, role: ur.role })}
                                    className="hover:bg-destructive/20 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No roles assigned</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select onValueChange={(role) => assignRole.mutate({ userId: user.user_id, role })}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Add role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No users found. Create accounts via the Auth page first.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <StudentManagementTab />
          </TabsContent>

          <TabsContent value="classes">
            <ClassManagementTab />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectManagementTab />
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Create Academic Year</CardTitle>
                <CardDescription>Set up academic years for testing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Year Name</Label>
                  <Input
                    placeholder="2024-2025"
                    value={academicYearForm.year_name}
                    onChange={(e) => setAcademicYearForm({ ...academicYearForm, year_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={academicYearForm.start_date}
                      onChange={(e) => setAcademicYearForm({ ...academicYearForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={academicYearForm.end_date}
                      onChange={(e) => setAcademicYearForm({ ...academicYearForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateAcademicYear}>Create Academic Year</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// Admin Analytics Tab Component
const AdminAnalyticsTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("p3");
  const { data: analytics, isLoading } = useAdminAnalytics(selectedPeriod);

  // Colors for charts
  const COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
    averageScore: {
      label: "Average Score",
      color: "hsl(var(--chart-2))",
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p1">Period 1</SelectItem>
            <SelectItem value="p2">Period 2</SelectItem>
            <SelectItem value="p3">Period 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalClasses || 0}</div>
            <p className="text-xs text-muted-foreground">Active classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalDepartments || 0}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averagePerformance || 0}%</div>
            <p className="text-xs text-muted-foreground">School-wide average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Students by Class */}
        <Card>
          <CardHeader>
            <CardTitle>Student Distribution by Class</CardTitle>
            <CardDescription>Number of students in each class</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.studentDistributionByClass && analytics.studentDistributionByClass.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={analytics.studentDistributionByClass.map((item) => ({
                      name: item.className,
                      value: item.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.studentDistributionByClass.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Students by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Student Distribution by Department</CardTitle>
            <CardDescription>Number of students in each department</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.studentDistributionByDepartment && analytics.studentDistributionByDepartment.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={analytics.studentDistributionByDepartment.map((item) => ({
                      name: item.departmentName,
                      value: item.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.studentDistributionByDepartment.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Class Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Average Performance by Class</CardTitle>
            <CardDescription>Average scores across all classes</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.classPerformance && analytics.classPerformance.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={analytics.classPerformance.map((item) => ({
                  name: item.className,
                  "Average Score": item.averageScore,
                  "Students": item.studentCount,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="Average Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Students distribution across grade ranges</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.gradeDistribution && analytics.gradeDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={analytics.gradeDistribution.map((item) => ({
                  name: item.gradeRange,
                  "Students": item.count,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="Students" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
