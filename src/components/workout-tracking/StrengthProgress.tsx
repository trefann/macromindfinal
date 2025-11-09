import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, TrendingUp, Award } from "lucide-react";

export const StrengthProgress = () => {
  const [streaks, setStreaks] = useState<any>(null);
  const [strengthData, setStrengthData] = useState<any[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load streaks
    const { data: streakData } = await supabase
      .from("workout_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (streakData) setStreaks(streakData);

    // Load strength progression (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: setsData } = await supabase
      .from("workout_sets")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_at", thirtyDaysAgo.toISOString())
      .order("completed_at", { ascending: true });

    if (setsData) {
      // Group by date and calculate average weight
      const grouped = setsData.reduce((acc: any, set: any) => {
        const date = new Date(set.completed_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, totalWeight: 0, count: 0 };
        }
        acc[date].totalWeight += set.weight_kg * set.reps;
        acc[date].count++;
        return acc;
      }, {});

      const chartData = Object.values(grouped).map((item: any) => ({
        date: item.date,
        volume: Math.round(item.totalWeight),
      }));

      setStrengthData(chartData);
    }

    // Load PRs
    const { data: prs } = await supabase
      .from("personal_records")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5);

    if (prs) setPersonalRecords(prs);
  };

  return (
    <div className="space-y-6">
      {/* Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-primary">{streaks?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <Trophy className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold text-secondary">{streaks?.longest_streak || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <Award className="w-10 h-10 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-3xl font-bold text-accent">{streaks?.total_workouts || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">all time</p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strength Graph */}
      {strengthData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Volume Progression (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
                >
                  <div>
                    <p className="font-semibold">{pr.exercise_name}</p>
                    <p className="text-sm text-muted-foreground">{pr.record_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{pr.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pr.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};