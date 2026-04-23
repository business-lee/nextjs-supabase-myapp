// 더미 데이터 유틸리티 - Phase 2 UI 개발용
// 실제 API 연동 전까지 사용하며, Phase 3에서 제거됩니다.

import type {
    MeetingWithHost,
    ParticipationWithUser,
    CarpoolDriverWithPassengers,
} from "@/types/domain";
import type {
    NoticeRow,
    SettlementRow,
    SettlementItemRow,
    SettlementParticipantRow,
    MeetingRow,
    AdminProfileRow,
} from "@/types/database";

// ─────────────────────────────────────────────
// 더미 프로필 데이터
// ─────────────────────────────────────────────

const MOCK_HOST = {
    id: "host-001",
    email: "host@example.com",
    full_name: "김주최",
    avatar_url: null,
    bio: "동호회 주최자입니다.",
    website: null,
    is_admin: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
};

const MOCK_MEMBERS = [
    {
        id: "member-001",
        email: "member1@example.com",
        full_name: "이민호",
        avatar_url: null,
        bio: null,
        website: null,
        is_admin: false,
        created_at: "2026-01-05T00:00:00Z",
        updated_at: "2026-01-05T00:00:00Z",
    },
    {
        id: "member-002",
        email: "member2@example.com",
        full_name: "박지영",
        avatar_url: null,
        bio: null,
        website: null,
        is_admin: false,
        created_at: "2026-01-06T00:00:00Z",
        updated_at: "2026-01-06T00:00:00Z",
    },
    {
        id: "member-003",
        email: "member3@example.com",
        full_name: "최수진",
        avatar_url: null,
        bio: null,
        website: null,
        is_admin: false,
        created_at: "2026-01-07T00:00:00Z",
        updated_at: "2026-01-07T00:00:00Z",
    },
    {
        id: "member-004",
        email: "member4@example.com",
        full_name: "정태우",
        avatar_url: null,
        bio: null,
        website: null,
        is_admin: false,
        created_at: "2026-01-08T00:00:00Z",
        updated_at: "2026-01-08T00:00:00Z",
    },
];

// ─────────────────────────────────────────────
// 더미 모임 데이터 (MeetingWithHost)
// ─────────────────────────────────────────────

export const MOCK_MEETINGS: MeetingWithHost[] = [
    {
        id: "meeting-001",
        host_id: "host-001",
        title: "봄 자전거 라이딩 모임",
        description: "한강변을 따라 함께 라이딩해요. 초보자도 환영합니다!",
        event_at: "2026-05-10T09:00:00Z",
        location: "여의도 한강공원 자전거 대여소",
        max_participants: 15,
        entry_fee: 5000,
        approval_type: "auto",
        carpool_enabled: true,
        status: "upcoming",
        invite_token: "token-001",
        thumbnail_url: null,
        created_at: "2026-04-19T10:00:00Z",
        updated_at: "2026-04-19T10:00:00Z",
        host: MOCK_HOST,
    },
    {
        id: "meeting-002",
        host_id: "host-001",
        title: "5월 등산 모임 - 북한산",
        description: "북한산 백운대 코스로 당일 등산합니다. 체력 중급 이상 권장.",
        event_at: "2026-05-17T06:30:00Z",
        location: "북한산 우이동 탐방지원센터",
        max_participants: 10,
        entry_fee: 0,
        approval_type: "manual",
        carpool_enabled: true,
        status: "upcoming",
        invite_token: "token-002",
        thumbnail_url: null,
        created_at: "2026-04-18T15:00:00Z",
        updated_at: "2026-04-18T15:00:00Z",
        host: MOCK_HOST,
    },
    {
        id: "meeting-003",
        host_id: "host-001",
        title: "독서 토론 - 4월 선정 도서",
        description: "이번 달 선정 도서 '채식주의자'를 읽고 함께 이야기 나눠요.",
        event_at: "2026-04-26T14:00:00Z",
        location: "강남 스타벅스 역삼점 2층",
        max_participants: 8,
        entry_fee: 0,
        approval_type: "manual",
        carpool_enabled: false,
        status: "upcoming",
        invite_token: "token-003",
        thumbnail_url: null,
        created_at: "2026-04-15T09:00:00Z",
        updated_at: "2026-04-15T09:00:00Z",
        host: MOCK_HOST,
    },
    {
        id: "meeting-004",
        host_id: "host-001",
        title: "테니스 동호회 3월 정기전",
        description: "3월 정기 테니스 대회입니다. 복식 2세트 경기 방식.",
        event_at: "2026-03-22T10:00:00Z",
        location: "올림픽공원 테니스장",
        max_participants: 16,
        entry_fee: 10000,
        approval_type: "auto",
        carpool_enabled: false,
        status: "closed",
        invite_token: "token-004",
        thumbnail_url: null,
        created_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-22T18:00:00Z",
        host: MOCK_HOST,
    },
    {
        id: "meeting-005",
        host_id: "host-001",
        title: "사진 출사 - 경복궁 야경",
        description: "경복궁 야간 특별 개장 시즌을 맞아 야경 출사를 진행합니다.",
        event_at: "2026-04-30T18:30:00Z",
        location: "경복궁 정문 앞",
        max_participants: 12,
        entry_fee: 3000,
        approval_type: "auto",
        carpool_enabled: true,
        status: "upcoming",
        invite_token: "token-005",
        thumbnail_url: null,
        created_at: "2026-04-17T11:00:00Z",
        updated_at: "2026-04-17T11:00:00Z",
        host: MOCK_HOST,
    },
];

// 단일 모임 조회용 (모임 상세 페이지에서 사용)
export const MOCK_MEETING: MeetingWithHost = MOCK_MEETINGS[0];

// ─────────────────────────────────────────────
// 더미 공지사항 데이터
// ─────────────────────────────────────────────

export const MOCK_NOTICES: NoticeRow[] = [
    {
        id: "notice-001",
        meeting_id: "meeting-001",
        author_id: "host-001",
        title: "집합 장소 변경 안내 (중요)",
        content:
            "우천으로 인해 집합 장소가 변경되었습니다. 여의도 한강공원 자전거 대여소 → 여의도 공원 정문으로 변경됩니다. 꼭 확인해주세요!",
        is_pinned: true,
        created_at: "2026-04-20T10:00:00Z",
        updated_at: "2026-04-20T10:00:00Z",
    },
    {
        id: "notice-002",
        meeting_id: "meeting-001",
        author_id: "host-001",
        title: "준비물 안내",
        content:
            "헬멧 착용 필수입니다. 현장 대여 가능하나 개인 헬멧 지참 권장합니다. 물과 간식도 챙겨오세요!",
        is_pinned: false,
        created_at: "2026-04-19T12:00:00Z",
        updated_at: "2026-04-19T12:00:00Z",
    },
    {
        id: "notice-003",
        meeting_id: "meeting-001",
        author_id: "host-001",
        title: "모임 개설 안내",
        content:
            "봄 자전거 라이딩 모임이 개설되었습니다. 많은 참여 부탁드립니다. 당일 날씨 확인 후 취소 여부를 안내드리겠습니다.",
        is_pinned: false,
        created_at: "2026-04-19T10:00:00Z",
        updated_at: "2026-04-19T10:00:00Z",
    },
];

// ─────────────────────────────────────────────
// 더미 참가자 데이터
// ─────────────────────────────────────────────

export const MOCK_PARTICIPATIONS: ParticipationWithUser[] = [
    {
        id: "part-001",
        meeting_id: "meeting-001",
        user_id: "member-001",
        status: "approved",
        waitlist_order: null,
        created_at: "2026-04-19T11:00:00Z",
        user: MOCK_MEMBERS[0],
    },
    {
        id: "part-002",
        meeting_id: "meeting-001",
        user_id: "member-002",
        status: "approved",
        waitlist_order: null,
        created_at: "2026-04-19T12:00:00Z",
        user: MOCK_MEMBERS[1],
    },
    {
        id: "part-003",
        meeting_id: "meeting-001",
        user_id: "member-003",
        status: "pending",
        waitlist_order: null,
        created_at: "2026-04-20T09:00:00Z",
        user: MOCK_MEMBERS[2],
    },
    {
        id: "part-004",
        meeting_id: "meeting-001",
        user_id: "member-004",
        status: "pending",
        waitlist_order: null,
        created_at: "2026-04-20T10:00:00Z",
        user: MOCK_MEMBERS[3],
    },
    // Phase 2 더미: 현재 사용자(member-001)가 참여한 모임
    {
        id: "part-005",
        meeting_id: "meeting-004",
        user_id: "member-001",
        status: "approved",
        waitlist_order: null,
        created_at: "2026-03-01T12:00:00Z",
        user: MOCK_MEMBERS[0],
    },
    {
        id: "part-006",
        meeting_id: "meeting-005",
        user_id: "member-001",
        status: "approved",
        waitlist_order: null,
        created_at: "2026-04-17T13:00:00Z",
        user: MOCK_MEMBERS[0],
    },
];

// ─────────────────────────────────────────────
// 더미 카풀 데이터
// ─────────────────────────────────────────────

export const MOCK_CARPOOL_DRIVERS: CarpoolDriverWithPassengers[] = [
    {
        id: "driver-001",
        meeting_id: "meeting-001",
        driver_id: "member-001",
        departure_location: "강남역 10번 출구",
        departure_at: "2026-05-10T08:00:00Z",
        available_seats: 3,
        created_at: "2026-04-20T14:00:00Z",
        driver: MOCK_MEMBERS[0],
        passengers: [
            {
                id: "pass-001",
                carpool_driver_id: "driver-001",
                passenger_id: "member-002",
                status: "accepted",
                created_at: "2026-04-20T15:00:00Z",
                passenger: MOCK_MEMBERS[1],
            },
        ],
    },
    {
        id: "driver-002",
        meeting_id: "meeting-001",
        driver_id: "member-003",
        departure_location: "홍대입구역 9번 출구",
        departure_at: "2026-05-10T08:15:00Z",
        available_seats: 2,
        created_at: "2026-04-21T10:00:00Z",
        driver: MOCK_MEMBERS[2],
        passengers: [],
    },
];

// ─────────────────────────────────────────────
// 더미 정산 데이터
// ─────────────────────────────────────────────

export const MOCK_SETTLEMENT: SettlementRow = {
    id: "settlement-001",
    meeting_id: "meeting-001",
    total_amount: 45000,
    split_type: "equal",
    created_at: "2026-04-19T10:00:00Z",
    updated_at: "2026-04-19T10:00:00Z",
};

export const MOCK_SETTLEMENT_ITEMS: SettlementItemRow[] = [
    {
        id: "item-001",
        settlement_id: "settlement-001",
        label: "자전거 대여비",
        amount: 30000,
        created_at: "2026-04-19T10:00:00Z",
    },
    {
        id: "item-002",
        settlement_id: "settlement-001",
        label: "간식비",
        amount: 15000,
        created_at: "2026-04-19T10:00:00Z",
    },
];

export const MOCK_SETTLEMENT_PARTICIPANTS: SettlementParticipantRow[] = [
    {
        id: "sp-001",
        settlement_id: "settlement-001",
        user_id: "member-001",
        amount_due: 15000,
        is_paid: true,
        paid_at: "2026-04-20T10:00:00Z",
        created_at: "2026-04-19T10:00:00Z",
    },
    {
        id: "sp-002",
        settlement_id: "settlement-001",
        user_id: "member-002",
        amount_due: 15000,
        is_paid: false,
        paid_at: null,
        created_at: "2026-04-19T10:00:00Z",
    },
    {
        id: "sp-003",
        settlement_id: "settlement-001",
        user_id: "host-001",
        amount_due: 15000,
        is_paid: true,
        paid_at: "2026-04-20T09:00:00Z",
        created_at: "2026-04-19T10:00:00Z",
    },
];

// ─────────────────────────────────────────────
// 더미 현재 사용자 (Phase 2: member-001로 가정)
// ─────────────────────────────────────────────

export const MOCK_CURRENT_USER_ID = "member-001";

// 내가 만든 모임 ID 목록 (Phase 2: meeting-001~003)
const MOCK_CREATED_MEETING_IDS = ["meeting-001", "meeting-002", "meeting-003"];

// ─────────────────────────────────────────────
// 더미 데이터 헬퍼 함수
// ─────────────────────────────────────────────

// 현재 사용자가 이 모임의 주최자인지 여부 (Phase 3에서 실제 사용자 ID 비교로 교체)
export function getMockIsHost(meetingId: string): boolean {
    return MOCK_CREATED_MEETING_IDS.includes(meetingId);
}

// 현재 사용자의 특정 모임 참가 신청 데이터 (Phase 3에서 실제 DB 조회로 교체)
export function getMockMyParticipation(meetingId: string): ParticipationWithUser | null {
    return (
        MOCK_PARTICIPATIONS.find(
            (p) => p.meeting_id === meetingId && p.user_id === MOCK_CURRENT_USER_ID,
        ) ?? null
    );
}

// 특정 모임 ID로 더미 모임 조회
export function getMockMeetingById(id: string): MeetingWithHost | undefined {
    return MOCK_MEETINGS.find((m) => m.id === id);
}

// 모임의 더미 참가자 통계
export function getMockParticipationStats(meetingId: string) {
    const participants = MOCK_PARTICIPATIONS.filter((p) => p.meeting_id === meetingId);
    return {
        approved: participants.filter((p) => p.status === "approved").length,
        pending: participants.filter((p) => p.status === "pending").length,
        rejected: participants.filter((p) => p.status === "rejected").length,
        total: participants.length,
    };
}

// D-day 계산 함수
export function calcDaysUntilEvent(eventAt: string): number {
    const now = new Date();
    const eventDate = new Date(eventAt);
    const diffMs = eventDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// 더미 모임 목록에서 대시보드용 데이터 생성
export function getMockMeetingCardDataList() {
    return MOCK_MEETINGS.map((meeting) => {
        const stats = getMockParticipationStats(meeting.id);
        return {
            id: meeting.id,
            title: meeting.title,
            event_at: meeting.event_at,
            location: meeting.location,
            max_participants: meeting.max_participants,
            entry_fee: meeting.entry_fee,
            status: meeting.status as "upcoming" | "ongoing" | "closed" | "cancelled",
            host_name: meeting.host?.full_name ?? null,
            participant_count: stats.approved,
            pending_count: stats.pending,
            days_until_event: calcDaysUntilEvent(meeting.event_at),
        };
    }).sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime());
}

// 사용자의 더미 모임 통계 (만든 모임 / 참여한 모임)
// Phase 2 더미: getMockCreatedMeetingCards(3개), getMockJoinedMeetingCards(2개)와 일치
export function getMockUserMeetingStats(_userId: string) {
    return {
        created: MOCK_MEETINGS.slice(0, 3).length,
        joined: MOCK_MEETINGS.slice(3).length,
    };
}

// 내가 만든 모임 카드 목록 (Phase 2: 앞 3개를 만든 모임으로 사용)
export function getMockCreatedMeetingCards() {
    return MOCK_MEETINGS.slice(0, 3).map((meeting) => {
        const stats = getMockParticipationStats(meeting.id);
        return {
            id: meeting.id,
            title: meeting.title,
            event_at: meeting.event_at,
            location: meeting.location,
            max_participants: meeting.max_participants,
            entry_fee: meeting.entry_fee,
            status: meeting.status as "upcoming" | "ongoing" | "closed" | "cancelled",
            host_name: meeting.host?.full_name ?? null,
            participant_count: stats.approved,
            pending_count: stats.pending,
            days_until_event: calcDaysUntilEvent(meeting.event_at),
            isHost: true,
            myParticipationStatus: null as string | null,
        };
    });
}

// 내가 참여한 모임 카드 목록 (Phase 2: 뒤 2개를 참여한 모임으로 사용)
export function getMockJoinedMeetingCards() {
    return MOCK_MEETINGS.slice(3).map((meeting) => {
        const stats = getMockParticipationStats(meeting.id);
        const myParticipation = getMockMyParticipation(meeting.id);
        return {
            id: meeting.id,
            title: meeting.title,
            event_at: meeting.event_at,
            location: meeting.location,
            max_participants: meeting.max_participants,
            entry_fee: meeting.entry_fee,
            status: meeting.status as "upcoming" | "ongoing" | "closed" | "cancelled",
            host_name: meeting.host?.full_name ?? null,
            participant_count: stats.approved,
            pending_count: stats.pending,
            days_until_event: calcDaysUntilEvent(meeting.event_at),
            isHost: false,
            myParticipationStatus: myParticipation?.status ?? null,
        };
    });
}

// 초대 토큰으로 더미 모임 조회 (host 정보 포함)
export function getMockMeetingByToken(token: string): MeetingWithHost | undefined {
    return MOCK_MEETINGS.find((m) => m.invite_token === token);
}

// ─────────────────────────────────────────────
// Admin 전용 더미 데이터
// ─────────────────────────────────────────────

export interface AdminStats {
    total_meetings: number;
    new_meetings_this_month: number;
    total_users: number;
    new_users_this_month: number;
}

export const MOCK_ADMIN_STATS: AdminStats = {
    total_meetings: 5,
    new_meetings_this_month: 3,
    total_users: 5,
    new_users_this_month: 2,
};

export function getMockAdminStats(): AdminStats {
    return MOCK_ADMIN_STATS;
}

export function getMockRecentUsers(limit = 5): AdminProfileRow[] {
    return getMockAdminUsers()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
}

export function getMockRecentMeetings(limit = 5): MeetingWithHost[] {
    return [...MOCK_MEETINGS]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
}

// Admin 이벤트 관리 목록 데이터 타입 및 함수
export interface AdminMeetingRow {
    id: string;
    title: string;
    host_name: string | null;
    event_at: string;
    status: string;
    participant_count: number;
    max_participants: number | null;
    approval_type: string;
    invite_token: string | null;
    thumbnail_url: string | null;
}

export function getMockAdminMeetings(): AdminMeetingRow[] {
    return MOCK_MEETINGS.map((m) => ({
        id: m.id,
        title: m.title,
        host_name: m.host?.full_name ?? null,
        event_at: m.event_at,
        status: m.status,
        participant_count: getMockParticipationStats(m.id).approved,
        max_participants: m.max_participants,
        approval_type: m.approval_type,
        invite_token: m.invite_token,
        thumbnail_url: m.thumbnail_url,
    }));
}

// 차트 더미 데이터 타입 및 상수

export interface UserGrowthData {
    month: string;
    count: number;
}

export interface MeetingTrendData {
    month: string;
    created: number;
    joined: number;
}

export interface FeatureUsageData {
    name: string;
    value: number;
    fill: string;
}

export const MOCK_USER_GROWTH: UserGrowthData[] = [
    { month: "11월", count: 2 },
    { month: "12월", count: 5 },
    { month: "1월", count: 8 },
    { month: "2월", count: 6 },
    { month: "3월", count: 12 },
    { month: "4월", count: 9 },
];

export const MOCK_MEETING_TREND: MeetingTrendData[] = [
    { month: "11월", created: 1, joined: 3 },
    { month: "12월", created: 2, joined: 7 },
    { month: "1월", created: 3, joined: 10 },
    { month: "2월", created: 2, joined: 8 },
    { month: "3월", created: 4, joined: 14 },
    { month: "4월", created: 3, joined: 11 },
];

export const MOCK_FEATURE_USAGE: FeatureUsageData[] = [
    { name: "기본(모임)", value: 45, fill: "hsl(var(--chart-1))" },
    { name: "카풀", value: 30, fill: "hsl(var(--chart-2))" },
    { name: "정산", value: 25, fill: "hsl(var(--chart-3))" },
];

// Admin 사용자 관리 목록 데이터
export function getMockAdminUsers(): AdminProfileRow[] {
    return [
        {
            id: MOCK_HOST.id,
            email: MOCK_HOST.email,
            full_name: MOCK_HOST.full_name,
            avatar_url: MOCK_HOST.avatar_url,
            created_at: MOCK_HOST.created_at,
            is_admin: true,
            meeting_count: 3,
            created_meeting_count: 5,
        },
        ...MOCK_MEMBERS.map((m, i) => ({
            id: m.id,
            email: m.email,
            full_name: m.full_name,
            avatar_url: m.avatar_url,
            created_at: m.created_at,
            is_admin: false,
            meeting_count: i < 2 ? 2 : 1,
            created_meeting_count: [2, 1, 0, 1][i] ?? 0,
        })),
    ];
}
