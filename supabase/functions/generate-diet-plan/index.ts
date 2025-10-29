import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { age, gender, height, weight, activityLevel, goal, medicalConditions, cuisinePreference, planDuration } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
      throw new Error("Failed to generate diet plan");
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

    if (insertError) throw insertError;

    return new Response(JSON.stringify(mealPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-diet-plan error:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});