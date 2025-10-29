import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Dumbbell, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  useEffect(() => {
    // GSAP animations on mount
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
      );
    }

    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.children,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-pulse" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div ref={heroRef} className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Welcome to{" "}
              <span className="gradient-text text-glow">Macromind</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered fitness companion. Personalized diet plans, custom
              workouts, and intelligent coaching—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-neon hover:shadow-glow transition-all text-lg px-8 py-6 rounded-2xl"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
              <Link to="/coach">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass hover:bg-white/20 text-lg px-8 py-6 rounded-2xl border-2"
                >
                  Talk to AI Coach
                </Button>
              </Link>
              <Link to="/progress">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass hover:bg-white/20 text-lg px-8 py-6 rounded-2xl border-2"
                >
                  Track Progress
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-xl bg-gradient-neon flex items-center justify-center mb-6">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Custom Workouts</h3>
              <p className="text-muted-foreground">
                AI-generated workout plans tailored to your goals, experience
                level, and available equipment.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-xl bg-gradient-neon flex items-center justify-center mb-6">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Nutrition Coach</h3>
              <p className="text-muted-foreground">
                Personalized meal plans with macro tracking, recipe suggestions,
                and dietary adjustments based on your preferences.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-xl bg-gradient-neon flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Visualize your journey with detailed charts, body metrics, and
                performance analytics powered by AI insights.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
