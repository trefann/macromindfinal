import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Food {
  id: string;
  name: string;
  brand: string | null;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealLog {
  id: string;
  meal_type: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged_at: string;
  food_name?: string;
}

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const MealTracking = () => {
  const { toast } = useToast();
  const [foods, setFoods] = useState<Food[]>([]);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCustomFoodDialogOpen, setIsCustomFoodDialogOpen] = useState(false);
  const [macroTotals, setMacroTotals] = useState<MacroTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  // Custom food form
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    brand: "",
    serving_size: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: "",
  });

  useEffect(() => {
    fetchFoods();
    fetchCustomFoods();
    fetchTodaysMealLogs();
  }, []);

  useEffect(() => {
    calculateMacroTotals();
  }, [mealLogs]);

  const fetchFoods = async () => {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Error fetching foods", variant: "destructive" });
    } else {
      setFoods(data || []);
    }
  };

  const fetchCustomFoods = async () => {
    const { data, error } = await supabase
      .from("custom_foods")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Error fetching custom foods", variant: "destructive" });
    } else {
      setCustomFoods(data || []);
    }
  };

  const fetchTodaysMealLogs = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("logged_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching meal logs", variant: "destructive" });
    } else {
      setMealLogs(data || []);
    }
  };

  const calculateMacroTotals = () => {
    const totals = mealLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + Number(log.protein),
        carbs: acc.carbs + Number(log.carbs),
        fats: acc.fats + Number(log.fats),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    setMacroTotals(totals);
  };

  const logMeal = async () => {
    if (!selectedFood) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      food_id: selectedFood.id,
      meal_type: mealType,
      servings,
      calories: Math.round(selectedFood.calories * servings),
      protein: Number((selectedFood.protein * servings).toFixed(1)),
      carbs: Number((selectedFood.carbs * servings).toFixed(1)),
      fats: Number((selectedFood.fats * servings).toFixed(1)),
    });

    if (error) {
      toast({ title: "Error logging meal", variant: "destructive" });
    } else {
      toast({ title: "Meal logged successfully!" });
      setIsAddDialogOpen(false);
      setSelectedFood(null);
      setServings(1);
      fetchTodaysMealLogs();
    }
  };

  const createCustomFood = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("custom_foods").insert({
      user_id: user.id,
      ...customFoodForm,
    });

    if (error) {
      toast({ title: "Error creating custom food", variant: "destructive" });
    } else {
      toast({ title: "Custom food created!" });
      setIsCustomFoodDialogOpen(false);
      setCustomFoodForm({
        name: "",
        brand: "",
        serving_size: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        ingredients: "",
      });
      fetchCustomFoods();
    }
  };

  const deleteMealLog = async (id: string) => {
    const { error } = await supabase.from("meal_logs").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting meal log", variant: "destructive" });
    } else {
      toast({ title: "Meal log deleted" });
      fetchTodaysMealLogs();
    }
  };

  const filteredFoods = [...foods, ...customFoods].filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMacroPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Meal Tracking</h1>
            <div className="flex gap-2">
              <Dialog open={isCustomFoodDialogOpen} onOpenChange={setIsCustomFoodDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Custom Food
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Custom Food</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={customFoodForm.name}
                        onChange={(e) =>
                          setCustomFoodForm({ ...customFoodForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Brand (optional)</Label>
                      <Input
                        value={customFoodForm.brand}
                        onChange={(e) =>
                          setCustomFoodForm({ ...customFoodForm, brand: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Serving Size</Label>
                      <Input
                        value={customFoodForm.serving_size}
                        onChange={(e) =>
                          setCustomFoodForm({ ...customFoodForm, serving_size: e.target.value })
                        }
                        placeholder="e.g., 100g, 1 cup"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Calories</Label>
                        <Input
                          type="number"
                          value={customFoodForm.calories}
                          onChange={(e) =>
                            setCustomFoodForm({
                              ...customFoodForm,
                              calories: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Protein (g)</Label>
                        <Input
                          type="number"
                          value={customFoodForm.protein}
                          onChange={(e) =>
                            setCustomFoodForm({
                              ...customFoodForm,
                              protein: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Carbs (g)</Label>
                        <Input
                          type="number"
                          value={customFoodForm.carbs}
                          onChange={(e) =>
                            setCustomFoodForm({
                              ...customFoodForm,
                              carbs: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Fats (g)</Label>
                        <Input
                          type="number"
                          value={customFoodForm.fats}
                          onChange={(e) =>
                            setCustomFoodForm({
                              ...customFoodForm,
                              fats: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={createCustomFood} className="w-full">
                      Create Food
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Meal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Log a Meal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Search Food</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          placeholder="Search foods..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredFoods.map((food) => (
                        <Card
                          key={food.id}
                          className={`cursor-pointer transition-colors ${
                            selectedFood?.id === food.id ? "border-primary" : ""
                          }`}
                          onClick={() => setSelectedFood(food)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-semibold">{food.name}</p>
                                {food.brand && (
                                  <p className="text-sm text-muted-foreground">{food.brand}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {food.serving_size}
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                <p>{food.calories} cal</p>
                                <p className="text-muted-foreground">
                                  P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedFood && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
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
                          <div>
                            <Label>Servings</Label>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={servings}
                              onChange={(e) => setServings(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-semibold mb-2">Total Nutrition</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Calories</p>
                              <p className="font-bold">
                                {Math.round(selectedFood.calories * servings)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Protein</p>
                              <p className="font-bold">
                                {(selectedFood.protein * servings).toFixed(1)}g
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Carbs</p>
                              <p className="font-bold">
                                {(selectedFood.carbs * servings).toFixed(1)}g
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fats</p>
                              <p className="font-bold">
                                {(selectedFood.fats * servings).toFixed(1)}g
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button onClick={logMeal} className="w-full">
                          Log Meal
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Macro Circle Display */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Macros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * 0}`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-2xl font-bold">{macroTotals.calories}</p>
                      <p className="text-xs text-muted-foreground">calories</p>
                    </div>
                  </div>
                  <p className="font-semibold">Total Calories</p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="10"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-2xl font-bold">{macroTotals.protein.toFixed(0)}g</p>
                      <p className="text-xs text-muted-foreground">protein</p>
                    </div>
                  </div>
                  <p className="font-semibold">Protein</p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="10"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-2xl font-bold">{macroTotals.carbs.toFixed(0)}g</p>
                      <p className="text-xs text-muted-foreground">carbs</p>
                    </div>
                  </div>
                  <p className="font-semibold">Carbs</p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="10"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-2xl font-bold">{macroTotals.fats.toFixed(0)}g</p>
                      <p className="text-xs text-muted-foreground">fats</p>
                    </div>
                  </div>
                  <p className="font-semibold">Fats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Meal Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch">Lunch</TabsTrigger>
                  <TabsTrigger value="dinner">Dinner</TabsTrigger>
                  <TabsTrigger value="snack">Snack</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3 mt-4">
                  {mealLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No meals logged yet today
                    </p>
                  ) : (
                    mealLogs.map((log) => (
                      <Card key={log.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold capitalize">{log.meal_type}</p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.logged_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {log.servings} serving(s)
                              </p>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span>{log.calories} cal</span>
                                <span>P: {log.protein}g</span>
                                <span>C: {log.carbs}g</span>
                                <span>F: {log.fats}g</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMealLog(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-3 mt-4">
                    {mealLogs
                      .filter((log) => log.meal_type === type)
                      .map((log) => (
                        <Card key={log.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(log.logged_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-sm">
                                  {log.servings} serving(s)
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  <span>{log.calories} cal</span>
                                  <span>P: {log.protein}g</span>
                                  <span>C: {log.carbs}g</span>
                                  <span>F: {log.fats}g</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMealLog(log.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MealTracking;
