"use client";

// Admin 사이드바 컴포넌트 - 현재 경로에 따라 활성 메뉴 하이라이트 처리

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 메뉴 아이템 타입 정의
interface NavItem {
    href: string;
    label: string;
    // 정확한 경로 매칭 여부 (true이면 pathname === href, false이면 startsWith)
    exact: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/admin", label: "대시보드", exact: true },
    { href: "/admin/events", label: "이벤트 관리", exact: false },
    { href: "/admin/users", label: "사용자 관리", exact: false },
    { href: "/admin/stats", label: "통계 분석", exact: false },
];

export default function AdminSidebar() {
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
                        <AvatarFallback className="text-xs">관</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">김관리자</p>
                        <p className="text-muted-foreground text-xs">관리자</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
