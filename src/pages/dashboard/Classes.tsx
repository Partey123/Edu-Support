import { BookOpen, Plus, Users, GraduationCap, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { GlassDialog, FormField, FormInput, FormSelect, FormActions } from "@/components/ui/glass-dialog";
import { useToast } from "@/hooks/use-toast";

const classesData = [
  { name: "Form 1 Gold", students: 42, teacher: "Mrs. Grace Osei", room: "Block A - Room 101" },
  { name: "Form 1 Silver", students: 40, teacher: "Mr. Kwaku Mensah", room: "Block A - Room 102" },
  { name: "Form 2 Blue", students: 38, teacher: "Mr. Emmanuel Adjei", room: "Block B - Room 201" },
  { name: "Form 2 Green", students: 41, teacher: "Ms. Abena Asante", room: "Block B - Room 202" },
  { name: "Form 3 Gold", students: 35, teacher: "Mr. Yaw Frimpong", room: "Block C - Room 301" },
  { name: "Form 3 Silver", students: 37, teacher: "Mrs. Akua Boateng", room: "Block C - Room 302" },
];

const Classes = () => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isViewClassOpen, setIsViewClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<typeof classesData[0] | null>(null);
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground">Manage classes and student assignments</p>
        </div>
        <Button variant="hero" onClick={() => setIsAddClassOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Classes", value: "18", icon: BookOpen, color: "text-primary" },
          { label: "Total Students", value: "1,247", icon: Users, color: "text-info" },
          { label: "Class Teachers", value: "18", icon: GraduationCap, color: "text-success" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classesData.map((cls) => (
          <div key={cls.name} className="glass-card rounded-2xl p-5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{cls.name}</h3>
                <p className="text-sm text-muted-foreground">{cls.room}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Students</span>
                </div>
                <span className="font-semibold text-foreground">{cls.students}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Teacher</span>
                </div>
                <span className="text-sm text-foreground">{cls.teacher}</span>
              </div>
            </div>
            <Button variant="glass" className="w-full mt-4" onClick={() => { setSelectedClass(cls); setIsViewClassOpen(true); }}>
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Add Class Dialog */}
      <GlassDialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen} title="Add New Class" size="md">
        <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Class Added" }); setIsAddClassOpen(false); }} className="space-y-4">
          <FormField label="Class Name" required><FormInput placeholder="e.g., Form 1 Gold" required /></FormField>
          <FormField label="Class Teacher" required>
            <FormSelect required>
              <option value="">Select teacher</option>
              <option value="t1">Mr. Emmanuel Adjei</option>
              <option value="t2">Mrs. Grace Osei</option>
            </FormSelect>
          </FormField>
          <FormField label="Room"><FormInput placeholder="e.g., Block A - Room 101" /></FormField>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsAddClassOpen(false)}>Cancel</Button>
            <Button type="submit" variant="hero">Add Class</Button>
          </FormActions>
        </form>
      </GlassDialog>

      {/* View Class Dialog */}
      <GlassDialog open={isViewClassOpen} onOpenChange={setIsViewClassOpen} title={selectedClass?.name || "Class Details"} size="md">
        {selectedClass && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50"><p className="text-xs text-muted-foreground">Students</p><p className="text-xl font-bold">{selectedClass.students}</p></div>
              <div className="p-4 rounded-xl bg-secondary/50"><p className="text-xs text-muted-foreground">Room</p><p className="font-medium">{selectedClass.room}</p></div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-xs text-muted-foreground">Class Teacher</p><p className="font-medium">{selectedClass.teacher}</p></div>
            <FormActions>
              <Button variant="ghost" onClick={() => setIsViewClassOpen(false)}>Close</Button>
              <Button variant="hero">Edit Class</Button>
            </FormActions>
          </div>
        )}
      </GlassDialog>
    </DashboardLayout>
  );
};

export default Classes;