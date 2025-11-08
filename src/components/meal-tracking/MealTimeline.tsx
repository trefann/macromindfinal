import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MealLog {
  id: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings: number;
  logged_at: string;
  notes: string | null;
}

export const MealTimeline = () => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('date', today)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching meals:', error);
      toast({
        title: "Error",
        description: "Failed to load meal history.",
        variant: "destructive",
      });
    } else {
      setMeals(data || []);
    }

    setLoading(false);
  };

  const deleteMeal = async (id: string) => {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete meal.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your log.",
      });
      fetchMeals();
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'text-yellow-500';
      case 'lunch': return 'text-blue-500';
      case 'dinner': return 'text-purple-500';
      case 'snack': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading meals...</div>;
  }

  if (meals.length === 0) {
    return (
      <Card className="p-8 text-center border-primary/20">
        <p className="text-muted-foreground">No meals logged today. Add your first meal above!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Today's Meals</h2>
      
      {meals.map((meal) => {
        return (
          <Card key={meal.id} className="p-4 border-primary/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-semibold capitalize ${getMealTypeColor(meal.meal_type)}`}>
                    {meal.meal_type}
                  </span>
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(meal.logged_at), 'h:mm a')}
                  </span>
                </div>
                
                <p className="font-medium text-lg mb-2">Meal Entry</p>
                
                {meal.servings !== 1 && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {meal.servings} serving{meal.servings > 1 ? 's' : ''}
                  </p>
                )}
                
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Calories</p>
                    <p className="font-semibold">{meal.calories}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Protein</p>
                    <p className="font-semibold">{Number(meal.protein).toFixed(1)}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carbs</p>
                    <p className="font-semibold">{Number(meal.carbs).toFixed(1)}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fats</p>
                    <p className="font-semibold">{Number(meal.fats).toFixed(1)}g</p>
                  </div>
                </div>

                {meal.notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">{meal.notes}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMeal(meal.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
