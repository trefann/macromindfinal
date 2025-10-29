import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Dumbbell, RefreshCw } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const WorkoutPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    fitnessGoal: "",
    equipment: "",
    daysPerWeek: ""
  });

  const generatePlan = async () => {
    // Validate form
    if (!formData.age || !formData.gender || !formData.fitnessGoal || 
        !formData.equipment || !formData.daysPerWeek) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout-plan", {
        body: { 
          ...formData,
          age: parseInt(formData.age),
          daysPerWeek: parseInt(formData.daysPerWeek)
        }
      });

      if (error) throw error;

      setWorkoutPlan(data);
      toast({
        title: "Success!",
        description: "Your personalized workout plan has been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              AI <span className="gradient-text">Workout Planner</span>
            </h1>
            <p className="text-muted-foreground">
              Get a personalized workout plan based on your fitness goals
            </p>
          </div>

          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Your Fitness Profile</CardTitle>
              <CardDescription>
                Tell us about yourself to create a personalized workout plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="bg-muted/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Fitness Goal *</Label>
                  <Select value={formData.fitnessGoal} onValueChange={(value) => setFormData({...formData, fitnessGoal: value})}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                      <SelectItem value="strength">Build Strength</SelectItem>
                      <SelectItem value="endurance">Improve Endurance</SelectItem>
                      <SelectItem value="general-fitness">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment Available *</Label>
                  <Select value={formData.equipment} onValueChange={(value) => setFormData({...formData, equipment: value})}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-gym">Full Gym Access</SelectItem>
                      <SelectItem value="home-basic">Home (Dumbbells/Bands)</SelectItem>
                      <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="days">Days per Week *</Label>
                  <Select value={formData.daysPerWeek} onValueChange={(value) => setFormData({...formData, daysPerWeek: value})}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="How many days can you train?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="4">4 Days</SelectItem>
                      <SelectItem value="5">5 Days</SelectItem>
                      <SelectItem value="6">6 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generatePlan}
                disabled={loading}
                className="w-full mt-6 bg-gradient-neon hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Workout Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {workoutPlan && (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{workoutPlan.name}</CardTitle>
                    <CardDescription>{workoutPlan.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{workoutPlan.duration_minutes}</p>
                      <p className="text-sm text-muted-foreground">minutes</p>
                    </div>
                    <Button
                      onClick={generatePlan}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="border-primary/50 hover:bg-primary/10"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workoutPlan.exercises?.map((exercise: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-glow"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-neon flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{exercise.name}</h3>
                          {exercise.rest_seconds && (
                            <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-md">
                              Rest: {exercise.rest_seconds}s
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{exercise.muscle_group}</p>
                        {exercise.instructions && (
                          <p className="text-sm text-foreground/80 mb-3 italic">{exercise.instructions}</p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <div className="px-3 py-1.5 bg-muted/50 rounded-lg">
                            <span className="text-xs text-muted-foreground">Sets:</span>
                            <span className="ml-2 font-semibold text-foreground">{exercise.sets}</span>
                          </div>
                          <div className="px-3 py-1.5 bg-muted/50 rounded-lg">
                            <span className="text-xs text-muted-foreground">Reps:</span>
                            <span className="ml-2 font-semibold text-foreground">{exercise.reps}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WorkoutPlanner;