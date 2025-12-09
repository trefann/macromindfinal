import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Search, Dumbbell, Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  instructions: string | null;
  is_custom: boolean;
}

interface ExerciseSelectorProps {
  onSelect: (exercise: { name: string; muscleGroup: string; equipment?: string }) => void;
}

const MUSCLE_GROUPS = [
  "All", "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"
];

const COMMON_EXERCISES = [
  { name: "Bench Press", muscle_group: "Chest", equipment: "Barbell" },
  { name: "Incline Dumbbell Press", muscle_group: "Chest", equipment: "Dumbbells" },
  { name: "Cable Flyes", muscle_group: "Chest", equipment: "Cable Machine" },
  { name: "Push-ups", muscle_group: "Chest", equipment: "Bodyweight" },
  { name: "Deadlift", muscle_group: "Back", equipment: "Barbell" },
  { name: "Pull-ups", muscle_group: "Back", equipment: "Pull-up Bar" },
  { name: "Barbell Rows", muscle_group: "Back", equipment: "Barbell" },
  { name: "Lat Pulldown", muscle_group: "Back", equipment: "Cable Machine" },
  { name: "Seated Cable Row", muscle_group: "Back", equipment: "Cable Machine" },
  { name: "Overhead Press", muscle_group: "Shoulders", equipment: "Barbell" },
  { name: "Lateral Raises", muscle_group: "Shoulders", equipment: "Dumbbells" },
  { name: "Face Pulls", muscle_group: "Shoulders", equipment: "Cable Machine" },
  { name: "Rear Delt Flyes", muscle_group: "Shoulders", equipment: "Dumbbells" },
  { name: "Barbell Curl", muscle_group: "Biceps", equipment: "Barbell" },
  { name: "Hammer Curls", muscle_group: "Biceps", equipment: "Dumbbells" },
  { name: "Preacher Curl", muscle_group: "Biceps", equipment: "EZ Bar" },
  { name: "Tricep Pushdown", muscle_group: "Triceps", equipment: "Cable Machine" },
  { name: "Skull Crushers", muscle_group: "Triceps", equipment: "EZ Bar" },
  { name: "Overhead Tricep Extension", muscle_group: "Triceps", equipment: "Dumbbell" },
  { name: "Squat", muscle_group: "Quadriceps", equipment: "Barbell" },
  { name: "Leg Press", muscle_group: "Quadriceps", equipment: "Machine" },
  { name: "Lunges", muscle_group: "Quadriceps", equipment: "Dumbbells" },
  { name: "Leg Extension", muscle_group: "Quadriceps", equipment: "Machine" },
  { name: "Romanian Deadlift", muscle_group: "Hamstrings", equipment: "Barbell" },
  { name: "Leg Curl", muscle_group: "Hamstrings", equipment: "Machine" },
  { name: "Hip Thrust", muscle_group: "Glutes", equipment: "Barbell" },
  { name: "Glute Bridge", muscle_group: "Glutes", equipment: "Bodyweight" },
  { name: "Calf Raises", muscle_group: "Calves", equipment: "Machine" },
  { name: "Plank", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Cable Crunch", muscle_group: "Core", equipment: "Cable Machine" },
  { name: "Hanging Leg Raise", muscle_group: "Core", equipment: "Pull-up Bar" },
];

export const ExerciseSelector = ({ onSelect }: ExerciseSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;

      // Combine database exercises with common exercises
      const dbExercises = data || [];
      const allExercises = [
        ...dbExercises,
        ...COMMON_EXERCISES.filter(ce => 
          !dbExercises.some(de => de.name.toLowerCase() === ce.name.toLowerCase())
        ).map((ce, i) => ({
          id: `common-${i}`,
          name: ce.name,
          muscle_group: ce.muscle_group,
          equipment: ce.equipment,
          instructions: null,
          is_custom: false,
        }))
      ];

      setExercises(allExercises);
    } catch (error) {
      console.error("Error loading exercises:", error);
      // Fall back to common exercises
      setExercises(COMMON_EXERCISES.map((ce, i) => ({
        id: `common-${i}`,
        name: ce.name,
        muscle_group: ce.muscle_group,
        equipment: ce.equipment,
        instructions: null,
        is_custom: false,
      })));
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === "All" || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    if (!acc[ex.muscle_group]) {
      acc[ex.muscle_group] = [];
    }
    acc[ex.muscle_group].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MUSCLE_GROUPS.map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exercise List */}
      <ScrollArea className="h-[400px] pr-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading exercises...
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No exercises found
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedExercises).map(([muscleGroup, groupExercises]) => (
              <div key={muscleGroup}>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  {muscleGroup}
                </h4>
                <div className="space-y-2">
                  {groupExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => onSelect({
                        name: exercise.name,
                        muscleGroup: exercise.muscle_group,
                        equipment: exercise.equipment || undefined,
                      })}
                      className="w-full p-3 rounded-lg border border-border hover:border-primary/50 
                                 hover:bg-primary/5 transition-all text-left flex items-center 
                                 justify-between group"
                    >
                      <div>
                        <span className="font-medium">{exercise.name}</span>
                        {exercise.equipment && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {exercise.equipment}
                          </Badge>
                        )}
                        {exercise.is_custom && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
