import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

async function DashboardContent() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    return (
        <div className="flex w-full flex-1 flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">내 모임 목록</h1>
                <Button asChild>
                    <Link href="/protected/meetings/new">+ 새 모임 만들기</Link>
                </Button>
            </div>

            {/* 빈 상태 UI - Phase 2에서 실제 모임 목록으로 교체 예정 */}
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <p className="text-muted-foreground text-sm">아직 생성한 모임이 없습니다.</p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/protected/meetings/new">첫 모임 만들기</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProtectedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex w-full flex-1 flex-col gap-8">
                    <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
                    <div className="h-40 animate-pulse rounded bg-gray-200" />
                </div>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}
