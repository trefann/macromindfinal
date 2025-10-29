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
    const { age, gender, fitnessGoal, equipment, daysPerWeek } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Generate a personalized ${daysPerWeek}-day workout plan for:
    - Age: ${age}
    - Gender: ${gender}
    - Fitness Goal: ${fitnessGoal}
    - Equipment Available: ${equipment}
    - Days per Week: ${daysPerWeek}
    
    Return a JSON object with this exact structure:
    {
      "name": "Full Body Workout",
      "description": "A balanced routine targeting all major muscle groups",
      "duration_minutes": 45,
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": 12,
          "muscle_group": "Chest, Triceps",
          "rest_seconds": 60,
          "instructions": "Brief form tips"
        }
      ]
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
          { role: "system", content: "You are a fitness expert. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate workout plan");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const workoutPlan = JSON.parse(content);

    const { error: insertError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        name: workoutPlan.name,
        description: workoutPlan.description,
        duration_minutes: workoutPlan.duration_minutes,
        exercises: workoutPlan.exercises,
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify(workoutPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-workout-plan error:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});