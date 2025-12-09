import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomExercise } from "./CustomWorkoutBuilder";
import { 
  ChevronUp, ChevronDown, Trash2, GripVertical, 
  Clock, RotateCcw, Settings2
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomExerciseCardProps {
  exercise: CustomExercise;
  index: number;
  totalExercises: number;
  onUpdate: (updates: Partial<CustomExercise>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const REST_OPTIONS = [30, 45, 60, 90, 120, 180, 240];
const TEMPO_OPTIONS = ["2-0-2-0", "3-1-2-0", "4-0-1-0", "2-1-2-1", "3-0-3-0"];

export const CustomExerciseCard = ({
  exercise,
  index,
  totalExercises,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: CustomExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle & Order */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{index + 1}</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="font-semibold truncate">{exercise.name}</h4>
                <Badge variant="outline" className="shrink-0">
                  {exercise.muscleGroup}
                </Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onMoveUp}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onMoveDown}
                  disabled={index === totalExercises - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Edit Row */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div>
                <Label className="text-xs text-muted-foreground">Sets</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={exercise.sets}
                  onChange={(e) => onUpdate({ sets: parseInt(e.target.value) || 1 })}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reps</Label>
                <Input
                  value={exercise.reps}
                  onChange={(e) => onUpdate({ reps: e.target.value })}
                  placeholder="8-12"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Rest</Label>
                <Select
                  value={exercise.restSeconds.toString()}
                  onValueChange={(v) => onUpdate({ restSeconds: parseInt(v) })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REST_OPTIONS.map(rest => (
                      <SelectItem key={rest} value={rest.toString()}>
                        {rest}s
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expandable Advanced Options */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full gap-2 text-xs">
                  <Settings2 className="w-3 h-3" />
                  {isExpanded ? "Hide" : "Show"} Advanced Options
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tempo</Label>
                    <Select
                      value={exercise.tempo || ""}
                      onValueChange={(v) => onUpdate({ tempo: v || undefined })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {TEMPO_OPTIONS.map(tempo => (
                          <SelectItem key={tempo} value={tempo}>
                            {tempo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Eccentric-Pause-Concentric-Pause
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Equipment</Label>
                    <Input
                      value={exercise.equipment || ""}
                      onChange={(e) => onUpdate({ equipment: e.target.value || undefined })}
                      placeholder="e.g., Barbell"
                      className="h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea
                    value={exercise.notes || ""}
                    onChange={(e) => onUpdate({ notes: e.target.value || undefined })}
                    placeholder="Form cues, tips, etc."
                    className="min-h-[60px] resize-none"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
