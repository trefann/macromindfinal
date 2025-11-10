import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap } from "lucide-react";

interface ProgressionInsight {
  type: 'increase' | 'deload' | 'plateau' | 'weakness' | 'strength';
  exercise: string;
  message: string;
  recommendation: string;
}

export const AdaptiveProgressionEngine = () => {
  const [insights, setInsights] = useState<ProgressionInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeProgress();
  }, []);

  const analyzeProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get workout data from last 4 weeks
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const { data: setsData } = await supabase
      .from("workout_sets")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_at", fourWeeksAgo.toISOString())
      .order("completed_at", { ascending: true });

    if (!setsData || setsData.length === 0) {
      setLoading(false);
      return;
    }

    const analysisResults: ProgressionInsight[] = [];

    // Group by exercise
    const exerciseGroups = setsData.reduce((acc: any, set: any) => {
      if (!acc[set.exercise_name]) {
        acc[set.exercise_name] = [];
      }
      acc[set.exercise_name].push(set);
      return acc;
    }, {});

    // Analyze each exercise
    Object.entries(exerciseGroups).forEach(([exerciseName, sets]: [string, any]) => {
      if (sets.length < 6) return; // Need at least 6 sets for meaningful analysis

      // Calculate average weight over time
      const recentSets = sets.slice(-6);
      const olderSets = sets.slice(0, Math.min(6, sets.length - 6));

      const recentAvg = recentSets.reduce((sum: number, s: any) => sum + s.weight_kg, 0) / recentSets.length;
      const olderAvg = olderSets.length > 0 
        ? olderSets.reduce((sum: number, s: any) => sum + s.weight_kg, 0) / olderSets.length 
        : recentAvg;

      const progressionRate = ((recentAvg - olderAvg) / olderAvg) * 100;

      // Detect plateaus (less than 2% change)
      if (Math.abs(progressionRate) < 2 && sets.length >= 12) {
        analysisResults.push({
          type: 'plateau',
          exercise: exerciseName,
          message: `No significant progress in the last 2 weeks`,
          recommendation: 'Consider changing rep range, tempo, or adding a deload week'
        });
      }

      // Recommend weight increase (5%+ progress and consistent RPE)
      else if (progressionRate >= 5) {
        const avgRPE = recentSets.reduce((sum: number, s: any) => sum + (s.rpe || 7), 0) / recentSets.length;
        if (avgRPE < 8.5) {
          analysisResults.push({
            type: 'increase',
            exercise: exerciseName,
            message: `Strong progress detected (+${progressionRate.toFixed(1)}%)`,
            recommendation: `Increase weight by 2.5-5kg next session`
          });
        }
      }

      // Detect need for deload (high RPE, declining volume)
      const avgRPE = recentSets.reduce((sum: number, s: any) => sum + (s.rpe || 7), 0) / recentSets.length;
      if (avgRPE > 9 && progressionRate < -5) {
        analysisResults.push({
          type: 'deload',
          exercise: exerciseName,
          message: `High fatigue and declining performance`,
          recommendation: 'Reduce weight by 10-15% for recovery week'
        });
      }
    });

    // Analyze muscle group balance
    const muscleGroupVolume: any = {};
    setsData.forEach((set: any) => {
      const muscle = set.exercise_name.toLowerCase().includes('bench') || set.exercise_name.toLowerCase().includes('push') ? 'Chest' :
                     set.exercise_name.toLowerCase().includes('squat') || set.exercise_name.toLowerCase().includes('leg') ? 'Legs' :
                     set.exercise_name.toLowerCase().includes('pull') || set.exercise_name.toLowerCase().includes('row') ? 'Back' :
                     set.exercise_name.toLowerCase().includes('shoulder') || set.exercise_name.toLowerCase().includes('press') ? 'Shoulders' :
                     'Other';
      
      if (!muscleGroupVolume[muscle]) muscleGroupVolume[muscle] = 0;
      muscleGroupVolume[muscle] += set.weight_kg * set.reps;
    });

    // Find weak muscle groups (< 70% of highest volume group)
    const maxVolume = Math.max(...Object.values(muscleGroupVolume) as number[]);
    Object.entries(muscleGroupVolume).forEach(([muscle, volume]: [string, any]) => {
      if (volume < maxVolume * 0.7 && muscle !== 'Other') {
        analysisResults.push({
          type: 'weakness',
          exercise: muscle,
          message: `Lower training volume compared to other muscle groups`,
          recommendation: `Add 1-2 more exercises targeting ${muscle.toLowerCase()}`
        });
      }
    });

    setInsights(analysisResults);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'increase': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'deload': return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'plateau': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'weakness': return <Target className="w-5 h-5 text-blue-500" />;
      case 'strength': return <Zap className="w-5 h-5 text-primary" />;
      default: return null;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'increase': return 'default';
      case 'deload': return 'secondary';
      case 'plateau': return 'outline';
      case 'weakness': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Analyzing your performance...</p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Adaptive Progression Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Complete at least 2 weeks of workouts to receive personalized progression insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Adaptive Progression Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground">{insight.exercise}</p>
                    <Badge variant={getBadgeVariant(insight.type) as any} className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.message}</p>
                  <p className="text-sm text-foreground/90 font-medium">
                    💡 {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
