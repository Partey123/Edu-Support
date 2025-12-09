import { ClipboardCheck, UserCheck, UserX, Clock, Calendar, Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { GlassDialog, FormField, FormSelect, FormActions } from "@/components/ui/glass-dialog";
import { useToast } from "@/hooks/use-toast";

const attendanceData = [
  { class: "Form 1 Gold", present: 40, absent: 2, late: 0, total: 42 },
  { class: "Form 1 Silver", present: 38, absent: 1, late: 1, total: 40 },
  { class: "Form 2 Blue", present: 35, absent: 2, late: 1, total: 38 },
  { class: "Form 2 Green", present: 39, absent: 1, late: 1, total: 41 },
  { class: "Form 3 Gold", present: 33, absent: 1, late: 1, total: 35 },
  { class: "Form 3 Silver", present: 35, absent: 2, late: 0, total: 37 },
];

const Attendance = () => {
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">Track and manage daily attendance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass">
            <Calendar className="w-4 h-4 mr-2" />
            Dec 9, 2025
          </Button>
          <Button variant="hero" onClick={() => setIsMarkAttendanceOpen(true)}>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <p className="text-2xl font-bold text-success">1,142</p>
          <p className="text-xs text-muted-foreground">91.6% of total</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <p className="text-2xl font-bold text-destructive">78</p>
          <p className="text-xs text-muted-foreground">6.3% of total</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Late</span>
          </div>
          <p className="text-2xl font-bold text-warning">27</p>
          <p className="text-xs text-muted-foreground">2.1% of total</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Rate</span>
          </div>
          <p className="text-2xl font-bold text-primary">91.6%</p>
          <p className="text-xs text-muted-foreground">Overall attendance</p>
        </div>
      </div>

      {/* Attendance by Class */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Attendance by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Class</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Present</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Absent</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Late</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Rate</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row) => (
                <tr key={row.class} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="p-4 font-medium text-foreground">{row.class}</td>
                  <td className="p-4 text-center">
                    <span className="text-success font-semibold">{row.present}</span>
                  </td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    <span className="text-destructive font-semibold">{row.absent}</span>
                  </td>
                  <td className="p-4 text-center hidden md:table-cell">
                    <span className="text-warning font-semibold">{row.late}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${(row.present / row.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{((row.present / row.total) * 100).toFixed(0)}%</span>
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

      {/* Mark Attendance Dialog */}
      <GlassDialog
        open={isMarkAttendanceOpen}
        onOpenChange={setIsMarkAttendanceOpen}
        title="Mark Attendance"
        description="Select a class to mark attendance"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Attendance marked successfully" }); setIsMarkAttendanceOpen(false); }} className="space-y-4">
          <FormField label="Select Class" required>
            <FormSelect required>
              <option value="">Choose a class</option>
              <option value="form1-gold">Form 1 Gold</option>
              <option value="form1-silver">Form 1 Silver</option>
              <option value="form2-blue">Form 2 Blue</option>
              <option value="form2-green">Form 2 Green</option>
              <option value="form3-gold">Form 3 Gold</option>
              <option value="form3-silver">Form 3 Silver</option>
            </FormSelect>
          </FormField>
          <FormField label="Date">
            <input type="date" defaultValue="2025-12-09" className="w-full h-10 px-4 rounded-xl glass-input text-sm" />
          </FormField>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <QrCode className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Or use QR Scanner for quick check-in</p>
            <Button type="button" variant="ghost" size="sm" className="mt-2">Open QR Scanner</Button>
          </div>
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setIsMarkAttendanceOpen(false)}>Cancel</Button>
            <Button type="submit" variant="hero">Continue</Button>
          </FormActions>
        </form>
      </GlassDialog>
    </DashboardLayout>
  );
};

export default Attendance;