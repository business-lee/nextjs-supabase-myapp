import { Suspense } from "react";
import { getAdminMeetingsAction } from "@/lib/actions/admin";
import { EventsTableClient } from "./_components/EventsTableClient";

interface PageProps {
    searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
    const { q = "", status = "" } = await searchParams;
    const meetings = await getAdminMeetingsAction({ q, status });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">이벤트 관리</h1>
            <Suspense>
                <EventsTableClient meetings={meetings} initialQ={q} initialStatus={status} />
            </Suspense>
        </div>
    );
}
