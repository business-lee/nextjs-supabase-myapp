"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createNoticeAction, updateNoticeAction, deleteNoticeAction } from "@/lib/actions/notice";
import type { NoticeRow } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Pin, Trash2 } from "lucide-react";

interface NoticesTabProps {
    meetingId: string;
    isHost: boolean;
    initialNotices: NoticeRow[];
}

// 공지 정렬 함수: 고정 공지 우선, 이후 최신순
function sortNotices(notices: NoticeRow[]): NoticeRow[] {
    return [...notices].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

// 공지 작성/수정 다이얼로그
function NoticeDialog({
    open,
    onOpenChange,
    initialData,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Partial<NoticeRow>;
    onSave: (title: string, content: string, isPinned: boolean) => void | Promise<void>;
}) {
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [content, setContent] = useState(initialData?.content ?? "");
    const [isPinned, setIsPinned] = useState(initialData?.is_pinned ?? false);

    async function handleSave() {
        if (!title.trim()) {
            toast.error("공지 제목을 입력해주세요.");
            return;
        }
        await onSave(title, content, isPinned);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData?.id ? "공지 수정" : "공지 작성"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="notice-title">제목</Label>
                        <Input
                            id="notice-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="공지 제목을 입력해주세요"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="notice-content">내용</Label>
                        <Textarea
                            id="notice-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="공지 내용을 입력해주세요"
                            rows={5}
                            className="resize-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is-pinned"
                            checked={isPinned}
                            onCheckedChange={(checked) => setIsPinned(checked === true)}
                        />
                        <Label htmlFor="is-pinned" className="cursor-pointer">
                            상단 고정
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={handleSave}>저장</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function NoticesTab({ meetingId, isHost, initialNotices }: NoticesTabProps) {
    // 서버에서 pre-fetch된 초기 데이터로 상태 초기화 (고정 공지 우선 정렬)
    const [notices, setNotices] = useState<NoticeRow[]>(sortNotices(initialNotices));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<NoticeRow | undefined>(undefined);

    function handleOpenCreate() {
        setEditTarget(undefined);
        setDialogOpen(true);
    }

    function handleOpenEdit(notice: NoticeRow) {
        setEditTarget(notice);
        setDialogOpen(true);
    }

    function handleDialogOpenChange(open: boolean) {
        setDialogOpen(open);
        if (!open) setEditTarget(undefined);
    }

    async function handleSave(title: string, content: string, isPinned: boolean) {
        if (editTarget) {
            // 기존 공지 수정 — Server Action 호출
            const result = await updateNoticeAction(
                editTarget.id,
                meetingId,
                title,
                content,
                isPinned,
            );
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            setNotices((prev) =>
                sortNotices(prev.map((n) => (n.id === editTarget.id ? result.data : n))),
            );
            toast.success("공지가 수정되었습니다.");
        } else {
            // 새 공지 생성 — Server Action 호출
            const result = await createNoticeAction(meetingId, title, content, isPinned);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            setNotices((prev) => sortNotices([result.data, ...prev]));
            toast.success("공지가 작성되었습니다.");
        }
    }

    async function handleDelete(noticeId: string) {
        // 공지 삭제 — Server Action 호출
        const result = await deleteNoticeAction(noticeId, meetingId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setNotices((prev) => prev.filter((n) => n.id !== noticeId));
        toast.success("공지가 삭제되었습니다.");
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
        });
    }

    return (
        <div className="flex flex-col gap-4">
            {isHost && (
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleOpenCreate}>
                        + 공지 작성
                    </Button>
                </div>
            )}

            {notices.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                    등록된 공지가 없습니다.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {notices.map((notice) => (
                        <Card
                            key={notice.id}
                            className={notice.is_pinned ? "border-primary/40 bg-primary/5" : ""}
                        >
                            <CardContent className="flex flex-col gap-2 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-1 items-center gap-2">
                                        {notice.is_pinned && (
                                            <Pin size={14} className="text-primary shrink-0" />
                                        )}
                                        <span className="font-medium">{notice.title}</span>
                                        {notice.is_pinned && (
                                            <Badge variant="secondary" className="text-xs">
                                                고정
                                            </Badge>
                                        )}
                                    </div>
                                    {isHost && (
                                        <div className="flex shrink-0 gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleOpenEdit(notice)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive h-7 w-7"
                                                onClick={() => handleDelete(notice.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                    {notice.content}
                                </p>
                                <span className="text-muted-foreground text-xs">
                                    {formatDate(notice.created_at)}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <NoticeDialog
                key={`${editTarget?.id ?? "new"}-${dialogOpen}`}
                open={dialogOpen}
                onOpenChange={handleDialogOpenChange}
                initialData={editTarget}
                onSave={handleSave}
            />
        </div>
    );
}
