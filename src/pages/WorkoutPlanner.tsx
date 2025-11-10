import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Dumbbell, RefreshCw } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StrengthProgress } from "@/components/workout-tracking/StrengthProgress";
import { AdaptiveProgressionEngine } from "@/components/workout-tracking/AdaptiveProgressionEngine";
import { WorkoutSession } from "@/components/workout-tracking/WorkoutSession";
import { WorkoutHistory } from "@/components/workout-tracking/WorkoutHistory";

const WorkoutPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    fitnessGoal: "",
    equipment: "",
    daysPerWeek: ""
  });

  const generatePlan = async () => {
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
      setSelectedDay(null);

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
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              AI <span className="gradient-text">Workout Planner</span>
            </h1>
            <p className="text-muted-foreground">
              Get a personalized workout plan and track your progress
            </p>
          </div>

          <Tabs defaultValue="planner" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="planner">Plan Generator</TabsTrigger>
              <TabsTrigger value="track">Track Workout</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="planner" className="space-y-8">
              <Card className="glass-card">
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
                          <p className="text-sm text-muted-foreground">min/day</p>
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
                    {workoutPlan.weekly_schedule ? (
                      <div className="space-y-6">
                        {workoutPlan.weekly_schedule.map((day: any, dayIndex: number) => (
                          <div key={dayIndex} className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center text-white font-bold">
                                {day.day}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground">{day.focus}</h3>
                                <p className="text-sm text-muted-foreground">Day {day.day}</p>
                              </div>
                            </div>
                            <div className="space-y-3 ml-13">
                              {day.exercises?.map((exercise: any, exIndex: number) => (
                                <div
                                  key={exIndex}
                                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300"
                                >
                                  <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center flex-shrink-0">
                                    <Dumbbell className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                      <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                                      {exercise.rest_seconds && (
                                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-md">
                                          Rest: {exercise.rest_seconds}s
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{exercise.muscle_group}</p>
                                    {exercise.instructions && (
                                      <p className="text-xs text-foreground/70 mb-2 italic">{exercise.instructions}</p>
                                    )}
                                    <div className="flex gap-2">
                                      <div className="px-2 py-1 bg-muted/50 rounded text-xs">
                                        <span className="text-muted-foreground">Sets:</span>
                                        <span className="ml-1 font-semibold text-foreground">{exercise.sets}</span>
                                      </div>
                                      <div className="px-2 py-1 bg-muted/50 rounded text-xs">
                                        <span className="text-muted-foreground">Reps:</span>
                                        <span className="ml-1 font-semibold text-foreground">{exercise.reps}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
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
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="track" className="space-y-6">
              {workoutPlan?.weekly_schedule ? (
                selectedDay !== null ? (
                  <WorkoutSession
                    dayWorkout={workoutPlan.weekly_schedule[selectedDay - 1]}
                    dayNumber={selectedDay}
                    onSessionComplete={() => {
                      setSelectedDay(null);
                      toast({ title: "Great work! 💪" });
                    }}
                  />
                ) : (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Select a Workout Day</CardTitle>
                      <CardDescription>Choose which day's workout you want to track</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {workoutPlan.weekly_schedule.map((day: any) => (
                          <Button
                            key={day.day}
                            onClick={() => setSelectedDay(day.day)}
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center text-white font-bold">
                              {day.day}
                            </div>
                            <span className="text-sm font-semibold">{day.focus}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-12 text-center">
                    <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Generate a workout plan first to start tracking</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <WorkoutHistory />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <AdaptiveProgressionEngine />
              <StrengthProgress />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WorkoutPlanner;