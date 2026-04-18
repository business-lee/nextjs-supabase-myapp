import { Suspense } from "react";

type Props = {
    params: Promise<{ token: string }>;
};

async function InviteContent({ params }: Props) {
    const { token } = await params;

    return (
        <div className="flex w-full max-w-md flex-col gap-6 text-center">
            <h1 className="text-3xl font-bold">모임 초대</h1>
            {/* Phase 2/3에서 모임 정보 및 참가 신청 UI 구현 예정 */}
            <p className="text-muted-foreground text-sm">초대 코드: {token}</p>
        </div>
    );
}

export default function InvitePage({ params }: Props) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-5">
            <Suspense fallback={<p className="text-muted-foreground text-sm">불러오는 중...</p>}>
                <InviteContent params={params} />
            </Suspense>
        </main>
    );
}
