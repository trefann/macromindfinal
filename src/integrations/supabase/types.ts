export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_foods: {
        Row: {
          brand: string | null
          calories: number
          carbs: number
          created_at: string | null
          fats: number
          id: string
          ingredients: string | null
          name: string
          protein: number
          serving_size: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          calories: number
          carbs?: number
          created_at?: string | null
          fats?: number
          id?: string
          ingredients?: string | null
          name: string
          protein?: number
          serving_size: string
          user_id: string
        }
        Update: {
          brand?: string | null
          calories?: number
          carbs?: number
          created_at?: string | null
          fats?: number
          id?: string
          ingredients?: string | null
          name?: string
          protein?: number
          serving_size?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_nutrition: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          date: string
          fats: number | null
          id: string
          protein: number | null
          user_id: string
          water_ml: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          date?: string
          fats?: number | null
          id?: string
          protein?: number | null
          user_id: string
          water_ml?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          date?: string
          fats?: number | null
          id?: string
          protein?: number | null
          user_id?: string
          water_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_nutrition_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          equipment: string | null
          id: string
          instructions: string | null
          is_custom: boolean | null
          muscle_group: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          muscle_group: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          muscle_group?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      foods: {
        Row: {
          brand: string | null
          calories: number
          carbs: number
          created_at: string | null
          fats: number
          id: string
          is_verified: boolean | null
          name: string
          protein: number
          serving_size: string
        }
        Insert: {
          brand?: string | null
          calories: number
          carbs?: number
          created_at?: string | null
          fats?: number
          id?: string
          is_verified?: boolean | null
          name: string
          protein?: number
          serving_size: string
        }
        Update: {
          brand?: string | null
          calories?: number
          carbs?: number
          created_at?: string | null
          fats?: number
          id?: string
          is_verified?: boolean | null
          name?: string
          protein?: number
          serving_size?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number
          carbs: number
          custom_food_id: string | null
          date: string
          fats: number
          food_id: string | null
          id: string
          logged_at: string | null
          meal_type: string
          notes: string | null
          protein: number
          servings: number
          user_id: string
        }
        Insert: {
          calories: number
          carbs?: number
          custom_food_id?: string | null
          date?: string
          fats?: number
          food_id?: string | null
          id?: string
          logged_at?: string | null
          meal_type: string
          notes?: string | null
          protein?: number
          servings?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          custom_food_id?: string | null
          date?: string
          fats?: number
          food_id?: string | null
          id?: string
          logged_at?: string | null
          meal_type?: string
          notes?: string | null
          protein?: number
          servings?: number
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string | null
          date: string
          id: string
          meals: Json
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_protein: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          meals: Json
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          meals?: Json
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          created_at: string | null
          date: string | null
          exercise_id: string | null
          exercise_name: string
          id: string
          record_type: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          exercise_id?: string | null
          exercise_name: string
          id?: string
          record_type: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string | null
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          record_type?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          ai_adaptivity_mode: string | null
          allergies: string | null
          auto_optimize_enabled: boolean | null
          available_equipment: string[] | null
          body_fat_percentage: number | null
          created_at: string | null
          custom_theme_colors: Json | null
          dietary_preference: string | null
          experience_level: string | null
          favorite_foods: string | null
          fitness_goal: string | null
          food_dislikes: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          injury_history: string | null
          last_weight_update: string | null
          meal_reminders: boolean | null
          medical_conditions: string | null
          preferred_cuisine: string | null
          progress_reminders: boolean | null
          push_notifications: boolean | null
          target_muscle_groups: string[] | null
          theme_preference: string | null
          updated_at: string | null
          water_reminders: boolean | null
          weight_kg: number | null
          workout_duration_preference: number | null
          workout_location: string | null
          workout_reminders: boolean | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          ai_adaptivity_mode?: string | null
          allergies?: string | null
          auto_optimize_enabled?: boolean | null
          available_equipment?: string[] | null
          body_fat_percentage?: number | null
          created_at?: string | null
          custom_theme_colors?: Json | null
          dietary_preference?: string | null
          experience_level?: string | null
          favorite_foods?: string | null
          fitness_goal?: string | null
          food_dislikes?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          injury_history?: string | null
          last_weight_update?: string | null
          meal_reminders?: boolean | null
          medical_conditions?: string | null
          preferred_cuisine?: string | null
          progress_reminders?: boolean | null
          push_notifications?: boolean | null
          target_muscle_groups?: string[] | null
          theme_preference?: string | null
          updated_at?: string | null
          water_reminders?: boolean | null
          weight_kg?: number | null
          workout_duration_preference?: number | null
          workout_location?: string | null
          workout_reminders?: boolean | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          ai_adaptivity_mode?: string | null
          allergies?: string | null
          auto_optimize_enabled?: boolean | null
          available_equipment?: string[] | null
          body_fat_percentage?: number | null
          created_at?: string | null
          custom_theme_colors?: Json | null
          dietary_preference?: string | null
          experience_level?: string | null
          favorite_foods?: string | null
          fitness_goal?: string | null
          food_dislikes?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injury_history?: string | null
          last_weight_update?: string | null
          meal_reminders?: boolean | null
          medical_conditions?: string | null
          preferred_cuisine?: string | null
          progress_reminders?: boolean | null
          push_notifications?: boolean | null
          target_muscle_groups?: string[] | null
          theme_preference?: string | null
          updated_at?: string | null
          water_reminders?: boolean | null
          weight_kg?: number | null
          workout_duration_preference?: number | null
          workout_location?: string | null
          workout_reminders?: boolean | null
        }
        Relationships: []
      }
      progress_measurements: {
        Row: {
          arms_cm: number | null
          body_fat_percentage: number | null
          chest_cm: number | null
          created_at: string | null
          date: string
          id: string
          legs_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arms_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          created_at?: string | null
          date?: string
          id?: string
          legs_cm?: number | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arms_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          created_at?: string | null
          date?: string
          id?: string
          legs_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          exercises: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          exercises: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          exercises_completed: Json | null
          id: string
          notes: string | null
          user_id: string
          workout_plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          user_id: string
          workout_plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed_at: string | null
          created_at: string | null
          exercise_id: string | null
          exercise_name: string
          id: string
          is_warmup: boolean | null
          notes: string | null
          reps: number
          rpe: number | null
          user_id: string
          weight_kg: number | null
          workout_session_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          exercise_id?: string | null
          exercise_name: string
          id?: string
          is_warmup?: boolean | null
          notes?: string | null
          reps: number
          rpe?: number | null
          user_id: string
          weight_kg?: number | null
          workout_session_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number
          rpe?: number | null
          user_id?: string
          weight_kg?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_workout_date: string | null
          longest_streak: number | null
          total_workouts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_workout_date?: string | null
          longest_streak?: number | null
          total_workouts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_workout_date?: string | null
          longest_streak?: number | null
          total_workouts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_estimated_1rm: {
        Args: { reps: number; weight: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
