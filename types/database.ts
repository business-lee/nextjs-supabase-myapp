// DB Row 타입 정의 파일
// Supabase generate_typescript_types로 자동 생성된 타입에서 Tables<> 유틸리티로 추출합니다.

import { Tables } from "@/lib/supabase/database.types";

// profiles 테이블 Row 타입 (Supabase 자동 생성 타입에서 추출)
export type ProfileRow = Tables<"profiles">;

// meetings 테이블 Row 타입
export type MeetingRow = Tables<"meetings">;

// notices 테이블 Row 타입
export type NoticeRow = Tables<"notices">;

// participations 테이블 Row 타입
export type ParticipationRow = Tables<"participations">;

// carpool_drivers 테이블 Row 타입
export type CarpoolDriverRow = Tables<"carpool_drivers">;

// carpool_passengers 테이블 Row 타입
export type CarpoolPassengerRow = Tables<"carpool_passengers">;

// settlements 테이블 Row 타입
export type SettlementRow = Tables<"settlements">;

// settlement_items 테이블 Row 타입
export type SettlementItemRow = Tables<"settlement_items">;

// settlement_participants 테이블 Row 타입
export type SettlementParticipantRow = Tables<"settlement_participants">;

// Admin 사용자 관리용 Row 타입 (집계 결과 타입 - 자동 생성 불가, 인터페이스 유지)
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
