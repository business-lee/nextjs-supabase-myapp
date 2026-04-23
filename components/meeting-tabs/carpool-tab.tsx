"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    toggleCarpoolAction,
    registerDriverAction,
    applyPassengerAction,
    acceptPassengerAction,
    rejectPassengerAction,
} from "@/lib/actions/carpool";
import type { CarpoolDriverWithPassengers } from "@/types/domain";
import { CARPOOL_PASSENGER_STATUS } from "@/types/domain";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Car, Check, MapPin, Users, X } from "lucide-react";

interface CarpoolTabProps {
    meetingId: string;
    isHost: boolean;
    currentUserId: string;
    initialCarpoolEnabled: boolean;
    initialCarpoolDrivers: CarpoolDriverWithPassengers[];
}

function getInitials(name: string | null): string {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// 드라이버 등록 다이얼로그
function DriverRegisterDialog({
    open,
    onOpenChange,
    onRegister,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRegister: (location: string, seats: number, departureAt: string) => void;
}) {
    const [location, setLocation] = useState("");
    const [seats, setSeats] = useState(3);
    const [departureAt, setDepartureAt] = useState("");

    function handleSubmit() {
        if (!location.trim()) {
            toast.error("출발지를 입력해주세요.");
            return;
        }
        onRegister(location, seats, departureAt);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>드라이버 등록</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>출발지</Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: 강남역 10번 출구"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>탑승 가능 인원</Label>
                        <Input
                            type="number"
                            min={1}
                            max={8}
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>출발 시간</Label>
                        <Input
                            type="datetime-local"
                            value={departureAt}
                            onChange={(e) => setDepartureAt(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit}>등록</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CarpoolTab({
    meetingId,
    isHost,
    currentUserId,
    initialCarpoolEnabled,
    initialCarpoolDrivers,
}: CarpoolTabProps) {
    // DB의 carpool_enabled 값으로 초기화 (하드코딩 제거)
    const [carpoolEnabled, setCarpoolEnabled] = useState(initialCarpoolEnabled);
    // 서버에서 pre-fetch한 드라이버 목록으로 초기화 (MOCK 제거)
    const [drivers, setDrivers] = useState<CarpoolDriverWithPassengers[]>(initialCarpoolDrivers);
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

    // 카풀 활성화/비활성화 토글 — DB 연동
    async function handleToggleCarpoolEnabled(enabled: boolean) {
        const result = await toggleCarpoolAction(meetingId, enabled);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setCarpoolEnabled(enabled);
        toast.success(enabled ? "카풀이 활성화되었습니다." : "카풀이 비활성화되었습니다.");
    }

    // 드라이버 등록 — DB 연동
    async function handleRegisterDriver(location: string, seats: number, departureAt: string) {
        const result = await registerDriverAction(meetingId, location, seats, departureAt);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setDrivers((prev) => [...prev, result.data]);
        toast.success("드라이버로 등록되었습니다.");
    }

    // 동승 신청 — DB 연동
    async function handleApplyPassenger(driverId: string) {
        const result = await applyPassengerAction(driverId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        toast.success("동승 신청이 완료되었습니다. 드라이버의 수락을 기다려주세요.");
    }

    // 동승 신청 수락 — DB 연동
    async function handleAcceptPassenger(driverId: string, passengerId: string) {
        const result = await acceptPassengerAction(passengerId, meetingId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setDrivers((prev) =>
            prev.map((d) =>
                d.id === driverId
                    ? {
                          ...d,
                          passengers: d.passengers.map((p) =>
                              p.id === passengerId
                                  ? { ...p, status: CARPOOL_PASSENGER_STATUS.ACCEPTED }
                                  : p,
                          ),
                      }
                    : d,
            ),
        );
        toast.success("동승 신청을 수락했습니다.");
    }

    // 동승 신청 거절 — DB 연동 (레코드 삭제)
    async function handleRejectPassenger(driverId: string, passengerId: string) {
        const result = await rejectPassengerAction(passengerId, meetingId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setDrivers((prev) =>
            prev.map((d) =>
                d.id === driverId
                    ? { ...d, passengers: d.passengers.filter((p) => p.id !== passengerId) }
                    : d,
            ),
        );
        toast.success("동승 신청을 거절했습니다.");
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 카풀 활성화 토글 (주최자 전용) */}
            {isHost && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">카풀 기능</p>
                        <p className="text-muted-foreground text-sm">
                            카풀을 활성화하면 참가자가 드라이버로 등록할 수 있습니다.
                        </p>
                    </div>
                    <Switch checked={carpoolEnabled} onCheckedChange={handleToggleCarpoolEnabled} />
                </div>
            )}

            {!carpoolEnabled ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                    카풀 기능이 비활성화되어 있습니다.
                </p>
            ) : (
                <>
                    {/* 드라이버 등록 버튼 */}
                    <Button variant="outline" onClick={() => setRegisterDialogOpen(true)}>
                        <Car size={16} className="mr-2" />
                        드라이버로 등록하기
                    </Button>

                    {/* 드라이버 카드 목록 */}
                    {drivers.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-sm">
                            등록된 드라이버가 없습니다.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {drivers.map((driver) => (
                                <Card key={driver.id}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center justify-between text-base">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {getInitials(driver.driver.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{driver.driver.full_name}</span>
                                            </div>
                                            <Badge variant="outline">
                                                <Users size={12} className="mr-1" />
                                                {driver.passengers.length}/{driver.available_seats}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        <div className="text-muted-foreground flex gap-4 text-sm">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={13} />
                                                {driver.departure_location}
                                            </span>
                                            <span>{formatTime(driver.departure_at)} 출발</span>
                                        </div>

                                        {/* 동승 신청 버튼 — 본인이 드라이버가 아닌 경우만 표시 */}
                                        {driver.driver_id !== currentUserId && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleApplyPassenger(driver.id)}
                                                disabled={
                                                    driver.passengers.length >=
                                                    driver.available_seats
                                                }
                                            >
                                                동승 신청
                                            </Button>
                                        )}

                                        {/* 동승자 목록 (드라이버 본인 뷰) */}
                                        {driver.passengers.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                <p className="text-muted-foreground text-xs font-medium">
                                                    동승 신청자
                                                </p>
                                                {driver.passengers.map((passenger) => (
                                                    <div
                                                        key={passenger.id}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-7 w-7">
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(
                                                                        passenger.passenger
                                                                            .full_name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm">
                                                                {passenger.passenger.full_name}
                                                            </span>
                                                            {passenger.status ===
                                                                CARPOOL_PASSENGER_STATUS.ACCEPTED && (
                                                                <Badge className="bg-green-500 text-xs text-white hover:bg-green-600">
                                                                    확정
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {passenger.status !==
                                                            CARPOOL_PASSENGER_STATUS.ACCEPTED && (
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-green-600"
                                                                    onClick={() =>
                                                                        handleAcceptPassenger(
                                                                            driver.id,
                                                                            passenger.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Check size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive h-7 w-7"
                                                                    onClick={() =>
                                                                        handleRejectPassenger(
                                                                            driver.id,
                                                                            passenger.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <X size={14} />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            <DriverRegisterDialog
                open={registerDialogOpen}
                onOpenChange={setRegisterDialogOpen}
                onRegister={handleRegisterDriver}
            />
        </div>
    );
}
