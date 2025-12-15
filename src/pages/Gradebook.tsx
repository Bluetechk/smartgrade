import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useClasses, useClassSubjects } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useGrades, useAssessmentTypes, useSaveGrades } from "@/hooks/useGrades";
import { Skeleton } from "@/components/ui/skeleton";

const Gradebook = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("p1");
  const [isLocked, setIsLocked] = useState(true);
  const [editedGrades, setEditedGrades] = useState<Record<string, Record<string, string>>>({});

  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: classSubjects, isLoading: subjectsLoading } = useClassSubjects(selectedClass);
  const { data: students, isLoading: studentsLoading } = useStudents(selectedClass);
  
  // Extract department_id from selected class
  const [departmentId, setDepartmentId] = useState<string>();
  useEffect(() => {
    if (selectedClass && classes) {
      const selectedClassData = classes.find(c => c.id === selectedClass);
      setDepartmentId(selectedClassData?.department_id);
      console.log("[Gradebook] Selected class department_id:", selectedClassData?.department_id);
    }
  }, [selectedClass, classes]);
  
  const { data: assessmentTypes, isLoading: assessmentLoading } = useAssessmentTypes(departmentId);
  const { data: grades, isLoading: gradesLoading } = useGrades(selectedSubject, selectedPeriod);
  const saveGradesMutation = useSaveGrades();

  // Debug logging
  useEffect(() => {
    console.log("[Gradebook] selectedClass:", selectedClass, "classes count:", classes?.length);
    console.log("[Gradebook] selectedSubject:", selectedSubject, "classSubjects:", classSubjects);
  }, [selectedClass, classes, selectedSubject, classSubjects]);

  // Initialize edited grades when data loads
  // Initialize edited grades when data loads (store as strings to allow free editing)
  useEffect(() => {
    if (grades && students && assessmentTypes) {
      const initialGrades: Record<string, Record<string, string>> = {};
      students.forEach(student => {
        initialGrades[student.id] = {};
        assessmentTypes.forEach(at => {
          const existingGrade = grades.find(g => 
            g.student_id === student.id && g.assessment_type_id === at.id
          );
          initialGrades[student.id][at.id] = existingGrade ? String(existingGrade.score) : "";
        });
      });
      setEditedGrades(initialGrades);
    }
  }, [grades, students, assessmentTypes]);

  const handleGradeChange = (studentId: string, assessmentTypeId: string, value: string) => {
    // Allow free editing as string so user can delete and type
    const sanitized = value.replace(/[^\d.]/g, "");
    setEditedGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentTypeId]: sanitized,
      },
    }));
  };

  const handleGradeBlur = (studentId: string, assessmentTypeId: string, maxPoints: number) => {
    const raw = editedGrades[studentId]?.[assessmentTypeId];
    const numValue = raw ? Number(raw) : NaN;
    if (isNaN(numValue)) {
      // If empty or invalid, leave as empty string (will be treated as 0 on save)
      setEditedGrades(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [assessmentTypeId]: "",
        },
      }));
      return;
    }
    const clamped = Math.min(Math.max(0, Math.floor(numValue)), maxPoints);
    setEditedGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentTypeId]: String(clamped),
      },
    }));
  };

  const handleSaveGrades = () => {
    const gradesToSave: any[] = [];
    const invalidGrades: any[] = [];
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    for (const studentId in editedGrades) {
      for (const assessmentTypeId in editedGrades[studentId]) {
        const existingGrade = grades?.find(g => 
          g.student_id === studentId && g.assessment_type_id === assessmentTypeId
        );
        const maxScore = assessmentTypes?.find(at => at.id === assessmentTypeId)?.max_points || 0;
        const raw = editedGrades[studentId][assessmentTypeId];
        const parsed = raw ? Number(raw) : 0;
        const clamped = Math.min(Math.max(0, Math.floor(parsed || 0)), maxScore);

        const gradeData: any = {
          student_id: studentId,
          class_subject_id: selectedSubject,
          assessment_type_id: assessmentTypeId,
          period: selectedPeriod,
          score: clamped,
          max_score: maxScore,
          is_locked: isLocked,
        };

        if (existingGrade?.id) {
          gradeData.id = existingGrade.id;
        }

        // Basic client-side validation before sending
        const hasRequired = gradeData.student_id && gradeData.class_subject_id && gradeData.assessment_type_id;
        const uuidsValid = uuidRegex.test(String(gradeData.student_id)) && uuidRegex.test(String(gradeData.class_subject_id)) && uuidRegex.test(String(gradeData.assessment_type_id));

        if (!hasRequired || !uuidsValid) {
          invalidGrades.push(gradeData);
          continue;
        }

        gradesToSave.push(gradeData);
      }
    }

    if (gradesToSave.length === 0) {
      console.warn('[Gradebook] No valid grades to save. Invalid entries:', invalidGrades);
      // Show user-friendly message
      saveGradesMutation.reset();
      return;
    }

    console.log('[Gradebook] Sending', gradesToSave.length, 'valid grades. Dropped', invalidGrades.length, 'invalid entries');
    saveGradesMutation.mutate(gradesToSave);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Gradebook</h1>
            <p className="text-muted-foreground">Enter and manage student grades</p>
          </div>
          <Button 
            variant={isLocked ? "outline" : "default"} 
            className="gap-2"
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {isLocked ? "Locked" : "Unlocked"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classesLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : classes?.length === 0 ? (
                <SelectItem value="none" disabled>No classes available</SelectItem>
              ) : (
                classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select 
            value={selectedSubject} 
            onValueChange={setSelectedSubject}
            disabled={!selectedClass}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectsLoading ? (
                <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
              ) : !classSubjects || classSubjects.length === 0 ? (
                <SelectItem value="none" disabled>
                  {selectedClass ? "No subjects for this class" : "Select a class first"}
                </SelectItem>
              ) : (
                classSubjects.map((cs: any) => {
                  const subjectName = cs.subjects?.name || `Subject ${cs.id}`;
                  return (
                    <SelectItem key={cs.id} value={cs.id}>
                      {subjectName}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Semester 1</div>
              <SelectItem value="p1">Period 1</SelectItem>
              <SelectItem value="p2">Period 2</SelectItem>
              <SelectItem value="p3">Period 3</SelectItem>
              <SelectItem value="exam_s1">Exam S1</SelectItem>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">Semester 2</div>
              <SelectItem value="p4">Period 4</SelectItem>
              <SelectItem value="p5">Period 5</SelectItem>
              <SelectItem value="p6">Period 6</SelectItem>
              <SelectItem value="exam_s2">Exam S2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!selectedClass || !selectedSubject ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                Please select a class and subject to view the gradebook
              </p>
            </CardContent>
          </Card>
        ) : studentsLoading || gradesLoading || assessmentLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {(() => {
                  const selectedCS = classSubjects?.find((cs: any) => cs.id === selectedSubject);
                  const subjectName = selectedCS?.subjects?.name || selectedCS?.subject_id || 'Unknown Subject';
                  const className = classes?.find((c: any) => c.id === selectedClass)?.name || 'Unknown Class';
                  const periodLabel = (() => {
                    switch(selectedPeriod) {
                      case 'p1': return 'Period 1';
                      case 'p2': return 'Period 2';
                      case 'p3': return 'Period 3';
                      case 'p4': return 'Period 4';
                      case 'p5': return 'Period 5';
                      case 'p6': return 'Period 6';
                      case 'exam_s1': return 'Exam S1';
                      case 'exam_s2': return 'Exam S2';
                      default: return selectedPeriod;
                    }
                  })();
                  return `${subjectName} - ${className} - ${periodLabel}`;
                })()}
              </CardTitle>
              <CardDescription>
                {assessmentTypes && assessmentTypes.length > 0 
                  ? `Assessment breakdown: ${assessmentTypes.map((at: any) => `${at.name} (${at.max_points})`).join(', ')}`
                  : 'No assessment types configured'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students && students.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          {assessmentTypes?.map((at) => (
                            <TableHead key={at.id} className="text-center">
                              {at.name}<br/>({at.max_points})
                            </TableHead>
                          ))}
                          <TableHead className="text-center font-bold">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const studentEditedGrades = editedGrades[student.id] || {};
                          const total = Object.values(studentEditedGrades).reduce((sum, score) => sum + (Number(score) || 0), 0);
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.full_name}</TableCell>
                              {assessmentTypes?.map((at) => {
                                const currentValue = studentEditedGrades[at.id] || "";
                                const numericValue = Number(currentValue) || 0;
                                const isRedGrade = numericValue >= 60 && numericValue <= 69;
                                return (
                                  <TableCell key={at.id} className="text-center">
                                    {isLocked ? (
                                      <span className={numericValue > 0 ? (isRedGrade ? "text-red-500 font-semibold" : "text-muted-foreground") : "text-muted-foreground"}>
                                        {numericValue > 0 ? numericValue : '-'}
                                      </span>
                                    ) : (
                                      <Input
                                        type="number"
                                        min="0"
                                        max={at.max_points}
                                        value={currentValue || ''}
                                        onChange={(e) => handleGradeChange(student.id, at.id, e.target.value)}
                                        onBlur={() => handleGradeBlur(student.id, at.id, at.max_points)}
                                        className={`w-20 text-center mx-auto ${isRedGrade ? 'text-red-500 font-semibold' : ''}`}
                                      />
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center font-bold text-primary">
                                {total > 0 ? total.toFixed(0) : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Reset to original grades
                        if (grades && students && assessmentTypes) {
                          const initialGrades: Record<string, Record<string, string>> = {};
                          students.forEach(student => {
                            initialGrades[student.id] = {};
                            assessmentTypes.forEach(at => {
                              const existingGrade = grades.find(g => 
                                g.student_id === student.id && g.assessment_type_id === at.id
                              );
                              initialGrades[student.id][at.id] = existingGrade ? String(existingGrade.score) : "";
                            });
                          });
                          setEditedGrades(initialGrades);
                        }
                      }}
                      disabled={isLocked}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveGrades}
                      disabled={isLocked || saveGradesMutation.isPending}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saveGradesMutation.isPending ? "Saving..." : "Save Grades"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No students found in this class
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Gradebook;
