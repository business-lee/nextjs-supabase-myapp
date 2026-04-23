import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

    const userId = data.claims.sub;

    // 본인이 호스트인 모임만 수정 가능
    const { data: meeting } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", id)
        .eq("host_id", userId)
        .single();

    if (!meeting) {
        redirect("/protected/meetings");
    }

    // datetime-local input은 로컬 시간 기준으로 변환해야 함 (UTC 그대로 쓰면 시차 오류 발생)
    const d = new Date(meeting.event_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    const eventAtLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

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
                    thumbnail_url: meeting.thumbnail_url ?? null,
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
