// 정산(Settlement) 관련 Zod 유효성 검사 스키마 정의

import { z } from "zod";
import { SETTLEMENT_SPLIT_TYPE } from "@/types/index";

// 정산 항목 스키마
export const settlementItemSchema = z.object({
    // 항목명 (필수)
    label: z.string().min(1, "항목명을 입력해주세요"),

    // 항목 금액 (양의 정수)
    amount: z.coerce.number().int().positive("금액은 양수여야 합니다"),
});

// 정산 생성 스키마
export const settlementSchema = z.object({
    // 총 금액 (양의 정수)
    total_amount: z.coerce.number().int().positive(),

    // 분배 방식 (균등 분배 또는 수동 분배)
    split_type: z.union([
        z.literal(SETTLEMENT_SPLIT_TYPE.EQUAL),
        z.literal(SETTLEMENT_SPLIT_TYPE.MANUAL),
    ]),

    // 정산 항목 목록 (최소 1개 이상)
    items: z.array(settlementItemSchema).min(1, "최소 1개의 항목이 필요합니다"),
});

// 정산 참가자 납부 상태 수정 스키마
export const settlementParticipantUpdateSchema = z.object({
    // 납부 완료 여부
    is_paid: z.boolean(),
});

// 정산 생성 폼 값 타입
export type SettlementFormValues = z.infer<typeof settlementSchema>;

// 정산 항목 폼 값 타입
export type SettlementItemFormValues = z.infer<typeof settlementItemSchema>;

// 정산 참가자 납부 상태 수정 값 타입
export type SettlementParticipantUpdateValues = z.infer<typeof settlementParticipantUpdateSchema>;
