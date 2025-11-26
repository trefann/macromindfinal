import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  User, 
  Heart, 
  Utensils, 
  Shield, 
  Dumbbell, 
  Bell, 
  Database, 
  Settings as SettingsIcon, 
  ChevronDown, 
  Loader2,
  Download,
  RefreshCw,
  Trash2
} from "lucide-react";

const settingsSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(1).max(120),
  gender: z.string().min(1, "Gender is required"),
  height_cm: z.coerce.number().min(50).max(300),
  weight_kg: z.coerce.number().min(20).max(500),
  body_fat_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  activity_level: z.string().min(1, "Activity level is required"),
  fitness_goal: z.string().min(1, "Fitness goal is required"),
  dietary_preference: z.string().optional(),
  preferred_cuisine: z.string().optional(),
  food_dislikes: z.string().optional(),
  favorite_foods: z.string().optional(),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  injury_history: z.string().optional(),
  workout_location: z.string().optional(),
  available_equipment: z.array(z.string()).optional(),
  experience_level: z.string().optional(),
  workout_duration_preference: z.coerce.number().optional().nullable(),
  target_muscle_groups: z.array(z.string()).optional(),
  water_reminders: z.boolean(),
  meal_reminders: z.boolean(),
  workout_reminders: z.boolean(),
  progress_reminders: z.boolean(),
  push_notifications: z.boolean(),
  ai_adaptivity_mode: z.string(),
  auto_optimize_enabled: z.boolean(),
  theme_preference: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const equipmentOptions = ["Dumbbells", "Barbell", "Bench", "Pull-up Bar", "Resistance Bands", "Kettlebell", "Cable Machine", "Squat Rack"];
const muscleGroupOptions = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Glutes", "Cardio"];

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState({
    personal: true,
    fitness: false,
    medical: false,
    workout: false,
    notifications: false,
    data: false,
    account: false,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      water_reminders: true,
      meal_reminders: true,
      workout_reminders: true,
      progress_reminders: true,
      push_notifications: true,
      ai_adaptivity_mode: "balanced",
      auto_optimize_enabled: false,
      theme_preference: "system",
      available_equipment: [],
      target_muscle_groups: [],
    },
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
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          full_name: data.full_name || "",
          age: data.age || 0,
          gender: data.gender || "",
          height_cm: data.height_cm || 0,
          weight_kg: data.weight_kg || 0,
          body_fat_percentage: data.body_fat_percentage,
          activity_level: data.activity_level || "",
          fitness_goal: data.fitness_goal || "",
          dietary_preference: data.dietary_preference || "",
          preferred_cuisine: data.preferred_cuisine || "",
          food_dislikes: data.food_dislikes || "",
          favorite_foods: data.favorite_foods || "",
          medical_conditions: data.medical_conditions || "",
          allergies: data.allergies || "",
          injury_history: data.injury_history || "",
          workout_location: data.workout_location || "",
          available_equipment: data.available_equipment || [],
          experience_level: data.experience_level || "",
          workout_duration_preference: data.workout_duration_preference,
          target_muscle_groups: data.target_muscle_groups || [],
          water_reminders: data.water_reminders ?? true,
          meal_reminders: data.meal_reminders ?? true,
          workout_reminders: data.workout_reminders ?? true,
          progress_reminders: data.progress_reminders ?? true,
          push_notifications: data.push_notifications ?? true,
          ai_adaptivity_mode: data.ai_adaptivity_mode || "balanced",
          auto_optimize_enabled: data.auto_optimize_enabled || false,
          theme_preference: data.theme_preference || "system",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          last_weight_update: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleResetPreferences = async () => {
    try {
      await supabase
        .from("profiles")
        .update({
          fitness_goal: null,
          dietary_preference: null,
          preferred_cuisine: null,
          workout_location: null,
          experience_level: null,
        })
        .eq("id", user?.id);
      
      toast.success("Preferences reset successfully");
      loadUserProfile();
    } catch (error) {
      toast.error("Failed to reset preferences");
    }
  };

  const handleExportData = () => {
    toast.info("Export feature coming soon!");
  };

  const handleDeleteAccount = async () => {
    toast.error("Account deletion must be done through account settings");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your preferences and account settings to get personalized AI recommendations
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Profile Section */}
            <Card>
              <Collapsible open={openSections.personal} onOpenChange={() => toggleSection("personal")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Personal Profile & Body Metrics</CardTitle>
                          <CardDescription>Basic information and body measurements</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSections.personal ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Doe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="25" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="height_cm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="170" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight_kg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="70" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="body_fat_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Fat % (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="15" value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="activity_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select activity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                <SelectItem value="light">Lightly Active</SelectItem>
                                <SelectItem value="moderate">Moderately Active</SelectItem>
                                <SelectItem value="very">Very Active</SelectItem>
                                <SelectItem value="extra">Extra Active</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Fitness & Nutrition Preferences */}
            <Card>
              <Collapsible open={openSections.fitness} onOpenChange={() => toggleSection("fitness")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Utensils className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Fitness & Nutrition Preferences</CardTitle>
                          <CardDescription>Your goals and dietary preferences</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSections.fitness ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fitness_goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fitness Goal</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select goal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                                <SelectItem value="bulking">Bulking</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="recomposition">Recomposition</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dietary_preference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dietary Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="veg">Vegetarian</SelectItem>
                                <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                                <SelectItem value="vegan">Vegan</SelectItem>
                                <SelectItem value="eggetarian">Eggetarian</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferred_cuisine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cuisine Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cuisine" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="south_indian">South Indian</SelectItem>
                                <SelectItem value="north_indian">North Indian</SelectItem>
                                <SelectItem value="western">Western</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="food_dislikes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Dislikes / Restrictions</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="E.g., mushrooms, seafood, dairy..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="favorite_foods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Favorite Foods</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="E.g., chicken, rice, broccoli..." />
                          </FormControl>
                          <FormDescription>Foods you'd like prioritized in meal plans</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Medical & Safety */}
            <Card>
              <Collapsible open={openSections.medical} onOpenChange={() => toggleSection("medical")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Medical & Safety Considerations</CardTitle>
                          <CardDescription>Health conditions and injury history</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSections.medical ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="medical_conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="E.g., diabetes, thyroid, PCOS, hypertension..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergies</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="E.g., nuts, shellfish, gluten..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="injury_history"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Injury History</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="E.g., lower back pain, shoulder injury..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Workout Preferences */}
            <Card>
              <Collapsible open={openSections.workout} onOpenChange={() => toggleSection("workout")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Workout Preferences</CardTitle>
                          <CardDescription>Training environment and goals</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSections.workout ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="workout_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workout Location</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="gym">Gym</SelectItem>
                                <SelectItem value="outdoor">Outdoor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="experience_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workout_duration_preference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Workout Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="60" value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="available_equipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Equipment</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {equipmentOptions.map((equipment) => (
                              <div key={equipment} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={equipment}
                                  checked={field.value?.includes(equipment) || false}
                                  onChange={(e) => {
                                    const current = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...current, equipment]);
                                    } else {
                                      field.onChange(current.filter((item) => item !== equipment));
                                    }
                                  }}
                                  className="rounded border-input"
                                />
                                <Label htmlFor={equipment} className="text-sm font-normal cursor-pointer">
                                  {equipment}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="target_muscle_groups"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Muscle Groups</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {muscleGroupOptions.map((muscle) => (
                              <div key={muscle} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={muscle}
                                  checked={field.value?.includes(muscle) || false}
                                  onChange={(e) => {
                                    const current = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...current, muscle]);
                                    } else {
                                      field.onChange(current.filter((item) => item !== muscle));
                                    }
                                  }}
                                  className="rounded border-input"
                                />
                                <Label htmlFor={muscle} className="text-sm font-normal cursor-pointer">
                                  {muscle}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Notifications & Reminders */}
            <Card>
              <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection("notifications")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Notifications & Reminders</CardTitle>
                          <CardDescription>Manage your notification preferences</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transforms ${openSections.notifications ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="water_reminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Water Reminders</FormLabel>
                            <FormDescription>Get reminders to stay hydrated</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meal_reminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Meal Reminders</FormLabel>
                            <FormDescription>Get reminders for meal times</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workout_reminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Workout Reminders</FormLabel>
                            <FormDescription>Get reminders for workout sessions</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="progress_reminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Progress Check-in Reminders</FormLabel>
                            <FormDescription>Get weekly progress tracking reminders</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="push_notifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <FormDescription>Enable all push notifications</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Data & AI Control */}
            <Card>
              <Collapsible open={openSections.data} onOpenChange={() => toggleSection("data")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Data & AI Control</CardTitle>
                          <CardDescription>Manage AI behavior and data</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSections.data ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="ai_adaptivity_mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Adaptivity Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="conservative">Conservative</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="fast">Fast Results</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Controls how aggressively plans adapt to your progress</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="auto_optimize_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Optimize Plans</FormLabel>
                            <FormDescription>Automatically adjust diet & workout plans weekly based on your logs</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <div className="space-y-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset Diet/Workout Preferences
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Preferences?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will clear your fitness goals, dietary preferences, and workout settings. Your personal data and logs will remain intact.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetPreferences}>Reset</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="outline" className="w-full" onClick={handleExportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Export User Data
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Account & App Management */}
            <Card>
              <Collapsible open={openSections.account} onOpenChange={() => toggleSection("account")}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>Account & App Management</CardTitle>
                          <CardDescription>Theme and account settings</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSections.account ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="theme_preference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Theme</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Connected Apps (Coming Soon)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button variant="outline" disabled className="justify-start">
                          Apple Health
                        </Button>
                        <Button variant="outline" disabled className="justify-start">
                          Google Fit
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All your data will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Sticky Save Button */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="max-w-4xl mx-auto">
                <Button type="submit" className="w-full" size="lg" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save All Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}