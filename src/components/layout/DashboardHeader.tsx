import { User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  FileText,
  Settings,
  Building,
  CreditCard,
  BookOpen,
  Calendar,
  Video,
  Code,
} from "lucide-react";

export type UserRole = "super-admin" | "school-admin" | "teacher" | "parent";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: Record<UserRole, NavItem[]> = {
  "super-admin": [
    { title: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { title: "Schools", href: "/super-admin/schools", icon: Building },
    { title: "Subscriptions", href: "/super-admin/plans", icon: CreditCard },
    { title: "Codes", href: "/super-admin/codes", icon: Code },
    { title: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
    { title: "Settings", href: "/super-admin/settings", icon: Settings },
  ],
  "school-admin": [
    { title: "Dashboard", href: "/school-admin/dashboard", icon: LayoutDashboard },
    { title: "Students", href: "/school-admin/students", icon: Users },
    { title: "Teachers", href: "/school-admin/teachers", icon: GraduationCap },
    { title: "Classes", href: "/school-admin/classes", icon: BookOpen },
    { title: "Subjects", href: "/school-admin/subjects", icon: FileText },
    { title: "Attendance", href: "/school-admin/attendance", icon: ClipboardCheck },
    { title: "Reports", href: "/school-admin/reports", icon: BarChart3 },
    { title: "Settings", href: "/school-admin/settings", icon: Settings },
  ],
  teacher: [
    { title: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { title: "Classes", href: "/teacher/classes", icon: BookOpen },
    { title: "Virtual Class", href: "/teacher/virtual-class", icon: Video },
    { title: "Reports", href: "/teacher/reports", icon: FileText },
    { title: "Students", href: "/teacher/students", icon: Users },
  ],
  parent: [
    { title: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
    { title: "Children", href: "/parent/children", icon: Users },
    { title: "Attendance", href: "/parent/attendance", icon: Calendar },
    { title: "Grades", href: "/parent/grades", icon: BarChart3 },
    { title: "Reports", href: "/parent/reports", icon: FileText },
    { title: "Payments", href: "/parent/payments", icon: CreditCard },
  ],
};

interface DashboardHeaderProps {
  role: UserRole;
  schoolName?: string;
}

const roleLabels: Record<UserRole, string> = {
  "super-admin": "Super Admin",
  "school-admin": "School Admin",
  teacher: "Teacher",
  parent: "Parent",
};

export function DashboardHeader({ role, schoolName = "Your School" }: DashboardHeaderProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = navItems[role] || [];

  const userName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
    : 'User';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border"
      style={{ minHeight: '64px' }}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left - App Logo and Name */}
          <Link to={`/${role}/dashboard`} className="flex items-center gap-2">
            <img src="/favicon.svg" alt="EduSupport" className="h-8 w-8 hidden sm:block" />
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              Edu<span className="text-primary">Support</span>
            </span>
          </Link>

          {/* Center - Navigation (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-1">
            {items && items.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground rounded-xl shadow-md scale-105"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right - Theme Toggle + User Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1.5 transition-all duration-200">
                  <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
                    {userName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-foreground leading-none mb-0.5">{userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {role === "super-admin" ? "EduSupport" : schoolName}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{userName}</span>
                    <span className="text-xs font-normal text-muted-foreground">{roleLabels[role]}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
    </header>
  );
}
