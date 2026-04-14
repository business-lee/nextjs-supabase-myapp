# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

## 환경 변수 설정

`.env.local` 파일에 다음 변수를 설정해야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable 또는 anon 키>
```

## 아키텍처 개요

Next.js App Router 기반의 Supabase 인증 스타터 킷입니다.

### Supabase 클라이언트 패턴

클라이언트 사용 위치에 따라 다른 파일을 import해야 합니다:

- **서버 컴포넌트 / Route Handler / Server Action**: `@/lib/supabase/server`의 `createClient()` (async 함수)
- **클라이언트 컴포넌트**: `@/lib/supabase/client`의 `createClient()`
- **Proxy (proxy.ts)**: `@/lib/supabase/proxy`의 `updateSession()`

> Fluid compute 환경에서 서버 클라이언트를 전역 변수에 저장하지 말 것. 매 요청/함수 호출 시 새로운 인스턴스를 생성해야 합니다.

### 라우팅 구조

- `app/` — Next.js App Router 페이지
- `app/auth/` — 인증 관련 페이지 (login, sign-up, forgot-password, update-password, confirm, error)
- `app/protected/` — 인증된 사용자만 접근 가능한 페이지
- `proxy.ts` (루트) — Next.js Proxy. 모든 요청에서 Supabase 세션을 갱신하는 `updateSession()` 호출

### 인증 플로우

1. `proxy.ts`가 모든 요청을 가로채 `updateSession()`으로 세션 갱신
2. 미인증 사용자가 `/protected` 등 보호된 경로 접근 시 `/auth/login`으로 리다이렉트
3. 이메일 OTP 인증은 `app/auth/confirm/route.ts`에서 처리
4. 인증 상태 확인은 `supabase.auth.getClaims()`를 사용

### UI 컴포넌트

shadcn/ui (new-york 스타일, neutral 베이스 컬러)를 사용합니다. 새 컴포넌트 추가 시:

```bash
npx shadcn@latest add <컴포넌트명>
```

컴포넌트는 `components/ui/`에 위치하며, `@/components/ui`로 import합니다.
