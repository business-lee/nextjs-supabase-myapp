import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";

async function AdminContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    // TODO: Task 007 완료 후 profiles.is_admin 체크 추가 (Task 016)
    // const { data: profile } = await supabase.from('profiles').select('is_admin').single();
    // if (!profile?.is_admin) redirect('/protected');

    return (
        <div className="flex min-h-screen">
            {/* 사이드바 — 데스크톱 전용 */}
            <aside className="bg-background w-64 shrink-0 border-r">
                <div className="sticky top-0 p-6">
                    <h1 className="mb-1 text-lg font-bold">MeetUp Manager</h1>
                    <p className="text-muted-foreground mb-8 text-xs">관리자</p>
                    <nav className="flex flex-col gap-1">
                        <Link
                            href="/admin"
                            className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        >
                            대시보드
                        </Link>
                        <Link
                            href="/admin/events"
                            className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        >
                            이벤트 관리
                        </Link>
                        <Link
                            href="/admin/users"
                            className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        >
                            사용자 관리
                        </Link>
                        <Link
                            href="/admin/stats"
                            className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        >
                            통계 분석
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex flex-1 flex-col">
                <header className="bg-background flex h-14 items-center border-b px-8">
                    <span className="text-muted-foreground text-sm">관리자 콘솔</span>
                </header>
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background min-h-screen">
            <Suspense
                fallback={
                    <div className="flex min-h-screen items-center justify-center">로딩 중...</div>
                }
            >
                <AdminContent>{children}</AdminContent>
            </Suspense>
        </div>
    );
}
