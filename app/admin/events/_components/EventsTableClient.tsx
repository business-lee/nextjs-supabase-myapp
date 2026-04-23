"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { AdminMeetingRow } from "@/lib/actions/admin";
import { forceCancelMeetingAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// ─────────────────────────────────────────────
// 모임 강제 취소 확인 다이얼로그
// ─────────────────────────────────────────────

interface EventCancelDialogProps {
    meeting: AdminMeetingRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function EventCancelDialog({ meeting, open, onOpenChange }: EventCancelDialogProps) {
    const [isPending, startTransition] = useTransition();

    function handleConfirm() {
        if (!meeting) return;
        startTransition(async () => {
            const result = await forceCancelMeetingAction(meeting.id);
            if (result.success) {
                toast.success("모임이 취소되었습니다.");
                onOpenChange(false);
            } else {
                toast.error(result.error);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>모임 취소</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm">정말 이 모임을 취소하시겠습니까?</p>
                    {meeting && (
                        <p className="text-muted-foreground mt-2 text-sm font-medium">
                            &ldquo;{meeting.title}&rdquo;
                        </p>
                    )}
                    <p className="text-muted-foreground mt-2 text-xs">
                        이 작업은 되돌릴 수 없습니다.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        닫기
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
                        {isPending ? "처리 중..." : "취소 확인"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// 상태 배지
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    if (status === "upcoming") return <Badge variant="default">예정</Badge>;
    if (status === "closed") return <Badge variant="secondary">마감</Badge>;
    if (status === "cancelled") return <Badge variant="destructive">취소</Badge>;
    return <Badge variant="outline">{status}</Badge>;
}

// ─────────────────────────────────────────────
// 메인 클라이언트 컴포넌트
// ─────────────────────────────────────────────

interface EventsTableClientProps {
    meetings: AdminMeetingRow[];
    initialQ: string;
    initialStatus: string;
}

export function EventsTableClient({ meetings, initialQ, initialStatus }: EventsTableClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cancelTarget, setCancelTarget] = useState<AdminMeetingRow | null>(null);

    function updateURL(q: string, status: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (q) {
            params.set("q", q);
        } else {
            params.delete("q");
        }
        if (status && status !== "all") {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        router.push(`/admin/events?${params.toString()}`);
    }

    return (
        <div className="space-y-4">
            {/* 검색 및 필터 */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                    placeholder="제목으로 검색..."
                    defaultValue={initialQ}
                    onChange={(e) => updateURL(e.target.value, initialStatus)}
                    className="sm:max-w-xs"
                />
                <Select
                    defaultValue={initialStatus || "all"}
                    onValueChange={(v) => updateURL(initialQ, v)}
                >
                    <SelectTrigger className="sm:max-w-[160px]">
                        <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="upcoming">예정</SelectItem>
                        <SelectItem value="closed">마감</SelectItem>
                        <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 모임 목록 테이블 */}
            {meetings.length === 0 ? (
                <div className="text-muted-foreground py-16 text-center text-sm">
                    검색 결과가 없습니다.
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-6 py-4 text-center">썸네일</TableHead>
                                <TableHead className="px-6 py-4 text-center">제목</TableHead>
                                <TableHead className="px-6 py-4 text-center">주최자</TableHead>
                                <TableHead className="px-6 py-4 text-center">날짜</TableHead>
                                <TableHead className="px-6 py-4 text-center">상태</TableHead>
                                <TableHead className="px-6 py-4 text-center">참가인원</TableHead>
                                <TableHead className="px-6 py-4 text-center">
                                    초대링크 코드
                                </TableHead>
                                <TableHead className="px-6 py-4 text-center">액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meetings.map((meeting) => (
                                <TableRow key={meeting.id}>
                                    <TableCell className="px-6 py-4 text-center">
                                        {meeting.thumbnail_url ? (
                                            <div className="relative mx-auto h-10 w-16 overflow-hidden rounded">
                                                <Image
                                                    src={meeting.thumbnail_url}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-muted mx-auto flex h-10 w-16 items-center justify-center rounded">
                                                <ImageIcon
                                                    size={16}
                                                    className="text-muted-foreground/40"
                                                />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 font-medium">
                                        {meeting.title}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground px-6 py-4 text-center">
                                        {meeting.host_name ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground px-6 py-4 text-center">
                                        {new Date(meeting.event_at).toLocaleDateString("ko-KR")}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <StatusBadge status={meeting.status} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground px-6 py-4 text-center">
                                        {meeting.participant_count}/
                                        {meeting.max_participants ?? "∞"}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <code className="bg-muted rounded px-2 py-1 text-xs">
                                            {meeting.invite_token ?? "-"}
                                        </code>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        {meeting.status !== "cancelled" && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setCancelTarget(meeting)}
                                            >
                                                취소
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <EventCancelDialog
                meeting={cancelTarget}
                open={cancelTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setCancelTarget(null);
                }}
            />
        </div>
    );
}
