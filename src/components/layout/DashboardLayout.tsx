import { ReactNode } from "react";
import { DashboardHeader, UserRole, navItems } from "./DashboardHeader";
import { BottomNav } from "./BottomNav";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  schoolName?: string;
}

export function DashboardLayout({ children, role, schoolName }: DashboardLayoutProps) {
  const items = navItems[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <DashboardHeader role={role} schoolName={schoolName} />
      
      <main className="px-4 py-6 lg:px-6 lg:py-8 pb-28 lg:pb-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav role={role} items={items} />
    </div>
  );
}
