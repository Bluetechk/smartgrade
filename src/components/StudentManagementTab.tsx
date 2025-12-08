import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UserPlus, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentForm {
  full_name: string;
  class_id: string;
  department_id: string;
  date_of_birth: string;
  photo_url: string;
  phone_number: string;
}

const initialFormState: StudentForm = {
  full_name: "",
  class_id: "",
  department_id: "",
  date_of_birth: "",
  photo_url: "",
  phone_number: "",
};

const getNextStudentId = async (): Promise<string> => {
  const { data } = await supabase
    .from("students")
    .select("student_id")
    .order("student_id", { ascending: false });
  
  if (!data || data.length === 0) return "100";
  
  const maxId = Math.max(...data.map(s => parseInt(s.student_id) || 0));
  return String(Math.max(maxId + 1, 100));
};

export const StudentManagementTab = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentIdString, setEditingStudentIdString] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [nextStudentId, setNextStudentId] = useState<string>("Loading...");
  const [newStudent, setNewStudent] = useState<StudentForm>(initialFormState);
  const [editStudent, setEditStudent] = useState<StudentForm>(initialFormState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { data: students, isLoading } = useStudents();
  const { data: classes } = useClasses();
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditPhotoPreview(reader.result as string);
        } else {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.full_name) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const selectedClass = classes?.find(c => c.id === newStudent.class_id);
      
      // Handle photo upload if selected
      let photoUrl = null;
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const fileName = `student-${nextStudentId}-${Date.now()}`;
        const filePath = `student-photos/${fileName}`;
        
        console.log("Uploading photo to:", filePath, "File:", file.name, file.type, file.size);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("student-photos")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }
        
        console.log("Upload successful:", uploadData);
        
        // Get the public URL - Supabase returns a properly formatted URL
        const { data: urlData } = supabase.storage
          .from("student-photos")
          .getPublicUrl(filePath);
        
        photoUrl = urlData.publicUrl;
        console.log("Generated photo URL:", photoUrl);
        
        // Verify URL format
        if (!photoUrl || !photoUrl.includes('supabase.co')) {
          console.warn("Warning: Generated URL may be invalid:", photoUrl);
        }
      }

      console.log("Creating student with photo_url:", photoUrl);
      
      // Create student record directly in database
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .insert({
          student_id: nextStudentId,
          full_name: newStudent.full_name,
          class_id: newStudent.class_id,
          department_id: selectedClass?.department_id || newStudent.department_id,
          date_of_birth: newStudent.date_of_birth || null,
          phone_number: newStudent.phone_number || null,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (studentError) {
        console.error("Student creation error:", studentError);
        throw new Error(`Failed to create student: ${studentError.message}`);
      }
      
      console.log("Student created successfully:", studentData);
      console.log("Saved photo_url in database:", studentData.photo_url);

      toast({
        title: "Success",
        description: `Student "${newStudent.full_name}" created successfully (ID: ${nextStudentId})`,
      });

      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsAddDialogOpen(false);
      setNewStudent(initialFormState);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (student: any) => {
    console.log("=== EDIT CLICK DEBUG ===");
    console.log("Full student object:", student);
    console.log("student.photo_url:", student.photo_url);
    console.log("student.photo_url type:", typeof student.photo_url);
    console.log("student.photo_url empty?", !student.photo_url);
    
    setEditingStudentId(student.id);
    setEditingStudentIdString(student.student_id);
    
    const photoUrlToShow = student.photo_url || "";
    console.log("Setting photo preview to:", photoUrlToShow);
    
    setEditStudent({
      full_name: student.full_name,
      class_id: student.class_id,
      department_id: student.department_id,
      date_of_birth: student.date_of_birth || "",
      photo_url: photoUrlToShow,
      phone_number: student.phone_number || "",
    });
    setEditPhotoPreview(photoUrlToShow);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudentId) return;

    setIsCreating(true);
    try {
      const selectedClass = classes?.find(c => c.id === editStudent.class_id);
      
      // Handle new photo upload if selected
      let photoUrl = editStudent.photo_url;
      console.log("Updating student, current photo_url:", photoUrl);
      
      if (editFileInputRef.current?.files?.[0]) {
        const file = editFileInputRef.current.files[0];
        const fileName = `student-${editingStudentIdString}-${Date.now()}`;
        const filePath = `student-photos/${fileName}`;
        
        console.log("Uploading new photo to:", filePath, "File:", file.name, file.type, file.size);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("student-photos")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }
        
        console.log("Photo upload successful:", uploadData);
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from("student-photos")
          .getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
        console.log("New photo URL:", photoUrl);
      }

      console.log("Updating student with photo_url:", photoUrl);
      
      // Update student record directly in database
      const { error } = await supabase
        .from("students")
        .update({
          full_name: editStudent.full_name,
          class_id: editStudent.class_id,
          department_id: selectedClass?.department_id || editStudent.department_id,
          date_of_birth: editStudent.date_of_birth || null,
          photo_url: photoUrl,
          phone_number: editStudent.phone_number || null,
        })
        .eq("id", editingStudentId);

      if (error) {
        console.error("Update error:", error);
        throw new Error(`Failed to update student: ${error.message}`);
      }
      
      console.log("Student updated successfully");

      toast({
        title: "Success",
        description: "Student updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditDialogOpen(false);
      setEditingStudentId(null);
      setEditStudent(initialFormState);
      setEditPhotoPreview(null);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const PhotoUploadSection = ({ 
    preview, 
    onSelect, 
    inputRef,
    isEdit = false 
  }: { 
    preview: string | null; 
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    isEdit?: boolean;
  }) => (
    <div>
      <Label>Student Photo</Label>
      <div className="flex items-center gap-4 mt-2">
        <Avatar className="h-20 w-20">
          <AvatarImage src={preview || ""} />
          <AvatarFallback className="text-xl">
            {isEdit ? editStudent.full_name?.split(' ').map(n => n[0]).join('') : newStudent.full_name?.split(' ').map(n => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <input
            type="file"
            ref={inputRef}
            onChange={onSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isCreating}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {preview ? "Change Photo" : "Upload Photo"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isEdit) {
                  setEditPhotoPreview(null);
                  setEditStudent({ ...editStudent, photo_url: "" });
                } else {
                  setPhotoPreview(null);
                }
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Student Management</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (open) {
            // Fetch next student ID when dialog opens
            getNextStudentId().then(setNextStudentId);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <PhotoUploadSection
                preview={photoPreview}
                onSelect={(e) => handlePhotoSelect(e, false)}
                inputRef={fileInputRef}
              />
              <div>
                <Label htmlFor="next_student_id">Student ID</Label>
                <Input
                  id="next_student_id"
                  value={nextStudentId}
                  disabled
                  className="bg-muted font-mono"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="class_id">Class</Label>
                <Select value={newStudent.class_id} onValueChange={(value) => setNewStudent({ ...newStudent, class_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newStudent.date_of_birth}
                  onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number (Student/Parent)</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={newStudent.phone_number}
                  onChange={(e) => setNewStudent({ ...newStudent, phone_number: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number (Student/Parent)</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={newStudent.phone_number}
                  onChange={(e) => setNewStudent({ ...newStudent, phone_number: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.photo_url || ""} />
                        <AvatarFallback>
                          {student.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.classes?.name}</TableCell>
                  <TableCell>{student.departments?.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(student)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <PhotoUploadSection
              preview={editPhotoPreview}
              onSelect={(e) => handlePhotoSelect(e, true)}
              inputRef={editFileInputRef}
              isEdit
            />
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editStudent.full_name}
                onChange={(e) => setEditStudent({ ...editStudent, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="edit_student_id">Student ID</Label>
              <Input
                id="edit_student_id"
                value={editingStudentIdString}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="edit_class_id">Class</Label>
              <Select value={editStudent.class_id} onValueChange={(value) => setEditStudent({ ...editStudent, class_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
              <Input
                id="edit_date_of_birth"
                type="date"
                value={editStudent.date_of_birth}
                onChange={(e) => setEditStudent({ ...editStudent, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_phone_number">Phone Number (Student/Parent)</Label>
              <Input
                id="edit_phone_number"
                type="tel"
                value={editStudent.phone_number}
                onChange={(e) => setEditStudent({ ...editStudent, phone_number: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <Button onClick={handleUpdateStudent} className="w-full" disabled={isCreating}>
              {isCreating ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
