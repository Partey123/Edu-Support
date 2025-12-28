import { Users, ClipboardCheck, TrendingUp, CreditCard, Bell, FileText, Calendar, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const children = [
  { 
    id: 1, 
    name: "Kofi Mensah Jr.", 
    class: "Basic 6A", 
    attendance: "94%", 
    lastGrade: "A", 
    avatar: "KM",
    recentActivity: "Attended school today"
  },
  { 
    id: 2, 
    name: "Ama Mensah", 
    class: "Basic 4B", 
    attendance: "98%", 
    lastGrade: "A+", 
    avatar: "AM",
    recentActivity: "Math test: 18/20"
  },
];

const recentNotifications = [
  { id: 1, type: "attendance", message: "Kofi Mensah Jr. was marked present today", time: "8:30 AM" },
  { id: 2, type: "grade", message: "Ama Mensah received 18/20 in Math Quiz", time: "Yesterday" },
  { id: 3, type: "announcement", message: "Parent-Teacher Meeting scheduled for Dec 28", time: "2 days ago" },
  { id: 4, type: "fee", message: "Term 2 fee payment received - GHS 800", time: "1 week ago" },
];

const upcomingEvents = [
  { id: 1, title: "Parent-Teacher Meeting", date: "Dec 28, 2025", time: "2:00 PM" },
  { id: 2, title: "End of Term 2", date: "Jan 15, 2026", time: "" },
  { id: 3, title: "Inter-House Sports", date: "Jan 10, 2026", time: "9:00 AM" },
];

export default function ParentDashboard() {
  return (
    <DashboardLayout role="parent" schoolName="Bright Future Basic School">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Welcome, Mr. Mensah! 👋
        </h1>
        <p className="text-muted-foreground">
          Stay updated with your children's progress at Bright Future Basic School.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Children"
          value="2"
          change="All present today"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Average Attendance"
          value="96%"
          change="+2% this term"
          changeType="positive"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Average Grade"
          value="A"
          change="Excellent performance"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Pending Fees"
          value="GHS 0"
          change="All paid"
          changeType="positive"
          icon={CreditCard}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Children Cards */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">My Children</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/parent/children">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{child.name}</h3>
                          <p className="text-sm text-muted-foreground">{child.class}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/parent/children/${child.id}`}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Attendance:</span>
                          <span className="font-semibold text-foreground">{child.attendance}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Last Grade:</span>
                          <Badge variant="secondary" className="font-semibold">{child.lastGrade}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        {child.recentActivity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-card p-6 rounded-2xl border border-border mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Notifications</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notification.type === "attendance" ? "bg-success/10 text-success" :
                    notification.type === "grade" ? "bg-primary/10 text-primary" :
                    notification.type === "fee" ? "bg-accent/20 text-accent-foreground" :
                    "bg-info/10 text-info"
                  }`}>
                    {notification.type === "attendance" ? <ClipboardCheck className="h-4 w-4" /> :
                     notification.type === "grade" ? <TrendingUp className="h-4 w-4" /> :
                     notification.type === "fee" ? <CreditCard className="h-4 w-4" /> :
                     <Bell className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="dashboard" className="w-full justify-start" asChild>
                <Link to="/parent/attendance">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  View Attendance
                </Link>
              </Button>
              <Button variant="dashboard" className="w-full justify-start" asChild>
                <Link to="/parent/grades">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Grades
                </Link>
              </Button>
              <Button variant="dashboard" className="w-full justify-start" asChild>
                <Link to="/parent/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Reports
                </Link>
              </Button>
              <Button variant="dashboard" className="w-full justify-start" asChild>
                <Link to="/parent/payments">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Payment
                </Link>
              </Button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-muted/30 rounded-lg"
                >
                  <p className="font-medium text-foreground text-sm">{event.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                    {event.time && (
                      <>
                        <span>•</span>
                        {event.time}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-primary p-6 rounded-2xl text-primary-foreground">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/80">Term 2 Fees</span>
                <span className="font-semibold">GHS 1,600</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/80">Paid</span>
                <span className="font-semibold">GHS 1,600</span>
              </div>
              <div className="border-t border-primary-foreground/20 pt-3 flex items-center justify-between">
                <span className="text-primary-foreground/80">Balance</span>
                <span className="font-bold text-lg">GHS 0</span>
              </div>
            </div>
            <Button variant="heroGold" className="w-full mt-4" asChild>
              <Link to="/parent/payments">View Payment History</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
