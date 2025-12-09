import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomExercise } from "./CustomWorkoutBuilder";
import { 
  Sparkles, Loader2, CheckCircle, AlertTriangle, 
  Dumbbell, TrendingUp, Scale, Zap
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AIWorkoutAssistantProps {
  currentExercises: CustomExercise[];
  workoutFocus: string;
  onApplySuggestions: (suggestions: Partial<CustomExercise>[]) => void;
  onAddExercises: (exercises: CustomExercise[]) => void;
  onClose: () => void;
}

type AssistMode = "optimize" | "suggest" | "balance" | "progression";

export const AIWorkoutAssistant = ({
  currentExercises,
  workoutFocus,
  onApplySuggestions,
  onAddExercises,
  onClose,
}: AIWorkoutAssistantProps) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AssistMode>("optimize");
  const [goal, setGoal] = useState("hypertrophy");
  const [suggestions, setSuggestions] = useState<any>(null);
  const { toast } = useToast();

  const getModeInfo = (m: AssistMode) => {
    switch (m) {
      case "optimize":
        return {
          icon: TrendingUp,
          title: "Optimize Sets & Reps",
          description: "AI will suggest optimal sets, reps, and rest times based on your goal",
        };
      case "suggest":
        return {
          icon: Dumbbell,
          title: "Suggest Exercises",
          description: "Get exercise recommendations to complete your workout",
        };
      case "balance":
        return {
          icon: Scale,
          title: "Check Balance",
          description: "Analyze muscle group balance and identify gaps",
        };
      case "progression":
        return {
          icon: Zap,
          title: "Auto Progression",
          description: "Set up automatic progression rules for this workout",
        };
    }
  };

  const getAISuggestions = async () => {
    setLoading(true);
    setSuggestions(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user profile for personalization
      const { data: profile } = await supabase
        .from("profiles")
        .select("fitness_goal, experience_level, available_equipment")
        .eq("id", user.id)
        .single();

      const requestBody = {
        mode,
        goal,
        workoutFocus,
        currentExercises: currentExercises.map(ex => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.restSeconds,
        })),
        userProfile: profile || {},
      };

      const { data, error } = await supabase.functions.invoke("ai-workout-assist", {
        body: requestBody,
      });

      if (error) throw error;

      setSuggestions(data);
    } catch (error: any) {
      console.error("AI assist error:", error);
      toast({
        title: "AI Assistant Error",
        description: error.message || "Failed to get AI suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyOptimizations = () => {
    if (!suggestions?.optimizations) return;
    
    const updates = suggestions.optimizations.map((opt: any) => ({
      sets: opt.sets,
      reps: opt.reps,
      restSeconds: opt.rest,
    }));
    
    onApplySuggestions(updates);
    onClose();
  };

  const addSuggestedExercises = () => {
    if (!suggestions?.suggestedExercises) return;

    const newExercises: CustomExercise[] = suggestions.suggestedExercises.map((ex: any) => ({
      id: crypto.randomUUID(),
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets || 3,
      reps: ex.reps || "8-12",
      restSeconds: ex.rest || 90,
      equipment: ex.equipment,
    }));

    onAddExercises(newExercises);
    onClose();
  };

  const modeInfo = getModeInfo(mode);
  const ModeIcon = modeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-2">
        {(["optimize", "suggest", "balance", "progression"] as AssistMode[]).map((m) => {
          const info = getModeInfo(m);
          const Icon = info.icon;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-3 rounded-lg border text-left transition-all ${
                mode === m
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${mode === m ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-sm font-medium">{info.title}</div>
            </button>
          );
        })}
      </div>

      {/* Goal Selection for relevant modes */}
      {(mode === "optimize" || mode === "progression") && (
        <div className="space-y-2">
          <Label>Training Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength (1-5 reps, heavy weight)</SelectItem>
              <SelectItem value="hypertrophy">Hypertrophy (8-12 reps, moderate weight)</SelectItem>
              <SelectItem value="endurance">Endurance (15+ reps, lighter weight)</SelectItem>
              <SelectItem value="fat_loss">Fat Loss (high density, shorter rest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Current Status */}
      <Card className="bg-muted/50">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 mb-2">
            <ModeIcon className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">{modeInfo.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{modeInfo.description}</p>
          {currentExercises.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline">{currentExercises.length} exercises</Badge>
              <Badge variant="outline">
                {currentExercises.reduce((sum, ex) => sum + ex.sets, 0)} sets
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Get Suggestions Button */}
      <Button
        onClick={getAISuggestions}
        disabled={loading || (mode !== "suggest" && currentExercises.length === 0)}
        className="w-full gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? "Analyzing..." : "Get AI Suggestions"}
      </Button>

      {/* Suggestions Results */}
      {suggestions && (
        <div className="space-y-4">
          {/* Optimization Suggestions */}
          {mode === "optimize" && suggestions.optimizations && (
            <Card>
              <CardContent className="py-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Optimization Suggestions
                </h4>
                <div className="space-y-2">
                  {suggestions.optimizations.map((opt: any, i: number) => (
                    <div key={i} className="text-sm flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>{currentExercises[i]?.name}</span>
                      <span className="text-muted-foreground">
                        {opt.sets} × {opt.reps} • {opt.rest}s rest
                      </span>
                    </div>
                  ))}
                </div>
                <Button onClick={applyOptimizations} className="w-full gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Apply Optimizations
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Suggested Exercises */}
          {mode === "suggest" && suggestions.suggestedExercises && (
            <Card>
              <CardContent className="py-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  Suggested Exercises
                </h4>
                <div className="space-y-2">
                  {suggestions.suggestedExercises.map((ex: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{ex.name}</span>
                        <Badge variant="outline">{ex.muscleGroup}</Badge>
                      </div>
                      {ex.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{ex.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={addSuggestedExercises} className="w-full gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Add Suggested Exercises
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Balance Analysis */}
          {mode === "balance" && suggestions.analysis && (
            <Card>
              <CardContent className="py-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Muscle Balance Analysis
                </h4>
                {suggestions.analysis.warnings?.length > 0 && (
                  <div className="space-y-2">
                    {suggestions.analysis.warnings.map((warn: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-warning">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        {warn}
                      </div>
                    ))}
                  </div>
                )}
                {suggestions.analysis.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    {suggestions.analysis.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-primary">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progression Rules */}
          {mode === "progression" && suggestions.progressionRules && (
            <Card>
              <CardContent className="py-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Auto Progression Rules
                </h4>
                <p className="text-sm text-muted-foreground">
                  {suggestions.progressionRules.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <strong>Weekly Update:</strong> {suggestions.progressionRules.weeklyUpdate}
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <strong>Deload Trigger:</strong> {suggestions.progressionRules.deloadTrigger}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
