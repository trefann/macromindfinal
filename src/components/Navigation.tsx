import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, TrendingUp, Video, User, LogOut, Dumbbell, Utensils } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  if (location.pathname === "/auth" || location.pathname === "/") {
    return null;
  }

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/diet-planner", icon: Utensils, label: "Diet" },
    { to: "/workout-planner", icon: Dumbbell, label: "Workout" },
    { to: "/form-checker", icon: Video, label: "Form" },
    { to: "/progress", icon: TrendingUp, label: "Progress" },
    { to: "/coach", icon: MessageSquare, label: "AI Coach" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center">
              <span className="text-lg font-bold">M</span>
            </div>
            <span className="text-xl font-bold gradient-text">Macromind</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-neon text-white"
                      : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
            {user && (
              <Button
                onClick={signOut}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent ml-2"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile menu - simplified for now */}
          <div className="md:hidden">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
