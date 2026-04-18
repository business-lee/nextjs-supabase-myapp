import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function NewMeetingContent() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    return (
        <div className="flex w-full flex-1 flex-col gap-8">
            <h1 className="text-3xl font-bold">모임 생성</h1>
            {/* Phase 2에서 모임 생성 폼 구현 예정 */}
            <p className="text-muted-foreground text-sm">모임 생성 폼은 Phase 2에서 구현됩니다.</p>
        </div>
    );
}

export default function MeetingNewPage() {
    return (
        <Suspense>
            <NewMeetingContent />
        </Suspense>
    );
}
