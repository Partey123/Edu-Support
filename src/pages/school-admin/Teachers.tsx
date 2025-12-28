import { useState } from "react";
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, Teacher } from "@/hooks/useSchoolData";
import { useAuth } from "@/hooks/useAuth";
import { TeacherForm } from "@/components/forms/TeacherForm";
import { SUBJECTS } from "@/lib/constants/ghana-education";

export default function TeachersPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { data: teachers = [], isLoading } = useTeachers();
  const navigate = useNavigate();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    subjects: [] as string[],
    status: "active" as "active" | "on-leave" | "inactive",
    hire_date: "",
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      subjects: [],
      status: "active",
      hire_date: "",
    });
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeacher.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        subjects: formData.subjects,
        status: formData.status as "active" | "inactive" | "on_leave",
        hire_date: formData.hire_date,
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation's onError
    }
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    
    await updateTeacher.mutateAsync({
      id: editingTeacher.id,
      ...formData,
      phone: formData.phone || null,
    });
    setEditingTeacher(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteTeacherId) {
      await deleteTeacher.mutateAsync(deleteTeacherId);
      setDeleteTeacherId(null);
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: "",
      password: "",
      phone: teacher.phone || "",
      subjects: teacher.subjects || [],
      status: teacher.status,
      hire_date: teacher.hire_date || "",
    });
    setEditingTeacher(teacher);
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = 
      teacher.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || teacher.status === (statusFilter as any);
    return matchesSearch && matchesStatus;
  });

  const handleFormSubmit = isAddDialogOpen ? handleAddTeacher : handleEditTeacher;

  return (
    <DashboardLayout role="school-admin" schoolName="My School">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff and assignments.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} disabled={authLoading}>
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Teacher
            </Button>
          </DialogTrigger>
          {isAddDialogOpen && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <TeacherForm
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleFormSubmit}
                onToggleSubject={toggleSubject}
                isEdit={false}
                isLoading={createTeacher.isPending || updateTeacher.isPending}
              />
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          {teachers.length === 0 ? (
            <>
              <p className="mb-2">No teachers yet</p>
              <p className="text-sm">Click "Add Teacher" to add your first teacher.</p>
            </>
          ) : (
            <p>No teachers match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {teacher.first_name[0]}{teacher.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{teacher.first_name} {teacher.last_name}</h3>
                    <Badge variant={teacher.status === "active" ? "default" : "secondary"} className="mt-1">
                      {teacher.status === "on_leave" ? "On Leave" : teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/school-admin/teachers/${teacher.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeleteTeacherId(teacher.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 text-sm">
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
              </div>

              {teacher.subjects && teacher.subjects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
        {editingTeacher && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
            </DialogHeader>
            <TeacherForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleFormSubmit}
              onToggleSubject={toggleSubject}
              isEdit={true}
              isLoading={createTeacher.isPending || updateTeacher.isPending}
            />
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTeacherId} onOpenChange={(open) => !open && setDeleteTeacherId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this teacher? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
