import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QuickMacroEntry } from "@/components/meal-tracking/QuickMacroEntry";
import { FoodSearch } from "@/components/meal-tracking/FoodSearch";
import { CustomFoodForm } from "@/components/meal-tracking/CustomFoodForm";
import { MacroCircle } from "@/components/meal-tracking/MacroCircle";
import { MealTimeline } from "@/components/meal-tracking/MealTimeline";
import { Plus } from "lucide-react";

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const MealTracking = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [goals, setGoals] = useState<DailyTotals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  });
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDailyTotals();
    fetchGoals();
  }, [refreshKey]);

  const fetchDailyTotals = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('meal_logs')
      .select('calories, protein, carbs, fats')
      .eq('date', today);

    if (error) {
      console.error('Error fetching daily totals:', error);
      return;
    }

    if (data && data.length > 0) {
      const totals = data.reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (Number(meal.protein) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fats: acc.fats + (Number(meal.fats) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      setDailyTotals(totals);
    } else {
      setDailyTotals({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    }
  };

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('fitness_goal')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.fitness_goal) {
      // Set goals based on fitness goal (simplified calculation)
      if (data.fitness_goal === 'weight_loss') {
        setGoals({ calories: 1800, protein: 140, carbs: 150, fats: 60 });
      } else if (data.fitness_goal === 'muscle_gain') {
        setGoals({ calories: 2500, protein: 180, carbs: 280, fats: 70 });
      }
    }
  };

  const handleMealAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddMeal(false);
    toast({
      title: "Meal logged!",
      description: "Your meal has been added to today's log.",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-foreground">Meal Tracking</h1>
            <Button 
              onClick={() => setShowAddMeal(!showAddMeal)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </Button>
          </div>

          <MacroCircle current={dailyTotals} goals={goals} />

          {showAddMeal && (
            <Card className="p-6 border-primary/20">
              <Tabs defaultValue="quick" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="quick">Quick Entry</TabsTrigger>
                  <TabsTrigger value="search">Food Database</TabsTrigger>
                  <TabsTrigger value="custom">Create Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quick" className="mt-4">
                  <QuickMacroEntry onMealAdded={handleMealAdded} />
                </TabsContent>
                
                <TabsContent value="search" className="mt-4">
                  <FoodSearch onMealAdded={handleMealAdded} />
                </TabsContent>
                
                <TabsContent value="custom" className="mt-4">
                  <CustomFoodForm onFoodCreated={() => {
                    toast({
                      title: "Custom food created!",
                      description: "You can now add it from the Food Database tab.",
                    });
                  }} />
                </TabsContent>
              </Tabs>
            </Card>
          )}

          <MealTimeline key={refreshKey} />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MealTracking;
