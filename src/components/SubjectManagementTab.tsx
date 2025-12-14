import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const SubjectManagementTab = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    description: "",
    department_id: "",
  });
  const [editSubject, setEditSubject] = useState({
    name: "",
    code: "",
    description: "",
    department_id: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select(`
          *,
          departments:department_id (
            id,
            name
          )
        `)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleAddSubject = async () => {
    try {
      if (!newSubject.name || !newSubject.code || !newSubject.department_id) {
        toast({
          title: "Validation Error",
          description: "Please fill in name, code, and select a department",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("subjects").insert({
        name: newSubject.name,
        code: newSubject.code,
        description: newSubject.description || null,
        department_id: newSubject.department_id,
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsAddDialogOpen(false);
      setNewSubject({
        name: "",
        code: "",
        description: "",
        department_id: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubjectId(subject.id);
    setEditSubject({
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      department_id: subject.department_id,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editSubject.name || !editSubject.code || !editSubject.department_id) {
        toast({
          title: "Validation Error",
          description: "Please fill in name, code, and select a department",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("subjects")
        .update({
          name: editSubject.name,
          code: editSubject.code,
          description: editSubject.description || null,
          department_id: editSubject.department_id,
        })
        .eq("id", editingSubjectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsEditDialogOpen(false);
      setEditingSubjectId(null);
      setEditSubject({
        name: "",
        code: "",
        description: "",
        department_id: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Subject Management</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  placeholder="e.g., MATH101"
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={newSubject.department_id} onValueChange={(value) => setNewSubject({ ...newSubject, department_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : departments?.length === 0 ? (
                      <SelectItem value="none" disabled>No departments available</SelectItem>
                    ) : (
                      departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  placeholder="Brief description of the subject"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddSubject} className="w-full">
                Add Subject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-name">Subject Name *</Label>
              <Input
                id="edit-name"
                value={editSubject.name}
                onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <Label htmlFor="edit-code">Subject Code *</Label>
              <Input
                id="edit-code"
                value={editSubject.code}
                onChange={(e) => setEditSubject({ ...editSubject, code: e.target.value })}
                placeholder="e.g., MATH101"
              />
            </div>
            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Select value={editSubject.department_id} onValueChange={(value) => setEditSubject({ ...editSubject, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : departments?.length === 0 ? (
                    <SelectItem value="none" disabled>No departments available</SelectItem>
                  ) : (
                    departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editSubject.description}
                onChange={(e) => setEditSubject({ ...editSubject, description: e.target.value })}
                placeholder="Brief description of the subject"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects?.map((subject: any) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.departments?.name || "No Department"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {subject.description || "No description"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSubject(subject)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
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
    </Card>
  );
};
