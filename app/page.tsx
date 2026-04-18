import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className="flex w-full flex-1 flex-col items-center gap-20">
                <nav className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
                    <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
                        <Link href="/" className="font-semibold">
                            MeetUp Manager
                        </Link>
                        <div className="flex items-center gap-4">
                            <Suspense>
                                <AuthButton />
                            </Suspense>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </nav>

                <div className="flex max-w-5xl flex-1 flex-col items-center gap-12 p-5">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <h1 className="text-4xl font-bold">MeetUp Manager</h1>
                        <p className="text-muted-foreground max-w-xl text-lg">
                            소규모 동호회 모임을 쉽게 관리하세요. 모임 공지, 참여자 관리, 카풀 조율,
                            정산까지 한 곳에서.
                        </p>
                        <div className="flex gap-4">
                            <Button asChild size="lg">
                                <Link href="/auth/login">로그인</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/auth/sign-up">회원가입</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="mx-auto flex w-full items-center justify-center border-t py-8 text-center text-xs">
                    <ThemeSwitcher />
                </footer>
            </div>
        </main>
    );
}
