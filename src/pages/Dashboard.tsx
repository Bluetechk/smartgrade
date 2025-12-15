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
import { useStudents } from "@/hooks/useStudents";
import { useSaveGrades, useAssessmentTypes } from "@/hooks/useGrades";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null); // null = loading, true/false = determined
  const [roleLoading, setRoleLoading] = useState(true);

  // Check if user is teacher
  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsTeacher(false);
        setRoleLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const roles = Array.isArray(data) ? data.map((r: any) => r.role) : [];
        setIsTeacher(roles.includes("teacher"));
      } catch (err) {
        console.error("Error fetching user role:", err);
        setIsTeacher(false);
      } finally {
        setRoleLoading(false);
      }
    };
    checkRole();
  }, [user]);

  // ----- QuickEditTeacher component (internal) -----
  const QuickEditTeacher = () => {
    const { data: students = [], isLoading: studentsLoading } = useStudents();
    const [departmentId, setDepartmentId] = useState<string>();
    const { data: assessmentTypes = [] } = useAssessmentTypes(departmentId);
    const saveGrades = useSaveGrades();
    const { toast } = useToast();

    const [query, setQuery] = useState("");
    const [editingScores, setEditingScores] = useState<Record<string, string>>({});
    const [classSubjects, setClassSubjects] = useState<any[]>([]);
    const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<string | null>(null);
    const [selectedAssessmentTypeId, setSelectedAssessmentTypeId] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("p3");

    useEffect(() => {
      const fetchClassSubjects = async () => {
        if (!user) return;
        const { data, error } = await supabase
          .from("class_subjects")
          .select("id, subjects:subject_id (id, name), classes:class_id (id, department_id)")
          .eq("teacher_id", user.id);
        if (error) {
          console.error("Error fetching class subjects:", error);
          return;
        }
        setClassSubjects(data || []);
        if (data && data.length > 0) {
          setSelectedClassSubjectId(data[0].id);
          // Extract department_id from the first class_subject
          const firstDepartmentId = data[0].classes?.department_id;
          setDepartmentId(firstDepartmentId);
          console.log("[Dashboard QuickEdit] Set department_id:", firstDepartmentId);
        }
      };
      fetchClassSubjects();
    }, [user]);

    useEffect(() => {
      // When class subject selection changes, update department_id
      if (selectedClassSubjectId && classSubjects.length > 0) {
        const selected = classSubjects.find(cs => cs.id === selectedClassSubjectId);
        if (selected) {
          const newDepartmentId = selected.classes?.department_id;
          setDepartmentId(newDepartmentId);
          console.log("[Dashboard QuickEdit] Updated department_id:", newDepartmentId);
        }
      }
    }, [selectedClassSubjectId, classSubjects]);

    useEffect(() => {
      if (assessmentTypes && assessmentTypes.length > 0) {
        setSelectedAssessmentTypeId(assessmentTypes[0].id);
      }
    }, [assessmentTypes]);

    const filtered = students.filter((s: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (s.full_name || "").toLowerCase().includes(q) || (s.student_id || "").toLowerCase().includes(q);
    });

    const onChangeScore = (studentId: string, value: string) => {
      setEditingScores(prev => ({ ...prev, [studentId]: value }));
    };

    const onSave = (student: any) => {
      if (!selectedClassSubjectId) {
        toast({ title: "No subject", description: "No class subject assigned to you.", variant: "destructive" });
        return;
      }
      if (!selectedAssessmentTypeId) {
        toast({ title: "No assessment type", description: "Please configure an assessment type.", variant: "destructive" });
        return;
      }

      const scoreStr = editingScores[student.id];
      const score = Number(scoreStr);
      if (isNaN(score)) {
        toast({ title: "Invalid score", description: "Please enter a valid number.", variant: "destructive" });
        return;
      }

      const grade = {
        student_id: student.id,
        class_subject_id: selectedClassSubjectId,
        assessment_type_id: selectedAssessmentTypeId,
        max_score: 100,
        period: selectedPeriod as any,
        score,
      };

      saveGrades.mutate([grade], {
        onSuccess: () => {
          toast({ title: "Saved", description: `${student.full_name} score saved.` });
          setEditingScores(prev => ({ ...prev, [student.id]: "" }));
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message || "Failed to save grade", variant: "destructive" });
        }
      });
    };

    return (
      <div>
        <div className="flex gap-3 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student by name or ID"
            className="flex-1 px-3 py-2 border rounded"
          />
          <select value={selectedClassSubjectId || ""} onChange={(e) => setSelectedClassSubjectId(e.target.value)} className="px-3 py-2 border rounded">
            {classSubjects.map((cs) => (
              <option key={cs.id} value={cs.id}>{cs.subjects?.name || cs.id}</option>
            ))}
          </select>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-3 py-2 border rounded">
            <option value="p1">Period 1</option>
            <option value="p2">Period 2</option>
            <option value="p3">Period 3</option>
          </select>
        </div>

        <div className="space-y-3">
          {studentsLoading ? (
            <div>Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground">No students found</div>
          ) : (
            filtered.map((student: any) => (
              <div key={student.id} className="flex items-center justify-between gap-3 p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.photo_url || ""} />
                    <AvatarFallback>{(student.full_name || "").split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{student.full_name}</div>
                    <div className="text-sm text-muted-foreground">{student.student_id || student.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editingScores[student.id] || ""}
                    onChange={(e) => onChangeScore(student.id, e.target.value)}
                    className="w-24 px-2 py-1 border rounded"
                    placeholder="Score"
                  />
                  <button
                    onClick={() => onSave(student)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    disabled={saveGrades.isLoading}
                  >
                    {saveGrades.isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <Navbar />
      
      <main className="p-8 dark:text-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header with Export and Add Student */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back to Udemy Inter. school</p>
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

          {/* Stats Cards - Hide for teachers */}
          {!isTeacher && (
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
                    <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                          </div>
                          <div className={`${stat.bgColor} p-3 rounded-lg`}>
                            <Icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-green-600" />
                          {stat.trend}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students List */}
            <div className="lg:col-span-2">
              {/* If teacher: show Quick Edit; else show Recent Students list */}
              {roleLoading ? (
                <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ) : isTeacher ? (
                <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Quick Edit</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                          Quickly search students and update a score without opening the gradebook
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <QuickEditTeacher />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Recent Students</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                          Latest enrolled students in your school
                        </CardDescription>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search for a student by name or email"
                        className="hidden md:block px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded">
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
                          className="grid grid-cols-5 gap-4 items-center px-4 py-3 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{student.id}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{student.name.toLowerCase().replace(" ", ".")}@example.com</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{student.class}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Female</div>
                          <div className="text-right">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Student Profile Card */}
                <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-blue-100 dark:border-blue-900">
                      <AvatarImage src="/api/placeholder/96/96" />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-semibold">CF</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Cody Fisher</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Science Student</p>
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Gender:</span>
                        <span className="font-medium text-slate-900 dark:text-white">Female</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Age:</span>
                        <span className="font-medium text-slate-900 dark:text-white">17</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">People from the same class</p>
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
              <Card className="border-0 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-900 dark:text-white">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">Gender</p>
                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700">Female</Badge>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">Age</p>
                    <p className="font-medium text-slate-900 dark:text-white">17 years old</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors">
                      💬
                    </button>
                    <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors">
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
