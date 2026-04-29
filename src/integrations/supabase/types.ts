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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          diet_preferences: string[]
          energy: string
          id: string
          kitchen_input: string | null
          mind: string
          raw: Json | null
          sleep: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          diet_preferences?: string[]
          energy: string
          id?: string
          kitchen_input?: string | null
          mind: string
          raw?: Json | null
          sleep: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          diet_preferences?: string[]
          energy?: string
          id?: string
          kitchen_input?: string | null
          mind?: string
          raw?: Json | null
          sleep?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_calendar_events: {
        Row: {
          created_at: string
          end_time: string
          event_type: string
          google_event_id: string
          id: string
          raw: Json | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          event_type?: string
          google_event_id: string
          id?: string
          raw?: Json | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          event_type?: string
          google_event_id?: string
          id?: string
          raw?: Json | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          google_email: string | null
          id: string
          provider: string
          refresh_token: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          google_email?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          google_email?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_prefs: {
        Row: {
          breathe_enabled: boolean
          created_at: string
          hydration_enabled: boolean
          id: string
          native_push_enabled: boolean
          push_token: string | null
          stretch_enabled: boolean
          updated_at: string
          user_id: string
          walk_enabled: boolean
          web_push_enabled: boolean
        }
        Insert: {
          breathe_enabled?: boolean
          created_at?: string
          hydration_enabled?: boolean
          id?: string
          native_push_enabled?: boolean
          push_token?: string | null
          stretch_enabled?: boolean
          updated_at?: string
          user_id: string
          walk_enabled?: boolean
          web_push_enabled?: boolean
        }
        Update: {
          breathe_enabled?: boolean
          created_at?: string
          hydration_enabled?: boolean
          id?: string
          native_push_enabled?: boolean
          push_token?: string | null
          stretch_enabled?: boolean
          updated_at?: string
          user_id?: string
          walk_enabled?: boolean
          web_push_enabled?: boolean
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          created_at: string
          dietary_preference: string | null
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          language: string | null
          name: string | null
          raw_profile: Json | null
          sleep_hours: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
          work_schedule: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          created_at?: string
          dietary_preference?: string | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          language?: string | null
          name?: string | null
          raw_profile?: Json | null
          sleep_hours?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          work_schedule?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          created_at?: string
          dietary_preference?: string | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          language?: string | null
          name?: string | null
          raw_profile?: Json | null
          sleep_hours?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          work_schedule?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
