# MeetUp Manager MVP PRD

## 🎯 핵심 정보

**목적**: 소규모 동호회 주최자가 모임 공지, 참여자 관리, 카풀 조율, 정산을 하나의 웹 앱에서 처리할 수 있도록 지원한다
**사용자**: 10~30명 규모 소규모 동호회(수영, 헬스 등)를 혼자 운영하는 주최자(Host), 초대 링크로 참여하는 동호회 회원(Member), 플랫폼 전체를 운영하는 관리자(Admin)

---

## 🚶 사용자 여정

### 주최자(Host) 여정 — 모바일 퍼스트

```
1.  홈 페이지 (/)
    ↓ Google 로그인 버튼 클릭 (이미 로그인 시 자동 건너뜀)
    ✅ 구현 완료 (Google OAuth, Supabase Auth)

2.  모임 목록 (/protected/meetings)
    ↓ "새 모임" 하단 네비게이션 탭 또는 "첫 모임 만들기" 버튼 클릭
    ✅ 구현 완료 (내가 만든 모임 / 내가 참여한 모임 섹션 구분 표시)

3.  모임 생성 페이지 (/protected/meetings/new)
    ↓ 제목·날짜·장소·최대 인원·참가비·승인 방식(자동/수동) 입력 후 "저장" 버튼
    ✅ 구현 완료 (React Hook Form + Zod 유효성 검사)

4.  모임 상세 페이지 (/protected/meetings/[id])
    ↓ "초대 링크 복사" 버튼으로 /invite/[token] URL 클립보드 복사
    ✅ 구현 완료 (4개 탭: 공지사항·참여자·카풀·정산)

5.  초대 링크 공유
    ↓ 카카오톡, 문자 등으로 회원에게 공유
    ✅ 구현 완료 (클립보드 복사 후 공유)

6.  참가 신청 관리 (?tab=participants)
    ↓ 신청자 목록에서 승인/거절 처리 (UI 상태 변경)
    ✅ 구현 완료 (더미 데이터 기반, Phase 3에서 실제 DB 연동 예정)

7.  모임 운영 (탭 전환)
    ↓ 공지사항 작성·수정·삭제 (?tab=notices) / 카풀 드라이버 등록·관리 (?tab=carpool)
    ✅ 구현 완료 (더미 데이터 기반 CRUD UI)

8.  정산 입력 (?tab=settlement)
    ↓ 비용 항목 입력 → 1/N 또는 수동 분배 → 납부 현황 체크
    ✅ 구현 완료 (더미 데이터 기반, Phase 3에서 실제 DB 연동 예정)

9.  [완료] → 모임 수정(/protected/meetings/[id]/edit) 또는 취소 처리
    ✅ 구현 완료 (모임 수정 폼, 취소 확인 다이얼로그)
```

### 참여자(Member) 여정 — 모바일 퍼스트

```
1.  초대 링크 접속 (/invite/[token])
    ↓ 모임 기본 정보 표시 (제목·날짜·장소·참가비·설명, 주최자 이름, 참여자 수 포함)
    ✅ 구현 완료

2.  [분기 A] 비로그인 상태
    → "로그인하여 신청" 버튼 클릭
    → Google OAuth 로그인 (/auth/login?redirect=/invite/[token])
    → 로그인 완료 후 초대 링크 페이지로 자동 복귀
    ✅ 구현 완료

    [분기 B] 이미 로그인 상태
    → 본인 신청 여부 자동 확인 (더미 데이터 기반)
    → 신청됨: 현재 상태 표시 (승인됨 / 검토중 / 거절됨) → 모임 상세 보기 버튼
    → 미신청: "참가 신청" 버튼 표시
    ✅ 구현 완료

    [분기 C] 주최자 본인이 자기 모임 초대 링크 접속
    → "내가 만든 모임입니다" 안내 + 모임 상세 보기 버튼
    ✅ 구현 완료

3.  참가 신청 (/invite/[token])
    ↓ "참가 신청" 버튼 클릭

4.  [분기 A] 자동 승인 모임 (approval_type = auto)
    → 즉시 승인 완료 토스트 + 승인됨 상태 표시
    ✅ 구현 완료

    [분기 B] 수동 승인 모임 (approval_type = manual)
    → 검토중 토스트 + 검토중 상태 표시 (주최자 승인 대기)
    ✅ 구현 완료

5.  모임 목록 (/protected/meetings)
    ↓ "내가 참여한 모임" 섹션에서 참여 모임 카드 확인 (참가 상태 배지 표시)
    ✅ 구현 완료

6.  모임 상세 페이지 (/protected/meetings/[id])
    ↓ 참여자 뷰: 수정/취소 버튼 없음, 내 참가 상태 배지 표시
    ↓ (카풀 활성 시) 드라이버 등록 또는 동승 신청 (?tab=carpool)
    ✅ 구현 완료

7.  정산 확인 (?tab=settlement)
    ↓ 본인 납부 금액 조회 및 셀프 납부 완료 체크
    ✅ 구현 완료 (더미 데이터 기반, Phase 3에서 실제 DB 연동 예정)
```

### 관리자(Admin) 여정 — 데스크톱

```
1.  로그인 페이지 (/auth/login)
    ↓ Google 로그인 (is_admin = true 계정)

2.  관리자 대시보드 (/admin)
    ↓ 사이드바 메뉴에서 관리 영역 선택

3.  [분기 A] 이벤트 관리
    → /admin/events → 전체 모임 목록 조회 (검색·필터·정렬)
    → 모임 상세 진입 → 수정 / 강제 취소 (status = 'cancelled') / 삭제

    [분기 B] 사용자 관리
    → /admin/users → 전체 사용자 목록 (이메일·가입일·참여 모임 수)
    → 사용자 상세 진입 → is_admin 토글 (권한 부여/회수) / 계정 비활성화

    [분기 C] 통계 분석
    → /admin/stats → 기간별 가입자·모임·카풀·정산 통계 차트 확인
    ↓

4.  [완료] → 대시보드 메인으로 돌아가기 또는 로그아웃
```

---

## 📋 주요 기능

### 모임 관리

- 모임 생성: 제목, 날짜/시간, 장소, 최대 인원, 설명, 참가비 입력
- 모임 수정 및 취소(취소 시 참여자에게 상태 변경 반영)
- 주최자 대시보드: 운영 중인 모임 목록과 각 모임의 참여 현황 요약

### 공지사항 관리

- 공지사항 작성/수정/삭제(CRUD)
- 고정 공지 설정(최상단 고정)
- 참여자는 해당 모임 공지 목록 조회만 가능

### 참여자 관리

- 초대 링크 생성 및 공유(`/invite/[token]` 경로)
- 참가 신청 방식: 선착순 자동 승인 또는 주최자 수동 승인 선택
- 신청자 목록에서 승인/거절 처리
- 최대 인원 초과 시 대기자 명단 자동 관리 및 순번 표시
- 참여 통계: 승인/대기/거절 인원 수 표시

### 카풀 매칭

- 주최자가 모임별로 카풀 기능 활성화/비활성화
- 드라이버 등록: 출발지, 빈 좌석 수, 출발 시간 입력
- 동승자 신청: 드라이버 목록에서 선택 후 신청
- 드라이버가 동승 신청 수락/거절
- 확정된 카풀 정보 조회(드라이버·동승자 모두 확인 가능)

### 정산 관리

- 총 비용 및 항목별 금액 입력(예: 장소대여비, 음료비 등)
- 정산 방식: 1/N 균등 분배 또는 참여자별 수동 금액 입력
- 주최자: 납부 현황 체크(납부 완료/미납 표시)
- 참여자: 본인 납부 금액 조회 및 셀프 납부 완료 체크
- 정산 현황 링크로 공유 가능

### 관리자 기능

- 이벤트 관리: 전체 모임 목록 조회·수정·강제 취소/삭제
- 사용자 관리: 전체 사용자 목록, 관리자 권한 부여/회수, 계정 비활성화
- 통계 분석: 기간별 가입자·모임·카풀·정산 통계 차트

---

## 🎨 UI/UX 요구사항

### 공통

- shadcn/ui 컴포넌트 사용(new-york 스타일, neutral 베이스 컬러)
- 로딩 상태는 shadcn/ui Skeleton 컴포넌트로 표시
- 에러 상태는 toast 알림으로 표시
- 통계 차트는 shadcn/ui charts (recharts 기반) 사용

### Host / Member 페이지 — 모바일 퍼스트

- 모바일 우선 반응형 레이아웃 (동호회원이 주로 모바일로 접근)
- 앱 최대 너비 530px, 중앙 정렬, 외부 배경 연한 회색(`bg-gray-100`)
- 기준 해상도: 360px 이상에서 정상 표시
- 터치 친화적 버튼 크기 및 여백 적용
- 하단 고정 네비게이션 바 (로그인 전/후 모든 페이지에 표시, 4개 메뉴)
    - 홈 → `/` (랜딩 페이지)
    - 모임 → `/protected/meetings` (내 모임 목록)
    - 새 모임 → `/protected/meetings/new` (모임 생성)
    - 프로필 → `/protected/profile`

### Admin 페이지 — 데스크톱 우선

- 사이드바 네비게이션 레이아웃 (대시보드 / 이벤트 관리 / 사용자 관리 / 통계 분석)
- 기준 해상도: 1280px 이상에서 최적화
- 테이블·차트 중심 데이터 표시 UI
- 사이드바: 현재 경로 기반 활성 메뉴 하이라이트, 하단 로그인 사용자 아바타·이름 표시
- 대시보드(/admin): 총 모임 수, 이번 달 신규 모임, 총 사용자 수, 이번 달 신규 가입 지표 카드 4개 + 최근 모임 테이블
- 이벤트 관리(/admin/events): 전체 모임 테이블 (제목·주최자·날짜·상태·참가 인원), 제목 검색·상태 필터, 수정/강제 취소 Dialog
- 사용자 관리(/admin/users): 전체 사용자 테이블 (아바타·이름·이메일·가입일·참여 모임 수), is_admin 토글 Switch, 이름/이메일 검색
- 통계 분석(/admin/stats): 기간 선택 탭(오늘/이번 주/이번 달/전체), Bar·Line·Donut 차트 3종

### 모임 상세 페이지

- 탭 구조: `공지` | `참여자` | `카풀` | `정산`
- 탭 간 이동 시 URL 쿼리 파라미터(`?tab=notices`)로 상태 유지
- 주최자와 참여자가 동일 URL을 사용하되, 역할에 따라 관리 기능 표시 여부 분기

### 초대 링크 페이지

- 로그인 없이 모임 기본 정보(제목, 날짜, 장소, 참가비) 미리보기 가능
- 비로그인 시 "Google로 로그인하여 신청" 버튼 표시
- 이미 신청한 경우 현재 신청 상태(승인/대기/거절) 표시
- 주최자 이름을 두 곳에 표시:
    - 상단 서브타이틀: "{주최자 이름} 님이 초대합니다"
    - 모임 정보 카드 내 "주최자: {이름}" 항목
- 모임 정보 카드에 "참여자 N명" (전체 신청 인원수) 표시

### 대시보드

- 운영 중인 모임 카드 목록(최신순 정렬)
- 각 카드에 D-day, 승인 인원/최대 인원, 미처리 신청 건수 표시

---

## 💾 데이터 요구사항

### 기존 테이블

```
profiles
  - id (uuid, FK → auth.users)
  - email (text)
  - full_name (text)
  - avatar_url (text)
  - is_admin (boolean, default false)    -- 플랫폼 관리자 여부
  - created_at (timestamptz)
```

### 신규 테이블

```
meetings
  - id (uuid, PK)
  - host_id (uuid, FK → profiles.id)
  - title (text, NOT NULL)
  - description (text)
  - event_at (timestamptz, NOT NULL)        -- 모임 날짜/시간
  - location (text)
  - max_participants (int)
  - entry_fee (int, default 0)              -- 참가비(원)
  - approval_type (text)                    -- 'auto' | 'manual'
  - carpool_enabled (boolean, default false)
  - status (text, default 'upcoming')        -- 'upcoming' | 'ongoing' | 'closed' | 'cancelled'
  - invite_token (text, UNIQUE)             -- 초대 링크 토큰
  - created_at (timestamptz)

notices
  - id (uuid, PK)
  - meeting_id (uuid, FK → meetings.id)
  - author_id (uuid, FK → profiles.id)
  - title (text, NOT NULL)
  - content (text, NOT NULL)
  - is_pinned (boolean, default false)
  - created_at (timestamptz)
  - updated_at (timestamptz)

participations
  - id (uuid, PK)
  - meeting_id (uuid, FK → meetings.id)
  - user_id (uuid, FK → profiles.id)
  - status (text)                           -- 'pending' | 'approved' | 'rejected' | 'waitlisted'
  - waitlist_order (int, nullable)          -- 대기 순번
  - created_at (timestamptz)

carpool_drivers
  - id (uuid, PK)
  - meeting_id (uuid, FK → meetings.id)
  - driver_id (uuid, FK → profiles.id)
  - departure_location (text, NOT NULL)
  - departure_at (timestamptz, NOT NULL)
  - available_seats (int, NOT NULL)
  - created_at (timestamptz)

carpool_passengers
  - id (uuid, PK)
  - carpool_driver_id (uuid, FK → carpool_drivers.id)
  - passenger_id (uuid, FK → profiles.id)
  - status (text)                           -- 'pending' | 'accepted' | 'rejected'
  - created_at (timestamptz)

settlements
  - id (uuid, PK)
  - meeting_id (uuid, FK → meetings.id)
  - total_amount (int, NOT NULL)
  - split_type (text)                       -- 'equal' | 'manual'
  - created_at (timestamptz)
  - updated_at (timestamptz)

settlement_items
  - id (uuid, PK)
  - settlement_id (uuid, FK → settlements.id)
  - label (text, NOT NULL)                  -- 항목명 (예: 장소대여비)
  - amount (int, NOT NULL)

settlement_participants
  - id (uuid, PK)
  - settlement_id (uuid, FK → settlements.id)
  - user_id (uuid, FK → profiles.id)
  - amount_due (int, NOT NULL)              -- 납부 금액
  - is_paid (boolean, default false)        -- 납부 여부
  - paid_at (timestamptz, nullable)
```

### Row Level Security (RLS) 원칙

- `meetings`: host_id가 본인인 경우만 INSERT/UPDATE/DELETE 허용. invite_token 기반 SELECT는 인증된 모든 사용자 허용
- `participations`: 본인 행만 INSERT/UPDATE 허용. 주최자는 자신의 모임 전체 조회/수정 허용
- `notices`: 주최자만 INSERT/UPDATE/DELETE. 해당 모임 참여자(approved)는 SELECT 허용
- `carpool_drivers`, `carpool_passengers`: 해당 모임 승인된 참여자만 접근 허용
- `settlements`, `settlement_items`, `settlement_participants`: 주최자는 전체 관리. 참여자는 본인 행 SELECT/UPDATE(is_paid) 허용
- **관리자(is_admin = true)**: 모든 테이블에 대해 SELECT/UPDATE/DELETE 허용. RLS 정책에 `auth.jwt() ->> 'is_admin' = 'true'` 조건 추가

---

## 🔄 핵심 상호작용

### 초대 링크 흐름

```
/invite/[token] 접속
  → meetings 테이블에서 invite_token으로 모임 조회
  → 비로그인: 모임 기본 정보만 표시 + "Google로 로그인하여 신청" 버튼
  → 로그인: participations에서 본인 신청 여부 확인
      → 미신청: "참가 신청" 버튼 표시
      → 신청됨: 현재 상태(승인/대기/거절) 표시
```

### 참가 신청 승인 흐름

```
approval_type = 'auto':
  현재 승인 인원 < max_participants → status = 'approved' 즉시 저장
  현재 승인 인원 >= max_participants → status = 'waitlisted', waitlist_order 자동 부여

approval_type = 'manual':
  항상 status = 'pending'으로 저장
  주최자가 승인 → status = 'approved'
  주최자가 거절 → status = 'rejected'
  주최자가 승인 취소 → 대기자 중 waitlist_order = 1인 참여자 자동 승인 후 나머지 순번 재정렬
```

### 정산 1/N 계산 흐름

```
settlement 생성 시 split_type = 'equal':
  total_amount ÷ 승인된 참여자 수 = 인당 금액(소수점 내림)
  나머지 금액은 주최자에게 배정
  settlement_participants 행 일괄 INSERT
```

---

## ⚡ 기능 명세

### MVP 핵심 기능 (F001~F009)

> **상태 범례**: ✅ 완료(DB 연동) | 🔄 UI 완료(Phase 3 DB 연동 예정) | ⏳ 대기

| 기능 ID | 기능명            | 설명                                                                                                     | 관련 페이지                                                    | 현재 상태  |
| ------- | ----------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| F001    | 구글 로그인       | 구글 OAuth를 통한 소셜 로그인 및 로그아웃 (Host/Member/Admin 공통)                                       | `/auth/login`                                                  | ✅ 완료    |
| F002    | 모임 생성         | 제목·날짜·장소·최대 인원·참가비·승인 방식 입력 후 모임 생성, invite_token 자동 발급                      | `/protected/meetings/new`                                      | 🔄 UI 완료 |
| F003    | 모임 대시보드     | 내가 만든 모임 / 내가 참여한 모임 섹션 구분, D-day·참여 현황·미처리 신청 건수 카드                       | `/protected/meetings`                                          | 🔄 UI 완료 |
| F004    | 초대 링크 공유    | invite_token 기반 초대 링크 생성 및 클립보드 복사                                                        | `/protected/meetings/[id]`                                     | 🔄 UI 완료 |
| F005    | 초대 링크 접속    | 비로그인 시 모임 기본 정보 미리보기, Google 로그인 후 참가 신청 가능. 주최자 이름 및 전체 참여자 수 표시 | `/invite/[token]`                                              | 🔄 UI 완료 |
| F006    | 참가 신청 및 승인 | 자동 승인(선착순) 또는 수동 승인(주최자 처리), 인원 초과 시 대기자 순번 자동 부여                        | `/invite/[token]`, `/protected/meetings/[id]?tab=participants` | 🔄 UI 완료 |
| F007    | 공지사항 CRUD     | 주최자의 공지 작성·수정·삭제, 고정 공지 설정, 참여자 조회                                                | `/protected/meetings/[id]?tab=notices`                         | 🔄 UI 완료 |
| F008    | 카풀 매칭         | 드라이버 등록(출발지·좌석·시간), 동승 신청, 드라이버 수락/거절, 확정 정보 조회                           | `/protected/meetings/[id]?tab=carpool`                         | 🔄 UI 완료 |
| F009    | 정산 관리         | 비용 항목 입력, 1/N 또는 수동 분배, 납부 현황 체크, 참여자 셀프 납부 완료 체크                           | `/protected/meetings/[id]?tab=settlement`                      | 🔄 UI 완료 |

### MVP 필수 지원 기능 (F010~F015)

| 기능 ID | 기능명           | 설명                                                                          | 관련 페이지                                 | 현재 상태  |
| ------- | ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------- | ---------- |
| F010    | 모임 수정        | 기존 모임의 제목·날짜·장소·최대 인원·참가비 수정                              | `/protected/meetings/[id]/edit`             | 🔄 UI 완료 |
| F011    | 모임 취소        | 모임 상태를 `cancelled`로 변경, 참여자에게 상태 변경 반영                     | `/protected/meetings/[id]`                  | 🔄 UI 완료 |
| F012    | 대기자 자동 승급 | 승인 인원이 줄었을 때 waitlist_order 기준으로 대기자 자동 승인 및 순번 재정렬 | 서버 로직 (참여자 관리 탭 연동)             | ⏳ 대기    |
| F013    | 참여 통계 표시   | 모임별 승인/대기/거절 인원 수 집계 표시                                       | `/protected/meetings/[id]?tab=participants` | 🔄 UI 완료 |
| F014    | 카풀 활성화 토글 | 주최자가 모임별로 카풀 기능 온/오프                                           | `/protected/meetings/[id]`                  | 🔄 UI 완료 |
| F015    | 정산 현황 공유   | 정산 결과를 링크로 외부 공유 가능                                             | `/protected/meetings/[id]?tab=settlement`   | ⏳ 대기    |

### 프로필 기능 (F019)

| 기능 ID | 기능명      | 설명                                                                        | 관련 페이지          | 현재 상태    |
| ------- | ----------- | --------------------------------------------------------------------------- | -------------------- | ------------ |
| F019    | 프로필 관리 | 사용자 이름 수정, 만든 모임·참여한 모임 수 통계 표시, 가입일 조회, 로그아웃 | `/protected/profile` | 🔄 일부 완료 |

> F019 세부: 프로필 조회·수정 ✅ DB 연동 완료 / 모임 통계·가입일 🔄 더미 데이터(Phase 3 연동 예정)

### 관리자 기능 (F016~F020)

| 기능 ID | 기능명             | 설명                                                               | 관련 페이지     | 현재 상태       |
| ------- | ------------------ | ------------------------------------------------------------------ | --------------- | --------------- |
| F016    | 관리자 이벤트 관리 | 전체 모임 목록 조회(검색·필터), 모임 수정·강제 취소·삭제           | `/admin/events` | ⏳ UI 구현 예정 |
| F017    | 관리자 사용자 관리 | 전체 사용자 목록, is_admin 토글(권한 부여/회수), 계정 비활성화     | `/admin/users`  | ⏳ UI 구현 예정 |
| F018    | 관리자 통계 분석   | 기간별 신규 가입자·모임 생성·참가 신청·카풀·정산 이용률 통계 차트  | `/admin/stats`  | ⏳ UI 구현 예정 |
| F020    | 관리자 대시보드    | 총 모임 수·사용자 수·이번 달 신규 지표 카드, 최근 모임 미니 테이블 | `/admin`        | ⏳ UI 구현 예정 |

---

## 📱 메뉴 구조

```
/ (루트)
├── /auth
│   ├── /auth/login                     # 구글 로그인 (비로그인 접근 가능)
│   ├── /auth/sign-up                   # 회원가입 (비로그인 접근 가능)
│   ├── /auth/forgot-password           # 비밀번호 찾기 (비로그인 접근 가능)
│   ├── /auth/update-password           # 비밀번호 변경 (로그인 후 접근)
│   ├── /auth/confirm                   # 이메일 OTP 확인 (시스템 처리)
│   └── /auth/error                     # 인증 오류 페이지
│
├── /invite
│   └── /invite/[token]                 # 초대 링크 진입점
│
├── /share
│   └── /share/settlement/[id]          # 정산 현황 공유 (F015, 비로그인 접근 가능)
│       ├── 비로그인: 모임 기본 정보 미리보기 + "Google로 로그인하여 신청" 버튼
│       └── 로그인: 참가 신청 또는 현재 신청 상태 확인
│           ├── 미신청 → "참가 신청" 버튼 (Host/Member 모두)
│           └── 신청됨 → 상태 표시 (승인 / 대기[순번] / 거절)
│
├── /protected                          # 인증 필수 영역 (비로그인 시 /auth/login 리다이렉트)
│   ├── /protected                      # → /protected/meetings 로 리다이렉트
│   │
│   ├── /protected/meetings             # 내 모임 목록 (대시보드)
│   │   ├── 내가 만든 모임 섹션 (개수 표시, 빈 상태 포함)
│   │   └── 내가 참여한 모임 섹션 (개수 표시, 빈 상태 포함)
│   │
│   ├── /protected/meetings
│   │   ├── /protected/meetings/new     # 모임 생성 폼
│   │   │   └── [Host 전용] 제목·날짜·장소·최대 인원·참가비·승인 방식 입력
│   │   │
│   │   └── /protected/meetings/[id]   # 모임 상세 (Host/Member 공통 URL, 역할별 기능 분기)
│   │       ├── 모임 헤더: 제목·날짜·장소·참가비·초대 링크 복사 버튼
│   │       │   ├── [Host 전용] 모임 수정 버튼 → /protected/meetings/[id]/edit
│   │       │   └── [Host 전용] 모임 취소 버튼
│   │       │
│   │       ├── ?tab=notices            # 공지사항 탭
│   │       │   ├── [Host 전용] 공지 작성·수정·삭제, 고정 설정
│   │       │   └── [Member] 공지 목록 조회 (고정 공지 최상단)
│   │       │
│   │       ├── ?tab=participants       # 참여자 탭
│   │       │   ├── [Host 전용] 신청자 목록 조회, 승인/거절 처리, 대기자 순번 관리
│   │       │   └── [Member] 본인 신청 상태 확인 (승인/대기 순번/거절)
│   │       │
│   │       ├── ?tab=carpool            # 카풀 탭 (carpool_enabled = true 일 때 활성)
│   │       │   ├── [Host 전용] 카풀 기능 활성화/비활성화 토글
│   │       │   ├── [Host/Member] 드라이버 등록 (출발지·좌석·출발 시간)
│   │       │   ├── [Host/Member] 동승 신청 (드라이버 목록에서 선택)
│   │       │   └── [Host/Member] 확정된 카풀 정보 조회
│   │       │
│   │       └── ?tab=settlement         # 정산 탭
│   │           ├── [Host 전용] 비용 항목 입력, 정산 방식 선택(1/N / 수동), 납부 현황 체크
│   │           └── [Member] 본인 납부 금액 조회, 셀프 납부 완료 체크
│   │
│   ├── /protected/meetings/[id]/edit   # 모임 수정 폼
│   │   └── [Host 전용] 제목·날짜·장소·최대 인원·참가비 수정
│   │
│   └── /protected/profile              # 사용자 프로필 페이지
│       ├── 모임 통계: 만든 모임 수 / 참여한 모임 수 표시
│       ├── 기본 정보: 가입일 표시
│       ├── 프로필 수정 폼 (full_name 수정)
│       └── 로그아웃 버튼
│
└── /admin                              # 관리자 전용 (is_admin = true, 비관리자 접근 시 리다이렉트)
    ├── /admin                          # 관리자 대시보드 (사이드바 네비게이션)
    ├── /admin/events                   # 이벤트 관리 (전체 모임 목록·수정·강제 취소/삭제)
    ├── /admin/users                    # 사용자 관리 (목록·is_admin 토글·비활성화)
    └── /admin/stats                    # 통계 분석 (기간별 가입자·모임·카풀·정산 차트)
```

### 역할별 접근 요약

| 경로                            | 비로그인       | Member     | Host     | Admin    |
| ------------------------------- | -------------- | ---------- | -------- | -------- |
| `/auth/*`                       | O              | O          | O        | O        |
| `/invite/[token]`               | O (미리보기만) | O          | O        | O        |
| `/protected` (→리다이렉트)      | X              | X          | O        | O        |
| `/protected/meetings`           | X              | O          | O        | O        |
| `/protected/meetings/new`       | X              | X          | O        | O        |
| `/protected/meetings/[id]`      | X              | O (조회만) | O (관리) | O (관리) |
| `/protected/meetings/[id]/edit` | X              | X          | O        | O        |
| `/protected/profile`            | X              | O          | O        | O        |
| `/admin/*`                      | X              | X          | X        | O        |

---

## 🚀 배포 및 호스팅 (Vercel)

### Vercel 프로젝트 연결

- GitHub 레포지토리를 Vercel에 Import (vercel.com/new → GitHub 레포 선택)
- Framework Preset: `Next.js` 자동 감지

### 빌드 설정

| 항목             | 값              |
| ---------------- | --------------- |
| Framework Preset | Next.js         |
| Build Command    | `npm run build` |
| Output Directory | `.next`         |
| Install Command  | `npm install`   |

### 환경 변수 (Vercel Dashboard > Settings > Environment Variables)

| 변수명                                 | 설명                         |
| -------------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase 프로젝트 URL        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable 키 |

- 환경: Production / Preview / Development 모두 동일 값 등록

### 배포 트리거

- `main` 브랜치 push → 프로덕션 자동 배포
- PR 생성 → Preview 배포 URL 자동 생성 (PR 코멘트로 URL 제공)

### 도메인

- 기본 제공: `{프로젝트명}.vercel.app`
- 커스텀 도메인: Vercel Dashboard > Settings > Domains에서 추가 후 DNS CNAME 설정

### Next.js + Vercel 호환 주의사항

`next.config.ts`에 Supabase Storage 및 외부 이미지 도메인 허용 설정 필요:

```typescript
// next.config.ts
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co", // Supabase Storage CDN
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};
```

---

## 🎯 성공 기준

- [ ] 주최자가 로그인 후 5분 이내에 모임을 생성하고 초대 링크를 발급할 수 있다
- [ ] 참여자가 초대 링크 접속 후 3단계(링크 접속 → Google 로그인 → 신청) 이내에 참가 신청을 완료할 수 있다
- [ ] 주최자가 신청자 목록에서 승인/거절 처리 시 대기자 순번이 자동으로 갱신된다
- [ ] 카풀 드라이버 등록부터 동승 확정까지 UI 이탈 없이 한 페이지 내에서 완료된다
- [ ] 정산 금액 입력 후 참여자별 납부 금액이 즉시 계산되어 표시된다
- [ ] 모든 Host/Member 페이지가 모바일(360px 이상) 화면에서 정상적으로 표시된다
- [ ] 관리자 페이지가 데스크톱(1280px 이상) 환경에서 사이드바 레이아웃으로 정상 표시된다
- [ ] Supabase RLS로 인해 다른 모임의 데이터에 무단 접근이 차단된다
- [ ] is_admin = false 사용자가 `/admin/*` 경로에 접근 시 리다이렉트된다
