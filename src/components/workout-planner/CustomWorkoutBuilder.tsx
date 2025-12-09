import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSelector } from "./ExerciseSelector";
import { CustomExerciseCard } from "./CustomExerciseCard";
import { AIWorkoutAssistant } from "./AIWorkoutAssistant";
import { 
  Plus, Save, Sparkles, AlertTriangle, CheckCircle, 
  Dumbbell, RotateCcw, Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CustomExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo?: string;
  notes?: string;
  equipment?: string;
}

export interface CustomWorkout {
  id?: string;
  name: string;
  description?: string;
  dayOfWeek?: number;
  focus: string;
  exercises: CustomExercise[];
  estimatedDuration: number;
}

interface CustomWorkoutBuilderProps {
  onSave: (workout: CustomWorkout) => void;
  existingWorkout?: CustomWorkout | null;
}

const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps", 
  "Quadriceps", "Hamstrings", "Glutes", "Calves", "Core", "Full Body"
];

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export const CustomWorkoutBuilder = ({ onSave, existingWorkout }: CustomWorkoutBuilderProps) => {
  const [workoutName, setWorkoutName] = useState(existingWorkout?.name || "");
  const [workoutDescription, setWorkoutDescription] = useState(existingWorkout?.description || "");
  const [workoutFocus, setWorkoutFocus] = useState(existingWorkout?.focus || "");
  const [selectedDay, setSelectedDay] = useState<number | undefined>(existingWorkout?.dayOfWeek);
  const [exercises, setExercises] = useState<CustomExercise[]>(existingWorkout?.exercises || []);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [volumeWarning, setVolumeWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Check volume balance whenever exercises change
  useEffect(() => {
    checkVolumeBalance();
  }, [exercises]);

  const checkVolumeBalance = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const muscleGroupSets: Record<string, number> = {};
    
    exercises.forEach(ex => {
      muscleGroupSets[ex.muscleGroup] = (muscleGroupSets[ex.muscleGroup] || 0) + ex.sets;
    });

    if (totalSets < 6 && exercises.length > 0) {
      setVolumeWarning("Training volume may be too low. Consider adding more sets.");
    } else if (totalSets > 30) {
      setVolumeWarning("Training volume is very high. This may lead to overtraining.");
    } else {
      setVolumeWarning(null);
    }
  };

  const addExercise = (exercise: { name: string; muscleGroup: string; equipment?: string }) => {
    const newExercise: CustomExercise = {
      id: crypto.randomUUID(),
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: 3,
      reps: "8-12",
      restSeconds: 90,
      equipment: exercise.equipment,
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseSelector(false);
    
    toast({
      title: "Exercise Added",
      description: `${exercise.name} added to workout`,
    });
  };

  const updateExercise = (id: string, updates: Partial<CustomExercise>) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const reorderExercises = (fromIndex: number, toIndex: number) => {
    const newExercises = [...exercises];
    const [removed] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, removed);
    setExercises(newExercises);
  };

  const applyAISuggestions = (suggestions: Partial<CustomExercise>[]) => {
    const updatedExercises = exercises.map((ex, index) => {
      const suggestion = suggestions[index];
      if (suggestion) {
        return { ...ex, ...suggestion };
      }
      return ex;
    });
    setExercises(updatedExercises);
    
    toast({
      title: "AI Suggestions Applied",
      description: "Optimal sets, reps, and rest times have been applied.",
    });
  };

  const addAISuggestedExercises = (suggestedExercises: CustomExercise[]) => {
    setExercises([...exercises, ...suggestedExercises]);
  };

  const calculateEstimatedDuration = () => {
    let totalMinutes = 5; // Warm-up
    exercises.forEach(ex => {
      const avgReps = parseInt(ex.reps.split("-")[0]) || 10;
      const setTime = (avgReps * 3 + ex.restSeconds) / 60; // Time per set in minutes
      totalMinutes += setTime * ex.sets;
    });
    return Math.round(totalMinutes);
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workout name",
        variant: "destructive",
      });
      return;
    }

    if (exercises.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one exercise",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const workout: CustomWorkout = {
      id: existingWorkout?.id || crypto.randomUUID(),
      name: workoutName,
      description: workoutDescription,
      focus: workoutFocus || exercises[0]?.muscleGroup || "Custom",
      dayOfWeek: selectedDay,
      exercises,
      estimatedDuration: calculateEstimatedDuration(),
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert to workout_plans format
      const planData = {
        user_id: user.id,
        name: workout.name,
        description: workout.description,
        duration_minutes: workout.estimatedDuration,
        exercises: {
          weekly_schedule: [{
            day: selectedDay !== undefined ? selectedDay + 1 : 1,
            focus: workout.focus,
            exercises: workout.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: `${ex.restSeconds}s`,
              tempo: ex.tempo,
              notes: ex.notes,
              muscle_group: ex.muscleGroup,
            }))
          }],
          is_custom: true,
        }
      };

      const { error } = await supabase.from("workout_plans").insert([planData]);

      if (error) throw error;

      toast({
        title: "Workout Saved!",
        description: "Your custom workout has been saved successfully.",
      });

      onSave(workout);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workout",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const muscleGroups = [...new Set(exercises.map(ex => ex.muscleGroup))];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Create Custom Workout
              </CardTitle>
              <CardDescription>
                Build your own workout with AI assistance
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAIAssistant(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workoutName">Workout Name</Label>
              <Input
                id="workoutName"
                placeholder="e.g., Push Day, Upper Body"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workoutFocus">Primary Focus</Label>
              <Select value={workoutFocus} onValueChange={setWorkoutFocus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select muscle group focus" />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Schedule Day (Optional)</Label>
              <Select 
                value={selectedDay?.toString()} 
                onValueChange={(v) => setSelectedDay(v ? parseInt(v) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {day}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of your workout"
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="gap-1">
              <Dumbbell className="w-3 h-3" />
              {exercises.length} exercises
            </Badge>
            <Badge variant="outline">{totalSets} total sets</Badge>
            <Badge variant="outline">~{calculateEstimatedDuration()} min</Badge>
            {muscleGroups.map(mg => (
              <Badge key={mg} variant="secondary">{mg}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Warning */}
      {volumeWarning && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm">{volumeWarning}</span>
          </CardContent>
        </Card>
      )}

      {/* Exercises List */}
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <CustomExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            totalExercises={exercises.length}
            onUpdate={(updates) => updateExercise(exercise.id, updates)}
            onRemove={() => removeExercise(exercise.id)}
            onMoveUp={() => index > 0 && reorderExercises(index, index - 1)}
            onMoveDown={() => index < exercises.length - 1 && reorderExercises(index, index + 1)}
          />
        ))}

        {exercises.length === 0 && (
          <Card className="glass-card border-dashed">
            <CardContent className="py-12 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exercises yet</h3>
              <p className="text-muted-foreground mb-4">
                Add exercises to build your custom workout
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Exercise Button */}
        <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2 py-6 border-dashed">
              <Plus className="w-5 h-5" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Exercise</DialogTitle>
              <DialogDescription>
                Search and select an exercise to add to your workout
              </DialogDescription>
            </DialogHeader>
            <ExerciseSelector onSelect={addExercise} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || exercises.length === 0}
          className="flex-1 bg-gradient-neon gap-2"
          size="lg"
        >
          {saving ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Workout
        </Button>
      </div>

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Workout Assistant
            </DialogTitle>
            <DialogDescription>
              Get AI suggestions for your workout based on your goals
            </DialogDescription>
          </DialogHeader>
          <AIWorkoutAssistant
            currentExercises={exercises}
            workoutFocus={workoutFocus}
            onApplySuggestions={applyAISuggestions}
            onAddExercises={addAISuggestedExercises}
            onClose={() => setShowAIAssistant(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
