import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MacroCircleProps {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const MacroCircle = ({ current, goals }: MacroCircleProps) => {
  const caloriePercentage = Math.min((current.calories / goals.calories) * 100, 100);
  const proteinPercentage = Math.min((current.protein / goals.protein) * 100, 100);
  const carbsPercentage = Math.min((current.carbs / goals.carbs) * 100, 100);
  const fatsPercentage = Math.min((current.fats / goals.fats) * 100, 100);

  const remaining = {
    calories: Math.max(goals.calories - current.calories, 0),
    protein: Math.max(goals.protein - current.protein, 0),
    carbs: Math.max(goals.carbs - current.carbs, 0),
    fats: Math.max(goals.fats - current.fats, 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-card border-primary/20">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Calories</h3>
            <span className="text-2xl font-bold text-primary">
              {current.calories.toFixed(0)}
            </span>
          </div>
          <Progress value={caloriePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{remaining.calories.toFixed(0)} left</span>
            <span>{goals.calories} goal</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-primary/20">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Protein</h3>
            <span className="text-2xl font-bold text-green-500">
              {current.protein.toFixed(0)}g
            </span>
          </div>
          <Progress value={proteinPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{remaining.protein.toFixed(0)}g left</span>
            <span>{goals.protein}g goal</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-primary/20">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Carbs</h3>
            <span className="text-2xl font-bold text-blue-500">
              {current.carbs.toFixed(0)}g
            </span>
          </div>
          <Progress value={carbsPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{remaining.carbs.toFixed(0)}g left</span>
            <span>{goals.carbs}g goal</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-primary/20">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Fats</h3>
            <span className="text-2xl font-bold text-yellow-500">
              {current.fats.toFixed(0)}g
            </span>
          </div>
          <Progress value={fatsPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{remaining.fats.toFixed(0)}g left</span>
            <span>{goals.fats}g goal</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
