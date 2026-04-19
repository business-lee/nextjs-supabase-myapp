// 도메인 상수 및 타입 정의 파일
// enum 대신 as const 상수 객체 + union type 방식을 사용합니다.

import type {
    MeetingRow,
    ProfileRow,
    ParticipationRow,
    CarpoolDriverRow,
    CarpoolPassengerRow,
} from "@/types/database";

// ─────────────────────────────────────────────
// 상수 객체 정의 (as const)
// ─────────────────────────────────────────────

// 모임 승인 방식
export const APPROVAL_TYPE = {
    AUTO: "auto",
    MANUAL: "manual",
} as const;

// 모임 상태
export const MEETING_STATUS = {
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    CLOSED: "closed",
    CANCELLED: "cancelled",
} as const;

// 참가 신청 상태
export const PARTICIPATION_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
} as const;

// 카풀 탑승자 상태
export const CARPOOL_PASSENGER_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
} as const;

// 정산 분배 방식
export const SETTLEMENT_SPLIT_TYPE = {
    EQUAL: "equal",
    MANUAL: "manual",
} as const;

// ─────────────────────────────────────────────
// Union 타입 추출
// ─────────────────────────────────────────────

// 모임 승인 방식 타입
export type ApprovalType = (typeof APPROVAL_TYPE)[keyof typeof APPROVAL_TYPE];

// 모임 상태 타입
export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS];

// 참가 신청 상태 타입
export type ParticipationStatus = (typeof PARTICIPATION_STATUS)[keyof typeof PARTICIPATION_STATUS];

// 카풀 탑승자 상태 타입
export type CarpoolPassengerStatus =
    (typeof CARPOOL_PASSENGER_STATUS)[keyof typeof CARPOOL_PASSENGER_STATUS];

// 정산 분배 방식 타입
export type SettlementSplitType =
    (typeof SETTLEMENT_SPLIT_TYPE)[keyof typeof SETTLEMENT_SPLIT_TYPE];

// ─────────────────────────────────────────────
// 조인 타입 (관계 데이터 포함)
// ─────────────────────────────────────────────

// 호스트 프로필을 포함한 모임 타입
export type MeetingWithHost = MeetingRow & {
    host: ProfileRow;
};

// 사용자 프로필을 포함한 참가 신청 타입
export type ParticipationWithUser = ParticipationRow & {
    user: ProfileRow;
};

// 드라이버 프로필 및 탑승자 목록을 포함한 카풀 드라이버 타입
export type CarpoolDriverWithPassengers = CarpoolDriverRow & {
    driver: ProfileRow;
    passengers: (CarpoolPassengerRow & { passenger: ProfileRow })[];
};

// ─────────────────────────────────────────────
// 파생 타입 (UI 표시용)
// ─────────────────────────────────────────────

// 모임 카드 표시에 필요한 파생 데이터 타입
export interface MeetingCardData {
    id: string;
    title: string;
    event_at: string;
    location: string | null;
    max_participants: number | null;
    entry_fee: number;
    status: MeetingStatus;
    host_name: string | null;
    participant_count: number;
    days_until_event: number;
}
