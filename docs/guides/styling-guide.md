# 스타일링 가이드

Tailwind CSS v4 + shadcn/ui 기반 스타일링 규칙과 모범 사례를 정리한 문서입니다.

> **버전 참고**: 이 가이드는 Tailwind CSS v4 문서를 기준으로 작성되었습니다.
> 현재 프로젝트에는 v3.4.1이 설치되어 있으며, v4 전용 문법(`@theme`, `@utility`, `@custom-variant`, `@source`)은
> v4로 마이그레이션 후 사용 가능합니다. v3에서 동일한 역할을 하는 대체 방법은 각 섹션에서 명시합니다.

---

## 목차

1. [프로젝트 설정](#1-프로젝트-설정)
2. [유틸리티 클래스 기반 스타일링](#2-유틸리티-클래스-기반-스타일링)
3. [상태 및 인터랙션](#3-상태-및-인터랙션)
4. [반응형 디자인](#4-반응형-디자인)
5. [다크 모드](#5-다크-모드)
6. [테마 커스터마이징](#6-테마-커스터마이징)
7. [색상 시스템](#7-색상-시스템)
8. [커스텀 스타일 추가](#8-커스텀-스타일-추가)
9. [클래스 감지 메커니즘](#9-클래스-감지-메커니즘)
10. [함수와 지시어](#10-함수와-지시어)
11. [shadcn/ui 컴포넌트 가이드](#11-shadcnui-컴포넌트-가이드)
12. [모범 사례 및 패턴](#12-모범-사례-및-패턴)

---

## 1. 프로젝트 설정

### Tailwind CSS 설정

현재 프로젝트는 `tailwind.config.ts`를 통해 설정합니다.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],  // 클래스 기반 다크모드
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // CSS 변수 기반 색상 (shadcn/ui 호환)
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                // ...
            },
        },
    },
};
```

### shadcn/ui 설정

`components.json`이 shadcn/ui 컴포넌트 설치와 동작 방식을 결정합니다.

```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": true,
    "tsx": true,
    "tailwind": {
        "css": "app/globals.css",
        "baseColor": "neutral",
        "cssVariables": true
    },
    "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils",
        "ui": "@/components/ui"
    },
    "iconLibrary": "lucide"
}
```

**주요 설정 항목:**
- `style: "new-york"` — 더 간결하고 모던한 New York 스타일 사용
- `cssVariables: true` — CSS 변수 기반 색상 시스템
- `baseColor: "neutral"` — 기본 색상 팔레트

### 전역 CSS 구조

`app/globals.css`는 shadcn/ui CSS 변수와 Tailwind 기본 레이어를 설정합니다.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --primary: 240 5.9% 10%;
        --primary-foreground: 0 0% 98%;
        /* ... */
    }

    .dark {
        --background: 240 10% 3.9%;
        --foreground: 0 0% 98%;
        /* ... */
    }
}
```

---

## 2. 유틸리티 클래스 기반 스타일링

### 핵심 철학

Tailwind는 단일 목적의 유틸리티 클래스를 마크업에서 직접 조합하여 스타일링합니다.
별도의 CSS 파일을 오가지 않고, HTML에서 즉시 스타일을 적용합니다.

```tsx
// 카드 컴포넌트 예시
<div className="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
    <img className="size-12 shrink-0" src="/img/logo.svg" alt="로고" />
    <div>
        <div className="text-xl font-medium text-black dark:text-white">제목</div>
        <p className="text-gray-500 dark:text-gray-400">설명 텍스트</p>
    </div>
</div>
```

### 임의 값 (Arbitrary Values)

디자인 토큰에 없는 일회성 값이 필요할 때 대괄호 문법을 사용합니다.

```tsx
// 단일 값
<div className="top-[117px] bg-[#bada55] text-[22px]">...</div>

// CSS 함수 활용
<div className="max-h-[calc(100dvh-4rem)]">...</div>

// 그리드 레이아웃
<div className="grid grid-cols-[1fr_500px_2fr]">...</div>

// CSS 변수 참조
<div className="fill-[var(--brand-color)]">...</div>
```

### 중복 제거 전략

반복되는 유틸리티 조합은 다음 방법으로 관리합니다.

**1. React 컴포넌트로 추출 (권장)**

```tsx
// components/ui/card-item.tsx
interface CardItemProps {
    title: string;
    description: string;
}

export function CardItem({ title, description }: CardItemProps) {
    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="font-semibold text-card-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
```

**2. @layer components로 재사용 클래스 정의**

```css
/* app/globals.css */
@layer components {
    .card {
        @apply rounded-lg border bg-card p-4 shadow-sm;
    }

    .card-title {
        @apply font-semibold text-card-foreground;
    }
}
```

---

## 3. 상태 및 인터랙션

### 기본 상태 Variant

```tsx
{/* 버튼 상태 */}
<button className="
    bg-violet-500
    hover:bg-violet-600
    focus:outline-none focus:ring-2 focus:ring-violet-300
    active:bg-violet-700
    disabled:cursor-not-allowed disabled:opacity-50
">
    저장
</button>

{/* 입력 필드 상태 */}
<input className="
    border border-gray-300
    focus:border-sky-500 focus:ring-1 focus:ring-sky-500
    invalid:border-pink-500
    disabled:bg-gray-50 disabled:text-gray-400
    placeholder:text-gray-400
" />
```

### 위치 기반 Variant

```tsx
{/* 목록 첫/끝 항목 스타일 */}
<ul>
    {items.map((item) => (
        <li key={item.id} className="flex py-4 first:pt-0 last:pb-0 border-b last:border-0">
            {item.name}
        </li>
    ))}
</ul>

{/* 테이블 줄무늬 */}
<tbody>
    {rows.map((row) => (
        <tr key={row.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800">
            <td>{row.data}</td>
        </tr>
    ))}
</tbody>
```

### Group 패턴 (부모 상태로 자식 스타일링)

```tsx
{/* 카드 호버 시 내부 요소 스타일 변경 */}
<a href="#" className="group block rounded-lg p-4 hover:bg-sky-500">
    <h3 className="font-bold text-gray-900 group-hover:text-white">제목</h3>
    <p className="text-gray-500 group-hover:text-sky-100">설명</p>
    <span className="text-gray-400 group-hover:text-sky-200 text-sm">더 보기 →</span>
</a>

{/* 중첩 그룹 구분 (명명된 그룹) */}
<ul>
    {items.map((item) => (
        <li key={item.id} className="group/item flex items-center">
            <span>{item.name}</span>
            <a
                href="#"
                className="invisible group-hover/item:visible ml-auto text-sm text-blue-500"
            >
                편집
            </a>
        </li>
    ))}
</ul>
```

### Peer 패턴 (형제 상태 기반 스타일링)

```tsx
{/* 이메일 유효성 검사 메시지 */}
<div className="flex flex-col gap-1">
    <input
        type="email"
        className="peer border rounded px-3 py-2"
        placeholder="이메일을 입력하세요"
    />
    <p className="invisible text-sm text-pink-600 peer-invalid:visible">
        올바른 이메일 형식이 아닙니다.
    </p>
</div>
```

---

## 4. 반응형 디자인

### 모바일 우선 원칙

Tailwind는 모바일 우선(Mobile-First) 방식입니다.
**접두사 없는 클래스는 모든 화면 크기에 적용**되며, 접두사는 해당 브레이크포인트 이상에서만 적용됩니다.

```tsx
{/* 올바른 방법: 모바일 먼저 → 큰 화면에서 재정의 */}
<p className="text-center sm:text-left">텍스트</p>

{/* 잘못된 방법: 작은 화면에서 적용되지 않음 */}
<p className="sm:text-center">텍스트</p>
```

### 기본 브레이크포인트

| 접두사 | 최소 너비 | CSS |
|--------|-----------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

### 반응형 레이아웃 예시

```tsx
{/* 모바일: 세로 스택 → 태블릿: 가로 나란히 */}
<div className="max-w-2xl overflow-hidden rounded-xl bg-white shadow-md">
    <div className="md:flex">
        <img
            className="h-48 w-full object-cover md:h-full md:w-48"
            src="/img/building.jpg"
            alt="건물"
        />
        <div className="p-6 md:p-8">
            <h2 className="text-lg font-semibold md:text-xl">제목</h2>
            <p className="mt-2 text-gray-500">설명</p>
        </div>
    </div>
</div>

{/* 반응형 그리드 */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((item) => <Card key={item.id} {...item} />)}
</div>
```

### 커스텀 브레이크포인트 (v4 전용 / v3: tailwind.config.ts)

```css
/* v4: globals.css */
@theme {
    --breakpoint-xs: 30rem;   /* 480px */
    --breakpoint-3xl: 120rem; /* 1920px */
}
```

```typescript
// v3: tailwind.config.ts
theme: {
    extend: {
        screens: {
            xs: "30rem",
            "3xl": "120rem",
        },
    },
},
```

---

## 5. 다크 모드

### 현재 프로젝트 방식 (클래스 기반)

`tailwind.config.ts`의 `darkMode: ["class"]` 설정으로 `<html class="dark">`가 있을 때 다크모드가 활성화됩니다.

```tsx
{/* 라이트/다크 모드 대응 */}
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <p className="text-gray-600 dark:text-gray-400">설명 텍스트</p>
    <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
        클릭
    </button>
</div>
```

### 다크모드 토글 구현 (localStorage 연동)

```typescript
// 앱 진입점에 FOUC 방지용 스크립트 추가 (layout.tsx)
// <head> 안에 인라인 스크립트로 삽입
const darkModeScript = `
    (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
    })();
`;
```

```tsx
// components/theme-switcher.tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeSwitcher() {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        const newTheme = isDark ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", !isDark);
        setIsDark(!isDark);
    };

    return (
        <button onClick={toggleTheme} className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDark ? "라이트 모드" : "다크 모드"}
        </button>
    );
}
```

### v4 데이터 속성 기반 (v4 전용)

```css
/* v4: globals.css */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```html
<html data-theme="dark">
    <div class="bg-white dark:bg-black">...</div>
</html>
```

---

## 6. 테마 커스터마이징

### v4: @theme 지시어

v4에서는 `@theme` 블록에서 CSS 변수를 정의하면 유틸리티 클래스가 자동 생성됩니다.

```css
/* v4: globals.css */
@theme {
    /* 커스텀 색상 → bg-brand, text-brand 등 생성 */
    --color-brand: oklch(0.65 0.18 260);
    --color-brand-dark: oklch(0.50 0.18 260);

    /* 커스텀 폰트 → font-display 생성 */
    --font-display: "Pretendard", sans-serif;

    /* 커스텀 간격 → p-18, m-18 등 생성 */
    --spacing-18: 4.5rem;

    /* 커스텀 radius → rounded-4xl 생성 */
    --radius-4xl: 2rem;

    /* 커스텀 브레이크포인트 → xs: 생성 */
    --breakpoint-xs: 30rem;
}
```

### v3: tailwind.config.ts 확장

```typescript
// tailwind.config.ts
theme: {
    extend: {
        colors: {
            brand: {
                DEFAULT: "#3b82f6",
                dark: "#2563eb",
            },
        },
        fontFamily: {
            display: ["Pretendard", "sans-serif"],
        },
        spacing: {
            18: "4.5rem",
        },
        borderRadius: {
            "4xl": "2rem",
        },
    },
},
```

### CSS 변수로 테마 값 참조

shadcn/ui는 HSL CSS 변수를 사용하므로, 컴포넌트에서 직접 참조할 수 있습니다.

```css
/* CSS에서 테마 변수 사용 */
.custom-card {
    background-color: hsl(var(--card));
    color: hsl(var(--card-foreground));
    border-radius: var(--radius);
    padding: 1.5rem;
}
```

```tsx
{/* 인라인 스타일로 CSS 변수 활용 */}
<div style={{ color: "hsl(var(--primary))" }}>
    프라이머리 색상
</div>
```

---

## 7. 색상 시스템

### 기본 팔레트 구조

Tailwind는 50(가장 밝음) ~ 950(가장 어두움) 단계로 구성된 팔레트를 제공합니다.

| 색상군 | 예시 클래스 |
|--------|------------|
| slate, gray, zinc, neutral, stone | `bg-gray-100`, `text-slate-900` |
| red, orange, amber, yellow | `bg-red-500`, `text-amber-600` |
| lime, green, emerald, teal | `bg-green-400`, `text-emerald-700` |
| cyan, sky, blue, indigo | `bg-blue-600`, `text-sky-500` |
| violet, purple, fuchsia, pink, rose | `bg-purple-500`, `text-rose-400` |

### 색상 유틸리티 사용법

```tsx
{/* 배경 색상 */}
<div className="bg-white dark:bg-gray-900">배경</div>

{/* 텍스트 색상 */}
<p className="text-gray-900 dark:text-gray-100">본문</p>
<span className="text-blue-600 dark:text-blue-400">링크</span>

{/* 테두리 색상 */}
<div className="border border-gray-200 dark:border-gray-700">카드</div>

{/* 링 (focus ring) */}
<button className="ring-2 ring-blue-500 ring-offset-2">버튼</button>

{/* SVG */}
<svg className="fill-blue-500 stroke-blue-700">아이콘</svg>
```

### 불투명도 조정

```tsx
{/* 슬래시 문법으로 불투명도 설정 */}
<div className="bg-sky-500/10">10% 불투명 배경</div>
<div className="bg-sky-500/50">50% 불투명 배경</div>
<div className="text-black/75">75% 불투명 텍스트</div>

{/* 임의 불투명도 값 */}
<div className="bg-pink-500/[71.37%]">임의 불투명도</div>
```

### shadcn/ui 시맨틱 색상

shadcn/ui는 역할 기반 색상 변수를 사용합니다. 하드코딩된 색상보다 이 변수를 우선 사용하세요.

```tsx
{/* 의미론적 색상 클래스 사용 */}
<div className="bg-background text-foreground">기본 배경/텍스트</div>
<div className="bg-card text-card-foreground">카드</div>
<div className="bg-muted text-muted-foreground">비활성 영역</div>
<button className="bg-primary text-primary-foreground">프라이머리 버튼</button>
<button className="bg-destructive text-destructive-foreground">삭제 버튼</button>
<div className="border-border">테두리</div>
<input className="ring-ring" />
```

### 커스텀 색상 추가

```typescript
// tailwind.config.ts (v3)
colors: {
    brand: {
        50: "#eff6ff",
        500: "#3b82f6",
        900: "#1e3a8a",
    },
    midnight: "#121063",
    tahiti: "#3ab7bf",
},
```

---

## 8. 커스텀 스타일 추가

### 임의 속성 (Arbitrary Properties)

Tailwind에 없는 CSS 속성을 직접 사용할 때 대괄호 문법을 활용합니다.

```tsx
{/* CSS 속성 직접 지정 */}
<div className="[mask-type:luminance]">...</div>
<div className="[content-visibility:auto]">...</div>

{/* CSS 변수 설정 */}
<div className="[--scroll-offset:56px] lg:[--scroll-offset:44px]">...</div>

{/* 상태와 조합 */}
<div className="hover:[mask-type:alpha]">...</div>
```

### @layer 사용 전략

```css
/* app/globals.css */

/* 기본 HTML 요소 스타일 */
@layer base {
    h1 {
        @apply text-3xl font-bold tracking-tight;
    }
    h2 {
        @apply text-2xl font-semibold;
    }
    a {
        @apply text-blue-600 hover:text-blue-800 dark:text-blue-400;
    }
}

/* 재사용 가능한 컴포넌트 패턴 (유틸리티로 오버라이드 가능) */
@layer components {
    .btn-primary {
        @apply rounded-md bg-primary px-4 py-2 text-primary-foreground
               hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring;
    }

    .form-input {
        @apply w-full rounded-md border border-input bg-background px-3 py-2
               text-sm ring-offset-background
               focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
               disabled:cursor-not-allowed disabled:opacity-50;
    }
}

/* 단일 목적 커스텀 유틸리티 */
@layer utilities {
    .text-balance {
        text-wrap: balance;
    }
    .scrollbar-hidden {
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }
}
```

### v4 @utility (커스텀 유틸리티)

```css
/* v4 전용: @utility 지시어 */
@utility content-auto {
    content-visibility: auto;
}

@utility scrollbar-hidden {
    &::-webkit-scrollbar {
        display: none;
    }
}
```

### v4 @custom-variant (커스텀 변형)

```css
/* v4 전용: 커스텀 data 속성 기반 variant */
@custom-variant theme-midnight {
    &:where([data-theme="midnight"] *) {
        @slot;
    }
}
```

```tsx
{/* 사용 */}
<button className="theme-midnight:bg-black theme-midnight:text-white">
    미드나이트 테마 버튼
</button>
```

---

## 9. 클래스 감지 메커니즘

### 작동 원리

Tailwind는 소스 파일을 **정규식 기반 평문 텍스트로 스캔**합니다.
사용된 클래스 이름을 감지하여 해당 CSS만 생성하므로, **클래스 이름이 완전한 문자열로 존재해야 합니다.**

### 동적 클래스 명 안티패턴

```tsx
// ❌ 잘못된 방법: 문자열 보간 (감지 불가)
<div className={`text-${error ? "red" : "green"}-600`}>...</div>
<button className={`bg-${color}-500`}>...</button>

// ✅ 올바른 방법: 완전한 클래스명 사용
<div className={error ? "text-red-600" : "text-green-600"}>...</div>
```

### 정적 클래스 매핑 패턴

```tsx
interface ButtonProps {
    color: "blue" | "red" | "yellow";
    children: React.ReactNode;
}

// ✅ 색상별 완전한 클래스명 매핑 객체
const colorVariants: Record<ButtonProps["color"], string> = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    red: "bg-red-500 hover:bg-red-400 text-white",
    yellow: "bg-yellow-300 hover:bg-yellow-400 text-black",
};

export function Button({ color, children }: ButtonProps) {
    return (
        <button className={colorVariants[color]}>
            {children}
        </button>
    );
}
```

### v4 @source (소스 파일 명시)

```css
/* v4 전용: 외부 라이브러리 소스 등록 */
@source "../node_modules/@acmecorp/ui-lib";

/* 특정 경로 제외 */
@source not "../src/components/legacy";
```

### v4 세이프리스팅

```css
/* v4 전용: 특정 클래스 강제 생성 */
@source inline("underline");
@source inline("{hover:,focus:,}underline");
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
```

### v3 세이프리스팅

```typescript
// tailwind.config.ts (v3)
safelist: [
    "text-red-600",
    "text-green-600",
    {
        pattern: /bg-(red|green|blue)-(400|500|600)/,
        variants: ["hover", "focus"],
    },
],
```

---

## 10. 함수와 지시어

### 주요 지시어 요약

| 지시어 | 용도 | v3 대응 |
|--------|------|---------|
| `@import "tailwindcss"` | Tailwind 전체 포함 (v4) | `@tailwind base/components/utilities` |
| `@theme { }` | 디자인 토큰 정의 (v4) | `tailwind.config.ts > theme` |
| `@layer base/components/utilities` | CSS 레이어 정의 | 동일 |
| `@apply` | 유틸리티를 CSS에 인라인 | 동일 |
| `@utility` | 커스텀 유틸리티 정의 (v4) | `@layer utilities` |
| `@variant` | CSS 내에서 variant 적용 (v4) | `@screen sm { }` |
| `@custom-variant` | 커스텀 variant 정의 (v4) | 플러그인 필요 |
| `@source` | 소스 파일 명시 (v4) | `content` 배열 |

### @apply 사용법

```css
/* 유틸리티를 CSS 클래스에 적용 */
.select2-dropdown {
    @apply rounded-b-lg shadow-md;
}

/* 상태 variant도 사용 가능 */
.custom-btn {
    @apply bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300;
}
```

> **주의**: `@apply`는 서드파티 라이브러리 오버라이드나 불가피한 경우에만 사용하세요.
> 일반적인 컴포넌트는 마크업에서 직접 유틸리티 클래스를 사용하는 것이 권장됩니다.

### v4 주요 함수

```css
/* --alpha(): 색상 불투명도 조정 */
.element {
    color: --alpha(var(--color-blue-500) / 50%);
}

/* --spacing(): 테마 기반 간격값 */
.element {
    margin: --spacing(4);  /* calc(var(--spacing) * 4) */
}
```

### v4 @variant (CSS 내 variant 사용)

```css
/* CSS 파일에서 Tailwind variant 활용 */
.my-component {
    background-color: var(--color-white);

    @variant dark {
        background-color: var(--color-gray-900);
    }

    @variant hover {
        background-color: var(--color-gray-100);
    }
}
```

---

## 11. shadcn/ui 컴포넌트 가이드

### 컴포넌트 설치

```bash
# 개별 설치
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card input label

# 여러 컴포넌트 한 번에 설치
pnpm dlx shadcn@latest add button card input dialog table badge
```

설치된 컴포넌트는 `components/ui/` 디렉토리에 소스 코드로 추가되므로 자유롭게 커스터마이징 가능합니다.

---

### Button

```tsx
import { Button } from "@/components/ui/button";

{/* variant */}
<Button>기본 (default)</Button>
<Button variant="outline">외곽선 (outline)</Button>
<Button variant="ghost">고스트 (ghost)</Button>
<Button variant="destructive">삭제 (destructive)</Button>
<Button variant="secondary">보조 (secondary)</Button>
<Button variant="link">링크 (link)</Button>

{/* size */}
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>
<Button size="icon"><SearchIcon /></Button>

{/* asChild: 다른 요소에 버튼 스타일 적용 */}
<Button asChild>
    <a href="/dashboard">대시보드로 이동</a>
</Button>
```

---

### Card

```tsx
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

<Card>
    <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드에 대한 간단한 설명</CardDescription>
    </CardHeader>
    <CardContent>
        <p>카드의 주요 콘텐츠 영역입니다.</p>
    </CardContent>
    <CardFooter className="flex justify-between">
        <Button variant="outline">취소</Button>
        <Button>확인</Button>
    </CardFooter>
</Card>
```

---

### Input + Label

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

{/* 기본 입력 필드 */}
<div className="flex flex-col gap-1.5">
    <Label htmlFor="email">이메일 주소</Label>
    <Input id="email" type="email" placeholder="example@domain.com" />
</div>

{/* 비활성화 */}
<Input disabled placeholder="비활성화된 필드" />

{/* 파일 업로드 */}
<Input type="file" accept=".pdf,.docx" />
```

---

### Form (React Hook Form 연동)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    email: z.string().email("올바른 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (values: FormValues) => {
        console.log(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>이메일</FormLabel>
                            <FormControl>
                                <Input placeholder="이메일을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">로그인</Button>
            </form>
        </Form>
    );
}
```

---

### Dialog

```tsx
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

<Dialog>
    <DialogTrigger asChild>
        <Button variant="outline">설정 열기</Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>설정</DialogTitle>
            <DialogDescription>
                계정 설정을 변경합니다. 저장 버튼을 클릭하면 적용됩니다.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {/* 콘텐츠 */}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">취소</Button>
            </DialogClose>
            <Button>저장</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

---

### Alert Dialog (확인 대화상자)

```tsx
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

<AlertDialog>
    <AlertDialogTrigger asChild>
        <Button variant="destructive">계정 삭제</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()}>
                삭제
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

---

### Drawer

```tsx
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";

{/* 기본: 하단에서 올라옴 */}
<Drawer>
    <DrawerTrigger asChild>
        <Button>메뉴 열기</Button>
    </DrawerTrigger>
    <DrawerContent>
        <DrawerHeader>
            <DrawerTitle>메뉴</DrawerTitle>
            <DrawerDescription>원하는 항목을 선택하세요.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">{/* 콘텐츠 */}</div>
        <DrawerFooter>
            <DrawerClose asChild>
                <Button variant="outline">닫기</Button>
            </DrawerClose>
        </DrawerFooter>
    </DrawerContent>
</Drawer>
```

---

### Table

```tsx
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface UserTableProps {
    users: User[];
}

export function UserTable({ users }: UserTableProps) {
    return (
        <Table>
            <TableCaption>사용자 목록</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead className="text-right">역할</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right">{user.role}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
```

---

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>기본</Badge>
<Badge variant="secondary">보조</Badge>
<Badge variant="destructive">오류</Badge>
<Badge variant="outline">테두리</Badge>
```

---

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

{/* 기본 정보 알림 */}
<Alert>
    <CheckCircle className="size-4" />
    <AlertTitle>성공!</AlertTitle>
    <AlertDescription>변경사항이 저장되었습니다.</AlertDescription>
</Alert>

{/* 오류 알림 */}
<Alert variant="destructive">
    <AlertCircle className="size-4" />
    <AlertTitle>오류 발생</AlertTitle>
    <AlertDescription>요청을 처리하는 중 문제가 발생했습니다. 다시 시도해 주세요.</AlertDescription>
</Alert>
```

---

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="profile">
    <TabsList>
        <TabsTrigger value="profile">프로필</TabsTrigger>
        <TabsTrigger value="security">보안</TabsTrigger>
        <TabsTrigger value="notifications">알림</TabsTrigger>
    </TabsList>
    <TabsContent value="profile">
        <p>프로필 설정 내용</p>
    </TabsContent>
    <TabsContent value="security">
        <p>보안 설정 내용</p>
    </TabsContent>
    <TabsContent value="notifications">
        <p>알림 설정 내용</p>
    </TabsContent>
</Tabs>
```

---

### Select

```tsx
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
} from "@/components/ui/select";

<Select>
    <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="언어 선택" />
    </SelectTrigger>
    <SelectContent>
        <SelectGroup>
            <SelectLabel>언어</SelectLabel>
            <SelectItem value="ko">한국어</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
        </SelectGroup>
    </SelectContent>
</Select>
```

---

### Accordion

```tsx
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

{/* 단일 선택 */}
<Accordion type="single" collapsible className="w-full">
    <AccordionItem value="q1">
        <AccordionTrigger>배송은 얼마나 걸리나요?</AccordionTrigger>
        <AccordionContent>
            일반적으로 주문 후 2-3 영업일 이내에 배송됩니다.
        </AccordionContent>
    </AccordionItem>
    <AccordionItem value="q2">
        <AccordionTrigger>반품 정책은 어떻게 되나요?</AccordionTrigger>
        <AccordionContent>
            수령 후 14일 이내에 반품 신청이 가능합니다.
        </AccordionContent>
    </AccordionItem>
</Accordion>

{/* 다중 선택 */}
<Accordion type="multiple">...</Accordion>
```

---

### Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

{/* 기본 체크박스 */}
<div className="flex items-center gap-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">이용약관에 동의합니다.</Label>
</div>

{/* 제어된 상태 */}
const [checked, setChecked] = useState(false);

<Checkbox
    id="newsletter"
    checked={checked}
    onCheckedChange={(value) => setChecked(value as boolean)}
/>
```

---

### Calendar

```tsx
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

{/* 단일 날짜 선택 */}
const [date, setDate] = useState<Date | undefined>();

<Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-md border"
/>

{/* 날짜 범위 선택 */}
import type { DateRange } from "react-day-picker";

const [range, setRange] = useState<DateRange | undefined>();

<Calendar
    mode="range"
    selected={range}
    onSelect={setRange}
    numberOfMonths={2}
/>
```

---

### Tooltip

```tsx
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";

{/* TooltipProvider는 앱 루트에 배치하거나 각 사용처에 래핑 */}
<TooltipProvider>
    <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
                <HelpCircle className="size-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
            <p>도움말 내용</p>
        </TooltipContent>
    </Tooltip>
</TooltipProvider>
```

---

### Command (검색 팔레트)

```tsx
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

<Command className="rounded-lg border shadow-md">
    <CommandInput placeholder="명령어 검색..." />
    <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="제안">
            <CommandItem>
                <CalendarIcon className="mr-2 size-4" />
                <span>캘린더</span>
            </CommandItem>
            <CommandItem>
                <SearchIcon className="mr-2 size-4" />
                <span>검색</span>
                <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="설정">
            <CommandItem>프로필</CommandItem>
            <CommandItem>로그아웃</CommandItem>
        </CommandGroup>
    </CommandList>
</Command>
```

---

### Avatar

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

{/* 기본 아바타 */}
<Avatar>
    <AvatarImage src="https://github.com/shadcn.png" alt="사용자 프로필" />
    <AvatarFallback>CN</AvatarFallback>
</Avatar>

{/* 이미지 로딩 실패 시 이니셜 표시 */}
<Avatar>
    <AvatarImage src="/invalid-path.jpg" alt="김철수" />
    <AvatarFallback>김</AvatarFallback>
</Avatar>

{/* 크기 조절 */}
<Avatar className="size-12">
    <AvatarImage src="..." />
    <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

### Toast (Sonner 사용 권장)

> **주의**: 기존 Toast 컴포넌트는 deprecated입니다. **Sonner**를 사용하세요.

```bash
pnpm dlx shadcn@latest add sonner
```

```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
```

```tsx
// 컴포넌트에서 사용
import { toast } from "sonner";

<Button onClick={() => toast("변경사항이 저장되었습니다.")}>저장</Button>
<Button onClick={() => toast.error("오류가 발생했습니다.")}>오류 테스트</Button>
<Button onClick={() => toast.success("성공!", { description: "작업이 완료되었습니다." })}>성공</Button>
```

---

## 12. 모범 사례 및 패턴

### 스타일링 원칙

**1. 마크업 중심 스타일링**

CSS 파일 대신 컴포넌트 마크업에서 대부분의 스타일을 처리합니다.
이는 컴포넌트 단위로 스타일을 추적하기 쉽게 만들어 유지보수를 향상시킵니다.

**2. 디자인 토큰 우선 사용**

임의 값(`[]`) 보다 사전 정의된 토큰을 우선 사용합니다.

```tsx
// ❌ 피하기
<div className="p-[24px] text-[16px] rounded-[8px]">...</div>

// ✅ 권장
<div className="p-6 text-base rounded-lg">...</div>
```

**3. shadcn/ui 시맨틱 색상 우선**

하드코딩된 색상보다 역할 기반 CSS 변수를 사용합니다.

```tsx
// ❌ 피하기
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">...</div>

// ✅ 권장
<div className="bg-background text-foreground">...</div>
```

**4. 컴포넌트화를 통한 중복 제거**

동일한 유틸리티 조합이 3번 이상 반복되면 컴포넌트로 추출합니다.

```tsx
// ❌ 중복
<div className="rounded-lg border bg-card p-4 shadow-sm">카드 1</div>
<div className="rounded-lg border bg-card p-4 shadow-sm">카드 2</div>
<div className="rounded-lg border bg-card p-4 shadow-sm">카드 3</div>

// ✅ 컴포넌트 추출
interface InfoCardProps {
    children: React.ReactNode;
    className?: string;
}

function InfoCard({ children, className }: InfoCardProps) {
    return (
        <div className={`rounded-lg border bg-card p-4 shadow-sm ${className ?? ""}`}>
            {children}
        </div>
    );
}
```

### 반응형 디자인 체크리스트

- [ ] 모바일 레이아웃 먼저 설계
- [ ] 터치 타겟 최소 44x44px 유지 (`min-h-11 min-w-11`)
- [ ] 텍스트 가독성 확인 (모바일: 최소 14px)
- [ ] 접기/펼치기 패턴으로 모바일 공간 최적화

### 다크모드 설계 체크리스트

- [ ] 모든 색상에 `dark:` variant 적용 여부 확인
- [ ] 이미지/아이콘의 다크모드 대응 확인
- [ ] 그림자 (shadow) 다크모드 조정 (`dark:shadow-gray-900`)
- [ ] 초기 로딩 시 FOUC 방지 처리 확인

### 접근성 체크리스트

```tsx
{/* focus 스타일 유지 */}
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    클릭
</button>

{/* 모션 설정 존중 */}
<div className="transition-all motion-reduce:transition-none">...</div>

{/* ARIA 속성과 조합 */}
<button
    aria-expanded={isOpen}
    className="aria-expanded:bg-accent"
>
    메뉴
</button>

{/* 비활성 상태 명시 */}
<button disabled className="disabled:cursor-not-allowed disabled:opacity-50">
    비활성 버튼
</button>
```

### 이 프로젝트 코딩 스타일

```tsx
// ✅ 들여쓰기: 4칸 스페이스
export function ExampleComponent({ title, description }: ExampleComponentProps) {
    return (
        <div className="rounded-lg p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

// ✅ Props 타입: "컴포넌트이름Props" 형태
interface ExampleComponentProps {
    title: string;
    description: string;
}

// ✅ 컴포넌트명: PascalCase
// ✅ 변수/함수명: camelCase
// ✅ enum 대신 string union 타입 사용
type ButtonVariant = "default" | "outline" | "ghost" | "destructive";

// ❌ any 타입 사용 금지
// ❌ enum 사용 금지
```

### 클래스 정렬 권장 순서

가독성을 위해 다음 순서로 클래스를 작성합니다.

1. 레이아웃 (`flex`, `grid`, `block`, `hidden`)
2. 위치 (`relative`, `absolute`, `z-10`)
3. 크기 (`w-`, `h-`, `min-w-`, `max-w-`)
4. 여백 (`m-`, `p-`)
5. 타이포그래피 (`text-`, `font-`, `leading-`, `tracking-`)
6. 색상/배경 (`bg-`, `text-`, `border-`)
7. 테두리/그림자 (`rounded-`, `border`, `shadow-`)
8. 반응형 (`sm:`, `md:`, `lg:`)
9. 상태 (`hover:`, `focus:`, `dark:`)

> **팁**: [Prettier Tailwind CSS 플러그인](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)을 사용하면 자동으로 정렬됩니다.

```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

---

## 참고 자료

- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트 문서](https://ui.shadcn.com/docs/components)
- [Radix UI 접근성 가이드](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [관련 가이드: 컴포넌트 패턴](./component-patterns.md)
- [관련 가이드: React Hook Form](./forms-react-hook-form.md)
