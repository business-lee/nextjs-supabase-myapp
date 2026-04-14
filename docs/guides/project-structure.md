# Next.js v16.2.3 프로젝트 구조 가이드

> 이 문서는 Next.js v16.2.3 공식 문서를 기반으로 이 프로젝트에서 따르는 폴더 구조, 파일 조직, 네이밍 컨벤션을 정의합니다.
> UI 도구로 **shadcn/ui**를 사용하며, 관련 컨벤션도 함께 정리합니다.

---

## 목차

1. [최상위 폴더 구조](#1-최상위-폴더-구조)
2. [최상위 파일 목록](#2-최상위-파일-목록)
3. [라우팅 파일 컨벤션](#3-라우팅-파일-컨벤션)
4. [라우트 조직 패턴](#4-라우트-조직-패턴)
5. [컴포넌트 렌더링 계층 구조](#5-컴포넌트-렌더링-계층-구조)
6. [shadcn/ui 통합 컨벤션](#6-shadcnui-통합-컨벤션)
7. [이 프로젝트의 권장 폴더 구조](#7-이-프로젝트의-권장-폴더-구조)
8. [네이밍 컨벤션](#8-네이밍-컨벤션)
9. [메타데이터 파일](#9-메타데이터-파일)

---

## 1. 최상위 폴더 구조

Next.js는 애플리케이션 코드와 정적 자산을 최상위 폴더로 조직합니다.

| 폴더 | 설명 |
|------|------|
| `app/` | App Router - 라우팅, 레이아웃, 페이지 정의 |
| `public/` | 정적 자산 (이미지, 폰트 등) - URL로 직접 접근 가능 |
| `components/` | 재사용 가능한 React 컴포넌트 |
| `lib/` | 유틸리티 함수, 외부 서비스 클라이언트 |
| `src/` | (선택) 애플리케이션 소스 폴더 - 설정 파일과 소스 분리 시 사용 |
| `docs/` | 프로젝트 문서 |

> **이 프로젝트 선택**: `app/`, `components/`, `lib/`를 최상위에 두는 방식을 채택합니다.
> `src/` 폴더는 사용하지 않습니다.

---

## 2. 최상위 파일 목록

| 파일 | 설명 |
|------|------|
| `next.config.ts` | Next.js 설정 파일 |
| `package.json` | 프로젝트 의존성 및 스크립트 |
| `tsconfig.json` | TypeScript 설정 |
| `tailwind.config.ts` | Tailwind CSS 설정 |
| `components.json` | shadcn/ui 설정 |
| `eslint.config.mjs` | ESLint 설정 |
| `postcss.config.mjs` | PostCSS 설정 |
| `proxy.ts` | Next.js 요청 프록시 |
| `.env` | 환경 변수 (버전 관리 제외) |
| `.env.local` | 로컬 환경 변수 (버전 관리 제외) |
| `.env.production` | 프로덕션 환경 변수 (버전 관리 제외) |
| `.env.development` | 개발 환경 변수 (버전 관리 제외) |
| `next-env.d.ts` | Next.js TypeScript 선언 파일 (버전 관리 제외) |
| `.gitignore` | Git 무시 파일/폴더 목록 |

---

## 3. 라우팅 파일 컨벤션

`app/` 디렉토리 내의 특수 파일명이 라우트의 동작을 결정합니다.

| 파일명 | 확장자 | 역할 |
|--------|--------|------|
| `layout` | `.tsx` `.jsx` `.js` | 공유 레이아웃 (헤더, 네비게이션, 푸터 등) |
| `page` | `.tsx` `.jsx` `.js` | 라우트를 공개적으로 노출하는 페이지 |
| `loading` | `.tsx` `.jsx` `.js` | 로딩 스켈레톤 UI (Suspense 경계) |
| `not-found` | `.tsx` `.jsx` `.js` | 404 Not Found UI |
| `error` | `.tsx` `.jsx` `.js` | 에러 경계 UI |
| `global-error` | `.tsx` `.jsx` `.js` | 전역 에러 UI |
| `route` | `.ts` `.js` | API 엔드포인트 |
| `template` | `.tsx` `.jsx` `.js` | 재렌더링되는 레이아웃 (layout과 달리 상태 초기화) |
| `default` | `.tsx` `.jsx` `.js` | 병렬 라우트 폴백 페이지 |

### 라우트 공개 조건

폴더가 존재한다고 해서 라우트가 공개되지 않습니다.
**`page.tsx` 또는 `route.ts` 파일이 있어야만** 해당 경로가 공개됩니다.

```
app/
├── blog/
│   ├── _components/    ← page 없음 → 라우트 비공개 (프라이빗 폴더)
│   └── page.tsx        ← /blog 라우트 공개
└── page.tsx            ← / 라우트 공개
```

---

## 4. 라우트 조직 패턴

### 4-1. 중첩 라우트 (Nested Routes)

폴더를 중첩하면 URL 세그먼트가 중첩됩니다.

| 파일 경로 | URL |
|-----------|-----|
| `app/layout.tsx` | — (루트 레이아웃) |
| `app/page.tsx` | `/` |
| `app/blog/page.tsx` | `/blog` |
| `app/blog/authors/page.tsx` | `/blog/authors` |

### 4-2. 동적 라우트 (Dynamic Routes)

| 패턴 | 예시 경로 | 매칭 URL |
|------|-----------|----------|
| `[slug]` | `app/blog/[slug]/page.tsx` | `/blog/my-post` |
| `[...slug]` | `app/shop/[...slug]/page.tsx` | `/shop/clothes`, `/shop/clothes/shirts` |
| `[[...slug]]` | `app/docs/[[...slug]]/page.tsx` | `/docs`, `/docs/api`, `/docs/api/ref` |

`params` prop을 통해 값에 접근합니다:

```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    return <h1>{slug}</h1>;
}
```

### 4-3. 라우트 그룹 `(group)`

소괄호로 감싼 폴더는 **URL에 포함되지 않습니다**. 관련 라우트를 논리적으로 묶는 데 사용합니다.

| 파일 경로 | URL |
|-----------|-----|
| `app/(marketing)/page.tsx` | `/` |
| `app/(shop)/cart/page.tsx` | `/cart` |
| `app/(auth)/login/page.tsx` | `/login` |

**사용 목적:**
- 사이트 섹션별 라우트 그룹화 (마케팅, 어드민, 인증 등)
- 특정 라우트 집합에만 레이아웃 적용
- 같은 세그먼트 수준에서 여러 루트 레이아웃 생성

```
app/
├── (auth)/
│   ├── layout.tsx      ← 인증 페이지 공통 레이아웃
│   ├── login/page.tsx
│   └── sign-up/page.tsx
├── (protected)/
│   ├── layout.tsx      ← 보호된 페이지 공통 레이아웃
│   └── dashboard/page.tsx
└── layout.tsx          ← 루트 레이아웃
```

### 4-4. 프라이빗 폴더 `_folder`

언더스코어로 시작하는 폴더는 **라우팅 시스템에서 완전히 제외**됩니다.

| 경로 | 설명 |
|------|------|
| `app/blog/_components/` | 라우트 불가, UI 유틸리티 보관 |
| `app/blog/_lib/` | 라우트 불가, 내부 유틸리티 보관 |

**사용 목적:**
- UI 로직과 라우팅 로직 분리
- 특정 라우트 전용 컴포넌트/유틸리티 코로케이션
- 미래 Next.js 파일 컨벤션과의 이름 충돌 방지

### 4-5. 병렬 라우트와 인터셉트 라우트

| 패턴 | 의미 | 대표 활용 사례 |
|------|------|----------------|
| `@folder` | 네임드 슬롯 | 사이드바 + 메인 콘텐츠 |
| `(.)folder` | 같은 레벨 인터셉트 | 모달로 형제 라우트 미리보기 |
| `(..)folder` | 부모 레벨 인터셉트 | 부모의 자식을 오버레이로 열기 |
| `(...)folder` | 루트에서 인터셉트 | 현재 뷰에서 임의 라우트 표시 |

---

## 5. 컴포넌트 렌더링 계층 구조

특수 파일의 컴포넌트는 다음 순서로 렌더링됩니다:

```
layout.tsx
  └── template.tsx
        └── error.tsx (React 에러 경계)
              └── loading.tsx (React Suspense 경계)
                    └── not-found.tsx (에러 경계)
                          └── page.tsx (또는 중첩 layout.tsx)
```

중첩 라우트에서는 이 계층이 재귀적으로 적용됩니다. 즉, 하위 라우트의 컴포넌트는 상위 라우트 컴포넌트 내부에 중첩됩니다.

---

## 6. shadcn/ui 통합 컨벤션

### 6-1. 폴더 구조

shadcn/ui 컴포넌트는 `components/ui/` 폴더에 위치합니다.

```
components/
├── ui/                     ← shadcn/ui 컴포넌트 (자동 생성)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── ...
├── auth-button.tsx         ← 커스텀 비즈니스 컴포넌트
├── login-form.tsx
└── theme-switcher.tsx
```

### 6-2. components.json 설정

shadcn/ui 설정은 프로젝트 루트의 `components.json`에서 관리합니다.

```json
{
    "style": "default",
    "rsc": true,
    "tsx": true,
    "tailwind": {
        "config": "tailwind.config.ts",
        "css": "app/globals.css",
        "baseColor": "neutral",
        "cssVariables": true
    },
    "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils",
        "ui": "@/components/ui"
    }
}
```

### 6-3. `cn()` 유틸리티

`lib/utils.ts`에 `clsx`와 `tailwind-merge`를 조합한 `cn()` 유틸리티가 위치합니다.

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

### 6-4. 컴포넌트 추가 방법

```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card input label
```

컴포넌트는 자동으로 `components/ui/` 폴더에 생성됩니다.

### 6-5. 사용 예시

```tsx
// components/ui/ 컴포넌트 임포트
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// cn() 유틸리티 활용
import { cn } from "@/lib/utils";

interface MyCardProps {
    className?: string;
    title: string;
}

export function MyCard({ className, title }: MyCardProps) {
    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Input placeholder="입력..." />
                <Button className="mt-4">확인</Button>
            </CardContent>
        </Card>
    );
}
```

---

## 7. 이 프로젝트의 권장 폴더 구조

```
nextjs-supabase-myapp/
├── app/                            # App Router
│   ├── (auth)/                     # 인증 라우트 그룹 (URL 미포함)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── update-password/
│   │   │   └── page.tsx
│   │   └── confirm/
│   │       └── route.ts            # 이메일 확인 API
│   ├── (protected)/                # 인증 필요 라우트 그룹
│   │   ├── layout.tsx              # 인증 검사 레이아웃
│   │   └── page.tsx
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 홈 페이지 (/)
│   ├── globals.css                 # 전역 스타일
│   ├── favicon.ico
│   ├── opengraph-image.png
│   └── twitter-image.png
│
├── components/                     # 재사용 컴포넌트
│   ├── ui/                         # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── auth-button.tsx             # 커스텀 컴포넌트
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   └── theme-switcher.tsx
│
├── lib/                            # 유틸리티 및 외부 서비스
│   ├── supabase/
│   │   ├── client.ts               # 클라이언트 사이드 Supabase 클라이언트
│   │   ├── server.ts               # 서버 사이드 Supabase 클라이언트
│   │   └── proxy.ts                # API 프록시
│   └── utils.ts                    # cn() 등 공통 유틸리티
│
├── public/                         # 정적 자산
│
├── docs/                           # 프로젝트 문서
│   └── guides/
│       ├── project-structure.md    # 이 파일
│       ├── component-patterns.md
│       └── nextjs-16.md
│
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── components.json
├── eslint.config.mjs
├── postcss.config.mjs
└── proxy.ts
```

---

## 8. 네이밍 컨벤션

### 파일명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case | `auth-button.tsx`, `login-form.tsx` |
| 라우트 특수 파일 | Next.js 지정 이름 | `page.tsx`, `layout.tsx`, `loading.tsx` |
| API 라우트 | `route.ts` | `app/auth/confirm/route.ts` |
| 유틸리티 파일 | kebab-case | `utils.ts`, `auth-helpers.ts` |
| 훅 파일 | `use-` 접두사 | `use-auth.ts`, `use-theme.ts` |
| 타입 정의 파일 | kebab-case | `auth-types.ts`, `database-types.ts` |

### 코드 내 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `AuthButton`, `LoginForm` |
| Props 타입 | `컴포넌트이름Props` | `AuthButtonProps`, `LoginFormProps` |
| 일반 함수/변수 | camelCase | `getUserData`, `isAuthenticated` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 훅 | `use` 접두사 + camelCase | `useAuth`, `useTheme` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `AuthState` |

> **주의**: `any` 타입 사용 금지, `enum` 타입 사용 금지

### Path Alias

`@/`는 프로젝트 루트를 가리킵니다 (`tsconfig.json`에 설정).

```typescript
// 절대 경로 임포트 (권장)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
```

---

## 9. 메타데이터 파일

### 앱 아이콘

| 파일 | 위치 | 용도 |
|------|------|------|
| `favicon.ico` | `app/favicon.ico` | 브라우저 탭 아이콘 |
| `icon.png` | `app/icon.png` | 앱 아이콘 |
| `apple-icon.png` | `app/apple-icon.png` | Apple 홈 화면 아이콘 |

### 소셜 미디어 이미지

| 파일 | 위치 | 용도 |
|------|------|------|
| `opengraph-image.png` | `app/opengraph-image.png` | Open Graph 미리보기 이미지 |
| `twitter-image.png` | `app/twitter-image.png` | Twitter 카드 이미지 |

코드로 동적 생성도 가능합니다:

```typescript
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export default function OgImage() {
    return new ImageResponse(
        <div style={{ fontSize: 48, background: "white", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            My App
        </div>
    );
}
```

### SEO 파일

| 파일 | 위치 | 용도 |
|------|------|------|
| `sitemap.xml` | `app/sitemap.xml` | 검색엔진 사이트맵 |
| `sitemap.ts` | `app/sitemap.ts` | 동적 사이트맵 생성 |
| `robots.txt` | `app/robots.txt` | 크롤러 접근 제어 |
| `robots.ts` | `app/robots.ts` | 동적 robots 파일 생성 |

---

## 참고 링크

- [Next.js 공식 문서 - 프로젝트 구조](https://nextjs.org/docs/app/getting-started/project-structure)
- [shadcn/ui 공식 문서](https://ui.shadcn.com)
- [Next.js App Router 라우팅](https://nextjs.org/docs/app/building-your-application/routing)
