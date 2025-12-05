import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Scale, Dumbbell, Heart } from "lucide-react";

export type FitnessGoal = "fat-loss" | "bulking" | "maingaining" | "strength" | "endurance";

interface GoalSelectionProps {
  onSelect: (goal: FitnessGoal) => void;
}

const goals = [
  {
    id: "fat-loss" as FitnessGoal,
    name: "Fat Loss",
    description: "Burn fat while maintaining muscle mass",
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "bulking" as FitnessGoal,
    name: "Bulking",
    description: "Build maximum muscle and size",
    icon: Dumbbell,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "maingaining" as FitnessGoal,
    name: "Maingaining",
    description: "Gain muscle while staying lean",
    icon: Scale,
    color: "from-green-500 to-teal-500",
  },
  {
    id: "strength" as FitnessGoal,
    name: "Strength",
    description: "Maximize strength and power",
    icon: Target,
    color: "from-red-500 to-pink-500",
  },
  {
    id: "endurance" as FitnessGoal,
    name: "Endurance",
    description: "Improve stamina and conditioning",
    icon: Heart,
    color: "from-cyan-500 to-blue-500",
  },
];

export const GoalSelection = ({ onSelect }: GoalSelectionProps) => {
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">What's Your Goal?</CardTitle>
        <CardDescription>
          Choose your primary fitness objective to get a personalized workout plan
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
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
