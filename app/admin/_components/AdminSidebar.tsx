"use client";

// Admin 사이드바 컴포넌트 - 현재 경로에 따라 활성 메뉴 하이라이트 처리

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 메뉴 아이템 타입 정의
interface NavItem {
    href: string;
    label: string;
    // 정확한 경로 매칭 여부 (true이면 pathname === href, false이면 startsWith)
    exact: boolean;
}

interface AdminSidebarProps {
    user: {
        name: string | null;
        email: string | null;
        avatar_url: string | null;
    };
}

const NAV_ITEMS: NavItem[] = [
    { href: "/admin", label: "대시보드", exact: true },
    { href: "/admin/events", label: "이벤트 관리", exact: false },
    { href: "/admin/users", label: "사용자 관리", exact: false },
    { href: "/admin/stats", label: "통계 분석", exact: false },
];

function getInitials(name: string | null): string {
    if (!name) return "관";
    return name.charAt(0).toUpperCase();
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();

    // 메뉴 활성 여부 판별 함수
    function isActive(item: NavItem): boolean {
        if (item.exact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
    }

    return (
        <div className="flex h-full flex-col justify-between p-6">
            {/* 상단: 로고 및 네비게이션 */}
            <div>
                <h1 className="mb-1 text-lg font-bold">MeetUp Manager</h1>
                <p className="text-muted-foreground mb-8 text-xs">관리자</p>
                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                isActive(item)
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-accent"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* 하단: 구분선 + 관리자 프로필 */}
            <div>
                <Separator className="mb-4" />
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        {user.avatar_url && (
                            <AvatarImage src={user.avatar_url} alt={user.name ?? "관리자"} />
                        )}
                        <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name ?? "관리자"}</p>
                        <p className="text-muted-foreground truncate text-xs">{user.email ?? ""}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
