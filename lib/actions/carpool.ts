"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CarpoolDriverWithPassengers } from "@/types/domain";
import type { ProfileRow, CarpoolPassengerRow } from "@/types/database";

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
 * 모임의 카풀 드라이버 목록 조회
 * carpool_drivers_participant_select RLS: approved 참여자 또는 주최자만 접근 가능
 */
export async function getCarpoolDriversAction(
    meetingId: string,
): Promise<CarpoolDriverWithPassengers[]> {
    const { supabase } = await requireAuth();

    const { data, error } = await supabase
        .from("carpool_drivers")
        .select(
            `
            *,
            profiles!carpool_drivers_driver_id_fkey(*),
            carpool_passengers(
                *,
                profiles!carpool_passengers_passenger_id_fkey(*)
            )
        `,
        )
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

    if (error || !data) return [];

    // 중첩 join 결과를 도메인 타입으로 변환
    return (data ?? []).map((item) => ({
        ...item,
        driver: item.profiles as ProfileRow,
        passengers: (item.carpool_passengers ?? []).map((p) => ({
            ...p,
            passenger: p.profiles as ProfileRow,
        })) as (CarpoolPassengerRow & { passenger: ProfileRow })[],
    })) as CarpoolDriverWithPassengers[];
}

/**
 * 카풀 활성화/비활성화 토글
 * meetings_host_update RLS로 주최자 권한 자동 검증
 */
export async function toggleCarpoolAction(
    meetingId: string,
    enabled: boolean,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase
        .from("meetings")
        .update({ carpool_enabled: enabled })
        .eq("id", meetingId);

    if (error) {
        return { success: false, error: "카풀 설정 변경에 실패했습니다." };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}

/**
 * 드라이버 등록
 * carpool_drivers_approved_insert RLS: driver_id=auth.uid() AND participations에 approved 상태
 */
export async function registerDriverAction(
    meetingId: string,
    departureLocation: string,
    availableSeats: number,
    departureAt: string,
): Promise<ActionResult<CarpoolDriverWithPassengers>> {
    const { supabase, userId } = await requireAuth();

    // 드라이버 등록 INSERT
    const { data: inserted, error: insertError } = await supabase
        .from("carpool_drivers")
        .insert({
            meeting_id: meetingId,
            driver_id: userId,
            departure_location: departureLocation,
            available_seats: availableSeats,
            departure_at: new Date(departureAt).toISOString(),
        })
        .select("id")
        .single();

    if (insertError) {
        // UNIQUE 제약 위반 시 (meeting_id, driver_id 중복)
        if (insertError.code === "23505") {
            return { success: false, error: "이미 드라이버로 등록되어 있습니다." };
        }
        return { success: false, error: "드라이버 등록에 실패했습니다." };
    }

    // 등록된 드라이버 + 프로필 조회
    const { data: driverData, error: fetchError } = await supabase
        .from("carpool_drivers")
        .select("*, profiles!carpool_drivers_driver_id_fkey(*)")
        .eq("id", inserted.id)
        .single();

    if (fetchError || !driverData) {
        return { success: false, error: "드라이버 정보 조회에 실패했습니다." };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);

    return {
        success: true,
        data: {
            ...driverData,
            driver: driverData.profiles as ProfileRow,
            passengers: [],
        } as CarpoolDriverWithPassengers,
    };
}

/**
 * 동승 신청
 * carpool_passengers_self_insert RLS: passenger_id=auth.uid() AND approved 참여자
 */
export async function applyPassengerAction(carpoolDriverId: string): Promise<ActionResult> {
    const { supabase, userId } = await requireAuth();

    // 드라이버의 meeting_id 조회 (revalidatePath용)
    const { data: driverData } = await supabase
        .from("carpool_drivers")
        .select("meeting_id")
        .eq("id", carpoolDriverId)
        .single();

    const { error } = await supabase.from("carpool_passengers").insert({
        carpool_driver_id: carpoolDriverId,
        passenger_id: userId,
        status: "pending",
    });

    if (error) {
        // UNIQUE 제약 위반 시 (carpool_driver_id, passenger_id 중복)
        if (error.code === "23505") {
            return { success: false, error: "이미 동승 신청한 드라이버입니다." };
        }
        return { success: false, error: "동승 신청에 실패했습니다." };
    }

    if (driverData?.meeting_id) {
        revalidatePath(`/protected/meetings/${driverData.meeting_id}`);
    }

    return { success: true, data: null };
}

/**
 * 동승 신청 수락
 * carpool_passengers_driver_update RLS: carpool_drivers.driver_id=auth.uid() UPDATE
 */
export async function acceptPassengerAction(
    passengerId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase
        .from("carpool_passengers")
        .update({ status: "accepted" })
        .eq("id", passengerId);

    if (error) {
        return { success: false, error: "동승 신청 수락에 실패했습니다." };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}

/**
 * 동승 신청 거절 (삭제)
 * carpool_passengers_self_delete 또는 driver_update RLS로 검증
 */
export async function rejectPassengerAction(
    passengerId: string,
    meetingId: string,
): Promise<ActionResult> {
    const { supabase } = await requireAuth();

    const { error } = await supabase.from("carpool_passengers").delete().eq("id", passengerId);

    if (error) {
        return { success: false, error: "동승 신청 거절에 실패했습니다." };
    }

    revalidatePath(`/protected/meetings/${meetingId}`);
    return { success: true, data: null };
}
