"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <Button
            variant="outline"
            className="text-destructive hover:text-destructive w-full"
            onClick={handleLogout}
        >
            <LogOut size={16} className="mr-2" />
            로그아웃
        </Button>
    );
}
