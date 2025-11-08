import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface Food {
  id: string;
  name: string;
  brand: string | null;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  is_custom?: boolean;
}

interface FoodSearchProps {
  onMealAdded: () => void;
}

export const FoodSearch = ({ onMealAdded }: FoodSearchProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState("1");
  const [mealType, setMealType] = useState("breakfast");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchFoods();
    } else {
      setFoods([]);
    }
  }, [searchTerm]);

  const searchFoods = async () => {
    const { data: globalFoods } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .limit(10);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: customFoods } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', user?.id)
      .ilike('name', `%${searchTerm}%`)
      .limit(5);

    const allFoods = [
      ...(globalFoods || []),
      ...(customFoods || []).map(f => ({ ...f, is_custom: true })),
    ];

    setFoods(allFoods);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const servingsNum = parseFloat(servings) || 1;
      
      const { error } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        food_id: selectedFood.is_custom ? null : selectedFood.id,
        custom_food_id: selectedFood.is_custom ? selectedFood.id : null,
        meal_type: mealType,
        servings: servingsNum,
        calories: Math.round(selectedFood.calories * servingsNum),
        protein: Number(selectedFood.protein) * servingsNum,
        carbs: Number(selectedFood.carbs) * servingsNum,
        fats: Number(selectedFood.fats) * servingsNum,
      });

      if (error) throw error;

      setSelectedFood(null);
      setServings("1");
      setSearchTerm("");
      onMealAdded();
    } catch (error) {
      console.error('Error adding food:', error);
      toast({
        title: "Error",
        description: "Failed to add food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Search Foods</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for food..."
            className="pl-10"
          />
        </div>
      </div>

      {foods.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {foods.map((food) => (
            <Card
              key={food.id}
              className={`p-3 cursor-pointer transition-colors ${
                selectedFood?.id === food.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedFood(food)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{food.name}</p>
                  {food.brand && <p className="text-sm text-muted-foreground">{food.brand}</p>}
                  <p className="text-xs text-muted-foreground">{food.serving_size}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{food.calories} cal</p>
                  <p className="text-muted-foreground">
                    P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedFood && (
        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Servings</Label>
              <Input
                type="number"
                step="0.1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="0.1"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Total:</p>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Calories</p>
                <p className="font-semibold">{Math.round(selectedFood.calories * parseFloat(servings || "1"))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Protein</p>
                <p className="font-semibold">{(Number(selectedFood.protein) * parseFloat(servings || "1")).toFixed(1)}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Carbs</p>
                <p className="font-semibold">{(Number(selectedFood.carbs) * parseFloat(servings || "1")).toFixed(1)}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fats</p>
                <p className="font-semibold">{(Number(selectedFood.fats) * parseFloat(servings || "1")).toFixed(1)}g</p>
              </div>
            </div>
          </div>

          <Button onClick={handleAddFood} className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add to Log"}
          </Button>
        </div>
      )}
    </div>
  );
};
