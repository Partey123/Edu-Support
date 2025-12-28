import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Users, Download } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const classes = ["Basic 6A", "Basic 6B", "Basic 5A", "Basic 5B", "Basic 4A", "Basic 4B"];

const attendanceData = [
  { date: "2025-12-26", present: 32, absent: 2, late: 1, total: 35 },
  { date: "2025-12-25", present: 33, absent: 1, late: 1, total: 35 },
  { date: "2025-12-24", present: 30, absent: 3, late: 2, total: 35 },
  { date: "2025-12-23", present: 34, absent: 1, late: 0, total: 35 },
  { date: "2025-12-22", present: 31, absent: 2, late: 2, total: 35 },
];

const weeklyStats = {
  averageAttendance: 92.5,
  totalPresent: 160,
  totalAbsent: 9,
  totalLate: 6,
};

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("Basic 6A");
  const [selectedDate, setSelectedDate] = useState("2025-12-26");

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "text-success";
    if (rate >= 85) return "text-warning";
    return "text-destructive";
  };

  return (
    <DashboardLayout role="school-admin" schoolName="Bright Future Basic School">
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
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
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
            Recent Attendance - {selectedClass}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  const rate = Math.round((record.present / record.total) * 100);
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
        </CardContent>
      </Card>

      {/* Alert for Low Attendance */}
      <div className="mt-6 p-4 bg-warning/10 rounded-xl border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Attendance Alert</p>
            <p className="text-sm text-muted-foreground mt-1">
              3 students in {selectedClass} have attendance below 80% this term. Consider reaching out to their parents.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
