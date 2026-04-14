# Next.js 16 핵심 규칙 및 가이드라인

> **버전**: Next.js 16.2.3  
> **최종 업데이트**: 2026-04-10  
> **목적**: 이 프로젝트에서 Next.js 개발 시 참고할 핵심 규칙과 가이드라인 정리

---

## 1. 시스템 요구사항

| 항목 | 최소 요구사항 |
|------|-------------|
| Node.js | 20.9+ |
| TypeScript | 5.1.0+ |
| Chrome / Edge / Firefox | 111+ |
| Safari | 16.4+ |

---

## 2. 핵심 스크립트

```json
{
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "eslint",
        "lint:fix": "eslint --fix"
    }
}
```

| 스크립트 | 설명 |
|---------|------|
| `next dev` | Turbopack(기본 번들러)으로 개발 서버 시작 |
| `next build` | 프로덕션 빌드 생성 |
| `next start` | 프로덕션 서버 시작 |
| `eslint` | 린트 검사 실행 |

**중요 변경사항 (Next.js 16)**:
- Turbopack이 기본 번들러. Webpack 사용 시 `next dev --webpack` 또는 `next build --webpack`
- `next build`가 더 이상 린터를 자동 실행하지 않음 → npm scripts로 별도 실행 필요

---

## 3. 프로젝트 구조 규칙

### 최상위 폴더

| 폴더 | 역할 |
|------|------|
| `app/` | App Router (라우팅의 핵심) |
| `pages/` | Pages Router (레거시) |
| `public/` | 정적 에셋 (이미지, 폰트 등) |
| `src/` | 선택적 소스 폴더 |

### 라우팅 파일 컨벤션

| 파일명 | 확장자 | 역할 |
|--------|--------|------|
| `layout` | `.tsx` `.jsx` | 레이아웃 (공유 UI) |
| `page` | `.tsx` `.jsx` | 페이지 (라우트 공개) |
| `loading` | `.tsx` `.jsx` | 로딩 UI (Suspense 래퍼) |
| `error` | `.tsx` `.jsx` | 에러 UI (Error Boundary) |
| `not-found` | `.tsx` `.jsx` | 404 UI |
| `global-error` | `.tsx` `.jsx` | 전역 에러 UI |
| `route` | `.ts` | API 엔드포인트 |
| `template` | `.tsx` `.jsx` | 리렌더링 레이아웃 |
| `default` | `.tsx` `.jsx` | 병렬 라우트 폴백 |

### 컴포넌트 렌더링 계층 순서

```
layout.js
  └── template.js
        └── error.js (Error Boundary)
              └── loading.js (Suspense Boundary)
                    └── not-found.js (Error Boundary)
                          └── page.js 또는 중첩 layout.js
```

### 라우트 패턴

| 패턴 | URL 예시 | 설명 |
|------|---------|------|
| `app/blog/page.tsx` | `/blog` | 일반 라우트 |
| `app/blog/[slug]/page.tsx` | `/blog/my-post` | 동적 세그먼트 |
| `app/shop/[...slug]/page.tsx` | `/shop/a/b/c` | Catch-all |
| `app/docs/[[...slug]]/page.tsx` | `/docs`, `/docs/a/b` | 선택적 Catch-all |
| `app/(marketing)/page.tsx` | `/` | 라우트 그룹 (URL 미포함) |
| `app/blog/_components/` | — | 프라이빗 폴더 (라우팅 제외) |

### 특수 폴더 규칙

- **라우트 그룹** `(folderName)`: URL 경로에 포함되지 않음. 레이아웃 공유나 구조적 조직에 사용
- **프라이빗 폴더** `_folderName`: 라우팅 시스템에서 완전히 제외. 컴포넌트, 유틸 등 배치
- **병렬 라우트** `@slot`: 부모 레이아웃에서 동시에 렌더링되는 슬롯
- **인터셉트 라우트**: `(.)folder`(동일 레벨), `(..)folder`(상위), `(...)folder`(루트에서)

---

## 4. 레이아웃 & 페이지 규칙

### page.tsx 규칙

- 특정 라우트에서 렌더링되는 UI
- **반드시 `default export`** 필요
- `page.tsx` 또는 `route.ts`가 있어야 라우트가 공개됨

```tsx
export default function Page() {
    return <h1>페이지 내용</h1>
}
```

### layout.tsx 규칙

- `children` prop을 받는 공유 UI
- 네비게이션 시 **상태 유지, 리렌더링 없음**
- **Root Layout** (`app/layout.tsx`)은 필수이며 반드시 `<html>`, `<body>` 태그 포함

```tsx
export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    )
}
```

### 동적 세그먼트 params 타입

`params`는 **Promise 타입**으로 `await` 필요:

```tsx
export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    // ...
}
```

### searchParams 사용 규칙

| 상황 | 사용 방법 |
|------|---------|
| 서버 컴포넌트 페이지에서 데이터 로딩 (페이지네이션, DB 필터링) | `searchParams` prop (동적 렌더링 전환됨) |
| 클라이언트에서만 사용 (이미 로드된 목록 필터링) | `useSearchParams` 훅 |
| 콜백/이벤트 핸들러에서 리렌더링 없이 읽기 | `new URLSearchParams(window.location.search)` |

### PageProps / LayoutProps 헬퍼 타입

전역으로 사용 가능 (import 불필요), `next dev` / `next build` / `next typegen` 실행 시 생성:

```tsx
// app/blog/[slug]/page.tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
    const { slug } = await props.params
    return <h1>블로그 포스트: {slug}</h1>
}
```

```tsx
// app/dashboard/layout.tsx
export default function Layout(props: LayoutProps<'/dashboard'>) {
    return <section>{props.children}</section>
}
```

---

## 5. 탐색 & 링크 규칙

### Link 컴포넌트 사용 (필수)

`<a>` 태그 대신 반드시 `<Link>` 사용 → 프리페칭 + 클라이언트 사이드 전환 제공:

```tsx
import Link from 'next/link'

<Link href="/blog">블로그</Link>   // 프리페칭 자동 적용
<a href="/contact">연락처</a>      // 프리페칭 없음 (사용 지양)
```

### 동적 라우트에 loading.tsx 추가 (권장)

동적 라우트에 `loading.tsx`가 없으면 서버 응답 대기 중 앱이 멈춘 것처럼 보임:

```tsx
// app/blog/[slug]/loading.tsx
export default function Loading() {
    return <LoadingSkeleton />
}
```

### 정적 생성 최적화

동적 세그먼트를 미리 렌더링하려면 `generateStaticParams` 사용:

```tsx
export async function generateStaticParams() {
    const posts = await getPosts()
    return posts.map((post) => ({ slug: post.slug }))
}
```

### 느린 네트워크 대응

`useLinkStatus` 훅으로 전환 중 피드백 제공:

```tsx
'use client'

import { useLinkStatus } from 'next/link'

export default function LoadingIndicator() {
    const { pending } = useLinkStatus()
    return (
        <span className={`link-hint ${pending ? 'is-pending' : ''}`} />
    )
}
```

### 프리페칭 제어

| 상황 | 설정 |
|------|------|
| 대규모 목록에서 리소스 절약 | `<Link prefetch={false}>` |
| hover 시에만 프리페칭 | `prefetch={active ? null : false}` + `onMouseEnter` |

### 네이티브 히스토리 API

`useRouter` 없이 URL 변경이 필요한 경우:

```tsx
// 새 히스토리 항목 추가 (뒤로가기 가능)
window.history.pushState(null, '', `?${params.toString()}`)

// 현재 항목 교체 (뒤로가기 불가)
window.history.replaceState(null, '', newPath)
```

---

## 6. Route Handlers 규칙

### 기본 구조

`app` 디렉토리 내 `route.ts` 파일로 정의:

```ts
// app/api/route.ts
export async function GET(request: Request) {}
export async function POST(request: Request) {}
```

### 지원 HTTP 메서드

`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

### 충돌 규칙

`page.tsx`와 같은 세그먼트 레벨에 `route.ts` 배치 불가:

| 파일 구성 | 결과 |
|---------|------|
| `app/page.js` + `app/route.js` | 충돌 (불가) |
| `app/page.js` + `app/api/route.js` | 유효 |

### 캐싱 규칙

- Route Handlers는 기본적으로 **캐시 안됨**
- GET 메서드에서 캐시하려면:

```ts
export const dynamic = 'force-static'

export async function GET() {
    // ...
}
```

- `use cache`는 Route Handler 본문에 직접 사용 불가 → **헬퍼 함수로 분리**:

```ts
// 잘못된 방법 (불가)
export async function GET() {
    'use cache'  // 오류
}

// 올바른 방법
export async function GET() {
    const data = await getCachedData()
    return Response.json(data)
}

async function getCachedData() {
    'use cache'
    cacheLife('hours')
    return await db.query('SELECT * FROM products')
}
```

### TypeScript 타입 헬퍼

```ts
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
    const { id } = await ctx.params
    return Response.json({ id })
}
```

---

## 7. TypeScript 설정

### VS Code 플러그인 활성화

1. 명령 팔레트 열기 (`Ctrl/⌘` + `Shift` + `P`)
2. "TypeScript: Select TypeScript Version" 검색
3. "Use Workspace Version" 선택

### 절대 경로 임포트 설정

```json
// tsconfig.json
{
    "compilerOptions": {
        "baseUrl": "src/",
        "paths": {
            "@/styles/*": ["styles/*"],
            "@/components/*": ["components/*"]
        }
    }
}
```

```tsx
// 변경 전
import { Button } from '../../../components/button'

// 변경 후
import { Button } from '@/components/button'
```

---

## 8. 린팅 규칙

- ESLint 설정 파일: `eslint.config.mjs` (권장)
- **Next.js 16부터 `next build` 시 린터 자동 실행 안됨** → npm scripts로 별도 실행

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix
```

---

## 9. 주요 변경사항 요약 (Next.js 16)

| 항목 | 변경 내용 |
|------|---------|
| 기본 번들러 | Webpack → **Turbopack** |
| 빌드 시 린팅 | `next build` 자동 실행 → **수동 실행으로 변경** |
| params 타입 | 직접 접근 → **`Promise<{...}>`로 `await` 필요** |
| 타입 헬퍼 | `PageProps`, `LayoutProps`, `RouteContext` **전역 제공** |
| AGENTS.md | `create-next-app` 기본 설정에 포함 |
