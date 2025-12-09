import { BookOpen, Plus, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const classesData = [
  { name: "Form 1 Gold", students: 42, teacher: "Mrs. Grace Osei", room: "Block A - Room 101" },
  { name: "Form 1 Silver", students: 40, teacher: "Mr. Kwaku Mensah", room: "Block A - Room 102" },
  { name: "Form 2 Blue", students: 38, teacher: "Mr. Emmanuel Adjei", room: "Block B - Room 201" },
  { name: "Form 2 Green", students: 41, teacher: "Ms. Abena Asante", room: "Block B - Room 202" },
  { name: "Form 3 Gold", students: 35, teacher: "Mr. Yaw Frimpong", room: "Block C - Room 301" },
  { name: "Form 3 Silver", students: 37, teacher: "Mrs. Akua Boateng", room: "Block C - Room 302" },
];

const Classes = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground">Manage classes and student assignments</p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Classes", value: "18", icon: BookOpen, color: "bg-primary/10 text-primary" },
          { label: "Total Students", value: "1,247", icon: Users, color: "bg-violet-100 text-violet-600" },
          { label: "Class Teachers", value: "18", icon: GraduationCap, color: "bg-emerald-100 text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
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
          <div key={cls.name} className="glass-card rounded-xl p-5 hover:shadow-card-hover transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
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

            <Button variant="outline" className="w-full mt-4 glass-button">
              View Details
            </Button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Classes;
