import { GraduationCap, Plus, Search, Filter, Download, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const teachersData = [
  { id: "TCH001", name: "Mr. Emmanuel Adjei", subject: "Mathematics", classes: "Form 2, 3", status: "Active", avatar: "EA" },
  { id: "TCH002", name: "Mrs. Grace Osei", subject: "English", classes: "Form 1, 2", status: "Active", avatar: "GO" },
  { id: "TCH003", name: "Mr. Kwaku Mensah", subject: "Science", classes: "Form 3", status: "Active", avatar: "KM" },
  { id: "TCH004", name: "Ms. Abena Asante", subject: "Social Studies", classes: "Form 1", status: "On Leave", avatar: "AA" },
  { id: "TCH005", name: "Mr. Yaw Frimpong", subject: "ICT", classes: "Form 1, 2, 3", status: "Active", avatar: "YF" },
];

const Teachers = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff and assignments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Teachers", value: "56", color: "text-primary" },
          { label: "Active", value: "52", color: "text-emerald-600" },
          { label: "On Leave", value: "4", color: "text-amber-600" },
          { label: "Departments", value: "8", color: "text-violet-600" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teachers by name, subject, or ID..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="glass-button">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachersData.map((teacher) => (
          <div key={teacher.id} className="glass-card rounded-xl p-5 hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {teacher.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
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
                <span className={`text-xs px-2 py-1 rounded-full ${
                  teacher.status === "Active" 
                    ? "bg-emerald-100 text-emerald-600" 
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {teacher.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 glass-button">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1 glass-button">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Teachers;
