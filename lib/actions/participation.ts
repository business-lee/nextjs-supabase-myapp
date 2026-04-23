"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { MeetingWithHost, ParticipationWithUser, ParticipationStatus } from "@/types/domain";
import type { ProfileRow } from "@/types/database";

// Server Action 공통 반환 타입
type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string };

// 인증된 사용자 정보 반환, 미인증 시 로그인 페이지로 리다이렉트
async function requireAuth() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) redirect("/auth/login");
    return { supabase, userId: data.claims.sub };
}

/**
 * 초대 토큰으로 모임 조회 (anon 접근 가능)
 * meetings_anon_select RLS가 허용하므로 비로그인 상태에서도 조회 가능
 */
export async function getMeetingByTokenAction(token: string): Promise<MeetingWithHost | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("meetings")
        .select("*, profiles!meetings_host_id_fkey(*)")
        .eq("invite_token", token)
        .single();

    if (error || !data) return null;

    // Supabase join 결과의 profiles 키를 host로 변환
    return {
        ...data,
        host: data.profiles as ProfileRow,
    } as MeetingWithHost;
}

/**
 * 내 참가 신청 조회
 * 인증 필요 — participations_self_select RLS로 본인 데이터만 반환
 */
export async function getMyParticipationAction(
    meetingId: string,
): Promise<ParticipationWithUser | null> {
    const { supabase, userId } = await requireAuth();

    const { data, error } = await supabase
        .from("participations")
        .select("*, profiles!participations_user_id_fkey(*)")
        .eq("meeting_id", meetingId)
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;

    // profiles 키를 user로 변환
    return {
        ...data,
        user: data.profiles as ProfileRow,
    } as ParticipationWithUser;
}

/**
 * 모임 참가 신청 목록 조회
 * 인증 필요 — RLS가 host/self 기준으로 자동 필터링
 */
export async function getParticipationsAction(meetingId: string): Promise<ParticipationWithUser[]> {
    const { supabase } = await requireAuth();

    const { data, error } = await supabase
        .from("participations")
        .select("*, profiles!participations_user_id_fkey(*)")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

    if (error || !data) return [];

    // profiles 키를 user로 변환
    return data.map((item) => ({
        ...item,
        user: item.profiles as ProfileRow,
    })) as ParticipationWithUser[];
}

/**
 * 모임 참가 통계 조회 (status별 count)
 * meetings_anon_select RLS는 없으나 단순 집계이므로 createClient()로 호출
 * participations는 anon 접근 불가 — RLS 필터로 자동 제한됨
 */
export async function getParticipationStatsAction(meetingId: string): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    waitlisted: number;
}> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("participations")
        .select("status")
        .eq("meeting_id", meetingId);

    const items = data ?? [];
    return {
        total: items.length,
        approved: items.filter((p) => p.status === "approved").length,
        pending: items.filter((p) => p.status === "pending").length,
        rejected: items.filter((p) => p.status === "rejected").length,
        waitlisted: items.filter((p) => p.status === "waitlisted").length,
    };
}

/**
 * 참가 신청 Server Action
 * approval_type에 따라 즉시 승인(auto) 또는 대기(manual) 상태 결정
 * 정원 초과 시 대기자 명단(waitlisted)에 등록
 */
export async function applyParticipationAction(
    meetingId: string,
): Promise<ActionResult<{ status: ParticipationStatus }>> {
    const { supabase, userId } = await requireAuth();

    // 모임 정보 조회 (approval_type, max_participants)
    const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("approval_type, max_participants")
        .eq("id", meetingId)
        .single();

    if (meetingError || !meeting) {
        return { success: false, error: "모임 정보를 불러올 수 없습니다." };
    }

    // 현재 approved 수 조회
    const { count: approvedCount } = await supabase
        .from("participations")
        .select("*", { count: "exact", head: true })
        .eq("meeting_id", meetingId)
        .eq("status", "approved");

    const currentApproved = approvedCount ?? 0;
    const isFull = meeting.max_participants !== null && currentApproved >= meeting.max_participants;

    // status 및 waitlist_order 결정
    let status: ParticipationStatus;
    let waitlistOrder: number | null = null;

    if (meeting.approval_type === "auto") {
        if (isFull) {
            status = "waitlisted";
            // 현재 대기자 수 + 1로 순서 부여
            const { count: waitlistedCount } = await supabase
                .from("participations")
                .select("*", { count: "exact", head: true })
                .eq("meeting_id", meetingId)
                .eq("status", "waitlisted");
            waitlistOrder = (waitlistedCount ?? 0) + 1;
        } else {
            status = "approved";
        }
    } else {
        status = "pending";
    }

    // 참가 신청 INSERT
    const { error: insertError } = await supabase.from("participations").insert({
        meeting_id: meetingId,
        user_id: userId,
        status,
        waitlist_order: waitlistOrder,
    });

    if (insertError) {
        // UNIQUE 제약 위반 (이미 신청한 경우)
        if (insertError.code === "23505") {
            return { success: false, error: "이미 신청한 모임입니다." };
        }
        return { success: false, error: "참가 신청에 실패했습니다." };
    }

    revalidatePath(`/invite/${meetingId}`);
    revalidatePath(`/protected/meetings/${meetingId}`);

    return { success: true, data: { status } };
}

/**
 * 참가 신청 승인 Server Action
 * participations_host_update RLS로 주최자 권한 자동 검증
 */
export async function approveParticipationAction(participationId: string): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase
        .from("participations")
        .update({ status: "approved" })
        .eq("id", participationId);

    if (error) {
        return { success: false, error: "승인에 실패했습니다." };
    }

    revalidatePath("/protected/meetings");

    return { success: true, data: null };
}

/**
 * 참가 신청 거절 Server Action
 * 거절 후 대기자 자동 승급 RPC 호출
 * participations_host_update RLS로 주최자 권한 자동 검증
 */
export async function rejectParticipationAction(
    participationId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase
        .from("participations")
        .update({ status: "rejected", waitlist_order: null })
        .eq("id", participationId);

    if (error) {
        return { success: false, error: "거절에 실패했습니다." };
    }

    // 대기자 자동 승급 처리 RPC 호출
    await supabase.rpc("promote_waitlist", { p_meeting_id: meetingId });

    revalidatePath(`/protected/meetings/${meetingId}`);

    return { success: true, data: null };
}
