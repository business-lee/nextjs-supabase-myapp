import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMockMeetingById } from "@/lib/mock-data";
import { MeetingForm } from "@/components/meeting-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApprovalType } from "@/types/domain";

type Props = {
    params: Promise<{ id: string }>;
};

async function EditContent({ id }: { id: string }) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    // 더미 데이터에서 모임 정보 조회 (Phase 3에서 실제 DB 조회로 교체)
    const meeting = getMockMeetingById(id) ?? getMockMeetingById("meeting-001")!;

    // datetime-local input 형식으로 변환 (YYYY-MM-DDTHH:mm)
    const eventAtLocal = meeting.event_at.slice(0, 16);

    return (
        <div className="flex flex-col gap-5 p-4">
            <div>
                <h1 className="text-2xl font-bold">모임 수정</h1>
                <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{meeting.title}</p>
            </div>
            <MeetingForm
                isEditMode
                meetingId={id}
                defaultValues={{
                    title: meeting.title,
                    description: meeting.description ?? "",
                    event_at: eventAtLocal,
                    location: meeting.location ?? "",
                    max_participants: meeting.max_participants ?? undefined,
                    entry_fee: meeting.entry_fee,
                    approval_type: meeting.approval_type as ApprovalType,
                }}
            />
        </div>
    );
}

async function EditContentWrapper({ params }: Props) {
    const { id } = await params;
    return <EditContent id={id} />;
}

function EditSkeleton() {
    return (
        <div className="flex flex-col gap-5 p-4">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        </div>
    );
}

export default function MeetingEditPage({ params }: Props) {
    return (
        <Suspense fallback={<EditSkeleton />}>
            <EditContentWrapper params={params} />
        </Suspense>
    );
}
