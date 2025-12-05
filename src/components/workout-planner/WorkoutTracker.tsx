import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkoutSession } from "@/components/workout-tracking/WorkoutSession";
import { Calendar, Play, CheckCircle } from "lucide-react";
import { WorkoutPlan } from "./WorkoutPlanDisplay";

interface WorkoutTrackerProps {
  plan: WorkoutPlan | null;
  onNoPlan: () => void;
}

export const WorkoutTracker = ({ plan, onNoPlan }: WorkoutTrackerProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  if (!plan) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Workout Plan</h3>
          <p className="text-muted-foreground mb-4">
            Generate a workout plan first to start tracking your workouts
          </p>
          <Button onClick={onNoPlan} className="bg-gradient-neon">
            Create Workout Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (sessionActive && selectedDay !== null) {
    const dayWorkout = plan.weekly_schedule[selectedDay];
    return (
      <WorkoutSession
        dayWorkout={dayWorkout}
        dayNumber={selectedDay + 1}
        onSessionComplete={() => {
          setSessionActive(false);
          setSelectedDay(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Start Today's Workout</CardTitle>
          <CardDescription>
            Select a workout day from your plan to begin tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plan.weekly_schedule.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedDay === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={selectedDay === index ? "default" : "outline"}>
                    Day {day.day}
                  </Badge>
                  {selectedDay === index && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
                <h4 className="font-semibold mb-1">{day.focus}</h4>
                <p className="text-xs text-muted-foreground">
                  {day.exercises.length} exercises
                </p>
              </button>
            ))}
          </div>

          {selectedDay !== null && (
            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <h4 className="font-semibold mb-3">
                Day {selectedDay + 1}: {plan.weekly_schedule[selectedDay].focus}
              </h4>
              <div className="space-y-2 mb-4">
                {plan.weekly_schedule[selectedDay].exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{ex.name}</span>
                    <span className="text-muted-foreground">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setSessionActive(true)}
                className="w-full bg-gradient-neon"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
