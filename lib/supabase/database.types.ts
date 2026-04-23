export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.5";
    };
    public: {
        Tables: {
            carpool_drivers: {
                Row: {
                    available_seats: number;
                    created_at: string;
                    departure_at: string;
                    departure_location: string;
                    driver_id: string;
                    id: string;
                    meeting_id: string;
                };
                Insert: {
                    available_seats: number;
                    created_at?: string;
                    departure_at: string;
                    departure_location: string;
                    driver_id: string;
                    id?: string;
                    meeting_id: string;
                };
                Update: {
                    available_seats?: number;
                    created_at?: string;
                    departure_at?: string;
                    departure_location?: string;
                    driver_id?: string;
                    id?: string;
                    meeting_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "carpool_drivers_driver_id_fkey";
                        columns: ["driver_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "carpool_drivers_meeting_id_fkey";
                        columns: ["meeting_id"];
                        isOneToOne: false;
                        referencedRelation: "meetings";
                        referencedColumns: ["id"];
                    },
                ];
            };
            carpool_passengers: {
                Row: {
                    carpool_driver_id: string;
                    created_at: string;
                    id: string;
                    passenger_id: string;
                    status: string;
                };
                Insert: {
                    carpool_driver_id: string;
                    created_at?: string;
                    id?: string;
                    passenger_id: string;
                    status?: string;
                };
                Update: {
                    carpool_driver_id?: string;
                    created_at?: string;
                    id?: string;
                    passenger_id?: string;
                    status?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "carpool_passengers_carpool_driver_id_fkey";
                        columns: ["carpool_driver_id"];
                        isOneToOne: false;
                        referencedRelation: "carpool_drivers";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "carpool_passengers_passenger_id_fkey";
                        columns: ["passenger_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            meetings: {
                Row: {
                    approval_type: string;
                    carpool_enabled: boolean;
                    created_at: string;
                    description: string | null;
                    entry_fee: number;
                    event_at: string;
                    host_id: string;
                    id: string;
                    invite_token: string;
                    location: string | null;
                    max_participants: number | null;
                    status: string;
                    thumbnail_url: string | null;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    approval_type?: string;
                    carpool_enabled?: boolean;
                    created_at?: string;
                    description?: string | null;
                    entry_fee?: number;
                    event_at: string;
                    host_id: string;
                    id?: string;
                    invite_token?: string;
                    location?: string | null;
                    max_participants?: number | null;
                    status?: string;
                    thumbnail_url?: string | null;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    approval_type?: string;
                    carpool_enabled?: boolean;
                    created_at?: string;
                    description?: string | null;
                    entry_fee?: number;
                    event_at?: string;
                    host_id?: string;
                    id?: string;
                    invite_token?: string;
                    location?: string | null;
                    max_participants?: number | null;
                    status?: string;
                    thumbnail_url?: string | null;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "meetings_host_id_fkey";
                        columns: ["host_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            notices: {
                Row: {
                    author_id: string;
                    content: string;
                    created_at: string;
                    id: string;
                    is_pinned: boolean;
                    meeting_id: string;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    author_id: string;
                    content: string;
                    created_at?: string;
                    id?: string;
                    is_pinned?: boolean;
                    meeting_id: string;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    author_id?: string;
                    content?: string;
                    created_at?: string;
                    id?: string;
                    is_pinned?: boolean;
                    meeting_id?: string;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "notices_author_id_fkey";
                        columns: ["author_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "notices_meeting_id_fkey";
                        columns: ["meeting_id"];
                        isOneToOne: false;
                        referencedRelation: "meetings";
                        referencedColumns: ["id"];
                    },
                ];
            };
            participations: {
                Row: {
                    created_at: string;
                    id: string;
                    meeting_id: string;
                    status: string;
                    user_id: string;
                    waitlist_order: number | null;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    meeting_id: string;
                    status?: string;
                    user_id: string;
                    waitlist_order?: number | null;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    meeting_id?: string;
                    status?: string;
                    user_id?: string;
                    waitlist_order?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "participations_meeting_id_fkey";
                        columns: ["meeting_id"];
                        isOneToOne: false;
                        referencedRelation: "meetings";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "participations_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            profiles: {
                Row: {
                    avatar_url: string | null;
                    bio: string | null;
                    created_at: string;
                    email: string;
                    full_name: string | null;
                    id: string;
                    is_admin: boolean;
                    updated_at: string;
                    website: string | null;
                };
                Insert: {
                    avatar_url?: string | null;
                    bio?: string | null;
                    created_at?: string;
                    email: string;
                    full_name?: string | null;
                    id: string;
                    is_admin?: boolean;
                    updated_at?: string;
                    website?: string | null;
                };
                Update: {
                    avatar_url?: string | null;
                    bio?: string | null;
                    created_at?: string;
                    email?: string;
                    full_name?: string | null;
                    id?: string;
                    is_admin?: boolean;
                    updated_at?: string;
                    website?: string | null;
                };
                Relationships: [];
            };
            settlement_items: {
                Row: {
                    amount: number;
                    created_at: string;
                    id: string;
                    label: string;
                    settlement_id: string;
                };
                Insert: {
                    amount: number;
                    created_at?: string;
                    id?: string;
                    label: string;
                    settlement_id: string;
                };
                Update: {
                    amount?: number;
                    created_at?: string;
                    id?: string;
                    label?: string;
                    settlement_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "settlement_items_settlement_id_fkey";
                        columns: ["settlement_id"];
                        isOneToOne: false;
                        referencedRelation: "settlements";
                        referencedColumns: ["id"];
                    },
                ];
            };
            settlement_participants: {
                Row: {
                    amount_due: number;
                    created_at: string;
                    id: string;
                    is_paid: boolean;
                    paid_at: string | null;
                    settlement_id: string;
                    user_id: string;
                };
                Insert: {
                    amount_due: number;
                    created_at?: string;
                    id?: string;
                    is_paid?: boolean;
                    paid_at?: string | null;
                    settlement_id: string;
                    user_id: string;
                };
                Update: {
                    amount_due?: number;
                    created_at?: string;
                    id?: string;
                    is_paid?: boolean;
                    paid_at?: string | null;
                    settlement_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "settlement_participants_settlement_id_fkey";
                        columns: ["settlement_id"];
                        isOneToOne: false;
                        referencedRelation: "settlements";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "settlement_participants_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            settlements: {
                Row: {
                    created_at: string;
                    id: string;
                    meeting_id: string;
                    split_type: string;
                    total_amount: number;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    meeting_id: string;
                    split_type?: string;
                    total_amount: number;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    meeting_id?: string;
                    split_type?: string;
                    total_amount?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "settlements_meeting_id_fkey";
                        columns: ["meeting_id"];
                        isOneToOne: true;
                        referencedRelation: "meetings";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_or_create_profile: {
                Args: never;
                Returns: {
                    avatar_url: string | null;
                    bio: string | null;
                    created_at: string;
                    email: string;
                    full_name: string | null;
                    id: string;
                    is_admin: boolean;
                    updated_at: string;
                    website: string | null;
                };
                SetofOptions: {
                    from: "*";
                    to: "profiles";
                    isOneToOne: true;
                    isSetofReturn: false;
                };
            };
            is_admin: { Args: never; Returns: boolean };
            // 대기자 자동 승급 처리 함수 (SECURITY DEFINER)
            promote_waitlist: {
                Args: { p_meeting_id: string };
                Returns: undefined;
            };
            // 정산 공유 페이지용 공개 조회 함수 (SECURITY DEFINER, anon 접근 가능)
            get_public_settlement: {
                Args: { p_settlement_id: string };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {},
    },
} as const;
