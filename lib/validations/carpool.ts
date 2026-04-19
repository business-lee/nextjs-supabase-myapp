// 카풀(Carpool) 관련 Zod 유효성 검사 스키마 정의

import { z } from "zod";
import { CARPOOL_PASSENGER_STATUS } from "@/types/index";
import type { CarpoolPassengerStatus } from "@/types/index";

// 카풀 탑승자 상태 값 배열을 상수 객체에서 추출 (z.enum에 활용)
const carpoolPassengerStatusValues = Object.values(CARPOOL_PASSENGER_STATUS) as [
    CarpoolPassengerStatus,
    ...CarpoolPassengerStatus[],
];

// 카풀 탑승자 상태 스키마 (상태 업데이트 등 내부 유효성 검사용)
export const carpoolPassengerStatusSchema = z.enum(carpoolPassengerStatusValues);

// 카풀 드라이버 등록 스키마
export const carpoolDriverSchema = z.object({
    // 출발지 (필수)
    departure_location: z.string().min(1, "출발지를 입력해주세요"),

    // 출발 시간 (필수)
    departure_at: z.string().min(1, "출발 시간을 선택해주세요"),

    // 탑승 가능 인원 (1~8명 사이 정수)
    available_seats: z.coerce.number().int().min(1).max(8),
});

// 카풀 탑승 신청 스키마
export const carpoolPassengerSchema = z.object({
    // 카풀 드라이버 ID (UUID 형식)
    carpool_driver_id: z.string().uuid("유효하지 않은 카풀 ID입니다"),
});

// 카풀 드라이버 등록 폼 값 타입
export type CarpoolDriverFormValues = z.infer<typeof carpoolDriverSchema>;

// 카풀 탑승 신청 폼 값 타입
export type CarpoolPassengerFormValues = z.infer<typeof carpoolPassengerSchema>;
