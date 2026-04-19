"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MOCK_NOTICES } from "@/lib/mock-data";
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
    onSave: (title: string, content: string, isPinned: boolean) => void;
}) {
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [content, setContent] = useState(initialData?.content ?? "");
    const [isPinned, setIsPinned] = useState(initialData?.is_pinned ?? false);

    function handleSave() {
        if (!title.trim()) {
            toast.error("공지 제목을 입력해주세요.");
            return;
        }
        onSave(title, content, isPinned);
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

export function NoticesTab({ meetingId: _meetingId, isHost }: NoticesTabProps) {
    const [notices, setNotices] = useState<NoticeRow[]>(
        // 고정 공지를 최상단으로 정렬
        [...MOCK_NOTICES].sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }),
    );

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

    function handleSave(title: string, content: string, isPinned: boolean) {
        if (editTarget) {
            // 수정 더미 처리
            setNotices((prev) =>
                prev
                    .map((n) =>
                        n.id === editTarget.id ? { ...n, title, content, is_pinned: isPinned } : n,
                    )
                    .sort((a, b) => {
                        if (a.is_pinned && !b.is_pinned) return -1;
                        if (!a.is_pinned && b.is_pinned) return 1;
                        return 0;
                    }),
            );
            toast.success("공지가 수정되었습니다.");
        } else {
            // 생성 더미 처리
            const newNotice: NoticeRow = {
                id: `notice-${Date.now()}`,
                meeting_id: "meeting-001",
                author_id: "host-001",
                title,
                content,
                is_pinned: isPinned,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setNotices((prev) =>
                [newNotice, ...prev].sort((a, b) => {
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    return 0;
                }),
            );
            toast.success("공지가 작성되었습니다.");
        }
    }

    function handleDelete(id: string) {
        setNotices((prev) => prev.filter((n) => n.id !== id));
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
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialData={editTarget}
                onSave={handleSave}
            />
        </div>
    );
}
