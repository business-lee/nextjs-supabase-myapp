"use client";

import { useState } from "react";
import { toast } from "sonner";
import { approveParticipationAction, rejectParticipationAction } from "@/lib/actions/participation";
import type { ParticipationWithUser } from "@/types/domain";
import { PARTICIPATION_STATUS } from "@/types/domain";
import type { ProfileRow } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";

interface ParticipantsTabProps {
    meetingId: string;
    isHost: boolean;
    currentUserId: string;
    initialParticipations: ParticipationWithUser[];
    hostProfile: ProfileRow | null;
}

// 상태 배지 스타일
function StatusBadge({ status, waitlistOrder }: { status: string; waitlistOrder?: number | null }) {
    if (status === PARTICIPATION_STATUS.APPROVED) {
        return <Badge className="bg-green-500 text-white hover:bg-green-600">승인</Badge>;
    }
    if (status === PARTICIPATION_STATUS.PENDING) {
        return <Badge variant="secondary">대기</Badge>;
    }
    if (status === PARTICIPATION_STATUS.REJECTED) {
        return <Badge variant="destructive">거절</Badge>;
    }
    if (status === PARTICIPATION_STATUS.WAITLISTED) {
        return (
            <Badge variant="outline">
                대기 {waitlistOrder != null ? `${waitlistOrder}번` : ""}
            </Badge>
        );
    }
    return null;
}

function getInitials(name: string | null): string {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
}

export function ParticipantsTab({
    meetingId,
    isHost,
    currentUserId,
    initialParticipations,
    hostProfile,
}: ParticipantsTabProps) {
    const [participations, setParticipations] =
        useState<ParticipationWithUser[]>(initialParticipations);

    const stats = {
        approved: participations.filter((p) => p.status === PARTICIPATION_STATUS.APPROVED).length,
        pending: participations.filter((p) => p.status === PARTICIPATION_STATUS.PENDING).length,
        rejected: participations.filter((p) => p.status === PARTICIPATION_STATUS.REJECTED).length,
    };

    async function handleApprove(id: string) {
        const result = await approveParticipationAction(id);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setParticipations((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: PARTICIPATION_STATUS.APPROVED } : p)),
        );
        toast.success("참가 신청을 승인했습니다.");
    }

    async function handleReject(participationId: string) {
        const result = await rejectParticipationAction(participationId, meetingId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setParticipations((prev) =>
            prev.map((p) =>
                p.id === participationId ? { ...p, status: PARTICIPATION_STATUS.REJECTED } : p,
            ),
        );
        toast.success("참가 신청을 거절했습니다.");
    }

    if (!isHost) {
        // 참여자 뷰: 주최자 카드 + 본인 상태 표시
        const myParticipation = participations.find((p) => p.user_id === currentUserId);
        return (
            <div className="flex flex-col gap-3">
                {/* 주최자 카드 */}
                {hostProfile && (
                    <Card>
                        <CardContent className="flex items-center gap-3 p-3">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback>
                                    {getInitials(hostProfile.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col gap-0.5">
                                <span className="font-medium">
                                    {hostProfile.full_name ?? "주최자"}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {hostProfile.email}
                                </span>
                            </div>
                            <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                                주최자
                            </Badge>
                        </CardContent>
                    </Card>
                )}
                {/* 내 참가 상태 */}
                {myParticipation && (
                    <Card>
                        <CardContent className="flex items-center gap-3 p-3">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback>
                                    {getInitials(myParticipation.user.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col gap-0.5">
                                <span className="font-medium">
                                    {myParticipation.user.full_name}
                                </span>
                            </div>
                            <StatusBadge
                                status={myParticipation.status}
                                waitlistOrder={myParticipation.waitlist_order}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* 참여 통계 배지 */}
            <div className="flex gap-2">
                <Badge className="bg-green-500 text-white hover:bg-green-600">
                    승인 {stats.approved}
                </Badge>
                <Badge variant="secondary">대기 {stats.pending}</Badge>
                <Badge variant="destructive">거절 {stats.rejected}</Badge>
            </div>

            {/* 신청자 목록 */}
            <div className="flex flex-col gap-3">
                {/* 주최자 카드 — 항상 상단 고정 */}
                {hostProfile && (
                    <Card>
                        <CardContent className="flex items-center gap-3 p-3">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback>
                                    {getInitials(hostProfile.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col gap-0.5">
                                <span className="font-medium">
                                    {hostProfile.full_name ?? "주최자"}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {hostProfile.email}
                                </span>
                            </div>
                            <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                                주최자
                            </Badge>
                        </CardContent>
                    </Card>
                )}
                {participations.length === 0 ? (
                    <p className="text-muted-foreground py-10 text-center text-sm">
                        참가 신청자가 없습니다.
                    </p>
                ) : (
                    participations.map((p) => (
                        <Card key={p.id}>
                            <CardContent className="flex items-center gap-3 p-3">
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarFallback>{getInitials(p.user.full_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 flex-col gap-0.5">
                                    <span className="font-medium">{p.user.full_name}</span>
                                    <span className="text-muted-foreground text-xs">
                                        {p.user.email}
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <StatusBadge
                                        status={p.status}
                                        waitlistOrder={p.waitlist_order}
                                    />
                                    {p.status === PARTICIPATION_STATUS.PENDING && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                onClick={() => handleApprove(p.id)}
                                            >
                                                <Check size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                                onClick={() => handleReject(p.id)}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
