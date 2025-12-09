import { Users, Plus, Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const studentsData = [
  { id: "STU001", name: "Kwame Asante", class: "Form 3 Gold", status: "Active", fees: "Paid", avatar: "KA" },
  { id: "STU002", name: "Akua Mensah", class: "Form 2 Blue", status: "Active", fees: "Pending", avatar: "AM" },
  { id: "STU003", name: "Kofi Owusu", class: "Form 1 Silver", status: "Active", fees: "Paid", avatar: "KO" },
  { id: "STU004", name: "Ama Serwaa", class: "Form 3 Gold", status: "Active", fees: "Paid", avatar: "AS" },
  { id: "STU005", name: "Yaw Boateng", class: "Form 2 Blue", status: "Inactive", fees: "Overdue", avatar: "YB" },
];

const Students = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage all student records and enrollments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: "1,247", color: "bg-primary/10 text-primary" },
          { label: "Active", value: "1,198", color: "bg-emerald-100 text-emerald-600" },
          { label: "Inactive", value: "49", color: "bg-amber-100 text-amber-600" },
          { label: "New This Term", value: "86", color: "bg-violet-100 text-violet-600" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students by name, ID, or class..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="glass-button">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Class</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fees</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student) => (
                <tr key={student.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-foreground">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{student.id}</td>
                  <td className="p-4 text-sm text-foreground">{student.class}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      student.status === "Active" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      student.fees === "Paid" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : student.fees === "Pending"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {student.fees}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Students;
