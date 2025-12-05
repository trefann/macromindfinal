import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { FitnessGoal } from "./GoalSelection";
import { WorkoutSplit } from "./SplitSelection";

export interface PersonalizationData {
  location: string;
  equipment: string[];
  timePerSession: string;
  experienceLevel: string;
  injuries: string;
  preferredExercises: string;
  age: string;
  gender: string;
}

interface PersonalizationFormProps {
  goal: FitnessGoal;
  split: WorkoutSplit;
  onSubmit: (data: PersonalizationData) => void;
  onBack: () => void;
  loading: boolean;
}

const equipmentOptions = [
  { id: "barbell", label: "Barbell" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "cables", label: "Cable Machine" },
  { id: "machines", label: "Weight Machines" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "pullup-bar", label: "Pull-up Bar" },
  { id: "resistance-bands", label: "Resistance Bands" },
  { id: "bench", label: "Bench" },
  { id: "squat-rack", label: "Squat Rack" },
  { id: "cardio", label: "Cardio Equipment" },
];

export const PersonalizationForm = ({ goal, split, onSubmit, onBack, loading }: PersonalizationFormProps) => {
  const [formData, setFormData] = useState<PersonalizationData>({
    location: "",
    equipment: [],
    timePerSession: "",
    experienceLevel: "",
    injuries: "",
    preferredExercises: "",
    age: "",
    gender: "",
  });

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, equipmentId]
        : prev.equipment.filter(e => e !== equipmentId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.location && formData.equipment.length > 0 && 
                      formData.timePerSession && formData.experienceLevel &&
                      formData.age && formData.gender;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle className="text-2xl">Personalize Your Plan</CardTitle>
        <CardDescription>
          Tell us about yourself to create the perfect {split.name} program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Training Location *</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Where do you train?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Commercial Gym</SelectItem>
                  <SelectItem value="home-gym">Home Gym</SelectItem>
                  <SelectItem value="home-minimal">Home (Minimal Equipment)</SelectItem>
                  <SelectItem value="outdoors">Outdoors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time Per Session *</Label>
              <Select 
                value={formData.timePerSession} 
                onValueChange={(value) => setFormData({ ...formData, timePerSession: value })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="How long can you train?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="75">75 minutes</SelectItem>
                  <SelectItem value="90">90+ minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level *</Label>
              <Select 
                value={formData.experienceLevel} 
                onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Your lifting experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Equipment Available *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {equipmentOptions.map((equipment) => (
                <div key={equipment.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment.id}
                    checked={formData.equipment.includes(equipment.id)}
                    onCheckedChange={(checked) => handleEquipmentChange(equipment.id, checked as boolean)}
                  />
                  <label
                    htmlFor={equipment.id}
                    className="text-sm cursor-pointer"
                  >
                    {equipment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="injuries">Injury Restrictions (optional)</Label>
            <Textarea
              id="injuries"
              placeholder="Any injuries or areas to avoid? E.g., lower back issues, shoulder injury..."
              value={formData.injuries}
              onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
              className="bg-muted/50 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred">Preferred Exercises (optional)</Label>
            <Textarea
              id="preferred"
              placeholder="Any exercises you love or want to include? E.g., deadlifts, pull-ups..."
              value={formData.preferredExercises}
              onChange={(e) => setFormData({ ...formData, preferredExercises: e.target.value })}
              className="bg-muted/50 min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full bg-gradient-neon hover:opacity-90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Personalized Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
