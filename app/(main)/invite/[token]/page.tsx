import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    getMockMeetingByToken,
    getMockIsHost,
    getMockMyParticipation,
    getMockParticipationStats,
} from "@/lib/mock-data";
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

    // 더미 모임 데이터 조회 (Phase 3에서 실제 DB 조회로 교체)
    const meeting = getMockMeetingByToken(token);

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

    // 주최자 여부 및 참가 상태 확인 (Phase 3에서 실제 DB 조회로 교체)
    const isHost = isLoggedIn ? getMockIsHost(meeting.id) : false;
    const myParticipation = isLoggedIn && !isHost ? getMockMyParticipation(meeting.id) : null;
    const initialParticipationStatus = (myParticipation?.status ??
        null) as ParticipationStatus | null;
    const stats = getMockParticipationStats(meeting.id);

    return (
        <InviteView
            meeting={meeting}
            isLoggedIn={isLoggedIn}
            token={token}
            isHost={isHost}
            initialParticipationStatus={initialParticipationStatus}
            hostName={meeting.host.full_name ?? "주최자"}
            totalParticipantCount={stats.total}
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
