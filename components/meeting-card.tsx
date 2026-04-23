import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ImageIcon, MapPin, Users } from "lucide-react";
import type { MeetingStatus } from "@/types/domain";

interface MeetingCardProps {
    id: string;
    title: string;
    event_at: string;
    location: string | null;
    max_participants: number | null;
    entry_fee: number;
    status: MeetingStatus;
    participant_count: number;
    pending_count: number;
    days_until_event: number;
    thumbnail_url?: string | null;
    isHost?: boolean;
    myParticipationStatus?: string | null;
}

// D-day 뱃지 텍스트 계산
function getDdayLabel(days: number): string {
    if (days < 0) return "종료";
    if (days === 0) return "D-day";
    return `D-${days}`;
}

// D-day 뱃지 색상
function getDdayVariant(days: number): "default" | "secondary" | "destructive" | "outline" {
    if (days < 0) return "secondary";
    if (days <= 3) return "destructive";
    return "default";
}

// 상태 뱃지 텍스트
function getStatusLabel(status: MeetingStatus): string {
    const labels: Record<MeetingStatus, string> = {
        upcoming: "예정",
        ongoing: "진행중",
        closed: "종료",
        cancelled: "취소",
    };
    return labels[status];
}

function formatEventDate(eventAt: string): string {
    const date = new Date(eventAt);
    const dateStr = date.toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "long",
        day: "numeric",
        weekday: "short",
    });
    const parts = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${dateStr} ${hh}:${mm}`;
}

// 참가 상태 뱃지 텍스트
function getParticipationLabel(status: string): string {
    const labels: Record<string, string> = {
        approved: "승인됨",
        pending: "검토중",
        rejected: "거절됨",
        waitlisted: "대기중",
    };
    return labels[status] ?? status;
}

// 참가 상태 뱃지 색상
function getParticipationVariant(
    status: string,
): "default" | "secondary" | "destructive" | "outline" {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
}

export function MeetingCard({
    id,
    title,
    event_at,
    location,
    max_participants,
    entry_fee,
    status,
    participant_count,
    pending_count,
    days_until_event,
    thumbnail_url = null,
    isHost = true,
    myParticipationStatus = null,
}: MeetingCardProps) {
    return (
        <Link href={`/protected/meetings/${id}`}>
            <Card className="hover:bg-muted/40 cursor-pointer overflow-hidden transition-colors">
                <CardContent className="flex gap-0 p-0">
                    {/* 썸네일 (왼쪽) — 카드 전체 높이, 여백 없이 */}
                    <div className="bg-muted relative w-36 shrink-0">
                        {thumbnail_url ? (
                            <Image src={thumbnail_url} alt={title} fill className="object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <ImageIcon size={24} className="text-muted-foreground/40" />
                            </div>
                        )}
                    </div>

                    {/* 내용 (오른쪽) */}
                    <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-1 flex-1 text-base font-semibold">{title}</h3>
                            <div className="flex shrink-0 gap-1.5">
                                <Badge variant={getDdayVariant(days_until_event)}>
                                    {getDdayLabel(days_until_event)}
                                </Badge>
                                {status !== "upcoming" && (
                                    <Badge variant="outline">{getStatusLabel(status)}</Badge>
                                )}
                            </div>
                        </div>

                        <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
                            <div className="flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                <span>{formatEventDate(event_at)}</span>
                            </div>
                            {location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    <span className="line-clamp-1">{location}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm">
                                <Users size={14} className="text-muted-foreground" />
                                <span className="font-medium">{participant_count}</span>
                                {max_participants && (
                                    <span className="text-muted-foreground">
                                        / {max_participants}명
                                    </span>
                                )}
                                {isHost && pending_count > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        신청 {pending_count}건
                                    </Badge>
                                )}
                                {!isHost && myParticipationStatus && (
                                    <Badge
                                        variant={getParticipationVariant(myParticipationStatus)}
                                        className="ml-1 text-xs"
                                    >
                                        {getParticipationLabel(myParticipationStatus)}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-muted-foreground text-sm">
                                {entry_fee > 0 ? `${entry_fee.toLocaleString()}원` : "무료"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
