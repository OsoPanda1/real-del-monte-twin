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
      ai_interaction_log: {
        Row: {
          agents_invoked: Json | null
          channel: string
          created_at: string
          cultural_corrections: Json | null
          emotion: string | null
          fallback_used: boolean
          id: string
          intent: string | null
          latency_ms: number
          prompt: string
          response: string
          session_id: string | null
          source_model: string
          status: string
          user_id: string | null
        }
        Insert: {
          agents_invoked?: Json | null
          channel?: string
          created_at?: string
          cultural_corrections?: Json | null
          emotion?: string | null
          fallback_used?: boolean
          id?: string
          intent?: string | null
          latency_ms?: number
          prompt: string
          response: string
          session_id?: string | null
          source_model?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          agents_invoked?: Json | null
          channel?: string
          created_at?: string
          cultural_corrections?: Json | null
          emotion?: string | null
          fallback_used?: boolean
          id?: string
          intent?: string | null
          latency_ms?: number
          prompt?: string
          response?: string
          session_id?: string | null
          source_model?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookpi_records: {
        Row: {
          agent_trace: Json | null
          clean_text: string
          created_at: string
          emotion: string | null
          id: string
          intent: string | null
          prev_hash: string | null
          record_hash: string | null
          route_plan: Json | null
          sequence_number: number
          session_id: string
          user_id: string
        }
        Insert: {
          agent_trace?: Json | null
          clean_text: string
          created_at?: string
          emotion?: string | null
          id?: string
          intent?: string | null
          prev_hash?: string | null
          record_hash?: string | null
          route_plan?: Json | null
          sequence_number?: number
          session_id: string
          user_id: string
        }
        Update: {
          agent_trace?: Json | null
          clean_text?: string
          created_at?: string
          emotion?: string | null
          id?: string
          intent?: string | null
          prev_hash?: string | null
          record_hash?: string | null
          route_plan?: Json | null
          sequence_number?: number
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          hours: string | null
          id: string
          images: Json | null
          lat: number
          lng: number
          name: string
          owner_id: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          images?: Json | null
          lat: number
          lng: number
          name: string
          owner_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          images?: Json | null
          lat?: number
          lng?: number
          name?: string
          owner_id?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_trace: Json | null
          created_at: string
          emotion: string | null
          id: string
          role: string
          session_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          agent_trace?: Json | null
          created_at?: string
          emotion?: string | null
          id?: string
          role?: string
          session_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          agent_trace?: Json | null
          created_at?: string
          emotion?: string | null
          id?: string
          role?: string
          session_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      digital_twins: {
        Row: {
          created_at: string
          id: string
          state: Json
          twin_key: string
          updated_at: string
          version: number
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          state?: Json
          twin_key: string
          updated_at?: string
          version?: number
          zone?: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: Json
          twin_key?: string
          updated_at?: string
          version?: number
          zone?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          category: string
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          instructor: string | null
          is_workshop: boolean
          location: string | null
          materials_url: string | null
          organizer_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          instructor?: string | null
          is_workshop?: boolean
          location?: string | null
          materials_url?: string | null
          organizer_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          instructor?: string | null
          is_workshop?: boolean
          location?: string | null
          materials_url?: string | null
          organizer_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      geo_zones: {
        Row: {
          active: boolean
          alert_level: string
          center_lat: number | null
          center_lng: number | null
          created_at: string
          description: string | null
          fill_color: string
          fill_opacity: number
          id: string
          name: string
          polygon: Json
          updated_at: string
          zone_type: string
        }
        Insert: {
          active?: boolean
          alert_level?: string
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          description?: string | null
          fill_color?: string
          fill_opacity?: number
          id?: string
          name: string
          polygon?: Json
          updated_at?: string
          zone_type?: string
        }
        Update: {
          active?: boolean
          alert_level?: string
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          description?: string | null
          fill_color?: string
          fill_opacity?: number
          id?: string
          name?: string
          polygon?: Json
          updated_at?: string
          zone_type?: string
        }
        Relationships: []
      }
      kaos_signals: {
        Row: {
          classification: string
          content_excerpt: string | null
          created_at: string
          id: string
          metadata: Json | null
          noise_score: number
          routed_to: string
          signal_score: number
          signal_type: string
          toxicity_score: number
          user_id: string | null
        }
        Insert: {
          classification?: string
          content_excerpt?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          noise_score?: number
          routed_to?: string
          signal_score?: number
          signal_type?: string
          toxicity_score?: number
          user_id?: string | null
        }
        Update: {
          classification?: string
          content_excerpt?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          noise_score?: number
          routed_to?: string
          signal_score?: number
          signal_type?: string
          toxicity_score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          category: string
          created_at: string
          description: string | null
          elevation: number | null
          featured: boolean
          highlights: Json | null
          hours: string | null
          id: string
          images: Json | null
          lat: number
          lng: number
          name: string
          status: string
          updated_at: string
          visit_minutes: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          elevation?: number | null
          featured?: boolean
          highlights?: Json | null
          hours?: string | null
          id?: string
          images?: Json | null
          lat: number
          lng: number
          name: string
          status?: string
          updated_at?: string
          visit_minutes?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          elevation?: number | null
          featured?: boolean
          highlights?: Json | null
          hours?: string | null
          id?: string
          images?: Json | null
          lat?: number
          lng?: number
          name?: string
          status?: string
          updated_at?: string
          visit_minutes?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          name: string
          updated_at: string
          waypoints: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          updated_at?: string
          waypoints?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string
          waypoints?: Json | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          resolved: boolean
          severity: string
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          resolved?: boolean
          severity?: string
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          resolved?: boolean
          severity?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sovereign_identity: {
        Row: {
          badges: Json | null
          created_at: string
          handle: string | null
          id: string
          public_hash: string
          territorial_anchor: string | null
          trust_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: Json | null
          created_at?: string
          handle?: string | null
          id?: string
          public_hash: string
          territorial_anchor?: string | null
          trust_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: Json | null
          created_at?: string
          handle?: string | null
          id?: string
          public_hash?: string
          territorial_anchor?: string | null
          trust_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          bucket: string
          created_at: string
          dimensions: Json | null
          id: string
          metric_key: string
          metric_value: number
        }
        Insert: {
          bucket?: string
          created_at?: string
          dimensions?: Json | null
          id?: string
          metric_key: string
          metric_value: number
        }
        Update: {
          bucket?: string
          created_at?: string
          dimensions?: Json | null
          id?: string
          metric_key?: string
          metric_value?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visit_checkins: {
        Row: {
          created_at: string
          distance_meters: number | null
          id: string
          qr_token: string | null
          target_id: string
          target_type: string
          user_id: string
          user_lat: number
          user_lng: number
          verified: boolean
        }
        Insert: {
          created_at?: string
          distance_meters?: number | null
          id?: string
          qr_token?: string | null
          target_id: string
          target_type: string
          user_id: string
          user_lat: number
          user_lng: number
          verified?: boolean
        }
        Update: {
          created_at?: string
          distance_meters?: number | null
          id?: string
          qr_token?: string | null
          target_id?: string
          target_type?: string
          user_id?: string
          user_lat?: number
          user_lng?: number
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "turista" | "comerciante" | "admin"
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
    Enums: {
      app_role: ["turista", "comerciante", "admin"],
    },
  },
} as const
