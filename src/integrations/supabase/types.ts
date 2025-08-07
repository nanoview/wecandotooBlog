export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          category: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          blog_post_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_post_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_post_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      google_api_cache: {
        Row: {
          api_type: string
          cache_key: string
          created_at: string
          endpoint: string
          expires_at: string
          fetch_duration_ms: number | null
          id: string
          response_data: Json
          response_size_bytes: number | null
          updated_at: string
        }
        Insert: {
          api_type: string
          cache_key: string
          created_at?: string
          endpoint: string
          expires_at: string
          fetch_duration_ms?: number | null
          id?: string
          response_data: Json
          response_size_bytes?: number | null
          updated_at?: string
        }
        Update: {
          api_type?: string
          cache_key?: string
          created_at?: string
          endpoint?: string
          expires_at?: string
          fetch_duration_ms?: number | null
          id?: string
          response_data?: Json
          response_size_bytes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      google_site_kit: {
        Row: {
          adsense_account_id: string | null
          adsense_customer_id: string | null
          adsense_publisher_id: string | null
          adsense_site_id: string | null
          analytics_measurement_id: string | null
          analytics_property_id: string | null
          analytics_view_id: string | null
          api_last_fetched: string | null
          api_quota_reset_time: string | null
          api_rate_limit_remaining: number | null
          configured_by: string | null
          connection_status: string | null
          created_at: string
          enable_adsense: boolean | null
          enable_analytics: boolean | null
          enable_auto_ads: boolean | null
          enable_search_console: boolean | null
          enabled_apis: string[] | null
          error_message: string | null
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          oauth_access_token: string | null
          oauth_client_id: string | null
          oauth_client_secret: string | null
          oauth_expires_at: string | null
          oauth_redirect_uri: string | null
          oauth_refresh_token: string | null
          oauth_scopes: string[] | null
          search_console_site_url: string | null
          search_console_verified: boolean | null
          site_verification_code: string | null
          site_verification_method: string | null
          updated_at: string
        }
        Insert: {
          adsense_account_id?: string | null
          adsense_customer_id?: string | null
          adsense_publisher_id?: string | null
          adsense_site_id?: string | null
          analytics_measurement_id?: string | null
          analytics_property_id?: string | null
          analytics_view_id?: string | null
          api_last_fetched?: string | null
          api_quota_reset_time?: string | null
          api_rate_limit_remaining?: number | null
          configured_by?: string | null
          connection_status?: string | null
          created_at?: string
          enable_adsense?: boolean | null
          enable_analytics?: boolean | null
          enable_auto_ads?: boolean | null
          enable_search_console?: boolean | null
          enabled_apis?: string[] | null
          error_message?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          oauth_access_token?: string | null
          oauth_client_id?: string | null
          oauth_client_secret?: string | null
          oauth_expires_at?: string | null
          oauth_redirect_uri?: string | null
          oauth_refresh_token?: string | null
          oauth_scopes?: string[] | null
          search_console_site_url?: string | null
          search_console_verified?: boolean | null
          site_verification_code?: string | null
          site_verification_method?: string | null
          updated_at?: string
        }
        Update: {
          adsense_account_id?: string | null
          adsense_customer_id?: string | null
          adsense_publisher_id?: string | null
          adsense_site_id?: string | null
          analytics_measurement_id?: string | null
          analytics_property_id?: string | null
          analytics_view_id?: string | null
          api_last_fetched?: string | null
          api_quota_reset_time?: string | null
          api_rate_limit_remaining?: number | null
          configured_by?: string | null
          connection_status?: string | null
          created_at?: string
          enable_adsense?: boolean | null
          enable_analytics?: boolean | null
          enable_auto_ads?: boolean | null
          enable_search_console?: boolean | null
          enabled_apis?: string[] | null
          error_message?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          oauth_access_token?: string | null
          oauth_client_id?: string | null
          oauth_client_secret?: string | null
          oauth_expires_at?: string | null
          oauth_redirect_uri?: string | null
          oauth_refresh_token?: string | null
          oauth_scopes?: string[] | null
          search_console_site_url?: string | null
          search_console_verified?: boolean | null
          site_verification_code?: string | null
          site_verification_method?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      google_site_kit_config: {
        Row: {
          access_token: string | null
          adsense_customer_id: string | null
          adsense_publisher_id: string | null
          analytics_property_id: string | null
          analytics_view_id: string | null
          connection_status: string | null
          created_at: string
          enable_adsense: boolean | null
          enable_analytics: boolean | null
          enable_search_console: boolean | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          oauth_client_id: string
          oauth_client_secret: string
          oauth_redirect_uri: string
          refresh_token: string | null
          search_console_site_url: string | null
          search_console_verified: boolean | null
          site_url: string
          token_expires_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          adsense_customer_id?: string | null
          adsense_publisher_id?: string | null
          analytics_property_id?: string | null
          analytics_view_id?: string | null
          connection_status?: string | null
          created_at?: string
          enable_adsense?: boolean | null
          enable_analytics?: boolean | null
          enable_search_console?: boolean | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          oauth_client_id: string
          oauth_client_secret: string
          oauth_redirect_uri?: string
          refresh_token?: string | null
          search_console_site_url?: string | null
          search_console_verified?: boolean | null
          site_url?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          adsense_customer_id?: string | null
          adsense_publisher_id?: string | null
          analytics_property_id?: string | null
          analytics_view_id?: string | null
          connection_status?: string | null
          created_at?: string
          enable_adsense?: boolean | null
          enable_analytics?: boolean | null
          enable_search_console?: boolean | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          oauth_client_id?: string
          oauth_client_secret?: string
          oauth_redirect_uri?: string
          refresh_token?: string | null
          search_console_site_url?: string | null
          search_console_verified?: boolean | null
          site_url?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
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
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          status: string
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      subscriber_stats: {
        Row: {
          confirmed_count: number | null
          pending_count: number | null
          total_count: number | null
          unsubscribed_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_edit_posts: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_subscription_rate_limit: {
        Args: { user_email: string }
        Returns: boolean
      }
      clean_expired_google_cache: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_confirmation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_nanopro: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      nanopro_get_all_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }[]
      }
      nanopro_set_user_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      setup_current_user_as_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "editor"
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
      app_role: ["admin", "user", "editor"],
    },
  },
} as const
