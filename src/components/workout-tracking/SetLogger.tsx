import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Trash2, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SetLoggerProps {
  exerciseName: string;
  exerciseId: string;
  sessionId?: string | null;
  onSetCompleted?: () => void;
}

export const SetLogger = ({ exerciseName, exerciseId, sessionId, onSetCompleted }: SetLoggerProps) => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("7");
  const [sets, setSets] = useState<any[]>([]);
  const [estimated1RM, setEstimated1RM] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPreviousSets();
  }, [exerciseId]);

  useEffect(() => {
    if (weight && reps) {
      const w = parseFloat(weight);
      const r = parseInt(reps);
      if (w > 0 && r > 0) {
        const calc1RM = w * (1 + r / 30);
        setEstimated1RM(Math.round(calc1RM * 10) / 10);
      }
    }
  }, [weight, reps]);

  const loadPreviousSets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("workout_sets")
      .select("*")
      .eq("user_id", user.id)
      .eq("exercise_name", exerciseName)
      .gte("completed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("completed_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setSets(data);
    }
  };

  const logSet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!weight || !reps) {
      toast({
        title: "Missing data",
        description: "Please enter weight and reps",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("workout_sets").insert({
      user_id: user.id,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      weight_kg: parseFloat(weight),
      reps: parseInt(reps),
      rpe: parseFloat(rpe),
      workout_session_id: sessionId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to log set",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Set logged!",
      description: `${weight}kg × ${reps} reps`,
    });

    onSetCompleted?.();
    loadPreviousSets();
    setWeight("");
    setReps("");
  };

  const deleteSet = async (id: string) => {
    const { error } = await supabase.from("workout_sets").delete().eq("id", id);
    if (!error) {
      loadPreviousSets();
      toast({ title: "Set deleted" });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{exerciseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps" className="text-sm">Reps</Label>
            <Input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="10"
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rpe" className="text-sm">RPE</Label>
            <Select value={rpe} onValueChange={setRpe}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {estimated1RM && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Est. 1RM: <span className="font-bold text-primary">{estimated1RM}kg</span>
            </span>
          </div>
        )}

        <Button onClick={logSet} className="w-full" size="lg">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Log Set
        </Button>

        {sets.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-muted-foreground">Recent Sets</p>
            {sets.map((set) => (
              <div
                key={set.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <span className="text-sm">
                  {set.weight_kg}kg × {set.reps} reps
                  <span className="text-muted-foreground ml-2">(RPE {set.rpe})</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSet(set.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};