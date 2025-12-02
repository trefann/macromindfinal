import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Heart, Activity, Dumbbell, Bell, Database, Shield, ChevronDown, Save } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["personal"]);
  
  const [formData, setFormData] = useState({
    // Personal Profile & Body Metrics
    full_name: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    body_fat_percentage: "",
    last_weight_update: null as string | null,
    
    // Fitness & Nutrition Preferences
    fitness_goal: "",
    dietary_preference: "",
    preferred_cuisine: "",
    food_dislikes: "",
    favorite_foods: "",
    allergies: "",
    
    // Medical / Safety Considerations
    medical_conditions: "",
    injury_history: "",
    
    // Workout Preferences
    workout_location: "",
    available_equipment: [] as string[],
    experience_level: "",
    workout_duration_preference: "",
    target_muscle_groups: [] as string[],
    
    // Notifications & Reminders
    water_reminders: true,
    meal_reminders: true,
    workout_reminders: true,
    progress_reminders: true,
    push_notifications: true,
    
    // Smart Add-ons
    ai_adaptivity_mode: "balanced",
    auto_optimize_enabled: false,
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          age: data.age?.toString() || "",
          gender: data.gender || "",
          height_cm: data.height_cm?.toString() || "",
          weight_kg: data.weight_kg?.toString() || "",
          activity_level: data.activity_level || "",
          body_fat_percentage: data.body_fat_percentage?.toString() || "",
          last_weight_update: data.last_weight_update,
          fitness_goal: data.fitness_goal || "",
          dietary_preference: data.dietary_preference || "",
          preferred_cuisine: data.preferred_cuisine || "",
          food_dislikes: data.food_dislikes || "",
          favorite_foods: data.favorite_foods || "",
          allergies: data.allergies || "",
          medical_conditions: data.medical_conditions || "",
          injury_history: data.injury_history || "",
          workout_location: data.workout_location || "",
          available_equipment: data.available_equipment || [],
          experience_level: data.experience_level || "",
          workout_duration_preference: data.workout_duration_preference?.toString() || "",
          target_muscle_groups: data.target_muscle_groups || [],
          water_reminders: data.water_reminders ?? true,
          meal_reminders: data.meal_reminders ?? true,
          workout_reminders: data.workout_reminders ?? true,
          progress_reminders: data.progress_reminders ?? true,
          push_notifications: data.push_notifications ?? true,
          ai_adaptivity_mode: data.ai_adaptivity_mode || "balanced",
          auto_optimize_enabled: data.auto_optimize_enabled || false,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: any = {
        full_name: formData.full_name,
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        height_cm: parseFloat(formData.height_cm) || null,
        weight_kg: parseFloat(formData.weight_kg) || null,
        activity_level: formData.activity_level || null,
        body_fat_percentage: parseFloat(formData.body_fat_percentage) || null,
        fitness_goal: formData.fitness_goal || null,
        dietary_preference: formData.dietary_preference || null,
        preferred_cuisine: formData.preferred_cuisine || null,
        food_dislikes: formData.food_dislikes || null,
        favorite_foods: formData.favorite_foods || null,
        allergies: formData.allergies || null,
        medical_conditions: formData.medical_conditions || null,
        injury_history: formData.injury_history || null,
        workout_location: formData.workout_location || null,
        available_equipment: formData.available_equipment,
        experience_level: formData.experience_level || null,
        workout_duration_preference: parseInt(formData.workout_duration_preference) || null,
        target_muscle_groups: formData.target_muscle_groups,
        water_reminders: formData.water_reminders,
        meal_reminders: formData.meal_reminders,
        workout_reminders: formData.workout_reminders,
        progress_reminders: formData.progress_reminders,
        push_notifications: formData.push_notifications,
        ai_adaptivity_mode: formData.ai_adaptivity_mode,
        auto_optimize_enabled: formData.auto_optimize_enabled,
        updated_at: new Date().toISOString(),
      };

      // Update last_weight_update if weight changed
      const currentWeight = parseFloat(formData.weight_kg);
      if (currentWeight && currentWeight !== parseFloat(formData.weight_kg)) {
        updateData.last_weight_update = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Settings saved successfully!");
      loadUserProfile(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof typeof prev] as string[];
      return {
        ...prev,
        [name]: checked 
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      };
    });
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const equipmentOptions = ["Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", "Bench", "Squat Rack", "Kettlebells", "Medicine Ball", "Jump Rope", "Yoga Mat"];
  const muscleGroupOptions = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Glutes", "Cardio"];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your profile, preferences, and AI personalization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Theme Section - Always visible */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Activity className="h-6 w-6 text-primary" />
                Theme
              </CardTitle>
              <CardDescription>Customize the look and feel of your app</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Personal Profile & Body Metrics */}
          <Collapsible 
            open={openSections.includes("personal")} 
            onOpenChange={() => toggleSection("personal")}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Personal Profile & Body Metrics</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("personal") ? "rotate-180" : ""}`} />
                  </div>
                  <CardDescription className="text-left">Basic information and body measurements</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="25" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height_cm">Height (cm)</Label>
                      <Input id="height_cm" name="height_cm" type="number" step="0.1" value={formData.height_cm} onChange={handleChange} placeholder="170" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight_kg">Weight (kg)</Label>
                      <Input id="weight_kg" name="weight_kg" type="number" step="0.1" value={formData.weight_kg} onChange={handleChange} placeholder="70" />
                      {formData.last_weight_update && (
                        <p className="text-xs text-muted-foreground">Last updated: {format(new Date(formData.last_weight_update), "MMM d, yyyy")}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity_level">Activity Level</Label>
                      <Select value={formData.activity_level} onValueChange={(value) => handleSelectChange("activity_level", value)}>
                        <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sedentary">Sedentary (little to no exercise)</SelectItem>
                          <SelectItem value="Light">Light (1-3 days/week)</SelectItem>
                          <SelectItem value="Moderate">Moderate (3-5 days/week)</SelectItem>
                          <SelectItem value="Active">Active (6-7 days/week)</SelectItem>
                          <SelectItem value="Very Active">Very Active (twice per day)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="body_fat_percentage">Body Fat % (Optional)</Label>
                      <Input id="body_fat_percentage" name="body_fat_percentage" type="number" step="0.1" value={formData.body_fat_percentage} onChange={handleChange} placeholder="15" />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Fitness & Nutrition Preferences */}
          <Collapsible 
            open={openSections.includes("nutrition")} 
            onOpenChange={() => toggleSection("nutrition")}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Fitness & Nutrition Preferences</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("nutrition") ? "rotate-180" : ""}`} />
                  </div>
                  <CardDescription className="text-left">Your goals and dietary preferences</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fitness_goal">Fitness Goal</Label>
                      <Select value={formData.fitness_goal} onValueChange={(value) => handleSelectChange("fitness_goal", value)}>
                        <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                          <SelectItem value="Bulking">Bulking</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Recomposition">Recomposition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dietary_preference">Dietary Preference</Label>
                      <Select value={formData.dietary_preference} onValueChange={(value) => handleSelectChange("dietary_preference", value)}>
                        <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="Vegan">Vegan</SelectItem>
                          <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_cuisine">Cuisine Preference</Label>
                    <Select value={formData.preferred_cuisine} onValueChange={(value) => handleSelectChange("preferred_cuisine", value)}>
                      <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South Indian">South Indian</SelectItem>
                        <SelectItem value="North Indian">North Indian</SelectItem>
                        <SelectItem value="Western">Western</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="food_dislikes">Food Dislikes / Restrictions</Label>
                    <Textarea id="food_dislikes" name="food_dislikes" value={formData.food_dislikes} onChange={handleChange} placeholder="e.g., mushrooms, spicy food..." rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favorite_foods">Favorite Foods</Label>
                    <Textarea id="favorite_foods" name="favorite_foods" value={formData.favorite_foods} onChange={handleChange} placeholder="Foods you'd like prioritized in meal plans..." rows={2} />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Medical / Safety Considerations */}
          <Collapsible 
            open={openSections.includes("medical")} 
            onOpenChange={() => toggleSection("medical")}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Medical / Safety Considerations</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("medical") ? "rotate-180" : ""}`} />
                  </div>
                  <CardDescription className="text-left">Health conditions and allergies</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="medical_conditions">Medical Conditions</Label>
                    <Textarea id="medical_conditions" name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} placeholder="e.g., diabetes, thyroid, PCOS, hypertension..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Food or environmental allergies..." rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="injury_history">Injury History</Label>
                    <Textarea id="injury_history" name="injury_history" value={formData.injury_history} onChange={handleChange} placeholder="Past injuries or mobility limitations..." rows={2} />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Workout Preferences */}
          <Collapsible 
            open={openSections.includes("workout")} 
            onOpenChange={() => toggleSection("workout")}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Workout Preferences</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("workout") ? "rotate-180" : ""}`} />
                  </div>
                  <CardDescription className="text-left">Training environment and equipment</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workout_location">Workout Location</Label>
                      <Select value={formData.workout_location} onValueChange={(value) => handleSelectChange("workout_location", value)}>
                        <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Gym">Gym</SelectItem>
                          <SelectItem value="Outdoor">Outdoor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Select value={formData.experience_level} onValueChange={(value) => handleSelectChange("experience_level", value)}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workout_duration_preference">Preferred Workout Duration (minutes)</Label>
                    <Input id="workout_duration_preference" name="workout_duration_preference" type="number" value={formData.workout_duration_preference} onChange={handleChange} placeholder="45" />
                  </div>
                  <div className="space-y-2">
                    <Label>Available Equipment</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {equipmentOptions.map(equipment => (
                        <div key={equipment} className="flex items-center space-x-2">
                          <Checkbox 
                            id={equipment}
                            checked={formData.available_equipment.includes(equipment)}
                            onCheckedChange={(checked) => handleCheckboxChange("available_equipment", equipment, checked as boolean)}
                          />
                          <Label htmlFor={equipment} className="text-sm font-normal cursor-pointer">{equipment}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Muscle Groups</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {muscleGroupOptions.map(muscle => (
                        <div key={muscle} className="flex items-center space-x-2">
                          <Checkbox 
                            id={muscle}
                            checked={formData.target_muscle_groups.includes(muscle)}
                            onCheckedChange={(checked) => handleCheckboxChange("target_muscle_groups", muscle, checked as boolean)}
                          />
                          <Label htmlFor={muscle} className="text-sm font-normal cursor-pointer">{muscle}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Notifications & Reminders */}
          <Collapsible 
            open={openSections.includes("notifications")} 
            onOpenChange={() => toggleSection("notifications")}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Notifications & Reminders</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("notifications") ? "rotate-180" : ""}`} />
                  </div>
                  <CardDescription className="text-left">Manage your notification preferences</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="water_reminders">Water Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders to stay hydrated</p>
                    </div>
                    <Switch id="water_reminders" checked={formData.water_reminders} onCheckedChange={(checked) => handleSwitchChange("water_reminders", checked)} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="meal_reminders">Meal Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders for meal times</p>
                    </div>
                    <Switch id="meal_reminders" checked={formData.meal_reminders} onCheckedChange={(checked) => handleSwitchChange("meal_reminders", checked)} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="workout_reminders">Workout Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders for scheduled workouts</p>
                    </div>
                    <Switch id="workout_reminders" checked={formData.workout_reminders} onCheckedChange={(checked) => handleSwitchChange("workout_reminders", checked)} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="progress_reminders">Progress Check-in Reminders</Label>
                      <p className="text-sm text-muted-foreground">Weekly progress tracking reminders</p>
                    </div>
                    <Switch id="progress_reminders" checked={formData.progress_reminders} onCheckedChange={(checked) => handleSwitchChange("progress_reminders", checked)} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push_notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Enable all push notifications</p>
                    </div>
                    <Switch id="push_notifications" checked={formData.push_notifications} onCheckedChange={(checked) => handleSwitchChange("push_notifications", checked)} />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Data & AI Control */}
          <Collapsible 
            open={openSections.includes("ai")} 
            onOpenChange={() => toggleSection("ai")}
          >
            <Card className="border-2 border-primary/30">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Smart AI Features</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("ai") ? "rotate-180" : ""}`} />
                  </div>
                  <CardDescription className="text-left">Control how AI adapts to your progress</CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="ai_adaptivity_mode">AI Adaptivity Mode</Label>
                    <Select value={formData.ai_adaptivity_mode} onValueChange={(value) => handleSelectChange("ai_adaptivity_mode", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative - Slow, steady changes</SelectItem>
                        <SelectItem value="balanced">Balanced - Moderate adjustments</SelectItem>
                        <SelectItem value="fast">Fast Results - Aggressive optimization</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Controls how aggressively AI updates your plans based on performance</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto_optimize_enabled">Auto-Optimize Diet & Workout</Label>
                      <p className="text-sm text-muted-foreground">System adjusts plans weekly based on your logs</p>
                    </div>
                    <Switch id="auto_optimize_enabled" checked={formData.auto_optimize_enabled} onCheckedChange={(checked) => handleSwitchChange("auto_optimize_enabled", checked)} />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Health Device Integration (Coming Soon)</Label>
                    <div className="space-y-3 opacity-50 pointer-events-none">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Apple Health</span>
                        <Switch disabled />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Google Fit</span>
                        <Switch disabled />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Smartwatch</span>
                        <Switch disabled />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </form>

        {/* Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50">
          <div className="max-w-5xl mx-auto">
            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              size="lg" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}