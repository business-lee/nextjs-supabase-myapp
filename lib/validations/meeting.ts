// 모임(Meeting) 관련 Zod 유효성 검사 스키마 정의

import { z } from "zod";
import { APPROVAL_TYPE } from "@/types/index";

// 모임 생성 스키마
export const meetingSchema = z.object({
    // 모임 제목 (필수)
    title: z.string().min(1, "모임 제목을 입력해주세요"),

    // 모임 설명 (선택)
    description: z.string().optional(),

    // 모임 일시 (필수, 미래 날짜여야 함)
    event_at: z
        .string()
        .min(1, "날짜를 선택해주세요")
        .refine((val) => {
            const selectedDate = new Date(val);
            const now = new Date();
            return selectedDate > now;
        }, "모임 일시는 현재 시간 이후여야 합니다"),

    // 모임 장소 (선택)
    location: z.string().optional(),

    // 최대 참가 인원 (선택, 양의 정수)
    max_participants: z.coerce.number().int().positive().optional(),

    // 참가비 (기본값 0, 0 이상 정수)
    entry_fee: z.coerce.number().int().min(0).default(0),

    // 승인 방식 (자동 승인 또는 수동 승인)
    approval_type: z.union([z.literal(APPROVAL_TYPE.AUTO), z.literal(APPROVAL_TYPE.MANUAL)]),

    // 썸네일 이미지 URL (선택)
    thumbnail_url: z.string().url().nullable().optional(),
});

// 모임 수정 스키마 (event_at 제외)
export const meetingUpdateSchema = meetingSchema.omit({ event_at: true });

// 모임 생성 폼 값 타입
export type MeetingFormValues = z.infer<typeof meetingSchema>;

// 모임 수정 폼 값 타입
export type MeetingUpdateFormValues = z.infer<typeof meetingUpdateSchema>;
