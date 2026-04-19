"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MeetingCancelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    meetingTitle?: string;
}

export function MeetingCancelDialog({
    open,
    onOpenChange,
    onConfirm,
    meetingTitle,
}: MeetingCancelDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>모임을 취소하시겠습니까?</DialogTitle>
                    <DialogDescription>
                        {meetingTitle && (
                            <span className="text-foreground font-medium">
                                &apos;{meetingTitle}&apos;
                            </span>
                        )}{" "}
                        모임을 취소하면 모든 참가자에게 취소 알림이 전송됩니다. 이 작업은 되돌릴 수
                        없습니다.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        돌아가기
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        모임 취소
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
