import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, TrendingUp, Video, Settings, LogOut, Dumbbell, Utensils, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  if (location.pathname === "/auth" || location.pathname === "/") {
    return null;
  }

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/diet-planner", icon: Utensils, label: "Diet" },
    { to: "/workout-planner", icon: Dumbbell, label: "Workout" },
    { to: "/form-checker", icon: Video, label: "Form" },
    { to: "/coach", icon: MessageSquare, label: "AI Coach" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const NavLinks = ({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) => (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              mobile ? "w-full text-base py-3" : ""
            } ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={mobile ? "w-5 h-5" : "w-4 h-4"} />
            <span className={`font-medium ${mobile ? "text-base" : "text-sm"}`}>{link.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center">
            <span className="text-xl font-bold text-primary">Macromind</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLinks />
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

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-card">
                <div className="flex flex-col h-full pt-8">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xl font-bold text-primary">Macromind</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2 flex-1">
                    <NavLinks mobile onNavigate={() => setIsOpen(false)} />
                  </div>

                  {user && (
                    <div className="border-t border-border pt-4 mt-4">
                      <Button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start text-muted-foreground"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
