import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Tab = {
    key: string;
    label: string;
};

const TABS: Tab[] = [
    { key: "notices", label: "공지사항" },
    { key: "participants", label: "참여자" },
    { key: "carpool", label: "카풀" },
    { key: "settlement", label: "정산" },
];

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
};

async function MeetingDetailContent({ params, searchParams }: Props) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const { tab = "notices" } = await searchParams;

    return (
        <div className="flex w-full flex-1 flex-col gap-8">
            {/* 모임 헤더 - Phase 2에서 실제 데이터로 교체 예정 */}
            <div>
                <h1 className="text-3xl font-bold">모임 상세</h1>
                <p className="text-muted-foreground mt-1 text-sm">모임 ID: {id}</p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b">
                <nav className="flex gap-4">
                    {TABS.map((t) => (
                        <Link
                            key={t.key}
                            href={`/protected/meetings/${id}?tab=${t.key}`}
                            className={`pb-3 text-sm font-medium transition-colors ${
                                tab === t.key
                                    ? "border-b-2 border-current"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* 탭별 콘텐츠 - Phase 2에서 구현 예정 */}
            <section>
                {tab === "notices" && (
                    <p className="text-muted-foreground text-sm">
                        공지사항 탭 - Phase 2에서 구현 예정
                    </p>
                )}
                {tab === "participants" && (
                    <p className="text-muted-foreground text-sm">
                        참여자 탭 - Phase 2에서 구현 예정
                    </p>
                )}
                {tab === "carpool" && (
                    <p className="text-muted-foreground text-sm">카풀 탭 - Phase 2에서 구현 예정</p>
                )}
                {tab === "settlement" && (
                    <p className="text-muted-foreground text-sm">정산 탭 - Phase 2에서 구현 예정</p>
                )}
            </section>
        </div>
    );
}

export default function MeetingDetailPage({ params, searchParams }: Props) {
    return (
        <Suspense>
            <MeetingDetailContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
