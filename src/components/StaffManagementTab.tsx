import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaffManagement } from "@/hooks/useStaffManagement";
import { useClasses } from "@/hooks/useClasses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, BookOpen, Users, AlertCircle, UserCheck, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const StaffManagementTab = () => {
  const { staff, staffLoading, approveTeacher, rejectTeacher, assignSubject, removeSubject, assignClassSponsor, removeClassSponsor } = useStaffManagement();
  const { data: classes } = useClasses();
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"subject" | "class" | null>(null);

  // Fetch all subjects
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all class_subjects for assignment
  const { data: classSubjects } = useQuery({
    queryKey: ["all-class-subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_subjects")
        .select(`
          *,
          subjects:subject_id(id, name, code),
          classes:class_id(id, name)
        `);
      if (error) throw error;
      return data || [];
    },
  });

  const handleAssignSubject = (teacherId: string, classSubjectId: string) => {
    assignSubject.mutate({ teacherId, classSubjectId });
  };

  const handleAssignClass = (teacherId: string, classId: string) => {
    assignClassSponsor.mutate({ teacherId, classId });
  };

  const openDialog = (teacherId: string, type: "subject" | "class") => {
    setSelectedTeacher(teacherId);
    setDialogType(type);
    setDialogOpen(true);
  };

  if (staffLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingTeachers = staff?.filter(s => !s.is_approved) || [];
  const approvedTeachers = staff?.filter(s => s.is_approved) || [];

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingTeachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Teacher Approvals
            </CardTitle>
            <CardDescription>Teachers waiting for admin approval to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{teacher.full_name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending Approval
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveTeacher.mutate(teacher.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Management ({approvedTeachers.length})
          </CardTitle>
          <CardDescription>Manage teacher roles, subject assignments, and class sponsorships</CardDescription>
        </CardHeader>
        <CardContent>
          {approvedTeachers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No approved teachers found</p>
          ) : (
            <div className="space-y-6">
              {approvedTeachers.map((teacher) => (
                <Card key={teacher.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {teacher.full_name}
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">{teacher.email}</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectTeacher.mutate(teacher.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Revoke Access
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Class Sponsorships */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Class Sponsorships ({teacher.classes?.length || 0})
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(teacher.id, "class")}
                        >
                          Assign Class
                        </Button>
                      </div>
                      {teacher.classes && teacher.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {teacher.classes.map((cls: any) => (
                            <Badge key={cls.id} variant="secondary" className="flex items-center gap-1">
                              {cls.name}
                              <button
                                onClick={() => removeClassSponsor.mutate(cls.id)}
                                className="ml-1 hover:text-red-600"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No class sponsorships assigned</p>
                      )}
                    </div>

                    {/* Subject Assignments */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Subject Assignments ({teacher.subjects?.length || 0})
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(teacher.id, "subject")}
                        >
                          Assign Subject
                        </Button>
                      </div>
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects.map((subj: any) => (
                            <Badge key={subj.id} variant="secondary" className="flex items-center gap-1">
                              {subj.subjects?.name || "Unknown"} ({subj.classes?.name || "N/A"})
                              <button
                                onClick={() => removeSubject.mutate(subj.id)}
                                className="ml-1 hover:text-red-600"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No subjects assigned</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "subject" ? "Assign Subject to Teacher" : "Assign Class Sponsorship"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "subject"
                ? "Select a class-subject combination to assign to this teacher"
                : "Select a class to make this teacher the sponsor"}
            </DialogDescription>
          </DialogHeader>
          {dialogType === "subject" && selectedTeacher && (
            <div className="space-y-4">
              <Select
                onValueChange={(classSubjectId) => {
                  handleAssignSubject(selectedTeacher, classSubjectId);
                  setDialogOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class-subject" />
                </SelectTrigger>
                <SelectContent>
                  {classSubjects?.map((cs: any) => (
                    <SelectItem key={cs.id} value={cs.id}>
                      {cs.classes?.name || "Unknown Class"} - {cs.subjects?.name || "Unknown Subject"} ({cs.subjects?.code || ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {dialogType === "class" && selectedTeacher && (
            <div className="space-y-4">
              <Select
                onValueChange={(classId) => {
                  handleAssignClass(selectedTeacher, classId);
                  setDialogOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.departments?.name || ""} ({cls.academic_years?.year_name || ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

