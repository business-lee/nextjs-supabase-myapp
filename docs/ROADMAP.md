# MeetUp Manager 개발 로드맵

소규모 동호회 주최자가 모임 공지·참여자 관리·카풀 조율·정산을 하나의 웹 앱에서 처리할 수 있도록 지원하는 MVP 개발 계획입니다.

## 개요

MeetUp Manager는 10~30명 규모 소규모 동호회를 혼자 운영하는 **주최자(Host)**, 초대 링크로 참여하는 **동호회 회원(Member)**, 플랫폼 전체를 운영하는 **관리자(Admin)**를 위한 모임 운영 플랫폼입니다:

- **모임 관리**: 모임 생성·수정·취소, 초대 링크 발급 및 공유
- **참여자 관리**: 선착순/수동 승인, 대기자 순번 자동 관리, 참여 통계
- **카풀 매칭**: 드라이버 등록, 동승 신청, 수락/거절, 확정 정보 조회
- **정산 관리**: 1/N 균등 분배 또는 수동 금액 입력, 납부 현황 체크
- **관리자 기능**: 전체 모임·사용자 관리, 플랫폼 통계 분석 (데스크톱 우선)

## 현재 구현 현황 (2026-04-17 기준)

### 이미 구현된 기능

- 구글 소셜 로그인 (Supabase OAuth)
- 이메일 로그인/회원가입/비밀번호 찾기/변경
- Supabase 클라이언트 설정 (`lib/supabase/client.ts`, `server.ts`, `proxy.ts`)
- 기본 인증 라우팅 (`/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`, `/auth/confirm`, `/auth/error`)
- profiles 테이블 및 TypeScript 타입 (`lib/supabase/database.types.ts`)
- shadcn/ui 컴포넌트 (button, card, badge, checkbox, dropdown-menu, form, input, label, textarea)
- ESLint + Prettier + Husky + lint-staged 설정

### 미구현 기능 (이번 로드맵 대상)

- `/protected` 주최자 대시보드 (현재 스타터 킷 기본 화면)
- 모임 관련 모든 페이지 및 기능
- `/invite/[token]` 초대 링크 페이지
- Supabase DB 테이블 (meetings, notices, participations, carpool_drivers, carpool_passengers, settlements, settlement_items, settlement_participants) 및 RLS 정책
- 공지사항, 카풀, 정산 기능 전체
- `/admin/*` 관리자 전용 페이지 (이벤트 관리, 사용자 관리, 통계 분석)
- `profiles.is_admin` 컬럼 및 Admin RLS 정책

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

- **Task 001: 전체 라우트 구조 및 페이지 골격 생성** `[공통]` - 우선순위
    - `/protected` 대시보드 페이지 기본 골격 생성 (스타터 킷 내용 교체)
    - `/protected/meetings/new` 모임 생성 페이지 빈 파일 생성
    - `/protected/meetings/[id]` 모임 상세 페이지 빈 파일 생성 (탭 라우팅 포함)
    - `/protected/meetings/[id]/edit` 모임 수정 페이지 빈 파일 생성
    - `/invite/[token]` 초대 링크 페이지 빈 파일 생성
    - 공통 레이아웃 컴포넌트 골격 구성 (`app/protected/layout.tsx` 개선)
    - 루트 `app/page.tsx`를 서비스 랜딩 페이지로 변경
    - `/admin` 관리자 대시보드 빈 파일 생성 (`app/admin/layout.tsx`, `app/admin/page.tsx`)
    - `/admin/events`, `/admin/users`, `/admin/stats` 빈 파일 생성

- **Task 002: TypeScript 타입 정의** `[공통]` `[병렬가능]`
    - `types/` 디렉토리 생성 및 도메인별 타입 파일 구성
    - 신규 테이블 TypeScript 인터페이스 정의:
        - `Meeting`, `Notice`, `Participation`
        - `CarpoolDriver`, `CarpoolPassenger`
        - `Settlement`, `SettlementItem`, `SettlementParticipant`
    - 상태값 리터럴 타입 정의 (`'auto' | 'manual'`, `'active' | 'cancelled'`, `'pending' | 'approved' | 'rejected' | 'waitlisted'`, `'equal' | 'manual'`, `'pending' | 'accepted' | 'rejected'`)
    - Zod 스키마 정의 파일 생성 (`lib/validations/`)
    - Admin 관련 타입 정의 추가 (`AdminStats` 통계 집계 타입)

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> **목표**: 실제 API 연동 없이 더미 데이터로 전체 앱 화면 완성, 이해관계자 피드백 수집 가능한 상태 구현. UI 피드백 기반으로 TypeScript 타입 보완 후 Phase 3에서 DB 스키마 확정
> **기간**: 4~5일

- **Task 003: 공통 컴포넌트 및 레이아웃 구현** `[UI]`
    - 앱 공통 네비게이션 바 컴포넌트 구현 (로그인 사용자 아바타, 로그아웃)
    - 모바일 우선 반응형 레이아웃 확정
    - 모임 카드 컴포넌트 (`MeetingCard`) 구현 (D-day, 승인 인원/최대 인원, 미처리 신청 건수 표시)
    - 탭 네비게이션 컴포넌트 구현 (URL 쿼리 파라미터 기반 `?tab=notices`)
    - 더미 데이터 생성 유틸리티 파일 작성 (`lib/mock-data.ts`)
    - shadcn/ui 추가 컴포넌트 설치 (Tabs, Dialog, Skeleton, Toast/Sonner, Badge, Avatar, Select, Separator)

- **Task 004: 주최자 대시보드 및 모임 생성/수정 UI 구현** `[UI]` `[병렬가능]`
    - `/protected` 주최자 대시보드 UI 완성 (모임 카드 목록, 최신순 정렬, 더미 데이터)
    - `/protected/meetings/new` 모임 생성 폼 UI 완성
        - React Hook Form + Zod 기반 폼 구조 (실제 제출은 더미 처리)
        - 필드: 제목, 날짜/시간, 장소, 최대 인원, 참가비, 설명, 승인 방식(선착순/수동) 선택
    - `/protected/meetings/[id]/edit` 모임 수정 폼 UI 완성 (생성 폼 재사용)
    - 모임 취소 확인 Dialog UI 구현

- **Task 005: 모임 상세 페이지 탭별 UI 구현** `[UI]` `[병렬가능]`
    - 모임 헤더 UI 구현 (제목, 날짜, 장소, 참가비, 초대 링크 복사 버튼, 역할별 수정/취소 버튼)
    - 공지사항 탭 UI (`?tab=notices`):
        - 공지 목록 (고정 공지 최상단), 공지 작성/수정/삭제 Dialog (주최자 전용)
    - 참여자 탭 UI (`?tab=participants`):
        - 주최자: 신청자 목록, 승인/거절 버튼, 대기 순번, 참여 통계 배지
        - 참여자: 본인 신청 상태 표시 (승인/대기 순번/거절)
    - 카풀 탭 UI (`?tab=carpool`):
        - 카풀 활성화 토글 (주최자 전용)
        - 드라이버 등록 폼, 드라이버 카드 목록, 동승 신청 버튼
        - 동승 신청 수락/거절 버튼 (드라이버 전용)
    - 정산 탭 UI (`?tab=settlement`):
        - 비용 항목 입력 폼, 정산 방식 선택 (1/N / 수동)
        - 납부 현황 테이블 (주최자: 전체 체크, 참여자: 본인만)

- **Task 006: 초대 링크 페이지 UI 구현** `[UI]` `[병렬가능]`
    - `/invite/[token]` 페이지 UI 완성
    - 비로그인 상태: 모임 기본 정보(제목, 날짜, 장소, 참가비) 미리보기 + "로그인하여 신청" 버튼
    - 로그인 상태:
        - 미신청: "참가 신청" 버튼
        - 신청됨: 현재 상태 표시 (승인/대기[순번]/거절)
    - Skeleton 로딩 상태 구현

> **피드백 포인트**: Phase 2 완료 후 더미 데이터 기반으로 전체 앱 플로우를 체험하고 이해관계자 피드백을 수집합니다.

---

### Phase 3: 데이터베이스 및 핵심 기능 구현

> **목표**: Supabase DB 마이그레이션 적용, 실제 API 연동, 핵심 비즈니스 로직 구현
> **기간**: 6~8일

- **Task 007: Supabase 데이터베이스 마이그레이션 및 RLS 정책 적용** `[BE]` - 우선순위
    - UI 검증 결과를 반영하여 DB 스키마 최종 확정
    - Migration SQL 파일 작성 (`supabase/migrations/`):
        - `profiles` 테이블에 `is_admin (boolean, default false)` 컬럼 추가
        - `meetings`, `notices`, `participations`
        - `carpool_drivers`, `carpool_passengers`
        - `settlements`, `settlement_items`, `settlement_participants`
    - `lib/supabase/database.types.ts` 신규 테이블 타입 추가 (generate 또는 수동 업데이트)
    - Supabase 대시보드 또는 CLI로 신규 테이블 마이그레이션 실행
    - RLS 정책 적용:
        - `meetings`: host_id 기준 INSERT/UPDATE/DELETE, invite_token 기반 SELECT (인증 사용자)
        - `participations`: 본인 행 INSERT/UPDATE, 주최자 모임 전체 조회/수정
        - `notices`: 주최자 CRUD, 승인된 참여자 SELECT
        - `carpool_drivers`, `carpool_passengers`: 승인된 참여자만 접근
        - `settlements`, `settlement_items`, `settlement_participants`: 주최자 전체, 참여자 본인 행
        - **Admin(is_admin = true)**: 모든 테이블 SELECT/UPDATE/DELETE 허용 (`auth.jwt() ->> 'is_admin' = 'true'` 조건)
    - `invite_token` UUID 자동 생성 DB 함수 또는 트리거 설정
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 마이그레이션 실행 후 테이블 구조 정상 생성 확인
        - [ ] profiles 테이블에 is_admin 컬럼 정상 추가 확인
        - [ ] RLS 정책 적용 후 다른 사용자의 모임 데이터 접근 차단 확인
        - [ ] is_admin = true 계정의 전체 테이블 접근 허용 확인
        - [ ] invite_token 고유성 제약 확인

- **Task 008: 모임 생성·수정·취소 API 연동** `[BE]` `[병렬가능]`
    - Server Action 또는 Route Handler로 모임 CRUD API 구현
    - 모임 생성 시 `invite_token` 자동 생성 (crypto.randomUUID 활용)
    - 모임 수정: 제목, 날짜, 장소, 최대 인원, 참가비 업데이트
    - 모임 취소: `status = 'cancelled'` 업데이트
    - `/protected/meetings/new` 폼 제출 실제 DB 저장 연동
    - `/protected/meetings/[id]/edit` 폼 제출 실제 DB 업데이트 연동
    - `/protected` 대시보드 실제 모임 목록 조회 (D-day, 참여 현황 집계 포함)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 모임 생성 후 대시보드에 카드 표시 확인
        - [ ] 모임 수정 후 변경 내용 반영 확인
        - [ ] 모임 취소 후 상태 변경 확인
        - [ ] 다른 사용자의 모임 수정/삭제 시도 차단 확인

- **Task 009: 초대 링크 및 참가 신청/승인 API 연동** `[BE]` `[병렬가능]`
    - `/invite/[token]` 페이지 invite_token 기반 모임 조회 실제 DB 연동
    - 참가 신청 Server Action 구현:
        - `approval_type = 'auto'`: 승인 인원 < max_participants → `approved`, 초과 시 → `waitlisted` + `waitlist_order` 자동 부여
        - `approval_type = 'manual'`: 항상 `pending` 저장
    - 주최자 승인/거절 처리 Server Action 구현
    - 대기자 자동 승급 로직 (승인 취소/거절 시 `waitlist_order = 1` 자동 승인 후 순번 재정렬)
    - 참여자 탭 실제 데이터 연동 (참여 통계: 승인/대기/거절 인원 수)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 초대 링크 접속 후 모임 정보 표시 확인
        - [ ] 비로그인 상태에서 신청 버튼 미노출 확인
        - [ ] 자동 승인 모드에서 max_participants 초과 시 대기자 처리 확인
        - [ ] 수동 승인 모드에서 주최자 승인/거절 동작 확인
        - [ ] 승인 취소 시 대기자 자동 승급 및 순번 재정렬 확인

- **Task 010: 공지사항 CRUD API 연동** `[BE]` `[병렬가능]`
    - 공지 작성 Server Action (주최자 전용)
    - 공지 수정 Server Action (주최자 전용)
    - 공지 삭제 Server Action (주최자 전용)
    - 고정 공지 토글 (`is_pinned` 업데이트)
    - 공지 목록 조회 (고정 공지 최상단, 나머지 최신순)
    - 공지사항 탭 실제 데이터 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 주최자 공지 작성/수정/삭제 동작 확인
        - [ ] 고정 공지 최상단 정렬 확인
        - [ ] 참여자(Member) 공지 작성 시도 차단 확인

- **Task 011: 카풀 매칭 API 연동** `[BE]` `[병렬가능]`
    - 카풀 활성화/비활성화 토글 Server Action (`meetings.carpool_enabled` 업데이트)
    - 드라이버 등록 Server Action (출발지, 좌석 수, 출발 시간)
    - 동승 신청 Server Action (드라이버 선택)
    - 드라이버 동승 수락/거절 Server Action (`carpool_passengers.status` 업데이트)
    - 확정된 카풀 정보 조회 API (드라이버·동승자 모두 확인 가능)
    - 카풀 탭 실제 데이터 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 카풀 비활성화 시 탭 접근 제한 확인
        - [ ] 드라이버 등록 후 목록 표시 확인
        - [ ] 동승 신청 후 수락/거절 동작 확인
        - [ ] 미승인 참여자의 카풀 접근 차단 확인

- **Task 012: 정산 관리 API 연동** `[BE]` `[병렬가능]`
    - 정산 생성 Server Action (총 비용, 항목, 정산 방식 선택)
    - 1/N 균등 분배 계산 로직:
        - `total_amount ÷ 승인된 참여자 수` (소수점 내림)
        - 나머지 금액 주최자에게 배정
        - `settlement_participants` 행 일괄 INSERT
    - 수동 금액 입력 모드 구현
    - 주최자 납부 현황 체크 Server Action
    - 참여자 셀프 납부 완료 체크 Server Action (`settlement_participants.is_paid` 업데이트)
    - 정산 탭 실제 데이터 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 1/N 분배 계산 정확성 확인 (나머지 금액 주최자 배정)
        - [ ] 수동 금액 입력 및 저장 확인
        - [ ] 참여자 셀프 납부 체크 동작 확인
        - [ ] 주최자 납부 현황 체크 동작 확인

---

### Phase 4: 고급 기능, 품질 향상 및 Vercel 배포

> **목표**: 부가 기능 완성, 성능 최적화, 프로덕션 배포 검증
> **기간**: 3~4일

- **Task 013: 정산 현황 공유 및 부가 기능 구현** `[공통]`
    - 정산 현황 공유 링크 생성 기능 (F015)
        - 공개 정산 조회 페이지 라우트 추가 (예: `/share/settlement/[id]`)
        - 클립보드 복사 버튼 구현
    - 초대 링크 클립보드 복사 기능 개선 (복사 완료 토스트 알림)
    - 모임 D-day 표시 유틸리티 함수 구현
    - 에러 상태 Toast 알림 전체 적용 (shadcn/ui Sonner 활용)
    - Skeleton 로딩 상태 전체 페이지 적용
    - 빈 상태(Empty State) UI 처리 (모임 없음, 공지 없음, 참여자 없음 등)

- **Task 014: 모바일 반응형 최적화 및 접근성 개선** `[UI]`
    - 전체 페이지 모바일(360px 이상) 반응형 레이아웃 검증 및 수정
    - 터치 친화적 버튼/탭 크기 조정
    - 키보드 접근성 및 포커스 관리 개선
    - 모달/Dialog 모바일 최적화 (Bottom Sheet 패턴 고려)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 360px, 375px, 768px, 1280px 뷰포트에서 주요 페이지 렌더링 확인
        - [ ] 모바일에서 탭 전환 동작 확인
        - [ ] 모바일에서 폼 입력 및 제출 동작 확인

- **Task 015: Vercel 배포 및 프로덕션 환경 검증** `[공통]` - 우선순위
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

### Phase 5: 관리자(Admin) 기능 구현

> **목표**: 플랫폼 운영자용 Admin 대시보드 완성 (데스크톱 우선, 사이드바 네비게이션)
> **선행 조건**: Phase 4 완료 (Host/Member 기능 및 Vercel 배포 완성)
> **기간**: 3~4일

- **Task 016: Admin 레이아웃 및 접근 제어 구현** `[공통]` - 우선순위
    - `app/admin/layout.tsx` 사이드바 네비게이션 레이아웃 구현 (데스크톱 우선, 1280px+ 최적화)
    - 사이드바 메뉴: 이벤트 관리 / 사용자 관리 / 통계 분석
    - Admin 접근 제어 미들웨어 구현 (`profiles.is_admin` 검증, 비관리자 접근 시 `/` 리다이렉트)
    - `/admin` 대시보드 메인 페이지 구현 (주요 지표 요약 카드)
    - shadcn/ui 추가 컴포넌트 설치 필요 시 (Table, Chart 등)

- **Task 017: 이벤트 관리 페이지 구현** `[BE+UI]` `[병렬가능]`
    - `/admin/events` 전체 모임 목록 테이블 UI (검색·필터·정렬)
    - 모임 수정 Dialog 구현 (제목·날짜·장소·최대 인원·참가비)
    - 강제 취소 처리 Server Action (`status = 'cancelled'`)
    - 모임 삭제 처리 Server Action (확인 Dialog 포함)
    - 전체 모임 조회 API 연동 (Admin RLS 정책 활용)
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] Admin 계정으로 전체 모임 목록 조회 확인
        - [ ] 모임 강제 취소 후 status 변경 확인
        - [ ] 비관리자 계정의 `/admin/events` 접근 차단 확인

- **Task 018: 사용자 관리 페이지 구현** `[BE+UI]` `[병렬가능]`
    - `/admin/users` 전체 사용자 목록 테이블 UI (이메일·가입일·참여 모임 수)
    - `is_admin` 토글 Switch 구현 (관리자 권한 부여/회수)
    - 계정 비활성화 처리 Server Action
    - 전체 사용자 조회 API 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] Admin 계정으로 전체 사용자 목록 조회 확인
        - [ ] is_admin 토글 후 대상 계정 권한 변경 확인
        - [ ] 비관리자 계정의 `/admin/users` 접근 차단 확인

- **Task 019: 통계 분석 페이지 구현** `[BE+UI]` `[병렬가능]`
    - `/admin/stats` 통계 분석 페이지 구현
    - 기간 선택 필터 (오늘 / 이번 주 / 이번 달 / 전체)
    - 차트 항목:
        - 기간별 신규 가입자 수
        - 모임 생성·참가 신청 건수 추이
        - 카풀·정산 이용률
    - 차트 라이브러리 설치 (recharts 또는 shadcn/ui charts 활용)
    - 통계 집계 쿼리 API 연동
    - **테스트 체크리스트 (Playwright MCP)**:
        - [ ] 기간 필터 변경 시 차트 데이터 갱신 확인
        - [ ] 비관리자 계정의 `/admin/stats` 접근 차단 확인

---

## 기능 ID 추적표

| 기능 ID | 기능명             | 담당 Task          | 상태    |
| ------- | ------------------ | ------------------ | ------- |
| F001    | 구글 로그인        | 기존 구현 완료     | ✅ 완료 |
| F002    | 모임 생성          | Task 004, Task 008 | 대기    |
| F003    | 모임 대시보드      | Task 004, Task 008 | 대기    |
| F004    | 초대 링크 공유     | Task 005, Task 008 | 대기    |
| F005    | 초대 링크 접속     | Task 006, Task 009 | 대기    |
| F006    | 참가 신청 및 승인  | Task 006, Task 009 | 대기    |
| F007    | 공지사항 CRUD      | Task 005, Task 010 | 대기    |
| F008    | 카풀 매칭          | Task 005, Task 011 | 대기    |
| F009    | 정산 관리          | Task 005, Task 012 | 대기    |
| F010    | 모임 수정          | Task 004, Task 008 | 대기    |
| F011    | 모임 취소          | Task 004, Task 008 | 대기    |
| F012    | 대기자 자동 승급   | Task 009           | 대기    |
| F013    | 참여 통계 표시     | Task 005, Task 009 | 대기    |
| F014    | 카풀 활성화 토글   | Task 005, Task 011 | 대기    |
| F015    | 정산 현황 공유     | Task 013           | 대기    |
| F016    | 관리자 이벤트 관리 | Task 017           | 대기    |
| F017    | 관리자 사용자 관리 | Task 018           | 대기    |
| F018    | 관리자 통계 분석   | Task 019           | 대기    |

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
│   └── /invite/[token]                 # 초대 링크 진입점 (Task 006, 009)
│
├── /share
│   └── /share/settlement/[id]          # 정산 현황 공유 (Task 013)
│
├── /protected                          # 인증 필수 영역
│   ├── /protected                      # 주최자 대시보드 (Task 004, 008)
│   └── /protected/meetings
│       ├── /protected/meetings/new     # 모임 생성 폼 (Task 004, 008)
│       ├── /protected/meetings/[id]    # 모임 상세 (Task 005, 008~012)
│       │   ├── ?tab=notices            # 공지사항 탭 (Task 005, 010)
│       │   ├── ?tab=participants       # 참여자 탭 (Task 005, 009)
│       │   ├── ?tab=carpool            # 카풀 탭 (Task 005, 011)
│       │   └── ?tab=settlement         # 정산 탭 (Task 005, 012)
│       └── /protected/meetings/[id]/edit  # 모임 수정 폼 (Task 004, 008)
│
└── /admin                              # 관리자 전용 (is_admin = true, Task 016~019)
    ├── /admin                          # 관리자 대시보드 (Task 016)
    ├── /admin/events                   # 이벤트 관리 (Task 017)
    ├── /admin/users                    # 사용자 관리 (Task 018)
    └── /admin/stats                    # 통계 분석 (Task 019)
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
