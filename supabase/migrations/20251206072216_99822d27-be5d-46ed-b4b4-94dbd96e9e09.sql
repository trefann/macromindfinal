-- Fix: Add fixed search_path to calculate_estimated_1rm function
CREATE OR REPLACE FUNCTION public.calculate_estimated_1rm(weight numeric, reps integer)
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Epley formula: 1RM = weight × (1 + reps/30)
  RETURN ROUND(weight * (1 + reps::NUMERIC / 30), 2);
END;
$function$;