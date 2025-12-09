import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  ClipboardCheck,
  Library,
  Bus,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  Video,
  QrCode
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const mainNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Students", href: "/dashboard/students" },
    { icon: GraduationCap, label: "Teachers", href: "/dashboard/teachers" },
    { icon: BookOpen, label: "Classes", href: "/dashboard/classes" },
    { icon: Video, label: "Virtual Class", href: "/dashboard/virtual-class" },
    { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/attendance" },
    { icon: Calendar, label: "Timetable", href: "/dashboard/timetable" },
    { icon: CreditCard, label: "Finance", href: "/dashboard/finance" },
    { icon: Library, label: "Library", href: "/dashboard/library" },
    { icon: Bus, label: "Transport", href: "/dashboard/transport" },
    { icon: MessageSquare, label: "Communication", href: "/dashboard/communication" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  ];

  const bottomNavItems = [
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              Edu<span className="text-primary">Flow</span>
            </span>
          )}
        </NavLink>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors hidden lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                end={item.href === "/dashboard"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-3">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Exit Dashboard</span>}
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-card/70 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-secondary lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students, teachers, classes..."
            className="w-[300px] lg:w-[400px] h-10 pl-10 pr-4 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <NavLink
          to="/dashboard/qr-scanner"
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <QrCode className="w-5 h-5 text-muted-foreground" />
        </NavLink>
        <ThemeToggle />
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
            JK
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">John Kofi</p>
            <p className="text-xs text-muted-foreground">School Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[260px]"
        )}
      >
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
