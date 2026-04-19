---
name: 반복 발견 이슈
description: 코드 리뷰에서 반복적으로 발견된 패턴 및 품질 이슈 기록
type: project
---

## 반복 발견 이슈 (2026-04-18 첫 전체 리뷰)

### 1. 인증 폼에서 React Hook Form + Zod 미적용

login-form, sign-up-form, forgot-password-form, update-password-form 모두 useState로 직접 상태 관리.
profileForm만 React Hook Form + Zod 적용됨. 일관성 부족.

### 2. UI 텍스트 영어 혼용

auth 관련 폼 컴포넌트들의 UI 텍스트(버튼 라벨, 제목, 안내 문구, 에러 메시지)가 영어로 작성됨.
sign-up-success/page.tsx, auth/error/page.tsx 도 영어 텍스트 사용.
한국어 서비스임에도 불구하고 혼용됨 — 초기 스타터킷 코드를 그대로 사용한 흔적.

### 3. 타입 안전성 — database.ts의 status 필드 string 타입

MeetingRow, ParticipationRow, CarpoolPassengerRow, SettlementRow 등의 status/approval_type/split_type 필드가
string 타입으로 정의되어 있음. domain.ts의 상수 타입(MeetingStatus 등)과 연결되지 않음.

### 4. Admin 레이아웃 인증 우회 버그

app/admin/layout.tsx의 AdminContent가 children을 prop으로 받지만,
인증 실패 시 redirect() 전에 children을 렌더링할 가능성이 있는 구조.
또한 is_admin 체크가 TODO로만 남아있어 현재 로그인한 사람이면 누구든 /admin 접근 가능.

### 5. Props 타입 네이밍 불일치

app/(main)/protected/meetings/[id]/page.tsx의 Props 타입이 'Props'로 명명됨.
컨벤션상 'MeetingDetailPageProps' 형태여야 함.

### 6. 중복 코드 — Google SVG 아이콘

login-form.tsx와 sign-up-form.tsx에 동일한 Google SVG 아이콘 코드가 중복 존재.

### 7. LogoutButton 에러 처리 누락

logout-button.tsx에서 signOut() 실패 시 에러 처리 없이 router.push('/auth/login') 실행.
