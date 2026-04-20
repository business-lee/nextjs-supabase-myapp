"use client";

// Admin 사용자 관리 페이지 - 사용자 목록, Admin 권한 토글, 비활성화 기능

import { useMemo, useState } from "react";
import { getMockAdminUsers } from "@/lib/mock-data";
import type { AdminProfileRow } from "@/types/database";
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
// 사용자 비활성화 확인 다이얼로그
// ─────────────────────────────────────────────

interface UserDeactivateDialogProps {
    user: AdminProfileRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function UserDeactivateDialog({ user, open, onOpenChange }: UserDeactivateDialogProps) {
    function handleConfirm() {
        console.log("비활성화:", user?.id);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>계정 비활성화</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm">정말 이 계정을 비활성화하시겠습니까?</p>
                    {user && (
                        <p className="text-muted-foreground mt-2 text-sm font-medium">
                            {user.full_name ?? "이름 없음"} ({user.email ?? "-"})
                        </p>
                    )}
                    <p className="text-muted-foreground mt-2 text-xs">
                        비활성화된 계정은 로그인이 제한됩니다.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        닫기
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        비활성화
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// 메인 페이지 컴포넌트
// ─────────────────────────────────────────────

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminProfileRow[]>(getMockAdminUsers());
    const [searchQuery, setSearchQuery] = useState("");
    const [deactivateTarget, setDeactivateTarget] = useState<AdminProfileRow | null>(null);

    // 검색 필터링 (이름 또는 이메일 기준)
    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return users.filter(
            (u) =>
                u.full_name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query),
        );
    }, [users, searchQuery]);

    // Admin 권한 토글 핸들러
    function handleAdminToggle(userId: string, checked: boolean) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_admin: checked } : u)));
    }

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <h1 className="text-3xl font-bold">사용자 관리</h1>

            {/* 검색 영역 */}
            <Input
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-muted-foreground py-16 text-center text-sm"
                                >
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    {/* 사용자 정보: 아바타 + 이름 + 이메일 */}
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

                                    {/* 가입일 */}
                                    <TableCell className="text-muted-foreground px-6 py-4 text-center text-sm">
                                        {new Date(user.created_at).toLocaleDateString("ko-KR")}
                                    </TableCell>

                                    {/* 생성 모임수 */}
                                    <TableCell className="px-6 py-4 text-center text-sm">
                                        {user.created_meeting_count}개
                                    </TableCell>

                                    {/* 참여 모임 수 */}
                                    <TableCell className="px-6 py-4 text-center text-sm">
                                        {user.meeting_count}개
                                    </TableCell>

                                    {/* Admin 권한 Switch */}
                                    <TableCell className="px-6 py-4 text-center">
                                        <Switch
                                            checked={user.is_admin}
                                            onCheckedChange={(checked) =>
                                                handleAdminToggle(user.id, checked)
                                            }
                                            aria-label={`${user.full_name} Admin 권한 토글`}
                                        />
                                    </TableCell>

                                    {/* 액션 */}
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

            {/* 비활성화 확인 다이얼로그 */}
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
