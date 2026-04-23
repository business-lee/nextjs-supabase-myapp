"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AdminProfileRow } from "@/types/database";
import type { MeetingWithHost } from "@/types/domain";

type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string };

export interface AdminStats {
    total_meetings: number;
    new_meetings_this_month: number;
    total_users: number;
    new_users_this_month: number;
}

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

export interface AdminChartData {
    user_growth: UserGrowthData[];
    meeting_trend: MeetingTrendData[];
    feature_usage: FeatureUsageData[];
}

// Admin 인증 체크 — 미인증 또는 비관리자 시 /admin으로 리다이렉트
async function requireAdminAuth() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) redirect("/admin");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.claims.sub as string)
        .single();

    if (!profile?.is_admin) redirect("/admin");

    return { supabase, userId: data.claims.sub as string };
}

// 이번 달 1일 00:00:00 UTC ISO 문자열 반환
function getStartOfMonthISO(): string {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();
}

// 최근 N개월 메타데이터 배열 반환 (연, 월, 한국어 월 레이블)
function getLastNMonths(n: number): { year: number; month: number; label: string }[] {
    const result = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
            year: d.getFullYear(),
            month: d.getMonth(),
            label: `${d.getMonth() + 1}월`,
        });
    }
    return result;
}

// ISO 날짜 문자열이 특정 연/월에 해당하는지 확인
function isSameYearMonth(dateStr: string, year: number, month: number): boolean {
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() === month;
}

/**
 * Admin 대시보드 통계 조회
 */
export async function getAdminDashboardStatsAction(): Promise<AdminStats> {
    const { supabase } = await requireAdminAuth();
    const startOfMonth = getStartOfMonthISO();

    const [
        { count: total_meetings },
        { count: new_meetings_this_month },
        { count: total_users },
        { count: new_users_this_month },
    ] = await Promise.all([
        supabase.from("meetings").select("*", { count: "exact", head: true }),
        supabase
            .from("meetings")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth),
    ]);

    return {
        total_meetings: total_meetings ?? 0,
        new_meetings_this_month: new_meetings_this_month ?? 0,
        total_users: total_users ?? 0,
        new_users_this_month: new_users_this_month ?? 0,
    };
}

/**
 * Admin 대시보드 최근 모임 조회 (주최자 정보 포함)
 */
export async function getAdminRecentMeetingsAction(limit: number): Promise<MeetingWithHost[]> {
    const { supabase } = await requireAdminAuth();

    const { data, error } = await supabase
        .from("meetings")
        .select("*, profiles!meetings_host_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map((row) => ({
        ...row,
        host: Array.isArray(row.profiles) ? (row.profiles[0] ?? null) : (row.profiles ?? null),
    })) as MeetingWithHost[];
}

/**
 * Admin 대시보드 최근 가입자 조회
 */
export async function getAdminRecentUsersAction(limit: number) {
    const { supabase } = await requireAdminAuth();

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) return [];
    return data;
}

/**
 * Admin 이벤트 관리 목록 조회 (검색/필터 포함)
 */
export async function getAdminMeetingsAction(params: {
    q?: string;
    status?: string;
}): Promise<AdminMeetingRow[]> {
    const { supabase } = await requireAdminAuth();

    let query = supabase
        .from("meetings")
        .select("*, profiles!meetings_host_id_fkey(full_name)")
        .order("created_at", { ascending: false });

    if (params.q) {
        query = query.ilike("title", `%${params.q}%`);
    }
    if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
    }

    const { data: meetings, error } = await query;
    if (error || !meetings || meetings.length === 0) return [];

    const meetingIds = meetings.map((m) => m.id);
    const { data: participations } = await supabase
        .from("participations")
        .select("meeting_id")
        .in("meeting_id", meetingIds)
        .eq("status", "approved");

    const countMap = (participations ?? []).reduce(
        (acc, p) => {
            acc[p.meeting_id] = (acc[p.meeting_id] ?? 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    return meetings.map((m) => {
        const hostProfile = m.profiles as { full_name: string | null } | null;
        return {
            id: m.id,
            title: m.title,
            host_name: hostProfile?.full_name ?? null,
            event_at: m.event_at,
            status: m.status,
            participant_count: (countMap[m.id] ?? 0) + 1,
            max_participants: m.max_participants,
            approval_type: m.approval_type,
            invite_token: m.invite_token,
            thumbnail_url: m.thumbnail_url,
        };
    });
}

/**
 * Admin 모임 강제 취소 Server Action
 */
export async function forceCancelMeetingAction(meetingId: string): Promise<ActionResult> {
    const { supabase } = await requireAdminAuth();

    const { error } = await supabase
        .from("meetings")
        .update({ status: "cancelled" })
        .eq("id", meetingId);

    if (error) {
        return { success: false, error: "모임 취소에 실패했습니다." };
    }

    revalidatePath("/admin/events");
    revalidatePath("/admin");
    return { success: true, data: null };
}

/**
 * Admin 사용자 목록 조회 (검색 + 모임 수 집계 포함)
 */
export async function getAdminUsersAction(params: { q?: string }): Promise<AdminProfileRow[]> {
    const { supabase } = await requireAdminAuth();

    let profileQuery = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (params.q) {
        profileQuery = profileQuery.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`);
    }

    const { data: profiles, error } = await profileQuery;
    if (error || !profiles || profiles.length === 0) return [];

    const userIds = profiles.map((p) => p.id);

    const [{ data: createdMeetings }, { data: joinedParticipations }] = await Promise.all([
        supabase.from("meetings").select("host_id").in("host_id", userIds),
        supabase
            .from("participations")
            .select("user_id")
            .in("user_id", userIds)
            .eq("status", "approved"),
    ]);

    const createdCountMap = (createdMeetings ?? []).reduce(
        (acc, m) => {
            acc[m.host_id] = (acc[m.host_id] ?? 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const joinedCountMap = (joinedParticipations ?? []).reduce(
        (acc, p) => {
            acc[p.user_id] = (acc[p.user_id] ?? 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    return profiles.map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        is_admin: p.is_admin,
        created_meeting_count: createdCountMap[p.id] ?? 0,
        meeting_count: joinedCountMap[p.id] ?? 0,
    }));
}

/**
 * Admin is_admin 권한 토글 Server Action
 */
export async function toggleAdminRoleAction(
    userId: string,
    isAdmin: boolean,
): Promise<ActionResult> {
    const { supabase } = await requireAdminAuth();

    const { error } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", userId);

    if (error) {
        return { success: false, error: "권한 변경에 실패했습니다." };
    }

    revalidatePath("/admin/users");
    return { success: true, data: null };
}

/**
 * Admin 통계 차트 데이터 조회 (최근 6개월)
 */
export async function getAdminChartDataAction(): Promise<AdminChartData> {
    const { supabase } = await requireAdminAuth();
    const months = getLastNMonths(6);

    const [
        { data: profilesRaw },
        { data: meetingsRaw },
        { data: participationsRaw },
        { count: carpoolCount },
        { count: settlementCount },
        { count: totalMeetingCount },
    ] = await Promise.all([
        supabase.from("profiles").select("created_at"),
        supabase.from("meetings").select("created_at"),
        supabase.from("participations").select("created_at"),
        supabase
            .from("meetings")
            .select("*", { count: "exact", head: true })
            .eq("carpool_enabled", true),
        supabase.from("settlements").select("*", { count: "exact", head: true }),
        supabase.from("meetings").select("*", { count: "exact", head: true }),
    ]);

    const user_growth: UserGrowthData[] = months.map(({ year, month, label }) => ({
        month: label,
        count: (profilesRaw ?? []).filter((p) => isSameYearMonth(p.created_at, year, month)).length,
    }));

    const meeting_trend: MeetingTrendData[] = months.map(({ year, month, label }) => ({
        month: label,
        created: (meetingsRaw ?? []).filter((m) => isSameYearMonth(m.created_at, year, month))
            .length,
        joined: (participationsRaw ?? []).filter((p) => isSameYearMonth(p.created_at, year, month))
            .length,
    }));

    const total = totalMeetingCount ?? 0;
    const carpool = carpoolCount ?? 0;
    const settlement = settlementCount ?? 0;
    const basic = Math.max(total - carpool - settlement, 0);

    const feature_usage: FeatureUsageData[] = [
        { name: "기본(모임)", value: basic || total, fill: "hsl(var(--chart-1))" },
        { name: "카풀", value: carpool, fill: "hsl(var(--chart-2))" },
        { name: "정산", value: settlement, fill: "hsl(var(--chart-3))" },
    ];

    return { user_growth, meeting_trend, feature_usage };
}
