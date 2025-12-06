-- Fix 1: Add fixed search_path to update_workout_streak function
CREATE OR REPLACE FUNCTION public.update_workout_streak()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Fix 2: Update exercises SELECT policy to protect custom exercises
DROP POLICY IF EXISTS "Users can view all exercises" ON public.exercises;

CREATE POLICY "Users can view exercises" 
ON public.exercises 
FOR SELECT 
USING (is_custom = false OR auth.uid() = user_id);