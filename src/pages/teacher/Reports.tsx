import { FileText, Download, Calendar, Filter, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses } from "@/hooks/useSchoolData";
import { useState } from "react";

type ReportType = "attendance" | "grades" | "progress" | "summary";

interface ReportTypeInfo {
  value: ReportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const reportTypes: ReportTypeInfo[] = [
  { value: "attendance", label: "Attendance Report", icon: Calendar, description: "Generate detailed attendance records for your classes" },
  { value: "grades", label: "Grades Report", icon: FileText, description: "Generate detailed grades report for your classes" },
  { value: "progress", label: "Progress Report", icon: FileText, description: "Generate progress reports for individual students" },
  { value: "summary", label: "Class Summary", icon: FileText, description: "Generate a comprehensive class summary report" },
];

export default function TeacherReports() {
  const { profile } = useAuth();
  const { data: teacherClasses = [], isLoading: classesLoading } = useTeacherClasses();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [reportType, setReportType] = useState<ReportType>("attendance");

  // Reports feature is currently disabled - depends on non-existent database RPC
  const reportLoading = false;
  const reportData = null;

  const handleGenerateReport = async (classId: string, type: ReportType) => {
    console.log('Report generation disabled - feature under development');
    // Reports feature disabled: depends on non-existent database RPC function
  };

  if (classesLoading) {
    return (
      <DashboardLayout role="teacher" schoolName="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const schoolName = 'Your School';

  return (
    <DashboardLayout role="teacher" schoolName={schoolName}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Reports
        </h1>
        <p className="text-muted-foreground">
          Generate and download reports for your classes
        </p>
      </div>

      {/* Report Generator */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Select Class
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {teacherClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Report Type
            </label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={() => handleGenerateReport(selectedClass, reportType)}
              disabled={true}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report (Disabled - Feature Under Development)
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Types */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.value} 
              className="p-6 hover:border-primary transition-colors cursor-pointer"
              onClick={() => {
                setReportType(type.value);
                handleGenerateReport(selectedClass, type.value);
              }}
            >
              <div className="bg-primary/10 p-3 rounded-xl w-fit mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{type.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {type.description}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Report Preview */}
      {reportData && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Report Preview</h2>
          <div className="bg-muted/30 p-4 rounded-lg overflow-auto max-h-[400px]">
            <pre className="text-sm">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Recent Reports */}
      <Card className="p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No recent reports</p>
          <p className="text-sm">Generate your first report to see it here</p>
        </div>
      </Card>
    </DashboardLayout>
  );
}