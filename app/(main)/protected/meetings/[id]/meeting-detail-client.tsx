"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NoticesTab } from "@/components/meeting-tabs/notices-tab";
import { ParticipantsTab } from "@/components/meeting-tabs/participants-tab";
import { CarpoolTab } from "@/components/meeting-tabs/carpool-tab";
import { SettlementTab } from "@/components/meeting-tabs/settlement-tab";
import { MeetingCancelDialog } from "@/components/meeting-cancel-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Copy, ImageIcon, MapPin, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { MeetingWithHost, ParticipationWithUser, MeetingStatus } from "@/types/domain";

type TabKey = "notices" | "participants" | "carpool" | "settlement";

const TABS: { key: TabKey; label: string }[] = [
    { key: "notices", label: "공지사항" },
    { key: "participants", label: "참여자" },
    { key: "carpool", label: "카풀" },
    { key: "settlement", label: "정산" },
];

function StatusBadge({ status }: { status: MeetingStatus }) {
    const config: Record<MeetingStatus, { label: string; className: string }> = {
        upcoming: { label: "예정", className: "bg-blue-500 text-white hover:bg-blue-600" },
        ongoing: { label: "진행중", className: "bg-green-500 text-white hover:bg-green-600" },
        closed: { label: "종료", className: "" },
        cancelled: { label: "취소됨", className: "" },
    };
    const { label, className } = config[status];
    return (
        <Badge
            variant={status === "upcoming" || status === "ongoing" ? "default" : "secondary"}
            className={className}
        >
            {label}
        </Badge>
    );
}

function formatEventDate(eventAt: string): string {
    const date = new Date(eventAt);
    const dateStr = date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    });
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${dateStr} ${hh}:${mm}`;
}

interface MeetingDetailClientProps {
    id: string;
    tab: string;
    meeting: MeetingWithHost;
    isHost: boolean;
    myParticipation: ParticipationWithUser | null;
}

export function MeetingDetailClient({
    id,
    tab,
    meeting,
    isHost,
    myParticipation,
}: MeetingDetailClientProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(meeting.thumbnail_url);
    const [uploading, setUploading] = useState(false);

    const activeTab = TABS.find((t) => t.key === tab)?.key ?? "notices";

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const supabase = createClient();
            const ext = file.name.split(".").pop();
            const fileName = `${Date.now()}.${ext}`;

            const { error } = await supabase.storage
                .from("meeting-thumbnails")
                .upload(fileName, file, { upsert: true });

            if (error) throw error;

            const {
                data: { publicUrl },
            } = supabase.storage.from("meeting-thumbnails").getPublicUrl(fileName);

            setThumbnailUrl(publicUrl);
            toast.success("썸네일이 변경되었습니다.");
        } catch {
            toast.error("이미지 업로드에 실패했습니다.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    function handleRemoveThumbnail() {
        setThumbnailUrl(null);
        toast.success("썸네일이 삭제되었습니다.");
    }

    async function handleCopyInviteLink() {
        const inviteUrl = `${window.location.origin}/invite/${meeting.invite_token}`;
        await navigator.clipboard.writeText(inviteUrl);
        toast.success("초대 링크가 복사되었습니다.");
    }

    function handleCancelConfirm() {
        setCancelDialogOpen(false);
        toast.success("모임이 취소되었습니다.");
        router.push("/protected");
    }

    return (
        <div className="flex flex-col">
            {/* 숨겨진 파일 입력 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
            />

            {/* 썸네일 영역 — 상단 풀 너비 */}
            <div
                className={cn(
                    "bg-muted relative h-48 w-full overflow-hidden",
                    isHost && !thumbnailUrl && "cursor-pointer",
                )}
                onClick={isHost && !thumbnailUrl ? () => fileInputRef.current?.click() : undefined}
            >
                {thumbnailUrl ? (
                    <Image src={thumbnailUrl} alt={meeting.title} fill className="object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <ImageIcon size={40} className="text-muted-foreground/40" />
                        {isHost && (
                            <span className="text-muted-foreground/60 text-sm">
                                {uploading ? "업로드 중..." : "클릭하여 이미지 추가"}
                            </span>
                        )}
                    </div>
                )}
                {isHost && thumbnailUrl && (
                    <>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-background/70 hover:bg-background/90 absolute right-10 bottom-2 rounded-full p-1.5 transition-colors disabled:opacity-50"
                            title="썸네일 교체"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            disabled={uploading}
                            className="bg-background/70 hover:bg-background/90 absolute right-2 bottom-2 rounded-full p-1.5 transition-colors disabled:opacity-50"
                            title="썸네일 삭제"
                        >
                            <X size={14} />
                        </button>
                    </>
                )}
            </div>

            {/* 정보 영역 — 이미지 아래 */}
            <div className="flex flex-col gap-3 p-4 pb-0">
                <div className="flex items-start justify-between gap-2">
                    <h1 className="flex-1 text-xl leading-snug font-bold">{meeting.title}</h1>
                    <StatusBadge status={meeting.status as MeetingStatus} />
                </div>

                <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        <span>{formatEventDate(meeting.event_at)}</span>
                    </div>
                    {meeting.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>{meeting.location}</span>
                        </div>
                    )}
                </div>

                {meeting.entry_fee > 0 && (
                    <p className="text-sm font-medium">
                        참가비: {meeting.entry_fee.toLocaleString()}원
                    </p>
                )}

                {/* 참여자: 내 참가 상태 표시 */}
                {!isHost && myParticipation && (
                    <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                        <span className="text-muted-foreground">내 참가 상태</span>
                        {myParticipation.status === "approved" && (
                            <Badge className="bg-green-500 text-white hover:bg-green-600">
                                승인됨
                            </Badge>
                        )}
                        {myParticipation.status === "pending" && (
                            <Badge variant="secondary">검토 중</Badge>
                        )}
                        {myParticipation.status === "rejected" && (
                            <Badge variant="destructive">거절됨</Badge>
                        )}
                    </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                    {isHost && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleCopyInviteLink}
                        >
                            <Copy size={14} className="mr-1.5" />
                            초대 링크 복사
                        </Button>
                    )}
                    {isHost && (
                        <>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/protected/meetings/${id}/edit`}>
                                    <Pencil size={14} className="mr-1" />
                                    수정
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                취소
                            </Button>
                        </>
                    )}
                </div>

                {/* 탭 네비게이션 */}
                <nav className="mt-2 flex gap-1 border-b">
                    {TABS.map((t) => (
                        <Link
                            key={t.key}
                            href={`/protected/meetings/${id}?tab=${t.key}`}
                            className={cn(
                                "px-3 pt-1 pb-3 text-sm font-medium transition-colors",
                                activeTab === t.key
                                    ? "text-foreground border-b-2 border-current"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="p-4">
                {activeTab === "notices" && <NoticesTab meetingId={id} isHost={isHost} />}
                {activeTab === "participants" && <ParticipantsTab meetingId={id} isHost={isHost} />}
                {activeTab === "carpool" && <CarpoolTab meetingId={id} isHost={isHost} />}
                {activeTab === "settlement" && <SettlementTab meetingId={id} isHost={isHost} />}
            </div>

            <MeetingCancelDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                onConfirm={handleCancelConfirm}
                meetingTitle={meeting.title}
            />
        </div>
    );
}
