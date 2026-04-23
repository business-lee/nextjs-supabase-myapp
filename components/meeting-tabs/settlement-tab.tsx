"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { SettlementItemRow, SettlementRow } from "@/types/database";
import { SETTLEMENT_SPLIT_TYPE } from "@/types/domain";
import type { SettlementSplitType } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import {
    createOrUpdateSettlementAction,
    addSettlementItemAction,
    deleteSettlementItemAction,
    togglePaidAction,
    initializeSettlementParticipantsAction,
} from "@/lib/actions/settlement";
import type { SettlementData, SettlementParticipantWithUser } from "@/lib/actions/settlement";

interface SettlementTabProps {
    meetingId: string;
    isHost: boolean;
    currentUserId: string;
    initialSettlement: SettlementData;
}

export function SettlementTab({
    meetingId,
    isHost,
    currentUserId,
    initialSettlement,
}: SettlementTabProps) {
    // 정산이 없는 경우(null)와 있는 경우를 분기 처리
    const [settlement, setSettlement] = useState<SettlementRow | null>(
        initialSettlement?.settlement ?? null,
    );
    const [items, setItems] = useState<SettlementItemRow[]>(initialSettlement?.items ?? []);
    const [participants, setParticipants] = useState<SettlementParticipantWithUser[]>(
        initialSettlement?.participants ?? [],
    );
    const [splitType, setSplitType] = useState<SettlementSplitType>(
        (initialSettlement?.settlement?.split_type as SettlementSplitType) ??
            SETTLEMENT_SPLIT_TYPE.EQUAL,
    );
    const [newItemLabel, setNewItemLabel] = useState("");
    const [newItemAmount, setNewItemAmount] = useState("");

    // 비용 항목 합계를 실시간으로 계산
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    async function handleAddItem() {
        if (!newItemLabel.trim()) {
            toast.error("항목 이름을 입력해주세요.");
            return;
        }
        const amount = Number(newItemAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("올바른 금액을 입력해주세요.");
            return;
        }

        // 정산이 없으면 먼저 생성 후 참여자 초기화
        let currentSettlementId = settlement?.id;
        if (!currentSettlementId) {
            const createResult = await createOrUpdateSettlementAction(meetingId, splitType, 0);
            if (!createResult.success) {
                toast.error(createResult.error);
                return;
            }
            setSettlement(createResult.data);
            currentSettlementId = createResult.data.id;

            // 모임 approved 참여자를 정산 참여자로 자동 초기화
            await initializeSettlementParticipantsAction(currentSettlementId, meetingId);
        }

        const result = await addSettlementItemAction(
            currentSettlementId,
            meetingId,
            newItemLabel,
            amount,
        );
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setItems((prev) => [...prev, result.data]);
        setNewItemLabel("");
        setNewItemAmount("");
        toast.success("항목이 추가되었습니다.");
    }

    async function handleDeleteItem(id: string) {
        if (!settlement?.id) return;
        const result = await deleteSettlementItemAction(id, settlement.id, meetingId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
    }

    async function handleTogglePaid(participantId: string, checked: boolean) {
        const result = await togglePaidAction(participantId, checked, meetingId);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        setParticipants((prev) =>
            prev.map((p) => (p.id === participantId ? { ...p, is_paid: checked } : p)),
        );
        toast.success(checked ? "납부 완료로 표시했습니다." : "미납부로 변경했습니다.");
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 비용 항목 카드 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">비용 항목</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {items.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            {isHost
                                ? "아래에서 항목을 추가해주세요."
                                : "등록된 비용 항목이 없습니다."}
                        </p>
                    )}

                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm">{item.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {item.amount.toLocaleString()}원
                                </span>
                                {isHost && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive h-7 w-7"
                                        onClick={() => handleDeleteItem(item.id)}
                                    >
                                        <Trash2 size={13} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    <Separator />

                    <div className="flex items-center justify-between font-semibold">
                        <span>합계</span>
                        <span>{totalAmount.toLocaleString()}원</span>
                    </div>

                    {/* 항목 추가 폼 (주최자 전용) */}
                    {isHost && (
                        <div className="mt-2 flex gap-2">
                            <Input
                                placeholder="항목 이름"
                                value={newItemLabel}
                                onChange={(e) => setNewItemLabel(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                placeholder="금액"
                                value={newItemAmount}
                                onChange={(e) => setNewItemAmount(e.target.value)}
                                className="w-28"
                            />
                            <Button variant="outline" size="icon" onClick={handleAddItem}>
                                <Plus size={16} />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 정산 방식 선택 (주최자 전용) */}
            {isHost && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">정산 방식</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={splitType}
                            onValueChange={(val) => setSplitType(val as SettlementSplitType)}
                            className="flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem
                                    value={SETTLEMENT_SPLIT_TYPE.EQUAL}
                                    id="split-equal"
                                />
                                <Label htmlFor="split-equal" className="cursor-pointer">
                                    1/N 균등 분배
                                    <span className="text-muted-foreground ml-2 text-xs">
                                        (1인당{" "}
                                        {participants.length > 0
                                            ? Math.floor(
                                                  totalAmount / participants.length,
                                              ).toLocaleString()
                                            : 0}
                                        원)
                                    </span>
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem
                                    value={SETTLEMENT_SPLIT_TYPE.MANUAL}
                                    id="split-manual"
                                />
                                <Label htmlFor="split-manual" className="cursor-pointer">
                                    수동 입력
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            )}

            {/* 납부 현황 테이블 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">납부 현황</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {participants.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            납부 현황 데이터가 없습니다.
                        </p>
                    )}

                    {participants.map((p) => {
                        // 주최자는 모든 참여자 납부 체크 가능
                        // 비주최자는 본인 행만 체크 가능
                        const canToggle = isHost || p.user_id === currentUserId;

                        return (
                            <div key={p.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {canToggle ? (
                                        <Checkbox
                                            checked={p.is_paid}
                                            onCheckedChange={(checked) =>
                                                handleTogglePaid(p.id, checked === true)
                                            }
                                        />
                                    ) : (
                                        // 체크 불가 참여자는 납부 상태를 시각적으로만 표시
                                        <div className="h-4 w-4 flex-shrink-0" />
                                    )}
                                    <span className="text-sm">
                                        {p.user.full_name ?? "알 수 없음"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {p.amount_due.toLocaleString()}원
                                    </span>
                                    <Badge
                                        variant={p.is_paid ? "default" : "secondary"}
                                        className={
                                            p.is_paid ? "bg-green-500 hover:bg-green-600" : ""
                                        }
                                    >
                                        {p.is_paid ? "납부" : "미납"}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
