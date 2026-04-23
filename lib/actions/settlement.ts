"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type {
    SettlementRow,
    SettlementItemRow,
    SettlementParticipantRow,
    ProfileRow,
} from "@/types/database";
import type { SettlementSplitType } from "@/types/domain";

// Server Action 공통 반환 타입
type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string };

// 정산 참여자 (프로필 포함) 복합 타입
export type SettlementParticipantWithUser = SettlementParticipantRow & {
    user: ProfileRow;
};

// 정산 전체 데이터 타입
export type SettlementData = {
    settlement: SettlementRow;
    items: SettlementItemRow[];
    participants: SettlementParticipantWithUser[];
} | null;

// 인증된 사용자 정보 반환, 미인증 시 로그인 페이지로 리다이렉트
async function requireAuth() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) redirect("/auth/login");
    return { supabase, userId: data.claims.sub };
}

/**
 * 특정 모임의 정산 전체 데이터 조회
 * 서버 컴포넌트에서 직접 호출 (RLS가 접근 제어)
 * - settlement이 없으면 null 반환
 * - items와 participants를 병렬 조회
 */
export async function getSettlementAction(meetingId: string): Promise<SettlementData> {
    const supabase = await createClient();

    // 1단계: settlements 조회
    const { data: settlement } = await supabase
        .from("settlements")
        .select("*")
        .eq("meeting_id", meetingId)
        .single();

    if (!settlement) return null;

    // 2단계: items + participants 병렬 조회
    const [itemsResult, participantsResult] = await Promise.all([
        supabase
            .from("settlement_items")
            .select("*")
            .eq("settlement_id", settlement.id)
            .order("created_at", { ascending: true }),
        supabase
            .from("settlement_participants")
            .select("*, profiles!settlement_participants_user_id_fkey(*)")
            .eq("settlement_id", settlement.id)
            .order("created_at", { ascending: true }),
    ]);

    // settlement_participants join 결과에서 profiles → user 변환
    const participantsWithUser: SettlementParticipantWithUser[] = (
        participantsResult.data ?? []
    ).map((p) => ({
        ...p,
        profiles: undefined,
        user: p.profiles as ProfileRow,
    }));

    return {
        settlement,
        items: itemsResult.data ?? [],
        participants: participantsWithUser,
    };
}

/**
 * 정산 생성 또는 업데이트 (UPSERT)
 * meeting_id UNIQUE 제약 활용 — 1:1 관계 보장
 */
export async function createOrUpdateSettlementAction(
    meetingId: string,
    splitType: SettlementSplitType,
    totalAmount: number,
): Promise<ActionResult<SettlementRow>> {
    const { supabase } = await requireAuth();

    const { data, error } = await supabase
        .from("settlements")
        .upsert(
            { meeting_id: meetingId, split_type: splitType, total_amount: totalAmount },
            { onConflict: "meeting_id" },
        )
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data };
}

/**
 * 정산 항목 추가
 * 항목 추가 후 settlements.total_amount 자동 재계산
 */
export async function addSettlementItemAction(
    settlementId: string,
    meetingId: string,
    label: string,
    amount: number,
): Promise<ActionResult<SettlementItemRow>> {
    const { supabase } = await requireAuth();

    // 항목 INSERT
    const { data, error } = await supabase
        .from("settlement_items")
        .insert({ settlement_id: settlementId, label, amount })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // 전체 items 합계 재계산 후 settlements 업데이트
    const { data: allItems } = await supabase
        .from("settlement_items")
        .select("amount")
        .eq("settlement_id", settlementId);

    const newTotal = (allItems ?? []).reduce((sum, item) => sum + item.amount, 0);
    await supabase.from("settlements").update({ total_amount: newTotal }).eq("id", settlementId);

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data };
}

/**
 * 정산 항목 삭제
 * 삭제 후 settlements.total_amount 자동 재계산
 */
export async function deleteSettlementItemAction(
    itemId: string,
    settlementId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    // 항목 DELETE
    const { error } = await supabase.from("settlement_items").delete().eq("id", itemId);

    if (error) {
        return { success: false, error: error.message };
    }

    // 전체 items 합계 재계산 후 settlements 업데이트
    const { data: allItems } = await supabase
        .from("settlement_items")
        .select("amount")
        .eq("settlement_id", settlementId);

    const newTotal = (allItems ?? []).reduce((sum, item) => sum + item.amount, 0);
    await supabase.from("settlements").update({ total_amount: newTotal }).eq("id", settlementId);

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}

/**
 * 균등 분배 재계산
 * total_amount를 참여자 수로 나눠 각 amount_due 업데이트
 * 잔돈은 단순화하여 모두 동일 금액으로 처리
 */
export async function recalculateEqualSplitAction(
    settlementId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    // settlements.total_amount 조회
    const { data: settlementData, error: settlementError } = await supabase
        .from("settlements")
        .select("total_amount")
        .eq("id", settlementId)
        .single();

    if (settlementError || !settlementData) {
        return { success: false, error: "정산 데이터를 찾을 수 없습니다." };
    }

    // settlement_participants 목록 조회
    const { data: participants, error: participantsError } = await supabase
        .from("settlement_participants")
        .select("id")
        .eq("settlement_id", settlementId);

    if (participantsError) {
        return { success: false, error: participantsError.message };
    }

    const totalAmount = settlementData.total_amount;
    const count = (participants ?? []).length;
    // 균등 분배 계산 (소수점 버림)
    const amountPerPerson = count > 0 ? Math.floor(totalAmount / count) : 0;

    // 각 참여자의 amount_due 업데이트
    const updatePromises = (participants ?? []).map((p) =>
        supabase
            .from("settlement_participants")
            .update({ amount_due: amountPerPerson })
            .eq("id", p.id),
    );

    await Promise.all(updatePromises);

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}

/**
 * 납부 상태 토글
 * 주최자: settlement_participants_host_all RLS로 전체 가능
 * 본인: settlement_participants_self_update RLS로 본인만 가능
 */
export async function togglePaidAction(
    participantId: string,
    isPaid: boolean,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase
        .from("settlement_participants")
        .update({
            is_paid: isPaid,
            paid_at: isPaid ? new Date().toISOString() : null,
        })
        .eq("id", participantId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}

/**
 * 정산 참여자 초기화
 * 모임의 approved 참여자를 settlement_participants에 등록 (중복 방지)
 */
export async function initializeSettlementParticipantsAction(
    settlementId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    // 모임의 approved 참여자 목록 조회
    const { data: approvedParticipations } = await supabase
        .from("participations")
        .select("user_id")
        .eq("meeting_id", meetingId)
        .eq("status", "approved");

    // 기존 settlement_participants 조회 (중복 방지)
    const { data: existingParticipants } = await supabase
        .from("settlement_participants")
        .select("user_id")
        .eq("settlement_id", settlementId);

    const existingUserIds = new Set((existingParticipants ?? []).map((p) => p.user_id));

    // 아직 등록되지 않은 참여자만 INSERT
    const newParticipants = (approvedParticipations ?? [])
        .filter((p) => p.user_id !== null && !existingUserIds.has(p.user_id))
        .map((p) => ({
            settlement_id: settlementId,
            user_id: p.user_id as string,
            amount_due: 0,
            is_paid: false,
        }));

    if (newParticipants.length > 0) {
        const { error } = await supabase.from("settlement_participants").insert(newParticipants);

        if (error) {
            return { success: false, error: error.message };
        }
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}
