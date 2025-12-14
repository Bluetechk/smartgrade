import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, AlertTriangle, Users, Building, School, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics, useTopStudents, useAtRiskStudents } from "@/hooks/useAnalytics";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useTeacherClassAnalytics } from "@/hooks/useTeacherClassAnalytics";
import { useTeacherTopStudents } from "@/hooks/useTeacherTopStudents";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Analytics = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("p3");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const roles = Array.isArray(data) ? data.map((r: any) => r.role) : [];
        setIsAdmin(roles.includes("admin"));
      } catch (err) {
        console.error("Error fetching user role:", err);
        setIsAdmin(false);
      }
    };
    checkRole();
  }, [user]);

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics(selectedPeriod);
  const { data: topStudents = [], isLoading: topStudentsLoading } = useTopStudents(selectedPeriod);
  const { data: atRiskStudents = [], isLoading: atRiskLoading } = useAtRiskStudents(selectedPeriod);
  const { data: adminAnalytics, isLoading: adminAnalyticsLoading } = useAdminAnalytics(selectedPeriod);
  const { data: teacherClassAnalytics, isLoading: teacherAnalyticsLoading } = useTeacherClassAnalytics(selectedPeriod);
  const { data: teacherTopStudents = [], isLoading: teacherTopStudentsLoading } = useTeacherTopStudents(selectedPeriod);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">School-wide performance analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select defaultValue="2024-2025">
            <SelectTrigger>
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2023-2024">2023-2024</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p1">Period 1</SelectItem>
              <SelectItem value="p2">Period 2</SelectItem>
              <SelectItem value="p3">Period 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {analyticsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analyticsData?.passRate}%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {analyticsData?.passingStudents} / {analyticsData?.totalStudents} students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Fail Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analyticsData?.failRate}%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {analyticsData?.failingStudents} / {analyticsData?.totalStudents} students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{atRiskStudents.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Failing 3+ subjects</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {analyticsData?.totalStudents ? 
                      ((atRiskStudents.length / analyticsData.totalStudents) * 100).toFixed(1) 
                      : 0}% of total students
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {isAdmin ? "School-Wide Top 5" : "Class Top 5"}
              </CardTitle>
              <CardDescription>{isAdmin ? "Highest performing students (Period 3)" : "Top performers in your sponsor class"}</CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                topStudentsLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-12" />
                      </div>
                    ))}
                  </div>
                ) : topStudents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No data available for this period</p>
                ) : (
                  <div className="space-y-4">
                    {topStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.class}</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-primary">{student.average}%</div>
                      </div>
                    ))}
                  </div>
                )
              ) : teacherTopStudentsLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-12" />
                    </div>
                  ))}
                </div>
              ) : teacherTopStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No students found in your class</p>
              ) : (
                <div className="space-y-4">
                  {teacherTopStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{student.name}</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{student.average}%</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Students Needing Attention
              </CardTitle>
              <CardDescription>Students failing 3 or more subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-12" />
                    </div>
                  ))}
                </div>
              ) : atRiskStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No at-risk students found</p>
              ) : (
                <div className="space-y-4">
                  {atRiskStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-warning/30 rounded-lg bg-warning/5">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.class}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-warning">{student.failingSubjects}</p>
                        <p className="text-xs text-muted-foreground">failing subjects</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Admin-wide analytics for admins OR Teacher class analytics for teachers */}
      <section className="mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            {isAdmin ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground">Institution Analytics</h2>
                <p className="text-sm text-muted-foreground">Organization-wide counts and distributions</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-foreground">Class Analytics - {teacherClassAnalytics?.className}</h2>
                <p className="text-sm text-muted-foreground">Your sponsor class performance and distribution</p>
              </>
            )}
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isAdmin ? (
            adminAnalyticsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminAnalytics?.totalStudents || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all classes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminAnalytics?.totalClasses || 0}</div>
                    <p className="text-xs text-muted-foreground">Active classes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Departments</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminAnalytics?.totalDepartments || 0}</div>
                    <p className="text-xs text-muted-foreground">Active departments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminAnalytics?.averagePerformance || 0}%</div>
                    <p className="text-xs text-muted-foreground">School-wide average</p>
                  </CardContent>
                </Card>
              </>
            )
          ) : teacherAnalyticsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherClassAnalytics?.totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">In your sponsor class</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherClassAnalytics?.totalSubjects || 0}</div>
                  <p className="text-xs text-muted-foreground">Subjects taught</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Class Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherClassAnalytics?.averagePerformance || 0}%</div>
                  <p className="text-xs text-muted-foreground">Class average score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Class Name</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherClassAnalytics?.className || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">Your sponsor class</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isAdmin ? (
            <>
              {/* Admin Charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Distribution by Class</CardTitle>
                  <CardDescription>Number of students in each class</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : adminAnalytics?.studentDistributionByClass?.length ? (
                    <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <PieChart>
                        <Pie
                          data={adminAnalytics.studentDistributionByClass.map((item) => ({ name: item.className, value: item.count }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {adminAnalytics.studentDistributionByClass.map((_, index) => (
                            <Cell key={`class-cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"][index % 8]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Distribution by Department</CardTitle>
                  <CardDescription>Number of students in each department</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : adminAnalytics?.studentDistributionByDepartment?.length ? (
                    <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <PieChart>
                        <Pie
                          data={adminAnalytics.studentDistributionByDepartment.map((item) => ({ name: item.departmentName, value: item.count }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {adminAnalytics.studentDistributionByDepartment.map((_, index) => (
                            <Cell key={`dept-cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"][index % 8]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Teacher Charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Distribution by Subject</CardTitle>
                  <CardDescription>Number of students taking each subject</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : teacherClassAnalytics?.studentDistributionBySubject?.length ? (
                    <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <PieChart>
                        <Pie
                          data={teacherClassAnalytics.studentDistributionBySubject.map((item) => ({ name: item.subjectName, value: item.count }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {teacherClassAnalytics.studentDistributionBySubject.map((_, index) => (
                            <Cell key={`subject-cell-${index}`} fill={["#16a34a", "#15803d", "#86efac", "#22c55e", "#4ade80"][index % 5]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Students distribution across grade ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : teacherClassAnalytics?.gradeDistribution?.length ? (
                    <ChartContainer config={{ students: { label: "Students", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <BarChart data={teacherClassAnalytics.gradeDistribution.map((item) => ({ name: item.gradeRange, students: item.count }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="students" name="Students" fill="#16a34a" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isAdmin ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Average Performance by Class</CardTitle>
                  <CardDescription>Average scores per class</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : adminAnalytics?.classPerformance?.length ? (
                    <ChartContainer config={{ averageScore: { label: "Average Score", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <BarChart data={adminAnalytics.classPerformance.map((item) => ({ name: item.className, averageScore: item.averageScore }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="averageScore" name="Average Score" fill="#3b82f6" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Students distribution across grade ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  {adminAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : adminAnalytics?.gradeDistribution?.length ? (
                    <ChartContainer config={{ students: { label: "Students", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <BarChart data={adminAnalytics.gradeDistribution.map((item) => ({ name: item.gradeRange, students: item.count }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="students" name="Students" fill="#10b981" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Average Performance by Subject</CardTitle>
                  <CardDescription>Average scores per subject in your class</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : teacherClassAnalytics?.subjectPerformance?.length ? (
                    <ChartContainer config={{ averageScore: { label: "Average Score", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <BarChart data={teacherClassAnalytics.subjectPerformance.map((item) => ({ name: item.subjectName, averageScore: item.averageScore }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="averageScore" name="Average Score" fill="#16a34a" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Overview</CardTitle>
                  <CardDescription>Subjects and student enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherAnalyticsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : teacherClassAnalytics?.subjectPerformance?.length ? (
                    <ChartContainer config={{ studentCount: { label: "Students", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
                      <BarChart data={teacherClassAnalytics.subjectPerformance.map((item) => ({ name: item.subjectName, studentCount: item.studentCount }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="studentCount" name="Students" fill="#15803d" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>
      </main>
    </div>
  );
};

export default Analytics;
