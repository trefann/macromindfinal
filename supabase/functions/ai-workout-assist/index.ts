import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.string().min(1).max(50),
  sets: z.number().min(1).max(20).optional(),
  reps: z.string().max(20).optional(),
  rest: z.number().min(0).max(600).optional(),
});

const requestSchema = z.object({
  mode: z.enum(["optimize", "suggest", "balance", "progression"]),
  goal: z.enum(["strength", "hypertrophy", "endurance", "fat_loss"]).optional(),
  workoutFocus: z.string().max(100).optional(),
  currentExercises: z.array(exerciseSchema).max(20),
  userProfile: z.object({
    fitness_goal: z.string().optional().nullable(),
    experience_level: z.string().optional().nullable(),
    available_equipment: z.array(z.string()).optional().nullable(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validatedData = requestSchema.parse(body);
    const { mode, goal, workoutFocus, currentExercises, userProfile } = validatedData;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = `You are an expert fitness coach and exercise scientist. Provide precise, evidence-based workout recommendations.`;
    let userPrompt = "";

    switch (mode) {
      case "optimize":
        userPrompt = `Optimize the following exercises for ${goal || "hypertrophy"} training:
${JSON.stringify(currentExercises, null, 2)}

User experience: ${userProfile?.experience_level || "intermediate"}

For each exercise, provide optimal:
- sets (number)
- reps (string like "8-12")
- rest (number in seconds)

Respond with JSON only in this exact format:
{
  "optimizations": [
    { "sets": 4, "reps": "8-12", "rest": 90 }
  ]
}`;
        break;

      case "suggest":
        userPrompt = `Suggest 3-4 exercises to complement this ${workoutFocus || "full body"} workout:
${currentExercises.length > 0 ? `Current exercises: ${currentExercises.map(e => e.name).join(", ")}` : "No exercises selected yet."}

User equipment: ${userProfile?.available_equipment?.join(", ") || "full gym"}
User goal: ${userProfile?.fitness_goal || goal || "general fitness"}

Suggest exercises that:
1. Target muscles not already covered
2. Match available equipment
3. Create a balanced workout

Respond with JSON only:
{
  "suggestedExercises": [
    { "name": "Exercise Name", "muscleGroup": "Muscle", "sets": 3, "reps": "10-12", "rest": 60, "equipment": "Equipment", "reason": "Brief reason" }
  ]
}`;
        break;

      case "balance":
        userPrompt = `Analyze the muscle balance of this workout:
${JSON.stringify(currentExercises.map(e => ({ name: e.name, muscle: e.muscleGroup, sets: e.sets })), null, 2)}

Identify:
1. Any muscle groups that are underworked
2. Any muscle imbalances (push vs pull, anterior vs posterior)
3. Volume distribution issues

Respond with JSON only:
{
  "analysis": {
    "warnings": ["Warning messages about imbalances"],
    "recommendations": ["Specific recommendations to fix issues"]
  }
}`;
        break;

      case "progression":
        userPrompt = `Create auto-progression rules for this ${goal || "hypertrophy"} workout:
${JSON.stringify(currentExercises.map(e => e.name), null, 2)}

Based on ${goal || "hypertrophy"} goals, define:
1. Weekly progression approach
2. When to deload
3. How to adjust when hitting plateaus

Respond with JSON only:
{
  "progressionRules": {
    "description": "Brief overview of the progression strategy",
    "weeklyUpdate": "What changes each week",
    "deloadTrigger": "When to take a deload week"
  }
}`;
        break;
    }

    console.log(`AI Workout Assist - Mode: ${mode}, Goal: ${goal}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return fallback based on mode
      switch (mode) {
        case "optimize":
          result = {
            optimizations: currentExercises.map(() => ({
              sets: goal === "strength" ? 5 : goal === "endurance" ? 3 : 4,
              reps: goal === "strength" ? "3-5" : goal === "endurance" ? "15-20" : "8-12",
              rest: goal === "strength" ? 180 : goal === "endurance" ? 45 : 90,
            }))
          };
          break;
        case "suggest":
          result = { suggestedExercises: [] };
          break;
        case "balance":
          result = { analysis: { warnings: [], recommendations: ["Workout looks balanced."] } };
          break;
        case "progression":
          result = {
            progressionRules: {
              description: "Progressive overload approach",
              weeklyUpdate: goal === "strength" ? "Add 2.5kg when completing all reps" : "Add 1 rep per set weekly",
              deloadTrigger: "After 4-6 weeks or when progress stalls",
            }
          };
          break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in ai-workout-assist:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
