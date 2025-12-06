import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const splitSchema = z.object({
  name: z.string().min(1).max(100),
  daysPerWeek: z.number().int().min(1).max(7),
  schedule: z.array(z.string().max(50)).min(1).max(7),
});

const personalizationSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.enum(['male', 'female', 'other']),
  location: z.string().max(100),
  equipment: z.array(z.string().max(50)).max(20),
  timePerSession: z.number().int().min(10).max(180),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  injuries: z.string().max(500).optional().nullable(),
  preferredExercises: z.string().max(500).optional().nullable(),
});

const workoutPlanRequestSchema = z.object({
  goal: z.enum(['fat_loss', 'bulking', 'maingaining', 'strength', 'endurance']),
  split: splitSchema,
  personalization: personalizationSchema,
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
    const validation = workoutPlanRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { goal, split, personalization } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating workout plan for:", { goal, splitName: split.name, personalization });

    const prompt = `Generate a comprehensive ${split.daysPerWeek}-day weekly workout plan with these specifications:

GOAL: ${goal}
WORKOUT SPLIT: ${split.name}
SCHEDULE: ${split.schedule.join(', ')}

USER PROFILE:
- Age: ${personalization.age}
- Gender: ${personalization.gender}
- Training Location: ${personalization.location}
- Available Equipment: ${personalization.equipment.join(', ')}
- Time Per Session: ${personalization.timePerSession} minutes
- Experience Level: ${personalization.experienceLevel}
${personalization.injuries ? `- Injury Restrictions: ${personalization.injuries}` : ''}
${personalization.preferredExercises ? `- Preferred Exercises: ${personalization.preferredExercises}` : ''}

REQUIREMENTS:
1. Create exactly ${split.daysPerWeek} different workout days following the split: ${split.schedule.join(', ')}
2. Each day should have 4-6 exercises appropriate for the focus
3. Include compound movements first, then isolation exercises
4. Adjust volume and intensity based on the ${goal} goal
5. Consider the available equipment: ${personalization.equipment.join(', ')}
6. Respect any injury restrictions mentioned
7. Include any preferred exercises if they fit the day's focus
8. Provide clear instructions for each exercise

Return a JSON object with this EXACT structure:
{
  "name": "${split.name} - ${goal.charAt(0).toUpperCase() + goal.slice(1)} Program",
  "description": "A ${split.daysPerWeek}-day ${split.name} program optimized for ${goal}",
  "duration_minutes": ${personalization.timePerSession},
  "weekly_schedule": [
    {
      "day": 1,
      "focus": "${split.schedule[0]}",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 4,
          "reps": "8-12",
          "rest_seconds": 90,
          "muscle_group": "Target Muscle",
          "instructions": "Brief form cues and tips"
        }
      ]
    }
  ],
  "progression": {
    "week1": "Foundation - Focus on form and moderate weights",
    "week2": "Volume increase - Add 1 set or 2-3 reps per exercise",
    "week3": "Intensity increase - Add 2.5-5kg to main lifts",
    "week4": "Deload - Reduce volume by 40%, focus on recovery"
  }
}

Ensure each day in weekly_schedule follows the corresponding focus from the schedule array.
Include ${split.daysPerWeek} complete workout days with full exercise details.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert strength and conditioning coach with deep knowledge of exercise science, periodization, and program design. Always respond with valid JSON only, no markdown formatting." 
          },
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
    
    console.log("Generated plan content length:", content.length);
    
    const workoutPlan = JSON.parse(content);

    // Save the workout plan to the database
    const { error: insertError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        name: workoutPlan.name,
        description: workoutPlan.description,
        duration_minutes: workoutPlan.duration_minutes,
        exercises: workoutPlan.weekly_schedule,
      });

    if (insertError) {
      console.error("Error saving workout plan:", insertError);
    }

    return new Response(JSON.stringify(workoutPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-workout-plan error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
