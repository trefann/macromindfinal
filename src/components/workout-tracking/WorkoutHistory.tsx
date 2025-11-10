import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Dumbbell, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const WorkoutHistory = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      // For each session, get the sets
      const sessionsWithSets = await Promise.all(
        data.map(async (session) => {
          const { data: setsData } = await supabase
            .from("workout_sets")
            .select("*")
            .eq("workout_session_id", session.id);

          const totalVolume = setsData?.reduce((sum, set) => sum + (set.weight_kg * set.reps), 0) || 0;
          const totalSets = setsData?.length || 0;

          return { ...session, sets: setsData, totalVolume, totalSets };
        })
      );

      setSessions(sessionsWithSets);
    }
    setLoading(false);
  };

  const groupByWeek = (sessions: any[]) => {
    const weeks: { [key: string]: any[] } = {};
    sessions.forEach(session => {
      const date = new Date(session.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(session);
    });
    return weeks;
  };

  const weeklyData = groupByWeek(sessions);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Workout History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4 mt-4">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No workouts logged yet</p>
            ) : (
              sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{session.notes}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {session.exercises_completed?.length || 0} exercises
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration_minutes || 0}m
                      </p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Volume</p>
                      <p className="text-sm font-semibold flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {session.totalVolume?.toFixed(0)}kg
                      </p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Sets</p>
                      <p className="text-sm font-semibold flex items-center justify-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {session.totalSets}
                      </p>
                    </div>
                  </div>

                  {session.sets && session.sets.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Exercises:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(session.sets.map((s: any) => s.exercise_name))).map((name: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6 mt-4">
            {Object.keys(weeklyData).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No workouts logged yet</p>
            ) : (
              Object.entries(weeklyData).map(([weekStart, weekSessions]) => {
                const totalVolume = weekSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
                const totalWorkouts = weekSessions.length;
                
                return (
                  <div key={weekStart} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Week of {new Date(weekStart).toLocaleDateString()}</h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
                        <p className="text-xs text-muted-foreground">Workouts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">{totalVolume.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Total Volume (kg)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">
                          {Math.round(totalVolume / totalWorkouts)}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Volume</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
