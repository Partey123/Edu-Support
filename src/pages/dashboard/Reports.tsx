import { BarChart3, Download, FileText, TrendingUp, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const reportsData = [
  { name: "Student Enrollment Report", type: "Academic", lastGenerated: "Dec 8, 2025", icon: Users },
  { name: "Financial Summary", type: "Finance", lastGenerated: "Dec 7, 2025", icon: CreditCard },
  { name: "Attendance Report", type: "Academic", lastGenerated: "Dec 9, 2025", icon: FileText },
  { name: "Fee Collection Report", type: "Finance", lastGenerated: "Dec 6, 2025", icon: CreditCard },
  { name: "Academic Performance", type: "Academic", lastGenerated: "Dec 5, 2025", icon: TrendingUp },
  { name: "Staff Report", type: "HR", lastGenerated: "Dec 4, 2025", icon: Users },
];

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view school reports</p>
        </div>
        <Button variant="hero">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Reports Generated", value: "156", subtitle: "This month", color: "text-primary" },
          { label: "Scheduled Reports", value: "12", subtitle: "Auto-generated", color: "text-violet-600" },
          { label: "Downloads", value: "89", subtitle: "This week", color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Academic", count: 8, color: "bg-primary/10 text-primary" },
          { label: "Finance", count: 6, color: "bg-emerald-100 text-emerald-600" },
          { label: "HR", count: 4, color: "bg-violet-100 text-violet-600" },
          { label: "Custom", count: 3, color: "bg-amber-100 text-amber-600" },
        ].map((cat) => (
          <button key={cat.label} className="glass-card rounded-xl p-4 text-left hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{cat.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${cat.color}`}>{cat.count}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Available Reports</h3>
        </div>
        <div className="divide-y divide-border/30">
          {reportsData.map((report) => (
            <div key={report.name} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{report.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{report.type}</span>
                    <span>Last: {report.lastGenerated}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="glass-button">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="glass-button">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
