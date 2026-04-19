import { Suspense } from "react";
import { getMockMeetingById, getMockIsHost, getMockMyParticipation } from "@/lib/mock-data";
import { MeetingDetailClient } from "./meeting-detail-client";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
};

async function MeetingDetailContent({ params, searchParams }: Props) {
    const { id } = await params;
    const { tab = "notices" } = await searchParams;

    const meeting = getMockMeetingById(id) ?? getMockMeetingById("meeting-001")!;
    const isHost = getMockIsHost(id);
    const myParticipation = !isHost ? getMockMyParticipation(id) : null;

    return (
        <MeetingDetailClient
            id={id}
            tab={tab}
            meeting={meeting}
            isHost={isHost}
            myParticipation={myParticipation}
        />
    );
}

export default function MeetingDetailPage({ params, searchParams }: Props) {
    return (
        <Suspense fallback={null}>
            <MeetingDetailContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
