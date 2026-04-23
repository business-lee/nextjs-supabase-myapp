"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AdminProfileRow } from "@/types/database";
import { toggleAdminRoleAction } from "@/lib/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
// 계정 비활성화 다이얼로그 (미구현 안내)
// ─────────────────────────────────────────────

interface UserDeactivateDialogProps {
    user: AdminProfileRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function UserDeactivateDialog({ user, open, onOpenChange }: UserDeactivateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>계정 비활성화</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {user && (
                        <p className="text-muted-foreground text-sm font-medium">
                            {user.full_name ?? "이름 없음"} ({user.email ?? "-"})
                        </p>
                    )}
                    <p className="text-muted-foreground mt-3 text-sm">
                        계정 비활성화 기능은 현재 준비 중입니다.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        닫기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// 메인 클라이언트 컴포넌트
// ─────────────────────────────────────────────

interface UsersTableClientProps {
    users: AdminProfileRow[];
    initialQ: string;
}

export function UsersTableClient({ users: initialUsers, initialQ }: UsersTableClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<AdminProfileRow[]>(initialUsers);
    const [deactivateTarget, setDeactivateTarget] = useState<AdminProfileRow | null>(null);
    const [isPending, startTransition] = useTransition();

    function updateURL(q: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (q) {
            params.set("q", q);
        } else {
            params.delete("q");
        }
        router.push(`/admin/users?${params.toString()}`);
    }

    function handleAdminToggle(userId: string, checked: boolean) {
        // Optimistic UI 업데이트
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_admin: checked } : u)));

        startTransition(async () => {
            const result = await toggleAdminRoleAction(userId, checked);
            if (!result.success) {
                // 실패 시 롤백
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, is_admin: !checked } : u)),
                );
                toast.error(result.error);
            } else {
                toast.success(`Admin 권한이 ${checked ? "부여" : "해제"}되었습니다.`);
            }
        });
    }

    return (
        <div className="space-y-4">
            {/* 검색 */}
            <Input
                placeholder="이름 또는 이메일로 검색..."
                defaultValue={initialQ}
                onChange={(e) => updateURL(e.target.value)}
                className="max-w-sm"
            />

            {/* 사용자 목록 테이블 */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6 py-4 text-center">사용자</TableHead>
                            <TableHead className="px-6 py-4 text-center">가입일</TableHead>
                            <TableHead className="px-6 py-4 text-center">생성 모임 수</TableHead>
                            <TableHead className="px-6 py-4 text-center">참여 모임 수</TableHead>
                            <TableHead className="px-6 py-4 text-center">Admin 권한</TableHead>
                            <TableHead className="px-6 py-4 text-center">액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-muted-foreground py-16 text-center text-sm"
                                >
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                {user.avatar_url && (
                                                    <AvatarImage
                                                        src={user.avatar_url}
                                                        alt={user.full_name ?? "사용자"}
                                                    />
                                                )}
                                                <AvatarFallback className="text-xs">
                                                    {user.full_name?.charAt(0) ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {user.full_name ?? "이름 없음"}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {user.email ?? "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground px-6 py-4 text-center text-sm">
                                        {new Date(user.created_at).toLocaleDateString("ko-KR")}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center text-sm">
                                        {user.created_meeting_count}개
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center text-sm">
                                        {user.meeting_count}개
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <Switch
                                            checked={user.is_admin}
                                            onCheckedChange={(checked) =>
                                                handleAdminToggle(user.id, checked)
                                            }
                                            disabled={isPending}
                                            aria-label={`${user.full_name} Admin 권한 토글`}
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeactivateTarget(user)}
                                        >
                                            비활성화
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <UserDeactivateDialog
                user={deactivateTarget}
                open={deactivateTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeactivateTarget(null);
                }}
            />
        </div>
    );
}
