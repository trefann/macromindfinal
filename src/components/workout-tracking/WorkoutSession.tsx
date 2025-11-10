import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SetLogger } from "./SetLogger";
import { WorkoutTimer } from "./WorkoutTimer";
import { CheckCircle, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkoutSessionProps {
  dayWorkout: any;
  dayNumber: number;
  onSessionComplete?: () => void;
}

export const WorkoutSession = ({ dayWorkout, dayNumber, onSessionComplete }: WorkoutSessionProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSessionStartTime(new Date());

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

  const handleSetCompleted = (exerciseName: string) => {
    setCompletedExercises(prev => new Set(prev).add(exerciseName));
  };

  const completeSession = async () => {
    if (!sessionId || !sessionStartTime) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const durationMinutes = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000);

    // Get all sets logged in this session
    const { data: setsData } = await supabase
      .from("workout_sets")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_session_id", sessionId);

    // Calculate summary stats
    const totalVolume = setsData?.reduce((sum, set) => sum + (set.weight_kg * set.reps), 0) || 0;
    const avgRPE = setsData?.reduce((sum, set) => sum + (set.rpe || 0), 0) / (setsData?.length || 1);

    // Check for new PRs
    const exerciseMaxes = setsData?.reduce((acc: any, set) => {
      const estimated1RM = set.weight_kg * (1 + set.reps / 30);
      if (!acc[set.exercise_name] || estimated1RM > acc[set.exercise_name]) {
        acc[set.exercise_name] = estimated1RM;
      }
      return acc;
    }, {});

    let newPRs = 0;
    if (exerciseMaxes) {
      for (const [exerciseName, est1RM] of Object.entries(exerciseMaxes)) {
        const { data: existingPR } = await supabase
          .from("personal_records")
          .select("value")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .eq("record_type", "1RM")
          .order("value", { ascending: false })
          .limit(1)
          .single();

        if (!existingPR || (est1RM as number) > existingPR.value) {
          await supabase.from("personal_records").insert({
            user_id: user.id,
            exercise_name: exerciseName,
            record_type: "1RM",
            value: est1RM as number,
          });
          newPRs++;
        }
      }
    }

    // Update session with completion data
    const { error } = await supabase
      .from("workout_sessions")
      .update({
        duration_minutes: durationMinutes,
        exercises_completed: dayWorkout.exercises.map((ex: any) => ex.name),
      })
      .eq("id", sessionId);

    if (!error) {
      toast({
        title: "Workout Complete! 🎉",
        description: `${durationMinutes} minutes • ${totalVolume.toFixed(0)}kg volume • ${newPRs} PRs`,
      });
      onSessionComplete?.();
    }
  };

  const progressPercentage = (completedExercises.size / dayWorkout.exercises.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Day {dayNumber}: {dayWorkout.focus}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completedExercises.size} of {dayWorkout.exercises.length} exercises completed
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
            disabled={completedExercises.size === 0}
            className="w-full bg-gradient-neon"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Workout
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WorkoutTimer />
        </div>
        <div className="lg:col-span-2 space-y-4">
          {dayWorkout.exercises.map((exercise: any, index: number) => (
            <div key={index}>
              <SetLogger
                exerciseName={exercise.name}
                exerciseId={exercise.id || `temp-${index}`}
                sessionId={sessionId}
                onSetCompleted={() => handleSetCompleted(exercise.name)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
