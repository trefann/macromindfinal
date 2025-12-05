import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Zap, LayoutGrid } from "lucide-react";
import { FitnessGoal } from "./GoalSelection";

export interface WorkoutSplit {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  schedule: string[];
}

interface SplitSelectionProps {
  goal: FitnessGoal;
  onSelect: (split: WorkoutSplit) => void;
  onBack: () => void;
}

const splitsByGoal: Record<FitnessGoal, WorkoutSplit[]> = {
  "fat-loss": [
    {
      id: "full-body-hiit",
      name: "Full Body + HIIT",
      description: "High-intensity training for maximum calorie burn",
      daysPerWeek: 4,
      schedule: ["Full Body A", "HIIT Cardio", "Full Body B", "HIIT Cardio"],
    },
    {
      id: "circuit-core",
      name: "Circuit + Core",
      description: "Circuit training with dedicated core work",
      daysPerWeek: 5,
      schedule: ["Upper Circuit", "Lower Circuit", "Core & Abs", "Full Body Circuit", "Active Recovery"],
    },
    {
      id: "cardio-strength",
      name: "Cardio + Strength Hybrid",
      description: "Balance of cardio and resistance training",
      daysPerWeek: 6,
      schedule: ["Push + Cardio", "Pull + Cardio", "Legs", "Push + Cardio", "Pull + Cardio", "Legs + HIIT"],
    },
  ],
  bulking: [
    {
      id: "ppl",
      name: "Push Pull Legs (PPL)",
      description: "Classic bodybuilding split for maximum growth",
      daysPerWeek: 6,
      schedule: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"],
    },
    {
      id: "upper-lower",
      name: "Upper-Lower Split",
      description: "4-day split with frequency and recovery balance",
      daysPerWeek: 4,
      schedule: ["Upper Body", "Lower Body", "Rest", "Upper Body", "Lower Body"],
    },
    {
      id: "arnold",
      name: "Arnold Split",
      description: "High-volume split inspired by Arnold Schwarzenegger",
      daysPerWeek: 6,
      schedule: ["Chest & Back", "Shoulders & Arms", "Legs", "Chest & Back", "Shoulders & Arms", "Legs"],
    },
  ],
  maingaining: [
    {
      id: "upper-lower-mg",
      name: "Upper-Lower",
      description: "Balanced split for lean muscle gains",
      daysPerWeek: 4,
      schedule: ["Upper Body", "Lower Body", "Rest", "Upper Body", "Lower Body"],
    },
    {
      id: "full-body-mg",
      name: "Full Body 3x",
      description: "Full body training with optimal recovery",
      daysPerWeek: 3,
      schedule: ["Full Body A", "Rest", "Full Body B", "Rest", "Full Body C"],
    },
    {
      id: "ppl-moderate",
      name: "PPL Moderate Volume",
      description: "Push Pull Legs with controlled volume",
      daysPerWeek: 5,
      schedule: ["Push", "Pull", "Legs", "Upper Body", "Lower Body"],
    },
  ],
  strength: [
    {
      id: "531",
      name: "Wendler 5/3/1",
      description: "Progressive overload focused strength program",
      daysPerWeek: 4,
      schedule: ["Squat Day", "Bench Day", "Deadlift Day", "OHP Day"],
    },
    {
      id: "upper-lower-str",
      name: "Upper-Lower Strength",
      description: "Compound-focused strength training",
      daysPerWeek: 4,
      schedule: ["Upper Strength", "Lower Strength", "Upper Hypertrophy", "Lower Hypertrophy"],
    },
    {
      id: "full-body-str",
      name: "Full Body Strength",
      description: "Total body strength training 3x/week",
      daysPerWeek: 3,
      schedule: ["Squat Focus", "Bench Focus", "Deadlift Focus"],
    },
  ],
  endurance: [
    {
      id: "full-body-low",
      name: "Full Body + Low Weights",
      description: "High rep, low weight for endurance",
      daysPerWeek: 4,
      schedule: ["Full Body A", "Cardio", "Full Body B", "Cardio"],
    },
    {
      id: "cross-training",
      name: "Cross-Training",
      description: "Varied training modalities for complete fitness",
      daysPerWeek: 5,
      schedule: ["Strength", "Cardio", "Functional", "Recovery", "Mixed"],
    },
    {
      id: "hiit-mobility",
      name: "HIIT + Mobility",
      description: "High intensity with flexibility focus",
      daysPerWeek: 5,
      schedule: ["HIIT Upper", "Mobility", "HIIT Lower", "Mobility", "Full Body HIIT"],
    },
  ],
};

export const SplitSelection = ({ goal, onSelect, onBack }: SplitSelectionProps) => {
  const splits = splitsByGoal[goal];
  const goalNames: Record<FitnessGoal, string> = {
    "fat-loss": "Fat Loss",
    bulking: "Bulking",
    maingaining: "Maingaining",
    strength: "Strength",
    endurance: "Endurance",
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle className="text-2xl">Choose Your Workout Split</CardTitle>
        <CardDescription>
          Select a training split optimized for {goalNames[goal]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {splits.map((split) => (
            <button
              key={split.id}
              onClick={() => onSelect(split)}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{split.daysPerWeek} days/week</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{split.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{split.description}</p>
              <div className="flex flex-wrap gap-1">
                {split.schedule.slice(0, 4).map((day, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-muted rounded">
                    {day}
                  </span>
                ))}
                {split.schedule.length > 4 && (
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    +{split.schedule.length - 4} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
