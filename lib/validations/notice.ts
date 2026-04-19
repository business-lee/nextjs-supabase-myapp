// 공지사항(Notice) 관련 Zod 유효성 검사 스키마 정의

import { z } from "zod";

// 공지사항 생성 스키마
export const noticeSchema = z.object({
    // 공지 제목 (필수)
    title: z.string().min(1, "제목을 입력해주세요"),

    // 공지 내용 (필수)
    content: z.string().min(1, "내용을 입력해주세요"),

    // 상단 고정 여부 (기본값 false)
    is_pinned: z.boolean().default(false),
});

// 공지사항 수정 스키마 (모든 필드 선택)
export const noticeUpdateSchema = noticeSchema.partial();

// 공지사항 생성 폼 값 타입
export type NoticeFormValues = z.infer<typeof noticeSchema>;

// 공지사항 수정 폼 값 타입
export type NoticeUpdateFormValues = z.infer<typeof noticeUpdateSchema>;
