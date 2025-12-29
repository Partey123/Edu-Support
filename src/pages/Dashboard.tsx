import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Download,
  Calendar,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: string; 
  changeType: "up" | "down"; 
  icon: React.ElementType;
  color: string;
}) => (
  <div className="bg-card rounded-xl p-5 border border-border hover:shadow-card transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <button className="p-1 rounded hover:bg-secondary transition-colors">
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className={`flex items-center text-xs font-medium ${changeType === "up" ? "text-emerald-600" : "text-destructive"}`}>
        {changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </span>
    </div>
  </div>
);

const AttendanceCard = () => (
  <div className="bg-card rounded-xl p-5 border border-border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-foreground">Today's Attendance</h3>
      <span className="text-xs text-muted-foreground">Dec 9, 2025</span>
    </div>
    
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="text-center p-3 bg-emerald-50 rounded-lg">
        <UserCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
        <p className="text-lg font-bold text-emerald-600">1,142</p>
        <p className="text-xs text-muted-foreground">Present</p>
      </div>
      <div className="text-center p-3 bg-destructive/10 rounded-lg">
        <UserX className="w-5 h-5 text-destructive mx-auto mb-1" />
        <p className="text-lg font-bold text-destructive">78</p>
        <p className="text-xs text-muted-foreground">Absent</p>
      </div>
      <div className="text-center p-3 bg-amber-50 rounded-lg">
        <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
        <p className="text-lg font-bold text-amber-600">27</p>
        <p className="text-xs text-muted-foreground">Late</p>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Attendance Rate</span>
        <span className="font-semibold text-foreground">91.6%</span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full gradient-primary rounded-full" style={{ width: "91.6%" }} />
      </div>
    </div>
  </div>
);

const QuickActionsCard = () => {
  const actions = [
    { icon: Users, label: "Add Student", color: "bg-primary/10 text-primary" },
    { icon: GraduationCap, label: "Add Teacher", color: "bg-violet-100 text-violet-600" },
    { icon: CreditCard, label: "Record Payment", color: "bg-emerald-100 text-emerald-600" },
    { icon: FileText, label: "Generate Report", color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const RecentActivityCard = () => {
  const activities = [
    { 
      icon: CheckCircle2, 
      color: "text-emerald-600 bg-emerald-100", 
      title: "Fee Payment Received", 
      description: "Kwame Asante paid GHS 500 for Term 2",
      time: "2 min ago" 
    },
    { 
      icon: Users, 
      color: "text-primary bg-primary/10", 
      title: "New Student Enrolled", 
      description: "Akua Mensah added to Form 2 Gold",
      time: "15 min ago" 
    },
    { 
      icon: AlertCircle, 
      color: "text-amber-600 bg-amber-100", 
      title: "Attendance Alert", 
      description: "5 students absent for 3+ days",
      time: "1 hour ago" 
    },
    { 
      icon: Calendar, 
      color: "text-violet-600 bg-violet-100", 
      title: "Event Reminder", 
      description: "Parent-Teacher Meeting tomorrow",
      time: "2 hours ago" 
    },
  ];

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-3">
            <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center shrink-0`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinanceSummaryCard = () => (
  <div className="bg-card rounded-xl p-5 border border-border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-foreground">Finance Summary</h3>
      <select className="text-xs bg-secondary border-0 rounded-lg px-2 py-1 text-muted-foreground">
        <option>This Term</option>
        <option>This Month</option>
        <option>This Year</option>
      </select>
    </div>
    
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Collected</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-bold text-emerald-600">GHS 125,450</p>
        <p className="text-xs text-muted-foreground mt-1">78% of expected</p>
      </div>

      <div className="p-4 bg-destructive/10 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Outstanding</span>
          <TrendingDown className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-2xl font-bold text-destructive">GHS 35,200</p>
        <p className="text-xs text-muted-foreground mt-1">45 students with pending fees</p>
      </div>
    </div>

    <Button variant="outline" className="w-full mt-4">
      <Download className="w-4 h-4 mr-2" />
      Download Report
    </Button>
  </div>
);

const UpcomingEventsCard = () => {
  const events = [
    { title: "Parent-Teacher Meeting", date: "Dec 10", time: "10:00 AM", type: "Meeting" },
    { title: "Term 1 Exams Begin", date: "Dec 15", time: "8:00 AM", type: "Exam" },
    { title: "Sports Day", date: "Dec 20", time: "9:00 AM", type: "Event" },
  ];

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
              <span className="text-xs text-primary font-medium">{event.date.split(" ")[0]}</span>
              <span className="text-sm font-bold text-primary">{event.date.split(" ")[1]}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{event.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const stats = [
    { 
      title: "Total Students", 
      value: "1,247", 
      change: "+12%", 
      changeType: "up" as const, 
      icon: Users,
      color: "bg-primary/10 text-primary"
    },
    { 
      title: "Total Teachers", 
      value: "56", 
      change: "+3", 
      changeType: "up" as const, 
      icon: GraduationCap,
      color: "bg-violet-100 text-violet-600"
    },
    { 
      title: "Fee Collection", 
      value: "GHS 125K", 
      change: "+8%", 
      changeType: "up" as const, 
      icon: CreditCard,
      color: "bg-emerald-100 text-emerald-600"
    },
    { 
      title: "Attendance Rate", 
      value: "91.6%", 
      change: "-2%", 
      changeType: "down" as const, 
      icon: UserCheck,
      color: "bg-amber-100 text-amber-600"
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, John! Here's what's happening at your school.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceCard />
          <RecentActivityCard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActionsCard />
          <FinanceSummaryCard />
          <UpcomingEventsCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
