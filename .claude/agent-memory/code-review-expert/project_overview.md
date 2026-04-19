---
name: 프로젝트 개요
description: MeetUp Manager 앱의 기술 스택, 아키텍처, 개발 단계 정보
type: project
---

Next.js App Router + Supabase 인증 기반 미팅/이벤트 관리 앱 (MeetUp Manager).

**Why:** 소규모 동호회 모임 관리 목적. Phase별 점진적 구현 방식으로 개발 중.

**How to apply:** Phase 2 이상 미구현 기능에 대해 리뷰 시 "구현 예정" 플레이스홀더 페이지임을 인지하고 구조/설계 관점에서만 검토할 것.

## 현재 구현 상태 (2026-04-18 기준)

- Phase 1: 인증 플로우, 프로필 관리 구현 완료
- Phase 2+: meetings, notices, carpool, settlement 기능 미구현 (플레이스홀더만 존재)
- Admin 페이지: 레이아웃 구조만 존재, 실제 기능 미구현

## 라우팅 구조

- `app/(main)/` — 일반 사용자 페이지 (Route Group)
- `app/admin/` — 관리자 전용 페이지 (별도 레이아웃)
- `proxy.ts` (루트) — Next.js Middleware 역할 (파일명 주의: middleware.ts가 아닌 proxy.ts)

## Supabase 패턴

- 서버: `@/lib/supabase/server`의 `createClient()` (async)
- 클라이언트: `@/lib/supabase/client`의 `createClient()`
- 인증: `supabase.auth.getClaims()` 사용 (getUser 대신)
- DB 타입: `@/lib/supabase/database.types` 자동 생성 타입 활용
