# MeetUp Manager MVP PRD

## 🎯 핵심 정보

**목적**: 소규모 동호회 주최자가 모임 공지, 참여자 관리, 카풀 조율, 정산을 하나의 웹 앱에서 처리할 수 있도록 지원한다
**사용자**: 10~30명 규모 소규모 동호회(수영, 헬스 등)를 혼자 운영하는 주최자(Host) 및 초대 링크로 참여하는 동호회 회원(Member)

---

## 🚶 사용자 여정

### 주최자(Host) 여정

1. 구글 계정으로 로그인 → `/protected` 대시보드 진입
2. "모임 만들기" 클릭 → `/protected/meetings/new`에서 제목·날짜·장소·최대 인원·참가비 입력 후 저장
3. 생성된 모임의 초대 링크 복사 → 카카오톡 등으로 회원에게 공유
4. 모임 상세 페이지(`/protected/meetings/[id]`) 탭 이동으로 공지·참여자·카풀·정산 관리
5. 참여 신청 목록에서 승인/거절 처리 → 대기자 자동 순번 관리
6. 모임 종료 후 비용 항목 입력 → 1/N 또는 수동 금액 입력 → 납부 현황 체크

### 참여자(Member) 여정

1. 초대 링크(`/invite/[token]`) 접속
2. 로그인(또는 회원가입) 후 모임 정보 확인
3. "참가 신청" 클릭 → 승인 대기 또는 즉시 승인 확인
4. 대기 중이라면 현재 대기 순번 확인
5. 카풀이 활성화된 경우: 드라이버 등록 또는 동승 신청
6. 모임 후 정산 금액 확인 → 납부 완료 셀프 체크

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

---

## 🎨 UI/UX 요구사항

### 공통

- shadcn/ui 컴포넌트 사용(new-york 스타일, neutral 베이스 컬러)
- 모바일 우선 반응형 레이아웃(동호회원이 주로 모바일로 접근)
- 로딩 상태는 shadcn/ui Skeleton 컴포넌트로 표시
- 에러 상태는 toast 알림으로 표시

### 모임 상세 페이지

- 탭 구조: `공지` | `참여자` | `카풀` | `정산`
- 탭 간 이동 시 URL 쿼리 파라미터(`?tab=notices`)로 상태 유지
- 주최자와 참여자가 동일 URL을 사용하되, 역할에 따라 관리 기능 표시 여부 분기

### 초대 링크 페이지

- 로그인 없이 모임 기본 정보(제목, 날짜, 장소, 참가비) 미리보기 가능
- 로그인 후 참가 신청 버튼 활성화
- 이미 신청한 경우 현재 신청 상태(승인/대기/거절) 표시

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
  - status (text, default 'active')         -- 'active' | 'cancelled'
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

---

## 🔄 핵심 상호작용

### 초대 링크 흐름

```
/invite/[token] 접속
  → meetings 테이블에서 invite_token으로 모임 조회
  → 비로그인: 모임 기본 정보만 표시 + "로그인하여 신청" 버튼
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

| 기능 ID | 기능명            | 설명                                                                                | 관련 페이지                                                    |
| ------- | ----------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| F001    | 구글 로그인       | 구글 OAuth를 통한 소셜 로그인 및 로그아웃                                           | `/auth/login`                                                  |
| F002    | 모임 생성         | 제목·날짜·장소·최대 인원·참가비·승인 방식 입력 후 모임 생성, invite_token 자동 발급 | `/protected/meetings/new`                                      |
| F003    | 모임 대시보드     | 주최자의 운영 중인 모임 목록 카드 표시(D-day, 참여 현황, 미처리 신청 건수)          | `/protected`                                                   |
| F004    | 초대 링크 공유    | invite_token 기반 초대 링크 생성 및 클립보드 복사                                   | `/protected/meetings/[id]`                                     |
| F005    | 초대 링크 접속    | 비로그인 시 모임 기본 정보 미리보기, 로그인 후 참가 신청 가능                       | `/invite/[token]`                                              |
| F006    | 참가 신청 및 승인 | 자동 승인(선착순) 또는 수동 승인(주최자 처리), 인원 초과 시 대기자 순번 자동 부여   | `/invite/[token]`, `/protected/meetings/[id]?tab=participants` |
| F007    | 공지사항 CRUD     | 주최자의 공지 작성·수정·삭제, 고정 공지 설정, 참여자 조회                           | `/protected/meetings/[id]?tab=notices`                         |
| F008    | 카풀 매칭         | 드라이버 등록(출발지·좌석·시간), 동승 신청, 드라이버 수락/거절, 확정 정보 조회      | `/protected/meetings/[id]?tab=carpool`                         |
| F009    | 정산 관리         | 비용 항목 입력, 1/N 또는 수동 분배, 납부 현황 체크, 참여자 셀프 납부 완료 체크      | `/protected/meetings/[id]?tab=settlement`                      |

### MVP 필수 지원 기능 (F010~)

| 기능 ID | 기능명           | 설명                                                                          | 관련 페이지                                 |
| ------- | ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| F010    | 모임 수정        | 기존 모임의 제목·날짜·장소·최대 인원·참가비 수정                              | `/protected/meetings/[id]/edit`             |
| F011    | 모임 취소        | 모임 상태를 `cancelled`로 변경, 참여자에게 상태 변경 반영                     | `/protected/meetings/[id]`                  |
| F012    | 대기자 자동 승급 | 승인 인원이 줄었을 때 waitlist_order 기준으로 대기자 자동 승인 및 순번 재정렬 | 서버 로직 (참여자 관리 탭 연동)             |
| F013    | 참여 통계 표시   | 모임별 승인/대기/거절 인원 수 집계 표시                                       | `/protected/meetings/[id]?tab=participants` |
| F014    | 카풀 활성화 토글 | 주최자가 모임별로 카풀 기능 온/오프                                           | `/protected/meetings/[id]`                  |
| F015    | 정산 현황 공유   | 정산 결과를 링크로 외부 공유 가능                                             | `/protected/meetings/[id]?tab=settlement`   |

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
│       ├── 비로그인: 모임 기본 정보 미리보기 + 로그인 유도 버튼
│       └── 로그인: 참가 신청 또는 현재 신청 상태 확인
│           ├── 미신청 → "참가 신청" 버튼 (Host/Member 모두)
│           └── 신청됨 → 상태 표시 (승인 / 대기[순번] / 거절)
│
└── /protected                          # 인증 필수 영역 (비로그인 시 /auth/login 리다이렉트)
    ├── /protected                      # 주최자 대시보드
    │   └── [Host 전용] 운영 중인 모임 카드 목록
    │
    ├── /protected/meetings
    │   ├── /protected/meetings/new     # 모임 생성 폼
    │   │   └── [Host 전용] 제목·날짜·장소·최대 인원·참가비·승인 방식 입력
    │   │
    │   └── /protected/meetings/[id]   # 모임 상세 (Host/Member 공통 URL, 역할별 기능 분기)
    │       ├── 모임 헤더: 제목·날짜·장소·참가비·초대 링크 복사 버튼
    │       │   ├── [Host 전용] 모임 수정 버튼 → /protected/meetings/[id]/edit
    │       │   └── [Host 전용] 모임 취소 버튼
    │       │
    │       ├── ?tab=notices            # 공지사항 탭
    │       │   ├── [Host 전용] 공지 작성·수정·삭제, 고정 설정
    │       │   └── [Member] 공지 목록 조회 (고정 공지 최상단)
    │       │
    │       ├── ?tab=participants       # 참여자 탭
    │       │   ├── [Host 전용] 신청자 목록 조회, 승인/거절 처리, 대기자 순번 관리
    │       │   └── [Member] 본인 신청 상태 확인 (승인/대기 순번/거절)
    │       │
    │       ├── ?tab=carpool            # 카풀 탭 (carpool_enabled = true 일 때 활성)
    │       │   ├── [Host 전용] 카풀 기능 활성화/비활성화 토글
    │       │   ├── [Host/Member] 드라이버 등록 (출발지·좌석·출발 시간)
    │       │   ├── [Host/Member] 동승 신청 (드라이버 목록에서 선택)
    │       │   └── [Host/Member] 확정된 카풀 정보 조회
    │       │
    │       └── ?tab=settlement         # 정산 탭
    │           ├── [Host 전용] 비용 항목 입력, 정산 방식 선택(1/N / 수동), 납부 현황 체크
    │           └── [Member] 본인 납부 금액 조회, 셀프 납부 완료 체크
    │
    └── /protected/meetings/[id]/edit   # 모임 수정 폼
        └── [Host 전용] 제목·날짜·장소·최대 인원·참가비 수정
```

### 역할별 접근 요약

| 경로                            | 비로그인       | Member     | Host     |
| ------------------------------- | -------------- | ---------- | -------- |
| `/auth/*`                       | O              | O          | O        |
| `/invite/[token]`               | O (미리보기만) | O          | O        |
| `/protected` (대시보드)         | X              | X          | O        |
| `/protected/meetings/new`       | X              | X          | O        |
| `/protected/meetings/[id]`      | X              | O (조회만) | O (관리) |
| `/protected/meetings/[id]/edit` | X              | X          | O        |

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
- [ ] 참여자가 초대 링크 접속 후 3단계(링크 접속 → 로그인 → 신청) 이내에 참가 신청을 완료할 수 있다
- [ ] 주최자가 신청자 목록에서 승인/거절 처리 시 대기자 순번이 자동으로 갱신된다
- [ ] 카풀 드라이버 등록부터 동승 확정까지 UI 이탈 없이 한 페이지 내에서 완료된다
- [ ] 정산 금액 입력 후 참여자별 납부 금액이 즉시 계산되어 표시된다
- [ ] 모든 주요 페이지가 모바일(360px 이상) 화면에서 정상적으로 표시된다
- [ ] Supabase RLS로 인해 다른 모임의 데이터에 무단 접근이 차단된다
