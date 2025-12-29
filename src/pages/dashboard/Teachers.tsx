import { GraduationCap, Plus, Search, Filter, Download, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { GlassDialog, FormField, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/glass-dialog";
import { useToast } from "@/hooks/use-toast";

const teachersData = [
  { id: "TCH001", name: "Mr. Emmanuel Adjei", subject: "Mathematics", classes: "Form 2, 3", status: "Active", avatar: "EA", email: "emmanuel@eduflow.com", phone: "024-XXX-XXXX", qualification: "M.Ed Mathematics", experience: "8 years" },
  { id: "TCH002", name: "Mrs. Grace Osei", subject: "English", classes: "Form 1, 2", status: "Active", avatar: "GO", email: "grace@eduflow.com", phone: "024-XXX-XXXX", qualification: "B.A English", experience: "5 years" },
  { id: "TCH003", name: "Mr. Kwaku Mensah", subject: "Science", classes: "Form 3", status: "Active", avatar: "KM", email: "kwaku@eduflow.com", phone: "024-XXX-XXXX", qualification: "B.Sc Biology", experience: "6 years" },
  { id: "TCH004", name: "Ms. Abena Asante", subject: "Social Studies", classes: "Form 1", status: "On Leave", avatar: "AA", email: "abena@eduflow.com", phone: "024-XXX-XXXX", qualification: "B.A Social Studies", experience: "4 years" },
  { id: "TCH005", name: "Mr. Yaw Frimpong", subject: "ICT", classes: "Form 1, 2, 3", status: "Active", avatar: "YF", email: "yaw@eduflow.com", phone: "024-XXX-XXXX", qualification: "B.Sc Computer Science", experience: "7 years" },
];

const Teachers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<typeof teachersData[0] | null>(null);
  const { toast } = useToast();

  const handleViewTeacher = (teacher: typeof teachersData[0]) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const handleEditTeacher = (teacher: typeof teachersData[0]) => {
    setSelectedTeacher(teacher);
    setIsEditDialogOpen(true);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Teacher Added",
      description: "New teacher has been successfully added to the staff.",
    });
    setIsAddDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff and assignments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="hero" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Teachers", value: "56", color: "text-primary" },
          { label: "Active", value: "52", color: "text-success" },
          { label: "On Leave", value: "4", color: "text-warning" },
          { label: "Departments", value: "8", color: "text-info" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teachers by name, subject, or ID..."
              className="w-full h-10 pl-10 pr-4 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="glass">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachersData.map((teacher) => (
          <div key={teacher.id} className="glass-card rounded-2xl p-5 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                  {teacher.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleViewTeacher(teacher)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEditTeacher(teacher)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ID:</span>
                <span className="text-foreground">{teacher.id}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Classes:</span>
                <span className="text-foreground">{teacher.classes}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  teacher.status === "Active" 
                    ? "bg-success/10 text-success" 
                    : "bg-warning/10 text-warning"
                }`}>
                  {teacher.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="glass" size="sm" className="flex-1">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button variant="glass" size="sm" className="flex-1">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Dialog */}
      <GlassDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Teacher"
        description="Enter the teacher's information to add them to the staff."
        size="lg"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <FormInput placeholder="Enter first name" required />
            </FormField>
            <FormField label="Last Name" required>
              <FormInput placeholder="Enter last name" required />
            </FormField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Email" required>
              <FormInput type="email" placeholder="teacher@eduflow.com" required />
            </FormField>
            <FormField label="Phone" required>
              <FormInput type="tel" placeholder="024-XXX-XXXX" required />
            </FormField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Subject" required>
              <FormSelect required>
                <option value="">Select subject</option>
                <option value="mathematics">Mathematics</option>
                <option value="english">English</option>
                <option value="science">Science</option>
                <option value="social-studies">Social Studies</option>
                <option value="ict">ICT</option>
                <option value="french">French</option>
              </FormSelect>
            </FormField>
            <FormField label="Department">
              <FormSelect>
                <option value="">Select department</option>
                <option value="sciences">Sciences</option>
                <option value="languages">Languages</option>
                <option value="humanities">Humanities</option>
                <option value="arts">Arts</option>
              </FormSelect>
            </FormField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Qualification">
              <FormInput placeholder="e.g., M.Ed Mathematics" />
            </FormField>
            <FormField label="Years of Experience">
              <FormInput type="number" placeholder="e.g., 5" />
            </FormField>
          </div>
          <FormField label="Assign Classes">
            <FormInput placeholder="e.g., Form 1 Gold, Form 2 Blue" />
          </FormField>
          <FormField label="Address">
            <FormInput placeholder="Enter home address" />
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Add Teacher
            </Button>
          </FormActions>
        </form>
      </GlassDialog>

      {/* View Teacher Dialog */}
      <GlassDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        title="Teacher Details"
        size="md"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                {selectedTeacher.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedTeacher.name}</h3>
                <p className="text-muted-foreground">{selectedTeacher.subject} Teacher</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">ID</p>
                <p className="font-medium text-foreground">{selectedTeacher.id}</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  selectedTeacher.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {selectedTeacher.status}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Qualification</p>
                <p className="font-medium text-foreground">{selectedTeacher.qualification}</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Experience</p>
                <p className="font-medium text-foreground">{selectedTeacher.experience}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Classes Assigned</span>
                <span className="font-medium text-foreground">{selectedTeacher.classes}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{selectedTeacher.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{selectedTeacher.phone}</span>
              </div>
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button variant="hero" onClick={() => {
                setIsViewDialogOpen(false);
                handleEditTeacher(selectedTeacher);
              }}>
                Edit Teacher
              </Button>
            </FormActions>
          </div>
        )}
      </GlassDialog>

      {/* Edit Teacher Dialog */}
      <GlassDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Teacher"
        description="Update the teacher's information."
        size="lg"
      >
        {selectedTeacher && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsEditDialogOpen(false); toast({ title: "Teacher Updated" }); }}>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Name" required>
                <FormInput defaultValue={selectedTeacher.name} required />
              </FormField>
              <FormField label="Subject" required>
                <FormSelect defaultValue={selectedTeacher.subject}>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="ICT">ICT</option>
                </FormSelect>
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Email">
                <FormInput type="email" defaultValue={selectedTeacher.email} />
              </FormField>
              <FormField label="Phone">
                <FormInput type="tel" defaultValue={selectedTeacher.phone} />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Status">
                <FormSelect defaultValue={selectedTeacher.status}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </FormSelect>
              </FormField>
              <FormField label="Classes">
                <FormInput defaultValue={selectedTeacher.classes} />
              </FormField>
            </div>
            <FormActions>
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                Save Changes
              </Button>
            </FormActions>
          </form>
        )}
      </GlassDialog>
    </DashboardLayout>
  );
};

export default Teachers;