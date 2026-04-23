"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { NoticeRow } from "@/types/database";

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
 * 특정 모임의 공지사항 목록 조회
 * 고정 공지 우선, 이후 최신순 정렬
 * 서버 컴포넌트에서 직접 호출 (requireAuth 불필요 - RLS가 접근 제어)
 */
export async function getNoticesAction(meetingId: string): Promise<NoticeRow[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("공지사항 조회 오류:", error.message);
        return [];
    }

    return data ?? [];
}

/**
 * 공지사항 생성
 * notices_host_all RLS: meetings.host_id = auth.uid() 인 경우만 허용
 */
export async function createNoticeAction(
    meetingId: string,
    title: string,
    content: string,
    isPinned: boolean,
): Promise<ActionResult<NoticeRow>> {
    const { supabase, userId } = await requireAuth();

    const { data, error } = await supabase
        .from("notices")
        .insert({
            meeting_id: meetingId,
            author_id: userId,
            title,
            content,
            is_pinned: isPinned,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data };
}

/**
 * 공지사항 수정
 * notices_host_all RLS가 주최자 권한을 자동 검증
 */
export async function updateNoticeAction(
    noticeId: string,
    meetingId: string,
    title: string,
    content: string,
    isPinned: boolean,
): Promise<ActionResult<NoticeRow>> {
    const { supabase } = await requireAuth();

    const { data, error } = await supabase
        .from("notices")
        .update({
            title,
            content,
            is_pinned: isPinned,
            updated_at: new Date().toISOString(),
        })
        .eq("id", noticeId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data };
}

/**
 * 공지사항 삭제
 * notices_host_all RLS가 주최자 권한을 자동 검증
 */
export async function deleteNoticeAction(
    noticeId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase.from("notices").delete().eq("id", noticeId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}
