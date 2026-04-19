"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type Database } from "@/lib/supabase/database.types";
import { getMockUserMeetingStats } from "@/lib/mock-data";

// 프로필 타입 별칭
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * 현재 로그인한 사용자의 프로필을 조회합니다.
 * 프로필이 없는 경우 자동으로 생성합니다.
 * SECURITY DEFINER 함수를 사용해 RLS를 우회하고 auth.uid()로 보안을 보장합니다.
 */
export async function getProfile(): Promise<ProfileRow> {
    const supabase = await createClient();

    // 인증 상태 확인
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims) {
        redirect("/auth/login");
    }

    // SECURITY DEFINER 함수 호출: 프로필 조회 또는 생성
    const { data, error } = await supabase.rpc("get_or_create_profile");

    if (error) {
        throw new Error(`프로필 처리 실패: ${error.message}`);
    }

    return data as ProfileRow;
}

/**
 * 현재 로그인한 사용자의 프로필을 수정합니다.
 */
export async function getMeetingStats(): Promise<{ created: number; joined: number }> {
    const supabase = await createClient();
    const { data: claimsData, error } = await supabase.auth.getClaims();

    if (error || !claimsData?.claims) {
        redirect("/auth/login");
    }

    return getMockUserMeetingStats(claimsData.claims.sub);
}

export async function updateProfile(
    updates: Pick<ProfileUpdate, "full_name">,
): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims) {
        redirect("/auth/login");
    }

    const userId = claimsData.claims.sub;

    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);

    if (error) {
        return { success: false, message: `수정 실패: ${error.message}` };
    }

    return { success: true, message: "프로필이 성공적으로 수정되었습니다." };
}
