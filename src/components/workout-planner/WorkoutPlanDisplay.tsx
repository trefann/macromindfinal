import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dumbbell, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  GripVertical, 
  Edit2,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  muscle_group: string;
  instructions?: string;
}

export interface DayWorkout {
  day: number;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  name: string;
  description: string;
  duration_minutes: number;
  weekly_schedule: DayWorkout[];
  progression?: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  };
}

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  onSave: () => void;
  onRegenerate: () => void;
  onCreateNew: () => void;
  onUpdatePlan: (plan: WorkoutPlan) => void;
  saving: boolean;
}

export const WorkoutPlanDisplay = ({ 
  plan, 
  onSave, 
  onRegenerate, 
  onCreateNew, 
  onUpdatePlan,
  saving 
}: WorkoutPlanDisplayProps) => {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [addingExercise, setAddingExercise] = useState<number | null>(null);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    name: "",
    sets: 3,
    reps: "10",
    rest_seconds: 90,
    muscle_group: "",
  });

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleSwapExercise = (dayIndex: number, exerciseIndex: number, newName: string) => {
    const updatedPlan = { ...plan };
    updatedPlan.weekly_schedule[dayIndex].exercises[exerciseIndex].name = newName;
    onUpdatePlan(updatedPlan);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedPlan = { ...plan };
    updatedPlan.weekly_schedule[dayIndex].exercises.splice(exerciseIndex, 1);
    onUpdatePlan(updatedPlan);
  };

  const handleAddExercise = (dayIndex: number) => {
    if (!newExercise.name || !newExercise.muscle_group) return;
    
    const updatedPlan = { ...plan };
    updatedPlan.weekly_schedule[dayIndex].exercises.push({
      name: newExercise.name,
      sets: newExercise.sets || 3,
      reps: newExercise.reps || "10",
      rest_seconds: newExercise.rest_seconds || 90,
      muscle_group: newExercise.muscle_group,
    });
    onUpdatePlan(updatedPlan);
    setAddingExercise(null);
    setNewExercise({ name: "", sets: 3, reps: "10", rest_seconds: 90, muscle_group: "" });
  };

  const handleReorderDays = (fromIndex: number, toIndex: number) => {
    const updatedPlan = { ...plan };
    const [movedDay] = updatedPlan.weekly_schedule.splice(fromIndex, 1);
    updatedPlan.weekly_schedule.splice(toIndex, 0, movedDay);
    // Update day numbers
    updatedPlan.weekly_schedule.forEach((day, i) => {
      day.day = i + 1;
    });
    onUpdatePlan(updatedPlan);
  };

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{plan.duration_minutes}</p>
                <p className="text-xs text-muted-foreground">min/session</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{plan.weekly_schedule.length}</p>
                <p className="text-xs text-muted-foreground">days/week</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progression Info */}
      {plan.progression && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Weekly Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(plan.progression).map(([week, focus]) => (
                <div key={week} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase">{week}</p>
                  <p className="text-sm font-medium">{focus}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Workouts */}
      <div className="space-y-4">
        {plan.weekly_schedule.map((day, dayIndex) => (
          <Collapsible
            key={dayIndex}
            open={expandedDays.has(day.day)}
            onOpenChange={() => toggleDay(day.day)}
          >
            <Card className="glass-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center text-white font-bold">
                          {day.day}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{day.focus}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {day.exercises.length} exercises
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Day {day.day}</Badge>
                      {expandedDays.has(day.day) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {day.exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border hover:border-primary/30 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{exercise.name}</h4>
                              <p className="text-xs text-muted-foreground">{exercise.muscle_group}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Swap Exercise</DialogTitle>
                                    <DialogDescription>
                                      Enter a new exercise to replace {exercise.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                      <Label>New Exercise Name</Label>
                                      <Input
                                        id={`swap-${dayIndex}-${exIndex}`}
                                        defaultValue={exercise.name}
                                        placeholder="Exercise name"
                                      />
                                    </div>
                                    <Button
                                      onClick={() => {
                                        const input = document.getElementById(`swap-${dayIndex}-${exIndex}`) as HTMLInputElement;
                                        handleSwapExercise(dayIndex, exIndex, input.value);
                                      }}
                                      className="w-full"
                                    >
                                      Swap Exercise
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteExercise(dayIndex, exIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {exercise.instructions && (
                            <p className="text-xs text-foreground/70 mt-1 italic">{exercise.instructions}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {exercise.sets} sets
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {exercise.reps} reps
                            </Badge>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exercise.rest_seconds}s rest
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Exercise Button */}
                    <Dialog open={addingExercise === dayIndex} onOpenChange={(open) => setAddingExercise(open ? dayIndex : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Exercise
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Custom Exercise</DialogTitle>
                          <DialogDescription>
                            Add a new exercise to {day.focus}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Exercise Name *</Label>
                            <Input
                              value={newExercise.name}
                              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                              placeholder="E.g., Barbell Rows"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Muscle Group *</Label>
                            <Input
                              value={newExercise.muscle_group}
                              onChange={(e) => setNewExercise({ ...newExercise, muscle_group: e.target.value })}
                              placeholder="E.g., Back"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Sets</Label>
                              <Input
                                type="number"
                                value={newExercise.sets}
                                onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Reps</Label>
                              <Input
                                value={newExercise.reps}
                                onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Rest (s)</Label>
                              <Input
                                type="number"
                                value={newExercise.rest_seconds}
                                onChange={(e) => setNewExercise({ ...newExercise, rest_seconds: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => handleAddExercise(dayIndex)}
                            disabled={!newExercise.name || !newExercise.muscle_group}
                            className="w-full"
                          >
                            Add Exercise
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Action Buttons */}
      <Card className="glass-card border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onSave}
              disabled={saving}
              size="lg"
              className="bg-gradient-neon hover:opacity-90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Plan
                </>
              )}
            </Button>
            <Button
              onClick={onRegenerate}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-Generate
            </Button>
            <Button
              onClick={onCreateNew}
              variant="ghost"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
