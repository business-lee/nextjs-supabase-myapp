import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function LoginLink() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const isLoggedIn = !!data?.claims;

    if (isLoggedIn) return null;

    return (
        <p className="text-muted-foreground text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-foreground underline underline-offset-4">
                로그인
            </Link>
        </p>
    );
}

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            {/* 배너 이미지 */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=530&q=80&fit=crop"
                    alt="모임 배너"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* 소개 및 CTA */}
            <section className="flex flex-1 flex-col gap-6 px-6 py-8">
                <div className="flex flex-col gap-3">
                    <h1 className="text-3xl leading-tight font-bold">
                        소규모 모임을
                        <br />더 쉽게 관리하세요
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        공지, 참여자 관리, 카풀 조율, 정산까지
                        <br />
                        모임의 모든 것을 한 곳에서.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pb-4">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/auth/login?redirect=/protected/meetings/new">모임 만들기</Link>
                    </Button>
                    <Suspense>
                        <LoginLink />
                    </Suspense>
                </div>
            </section>
        </main>
    );
}
