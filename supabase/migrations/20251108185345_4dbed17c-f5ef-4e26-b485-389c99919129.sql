-- Create foods table (global food database)
CREATE TABLE public.foods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  brand text,
  serving_size text NOT NULL,
  calories integer NOT NULL,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fats numeric NOT NULL DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create custom_foods table (user-created foods)
CREATE TABLE public.custom_foods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  brand text,
  serving_size text NOT NULL,
  calories integer NOT NULL,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fats numeric NOT NULL DEFAULT 0,
  ingredients text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create meal_logs table (user meal entries)
CREATE TABLE public.meal_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  food_id uuid,
  custom_food_id uuid,
  meal_type text NOT NULL,
  servings numeric NOT NULL DEFAULT 1,
  calories integer NOT NULL,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fats numeric NOT NULL DEFAULT 0,
  logged_at timestamp with time zone DEFAULT now(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text
);

-- Enable RLS on foods (public read, admin write)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Foods are viewable by everyone"
ON public.foods
FOR SELECT
USING (true);

-- Enable RLS on custom_foods
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom foods"
ON public.custom_foods
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom foods"
ON public.custom_foods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods"
ON public.custom_foods
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods"
ON public.custom_foods
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on meal_logs
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal logs"
ON public.meal_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal logs"
ON public.meal_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
ON public.meal_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
ON public.meal_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_custom_foods_user_id ON public.custom_foods(user_id);
CREATE INDEX idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX idx_meal_logs_date ON public.meal_logs(date);
CREATE INDEX idx_foods_name ON public.foods(name);

-- Seed some common foods
INSERT INTO public.foods (name, brand, serving_size, calories, protein, carbs, fats, is_verified) VALUES
  ('Chicken Breast', 'Generic', '100g', 165, 31, 0, 3.6, true),
  ('Brown Rice', 'Generic', '100g cooked', 112, 2.6, 24, 0.9, true),
  ('Broccoli', 'Generic', '100g', 34, 2.8, 7, 0.4, true),
  ('Eggs', 'Generic', '1 large', 72, 6.3, 0.4, 4.8, true),
  ('Salmon', 'Generic', '100g', 208, 20, 0, 13, true),
  ('Sweet Potato', 'Generic', '100g', 86, 1.6, 20, 0.1, true),
  ('Oatmeal', 'Generic', '100g dry', 389, 16.9, 66, 6.9, true),
  ('Banana', 'Generic', '1 medium', 105, 1.3, 27, 0.4, true),
  ('Almonds', 'Generic', '28g (1oz)', 164, 6, 6, 14, true),
  ('Greek Yogurt', 'Generic', '100g plain', 59, 10, 3.6, 0.4, true),
  ('Whole Milk', 'Generic', '1 cup (244ml)', 149, 7.7, 11.7, 7.9, true),
  ('Whey Protein', 'Generic', '1 scoop (30g)', 120, 24, 3, 1.5, true),
  ('Peanut Butter', 'Generic', '2 tbsp (32g)', 188, 8, 7, 16, true),
  ('White Bread', 'Generic', '1 slice', 79, 2.7, 15, 1, true),
  ('Apple', 'Generic', '1 medium', 95, 0.5, 25, 0.3, true);