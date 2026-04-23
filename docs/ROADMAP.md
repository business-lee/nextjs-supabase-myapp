# MeetUp Manager 개발 로드맵

소규모 동호회 주최자가 모임 공지·참여자 관리·카풀 조율·정산을 하나의 웹 앱에서 처리할 수 있도록 지원하는 MVP 개발 계획입니다.

## 개요

MeetUp Manager는 10~30명 규모 소규모 동호회를 혼자 운영하는 **주최자(Host)**, 초대 링크로 참여하는 **동호회 회원(Member)**, 플랫폼 전체를 운영하는 **관리자(Admin)**를 위한 모임 운영 플랫폼입니다:

- **모임 관리**: 모임 생성·수정·취소, 초대 링크 발급 및 공유
- **참여자 관리**: 선착순/수동 승인, 대기자 순번 자동 관리, 참여 통계
- **카풀 매칭**: 드라이버 등록, 동승 신청, 수락/거절, 확정 정보 조회
- **정산 관리**: 1/N 균등 분배 또는 수동 금액 입력, 납부 현황 체크
- **관리자 기능**: 전체 모임·사용자 관리, 플랫폼 통계 분석 (데스크톱 우선)

## 현재 구현 현황 (2026-04-19 기준)

### Phase 1~2 완료: Host/Member 전체 UI/UX 구현 완료

**인증 시스템 (Supabase DB 연동 완료)**

- 구글 소셜 로그인 (Supabase OAuth)
- 이메일 로그인/회원가입/비밀번호 찾기/변경
- Supabase 클라이언트 설정 (`lib/supabase/client.ts`, `server.ts`, `proxy.ts`)
- 기본 인증 라우팅 (`/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`, `/auth/confirm`, `/auth/error`)

**프로필 (일부 DB 연동)**

- 프로필 조회·수정 (`getProfile`, `updateProfile` — Supabase 연동 완료)
- 모임 통계 표시 (더미 데이터, Phase 3에서 DB 연동 예정)

**공통 인프라**

- profiles 테이블 및 TypeScript 타입 (`lib/supabase/database.types.ts`)
- 도메인 타입 정의 (`types/domain.ts`, `types/database.ts`)
- Zod 스키마 정의 (`lib/validations/`)
- shadcn/ui 컴포넌트: button, card, badge, checkbox, dialog, dropdown-menu, form, input, label, radio-group, select, separator, skeleton, sonner(toast), switch, textarea, avatar
- ESLint + Prettier + Husky + lint-staged 설정
- 모바일 컨테이너 레이아웃: 최대 너비 530px 중앙 정렬, 외부 배경 연한 회색
- 하단 고정 네비게이션 바: 홈·모임·새 모임·프로필 4개 메뉴, 경로 기반 활성 상태

**더미 데이터 기반 UI (Phase 3에서 DB 연동 예정)**

- `/protected/meetings` 모임 목록: 내가 만든 모임 / 내가 참여한 모임 섹션 구분, MeetingCard (D-day·참여 현황·미처리 신청 건수·참가 상태 배지)
- `/protected/meetings/new` 모임 생성 폼: React Hook Form + Zod, 전체 필드 UI 완성
- `/protected/meetings/[id]` 모임 상세: 주최자/참여자 역할 분기, 4개 탭 전체 구현
    - `?tab=notices` 공지사항 CRUD (주최자), 조회 (참여자), 고정 공지 정렬
    - `?tab=participants` 신청자 승인/거절 (주최자), 본인 상태 확인 (참여자), 참여 통계
    - `?tab=carpool` 드라이버 등록·동승 신청·수락/거절, 카풀 활성화 토글 (주최자)
    - `?tab=settlement` 비용 항목 입력·1/N 균등 분배·납부 현황 체크
- `/protected/meetings/[id]/edit` 모임 수정 폼 (생성 폼 재사용)
- `/invite/[token]` 초대 링크: 비로그인/주최자/이미신청/미신청 분기 UI 완성, 상단 서브타이틀 주최자 이름 표시("{주최자 이름} 님이 초대합니다"), 모임 정보 카드 내 주최자 이름 및 전체 참여자 수(N명) 표시

### Phase 2 Admin UI (Task 007~010): 구현 완료

- ✅ `/admin` 대시보드: 주요 지표 카드 UI, 최근 모임·최근 가입 사용자 2열 미니 테이블 (모두 보기 연결)
- ✅ `/admin/events` 이벤트 관리: 전체 모임 테이블, 검색·필터, 강제 취소 Dialog UI (수정 기능 없음 — 주최자 전용), 초대링크 코드 표시
- ✅ `/admin/users` 사용자 관리: 전체 사용자 테이블 (생성 모임수 포함), is_admin 토글 UI
- ✅ `/admin/stats` 통계 분석: 기간 필터, Bar/Line/Donut 차트 UI

### Admin 접근 제어 (부분 완료 — Task 020)

- ✅ `profiles.is_admin` 컬럼 DB 추가 완료
- ✅ `/admin` 미들웨어 예외 처리 — 자체 로그인 UI 표시
- ✅ `app/admin/layout.tsx` is_admin 체크 활성화 (미인증/비관리자/관리자 3분기)
- ✅ `AdminLoginPage.tsx` 생성 (Google OAuth 포함, LoginForm과 동일 패턴)
- ✅ 관리자 권한 관리: Supabase 대시보드 Table Editor에서 is_admin 직접 편집
- ⏳ Admin RLS 정책 (`auth.jwt() ->> 'is_admin'`) — Phase 3 Task 011 완료 후

### Phase 3 대상 (미구현)

- Supabase DB 테이블 생성 및 마이그레이션 (meetings, notices, participations, carpool_drivers, carpool_passengers, settlements, settlement_items, settlement_participants)
- RLS 정책 전체 적용 (Admin RLS 포함)
- 모임 생성·수정·취소 실제 DB 저장
- 참가 신청·승인·거절 실제 DB 처리
- 대기자 자동 승급 로직
- 공지사항·카풀·정산 DB 연동

---

## 개발 워크플로우

1. **작업 계획**
    - 기존 코드베이스를 학습하고 현재 상태를 파악
    - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
    - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
    - `/tasks` 디렉토리에 새 작업 파일 생성
    - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
    - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
    - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**

3. **작업 구현**
    - 작업 파일의 명세서를 따름
    - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
    - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
    - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
    - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
    - ROADMAP.md에서 완료된 Task를 포함해서 하위 목록 작업까지 ✅로 표시
    - 작업 완료 시 업데이트 표시 예시:
        ```
        ✅ Task 001 : XXXXXXX
         - ✅ xxxxxxxxxx
         - ✅ xxxxxxxxxx
         - ✅ xxxxxxxxxx
        ```

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> **목표**: 전체 라우트 구조와 빈 페이지 생성, TypeScript 타입 정의 (DB 스키마는 UI 검증 후 Phase 3에서 확정)
> **기간**: 2~3일

- ✅ **Task 001: 전체 라우트 구조 및 페이지 골격 생성** `[공통]` - 우선순위
    - ✅ `/protected` 대시보드 페이지 기본 골격 생성 (스타터 킷 내용 교체)
    - ✅ `/protected/meetings/new` 모임 생성 페이지 빈 파일 생성
    - ✅ `/protected/meetings/[id]` 모임 상세 페이지 빈 파일 생성 (탭 라우팅 포함)
    - ✅ `/protected/meetings/[id]/edit` 모임 수정 페이지 빈 파일 생성
    - ✅ `/invite/[token]` 초대 링크 페이지 빈 파일 생성
    - ✅ 공통 레이아웃 컴포넌트 골격 구성 (`app/protected/layout.tsx` 개선)
    - ✅ 루트 `app/page.tsx`를 서비스 랜딩 페이지로 변경
    - ✅ `/admin` 관리자 대시보드 빈 파일 생성 (`app/admin/layout.tsx`, `app/admin/page.tsx`)
    - ✅ `/admin/events`, `/admin/users`, `/admin/stats` 빈 파일 생성

- ✅ **Task 002: TypeScript 타입 정의** `[공통]` `[병렬가능]`
    - ✅ `types/` 디렉토리 생성 및 도메인별 타입 파일 구성
    - ✅ 신규 테이블 TypeScript 인터페이스 정의:
        - `Meeting`, `Notice`, `Participation`
        - `CarpoolDriver`, `CarpoolPassenger`
        - `Settlement`, `SettlementItem`, `SettlementParticipant`
    - ✅ 상태값 리터럴 타입 정의 (`'auto' | 'manual'`, `'active' | 'cancelled'`, `'pending' | 'approved' | 'rejected' | 'waitlisted'`, `'equal' | 'manual'`, `'pending' | 'accepted' | 'rejected'`)
    - ✅ Zod 스키마 정의 파일 생성 (`lib/validations/`)
    - ✅ Admin 관련 타입 정의 추가 (`AdminStats` 통계 집계 타입)

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> **목표**: 실제 API 연동 없이 더미 데이터로 전체 앱 화면 완성 (Host/Member + Admin), 이해관계자 피드백 수집 가능한 상태 구현. UI 피드백 기반으로 TypeScript 타입 보완 후 Phase 3에서 DB 스키마 확정
> **기간**: 6~7일

- ✅ **Task 003: 공통 컴포넌트 및 레이아웃 구현** `[UI]`
    - ✅ 모바일 우선 레이아웃 확정 (530px 컨테이너, 연한 회색 외부 배경)
    - ✅ 하단 고정 네비게이션 바 구현 (홈·모임·새모임·프로필 4개 메뉴, 경로 기반 활성 상태)
    - 하단 네비게이션 바 고도화 (로그인 사용자 아바타, 로그아웃 연동) — Phase 4 이후
    - ✅ 모임 카드 컴포넌트 (`MeetingCard`) 구현 (D-day 배지, 승인 인원/최대 인원, 미처리 신청 건수 / 참가 상태 배지 역할별 분기)
    - ✅ 탭 네비게이션 구현 (URL 쿼리 파라미터 기반 `?tab=notices`)
    - ✅ 더미 데이터 파일 작성 (`lib/mock-data.ts`): `getMockIsHost`, `getMockMyParticipation`, `getMockCreatedMeetingCards`, `getMockJoinedMeetingCards` 등
    - ✅ shadcn/ui 추가 컴포넌트 설치 (dialog, skeleton, sonner, avatar, select, separator, radio-group, switch)

- ✅ **Task 004: 주최자 대시보드 및 모임 생성/수정 UI 구현** `[UI]`
    - ✅ `/protected/meetings` 내 모임 목록 UI 완성 (내가 만든 모임 / 내가 참여한 모임 섹션, 카드 목록, 빈 상태 포함)
    - ✅ `/protected` → `/protected/meetings` 리다이렉트 처리
    - ✅ `/protected/meetings/new` 모임 생성 폼 UI 완성
        - ✅ React Hook Form + Zod 유효성 검사
        - ✅ 필드: 제목, 날짜/시간, 장소, 최대 인원, 참가비, 설명, 승인 방식(선착순/수동) 선택, 썸네일 이미지
    - ✅ `/protected/meetings/[id]/edit` 모임 수정 폼 UI 완성 (생성 폼 재사용, isEditMode prop)
    - ✅ 모임 취소 확인 Dialog UI 구현 (`MeetingCancelDialog`)

- ✅ **Task 005: 모임 상세 페이지 탭별 UI 구현** `[UI]`
    - ✅ 모임 헤더 UI (제목, 날짜, 장소, 참가비, 역할별 버튼 분기)
        - ✅ 상단 풀 너비 썸네일 영역 (Supabase Storage 업로드 연동, 주최자 교체·삭제 가능)
        - ✅ 주최자: 초대 링크 복사·수정·취소 버튼
        - ✅ 참여자: 내 참가 상태 배지 표시 (수정/취소 버튼 없음)
    - ✅ 공지사항 탭 (`?tab=notices`):
        - ✅ 공지 목록 (고정 공지 최상단 정렬)
        - ✅ 공지 작성/수정/삭제 Dialog (주최자 전용)
    - ✅ 참여자 탭 (`?tab=participants`):
        - ✅ 주최자: 신청자 목록, 승인/거절 버튼, 참여 통계 배지
        - ✅ 참여자: 본인 신청 상태 표시 (승인/대기/거절)
    - ✅ 카풀 탭 (`?tab=carpool`):
        - ✅ 카풀 활성화 토글 (주최자 전용)
        - ✅ 드라이버 등록 폼, 드라이버 카드 목록, 동승 신청 버튼
        - ✅ 동승 신청 수락/거절 버튼 (드라이버 전용)
    - ✅ 정산 탭 (`?tab=settlement`):
        - ✅ 비용 항목 입력 폼, 정산 방식 선택 (1/N / 수동)
        - ✅ 납부 현황 테이블 (주최자: 전체 체크, 참여자: 본인만)

- ✅ **Task 006: 초대 링크 페이지 UI 구현** `[UI]`
    - ✅ `/invite/[token]` 페이지 UI 완성 (`InviteView` 클라이언트 컴포넌트 분리)
    - ✅ 비로그인: 모임 기본 정보(제목, 날짜, 장소, 참가비) + "로그인하여 신청" 버튼
    - ✅ 로그인 + 주최자 본인: "내가 만든 모임" 안내 + 모임 상세 보기 버튼
    - ✅ 로그인 + 이미 신청: 현재 상태 표시 (승인됨 / 검토중 / 거절됨)
    - ✅ 로그인 + 미신청: "참가 신청" 버튼 (approval_type에 따라 즉시 승인 또는 대기 상태)
    - ✅ Skeleton 로딩 상태 구현
    - ✅ 상단 서브타이틀에 주최자 이름 표시 ("{주최자 이름} 님이 초대합니다")
    - ✅ 모임 정보 카드에 주최자 이름 및 전체 참여자 수(N명) 표시

- ✅ **Task 007: Admin 레이아웃 고도화 및 대시보드 UI 구현** `[UI]` - 우선순위
    - ✅ `app/admin/_components/AdminSidebar.tsx` 신규 생성 (`usePathname` 기반 활성 경로 하이라이트)
    - ✅ 사이드바 하단 현재 로그인 사용자 아바타·이름 표시 (더미 데이터: "김관리자")
    - ✅ 개발 모드 배너 추가 (development 환경에서만 표시: "⚠ 개발 모드: Admin 접근 제어 미적용")
    - ✅ `app/admin/page.tsx` 주요 지표 카드 4개 UI 구현 (더미 데이터 기반):
        - ✅ 총 모임 수 / 이번 달 신규 모임
        - ✅ 총 사용자 수 / 이번 달 신규 가입
    - ✅ 최근 모임·최근 가입 사용자 2열 나란히 배치 (각 5개, "모두 보기" 버튼 → /admin/events, /admin/users)
        - ✅ 최근 모임 테이블: 제목·주최자·날짜·상태
        - ✅ 최근 가입 사용자 테이블: 아바타·이름·이메일·가입일
    - ✅ shadcn/ui `Table` 컴포넌트 설치
    - ✅ Admin 전용 더미 데이터 추가 (`lib/mock-data.ts` 하단 신규 섹션):
        - ✅ `AdminStats` 인터페이스, `MOCK_ADMIN_STATS`, `getMockAdminStats()` 함수
        - ✅ `getMockRecentMeetings()`, `getMockRecentUsers()` 헬퍼 함수 추가

- ✅ **Task 008: Admin 이벤트 관리 UI 구현** `[UI]`
    - ✅ `app/admin/events/page.tsx` 전체 모임 목록 테이블 UI 구현 (MOCK_MEETINGS 활용)
        - ✅ 컬럼: 제목 / 주최자 / 날짜 / 상태 배지 / 참가 인원 / 초대링크 코드 / 액션
        - ✅ 수정 버튼 없음 — 모임 수정은 주최자 전용이므로 관리자 화면에서 제외
    - ✅ 클라이언트 사이드 검색 필터 (제목 기준) + 상태 필터 드롭다운
    - ✅ 강제 취소 확인 Dialog UI 골격
    - ✅ 빈 상태(Empty State) UI
    - ✅ 더미 데이터 추가: `AdminMeetingRow` 인터페이스(invite_token, thumbnail_url 포함), `getMockAdminMeetings()` 함수
    - ✅ 썸네일 컬럼 추가 (이미지 있으면 미리보기, 없으면 ImageIcon 플레이스홀더)

- ✅ **Task 009: Admin 사용자 관리 UI 구현** `[UI]`
    - ✅ `types/database.ts`에 `AdminProfileRow` 인터페이스 추가 (created_meeting_count 포함)
    - ✅ `app/admin/users/page.tsx` 전체 사용자 목록 테이블 UI 구현
        - ✅ 컬럼: 아바타 / 이름 / 이메일 / 가입일 / 생성 모임수 / 참여 모임 수 / Admin 권한 토글 / 액션
        - ✅ 이름 옆 Admin 배지 제거 (Admin 권한 열에서 확인 가능하므로 중복 제거)
    - ✅ `is_admin` 토글 Switch UI (클라이언트 로컬 상태 관리, 실제 저장은 Task 022에서 연동)
    - ✅ 계정 비활성화 확인 Dialog UI 골격
    - ✅ 이메일/이름 클라이언트 사이드 검색
    - ✅ 더미 데이터 추가: `getMockAdminUsers()` 함수 (MOCK_HOST + MOCK_MEMBERS 기반)

- ✅ **Task 010: Admin 통계 분석 UI 구현** `[UI]`
    - ✅ shadcn/ui chart + tabs 설치
    - ✅ `app/admin/stats/page.tsx` 통계 대시보드 UI 구현
    - ✅ 기간 선택 탭: 오늘 / 이번 주 / 이번 달 / 전체 (클라이언트 사이드 필터링)
    - ✅ 차트 3종 구현 (더미 시계열 데이터 기반):
        - ✅ 월별 신규 가입자 수 (Bar Chart)
        - ✅ 모임 생성·참가 신청 건수 추이 (Line Chart)
        - ✅ 기능 이용률: 기본/카풀/정산 (Donut Chart)
    - ✅ 더미 데이터 추가: `MOCK_USER_GROWTH`, `MOCK_MEETING_TREND`, `MOCK_FEATURE_USAGE`

> **피드백 포인트**: Phase 2 완료 후 더미 데이터 기반으로 Host/Member/Admin 전체 앱 플로우를 체험하고 이해관계자 피드백을 수집합니다.

---

### Phase 3: 데이터베이스 및 핵심 기능 구현

> **목표**: Supabase DB 마이그레이션 적용, 실제 API 연동, 핵심 비즈니스 로직 구현
> **기간**: 6~8일

- ✅ **Task 011: Supabase 데이터베이스 마이그레이션 및 RLS 정책 적용** `[BE]` - 우선순위
    - ✅ UI 검증 결과를 반영하여 DB 스키마 최종 확정
    - ✅ Migration SQL 파일 작성 (`supabase/migrations/`):
        - ✅ `profiles` 테이블에 `is_admin (boolean, default false)` 컬럼 추가 완료
        - ✅ `meetings` (invite_token UNIQUE, carpool_enabled, approval_type, status, thumbnail_url 포함)
        - ✅ `notices` (is_pinned, updated_at 포함)
        - ✅ `participations` (status, waitlist_order 포함 — 대기자 자동 승급 F012에 필수)
        - ✅ `carpool_drivers`, `carpool_passengers`
        - ✅ `settlements`, `settlement_items`, `settlement_participants` (is_paid, paid_at 포함)
    - ✅ `lib/supabase/database.types.ts` 신규 테이블 타입 추가 (generate 또는 수동 업데이트)
    - ✅ Supabase 대시보드 또는 CLI로 신규 테이블 마이그레이션 실행
    - ✅ RLS 정책 적용:
        - ✅ `meetings`: host_id 기준 INSERT/UPDATE/DELETE, invite_token 기반 SELECT (인증 사용자)
        - ✅ `participations`: 본인 행 INSERT/UPDATE, 주최자 모임 전체 조회/수정
        - ✅ `notices`: 주최자 CRUD, 승인된 참여자 SELECT
        - ✅ `carpool_drivers`, `carpool_passengers`: 승인된 참여자만 접근
        - ✅ `settlements`, `settlement_items`, `settlement_participants`: 주최자 전체, 참여자 본인 행
        - ✅ **Admin(is_admin = true)**: 모든 테이블 SELECT/UPDATE/DELETE 허용 (`is_admin()` SECURITY DEFINER 함수 조건)
    - ✅ `invite_token` UUID 자동 생성 DB 함수 또는 트리거 설정
    - **테스트 체크리스트 (Playwright MCP)**:
        - ✅ 마이그레이션 실행 후 테이블 구조 정상 생성 확인
        - ✅ profiles 테이블에 is_admin 컬럼 정상 추가 확인
        - ✅ RLS 정책 적용 후 다른 사용자의 모임 데이터 접근 차단 확인
        - ✅ is_admin = true 계정의 전체 테이블 접근 허용 확인
        - ✅ invite_token 고유성 제약 확인

- ✅ **Task 012: 모임 생성·수정·취소 API 연동** `[BE]` `[병렬가능]`
    - ✅ Server Action 또는 Route Handler로 모임 CRUD API 구현
    - ✅ 모임 생성 시 `invite_token` 자동 생성 (crypto.randomUUID 활용)
    - ✅ 모임 수정: 제목, 날짜, 장소, 최대 인원, 참가비 업데이트
    - ✅ 모임 취소: `status = 'cancelled'` 업데이트
    - ✅ `/protected/meetings/new` 폼 제출 실제 DB 저장 연동
    - ✅ `/protected/meetings/[id]/edit` 폼 제출 실제 DB 업데이트 연동
    - ✅ `/protected` 대시보드 실제 모임 목록 조회 (D-day, 참여 현황 집계 포함)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 모임 생성 후 대시보드에 카드 표시 확인
        - [ ] 모임 수정 후 변경 내용 반영 확인
        - [ ] 모임 취소 후 상태 변경 확인
        - [ ] 다른 사용자의 모임 수정/삭제 시도 차단 확인

- ✅ **Task 013: 초대 링크 및 참가 신청/승인 API 연동** `[BE]` `[병렬가능]`
    - ✅ `/invite/[token]` 페이지 invite_token 기반 모임 조회 실제 DB 연동:
        - ✅ meetings 테이블과 profiles 테이블 조인하여 주최자 이름(full_name) 조회
        - ✅ participations 집계로 전체 신청 인원수 조회 (F005 — 주최자 이름·참여자 수 표시)
    - ✅ 참가 신청 Server Action 구현:
        - ✅ `approval_type = 'auto'`: 승인 인원 < max_participants → `approved`, 초과 시 → `waitlisted` + `waitlist_order` 자동 부여
        - ✅ `approval_type = 'manual'`: 항상 `pending` 저장
    - ✅ 주최자 승인/거절 처리 Server Action 구현
    - ✅ 대기자 자동 승급 로직 (승인 취소/거절 시 `waitlist_order = 1` 자동 승인 후 순번 재정렬)
    - ✅ 참여자 탭 실제 데이터 연동 (참여 통계: 승인/대기/거절 인원 수)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 초대 링크 접속 후 모임 정보 표시 확인 (주최자 이름, 참여자 수 포함)
        - [ ] 비로그인 상태에서 신청 버튼 미노출 확인
        - [ ] 비로그인 상태에서도 주최자 이름·참여자 수 표시 확인 (F005)
        - [ ] 자동 승인 모드에서 max_participants 초과 시 대기자 처리 확인
        - [ ] 수동 승인 모드에서 주최자 승인/거절 동작 확인
        - [ ] 승인 취소 시 대기자 자동 승급 및 순번 재정렬 확인 (F012)

- ✅ **Task 014: 공지사항 CRUD API 연동** `[BE]` `[병렬가능]`
    - ✅ 공지 작성 Server Action (주최자 전용)
    - ✅ 공지 수정 Server Action (주최자 전용)
    - ✅ 공지 삭제 Server Action (주최자 전용)
    - ✅ 고정 공지 토글 (`is_pinned` 업데이트)
    - ✅ 공지 목록 조회 (고정 공지 최상단, 나머지 최신순)
    - ✅ 공지사항 탭 실제 데이터 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 주최자 공지 작성/수정/삭제 동작 확인
        - [ ] 고정 공지 최상단 정렬 확인
        - [ ] 참여자(Member) 공지 작성 시도 차단 확인

- ✅ **Task 015: 카풀 매칭 API 연동** `[BE]` `[병렬가능]`
    - ✅ 카풀 활성화/비활성화 토글 Server Action (`meetings.carpool_enabled` 업데이트)
    - ✅ 드라이버 등록 Server Action (출발지, 좌석 수, 출발 시간)
    - ✅ 동승 신청 Server Action (드라이버 선택)
    - ✅ 드라이버 동승 수락/거절 Server Action (`carpool_passengers.status` 업데이트)
    - ✅ 확정된 카풀 정보 조회 API (드라이버·동승자 모두 확인 가능)
    - ✅ 카풀 탭 실제 데이터 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 카풀 비활성화 시 탭 접근 제한 확인
        - [ ] 드라이버 등록 후 목록 표시 확인
        - [ ] 동승 신청 후 수락/거절 동작 확인
        - [ ] 미승인 참여자의 카풀 접근 차단 확인
        - [ ] 드라이버 등록부터 동승 확정까지 페이지 이탈 없이 한 화면 내에서 완료 확인 (성공 기준)

- ✅ **Task 016: 정산 관리 API 연동** `[BE]` `[병렬가능]`
    - ✅ 정산 생성 Server Action (총 비용, 항목, 정산 방식 선택)
    - ✅ 1/N 균등 분배 계산 로직:
        - ✅ `total_amount ÷ 승인된 참여자 수` (소수점 내림)
        - ✅ 나머지 금액 주최자에게 배정
        - ✅ `settlement_participants` 행 일괄 INSERT
    - ✅ 수동 금액 입력 모드 구현
    - ✅ 주최자 납부 현황 체크 Server Action
    - ✅ 참여자 셀프 납부 완료 체크 Server Action (`settlement_participants.is_paid` 업데이트)
    - ✅ 정산 탭 실제 데이터 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 1/N 분배 계산 정확성 확인 (나머지 금액 주최자 배정)
        - [ ] 수동 금액 입력 및 저장 확인
        - [ ] 참여자 셀프 납부 체크 동작 확인
        - [ ] 주최자 납부 현황 체크 동작 확인
        - [ ] 정산 금액 입력 후 참여자별 납부 금액 즉시 계산·표시 확인 (성공 기준)

---

### Phase 4: 부가 기능 완성 및 Admin BE 연동

> **목표**: Host/Member 부가 기능 완성, Admin UI(Phase 2 Task 007~010) 더미 데이터를 실제 Supabase DB 연동으로 교체, is_admin 기반 접근 제어 완성
> **선행 조건**: Phase 3 Task 011 (DB 마이그레이션 및 is_admin 컬럼 추가) 완료
> **기간**: 5~6일

- **Task 017: 정산 현황 공유 및 부가 기능 구현** `[공통]`
    - 정산 현황 공유 링크 생성 기능 (F015)
        - 공개 정산 조회 페이지 라우트 추가 (예: `/share/settlement/[id]`)
        - 클립보드 복사 버튼 구현
    - 초대 링크 클립보드 복사 기능 개선 (복사 완료 토스트 알림)
    - 모임 D-day 표시 유틸리티 함수 구현
    - 에러 상태 Toast 알림 전체 적용 (shadcn/ui Sonner 활용)
    - Skeleton 로딩 상태 전체 페이지 적용
    - 빈 상태(Empty State) UI 처리 (모임 없음, 공지 없음, 참여자 없음 등)

- **Task 020: Admin 접근 제어 BE 구현** `[BE]` - 우선순위
    - ✅ `app/admin/layout.tsx`의 is_admin 체크 활성화 (profiles.is_admin DB 조회)
    - ✅ `/admin` 경로를 미들웨어(`proxy.ts`) 리다이렉트 예외에 추가
    - ✅ 비로그인 접근 시 `/admin` 내 로그인 UI 표시 (`AdminLoginPage`) — 외부 리다이렉트 없음
    - ✅ is_admin=false 로그인 계정 접근 시 접근 거부 UI 표시
    - ✅ 초기 Admin 계정 설정: Supabase 대시보드 → Table Editor → profiles → is_admin 직접 편집
    - ⏳ Admin 전용 RLS 정책 (`auth.jwt() ->> 'is_admin' = 'true'` 조건) — Task 011 전체 완료 후
    - **선행 조건**: Task 011 완료 필요
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] is_admin = true 계정으로 `/admin` 정상 접근 확인
        - [ ] is_admin = false 계정의 `/admin/*` 접근 시 접근 거부 메시지 확인
        - [ ] 비로그인 상태의 `/admin/*` 접근 시 `/admin` 내 로그인 UI 표시 확인

- **Task 021: Admin 이벤트 관리 BE 연동** `[BE]` `[병렬가능]`
    - 전체 모임 조회 Server Action 구현 (Admin RLS 활용, 페이지네이션 포함)
    - 모임 강제 취소 Server Action (`status = 'cancelled'` 업데이트)
    - 모임 삭제 Server Action (확인 Dialog 포함)
    - `app/admin/events/page.tsx` 더미 데이터 → 실제 Server Action 호출로 교체
    - 검색·필터를 서버 사이드 쿼리로 전환
    - 참고: 모임 수정은 주최자 전용 기능 — Admin은 강제 취소만 가능
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] Admin 계정으로 전체 모임 목록 조회 확인
        - [ ] 모임 강제 취소 후 status 변경 확인
        - [ ] 비관리자 계정의 `/admin/events` 접근 차단 확인

- **Task 022: Admin 사용자 관리 BE 연동** `[BE]` `[병렬가능]`
    - 전체 사용자 조회 Server Action (profiles 전체, 참여 모임 수 집계 JOIN 포함)
    - `is_admin` 토글 Server Action (`profiles.is_admin` UPDATE)
    - 계정 비활성화 처리 Server Action
    - `app/admin/users/page.tsx` 더미 데이터 → 실제 Server Action 호출로 교체
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] Admin 계정으로 전체 사용자 목록 조회 확인
        - [ ] is_admin 토글 후 대상 계정 권한 변경 확인
        - [ ] 비관리자 계정의 `/admin/users` 접근 차단 확인

- **Task 023: Admin 통계 분석 BE 연동** `[BE]` `[병렬가능]`
    - 기간별 신규 가입자 집계 쿼리 (profiles.created_at 기준 GROUP BY)
    - 기간별 모임 생성·참가 신청 추이 집계 쿼리
    - 카풀·정산 이용률 집계 쿼리
    - `app/admin/stats/page.tsx` 더미 데이터 → 실제 Server Action 호출로 교체
    - 기간 필터를 서버 사이드 쿼리 파라미터로 전환
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 기간 필터 변경 시 차트 데이터 갱신 확인
        - [ ] 비관리자 계정의 `/admin/stats` 접근 차단 확인

---

### Phase 5: 품질 향상 및 Vercel 배포

> **목표**: 모바일 반응형 최적화, 접근성 개선, 프로덕션 배포 검증
> **기간**: 3~4일

- **Task 018: 모바일 반응형 최적화 및 접근성 개선** `[UI]`
    - 전체 페이지 모바일(360px 이상) 반응형 레이아웃 검증 및 수정 (530px 컨테이너 기준)
    - 터치 친화적 버튼/탭 크기 조정
    - 키보드 접근성 및 포커스 관리 개선
    - 모달/Dialog 모바일 최적화 (Bottom Sheet 패턴 고려)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 360px, 375px, 768px, 1280px 뷰포트에서 주요 페이지 렌더링 확인
        - [ ] 모바일에서 탭 전환 동작 확인
        - [ ] 모바일에서 폼 입력 및 제출 동작 확인

- **Task 019: Vercel 배포 및 프로덕션 환경 검증** `[공통]` - 우선순위
    - Vercel 프로젝트 생성 및 GitHub 레포 Import 연동 (vercel.com/new)
    - Vercel Dashboard > Settings > Environment Variables에 환경 변수 등록
        - `NEXT_PUBLIC_SUPABASE_URL` (Production / Preview / Development 모두 적용)
        - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Production / Preview / Development 모두 적용)
    - 빌드 설정 확인: Framework Preset `Next.js`, Build Command `npm run build`, Output `.next`
    - `next.config.ts`의 `images.remotePatterns`에 Supabase Storage CDN 도메인 등록 확인:
        ```typescript
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: '*.supabase.co',
                    pathname: '/storage/v1/object/public/**',
                },
            ],
        }
        ```
    - `main` 브랜치 push → 프로덕션 자동 배포 트리거 확인
    - `.vercel.app` 기본 도메인에서 전체 사용자 여정 E2E 검증
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] `.vercel.app` 도메인 접속 후 핵심 화면 렌더링 정상 확인
        - [ ] 구글 로그인 OAuth 리다이렉트 URL 프로덕션 도메인 설정 확인
        - [ ] Supabase 프로필 이미지(CDN) 정상 로드 확인
        - [ ] 주요 인터랙션(모임 생성, 참가 신청, 탭 전환) 동작 확인
        - [ ] `npm run build` 빌드 성공 확인 (타입 에러 없음)
        - [ ] 환경 변수 미등록 시 에러 처리 확인

---

## 기능 ID 추적표

> **상태 범례**: ✅ 완료(DB 연동) | 🔄 UI 완료(Phase 3 DB 연동 예정) | 🔄 일부 완료 | ⏳ 대기

| 기능 ID | 기능명                                                  | 담당 Task             | 상태         |
| ------- | ------------------------------------------------------- | --------------------- | ------------ |
| F001    | 구글 로그인                                             | 기존 구현 완료        | ✅ 완료      |
| F002    | 모임 생성                                               | ✅ Task 004, Task 012 | ✅ 완료      |
| F003    | 모임 대시보드                                           | ✅ Task 004, Task 012 | ✅ 완료      |
| F004    | 초대 링크 공유                                          | ✅ Task 005, Task 012 | ✅ 완료      |
| F005    | 초대 링크 접속                                          | ✅ Task 006, Task 013 | ✅ 완료      |
| F006    | 참가 신청 및 승인                                       | ✅ Task 006, Task 013 | ✅ 완료      |
| F007    | 공지사항 CRUD                                           | ✅ Task 005, Task 014 | ✅ 완료      |
| F008    | 카풀 매칭                                               | ✅ Task 005, Task 015 | ✅ 완료      |
| F009    | 정산 관리                                               | ✅ Task 005, Task 016 | ✅ 완료      |
| F010    | 모임 수정                                               | ✅ Task 004, Task 012 | ✅ 완료      |
| F011    | 모임 취소                                               | ✅ Task 004, Task 012 | ✅ 완료      |
| F012    | 대기자 자동 승급                                        | ✅ Task 013           | ✅ 완료      |
| F013    | 참여 통계 표시                                          | ✅ Task 005, Task 013 | ✅ 완료      |
| F014    | 카풀 활성화 토글                                        | ✅ Task 005, Task 015 | ✅ 완료      |
| F015    | 정산 현황 공유                                          | Task 017              | ⏳ 대기      |
| F016    | 관리자 이벤트 관리 (강제 취소·초대링크 조회, 수정 제외) | ✅ Task 008, Task 021 | 🔄 UI 완료   |
| F017    | 관리자 사용자 관리 (생성·참여 모임수 포함)              | ✅ Task 009, Task 022 | 🔄 UI 완료   |
| F018    | 관리자 통계 분석                                        | ✅ Task 010, Task 023 | 🔄 UI 완료   |
| F019    | 프로필 관리                                             | ✅ Task 003, Task 012 | 🔄 일부 완료 |
| F020    | 관리자 대시보드 UI                                      | ✅ Task 007, Task 020 | 🔄 UI 완료   |

---

## 라우트 구조 요약

```
/ (루트 - 서비스 랜딩 페이지)
├── /auth
│   ├── /auth/login                     # 구글 로그인 (구현 완료)
│   ├── /auth/sign-up                   # 회원가입 (구현 완료)
│   ├── /auth/forgot-password           # 비밀번호 찾기 (구현 완료)
│   ├── /auth/update-password           # 비밀번호 변경 (구현 완료)
│   ├── /auth/confirm                   # 이메일 OTP 확인 (구현 완료)
│   └── /auth/error                     # 인증 오류 페이지 (구현 완료)
│
├── /invite
│   └── /invite/[token]                 # 초대 링크 진입점 (Task 006, 013)
│
├── /share
│   └── /share/settlement/[id]          # 정산 현황 공유 (Task 017)
│
├── /protected                          # 인증 필수 영역
│   ├── /protected                      # → /protected/meetings 리다이렉트 (Task 004)
│   └── /protected/meetings
│       ├── /protected/meetings         # 내 모임 목록 대시보드 (Task 004, 012)
│       ├── /protected/meetings/new     # 모임 생성 폼 (Task 004, 012)
│       ├── /protected/meetings/[id]    # 모임 상세 (Task 005, 012~016)
│       │   ├── ?tab=notices            # 공지사항 탭 (Task 005, 014)
│       │   ├── ?tab=participants       # 참여자 탭 (Task 005, 013)
│       │   ├── ?tab=carpool            # 카풀 탭 (Task 005, 015)
│       │   └── ?tab=settlement         # 정산 탭 (Task 005, 016)
│       └── /protected/meetings/[id]/edit  # 모임 수정 폼 (Task 004, 012)
│
└── /admin                              # 관리자 전용 (is_admin = true)
    ├── /admin                          # 관리자 대시보드 (Task 007, 020)
    ├── /admin/events                   # 이벤트 관리 (Task 008, 021)
    ├── /admin/users                    # 사용자 관리 (Task 009, 022)
    └── /admin/stats                    # 통계 분석 (Task 010, 023)
```

---

## 주요 기술적 위험 요소

| 위험 요소                                    | 영향도 | 대응 방안                                     |
| -------------------------------------------- | ------ | --------------------------------------------- |
| 대기자 자동 승급 로직 동시성 이슈            | 높음   | Supabase DB 함수(RPC) 또는 트랜잭션 활용      |
| RLS 정책 복잡성으로 인한 쿼리 오류           | 높음   | Phase 3 초기에 RLS 테스트 우선 수행           |
| 1/N 정산 나머지 금액 배분 정확성             | 중간   | 정수 연산 및 단위 테스트 작성                 |
| 초대 링크 페이지 비로그인 상태 처리          | 중간   | Next.js 미들웨어 예외 경로 설정 확인          |
| Vercel 배포 시 Supabase OAuth 리다이렉트 URL | 중간   | 프로덕션 URL을 Supabase Auth 허용 목록에 추가 |

---

## 성공 기준 체크리스트

- [ ] 주최자가 로그인 후 5분 이내에 모임을 생성하고 초대 링크를 발급할 수 있다
- [ ] 참여자가 초대 링크 접속 후 3단계(링크 접속 → Google 로그인 → 신청) 이내에 참가 신청을 완료할 수 있다
- [ ] 주최자가 신청자 목록에서 승인/거절 처리 시 대기자 순번이 자동으로 갱신된다
- [ ] 카풀 드라이버 등록부터 동승 확정까지 UI 이탈 없이 한 페이지 내에서 완료된다
- [ ] 정산 금액 입력 후 참여자별 납부 금액이 즉시 계산되어 표시된다
- [ ] 모든 Host/Member 페이지가 모바일(360px 이상) 화면에서 정상적으로 표시된다
- [ ] 관리자 페이지가 데스크톱(1280px 이상) 환경에서 사이드바 레이아웃으로 정상 표시된다
- [ ] Supabase RLS로 인해 다른 모임의 데이터에 무단 접근이 차단된다
- [ ] is_admin = false 사용자가 `/admin/*` 경로에 접근 시 리다이렉트된다
