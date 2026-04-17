# AI Agent 개발 가이드라인

## 프로젝트 개요

- **앱명**: MeetUp Manager MVP
- **목적**: 소규모 동호회 주최자(Host)가 모임 공지·참여자·카풀·정산을 관리하는 웹앱
- **스택**: Next.js(App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, React Hook Form, Zod
- **역할**: Host(meetings.host_id = 현재 사용자), Member(초대 링크로 참여한 사용자)

---

## 디렉토리 구조

```
app/
  auth/               # 인증 페이지(login, sign-up, forgot-password, update-password, confirm, error, callback)
  invite/[token]/     # 초대 링크 페이지 (비로그인 가능)
  protected/          # 인증 필수 영역
    page.tsx          # Host 대시보드
    layout.tsx        # protected 공통 레이아웃
    meetings/
      new/page.tsx
      [id]/page.tsx
      [id]/edit/page.tsx
    profile/
      page.tsx
      actions.ts
components/
  ui/                 # shadcn/ui 컴포넌트 (직접 수정 금지)
  *.tsx               # 재사용 컴포넌트
lib/
  supabase/
    client.ts         # 클라이언트 컴포넌트용
    server.ts         # 서버 컴포넌트/Action/Route Handler용 (async)
    proxy.ts          # proxy.ts에서 import
    database.types.ts # DB 타입 (자동 생성, 직접 수정 금지)
  utils.ts
proxy.ts              # Next.js proxy (모든 요청에서 세션 갱신)
```

---

## Supabase 클라이언트 선택 규칙

| 사용 위치                                   | import 경로                                      | 비고                       |
| ------------------------------------------- | ------------------------------------------------ | -------------------------- |
| 서버 컴포넌트, Server Action, Route Handler | `@/lib/supabase/server` → `await createClient()` | async 함수                 |
| 클라이언트 컴포넌트 (`"use client"`)        | `@/lib/supabase/client` → `createClient()`       | 동기 함수                  |
| proxy.ts                                    | `@/lib/supabase/proxy` → `updateSession()`       | 절대 다른 곳에서 호출 금지 |

- **Fluid compute 환경**: 서버 클라이언트를 전역 변수에 저장 금지. 매 함수 호출마다 새 인스턴스 생성
- `createServerClient` 호출과 `supabase.auth.getClaims()` 사이에 코드 삽입 금지

---

## 인증 패턴

- 인증 상태 확인은 반드시 `supabase.auth.getClaims()` 사용 (`getUser()` 금지)
- Server Action에서 미인증 처리:
    ```typescript
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) redirect("/auth/login");
    const userId = data.claims.sub;
    ```
- 클라이언트 컴포넌트에서 로그인 후 이동: `router.push("/protected")`
- Google OAuth 콜백 경로: `/auth/callback`
- 이메일 OTP 처리 경로: `/auth/confirm`

---

## 역할 분기 처리

- Host 판별: `meeting.host_id === userId`
- 같은 URL(`/protected/meetings/[id]`)에서 역할에 따라 UI 분기
- 역할별 기능을 조건부 렌더링으로 구현:
    ```typescript
    {isHost && <HostOnlyComponent />}
    ```
- `/invite/[token]`은 비로그인 접근 가능. proxy.ts의 리다이렉트 로직에서 `/invite` 경로 예외 처리 필요

---

## 코딩 규칙

### 필수 준수

- 들여쓰기: **4칸 스페이스**
- 변수/함수: `camelCase`, 컴포넌트: `PascalCase`
- Props 타입명: `컴포넌트명Props` (예: `MeetingCardProps`)
- `any` 타입 **사용 금지** → 정확한 타입 또는 `unknown` 사용
- `enum` **사용 금지** → string literal union 사용
    ```typescript
    // 금지
    enum Status {
        Pending,
        Approved,
    }
    // 허용
    type Status = "pending" | "approved" | "rejected";
    ```
- 주석, 커밋 메시지, 문서: **한국어** 작성
- **자동 커밋 금지**: 사용자 명시 요청 시에만 커밋

### 타입 사용

- DB 타입은 `lib/supabase/database.types.ts`의 `Database` 타입에서 파생
    ```typescript
    import { type Database } from "@/lib/supabase/database.types";
    type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];
    type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
    ```
- DB 타입 파일(`database.types.ts`)은 직접 수정 금지. Supabase CLI로 재생성

---

## 새 페이지 추가 규칙

- `app/protected/` 하위 페이지: 서버 컴포넌트 기본. `await createClient()`로 인증 확인
- `app/invite/` 하위 페이지: 비로그인 접근 허용. proxy.ts 예외 처리 확인
- 새 라우트 추가 시 `proxy.ts`의 matcher 패턴이 적용되는지 확인
- 탭 구조 페이지(`/protected/meetings/[id]`): URL 쿼리 파라미터 `?tab=`으로 상태 유지

---

## 새 컴포넌트 추가 규칙

- 위치: `components/컴포넌트명.tsx` (재사용) 또는 같은 디렉토리 내 `_components/` 폴더
- 클라이언트 상태가 필요할 때만 `"use client"` 추가
- shadcn/ui 신규 컴포넌트 추가: `npx shadcn@latest add <컴포넌트명>`
- `components/ui/` 파일 직접 수정 금지 (shadcn 재설치 시 덮어써짐)

---

## 폼 구현 규칙

- 모든 폼: React Hook Form + Zod 조합 사용
- Zod 스키마 정의 → `useForm<z.infer<typeof schema>>` 패턴
- `@hookform/resolvers/zod`의 `zodResolver` 사용
- 서버 액션과 연동 시 `form.handleSubmit`에서 서버 액션 호출
- 폼 컴포넌트는 `"use client"` 필수
- 예시 구조:
    ```typescript
    const schema = z.object({ title: z.string().min(1, "제목을 입력하세요") });
    type FormValues = z.infer<typeof schema>;
    const form = useForm<FormValues>({ resolver: zodResolver(schema) });
    ```

---

## Server Action 규칙

- 파일 최상단에 `"use server"` 선언
- 위치: 해당 페이지와 같은 디렉토리의 `actions.ts`
- 반환 타입 명시: `Promise<{ success: boolean; message: string }>`
- 인증 확인 후 비즈니스 로직 실행
- 에러는 throw가 아닌 `{ success: false, message }` 반환 (리다이렉트 외 케이스)

---

## Supabase DB 작업 규칙

- 새 테이블 추가 시: Supabase 마이그레이션 적용 후 반드시 `lib/supabase/database.types.ts` 재생성
- RLS 정책을 반드시 함께 정의. 정책 없는 테이블 생성 금지
- `get_or_create_profile` 같은 복잡한 로직은 Supabase RPC 함수(SECURITY DEFINER)로 구현
- 역할 판별에 `auth.uid()`를 SQL에서 직접 사용

---

## UI/UX 규칙

- 로딩 상태: `shadcn/ui`의 `Skeleton` 컴포넌트 사용
- 에러/성공 알림: `toast` 컴포넌트 사용
- 모바일 우선(360px 이상) 반응형 레이아웃
- 스타일: Tailwind CSS 유틸리티 클래스만 사용 (인라인 style 금지)
- 다크모드: `next-themes` + Tailwind의 `dark:` 프리픽스

---

## 파일 동시 수정 필수 규칙

| 수정 파일               | 함께 수정해야 할 파일                   |
| ----------------------- | --------------------------------------- |
| DB 스키마 변경          | `lib/supabase/database.types.ts` 재생성 |
| 새 Server Action 추가   | 해당 페이지 컴포넌트에서 import 연결    |
| proxy.ts 경로 예외 추가 | `proxy.ts`의 리다이렉트 조건 확인       |
| shadcn/ui 컴포넌트 추가 | `components/ui/` 자동 생성 확인         |

---

## 금지 사항

- `any` 타입 사용 금지
- `enum` 사용 금지
- `components/ui/` 파일 직접 수정 금지
- `lib/supabase/database.types.ts` 직접 수정 금지
- Supabase 서버 클라이언트 전역 변수 저장 금지
- `supabase.auth.getUser()` 사용 금지 → `getClaims()` 사용
- `createServerClient`와 `getClaims()` 사이 코드 삽입 금지
- 인라인 style 속성 사용 금지 (Tailwind만 사용)
- 주석 없이 복잡한 비즈니스 로직 작성 금지
- 사용자 명시 요청 없이 자동 커밋 금지
- RLS 정책 없는 Supabase 테이블 생성 금지
