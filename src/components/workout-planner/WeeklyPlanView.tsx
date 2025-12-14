import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, Clock, ChevronRight } from "lucide-react";
import { WorkoutPlan } from "./WorkoutPlanDisplay";

interface WeeklyPlanViewProps {
  plan: WorkoutPlan;
  onStartWorkout: (dayIndex: number) => void;
}

export const WeeklyPlanView = ({ plan, onStartWorkout }: WeeklyPlanViewProps) => {
  const schedule = Array.isArray(plan.weekly_schedule) ? plan.weekly_schedule : [];
  
  const dayOfWeek = new Date().getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {dayNames.map((name, i) => (
            <div
              key={i}
              className={`text-center py-2 rounded-lg text-sm font-medium ${
                i === dayOfWeek ? "bg-primary text-primary-foreground" : "bg-muted/50"
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {schedule.map((day, index) => {
            const exercises = Array.isArray(day.exercises) ? day.exercises : [];
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{day.day}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{day.focus}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {exercises.length} exercises
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{plan.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex gap-1">
                    {exercises.slice(0, 3).map((ex: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {typeof ex === 'object' ? ex.muscle_group : 'Exercise'}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onStartWorkout(index)}
                    className="bg-gradient-neon opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Start <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
