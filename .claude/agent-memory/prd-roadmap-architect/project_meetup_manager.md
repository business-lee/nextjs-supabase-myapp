---
name: MeetUp Manager 프로젝트 핵심 정보
description: MeetUp Manager MVP의 비즈니스 목표, 기술 아키텍처 결정사항, Phase 우선순위 근거 및 주요 위험 요소
type: project
---

소규모 동호회(10~30명) 주최자(Host)와 회원(Member)을 위한 모임 운영 플랫폼 MVP를 개발 중이다. (2026-04-17 기준)

**Why:** 주최자가 모임 공지·참여자 관리·카풀 조율·정산을 하나의 앱에서 처리할 수 있도록 하는 것이 핵심 가치.

## 현재 구현 현황

- 구글 소셜 로그인, 이메일 인증 플로우 완료 (Supabase Auth)
- profiles 테이블 및 TypeScript 타입 존재
- shadcn/ui 컴포넌트 일부 설치 (button, card, badge, checkbox, dropdown-menu, form, input, label, textarea)
- `/protected` 대시보드는 스타터 킷 기본 화면 상태 (교체 필요)

## 미구현 (로드맵 대상)

- 신규 DB 테이블 8개: meetings, notices, participations, carpool_drivers, carpool_passengers, settlements, settlement_items, settlement_participants
- 모임 CRUD, 초대 링크, 참가 신청/승인, 공지사항, 카풀, 정산 기능 전체
- `/invite/[token]` 초대 링크 페이지

## Phase 우선순위 결정 근거

- Phase 1(골격): 라우트 구조 + 타입 정의 먼저 확정 → UI팀·BE팀 병렬 개발 가능
- Phase 2(UI): 더미 데이터로 전체 화면 완성 → 이해관계자 피드백 조기 수집
- Phase 3(API): DB 마이그레이션 → 도메인별 API 병렬 구현 (Task 008~012)
- Phase 4(완성): 부가 기능 + Vercel 배포 검증

## 주요 기술적 위험 요소

- 대기자 자동 승급 동시성 이슈 → Supabase RPC/트랜잭션 활용 권장
- RLS 정책 복잡성 → Phase 3 초기에 우선 테스트
- Vercel 배포 시 Supabase OAuth 리다이렉트 URL 설정 필요

## 환경 변수 (Vercel 배포 시 등록 필요)

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

**How to apply:** 향후 Task 구현 또는 로드맵 업데이트 시 위 현황을 기준으로 중복 작업 방지 및 의존성 판단에 활용.
