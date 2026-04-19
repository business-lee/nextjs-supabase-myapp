import { BottomNav } from "@/components/bottom-nav";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background mx-auto min-h-screen w-full max-w-[530px] shadow-sm">
            <div className="pb-16">{children}</div>
            <Suspense>
                <BottomNav />
            </Suspense>
        </div>
    );
}
