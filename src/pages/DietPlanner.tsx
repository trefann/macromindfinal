import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MacroCircle } from "@/components/meal-tracking/MacroCircle";
import { QuickMacroEntry } from "@/components/meal-tracking/QuickMacroEntry";
import { FoodSearch } from "@/components/meal-tracking/FoodSearch";
import { CustomFoodForm } from "@/components/meal-tracking/CustomFoodForm";
import { MealTimeline } from "@/components/meal-tracking/MealTimeline";

const DietPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [macroGoals] = useState({ calories: 2200, protein: 165, carbs: 220, fats: 65 });
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    medicalConditions: "",
    cuisinePreference: "",
    planDuration: "1"
  });

  const generatePlan = async () => {
    if (!formData.age || !formData.gender || !formData.height || !formData.weight || 
        !formData.activityLevel || !formData.goal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diet-plan", {
        body: { 
          ...formData,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          planDuration: parseInt(formData.planDuration)
        }
      });

      if (error) throw error;

      setMealPlan(data);
      toast({
        title: "Success!",
        description: "Your personalized meal plan has been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              AI <span className="gradient-text">Diet Planner</span>
            </h1>
            <p className="text-muted-foreground">
              Get a personalized meal plan and track your nutrition
            </p>
          </div>

          <Tabs defaultValue="planner" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="planner">Plan Generator</TabsTrigger>
              <TabsTrigger value="track">Meal Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="planner" className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                  <CardDescription>
                    Tell us about yourself to create a personalized meal plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="bg-muted/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activity">Activity Level *</Label>
                      <Select value={formData.activityLevel} onValueChange={(value) => setFormData({...formData, activityLevel: value})}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                          <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                          <SelectItem value="very-active">Very Active (intense daily)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Goal *</Label>
                      <Select value={formData.goal} onValueChange={(value) => setFormData({...formData, goal: value})}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fat-loss">Fat Loss</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="bulking">Bulking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cuisine">Cuisine Preference</Label>
                      <Input
                        id="cuisine"
                        placeholder="Mediterranean, Asian, etc."
                        value={formData.cuisinePreference}
                        onChange={(e) => setFormData({...formData, cuisinePreference: e.target.value})}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Plan Duration</Label>
                      <Select value={formData.planDuration} onValueChange={(value) => setFormData({...formData, planDuration: value})}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="7">7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="medical">Medical Conditions / Allergies</Label>
                      <Textarea
                        id="medical"
                        placeholder="Diabetes, lactose intolerance, nut allergies, etc."
                        value={formData.medicalConditions}
                        onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                        className="bg-muted/50 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generatePlan}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-neon hover:opacity-90"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Your Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {mealPlan && (
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Your Meal Plan</CardTitle>
                          <CardDescription>{formData.planDuration === "1" ? "1-Day" : "7-Day"} Plan</CardDescription>
                        </div>
                        <Button
                          onClick={generatePlan}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          className="border-primary/50 hover:bg-primary/10"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
                          <p className="text-3xl font-bold text-primary">{mealPlan.total_calories}</p>
                          <p className="text-sm text-muted-foreground mt-1">Calories</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl border border-secondary/20">
                          <p className="text-3xl font-bold text-secondary">{mealPlan.total_protein}g</p>
                          <p className="text-sm text-muted-foreground mt-1">Protein</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl border border-accent/20">
                          <p className="text-3xl font-bold text-accent">{mealPlan.total_carbs}g</p>
                          <p className="text-sm text-muted-foreground mt-1">Carbs</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
                          <p className="text-3xl font-bold text-primary">{mealPlan.total_fats}g</p>
                          <p className="text-sm text-muted-foreground mt-1">Fats</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {mealPlan.meals?.map((meal: any, index: number) => (
                    <Card key={index} className="glass-card hover:shadow-glow transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gradient-neon"></span>
                            {meal.name}
                          </span>
                          <span className="text-base font-normal text-muted-foreground">{meal.time}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <ul className="space-y-2">
                            {meal.items?.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-foreground">
                                <span className="text-primary mt-1.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                            <div className="px-4 py-2 bg-muted/50 rounded-lg">
                              <span className="text-xs text-muted-foreground">Calories:</span>
                              <span className="ml-2 font-semibold text-foreground">{meal.calories}</span>
                            </div>
                            <div className="px-4 py-2 bg-muted/50 rounded-lg">
                              <span className="text-xs text-muted-foreground">Protein:</span>
                              <span className="ml-2 font-semibold text-foreground">{meal.protein}g</span>
                            </div>
                            <div className="px-4 py-2 bg-muted/50 rounded-lg">
                              <span className="text-xs text-muted-foreground">Carbs:</span>
                              <span className="ml-2 font-semibold text-foreground">{meal.carbs}g</span>
                            </div>
                            <div className="px-4 py-2 bg-muted/50 rounded-lg">
                              <span className="text-xs text-muted-foreground">Fats:</span>
                              <span className="ml-2 font-semibold text-foreground">{meal.fats}g</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="track" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Log Meals</CardTitle>
                      <CardDescription>Search food database or add custom foods</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FoodSearch onMealAdded={() => setRefreshKey(prev => prev + 1)} />
                      <div className="pt-4 border-t border-border">
                        <CustomFoodForm onFoodCreated={() => setRefreshKey(prev => prev + 1)} />
                      </div>
                      <div className="pt-4 border-t border-border">
                        <QuickMacroEntry onMealAdded={() => setRefreshKey(prev => prev + 1)} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <MealTimeline key={refreshKey} />
                </div>
                
                <div className="lg:col-span-1">
                  <MacroCircle 
                    key={refreshKey}
                    current={{ calories: 0, protein: 0, carbs: 0, fats: 0 }}
                    goals={macroGoals}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DietPlanner;