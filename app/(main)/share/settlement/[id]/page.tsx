import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Circle } from "lucide-react";

// ─────────────────────────────────────────────
// 타입 정의 (get_public_settlement RPC 반환값)
// ─────────────────────────────────────────────

interface PublicSettlementItem {
    id: string;
    name: string;
    amount: number;
}

interface PublicSettlementParticipant {
    id: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    amount_due: number;
    is_paid: boolean;
    paid_at: string | null;
}

interface PublicSettlement {
    id: string;
    meeting_id: string;
    meeting_title: string;
    total_amount: number;
    split_type: string;
    created_at: string;
}

interface PublicSettlementData {
    settlement: PublicSettlement;
    items: PublicSettlementItem[];
    participants: PublicSettlementParticipant[];
}

// ─────────────────────────────────────────────
// 데이터 조회
// ─────────────────────────────────────────────

async function getPublicSettlement(settlementId: string): Promise<PublicSettlementData | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_settlement", {
        p_settlement_id: settlementId,
    });
    if (error || !data) return null;
    return data as unknown as PublicSettlementData;
}

// ─────────────────────────────────────────────
// 페이지 컴포넌트
// ─────────────────────────────────────────────

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ShareSettlementPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getPublicSettlement(id);

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold">정산 정보를 찾을 수 없습니다</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        링크가 올바른지 확인해주세요.
                    </p>
                </div>
            </div>
        );
    }

    const { settlement, items, participants } = data;
    const paidCount = participants.filter((p) => p.is_paid).length;

    return (
        <div className="mx-auto max-w-[530px] space-y-4 p-4 pb-8">
            {/* 헤더 */}
            <div className="pt-4 text-center">
                <p className="text-muted-foreground text-sm">정산 현황</p>
                <h1 className="mt-1 text-xl font-bold">{settlement.meeting_title}</h1>
            </div>

            {/* 정산 요약 카드 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">정산 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">총 금액</span>
                        <span className="font-semibold">
                            {settlement.total_amount.toLocaleString()}원
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">정산 방식</span>
                        <Badge variant="outline">
                            {settlement.split_type === "equal" ? "1/N 균등" : "수동 입력"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">납부 현황</span>
                        <span className="text-sm font-medium">
                            {paidCount}/{participants.length}명 완료
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* 비용 항목 */}
            {items.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">비용 항목</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {items.map((item) => (
                                <li key={item.id} className="flex justify-between py-2 text-sm">
                                    <span>{item.name}</span>
                                    <span className="font-medium">
                                        {item.amount.toLocaleString()}원
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* 참여자별 납부 현황 */}
            {participants.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">참여자별 납부 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {participants.map((participant) => (
                                <li
                                    key={participant.id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            {participant.avatar_url && (
                                                <AvatarImage
                                                    src={participant.avatar_url}
                                                    alt={participant.full_name ?? ""}
                                                />
                                            )}
                                            <AvatarFallback className="text-xs">
                                                {participant.full_name?.charAt(0) ?? "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">
                                            {participant.full_name ?? "이름 없음"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                            {participant.amount_due.toLocaleString()}원
                                        </span>
                                        {participant.is_paid ? (
                                            <CheckCircle2
                                                size={18}
                                                className="text-green-500"
                                                aria-label="납부 완료"
                                            />
                                        ) : (
                                            <Circle
                                                size={18}
                                                className="text-muted-foreground"
                                                aria-label="미납부"
                                            />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <p className="text-muted-foreground text-center text-xs">
                이 페이지는 공유 링크로 접속한 읽기 전용 페이지입니다.
            </p>
        </div>
    );
}
