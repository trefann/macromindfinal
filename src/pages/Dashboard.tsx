import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Flame, Drumstick, Apple, Droplet, Dumbbell, Salad, Camera, TrendingUp, Sparkles, ArrowRight, Lightbulb, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import workoutIcon from "@/assets/workout-icon.jpg";
import nutritionIcon from "@/assets/nutrition-icon.jpg";
import progressIcon from "@/assets/progress-icon.jpg";
import formCheckerIcon from "@/assets/form-checker-icon.jpg";

const Dashboard = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [greeting, setGreeting] = useState<string>("Good Morning");

  // Mock data - replace with real data from your backend
  const dailyStats = {
    caloriesGoal: 2200,
    caloriesConsumed: 1650,
    caloriesRemaining: 550,
    workoutTime: 45,
    waterIntake: 6,
    waterGoal: 8,
  };

  const progressData = {
    caloriesProgress: (dailyStats.caloriesConsumed / dailyStats.caloriesGoal) * 100,
    workoutProgress: 75,
    overallProgress: 68,
  };

  const aiTips = [
    "💪 Your consistency is impressive! Keep up the great work.",
    "🥗 Try adding more protein to your breakfast for sustained energy.",
    "🏃 Consider a rest day tomorrow - recovery is crucial for progress.",
  ];

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Get user info
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      } else if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
              {greeting}, <span className="text-primary">{userName}</span> 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay consistent. Progress builds discipline.
            </p>
          </div>

          {/* Daily Summary Cards */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card border-primary/20 hover:shadow-glow transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Calories Goal</p>
                    <p className="text-3xl font-bold text-primary">{dailyStats.caloriesGoal}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Progress value={progressData.caloriesProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card className="glass-card border-secondary/20 hover:shadow-glow transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Consumed</p>
                    <p className="text-3xl font-bold text-secondary">{dailyStats.caloriesConsumed}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                    <Drumstick className="w-6 h-6 text-secondary" />
                  </div>
                </div>
                <Progress value={progressData.caloriesProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20 hover:shadow-glow transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-3xl font-bold text-accent">{dailyStats.caloriesRemaining}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(progressData.caloriesProgress)}% of goal
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 hover:shadow-glow transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Water Intake</p>
                    <p className="text-3xl font-bold text-primary">
                      {dailyStats.waterIntake}/{dailyStats.waterGoal}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Progress 
                  value={(dailyStats.waterIntake / dailyStats.waterGoal) * 100} 
                  className="h-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="glass-card border-primary/30 hover:border-primary/60 hover:shadow-glow transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate('/diet-planner')}
              >
                <div 
                  className="h-32 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${nutritionIcon})` }}
                />
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Salad className="w-6 h-6 text-teal-500" />
                  </div>
                  <CardTitle className="text-lg">AI Diet Planner</CardTitle>
                  <CardDescription>Generate personalized meal plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    Plan Meals <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="glass-card border-secondary/30 hover:border-secondary/60 hover:shadow-glow transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate('/workout-planner')}
              >
                <div 
                  className="h-32 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${workoutIcon})` }}
                />
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-lg">AI Workout Planner</CardTitle>
                  <CardDescription>Custom workout routines</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-secondary/10">
                    Create Workout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="glass-card border-accent/30 hover:border-accent/60 hover:shadow-glow transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate('/form-checker')}
              >
                <div 
                  className="h-32 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${formCheckerIcon})` }}
                />
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-500/20 to-mint-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-mint-500" />
                  </div>
                  <CardTitle className="text-lg">AI Form Checker</CardTitle>
                  <CardDescription>Real-time exercise analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-accent/10">
                    Check Form <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

               <Card 
                className="glass-card border-primary/30 hover:border-primary/60 hover:shadow-glow transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate('/meal-tracking')}
              >
                <div 
                  className="h-32 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${nutritionIcon})` }}
                />
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="w-6 h-6 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">Meal Tracking</CardTitle>
                  <CardDescription>Track your daily intake</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    Log Meals <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="glass-card border-primary/30 hover:border-primary/60 hover:shadow-glow transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate('/progress')}
              >
                <div 
                  className="h-32 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${progressIcon})` }}
                />
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Progress Tracker</CardTitle>
                  <CardDescription>View detailed analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    View Progress <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                AI Insights
              </CardTitle>
              <CardDescription>Tips and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiTips.map((tip, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 hover:border-primary/40 transition-all"
                >
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Today's Workout</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {dailyStats.workoutTime} minutes completed
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/workout-planner')}
                >
                  View Workout Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
