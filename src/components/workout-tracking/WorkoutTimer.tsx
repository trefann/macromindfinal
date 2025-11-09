import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

interface WorkoutTimerProps {
  onComplete?: () => void;
}

export const WorkoutTimer = ({ onComplete }: WorkoutTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer !== null && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setRestTimer(null);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer, restSeconds, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRest = (duration: number) => {
    setRestTimer(duration);
    setRestSeconds(duration);
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              <span className="font-semibold">Workout Timer</span>
            </div>
            <div className="text-3xl font-bold text-primary">{formatTime(seconds)}</div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "secondary" : "default"}
              className="flex-1"
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={() => {
                setSeconds(0);
                setIsRunning(false);
              }}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {restTimer === null ? (
        <Card className="glass-card border-secondary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Start rest timer:</p>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((duration) => (
                <Button
                  key={duration}
                  onClick={() => startRest(duration)}
                  variant="outline"
                  size="sm"
                >
                  {duration}s
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-accent/20 animate-pulse">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Rest Time</p>
            <p className="text-4xl font-bold text-accent">{formatTime(restSeconds)}</p>
            <Button
              onClick={() => setRestTimer(null)}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              Skip Rest
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};