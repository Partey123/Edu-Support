import { Calendar, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];

const timetableData: Record<string, Record<string, { subject: string; teacher: string; color: string }>> = {
  "Monday": {
    "8:00 AM": { subject: "Mathematics", teacher: "Mr. Adjei", color: "bg-primary/10 border-primary/30 text-primary" },
    "9:00 AM": { subject: "English", teacher: "Mrs. Osei", color: "bg-violet-100 border-violet-300 text-violet-600" },
    "10:00 AM": { subject: "Break", teacher: "", color: "bg-muted border-border text-muted-foreground" },
    "11:00 AM": { subject: "Science", teacher: "Mr. Mensah", color: "bg-emerald-100 border-emerald-300 text-emerald-600" },
    "12:00 PM": { subject: "Lunch", teacher: "", color: "bg-muted border-border text-muted-foreground" },
    "1:00 PM": { subject: "Social Studies", teacher: "Ms. Asante", color: "bg-amber-100 border-amber-300 text-amber-600" },
    "2:00 PM": { subject: "ICT", teacher: "Mr. Frimpong", color: "bg-sky-100 border-sky-300 text-sky-600" },
  },
  "Tuesday": {
    "8:00 AM": { subject: "English", teacher: "Mrs. Osei", color: "bg-violet-100 border-violet-300 text-violet-600" },
    "9:00 AM": { subject: "Mathematics", teacher: "Mr. Adjei", color: "bg-primary/10 border-primary/30 text-primary" },
    "10:00 AM": { subject: "Break", teacher: "", color: "bg-muted border-border text-muted-foreground" },
    "11:00 AM": { subject: "ICT", teacher: "Mr. Frimpong", color: "bg-sky-100 border-sky-300 text-sky-600" },
    "12:00 PM": { subject: "Lunch", teacher: "", color: "bg-muted border-border text-muted-foreground" },
    "1:00 PM": { subject: "Science", teacher: "Mr. Mensah", color: "bg-emerald-100 border-emerald-300 text-emerald-600" },
    "2:00 PM": { subject: "French", teacher: "Mme. Kouame", color: "bg-rose-100 border-rose-300 text-rose-600" },
  },
};

const Timetable = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground">View and manage class schedules</p>
        </div>
        <div className="flex gap-3">
          <select className="h-10 px-4 rounded-lg bg-background/50 border border-border/50 text-sm glass-button">
            <option>Form 3 Gold</option>
            <option>Form 3 Silver</option>
            <option>Form 2 Blue</option>
            <option>Form 2 Green</option>
          </select>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Period
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground w-24">
                  <Clock className="w-4 h-4" />
                </th>
                {days.map((day) => (
                  <th key={day} className="p-4 text-center text-sm font-medium text-foreground">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period} className="border-b border-border/30">
                  <td className="p-4 text-sm font-medium text-muted-foreground">{period}</td>
                  {days.map((day) => {
                    const slot = timetableData[day]?.[period];
                    return (
                      <td key={`${day}-${period}`} className="p-2">
                        {slot ? (
                          <div className={`p-3 rounded-lg border ${slot.color} transition-all hover:scale-105`}>
                            <p className="font-medium text-sm">{slot.subject}</p>
                            {slot.teacher && (
                              <p className="text-xs opacity-80">{slot.teacher}</p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-dashed border-border/50 text-center">
                            <span className="text-xs text-muted-foreground">-</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;
