import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, Edit, Trash2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useAuth } from "@/hooks/useAuth";
import { useTeachers, useUpdateTeacher, useDeleteTeacher, Teacher } from "@/hooks/useSchoolData";
import { TeacherForm } from "@/components/forms/TeacherForm";
import { useState } from "react";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: teachers = [] } = useTeachers();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const teacher = teachers.find((t) => t.id === id);

  const [formData, setFormData] = useState(
    teacher ? {
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      password: "",
      phone: teacher.phone || "",
      subjects: teacher.subjects || [],
      status: teacher.status,
    } : {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      subjects: [],
      status: "active" as const,
    }
  );

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    await updateTeacher.mutateAsync({
      id: teacher.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null,
      subjects: formData.subjects,
      status: formData.status,
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (teacher) {
      await deleteTeacher.mutateAsync(teacher.id);
      navigate("/school-admin/teachers");
    }
  };

  if (!teacher) {
    return (
      <DashboardLayout role="school-admin" schoolName={profile?.school_id ? undefined : "My School"}>
        <div className="text-center p-12">
          <p className="text-muted-foreground">Teacher not found</p>
          <Button onClick={() => navigate("/school-admin/teachers")} className="mt-4">
            Back to Teachers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="school-admin" schoolName={profile?.school_id ? undefined : "My School"}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/school-admin/teachers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {teacher.first_name} {teacher.last_name}
          </h1>
          <p className="text-muted-foreground">Teacher Details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Teacher Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">First Name</p>
                  <p className="text-foreground font-medium">{teacher.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Last Name</p>
                  <p className="text-foreground font-medium">{teacher.last_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{teacher.email}</p>
                </div>
              </div>

              {teacher.phone && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">{teacher.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      teacher.status === "active"
                        ? "default"
                        : teacher.status === "on-leave"
                        ? "secondary"
                        : "outline"
                    }
                    className="mt-2"
                  >
                    {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          {teacher.subjects && teacher.subjects.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="text-sm py-2 px-3">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Account Information</h2>
            
            <div className="space-y-4 text-sm">
              {teacher.hire_date && (
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Hire Date</span>
                  <span className="text-foreground font-medium">
                    {new Date(teacher.hire_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {teacher.created_at && (
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground font-medium">
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {teacher.updated_at && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-foreground font-medium">
                    {new Date(teacher.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div>
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            
            <div className="space-y-3">
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="w-full"
                variant="default"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Teacher
              </Button>
              
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Teacher
              </Button>

              <Button
                onClick={() => navigate("/school-admin/teachers")}
                className="w-full"
                variant="outline"
              >
                Back to Teachers
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          <TeacherForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleEditTeacher}
            onToggleSubject={toggleSubject}
            isEdit={true}
            isLoading={updateTeacher.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {teacher.first_name} {teacher.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeacher.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
