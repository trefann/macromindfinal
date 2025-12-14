import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const splitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  daysPerWeek: z.number().int().min(1).max(7),
  schedule: z.array(z.string().max(50)).min(1).max(7),
  isCustom: z.boolean().optional(),
});

const personalizationSchema = z.object({
  age: z.string().or(z.number()),
  gender: z.enum(['male', 'female', 'other']),
  location: z.string().max(100),
  equipment: z.array(z.string().max(50)).max(20),
  timePerSession: z.string().or(z.number()),
  experienceLevel: z.string(),
  injuries: z.string().max(500).optional().nullable(),
  preferredExercises: z.string().max(500).optional().nullable(),
  trainingDaysPerWeek: z.string().or(z.number()).optional(),
});

const workoutPlanRequestSchema = z.object({
  goal: z.enum(['hypertrophy', 'strength', 'endurance', 'powerbuilding', 'fat-loss']),
  split: splitSchema,
  personalization: personalizationSchema,
});

// Goal-specific programming parameters
const goalParameters: Record<string, { reps: string; rest: number; rpe: string; notes: string }> = {
  hypertrophy: {
    reps: "8-12",
    rest: 90,
    rpe: "7-8",
    notes: "Focus on time under tension and muscle contraction. Control the eccentric.",
  },
  strength: {
    reps: "3-6",
    rest: 180,
    rpe: "8-9",
    notes: "Focus on progressive overload. Rest fully between sets.",
  },
  endurance: {
    reps: "15-20",
    rest: 45,
    rpe: "6-7",
    notes: "Keep rest short. Focus on muscular endurance and conditioning.",
  },
  powerbuilding: {
    reps: "varies",
    rest: 120,
    rpe: "7-9",
    notes: "Heavy compounds early (3-6 reps), accessory work higher reps (8-12).",
  },
  "fat-loss": {
    reps: "12-15",
    rest: 60,
    rpe: "7-8",
    notes: "Higher density training. Consider supersets and circuits.",
  },
};

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
    console.log("Received request body:", JSON.stringify(rawBody));

    const validation = workoutPlanRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return new Response(JSON.stringify({ error: "Invalid request format", details: validation.error.errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { goal, split, personalization } = validation.data;
    const goalParams = goalParameters[goal];
    const age = typeof personalization.age === 'string' ? parseInt(personalization.age) : personalization.age;
    const timePerSession = typeof personalization.timePerSession === 'string' 
      ? parseInt(personalization.timePerSession) 
      : personalization.timePerSession;
    const trainingDays = personalization.trainingDaysPerWeek 
      ? (typeof personalization.trainingDaysPerWeek === 'string' ? parseInt(personalization.trainingDaysPerWeek) : personalization.trainingDaysPerWeek)
      : split.daysPerWeek;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating workout plan for:", { goal, splitName: split.name, trainingDays });

    const prompt = `Generate a comprehensive ${trainingDays}-day weekly workout program with evidence-based programming.

TRAINING GOAL: ${goal.toUpperCase()}
Programming Guidelines for ${goal}:
- Target rep range: ${goalParams.reps}
- Rest between sets: ${goalParams.rest} seconds
- Target RPE: ${goalParams.rpe}
- Key focus: ${goalParams.notes}

WORKOUT SPLIT: ${split.name}
SCHEDULE PATTERN: ${split.schedule.slice(0, trainingDays).join(', ')}

USER PROFILE:
- Age: ${age}
- Gender: ${personalization.gender}
- Training Location: ${personalization.location}
- Available Equipment: ${personalization.equipment.join(', ')}
- Time Per Session: ${timePerSession} minutes
- Experience Level: ${personalization.experienceLevel}
${personalization.injuries ? `- Injury Restrictions: ${personalization.injuries}` : ''}
${personalization.preferredExercises ? `- Preferred Exercises: ${personalization.preferredExercises}` : ''}

PROGRAMMING REQUIREMENTS:
1. Create exactly ${trainingDays} workout days following the split pattern
2. Each day should have 4-6 exercises appropriate for the focus
3. Include compound movements first, then isolation exercises
4. Apply ${goal} specific rep ranges and rest periods
5. Include target RPE for each exercise
6. Consider the available equipment: ${personalization.equipment.join(', ')}
7. Respect any injury restrictions mentioned
8. Include preferred exercises if they fit the day's focus

${goal === 'powerbuilding' ? `
POWERBUILDING PERIODIZATION:
- Day 1-2: Heavy strength focus (3-5 reps, RPE 8-9)
- Day 3-4: Hypertrophy focus (8-12 reps, RPE 7-8)
- Day 5+: Mix of both with volume work
` : ''}

${goal === 'fat-loss' ? `
FAT LOSS TRAINING STRUCTURE:
- Include supersets where possible
- Minimize rest between exercises
- Add metabolic finishers (optional)
- Focus on compound movements for calorie burn
` : ''}

Return a JSON object with this EXACT structure (no markdown, just JSON):
{
  "name": "${split.name} - ${goal.charAt(0).toUpperCase() + goal.slice(1)} Program",
  "description": "A ${trainingDays}-day ${split.name} program optimized for ${goal}",
  "duration_minutes": ${timePerSession},
  "goal": "${goal}",
  "weekly_schedule": [
    {
      "day": 1,
      "focus": "${split.schedule[0]}",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 4,
          "reps": "${goalParams.reps}",
          "rest_seconds": ${goalParams.rest},
          "target_rpe": "${goalParams.rpe}",
          "muscle_group": "Target Muscle",
          "instructions": "Brief form cues"
        }
      ]
    }
  ],
  "progression": {
    "week1": "Foundation phase",
    "week2": "Volume increase",
    "week3": "Intensity increase",
    "week4": "Deload week"
  },
  "adaptation_rules": {
    "low_rpe": "If average RPE < 6 for 2+ sessions: increase weight by 2.5-5kg",
    "high_rpe": "If average RPE > 9 for 2+ sessions: reduce volume by 20%",
    "missed_workouts": "If 2+ workouts missed: reduce frequency temporarily"
  }
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
          { 
            role: "system", 
            content: "You are an expert strength and conditioning coach with deep knowledge of exercise science, periodization, and evidence-based program design. Always respond with valid JSON only, no markdown code fences." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
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
    
    let workoutPlan = JSON.parse(content);

    // Validate and normalize the workout plan structure
    if (!workoutPlan.weekly_schedule || !Array.isArray(workoutPlan.weekly_schedule)) {
      console.error("Invalid weekly_schedule structure:", typeof workoutPlan.weekly_schedule);
      throw new Error("AI returned invalid plan structure");
    }

    // Ensure each day's exercises is an array with proper structure
    workoutPlan.weekly_schedule = workoutPlan.weekly_schedule.map((day: any, index: number) => {
      let exercises = day.exercises;
      
      // If exercises is an object (keyed by name), convert to array
      if (exercises && typeof exercises === 'object' && !Array.isArray(exercises)) {
        console.log("Converting object exercises to array for day:", day.focus);
        exercises = Object.entries(exercises)
          .filter(([key]) => key !== 'generalNotes' && key !== 'notes')
          .map(([name, details]: [string, any]) => ({
            name,
            sets: details?.sets || 3,
            reps: details?.reps || goalParams.reps,
            rest_seconds: details?.rest_seconds || details?.rest || goalParams.rest,
            target_rpe: details?.target_rpe || details?.rpe || goalParams.rpe,
            muscle_group: details?.muscle_group || details?.muscleGroup || day.focus,
            instructions: details?.instructions || "",
          }));
      }
      
      // Ensure exercises is an array
      if (!Array.isArray(exercises)) {
        exercises = [];
      }

      return {
        day: day.day || index + 1,
        focus: day.focus || split.schedule[index] || `Day ${index + 1}`,
        exercises: exercises.map((ex: any) => ({
          name: String(ex.name || "Unknown Exercise"),
          sets: Number(ex.sets) || 3,
          reps: String(ex.reps || goalParams.reps),
          rest_seconds: Number(ex.rest_seconds || ex.rest) || goalParams.rest,
          target_rpe: String(ex.target_rpe || ex.rpe || goalParams.rpe),
          muscle_group: String(ex.muscle_group || ex.muscleGroup || "General"),
          instructions: String(ex.instructions || ""),
        })),
      };
    });

    // Add goal to the plan
    workoutPlan.goal = goal;

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
