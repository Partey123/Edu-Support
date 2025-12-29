import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, BookOpen, MoreVertical, Eye, Edit, Trash2, Loader2 } from "lucide-react";
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
import { CLASS_LEVELS } from "@/lib/constants/ghana-education";
import { useClasses, useTeachers, useCreateClass, useUpdateClass, useDeleteClass, Class } from "@/hooks/useSchoolData";
import { useAuth } from "@/hooks/useAuth";
import { ClassForm } from "@/components/forms/ClassForm";
import { CreateAcademicTermDialog } from "@/components/dialogs/CreateAcademicTermDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ClassesPage() {
  const navigate = useNavigate();
  const { profile, schoolId } = useAuth();
  const { data: classes = [], isLoading } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [academicTerms, setAcademicTerms] = useState<any[]>([]);
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    section: "",
    room: "",
    class_teacher_id: "",
    academic_term_id: "",
  });

  // Fetch academic terms
  useEffect(() => {
    const fetchTerms = async () => {
      if (!schoolId) return;
      
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('school_id', schoolId)
        .is('deleted_at', null)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching academic terms:', error);
        return;
      }

      setAcademicTerms(data || []);
      
      // Set current term (the most recent one)
      if (data && data.length > 0) {
        const current = data.find((t: any) => t.is_current) || data[0];
        setCurrentTerm(current);
        setFormData(prev => ({ ...prev, academic_term_id: current.id }));
      }
    };

    fetchTerms();
  }, [schoolId]);

  const resetForm = () => {
    setFormData({
      name: "",
      level: "",
      section: "",
      room: "",
      class_teacher_id: "",
      academic_term_id: currentTerm?.id || "",
    });
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.academic_term_id) {
      toast({
        title: "Missing academic term",
        description: "Please select an academic term",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createClass.mutateAsync({
        ...formData,
        section: formData.section || null,
        room: formData.room || null,
        class_teacher_id: formData.class_teacher_id || null,
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    
    try {
      await updateClass.mutateAsync({
        id: editingClass.id,
        ...formData,
        section: formData.section || null,
        room: formData.room || null,
        class_teacher_id: formData.class_teacher_id || null,
      });
      setEditingClass(null);
      resetForm();
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteClassId) {
      try {
        await deleteClass.mutateAsync(deleteClassId);
        setDeleteClassId(null);
      } catch (error) {
        console.error("Error deleting class:", error);
      }
    }
  };

  const openEditDialog = (cls: Class) => {
    setFormData({
      name: cls.name,
      level: cls.level,
      section: cls.section || "",
      room: cls.room || "",
      class_teacher_id: cls.class_teacher_id || "",
      academic_term_id: cls.academic_term_id,
    });
    setEditingClass(cls);
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || cls.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const totalStudents = filteredClasses.reduce((acc, cls) => acc + (cls.student_count || 0), 0);

  const handleFormSubmit = isAddDialogOpen ? handleAddClass : handleEditClass;
  // Show message if no academic terms exist
  if (!currentTerm) {
    return (
      <DashboardLayout role="school-admin" schoolName="My School">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <p className="text-lg font-semibold mb-2">No Active Academic Term</p>
          <p className="text-muted-foreground mb-4">
            Please create an academic term before you can add classes.
          </p>
          <CreateAcademicTermDialog onSuccess={(term) => {
            setCurrentTerm(term);
            setAcademicTerms([...academicTerms, term]);
            setFormData(prev => ({ ...prev, academic_term_id: term.id }));
          }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="school-admin" schoolName="My School">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Classes</h1>
          <p className="text-muted-foreground">
            Manage classes and student groupings for {currentTerm?.name} ({currentTerm?.academic_year})
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <ClassForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleFormSubmit}
              isEdit={false}
              teachers={teachers}
              isLoading={createClass.isPending || updateClass.isPending}
              academicTerms={academicTerms}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredClasses.length}</p>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {filteredClasses.length > 0 ? Math.round(totalStudents / filteredClasses.length) : 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Class Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by class name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {CLASS_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          {classes.length === 0 ? (
            <>
              <p className="mb-2">No classes yet</p>
              <p className="text-sm">Click "Add Class" to create your first class.</p>
            </>
          ) : (
            <p>No classes match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-card p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {cls.name.replace("Basic ", "B").replace("KG ", "K").slice(0, 3)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/school-admin/classes/${cls.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(cls)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeleteClassId(cls.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">{cls.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{cls.room || "No room assigned"}</p>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{cls.student_count || 0} students</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Class Teacher</p>
                {cls.class_teacher ? (
                  <p className="text-sm font-medium text-foreground">
                    {cls.class_teacher.first_name} {cls.class_teacher.last_name}
                  </p>
                ) : (
                  <Badge variant="secondary" className="text-xs">Not Assigned</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <ClassForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleFormSubmit}
            isEdit={true}
            teachers={teachers}
            isLoading={createClass.isPending || updateClass.isPending}
            academicTerms={academicTerms}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClassId} onOpenChange={(open) => !open && setDeleteClassId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class? Students in this class will be unassigned.
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