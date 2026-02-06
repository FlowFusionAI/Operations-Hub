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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          meta: Json
          org_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          meta?: Json
          org_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          meta?: Json
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          assigned_manager_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          org_id: string
          role_title: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          assigned_manager_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          org_id: string
          role_title?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          assigned_manager_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          org_id?: string
          role_title?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          error: string | null
          id: string
          idempotency_key: string | null
          max_retries: number
          org_id: string
          payload: Json
          picked_up_at: string | null
          retry_count: number
          status: Database["public"]["Enums"]["event_status"]
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          max_retries?: number
          org_id: string
          payload?: Json
          picked_up_at?: string | null
          retry_count?: number
          status?: Database["public"]["Enums"]["event_status"]
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          max_retries?: number
          org_id?: string
          payload?: Json
          picked_up_at?: string | null
          retry_count?: number
          status?: Database["public"]["Enums"]["event_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      heartbeats: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "heartbeats_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json
          org_id: string
          role: Database["public"]["Enums"]["membership_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json
          org_id: string
          role?: Database["public"]["Enums"]["membership_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json
          org_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_instances: {
        Row: {
          completed_at: string | null
          created_at: string
          employee_id: string
          id: string
          org_id: string
          portal_token: string
          status: Database["public"]["Enums"]["instance_status"]
          template_id: string
          template_version: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          org_id: string
          portal_token: string
          status?: Database["public"]["Enums"]["instance_status"]
          template_id: string
          template_version: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          org_id?: string
          portal_token?: string
          status?: Database["public"]["Enums"]["instance_status"]
          template_id?: string
          template_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_instances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
          role_description: string | null
          status: Database["public"]["Enums"]["template_status"]
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          role_description?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          role_description?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          escalation_threshold_days: number
          id: string
          name: string
          settings: Json
          skip_weekends: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escalation_threshold_days?: number
          id?: string
          name: string
          settings?: Json
          skip_weekends?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escalation_threshold_days?: number
          id?: string
          name?: string
          settings?: Json
          skip_weekends?: boolean
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_instances: {
        Row: {
          assignee_email: string
          assignee_type: Database["public"]["Enums"]["assignee_type"]
          attachments: Json
          blocked_by_task_instance_id: string | null
          completed_at: string | null
          completed_by_user_id: string | null
          created_at: string
          description: string | null
          due_at: string
          email_status:
            | Database["public"]["Enums"]["email_delivery_status"]
            | null
          id: string
          last_reminder_sent_at: string | null
          onboarding_instance_id: string
          org_id: string
          sent_at: string | null
          sort_order: number
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_email: string
          assignee_type: Database["public"]["Enums"]["assignee_type"]
          attachments?: Json
          blocked_by_task_instance_id?: string | null
          completed_at?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          due_at: string
          email_status?:
            | Database["public"]["Enums"]["email_delivery_status"]
            | null
          id?: string
          last_reminder_sent_at?: string | null
          onboarding_instance_id: string
          org_id: string
          sent_at?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_email?: string
          assignee_type?: Database["public"]["Enums"]["assignee_type"]
          attachments?: Json
          blocked_by_task_instance_id?: string | null
          completed_at?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string
          email_status?:
            | Database["public"]["Enums"]["email_delivery_status"]
            | null
          id?: string
          last_reminder_sent_at?: string | null
          onboarding_instance_id?: string
          org_id?: string
          sent_at?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_blocked_by_task_instance_id_fkey"
            columns: ["blocked_by_task_instance_id"]
            isOneToOne: false
            referencedRelation: "task_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_onboarding_instance_id_fkey"
            columns: ["onboarding_instance_id"]
            isOneToOne: false
            referencedRelation: "onboarding_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      template_tasks: {
        Row: {
          assignee_type: Database["public"]["Enums"]["assignee_type"]
          attachments: Json
          blocked_by_template_task_id: string | null
          created_at: string
          custom_email: string | null
          day_offset: number
          description: string | null
          due_offset: number
          id: string
          org_id: string
          requires_ack: boolean
          send_channel: string
          sort_order: number
          template_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_type?: Database["public"]["Enums"]["assignee_type"]
          attachments?: Json
          blocked_by_template_task_id?: string | null
          created_at?: string
          custom_email?: string | null
          day_offset?: number
          description?: string | null
          due_offset?: number
          id?: string
          org_id: string
          requires_ack?: boolean
          send_channel?: string
          sort_order?: number
          template_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_type?: Database["public"]["Enums"]["assignee_type"]
          attachments?: Json
          blocked_by_template_task_id?: string | null
          created_at?: string
          custom_email?: string | null
          day_offset?: number
          description?: string | null
          due_offset?: number
          id?: string
          org_id?: string
          requires_ack?: boolean
          send_channel?: string
          sort_order?: number
          template_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_tasks_blocked_by_template_task_id_fkey"
            columns: ["blocked_by_template_task_id"]
            isOneToOne: false
            referencedRelation: "template_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          event_id: string | null
          id: string
          logs: Json
          org_id: string
          started_at: string
          status: string
          workflow_key: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          event_id?: string | null
          id?: string
          logs?: Json
          org_id: string
          started_at?: string
          status?: string
          workflow_key: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          event_id?: string | null
          id?: string
          logs?: Json
          org_id?: string
          started_at?: string
          status?: string
          workflow_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_admin: { Args: { check_org_id: string }; Returns: boolean }
      is_org_member: { Args: { check_org_id: string }; Returns: boolean }
    }
    Enums: {
      assignee_type: "employee" | "manager" | "custom_email"
      email_delivery_status: "sent" | "delivered" | "bounced"
      event_status: "pending" | "processing" | "done" | "failed"
      instance_status:
        | "pending"
        | "active"
        | "paused"
        | "cancelled"
        | "completed"
      invite_status: "pending" | "accepted" | "expired"
      membership_role: "owner" | "admin" | "manager" | "member"
      task_status: "pending" | "sent" | "completed"
      template_status: "active" | "inactive"
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
      assignee_type: ["employee", "manager", "custom_email"],
      email_delivery_status: ["sent", "delivered", "bounced"],
      event_status: ["pending", "processing", "done", "failed"],
      instance_status: [
        "pending",
        "active",
        "paused",
        "cancelled",
        "completed",
      ],
      invite_status: ["pending", "accepted", "expired"],
      membership_role: ["owner", "admin", "manager", "member"],
      task_status: ["pending", "sent", "completed"],
      template_status: ["active", "inactive"],
    },
  },
} as const
