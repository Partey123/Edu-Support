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
  Bell,
  Search,
  Menu,
  Video,
  QrCode,
  X
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

const NavItem = ({ icon: Icon, label, href, isActive }: NavItemProps) => {
  return (
    <NavLink
      to={href}
      className={cn(
        "flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200 group relative min-w-[52px]",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span 
        className={cn(
          "text-[9px] font-medium mt-0.5 text-center leading-tight transition-all duration-200 max-w-[48px] truncate",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        )}
      >
        {label}
      </span>
    </NavLink>
  );
};

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const mainNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Students", href: "/dashboard/students" },
    { icon: GraduationCap, label: "Teachers", href: "/dashboard/teachers" },
    { icon: BookOpen, label: "Classes", href: "/dashboard/classes" },
    { icon: Video, label: "Virtual", href: "/dashboard/virtual-class" },
    { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/attendance" },
    { icon: Calendar, label: "Timetable", href: "/dashboard/timetable" },
    { icon: CreditCard, label: "Finance", href: "/dashboard/finance" },
    { icon: Library, label: "Library", href: "/dashboard/library" },
    { icon: Bus, label: "Transport", href: "/dashboard/transport" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/communication" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  ];

  const bottomNavItems = [
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[68px] glass-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-14 border-b border-sidebar-border/50 relative">
        <NavLink to="/dashboard" className="flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-sidebar-accent lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        <ul className="space-y-0.5">
          {mainNavItems.map((item) => (
            <li key={item.label}>
              <NavItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive(item.href)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border/50 p-1.5">
        <ul className="space-y-0.5">
          {bottomNavItems.map((item) => (
            <li key={item.label}>
              <NavItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive(item.href)}
              />
            </li>
          ))}
          <li>
            <NavLink
              to="/"
              className="flex flex-col items-center justify-center p-1.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-[9px] font-medium mt-0.5 opacity-0 group-hover:opacity-70 transition-opacity">
                Exit
              </span>
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
    <header className="sticky top-0 z-30 h-14 glass-header flex items-center justify-between px-4 lg:px-6">
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
            className="w-[280px] lg:w-[360px] h-9 pl-10 pr-4 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <NavLink
          to="/dashboard/qr-scanner"
          className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <QrCode className="w-5 h-5 text-muted-foreground" />
        </NavLink>
        <ThemeToggle />
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border/50">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20">
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-[68px] transition-all duration-300 min-w-0">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;