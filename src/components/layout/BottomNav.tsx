import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export type UserRole = "super-admin" | "school-admin" | "teacher" | "parent";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BottomNavProps {
  role: UserRole;
  items: NavItem[];
}

export function BottomNav({ role, items }: BottomNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Safety check - ensure items is an array
  const navItems = Array.isArray(items) ? items : [];

  // Show first 3 items in the bottom bar, rest in overflow menu
  const visibleItems = navItems.slice(0, 3);
  const overflowItems = navItems.slice(3);
  const hasOverflow = overflowItems.length > 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Water Droplet Overflow Menu */}
      {hasOverflow && (
        <div
          className={cn(
            "fixed bottom-24 right-4 z-50 lg:hidden transition-all duration-300 ease-out origin-bottom-right",
            isMenuOpen 
              ? "opacity-100 scale-100 pointer-events-auto" 
              : "opacity-0 scale-75 pointer-events-none"
          )}
        >
          {/* Water droplet shape wrapper */}
          <div className="relative">
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full blur-xl transition-all duration-300",
              isMenuOpen && "bg-primary/20"
            )} />
            
            {/* Main menu container - water droplet shape */}
            <div className="relative bg-card border border-border rounded-3xl shadow-xl p-3 space-y-2 min-w-max">
              {/* Top teardrop point */}
              <div className="absolute -top-2 right-6 w-4 h-4 bg-card border border-border rounded-full" />
              
              {overflowItems.map((item, index) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-2xl whitespace-nowrap",
                      "hover:scale-105 active:scale-95",
                      isActive
                        ? "bg-primary/20 text-primary shadow-md"
                        : "text-foreground hover:bg-muted/50"
                    )}
                    style={{
                      animation: isMenuOpen ? `slideUp 0.3s ease-out ${index * 0.05}s forwards` : 'none',
                      opacity: isMenuOpen ? 1 : 0,
                    }}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>
                );
              })}
              
              <div className="h-px bg-border" />
              
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-destructive transition-all duration-200 rounded-2xl",
                  "hover:bg-destructive/10 active:scale-95"
                )}
                style={{
                  animation: isMenuOpen ? `slideUp 0.3s ease-out ${(overflowItems.length + 1) * 0.05}s forwards` : 'none',
                  opacity: isMenuOpen ? 1 : 0,
                }}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>

          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-3">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 flex-1 rounded-2xl group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-2.5 transition-all duration-200 rounded-xl",
                  isActive && "bg-primary/10 shadow-md scale-110"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-center line-clamp-1 group-hover:text-foreground transition-colors">{item.title}</span>
              </Link>
            );
          })}
          
          {hasOverflow && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 flex-1 rounded-2xl group",
                isMenuOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2.5 transition-all duration-200 rounded-xl",
                isMenuOpen && "bg-primary/10 shadow-md scale-110"
              )}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </div>
              <span className="text-xs font-semibold text-center group-hover:text-foreground transition-colors">More</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
