-- Add new columns to profiles table for comprehensive settings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS body_fat_percentage numeric,
  ADD COLUMN IF NOT EXISTS dietary_preference text,
  ADD COLUMN IF NOT EXISTS food_dislikes text,
  ADD COLUMN IF NOT EXISTS favorite_foods text,
  ADD COLUMN IF NOT EXISTS allergies text,
  ADD COLUMN IF NOT EXISTS injury_history text,
  ADD COLUMN IF NOT EXISTS workout_location text,
  ADD COLUMN IF NOT EXISTS available_equipment text[],
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS workout_duration_preference integer,
  ADD COLUMN IF NOT EXISTS target_muscle_groups text[],
  ADD COLUMN IF NOT EXISTS water_reminders boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS meal_reminders boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS workout_reminders boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS progress_reminders boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_adaptivity_mode text DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS auto_optimize_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS last_weight_update date;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.dietary_preference IS 'Veg, Non-Veg, Vegan, Eggetarian';
COMMENT ON COLUMN public.profiles.workout_location IS 'Home, Gym, Outdoor';
COMMENT ON COLUMN public.profiles.experience_level IS 'Beginner, Intermediate, Advanced';
COMMENT ON COLUMN public.profiles.ai_adaptivity_mode IS 'Conservative, Balanced, Fast Results';
COMMENT ON COLUMN public.profiles.theme_preference IS 'Light, Dark, System';