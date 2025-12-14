import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Dumbbell, Heart, Zap } from "lucide-react";

export type FitnessGoal = "hypertrophy" | "strength" | "endurance" | "powerbuilding" | "fat-loss";

interface GoalSelectionProps {
  onSelect: (goal: FitnessGoal) => void;
}

const goals = [
  {
    id: "hypertrophy" as FitnessGoal,
    name: "Hypertrophy",
    description: "Build muscle size with moderate loads and higher volume",
    icon: Dumbbell,
    color: "from-blue-500 to-purple-500",
    details: "8-12 reps • 60-90s rest • RPE 7-8",
  },
  {
    id: "strength" as FitnessGoal,
    name: "Strength",
    description: "Maximize strength with heavy compounds and lower reps",
    icon: Target,
    color: "from-red-500 to-orange-500",
    details: "3-6 reps • 2-4min rest • RPE 8-9",
  },
  {
    id: "endurance" as FitnessGoal,
    name: "Endurance",
    description: "Improve stamina with lighter loads and higher reps",
    icon: Heart,
    color: "from-cyan-500 to-blue-500",
    details: "15-20+ reps • 30-60s rest • RPE 6-7",
  },
  {
    id: "powerbuilding" as FitnessGoal,
    name: "Powerbuilding",
    description: "Combine strength and hypertrophy in a periodized mix",
    icon: Zap,
    color: "from-yellow-500 to-red-500",
    details: "Mixed rep ranges • Periodized weekly",
  },
  {
    id: "fat-loss" as FitnessGoal,
    name: "Fat Loss",
    description: "Burn fat while preserving muscle mass",
    icon: Flame,
    color: "from-orange-500 to-pink-500",
    details: "Higher density • Shorter rest • Supersets",
  },
];

export const GoalSelection = ({ onSelect }: GoalSelectionProps) => {
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Select Your Training Goal</CardTitle>
        <CardDescription>
          Choose your primary objective to optimize your workout programming
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <goal.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
              <span className="text-xs text-primary/80 font-medium">{goal.details}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
