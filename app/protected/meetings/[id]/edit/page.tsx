import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

type Props = {
    params: Promise<{ id: string }>;
};

async function EditContent({ params }: Props) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    const { id } = await params;

    return (
        <div className="flex w-full flex-1 flex-col gap-8">
            <h1 className="text-3xl font-bold">모임 수정</h1>
            {/* Phase 2에서 모임 수정 폼 구현 예정 */}
            <p className="text-muted-foreground text-sm">
                모임 ID: {id} 수정 폼은 Phase 2에서 구현됩니다.
            </p>
        </div>
    );
}

export default function MeetingEditPage({ params }: Props) {
    return (
        <Suspense>
            <EditContent params={params} />
        </Suspense>
    );
}
