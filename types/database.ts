// DB Row 타입 정의 파일
// Supabase database.types.ts의 Tables 유틸리티 타입을 활용하여 ProfileRow를 추출하고,
// 아직 Supabase에 등록되지 않은 신규 테이블은 인터페이스로 직접 정의합니다.

import { Tables } from "@/lib/supabase/database.types";

// profiles 테이블 Row 타입 (Supabase 자동 생성 타입에서 추출)
export type ProfileRow = Tables<"profiles">;

// meetings 테이블 Row 타입
export interface MeetingRow {
    id: string;
    host_id: string;
    title: string;
    description: string | null;
    event_at: string;
    location: string | null;
    max_participants: number | null;
    entry_fee: number;
    approval_type: string;
    carpool_enabled: boolean;
    status: string;
    invite_token: string;
    created_at: string;
    updated_at: string;
}

// notices 테이블 Row 타입
export interface NoticeRow {
    id: string;
    meeting_id: string;
    author_id: string;
    title: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

// participations 테이블 Row 타입
export interface ParticipationRow {
    id: string;
    meeting_id: string;
    user_id: string;
    status: string;
    waitlist_order: number | null;
    created_at: string;
}

// carpool_drivers 테이블 Row 타입
export interface CarpoolDriverRow {
    id: string;
    meeting_id: string;
    driver_id: string;
    departure_location: string;
    departure_at: string;
    available_seats: number;
    created_at: string;
}

// carpool_passengers 테이블 Row 타입
export interface CarpoolPassengerRow {
    id: string;
    carpool_driver_id: string;
    passenger_id: string;
    status: string;
    created_at: string;
}

// settlements 테이블 Row 타입
export interface SettlementRow {
    id: string;
    meeting_id: string;
    total_amount: number;
    split_type: string;
    created_at: string;
    updated_at: string;
}

// settlement_items 테이블 Row 타입
export interface SettlementItemRow {
    id: string;
    settlement_id: string;
    label: string;
    amount: number;
    created_at: string;
}

// settlement_participants 테이블 Row 타입
export interface SettlementParticipantRow {
    id: string;
    settlement_id: string;
    user_id: string;
    amount_due: number;
    is_paid: boolean;
    paid_at: string | null;
    created_at: string;
}

// Admin 사용자 관리용 Row 타입
export interface AdminProfileRow {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    is_admin: boolean;
    meeting_count: number;
    created_meeting_count: number;
}
