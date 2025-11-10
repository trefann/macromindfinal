import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MealPlanHistory = () => {
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setMealLogs(data);
    }
    setLoading(false);
  };

  const groupByDate = (logs: any[]) => {
    const dates: { [key: string]: any[] } = {};
    logs.forEach(log => {
      const dateKey = log.date;
      if (!dates[dateKey]) dates[dateKey] = [];
      dates[dateKey].push(log);
    });
    return dates;
  };

  const dailyData = groupByDate(mealLogs);

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
          Meal History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Meals</TabsTrigger>
            <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4 mt-4">
            {mealLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meals logged yet</p>
            ) : (
              mealLogs.slice(0, 15).map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {log.meal_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(log.logged_at).toLocaleDateString()} at{' '}
                        {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-foreground/80 mb-2 italic">{log.notes}</p>
                  )}

                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="text-sm font-semibold">{log.calories}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-sm font-semibold">{log.protein}g</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-sm font-semibold">{log.carbs}g</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">Fats</p>
                      <p className="text-sm font-semibold">{log.fats}g</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="daily" className="space-y-4 mt-4">
            {Object.keys(dailyData).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meals logged yet</p>
            ) : (
              Object.entries(dailyData).slice(0, 14).map(([date, dayLogs]) => {
                const totalCalories = dayLogs.reduce((sum, log) => sum + log.calories, 0);
                const totalProtein = dayLogs.reduce((sum, log) => sum + log.protein, 0);
                const totalCarbs = dayLogs.reduce((sum, log) => sum + log.carbs, 0);
                const totalFats = dayLogs.reduce((sum, log) => sum + log.fats, 0);
                const mealCount = dayLogs.length;

                return (
                  <div key={date} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{new Date(date).toLocaleDateString()}</h4>
                      <Badge variant="outline">{mealCount} meals</Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
                        <p className="text-xl font-bold text-primary">{totalCalories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg">
                        <p className="text-xl font-bold text-secondary">{totalProtein.toFixed(1)}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg">
                        <p className="text-xl font-bold text-accent">{totalCarbs.toFixed(1)}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
                        <p className="text-xl font-bold text-primary">{totalFats.toFixed(1)}g</p>
                        <p className="text-xs text-muted-foreground">Fats</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Meals:</p>
                      <div className="flex flex-wrap gap-1">
                        {dayLogs.map((log: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {log.meal_type}
                          </Badge>
                        ))}
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
