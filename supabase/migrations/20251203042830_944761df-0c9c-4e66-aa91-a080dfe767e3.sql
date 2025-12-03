-- Add custom_theme_colors column to store custom theme settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_theme_colors JSONB DEFAULT NULL;

-- Example structure: { "background": "0 0% 5%", "foreground": "0 0% 98%", "primary": "180 100% 50%", ... }