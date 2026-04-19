import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeetingForm } from "@/components/meeting-form";
import { Skeleton } from "@/components/ui/skeleton";

async function NewContent() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    return (
        <div className="flex flex-col gap-5 p-4">
            <div>
                <h1 className="text-2xl font-bold">새 모임 만들기</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    모임 정보를 입력하면 초대 링크가 자동 생성됩니다.
                </p>
            </div>
            <MeetingForm />
        </div>
    );
}

function NewSkeleton() {
    return (
        <div className="flex flex-col gap-5 p-4">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        </div>
    );
}

export default function MeetingNewPage() {
    return (
        <Suspense fallback={<NewSkeleton />}>
            <NewContent />
        </Suspense>
    );
}
