"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { applyParticipationAction } from "@/lib/actions/participation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { MeetingWithHost } from "@/types/domain";
import type { ParticipationStatus } from "@/types/domain";

interface InviteViewProps {
    meeting: MeetingWithHost;
    isLoggedIn: boolean;
    token: string;
    isHost: boolean;
    initialParticipationStatus: ParticipationStatus | null;
    hostName: string;
    totalParticipantCount: number;
}

function formatEventDate(eventAt: string): string {
    const date = new Date(eventAt);
    const dateStr = date.toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    });
    const parts = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${dateStr} ${hh}:${mm}`;
}

function ParticipationStatusBadge({ status }: { status: ParticipationStatus }) {
    if (status === "approved") {
        return <Badge className="bg-green-500 text-white hover:bg-green-600">승인됨</Badge>;
    }
    if (status === "pending") {
        return <Badge variant="secondary">검토 중</Badge>;
    }
    if (status === "rejected") {
        return <Badge variant="destructive">거절됨</Badge>;
    }
    return null;
}

export function InviteView({
    meeting,
    isLoggedIn,
    token,
    isHost,
    initialParticipationStatus,
    hostName,
    totalParticipantCount,
}: InviteViewProps) {
    const [participationStatus, setParticipationStatus] = useState<ParticipationStatus | null>(
        initialParticipationStatus,
    );
    const [applying, setApplying] = useState(false);

    async function handleApply() {
        setApplying(true);
        try {
            const result = await applyParticipationAction(meeting.id);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            setParticipationStatus(result.data.status);
            if (result.data.status === "approved") {
                toast.success("참가 신청이 완료되었습니다. 바로 승인되었습니다!");
            } else if (result.data.status === "waitlisted") {
                toast.success("참가 신청이 완료되었습니다. 대기자 명단에 등록되었습니다.");
            } else {
                toast.success("참가 신청이 완료되었습니다. 주최자의 승인을 기다려주세요.");
            }
        } finally {
            setApplying(false);
        }
    }

    return (
        <div className="flex flex-col gap-5 p-4">
            <div>
                <p className="text-muted-foreground mb-1 text-sm">{hostName} 님이 초대합니다</p>
                <h1 className="text-2xl font-bold">{meeting.title}</h1>
            </div>

            {/* 모임 기본 정보 카드 */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">모임 정보</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="text-muted-foreground flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={14} className="shrink-0" />
                            <span>{formatEventDate(meeting.event_at)}</span>
                        </div>
                        {meeting.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="shrink-0" />
                                <span>{meeting.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users size={14} className="shrink-0" />
                            <span>참여자 {totalParticipantCount}명</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-muted-foreground text-sm">주최자</span>
                        <span className="font-semibold">{hostName}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-muted-foreground text-sm">참가비</span>
                        <span className="font-semibold">
                            {meeting.entry_fee > 0
                                ? `${meeting.entry_fee.toLocaleString()}원`
                                : "무료"}
                        </span>
                    </div>
                    {meeting.description && (
                        <p className="text-muted-foreground border-t pt-3 text-sm">
                            {meeting.description}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* 참가 신청 영역 */}
            {!isLoggedIn ? (
                // 비로그인: 로그인 유도
                <div className="flex flex-col gap-3">
                    <p className="text-muted-foreground text-center text-sm">
                        참가 신청을 하려면 로그인이 필요합니다.
                    </p>
                    <Button asChild>
                        <Link href={`/auth/login?redirect=/invite/${token}`}>로그인하여 신청</Link>
                    </Button>
                </div>
            ) : isHost ? (
                // 주최자 본인이 접속한 경우
                <div className="bg-muted/30 flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                    <p className="text-sm font-medium">내가 만든 모임입니다</p>
                    <p className="text-muted-foreground text-xs">
                        참여자 관리는 모임 상세 페이지에서 할 수 있습니다.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-1">
                        <Link href={`/protected/meetings/${meeting.id}`}>모임 상세 보기</Link>
                    </Button>
                </div>
            ) : participationStatus !== null ? (
                // 로그인 + 이미 신청: 상태 표시
                <div className="flex flex-col items-center gap-3 rounded-lg border p-4 text-center">
                    <p className="text-muted-foreground text-sm">내 참가 신청 상태</p>
                    <ParticipationStatusBadge status={participationStatus} />
                    {participationStatus === "pending" && (
                        <p className="text-muted-foreground text-xs">
                            주최자가 검토 중입니다. 잠시만 기다려주세요.
                        </p>
                    )}
                    {participationStatus === "approved" && (
                        <Button asChild variant="outline" size="sm" className="mt-1">
                            <Link href={`/protected/meetings/${meeting.id}`}>모임 상세 보기</Link>
                        </Button>
                    )}
                </div>
            ) : (
                // 로그인 + 미신청: 신청 버튼
                <div className="flex flex-col gap-3">
                    <Button size="lg" onClick={handleApply} disabled={applying}>
                        {applying ? "신청 중..." : "참가 신청"}
                    </Button>
                    <p className="text-muted-foreground text-center text-xs">
                        {meeting.approval_type === "auto"
                            ? "선착순으로 자동 승인됩니다."
                            : "신청 후 주최자의 승인이 필요합니다."}
                    </p>
                </div>
            )}
        </div>
    );
}
