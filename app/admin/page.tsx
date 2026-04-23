import Link from "next/link";
import { getMockAdminStats, getMockRecentMeetings, getMockRecentUsers } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function StatusBadge({ status }: { status: string }) {
    if (status === "upcoming") return <Badge variant="default">예정</Badge>;
    if (status === "closed") return <Badge variant="secondary">마감</Badge>;
    if (status === "cancelled") return <Badge variant="destructive">취소</Badge>;
    return <Badge variant="outline">{status}</Badge>;
}

export default function AdminPage() {
    const stats = getMockAdminStats();
    const recentMeetings = getMockRecentMeetings(5);
    const recentUsers = getMockRecentUsers(5);

    const statCards = [
        { title: "총 모임 수", value: stats.total_meetings },
        { title: "이번 달 신규 모임", value: stats.new_meetings_this_month },
        { title: "총 사용자 수", value: stats.total_users },
        { title: "이번 달 신규 가입", value: stats.new_users_this_month },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">관리자 대시보드</h1>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 최근 모임 / 최근 가입 사용자 — 2열 그리드 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 최근 모임 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">최근 모임</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/events">모두 보기</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>제목</TableHead>
                                    <TableHead>주최자</TableHead>
                                    <TableHead>날짜</TableHead>
                                    <TableHead>상태</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentMeetings.map((meeting) => (
                                    <TableRow key={meeting.id}>
                                        <TableCell className="max-w-[140px] truncate font-medium">
                                            {meeting.title}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">
                                            {meeting.host?.full_name ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">
                                            {new Date(meeting.event_at).toLocaleDateString("ko-KR")}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={meeting.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 최근 가입 사용자 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">최근 가입 사용자</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/users">모두 보기</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>사용자</TableHead>
                                    <TableHead>가입일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    {user.avatar_url && (
                                                        <AvatarImage
                                                            src={user.avatar_url}
                                                            alt={user.full_name ?? ""}
                                                        />
                                                    )}
                                                    <AvatarFallback className="text-xs">
                                                        {user.full_name?.charAt(0) ?? "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {user.full_name ?? "이름 없음"}
                                                    </p>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        {user.email ?? "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                            {new Date(user.created_at).toLocaleDateString("ko-KR")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
