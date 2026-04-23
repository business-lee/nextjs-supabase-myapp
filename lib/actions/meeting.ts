"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { MeetingFormValues, MeetingUpdateFormValues } from "@/lib/validations/meeting";
import type { MeetingCardData, MeetingStatus } from "@/types/domain";

// Server Action 공통 반환 타입
type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string };

// 인증된 사용자 정보 반환, 미인증 시 로그인 페이지로 리다이렉트
async function requireAuth() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) redirect("/auth/login");
    return { supabase, userId: data.claims.sub };
}

// UTC timestamp → days_until_event 계산 (음수 가능)
function calcDaysUntilEvent(eventAt: string): number {
    return Math.ceil((new Date(eventAt).getTime() - Date.now()) / 86400000);
}

/**
 * 모임 생성 Server Action
 * invite_token은 DB DEFAULT(gen_random_uuid()::text)로 자동 생성되므로 INSERT에서 제외
 */
export async function createMeetingAction(
    values: MeetingFormValues,
): Promise<ActionResult<{ id: string }>> {
    const { supabase, userId } = await requireAuth();

    const { data, error } = await supabase
        .from("meetings")
        .insert({
            host_id: userId,
            title: values.title,
            description: values.description || null,
            event_at: new Date(values.event_at).toISOString(),
            location: values.location || null,
            max_participants: values.max_participants ?? null,
            entry_fee: values.entry_fee,
            approval_type: values.approval_type,
            thumbnail_url: values.thumbnail_url ?? null,
        })
        .select("id")
        .single();

    if (error) {
        return { success: false, error: "모임 생성에 실패했습니다." };
    }

    return { success: true, data: { id: data.id } };
}

/**
 * 모임 수정 Server Action
 * event_at은 meetingUpdateSchema에서 제외되어 있으므로 수정하지 않음
 */
export async function updateMeetingAction(
    meetingId: string,
    values: MeetingUpdateFormValues,
): Promise<ActionResult> {
    const { supabase, userId } = await requireAuth();

    const { error } = await supabase
        .from("meetings")
        .update({
            title: values.title,
            description: values.description || null,
            location: values.location || null,
            max_participants: values.max_participants ?? null,
            entry_fee: values.entry_fee,
            approval_type: values.approval_type,
            thumbnail_url: values.thumbnail_url ?? null,
        })
        .eq("id", meetingId)
        .eq("host_id", userId);

    if (error) {
        return { success: false, error: "모임 수정에 실패했습니다." };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}

/**
 * 모임 취소 Server Action
 * status를 'cancelled'로 업데이트하며, host_id 조건으로 권한 검증
 */
export async function cancelMeetingAction(meetingId: string): Promise<ActionResult> {
    const { supabase, userId } = await requireAuth();

    const { error } = await supabase
        .from("meetings")
        .update({ status: "cancelled" })
        .eq("id", meetingId)
        .eq("host_id", userId);

    if (error) {
        return { success: false, error: "모임 취소에 실패했습니다." };
    }

    revalidatePath("/protected/meetings");
    return { success: true, data: null };
}

/**
 * 내가 만든 모임 목록 조회
 * participations에서 approved 상태만 카운트하여 participant_count 계산
 */
export async function getCreatedMeetingsAction(userId: string): Promise<MeetingCardData[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("meetings")
        .select("*, participations(count)")
        .eq("host_id", userId)
        .neq("status", "cancelled")
        .order("event_at", { ascending: true });

    if (error || !data) return [];

    return data.map((meeting) => {
        // Supabase aggregate 반환 형식: [{count: number}]
        const participationsArr = meeting.participations as { count: number }[];
        const participantCount = participationsArr?.[0]?.count ?? 0;

        return {
            id: meeting.id,
            title: meeting.title,
            event_at: meeting.event_at,
            location: meeting.location,
            max_participants: meeting.max_participants,
            entry_fee: meeting.entry_fee,
            status: meeting.status as MeetingStatus,
            host_name: null,
            participant_count: participantCount,
            pending_count: 0,
            days_until_event: calcDaysUntilEvent(meeting.event_at),
            thumbnail_url: meeting.thumbnail_url,
        };
    });
}

/**
 * 내가 참여한 모임 목록 조회
 * participations에서 approved 상태이고 본인이 host가 아닌 모임만 반환
 */
export async function getJoinedMeetingsAction(userId: string): Promise<MeetingCardData[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("participations")
        .select(
            `
            *,
            meetings!inner(
                *,
                profiles!meetings_host_id_fkey(full_name),
                participations(count)
            )
        `,
        )
        .eq("user_id", userId)
        .eq("status", "approved");

    if (error || !data) return [];

    return data
        .filter((participation) => {
            // 본인이 만든 모임은 제외
            const meeting = participation.meetings as {
                host_id: string;
            } & Record<string, unknown>;
            return meeting.host_id !== userId;
        })
        .map((participation) => {
            const meeting = participation.meetings as {
                id: string;
                title: string;
                event_at: string;
                location: string | null;
                max_participants: number | null;
                entry_fee: number;
                status: string;
                host_id: string;
                thumbnail_url: string | null;
                profiles: { full_name: string | null } | null;
                participations: { count: number }[];
            };
            const hostName = meeting.profiles?.full_name ?? null;
            const participantCount = meeting.participations?.[0]?.count ?? 0;

            return {
                id: meeting.id,
                title: meeting.title,
                event_at: meeting.event_at,
                location: meeting.location,
                max_participants: meeting.max_participants,
                entry_fee: meeting.entry_fee,
                status: meeting.status as MeetingStatus,
                host_name: hostName,
                participant_count: participantCount,
                pending_count: 0,
                days_until_event: calcDaysUntilEvent(meeting.event_at),
                thumbnail_url: meeting.thumbnail_url ?? null,
            };
        });
}
