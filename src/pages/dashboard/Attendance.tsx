import { ClipboardCheck, UserCheck, UserX, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const attendanceData = [
  { class: "Form 1 Gold", present: 40, absent: 2, late: 0, total: 42 },
  { class: "Form 1 Silver", present: 38, absent: 1, late: 1, total: 40 },
  { class: "Form 2 Blue", present: 35, absent: 2, late: 1, total: 38 },
  { class: "Form 2 Green", present: 39, absent: 1, late: 1, total: 41 },
  { class: "Form 3 Gold", present: 33, absent: 1, late: 1, total: 35 },
  { class: "Form 3 Silver", present: 35, absent: 2, late: 0, total: 37 },
];

const Attendance = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track and manage daily attendance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-button">
            <Calendar className="w-4 h-4 mr-2" />
            Dec 9, 2025
          </Button>
          <Button variant="hero">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">1,142</p>
          <p className="text-xs text-muted-foreground">91.6% of total</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <p className="text-2xl font-bold text-destructive">78</p>
          <p className="text-xs text-muted-foreground">6.3% of total</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Late</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">27</p>
          <p className="text-xs text-muted-foreground">2.1% of total</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Rate</span>
          </div>
          <p className="text-2xl font-bold text-primary">91.6%</p>
          <p className="text-xs text-muted-foreground">Overall attendance</p>
        </div>
      </div>

      {/* Attendance by Class */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Attendance by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Class</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Present</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Absent</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Late</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Rate</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row) => (
                <tr key={row.class} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4 font-medium text-foreground">{row.class}</td>
                  <td className="p-4 text-center">
                    <span className="text-emerald-600 font-semibold">{row.present}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-destructive font-semibold">{row.absent}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-amber-600 font-semibold">{row.late}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(row.present / row.total) * 100}%` }} 
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {((row.present / row.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
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

export default Attendance;
