import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const dietPlanRequestSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_health']),
  medicalConditions: z.string().max(500).optional().nullable(),
  cuisinePreference: z.string().max(200).optional().nullable(),
  planDuration: z.number().int().min(1).max(30).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input
    const rawBody = await req.json();
    const validation = dietPlanRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { age, gender, height, weight, activityLevel, goal, medicalConditions, cuisinePreference } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Generate a personalized meal plan for a single day for:
    - Age: ${age}
    - Gender: ${gender}
    - Height: ${height}cm
    - Weight: ${weight}kg
    - Activity Level: ${activityLevel}
    - Goal: ${goal}
    - Medical Conditions: ${medicalConditions || 'none'}
    - Cuisine Preference: ${cuisinePreference || 'varied'}
    
    Create a complete day of meals including Breakfast, Lunch, Dinner, and optionally healthy Snacks.
    Each meal should have specific food items with proper portion sizes.
    
    Return ONLY a JSON object with this exact structure (no markdown, no extra text):
    {
      "meals": [
        {
          "name": "Breakfast",
          "time": "8:00 AM",
          "items": ["2 scrambled eggs", "1 slice whole wheat toast", "1/2 avocado", "1 cup black coffee"],
          "calories": 450,
          "protein": 25,
          "carbs": 30,
          "fats": 22
        },
        {
          "name": "Lunch",
          "time": "1:00 PM",
          "items": ["150g grilled chicken breast", "1 cup brown rice", "Mixed green salad", "Olive oil dressing"],
          "calories": 550,
          "protein": 45,
          "carbs": 50,
          "fats": 15
        },
        {
          "name": "Dinner",
          "time": "7:00 PM",
          "items": ["200g salmon fillet", "Steamed broccoli", "Sweet potato"],
          "calories": 500,
          "protein": 40,
          "carbs": 45,
          "fats": 18
        }
      ],
      "total_calories": 1500,
      "total_protein": 110,
      "total_carbs": 125,
      "total_fats": 55
    }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a nutrition expert. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const mealPlan = JSON.parse(content);

    const { error: insertError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        meals: mealPlan.meals,
        total_calories: mealPlan.total_calories,
        total_protein: mealPlan.total_protein,
        total_carbs: mealPlan.total_carbs,
        total_fats: mealPlan.total_fats,
      });

    if (insertError) {
      console.error("Error saving meal plan:", insertError);
    }

    return new Response(JSON.stringify(mealPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-diet-plan error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
