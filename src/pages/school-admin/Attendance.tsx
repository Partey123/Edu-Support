import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Download,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceRecord {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface WeeklyStats {
  averageAttendance: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export default function AttendancePage() {
  const { schoolId } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    averageAttendance: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  // Fetch attendance data when class changes
  useEffect(() => {
    if (selectedClass && schoolId) {
      fetchAttendanceData();
    }
  }, [selectedClass, schoolId]);

  const fetchClasses = async () => {
    try {
      const { data: currentTerm } = await supabase
        .from("academic_terms")
        .select("id")
        .eq("school_id", schoolId!)
        .eq("is_current", true)
        .single();

      const termId = currentTerm?.id;

      const { data, error } = await supabase
        .from("classes")
        .select("id, name, level, section")
        .eq("school_id", schoolId!)
        .eq("academic_term_id", termId)
        .order("name");

      if (error) throw error;

      if (data && data.length > 0) {
        setClasses(data);
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Get the past 7 days of attendance for the selected class
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attendanceRecords, error } = await supabase
        .from("attendance")
        .select("date, status")
        .eq("class_id", selectedClass)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (error) throw error;

      // Get class enrollment count for total students
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id")
        .eq("class_id", selectedClass)
        .eq("status", "active");

      const totalStudents = enrollments?.length || 0;

      // Group attendance by date
      const groupedData: Record<string, Record<string, number>> = {};

      attendanceRecords?.forEach((record: any) => {
        if (!groupedData[record.date]) {
          groupedData[record.date] = { present: 0, absent: 0, late: 0 };
        }
        if (record.status === "present") groupedData[record.date].present++;
        else if (record.status === "absent") groupedData[record.date].absent++;
        else if (record.status === "late") groupedData[record.date].late++;
      });

      // Format for display
      const formattedData: AttendanceRecord[] = Object.entries(groupedData).map(
        ([date, counts]) => ({
          date,
          present: counts.present,
          absent: counts.absent,
          late: counts.late,
          total: totalStudents,
        })
      );

      setAttendanceData(formattedData);

      // Calculate weekly stats
      let totalPresent = 0,
        totalAbsent = 0,
        totalLate = 0,
        daysRecorded = 0;

      formattedData.forEach((record) => {
        totalPresent += record.present;
        totalAbsent += record.absent;
        totalLate += record.late;
        if (record.present + record.absent + record.late > 0) daysRecorded++;
      });

      const avgAttendance =
        daysRecorded > 0 ? Math.round((totalPresent / (daysRecorded * totalStudents)) * 100) : 0;

      setWeeklyStats({
        averageAttendance: avgAttendance,
        totalPresent,
        totalAbsent,
        totalLate,
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "text-success";
    if (rate >= 85) return "text-warning";
    return "text-destructive";
  };

  const selectedClassName = classes.find((c) => c.id === selectedClass)?.name || "";

  return (
    <DashboardLayout role="school-admin">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Attendance</h1>
          <p className="text-muted-foreground">Monitor and manage student attendance records.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.averageAttendance}%</p>
                <p className="text-sm text-muted-foreground">Weekly Avg.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.totalPresent}</p>
                <p className="text-sm text-muted-foreground">Present (Week)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.totalAbsent}</p>
                <p className="text-sm text-muted-foreground">Absent (Week)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.totalLate}</p>
                <p className="text-sm text-muted-foreground">Late (Week)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Attendance - {selectedClassName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : attendanceData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Present</th>
                    <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Absent</th>
                    <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Late</th>
                    <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Rate</th>
                    <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => {
                  const rate = record.total > 0 ? Math.round((record.present / record.total) * 100) : 0;
                  return (
                    <tr key={record.date} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <span className="font-medium text-foreground">
                          {new Date(record.date).toLocaleDateString("en-GB", { 
                            weekday: "short", 
                            day: "numeric", 
                            month: "short" 
                          })}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-foreground">{record.present}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-foreground">{record.absent}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-warning" />
                          <span className="text-foreground">{record.late}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`font-bold ${getAttendanceColor(rate)}`}>{rate}%</span>
                      </td>
                      <td className="py-4">
                        <Badge variant={rate >= 90 ? "default" : rate >= 80 ? "secondary" : "destructive"}>
                          {rate >= 90 ? "Good" : rate >= 80 ? "Average" : "Low"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert for Low Attendance */}
      {weeklyStats.totalAbsent > 0 && (
      <div className="mt-6 p-4 bg-warning/10 rounded-xl border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Attendance Alert</p>
            <p className="text-sm text-muted-foreground mt-1">
              {weeklyStats.totalAbsent} absence(s) recorded this week in {selectedClassName}. Consider reaching out to parents.
            </p>
          </div>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}
