---
name: MeetUp Manager PRD 작성 컨텍스트
description: MeetUp Manager MVP PRD 작성 시 파악한 프로젝트 구조와 도메인 특성
type: project
---

MeetUp Manager는 Next.js App Router + Supabase + shadcn/ui 스택으로 구현하는 동호회 모임 관리 MVP다.

**Why:** 소규모 동호회 주최자가 카카오톡·엑셀·수기 계산으로 분산된 행정 업무를 하나의 웹 앱에서 처리하기 위해 시작된 프로젝트다.

**How to apply:** 이 프로젝트에서 기능 추가/수정 제안 시 반드시 "주최자(Host)"와 "참여자(Member)" 두 역할의 권한 분리를 고려해야 한다. Supabase RLS가 권한 경계의 핵심이다.

주요 라우팅 구조:

- `/protected/` — 주최자 대시보드
- `/protected/meetings/[id]` — 모임 상세 (탭: 공지/참여자/카풀/정산)
- `/invite/[token]` — 참여자 초대 링크 (비로그인 미리보기 → 로그인 후 신청)

핵심 DB 테이블: meetings, notices, participations, carpool_drivers, carpool_passengers, settlements, settlement_items, settlement_participants

PRD 파일 위치: `D:\02_Study\inflearn\ClaudeCode2026\workspaces\nextjs-supabase-myapp\docs\PRD.md`
