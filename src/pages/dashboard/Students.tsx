import { Users, Plus, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { GlassDialog, FormField, FormInput, FormSelect, FormActions } from "@/components/ui/glass-dialog";
import { useToast } from "@/hooks/use-toast";

const studentsData = [
  { id: "STU001", name: "Kwame Asante", class: "Form 3 Gold", status: "Active", fees: "Paid", avatar: "KA", email: "kwame@school.edu", phone: "024-XXX-XXXX", parent: "Mr. Kofi Asante", dob: "2010-05-15" },
  { id: "STU002", name: "Akua Mensah", class: "Form 2 Blue", status: "Active", fees: "Pending", avatar: "AM", email: "akua@school.edu", phone: "024-XXX-XXXX", parent: "Mrs. Ama Mensah", dob: "2011-08-22" },
  { id: "STU003", name: "Kofi Owusu", class: "Form 1 Silver", status: "Active", fees: "Paid", avatar: "KO", email: "kofi@school.edu", phone: "024-XXX-XXXX", parent: "Mr. Yaw Owusu", dob: "2012-03-10" },
  { id: "STU004", name: "Ama Serwaa", class: "Form 3 Gold", status: "Active", fees: "Paid", avatar: "AS", email: "ama@school.edu", phone: "024-XXX-XXXX", parent: "Mrs. Grace Serwaa", dob: "2010-11-28" },
  { id: "STU005", name: "Yaw Boateng", class: "Form 2 Blue", status: "Inactive", fees: "Overdue", avatar: "YB", email: "yaw@school.edu", phone: "024-XXX-XXXX", parent: "Mr. Emmanuel Boateng", dob: "2011-01-05" },
];

const Students = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof studentsData[0] | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  const handleViewStudent = (student: typeof studentsData[0]) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleEditStudent = (student: typeof studentsData[0]) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Student Added",
      description: "New student has been successfully enrolled.",
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Student Updated",
      description: "Student information has been updated.",
    });
    setIsEditDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage all student records and enrollments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="hero" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: "1,247", color: "text-primary" },
          { label: "Active", value: "1,198", color: "text-success" },
          { label: "Inactive", value: "49", color: "text-warning" },
          { label: "New This Term", value: "86", color: "text-info" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students by name, ID, or class..."
              className="w-full h-10 pl-10 pr-4 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="glass" onClick={() => setIsFilterOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Class</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Fees</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student) => (
                <tr key={student.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20">
                        {student.avatar}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{student.name}</span>
                        <p className="text-xs text-muted-foreground sm:hidden">{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{student.id}</td>
                  <td className="p-4 text-sm text-foreground hidden md:table-cell">{student.class}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      student.status === "Active" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      student.fees === "Paid" 
                        ? "bg-success/10 text-success" 
                        : student.fees === "Pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {student.fees}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Dialog */}
      <GlassDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Student"
        description="Enter the student's information to enroll them."
        size="lg"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <FormInput placeholder="Enter first name" required />
            </FormField>
            <FormField label="Last Name" required>
              <FormInput placeholder="Enter last name" required />
            </FormField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Date of Birth" required>
              <FormInput type="date" required />
            </FormField>
            <FormField label="Gender" required>
              <FormSelect required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </FormSelect>
            </FormField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Class" required>
              <FormSelect required>
                <option value="">Select class</option>
                <option value="form1-gold">Form 1 Gold</option>
                <option value="form1-silver">Form 1 Silver</option>
                <option value="form2-blue">Form 2 Blue</option>
                <option value="form2-green">Form 2 Green</option>
                <option value="form3-gold">Form 3 Gold</option>
                <option value="form3-silver">Form 3 Silver</option>
              </FormSelect>
            </FormField>
            <FormField label="Admission Date">
              <FormInput type="date" />
            </FormField>
          </div>
          <FormField label="Parent/Guardian Name" required>
            <FormInput placeholder="Enter parent or guardian name" required />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Parent Phone" required>
              <FormInput type="tel" placeholder="024-XXX-XXXX" required />
            </FormField>
            <FormField label="Parent Email">
              <FormInput type="email" placeholder="parent@email.com" />
            </FormField>
          </div>
          <FormField label="Address">
            <FormInput placeholder="Enter home address" />
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Add Student
            </Button>
          </FormActions>
        </form>
      </GlassDialog>

      {/* View Student Dialog */}
      <GlassDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        title="Student Details"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                {selectedStudent.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedStudent.name}</h3>
                <p className="text-muted-foreground">{selectedStudent.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Class</p>
                <p className="font-medium text-foreground">{selectedStudent.class}</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  selectedStudent.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {selectedStudent.status}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Fee Status</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  selectedStudent.fees === "Paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {selectedStudent.fees}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-medium text-foreground">{selectedStudent.dob}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Parent/Guardian</span>
                <span className="font-medium text-foreground">{selectedStudent.parent}</span>
              </div>
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button variant="hero" onClick={() => {
                setIsViewDialogOpen(false);
                handleEditStudent(selectedStudent);
              }}>
                Edit Student
              </Button>
            </FormActions>
          </div>
        )}
      </GlassDialog>

      {/* Edit Student Dialog */}
      <GlassDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Student"
        description="Update the student's information."
        size="lg"
      >
        {selectedStudent && (
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="First Name" required>
                <FormInput defaultValue={selectedStudent.name.split(" ")[0]} required />
              </FormField>
              <FormField label="Last Name" required>
                <FormInput defaultValue={selectedStudent.name.split(" ")[1]} required />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Class" required>
                <FormSelect defaultValue={selectedStudent.class} required>
                  <option value="Form 1 Gold">Form 1 Gold</option>
                  <option value="Form 1 Silver">Form 1 Silver</option>
                  <option value="Form 2 Blue">Form 2 Blue</option>
                  <option value="Form 2 Green">Form 2 Green</option>
                  <option value="Form 3 Gold">Form 3 Gold</option>
                  <option value="Form 3 Silver">Form 3 Silver</option>
                </FormSelect>
              </FormField>
              <FormField label="Status" required>
                <FormSelect defaultValue={selectedStudent.status} required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </FormSelect>
              </FormField>
            </div>
            <FormField label="Parent/Guardian Name" required>
              <FormInput defaultValue={selectedStudent.parent} required />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Phone">
                <FormInput type="tel" defaultValue={selectedStudent.phone} />
              </FormField>
              <FormField label="Email">
                <FormInput type="email" defaultValue={selectedStudent.email} />
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

      {/* Filter Dialog */}
      <GlassDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Students"
        size="sm"
      >
        <form className="space-y-4">
          <FormField label="Class">
            <FormSelect>
              <option value="">All Classes</option>
              <option value="form1">Form 1</option>
              <option value="form2">Form 2</option>
              <option value="form3">Form 3</option>
            </FormSelect>
          </FormField>
          <FormField label="Status">
            <FormSelect>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FormSelect>
          </FormField>
          <FormField label="Fee Status">
            <FormSelect>
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </FormSelect>
          </FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsFilterOpen(false)}>
              Clear
            </Button>
            <Button type="button" variant="hero" onClick={() => setIsFilterOpen(false)}>
              Apply Filters
            </Button>
          </FormActions>
        </form>
      </GlassDialog>
    </DashboardLayout>
  );
};

export default Students;