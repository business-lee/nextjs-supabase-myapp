import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyParticipationAction, getParticipationsAction } from "@/lib/actions/participation";
import { getNoticesAction } from "@/lib/actions/notice";
import { getCarpoolDriversAction } from "@/lib/actions/carpool";
import { getSettlementAction } from "@/lib/actions/settlement";
import { MeetingDetailClient } from "./meeting-detail-client";
import type { MeetingWithHost } from "@/types/domain";
import type { ProfileRow } from "@/types/database";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
};

async function MeetingDetailContent({ params, searchParams }: Props) {
    const { id } = await params;
    const { tab = "notices" } = await searchParams;

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    // 미인증 사용자 리다이렉트
    if (!data?.claims) redirect("/auth/login");
    const userId = data.claims.sub;

    // 모임 + 주최자 프로필 조회
    const { data: meetingData, error } = await supabase
        .from("meetings")
        .select("*, profiles!meetings_host_id_fkey(*)")
        .eq("id", id)
        .single();

    if (error || !meetingData) redirect("/protected/meetings");

    // Supabase join 결과의 profiles 키를 host로 변환
    const meeting: MeetingWithHost = {
        ...meetingData,
        host: meetingData.profiles as ProfileRow,
    };

    const isHost = meetingData.host_id === userId;

    // 내 참가 상태 조회 (주최자가 아닌 경우만)
    const myParticipation = isHost ? null : await getMyParticipationAction(id);

    // 참여자 탭 초기 데이터 서버에서 pre-fetch
    const initialParticipations = await getParticipationsAction(id);

    // 공지사항 탭 초기 데이터 서버에서 pre-fetch
    const initialNotices = await getNoticesAction(id);

    // 카풀 탭 초기 데이터 서버에서 pre-fetch
    const initialCarpoolDrivers = await getCarpoolDriversAction(id);

    // 정산 탭 초기 데이터 서버에서 pre-fetch
    const initialSettlement = await getSettlementAction(id);

    return (
        <MeetingDetailClient
            id={id}
            tab={tab}
            meeting={meeting}
            isHost={isHost}
            myParticipation={myParticipation}
            currentUserId={userId}
            initialParticipations={initialParticipations}
            initialNotices={initialNotices}
            initialCarpoolEnabled={meetingData.carpool_enabled ?? false}
            initialCarpoolDrivers={initialCarpoolDrivers}
            initialSettlement={initialSettlement}
        />
    );
}

export default function MeetingDetailPage({ params, searchParams }: Props) {
    return (
        <Suspense fallback={null}>
            <MeetingDetailContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
