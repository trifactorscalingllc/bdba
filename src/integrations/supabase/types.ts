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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          audited_date: string | null
          created_at: string
          payload: Json
          questions_version: number | null
          slug: string
          updated_at: string
          video_id: string
        }
        Insert: {
          audited_date?: string | null
          created_at?: string
          payload: Json
          questions_version?: number | null
          slug: string
          updated_at?: string
          video_id: string
        }
        Update: {
          audited_date?: string | null
          created_at?: string
          payload?: Json
          questions_version?: number | null
          slug?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_slug_video_id_fkey"
            columns: ["slug", "video_id"]
            isOneToOne: true
            referencedRelation: "videos"
            referencedColumns: ["slug", "video_id"]
          },
        ]
      }
      app_errors: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message: string
          route: string | null
          severity: string
          stack: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          route?: string | null
          severity?: string
          stack?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          route?: string | null
          severity?: string
          stack?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      barber_leads: {
        Row: {
          capital_available: string | null
          created_at: string
          cuts_range: string | null
          email: string
          first_name: string
          has_time: string | null
          id: string
          phone_number: string
          qualified: boolean
          revenue_goal: string | null
          situation_text: string | null
        }
        Insert: {
          capital_available?: string | null
          created_at?: string
          cuts_range?: string | null
          email: string
          first_name: string
          has_time?: string | null
          id?: string
          phone_number: string
          qualified?: boolean
          revenue_goal?: string | null
          situation_text?: string | null
        }
        Update: {
          capital_available?: string | null
          created_at?: string
          cuts_range?: string | null
          email?: string
          first_name?: string
          has_time?: string | null
          id?: string
          phone_number?: string
          qualified?: boolean
          revenue_goal?: string | null
          situation_text?: string | null
        }
        Relationships: []
      }
      business_log: {
        Row: {
          created_at: string
          cuts: number
          date: string
          id: string
          new_clients: number
          no_shows: number
          notes: string | null
          returning: number
          revenue: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuts?: number
          date: string
          id?: string
          new_clients?: number
          no_shows?: number
          notes?: string | null
          returning?: number
          revenue?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuts?: number
          date?: string
          id?: string
          new_clients?: number
          no_shows?: number
          notes?: string | null
          returning?: number
          revenue?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_log_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          role: string
          slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          role: string
          slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          role?: string
          slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          display_name: string
          ig_handle: string | null
          location: string | null
          profile_md: string | null
          shop_name: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          ig_handle?: string | null
          location?: string | null
          profile_md?: string | null
          shop_name?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          ig_handle?: string | null
          location?: string | null
          profile_md?: string | null
          shop_name?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          aspect_ratio: string | null
          audit_simple_md: string | null
          audited_date: string | null
          caption: string | null
          caption_cta: string | null
          caption_location: string | null
          comment_count_reported: number | null
          comments: number | null
          cover_captured: boolean
          created_at: string
          format_typicality: string | null
          hashtags: Json | null
          hook_type: string | null
          likes: number | null
          metrics_history: Json
          operator_notes: string | null
          posted_date: string | null
          resolution_px: string | null
          slug: string
          source_url: string | null
          structure_arc: string | null
          thumbnail_url: string | null
          top_comments_sample: Json | null
          updated_at: string
          uploader_id: string | null
          verdict_oneline: string | null
          verdict_tier: string | null
          video_id: string
          views: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          audit_simple_md?: string | null
          audited_date?: string | null
          caption?: string | null
          caption_cta?: string | null
          caption_location?: string | null
          comment_count_reported?: number | null
          comments?: number | null
          cover_captured?: boolean
          created_at?: string
          format_typicality?: string | null
          hashtags?: Json | null
          hook_type?: string | null
          likes?: number | null
          metrics_history?: Json
          operator_notes?: string | null
          posted_date?: string | null
          resolution_px?: string | null
          slug: string
          source_url?: string | null
          structure_arc?: string | null
          thumbnail_url?: string | null
          top_comments_sample?: Json | null
          updated_at?: string
          uploader_id?: string | null
          verdict_oneline?: string | null
          verdict_tier?: string | null
          video_id: string
          views?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          audit_simple_md?: string | null
          audited_date?: string | null
          caption?: string | null
          caption_cta?: string | null
          caption_location?: string | null
          comment_count_reported?: number | null
          comments?: number | null
          cover_captured?: boolean
          created_at?: string
          format_typicality?: string | null
          hashtags?: Json | null
          hook_type?: string | null
          likes?: number | null
          metrics_history?: Json
          operator_notes?: string | null
          posted_date?: string | null
          resolution_px?: string | null
          slug?: string
          source_url?: string | null
          structure_arc?: string | null
          thumbnail_url?: string | null
          top_comments_sample?: Json | null
          updated_at?: string
          uploader_id?: string | null
          verdict_oneline?: string | null
          verdict_tier?: string | null
          video_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_coach: { Args: never; Returns: boolean }
      my_slug: { Args: never; Returns: string }
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
