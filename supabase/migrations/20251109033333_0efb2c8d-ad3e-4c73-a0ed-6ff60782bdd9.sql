-- Create workout tracking tables for comprehensive workout management

-- Table for exercise library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  instructions TEXT,
  is_custom BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for tracking individual sets during workouts
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id),
  exercise_name TEXT NOT NULL,
  weight_kg NUMERIC DEFAULT 0,
  reps INTEGER NOT NULL,
  rpe NUMERIC CHECK (rpe >= 1 AND rpe <= 10),
  is_warmup BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  workout_session_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for personal records
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id),
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL, -- '1RM', 'max_reps', 'max_volume'
  value NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- Table for workout streaks and achievements
CREATE TABLE IF NOT EXISTS public.workout_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  total_workouts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Users can view all exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Users can create custom exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their custom exercises" ON public.exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their custom exercises" ON public.exercises FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_sets
CREATE POLICY "Users can view their own sets" ON public.workout_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sets" ON public.workout_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sets" ON public.workout_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sets" ON public.workout_sets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for personal_records
CREATE POLICY "Users can view their own PRs" ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own PRs" ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PRs" ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own PRs" ON public.personal_records FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_streaks
CREATE POLICY "Users can view their own streaks" ON public.workout_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own streaks" ON public.workout_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.workout_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Seed common exercises
INSERT INTO public.exercises (name, muscle_group, equipment, instructions, is_custom) VALUES
  ('Barbell Bench Press', 'Chest', 'Barbell', 'Lie on bench, lower bar to chest, press up', false),
  ('Barbell Squat', 'Legs', 'Barbell', 'Bar on shoulders, squat down, drive through heels', false),
  ('Barbell Deadlift', 'Back', 'Barbell', 'Bend at hips, grip bar, stand up fully', false),
  ('Barbell Row', 'Back', 'Barbell', 'Bent over, row bar to lower chest', false),
  ('Overhead Press', 'Shoulders', 'Barbell', 'Press bar overhead from shoulders', false),
  ('Pull-ups', 'Back', 'Bodyweight', 'Hang from bar, pull chin over bar', false),
  ('Dumbbell Curl', 'Arms', 'Dumbbells', 'Curl dumbbells to shoulders', false),
  ('Tricep Dips', 'Arms', 'Bodyweight', 'Lower body between bars, push up', false),
  ('Leg Press', 'Legs', 'Machine', 'Push platform away with legs', false),
  ('Lat Pulldown', 'Back', 'Machine', 'Pull bar down to chest', false);

-- Function to calculate estimated 1RM
CREATE OR REPLACE FUNCTION calculate_estimated_1rm(weight NUMERIC, reps INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  -- Epley formula: 1RM = weight × (1 + reps/30)
  RETURN ROUND(weight * (1 + reps::NUMERIC / 30), 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streaks
CREATE OR REPLACE FUNCTION update_workout_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Get or create streak record
  INSERT INTO public.workout_streaks (user_id, current_streak, longest_streak, last_workout_date, total_workouts)
  VALUES (NEW.user_id, 0, 0, current_date, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT last_workout_date INTO last_date
  FROM public.workout_streaks
  WHERE user_id = NEW.user_id;
  
  -- Update streak logic
  IF last_date IS NULL OR last_date < current_date THEN
    IF last_date = current_date - INTERVAL '1 day' THEN
      -- Continue streak
      UPDATE public.workout_streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_workout_date = current_date,
          total_workouts = total_workouts + 1
      WHERE user_id = NEW.user_id;
    ELSIF last_date IS NULL OR last_date < current_date - INTERVAL '1 day' THEN
      -- Reset streak
      UPDATE public.workout_streaks
      SET current_streak = 1,
          last_workout_date = current_date,
          total_workouts = total_workouts + 1
      WHERE user_id = NEW.user_id;
    ELSE
      -- Same day workout
      UPDATE public.workout_streaks
      SET last_workout_date = current_date
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workout_set_completed
  AFTER INSERT ON public.workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_streak();