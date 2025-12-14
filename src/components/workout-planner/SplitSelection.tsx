import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, LayoutGrid, Plus, X } from "lucide-react";
import { FitnessGoal } from "./GoalSelection";

export interface WorkoutSplit {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  schedule: string[];
  isCustom?: boolean;
}

interface SplitSelectionProps {
  goal: FitnessGoal;
  onSelect: (split: WorkoutSplit) => void;
  onBack: () => void;
}

const standardSplits: WorkoutSplit[] = [
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    description: "Classic bodybuilding split hitting each muscle group twice per week",
    daysPerWeek: 6,
    schedule: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"],
  },
  {
    id: "bro-split",
    name: "Bro Split",
    description: "One muscle group per day with maximum recovery",
    daysPerWeek: 5,
    schedule: ["Chest", "Back", "Shoulders", "Legs", "Arms"],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    description: "Balanced split with optimal frequency and recovery",
    daysPerWeek: 4,
    schedule: ["Upper Body", "Lower Body", "Upper Body", "Lower Body"],
  },
  {
    id: "full-body",
    name: "Full Body",
    description: "Train everything each session for maximum frequency",
    daysPerWeek: 3,
    schedule: ["Full Body A", "Full Body B", "Full Body C"],
  },
];

export const SplitSelection = ({ goal, onSelect, onBack }: SplitSelectionProps) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customDays, setCustomDays] = useState<string[]>(["", "", ""]);

  const goalNames: Record<FitnessGoal, string> = {
    hypertrophy: "Hypertrophy",
    strength: "Strength",
    endurance: "Endurance",
    powerbuilding: "Powerbuilding",
    "fat-loss": "Fat Loss",
  };

  const handleAddCustomDay = () => {
    if (customDays.length < 7) {
      setCustomDays([...customDays, ""]);
    }
  };

  const handleRemoveCustomDay = (index: number) => {
    if (customDays.length > 1) {
      setCustomDays(customDays.filter((_, i) => i !== index));
    }
  };

  const handleCustomDayChange = (index: number, value: string) => {
    const updated = [...customDays];
    updated[index] = value;
    setCustomDays(updated);
  };

  const handleCustomSubmit = () => {
    const validDays = customDays.filter(d => d.trim() !== "");
    if (validDays.length > 0) {
      onSelect({
        id: "custom",
        name: "Custom Split",
        description: "Your personalized training split",
        daysPerWeek: validDays.length,
        schedule: validDays,
        isCustom: true,
      });
    }
  };

  const isCustomValid = customDays.filter(d => d.trim() !== "").length >= 1;

  if (showCustom) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCustom(false)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl">Create Custom Split</CardTitle>
          <CardDescription>
            Define your own training days and muscle group focus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {customDays.map((day, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">
                  Day {index + 1}
                </Badge>
                <Input
                  placeholder="e.g., Chest & Triceps, Pull Day, Legs..."
                  value={day}
                  onChange={(e) => handleCustomDayChange(index, e.target.value)}
                  className="flex-1 bg-muted/50"
                />
                {customDays.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCustomDay(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {customDays.length < 7 && (
            <Button
              variant="outline"
              onClick={handleAddCustomDay}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Training Day
            </Button>
          )}

          <Button
            onClick={handleCustomSubmit}
            disabled={!isCustomValid}
            className="w-full bg-gradient-neon"
            size="lg"
          >
            Continue with Custom Split
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle className="text-2xl">Choose Your Training Split</CardTitle>
        <CardDescription>
          Select a training split optimized for {goalNames[goal]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {standardSplits.map((split) => (
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

        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setShowCustom(true)}
            className="w-full"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Split
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
