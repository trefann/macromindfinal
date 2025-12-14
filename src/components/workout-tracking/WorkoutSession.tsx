import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkoutTimer } from "./WorkoutTimer";
import { CheckCircle, Dumbbell, RefreshCw, TrendingUp, TrendingDown, MessageSquare, Loader2 } from "lucide-react";

interface WorkoutSessionProps {
  dayWorkout: any;
  dayNumber: number;
  onSessionComplete?: () => void;
}

interface ExerciseLog {
  name: string;
  sets: {
    weight: number;
    reps: number;
    rpe: number;
    completed: boolean;
  }[];
  notes: string;
}

export const WorkoutSession = ({ dayWorkout, dayNumber, onSessionComplete }: WorkoutSessionProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const { toast } = useToast();

  const exercises = Array.isArray(dayWorkout.exercises) ? dayWorkout.exercises : [];

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSessionStartTime(new Date());

    // Initialize exercise logs
    const logs = exercises.map((ex: any) => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets || 3 }, () => ({
        weight: 0,
        reps: parseInt(String(ex.reps).split('-')[0]) || 8,
        rpe: 7,
        completed: false,
      })),
      notes: "",
    }));
    setExerciseLogs(logs);

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        notes: `Day ${dayNumber}: ${dayWorkout.focus}`,
      })
      .select()
      .single();

    if (!error && data) {
      setSessionId(data.id);
    }
  };

  const updateSetLog = (exerciseIndex: number, setIndex: number, field: keyof ExerciseLog['sets'][0], value: any) => {
    setExerciseLogs(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const markSetComplete = async (exerciseIndex: number, setIndex: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !sessionId) return;

    const exercise = exercises[exerciseIndex];
    const setLog = exerciseLogs[exerciseIndex].sets[setIndex];

    // Save to database
    await supabase.from("workout_sets").insert({
      user_id: user.id,
      workout_session_id: sessionId,
      exercise_name: exercise.name,
      weight_kg: setLog.weight,
      reps: setLog.reps,
      rpe: setLog.rpe,
    });

    updateSetLog(exerciseIndex, setIndex, 'completed', true);

    toast({
      title: "Set logged!",
      description: `${setLog.weight}kg × ${setLog.reps} reps @ RPE ${setLog.rpe}`,
    });
  };

  const fetchAlternatives = async (exerciseIndex: number) => {
    setLoadingAlternatives(true);
    setShowAlternatives(exerciseIndex);

    try {
      const exercise = exercises[exerciseIndex];
      const { data, error } = await supabase.functions.invoke("ai-workout-assist", {
        body: {
          mode: "suggest",
          goal: "hypertrophy",
          currentExercises: [exercise],
          userProfile: { injuries: "", equipment: [] },
        },
      });

      if (!error && data?.suggestions) {
        setAlternatives(data.suggestions.map((s: any) => s.name || s));
      }
    } catch (e) {
      console.error("Failed to fetch alternatives:", e);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const swapExercise = (exerciseIndex: number, newExerciseName: string) => {
    // Update the exercise in the session (local state only)
    const updatedLogs = [...exerciseLogs];
    updatedLogs[exerciseIndex].name = newExerciseName;
    setExerciseLogs(updatedLogs);
    setShowAlternatives(null);

    toast({
      title: "Exercise swapped",
      description: `Now doing: ${newExerciseName}`,
    });
  };

  const adjustDifficulty = (exerciseIndex: number, harder: boolean) => {
    setExerciseLogs(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.map(set => ({
        ...set,
        weight: harder ? set.weight + 2.5 : Math.max(0, set.weight - 2.5),
        reps: harder ? set.reps : set.reps + 2,
      }));
      return updated;
    });

    toast({
      title: harder ? "Increased difficulty" : "Decreased difficulty",
      description: harder ? "Added weight to sets" : "Reduced weight, added reps",
    });
  };

  const completeSession = async () => {
    if (!sessionId || !sessionStartTime) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const durationMinutes = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000);
    const completedSets = exerciseLogs.flatMap(e => e.sets.filter(s => s.completed));
    const totalVolume = completedSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
    const avgRPE = completedSets.length > 0
      ? completedSets.reduce((sum, s) => sum + s.rpe, 0) / completedSets.length
      : 0;

    // Check for PRs
    let newPRs = 0;
    for (const log of exerciseLogs) {
      const maxSet = log.sets.filter(s => s.completed).sort((a, b) => (b.weight * (1 + b.reps / 30)) - (a.weight * (1 + a.reps / 30)))[0];
      if (maxSet && maxSet.weight > 0) {
        const est1RM = maxSet.weight * (1 + maxSet.reps / 30);

        const { data: existingPR } = await supabase
          .from("personal_records")
          .select("value")
          .eq("user_id", user.id)
          .eq("exercise_name", log.name)
          .eq("record_type", "1RM")
          .order("value", { ascending: false })
          .limit(1)
          .single();

        if (!existingPR || est1RM > existingPR.value) {
          await supabase.from("personal_records").insert({
            user_id: user.id,
            exercise_name: log.name,
            record_type: "1RM",
            value: est1RM,
          });
          newPRs++;
        }
      }
    }

    // Update session
    await supabase
      .from("workout_sessions")
      .update({
        duration_minutes: durationMinutes,
        exercises_completed: exerciseLogs.map(e => e.name),
      })
      .eq("id", sessionId);

    toast({
      title: "Workout Complete! 🎉",
      description: `${durationMinutes} min • ${totalVolume.toFixed(0)}kg volume • Avg RPE ${avgRPE.toFixed(1)} • ${newPRs} PRs`,
    });

    onSessionComplete?.();
  };

  const completedSetsCount = exerciseLogs.reduce((sum, e) => sum + e.sets.filter(s => s.completed).length, 0);
  const totalSetsCount = exerciseLogs.reduce((sum, e) => sum + e.sets.length, 0);
  const progressPercentage = totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0;

  const getRPEColor = (rpe: number) => {
    if (rpe <= 6) return "text-green-500";
    if (rpe <= 8) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Day {dayNumber}: {dayWorkout.focus}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completedSetsCount} of {totalSetsCount} sets completed
              </p>
            </div>
            <Badge variant="outline" className="text-lg">
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-gradient-neon h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <Button
            onClick={completeSession}
            disabled={completedSetsCount === 0}
            className="w-full bg-gradient-neon"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Workout
          </Button>
        </CardContent>
      </Card>

      {/* Timer and Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WorkoutTimer />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {exerciseLogs.map((log, exerciseIndex) => (
            <Card key={exerciseIndex} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{log.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustDifficulty(exerciseIndex, false)}
                      title="Make easier"
                    >
                      <TrendingDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustDifficulty(exerciseIndex, true)}
                      title="Make harder"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                    <Dialog open={showAlternatives === exerciseIndex} onOpenChange={(open) => !open && setShowAlternatives(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchAlternatives(exerciseIndex)}
                          title="I can't do this"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alternative Exercises</DialogTitle>
                        </DialogHeader>
                        {loadingAlternatives ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {alternatives.map((alt, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => swapExercise(exerciseIndex, alt)}
                              >
                                {alt}
                              </Button>
                            ))}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Target: {exercises[exerciseIndex]?.sets} × {exercises[exerciseIndex]?.reps} | 
                  RPE {exercises[exerciseIndex]?.target_rpe || "7-8"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {log.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      set.completed ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border"
                    }`}
                  >
                    <Badge variant={set.completed ? "default" : "outline"} className="w-12 justify-center">
                      Set {setIndex + 1}
                    </Badge>

                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                        <Input
                          type="number"
                          value={set.weight || ""}
                          onChange={(e) => updateSetLog(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                          disabled={set.completed}
                          className="h-8 bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Reps</Label>
                        <Input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) => updateSetLog(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          disabled={set.completed}
                          className="h-8 bg-background"
                        />
                      </div>
                      <div>
                        <Label className={`text-xs ${getRPEColor(set.rpe)}`}>RPE: {set.rpe}</Label>
                        <Slider
                          value={[set.rpe]}
                          onValueChange={(value) => updateSetLog(exerciseIndex, setIndex, 'rpe', value[0])}
                          min={5}
                          max={10}
                          step={0.5}
                          disabled={set.completed}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={set.completed ? "secondary" : "default"}
                      onClick={() => markSetComplete(exerciseIndex, setIndex)}
                      disabled={set.completed || set.weight === 0}
                      className={set.completed ? "" : "bg-gradient-neon"}
                    >
                      {set.completed ? <CheckCircle className="w-4 h-4" /> : "Log"}
                    </Button>
                  </div>
                ))}

                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Notes (fatigue, soreness, etc.)</Label>
                  <Textarea
                    placeholder="How did this exercise feel?"
                    value={log.notes}
                    onChange={(e) => {
                      setExerciseLogs(prev => {
                        const updated = [...prev];
                        updated[exerciseIndex].notes = e.target.value;
                        return updated;
                      });
                    }}
                    className="mt-1 bg-muted/30 min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
