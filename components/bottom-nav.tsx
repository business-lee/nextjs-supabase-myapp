"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarPlus, Home, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "홈", href: "/protected", icon: Home },
    { label: "모임", href: "/protected/meetings/new", icon: CalendarPlus },
    { label: "알림", href: "/protected", icon: Bell },
    { label: "프로필", href: "/protected/profile", icon: User },
    { label: "설정", href: "/protected", icon: Settings },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bg-background fixed bottom-0 left-1/2 w-full max-w-[530px] -translate-x-1/2 border-t">
            <ul className="flex h-16 items-center justify-around px-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <li key={label} className="flex-1">
                            <Link
                                href={href}
                                className={cn(
                                    "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span>{label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
