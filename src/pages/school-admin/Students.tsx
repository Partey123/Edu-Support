import { useState } from "react";
import { Plus, Search, Upload, MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useStudents, useClasses, useCreateStudent, useUpdateStudent, useDeleteStudent, Student } from "@/hooks/useSchoolData";
import { useAuth } from "@/hooks/useAuth";
import { StudentForm } from "@/components/forms/StudentForm";

export default function StudentsPage() {
  const { profile } = useAuth();
  const { data: students = [], isLoading } = useStudents();
  const { data: classes = [] } = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    date_of_birth: "",
    admission_number: "",
    admission_date: "",
    address: "",
    status: "active" as "active" | "inactive" | "graduated" | "transferred",
    guardian_first_name: "",
    guardian_last_name: "",
    guardian_email: "",
    guardian_phone: "",
    relationship: "father" as "mother" | "father" | "guardian" | "grandparent" | "other",
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      admission_number: "",
      admission_date: "",
      address: "",
      status: "active",
      guardian_first_name: "",
      guardian_last_name: "",
      guardian_email: "",
      guardian_phone: "",
      relationship: "father",
    });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent.mutateAsync({
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: (formData.gender as "Male" | "Female" | "Other") || null,
      date_of_birth: formData.date_of_birth || null,
      admission_number: formData.admission_number || null,
      admission_date: formData.admission_date || new Date().toISOString().split('T')[0],
      address: formData.address || null,
      status: formData.status,
      guardian_first_name: formData.guardian_first_name,
      guardian_last_name: formData.guardian_last_name,
      guardian_email: formData.guardian_email,
      guardian_phone: formData.guardian_phone,
      relationship: formData.relationship,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    await updateStudent.mutateAsync({
      id: editingStudent.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: (formData.gender as "Male" | "Female" | "Other") || null,
      date_of_birth: formData.date_of_birth || null,
      admission_number: formData.admission_number || null,
      admission_date: formData.admission_date || null,
      address: formData.address || null,
      status: formData.status,
    });
    setEditingStudent(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteStudentId) {
      await deleteStudent.mutateAsync(deleteStudentId);
      setDeleteStudentId(null);
    }
  };

  const openEditDialog = (student: Student) => {
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender || "",
      date_of_birth: student.date_of_birth || "",
      admission_number: student.admission_number || "",
      admission_date: student.admission_date || "",
      address: student.address || "",
      status: student.status,
      guardian_first_name: "",
      guardian_last_name: "",
      guardian_email: "",
      guardian_phone: "",
      relationship: "father",
    });
    setEditingStudent(student);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getAge = (dob: string | null) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFormSubmit = isAddDialogOpen ? handleAddStudent : handleEditStudent;

  return (
    <DashboardLayout role="school-admin" schoolName={profile?.school_id ? undefined : "My School"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Students</h1>
          <p className="text-muted-foreground">Manage student records and enrollment.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleFormSubmit}
                isEdit={false}
                isLoading={createStudent.isPending || updateStudent.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">
            {students.length === 0 ? (
              <>
                <p className="mb-2">No students yet</p>
                <p className="text-sm">Click "Add Student" to add your first student.</p>
              </>
            ) : (
              <p>No students match your search criteria.</p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Class</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Gender</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Age</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Parent/Guardian</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Phone</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <span className="font-medium text-foreground">{student.first_name} {student.last_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">{student.class?.name || "-"}</td>
                      <td className="p-4 text-muted-foreground">{student.gender || "-"}</td>
                      <td className="p-4 text-muted-foreground">{getAge(student.date_of_birth)}</td>
                      <td className="p-4 text-foreground">{student.parent_name || "-"}</td>
                      <td className="p-4 text-muted-foreground">{student.parent_phone || "-"}</td>
                      <td className="p-4">
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(student)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteStudentId(student.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <StudentForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleFormSubmit}
            isEdit={true}
            isLoading={createStudent.isPending || updateStudent.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteStudentId} onOpenChange={(open) => !open && setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
