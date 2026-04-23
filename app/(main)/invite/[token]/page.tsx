import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    getMeetingByTokenAction,
    getMyParticipationAction,
    getParticipationStatsAction,
} from "@/lib/actions/participation";
import { InviteView } from "@/components/invite-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { ParticipationStatus } from "@/types/domain";

type Props = {
    params: Promise<{ token: string }>;
};

function InvitePageSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Card>
                <CardContent className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

async function InviteContent({ token }: { token: string }) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const isLoggedIn = !!data?.claims;
    const userId = data?.claims?.sub ?? null;

    // 실제 DB 조회 (anon 접근 가능 — meetings_anon_select RLS 허용)
    const meeting = await getMeetingByTokenAction(token);

    if (!meeting) {
        return (
            <div className="flex flex-col items-center gap-4 p-4 py-16 text-center">
                <p className="text-muted-foreground">유효하지 않은 초대 링크입니다.</p>
                <Button asChild variant="outline">
                    <Link href="/">홈으로 돌아가기</Link>
                </Button>
            </div>
        );
    }

    // 주최자 여부 확인 (로그인된 경우만)
    const isHost = isLoggedIn && userId ? meeting.host_id === userId : false;

    // 내 참가 상태 조회 (로그인된 비주최자만)
    let initialParticipationStatus: ParticipationStatus | null = null;
    if (isLoggedIn && !isHost && userId) {
        const myParticipation = await getMyParticipationAction(meeting.id);
        initialParticipationStatus = (myParticipation?.status ??
            null) as ParticipationStatus | null;
    }

    // 참가 통계 조회 (approved 수를 총 참가자 수로 표시)
    const stats = await getParticipationStatsAction(meeting.id);

    return (
        <InviteView
            meeting={meeting}
            isLoggedIn={isLoggedIn}
            token={token}
            isHost={isHost}
            initialParticipationStatus={initialParticipationStatus}
            hostName={meeting.host?.full_name ?? "주최자"}
            totalParticipantCount={stats.approved}
        />
    );
}

export default function InvitePage({ params }: Props) {
    return (
        <Suspense fallback={<InvitePageSkeleton />}>
            <InvitePageContent params={params} />
        </Suspense>
    );
}

async function InvitePageContent({ params }: Props) {
    const { token } = await params;
    return <InviteContent token={token} />;
}
