import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import AdminSidebar from "@/app/admin/_components/AdminSidebar";
import AdminLoginPage from "@/app/admin/_components/AdminLoginPage";

async function AdminContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    // 미인증 → 로그인 UI (사이드바 없음)
    if (error || !data?.claims) {
        return <AdminLoginPage />;
    }

    // 인증됨 → 관리자 권한 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.claims.sub as string)
        .single();

    // 관리자 권한 없음 → 접근 거부 UI (사이드바 없음)
    if (!profile?.is_admin) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold">접근 권한 없음</h1>
                    <p className="text-muted-foreground">관리자 권한이 필요한 페이지입니다.</p>
                </div>
            </div>
        );
    }

    const user = {
        name: (data.claims.full_name as string | null) ?? null,
        email: (data.claims.email as string | null) ?? null,
        avatar_url: (data.claims.avatar_url as string | null) ?? null,
    };

    return (
        <div className="flex min-h-screen">
            {/* 사이드바 — AdminSidebar 클라이언트 컴포넌트로 활성 메뉴 처리 */}
            <aside className="bg-admin-primary w-64 shrink-0">
                <div className="sticky top-0 h-screen">
                    <AdminSidebar user={user} />
                </div>
            </aside>

            {/* 메인 콘텐츠 영역 */}
            <main className="flex-1 p-8">{children}</main>
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
