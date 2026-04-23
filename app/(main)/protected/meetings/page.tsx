import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCreatedMeetingsAction, getJoinedMeetingsAction } from "@/lib/actions/meeting";
import { MeetingCard } from "@/components/meeting-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

async function MeetingsContent() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    const userId = data.claims.sub;
    const [createdMeetings, joinedMeetings] = await Promise.all([
        getCreatedMeetingsAction(userId),
        getJoinedMeetingsAction(userId),
    ]);

    return (
        <>
            {/* 내가 만든 모임 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-base font-semibold">
                    내가 만든 모임
                    <span className="text-muted-foreground ml-1.5 text-sm font-normal">
                        ({createdMeetings.length})
                    </span>
                </h2>
                {createdMeetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                        <p className="text-muted-foreground text-sm">아직 만든 모임이 없습니다.</p>
                        <Button asChild variant="outline" size="sm" className="mt-3">
                            <Link href="/protected/meetings/new">첫 모임 만들기</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {createdMeetings.map((meeting) => (
                            <MeetingCard key={meeting.id} {...meeting} />
                        ))}
                    </div>
                )}
            </section>

            {/* 내가 참여한 모임 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-base font-semibold">
                    내가 참여한 모임
                    <span className="text-muted-foreground ml-1.5 text-sm font-normal">
                        ({joinedMeetings.length})
                    </span>
                </h2>
                {joinedMeetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                        <p className="text-muted-foreground text-sm">
                            아직 참여한 모임이 없습니다.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {joinedMeetings.map((meeting) => (
                            <MeetingCard key={meeting.id} {...meeting} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

function MeetingsSkeleton() {
    return (
        <>
            {[0, 1].map((s) => (
                <div key={s} className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-32" />
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ))}
        </>
    );
}

export default function MeetingsPage() {
    return (
        <div className="flex flex-col gap-6 p-4">
            <h1 className="text-2xl font-bold">모임</h1>
            <Suspense fallback={<MeetingsSkeleton />}>
                <MeetingsContent />
            </Suspense>
        </div>
    );
}
