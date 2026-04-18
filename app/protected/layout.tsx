import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className="flex w-full flex-1 flex-col items-center gap-20">
                <nav className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
                    <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
                        <div className="flex items-center gap-5">
                            <Link href="/" className="font-semibold">
                                MeetUp Manager
                            </Link>
                            <Link
                                href="/protected/profile"
                                className="text-muted-foreground hover:text-foreground text-sm"
                            >
                                프로필
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Suspense>
                                <AuthButton />
                            </Suspense>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </nav>

                <div className="flex w-full max-w-5xl flex-1 flex-col gap-20 p-5">{children}</div>

                <footer className="mx-auto flex w-full items-center justify-center border-t py-8 text-center text-xs">
                    <ThemeSwitcher />
                </footer>
            </div>
        </main>
    );
}
