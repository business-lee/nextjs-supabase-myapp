import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import AdminSidebar from "@/app/admin/_components/AdminSidebar";

async function AdminContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    // TODO: Task 011(DB 마이그레이션) 완료 후 아래 주석 해제 (Task 020)
    // const { data: profile } = await supabase.from('profiles').select('is_admin').single();
    // if (!profile?.is_admin) redirect('/protected');

    return (
        <>
            {/* 개발 모드 배너 - 프로덕션에서는 표시 안됨 */}
            {process.env.NODE_ENV === "development" && (
                <div className="border-b border-yellow-300 bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-800">
                    ⚠ 개발 모드: Admin 접근 제어 미적용
                </div>
            )}

            <div className="flex min-h-screen">
                {/* 사이드바 — AdminSidebar 클라이언트 컴포넌트로 활성 메뉴 처리 */}
                <aside className="bg-background w-64 shrink-0 border-r">
                    <div className="sticky top-0 h-screen">
                        <AdminSidebar />
                    </div>
                </aside>

                {/* 메인 콘텐츠 영역 */}
                <main className="flex-1 p-8">{children}</main>
            </div>
        </>
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
