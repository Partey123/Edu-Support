import { FileText, Download, Printer, Calendar, Users, TrendingUp } from "lucide-react";
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
import { useState } from "react";

const reportTypes = [
  { id: "term-report", name: "Term Report Cards", description: "Individual student performance reports", icon: FileText },
  { id: "class-summary", name: "Class Summary", description: "Overview of class performance", icon: Users },
  { id: "attendance-report", name: "Attendance Report", description: "Attendance statistics and trends", icon: Calendar },
  { id: "progress-report", name: "Progress Report", description: "Student progress tracking", icon: TrendingUp },
];

const recentReports = [
  { id: "1", name: "Term 1 Report Cards - Basic 6A", type: "term-report", generatedAt: "2025-12-20", students: 35, status: "ready" },
  { id: "2", name: "Term 1 Report Cards - Basic 6B", type: "term-report", generatedAt: "2025-12-20", students: 32, status: "ready" },
  { id: "3", name: "Attendance Summary - November 2025", type: "attendance-report", generatedAt: "2025-12-01", students: 456, status: "ready" },
  { id: "4", name: "Class Summary - Basic 5A", type: "class-summary", generatedAt: "2025-11-30", students: 38, status: "ready" },
  { id: "5", name: "Progress Report Q3 - Basic 4B", type: "progress-report", generatedAt: "2025-11-25", students: 38, status: "ready" },
];

export default function ReportsPage() {
  const [selectedTerm, setSelectedTerm] = useState("term-1");
  const [selectedClass, setSelectedClass] = useState("all");

  return (
    <DashboardLayout role="school-admin" schoolName="Bright Future Basic School">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground">Generate and manage academic reports.</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term-1">Term 1</SelectItem>
              <SelectItem value="term-2">Term 2</SelectItem>
              <SelectItem value="term-3">Term 3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="basic-6a">Basic 6A</SelectItem>
              <SelectItem value="basic-6b">Basic 6B</SelectItem>
              <SelectItem value="basic-5a">Basic 5A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <report.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{report.name}</h3>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Report Name</th>
                  <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Type</th>
                  <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Students</th>
                  <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Generated</th>
                  <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{report.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="secondary" className="capitalize">
                        {report.type.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="py-4 text-foreground">{report.students}</td>
                    <td className="py-4 text-muted-foreground">
                      {new Date(report.generatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4">
                      <Badge variant="default">Ready</Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Generate New Report CTA */}
      <div className="mt-6 p-6 bg-gradient-primary rounded-2xl text-primary-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Generate Term Reports</h3>
            <p className="text-primary-foreground/80">
              Generate report cards for all students in a class with a single click.
            </p>
          </div>
          <Button variant="heroGold" size="lg">
            Generate All Reports
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
