import { Suspense } from "react";
import { getAdminUsersAction } from "@/lib/actions/admin";
import { UsersTableClient } from "./_components/UsersTableClient";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
    const { q = "" } = await searchParams;
    const users = await getAdminUsersAction({ q });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">사용자 관리</h1>
            <Suspense>
                <UsersTableClient users={users} initialQ={q} />
            </Suspense>
        </div>
    );
}
