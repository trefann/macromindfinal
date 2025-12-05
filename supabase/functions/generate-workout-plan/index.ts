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
    const { 
      goal, 
      split, 
      personalization 
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating workout plan for:", { goal, splitName: split?.name, personalization });

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate workout plan");
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
      // Don't throw here, still return the plan to the user
    }

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
