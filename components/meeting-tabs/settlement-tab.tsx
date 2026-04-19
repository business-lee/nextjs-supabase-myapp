"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    MOCK_SETTLEMENT,
    MOCK_SETTLEMENT_ITEMS,
    MOCK_SETTLEMENT_PARTICIPANTS,
} from "@/lib/mock-data";
import type { SettlementItemRow, SettlementParticipantRow } from "@/types/database";
import { SETTLEMENT_SPLIT_TYPE } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { SettlementSplitType } from "@/types/domain";

interface SettlementTabProps {
    meetingId: string;
    isHost: boolean;
}

// 더미 참가자 이름 매핑
const MEMBER_NAMES: Record<string, string> = {
    "member-001": "이민호",
    "member-002": "박지영",
    "host-001": "김주최 (주최자)",
};

export function SettlementTab({ meetingId: _meetingId, isHost }: SettlementTabProps) {
    const [splitType, setSplitType] = useState<SettlementSplitType>(
        MOCK_SETTLEMENT.split_type as SettlementSplitType,
    );
    const [items, setItems] = useState<SettlementItemRow[]>(MOCK_SETTLEMENT_ITEMS);
    const [participants, setParticipants] = useState<SettlementParticipantRow[]>(
        MOCK_SETTLEMENT_PARTICIPANTS,
    );
    const [newItemLabel, setNewItemLabel] = useState("");
    const [newItemAmount, setNewItemAmount] = useState("");

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    function handleAddItem() {
        if (!newItemLabel.trim()) {
            toast.error("항목 이름을 입력해주세요.");
            return;
        }
        const amount = Number(newItemAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("올바른 금액을 입력해주세요.");
            return;
        }
        const newItem: SettlementItemRow = {
            id: `item-${Date.now()}`,
            settlement_id: "settlement-001",
            label: newItemLabel,
            amount,
            created_at: new Date().toISOString(),
        };
        setItems((prev) => [...prev, newItem]);
        setNewItemLabel("");
        setNewItemAmount("");
        toast.success("항목이 추가되었습니다.");
    }

    function handleDeleteItem(id: string) {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }

    function handleTogglePaid(participantId: string, checked: boolean) {
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
                    {participants.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isHost && (
                                    <Checkbox
                                        checked={p.is_paid}
                                        onCheckedChange={(checked) =>
                                            handleTogglePaid(p.id, checked === true)
                                        }
                                    />
                                )}
                                <span className="text-sm">
                                    {MEMBER_NAMES[p.user_id] ?? p.user_id}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {p.amount_due.toLocaleString()}원
                                </span>
                                <Badge
                                    variant={p.is_paid ? "default" : "secondary"}
                                    className={p.is_paid ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                    {p.is_paid ? "납부" : "미납"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
