import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StrengthProgress } from "@/components/workout-tracking/StrengthProgress";
import { AdaptiveProgressionEngine } from "@/components/workout-tracking/AdaptiveProgressionEngine";
import { WorkoutHistory } from "@/components/workout-tracking/WorkoutHistory";
import { GoalSelection, FitnessGoal } from "@/components/workout-planner/GoalSelection";
import { SplitSelection, WorkoutSplit } from "@/components/workout-planner/SplitSelection";
import { PersonalizationForm, PersonalizationData } from "@/components/workout-planner/PersonalizationForm";
import { WorkoutPlanDisplay, WorkoutPlan } from "@/components/workout-planner/WorkoutPlanDisplay";
import { WorkoutTracker } from "@/components/workout-planner/WorkoutTracker";

type PlannerStep = "goal" | "split" | "personalize" | "plan";

const WorkoutPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");
  const { toast } = useToast();

  // Multi-step planner state
  const [step, setStep] = useState<PlannerStep>(() => {
    const saved = localStorage.getItem('workoutPlannerStep');
    return (saved as PlannerStep) || "goal";
  });
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(() => {
    const saved = localStorage.getItem('workoutSelectedGoal');
    return saved ? (saved as FitnessGoal) : null;
  });
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit | null>(() => {
    const saved = localStorage.getItem('workoutSelectedSplit');
    return saved ? JSON.parse(saved) : null;
  });
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(() => {
    const saved = localStorage.getItem('currentWorkoutPlan');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('workoutPlannerStep', step);
  }, [step]);

  useEffect(() => {
    if (selectedGoal) {
      localStorage.setItem('workoutSelectedGoal', selectedGoal);
    }
  }, [selectedGoal]);

  useEffect(() => {
    if (selectedSplit) {
      localStorage.setItem('workoutSelectedSplit', JSON.stringify(selectedSplit));
    }
  }, [selectedSplit]);

  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem('currentWorkoutPlan', JSON.stringify(workoutPlan));
    }
  }, [workoutPlan]);

  const handleGoalSelect = (goal: FitnessGoal) => {
    setSelectedGoal(goal);
    setStep("split");
  };

  const handleSplitSelect = (split: WorkoutSplit) => {
    setSelectedSplit(split);
    setStep("personalize");
  };

  const handlePersonalizationSubmit = async (data: PersonalizationData) => {
    if (!selectedGoal || !selectedSplit) return;

    setLoading(true);
    try {
      const { data: planData, error } = await supabase.functions.invoke("generate-workout-plan", {
        body: {
          goal: selectedGoal,
          split: selectedSplit,
          personalization: data,
        }
      });

      if (error) throw error;

      setWorkoutPlan(planData);
      setStep("plan");

      toast({
        title: "Plan Generated!",
        description: "Your personalized workout plan is ready.",
      });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!workoutPlan) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("workout_plans").insert([{
        user_id: user.id,
        name: workoutPlan.name,
        description: workoutPlan.description,
        duration_minutes: workoutPlan.duration_minutes,
        exercises: JSON.parse(JSON.stringify(workoutPlan.weekly_schedule))
      }]);

      if (error) throw error;

      toast({
        title: "Plan Saved!",
        description: "Your workout plan has been saved to history.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workout plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = () => {
    setStep("personalize");
  };

  const handleCreateNew = () => {
    setWorkoutPlan(null);
    setSelectedGoal(null);
    setSelectedSplit(null);
    setStep("goal");
    localStorage.removeItem('currentWorkoutPlan');
    localStorage.removeItem('workoutSelectedGoal');
    localStorage.removeItem('workoutSelectedSplit');
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    setWorkoutPlan(updatedPlan);
  };

  const renderPlannerContent = () => {
    // If we have a plan, show it
    if (step === "plan" && workoutPlan) {
      return (
        <WorkoutPlanDisplay
          plan={workoutPlan}
          onSave={handleSavePlan}
          onRegenerate={handleRegenerate}
          onCreateNew={handleCreateNew}
          onUpdatePlan={handleUpdatePlan}
          saving={saving}
        />
      );
    }

    // Otherwise show the appropriate step
    switch (step) {
      case "goal":
        return <GoalSelection onSelect={handleGoalSelect} />;
      case "split":
        return selectedGoal ? (
          <SplitSelection
            goal={selectedGoal}
            onSelect={handleSplitSelect}
            onBack={() => setStep("goal")}
          />
        ) : null;
      case "personalize":
        return selectedGoal && selectedSplit ? (
          <PersonalizationForm
            goal={selectedGoal}
            split={selectedSplit}
            onSubmit={handlePersonalizationSubmit}
            onBack={() => setStep("split")}
            loading={loading}
          />
        ) : null;
      default:
        return <GoalSelection onSelect={handleGoalSelect} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              AI <span className="gradient-text">Workout Planner</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Get a scientifically structured, personalized workout program
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-auto">
              <TabsTrigger value="planner" className="text-[10px] sm:text-sm py-2 sm:py-3 px-1 sm:px-3">
                Planner
              </TabsTrigger>
              <TabsTrigger value="track" className="text-[10px] sm:text-sm py-2 sm:py-3 px-1 sm:px-3">
                Track
              </TabsTrigger>
              <TabsTrigger value="history" className="text-[10px] sm:text-sm py-2 sm:py-3 px-1 sm:px-3">
                History
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-[10px] sm:text-sm py-2 sm:py-3 px-1 sm:px-3">
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planner" className="space-y-8">
              {renderPlannerContent()}
            </TabsContent>

            <TabsContent value="track">
              <WorkoutTracker
                plan={workoutPlan}
                onNoPlan={() => {
                  setActiveTab("planner");
                  handleCreateNew();
                }}
              />
            </TabsContent>

            <TabsContent value="history">
              <WorkoutHistory />
            </TabsContent>

            <TabsContent value="progress" className="space-y-8">
              <AdaptiveProgressionEngine />
              <StrengthProgress />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WorkoutPlanner;
