"use client";

import { useMemo, useState } from "react";
import { getMockAdminMeetings } from "@/lib/mock-data";
import type { AdminMeetingRow } from "@/lib/mock-data";
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
// 모임 취소 확인 다이얼로그
// ─────────────────────────────────────────────

interface EventCancelDialogProps {
    meeting: AdminMeetingRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function EventCancelDialog({ meeting, open, onOpenChange }: EventCancelDialogProps) {
    function handleConfirm() {
        console.log("취소:", meeting?.id);
        onOpenChange(false);
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        닫기
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        취소 확인
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// 상태 배지 헬퍼
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    if (status === "upcoming") return <Badge variant="default">예정</Badge>;
    if (status === "closed") return <Badge variant="secondary">마감</Badge>;
    if (status === "cancelled") return <Badge variant="destructive">취소</Badge>;
    return <Badge variant="outline">{status}</Badge>;
}

// ─────────────────────────────────────────────
// 메인 페이지 컴포넌트
// ─────────────────────────────────────────────

const STATUS_FILTER_VALUES = {
    ALL: "all",
    UPCOMING: "upcoming",
    CLOSED: "closed",
    CANCELLED: "cancelled",
} as const;

type StatusFilterValue = (typeof STATUS_FILTER_VALUES)[keyof typeof STATUS_FILTER_VALUES];

export default function AdminEventsPage() {
    const meetings = getMockAdminMeetings();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(STATUS_FILTER_VALUES.ALL);
    const [cancelTarget, setCancelTarget] = useState<AdminMeetingRow | null>(null);

    const filteredMeetings = useMemo(() => {
        return meetings.filter((m) => {
            const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === STATUS_FILTER_VALUES.ALL || m.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [meetings, searchQuery, statusFilter]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">이벤트 관리</h1>

            {/* 검색 및 필터 영역 */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                    placeholder="제목으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sm:max-w-xs"
                />
                <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as StatusFilterValue)}
                >
                    <SelectTrigger className="sm:max-w-[160px]">
                        <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={STATUS_FILTER_VALUES.ALL}>전체</SelectItem>
                        <SelectItem value={STATUS_FILTER_VALUES.UPCOMING}>예정</SelectItem>
                        <SelectItem value={STATUS_FILTER_VALUES.CLOSED}>마감</SelectItem>
                        <SelectItem value={STATUS_FILTER_VALUES.CANCELLED}>취소</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 모임 목록 테이블 */}
            {filteredMeetings.length === 0 ? (
                <div className="text-muted-foreground py-16 text-center text-sm">
                    검색 결과가 없습니다.
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
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
                            {filteredMeetings.map((meeting) => (
                                <TableRow key={meeting.id}>
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
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setCancelTarget(meeting)}
                                        >
                                            취소
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* 취소 확인 다이얼로그 */}
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
