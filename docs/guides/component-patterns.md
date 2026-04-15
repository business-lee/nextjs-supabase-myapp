# Next.js 컴포넌트 패턴 가이드

> **버전**: Next.js 16.2.3  
> **최종 업데이트**: 2026-04-10  
> **목적**: 효율적이고 재사용 가능한 컴포넌트 작성을 위한 핵심 규칙과 패턴 정리

---

## 1. 서버 컴포넌트 vs 클라이언트 컴포넌트

### 언제 사용하나

| 상황                                     | 컴포넌트 종류       |
| ---------------------------------------- | ------------------- |
| DB/API에서 데이터 페칭                   | 서버 컴포넌트       |
| API 키, 시크릿 사용                      | 서버 컴포넌트       |
| 클라이언트 JS 번들 최소화                | 서버 컴포넌트       |
| `onClick`, `onChange` 이벤트 핸들러      | 클라이언트 컴포넌트 |
| `useState`, `useEffect` 등 훅 사용       | 클라이언트 컴포넌트 |
| `localStorage`, `window` 등 브라우저 API | 클라이언트 컴포넌트 |
| 커스텀 훅                                | 클라이언트 컴포넌트 |

**기본값**: `layout.tsx`와 `page.tsx`는 기본적으로 서버 컴포넌트.

### `'use client'` 경계 규칙

파일 최상단에 `'use client'`를 선언하면 해당 파일과 **모든 하위 임포트**가 클라이언트 번들에 포함된다.
따라서 `'use client'`는 인터랙티브한 컴포넌트에만 최소 범위로 선언한다.

```tsx
// app/ui/like-button.tsx — 인터랙티브한 부분만 클라이언트로 분리
"use client";

import { useState } from "react";

export default function LikeButton({ likes }: { likes: number }) {
    const [count, setCount] = useState(likes);

    return <button onClick={() => setCount(count + 1)}>{count} 좋아요</button>;
}
```

```tsx
// app/[id]/page.tsx — 서버 컴포넌트에서 데이터 페칭 후 props로 전달
import LikeButton from "@/app/ui/like-button";
import { getPost } from "@/lib/data";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    return (
        <div>
            <h1>{post.title}</h1>
            <LikeButton likes={post.likes} />
        </div>
    );
}
```

### 번들 크기 최소화 패턴

레이아웃에서 일부 요소만 인터랙티브한 경우, 해당 요소만 클라이언트 컴포넌트로 분리한다.

```tsx
// app/layout.tsx — 레이아웃 자체는 서버 컴포넌트 유지
import Search from "./search"; // 클라이언트 컴포넌트
import Logo from "./logo"; // 서버 컴포넌트

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <nav>
                <Logo />
                <Search /> {/* 인터랙티브한 부분만 클라이언트 */}
            </nav>
            <main>{children}</main>
        </>
    );
}
```

### 서버 컴포넌트를 클라이언트 컴포넌트에 children으로 전달

클라이언트 컴포넌트 **내부에** 서버 컴포넌트를 직접 임포트하면 안된다.
대신 `children` prop을 통해 서버 컴포넌트를 주입한다.

```tsx
// app/ui/modal.tsx — 클라이언트 컴포넌트 (children 슬롯 제공)
"use client";

export default function Modal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>열기</button>
            {isOpen && <div>{children}</div>}
        </div>
    );
}
```

```tsx
// app/page.tsx — 서버 컴포넌트인 Page에서 조합
import Modal from "./ui/modal";
import Cart from "./ui/cart"; // 서버 컴포넌트

export default function Page() {
    return (
        <Modal>
            <Cart /> {/* 서버 컴포넌트를 children으로 전달 */}
        </Modal>
    );
}
```

### Context Provider 패턴

React Context는 서버 컴포넌트에서 사용 불가. 클라이언트 컴포넌트로 Provider를 만들어 layout에서 감싼다.
Provider는 트리에서 **최대한 깊은 곳**에 배치하여 서버 컴포넌트 최적화 범위를 최대화한다.

```tsx
// app/theme-provider.tsx
"use client";

import { createContext } from "react";

export const ThemeContext = createContext({});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}
```

```tsx
// app/layout.tsx
import ThemeProvider from "./theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
```

### 서드파티 라이브러리 래핑

`'use client'` 디렉티브가 없는 서드파티 컴포넌트를 서버 컴포넌트에서 직접 사용하면 에러가 발생한다.
클라이언트 래퍼를 만들어 해결한다.

```tsx
// app/carousel.tsx — 서드파티 컴포넌트 래핑
"use client";

import { Carousel } from "acme-carousel";

export default Carousel;
```

```tsx
// app/page.tsx — 서버 컴포넌트에서 안전하게 사용 가능
import Carousel from "./carousel";

export default function Page() {
    return <Carousel />;
}
```

### 환경 오염 방지 (`server-only` / `client-only`)

서버 전용 코드(API 키 등)가 클라이언트 번들에 포함되는 것을 빌드 타임에 차단한다.

```bash
npm install server-only
```

```ts
// lib/data.ts — 클라이언트에서 임포트 시 빌드 에러 발생
import "server-only";

export async function getData() {
    const res = await fetch("https://api.example.com/data", {
        headers: { authorization: process.env.API_KEY },
    });
    return res.json();
}
```

---

## 2. 이미지 (`next/image`)

### 핵심 규칙

- 항상 `next/image`의 `<Image>`를 사용한다 (`<img>` 태그 직접 사용 지양)
- `alt` prop은 필수 (스크린 리더 및 SEO)
- `width` + `height` 또는 `fill` 중 하나는 반드시 지정

### 기본 사용법

```tsx
import Image from "next/image";

export default function ProfileImage() {
    return <Image src="/profile.png" width={500} height={500} alt="프로필 사진" />;
}
```

### fill 패턴 (크기를 모를 때)

부모 컨테이너가 `position: relative | fixed | absolute` 이어야 한다.

```tsx
<div style={{ position: "relative", width: "400px", height: "300px" }}>
    <Image
        src="/hero.jpg"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ objectFit: "cover" }}
        alt="히어로 이미지"
    />
</div>
```

### 반응형 이미지 패턴

`sizes` prop으로 뷰포트별 이미지 크기를 브라우저에 알려준다 → 불필요하게 큰 이미지 다운로드 방지.

```tsx
// 정적 임포트 — 너비/높이 자동 설정
import mountains from "../public/mountains.jpg";

export default function Responsive() {
    return (
        <Image
            src={mountains}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            alt="산 풍경"
        />
    );
}
```

```tsx
// 원격 이미지 — 너비/높이 수동 지정 필요
<Image
    src={photoUrl}
    width={800}
    height={600}
    sizes="(max-width: 768px) 100vw, 50vw"
    style={{ width: "100%", height: "auto" }}
    alt="사진"
/>
```

### 원격 이미지 허용 설정 (`next.config.js`)

```js
// next.config.js
module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "s3.amazonaws.com",
                port: "",
                pathname: "/my-bucket/**",
                search: "",
            },
        ],
    },
};
```

### 로딩 성능 최적화

| 상황                           | 설정                                 |
| ------------------------------ | ------------------------------------ |
| LCP(최대 콘텐츠 페인트) 요소   | `preload={true}`                     |
| 히어로 이미지 (화면 상단 고정) | `loading="eager"`                    |
| 일반 이미지                    | 기본값(`loading="lazy"`) 유지        |
| 로딩 중 블러 효과              | `placeholder="blur"` + `blurDataURL` |

```tsx
// 히어로 이미지
<Image
    src="/hero.jpg"
    width={1200}
    height={600}
    alt="히어로"
    preload={true}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
/>
```

### SVG 처리

SVG는 기본적으로 최적화 비활성화 상태. `src`가 `.svg`로 끝나면 자동으로 `unoptimized` 적용된다.

```tsx
<Image src="/icon.svg" width={24} height={24} alt="아이콘" unoptimized />
```

---

## 3. 링크 (`next/link`)

### 핵심 규칙

- 내부 페이지 이동 시 항상 `next/link`의 `<Link>` 사용 (`<a>` 태그 직접 사용 지양)
- `href` prop은 필수

### 기본 사용법

```tsx
import Link from "next/link";

export default function Nav() {
    return (
        <nav>
            <Link href="/">홈</Link>
            <Link href="/about">소개</Link>
        </nav>
    );
}
```

### 동적 라우트 링크 생성

```tsx
import Link from "next/link";

interface Post {
    id: number;
    title: string;
    slug: string;
}

export default function PostList({ posts }: { posts: Post[] }) {
    return (
        <ul>
            {posts.map((post) => (
                <li key={post.id}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </li>
            ))}
        </ul>
    );
}
```

### 활성 링크 감지

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLinks() {
    const pathname = usePathname();

    return (
        <nav>
            <Link href="/" className={pathname === "/" ? "text-primary font-bold" : "text-muted"}>
                홈
            </Link>
            <Link
                href="/about"
                className={pathname === "/about" ? "text-primary font-bold" : "text-muted"}
            >
                소개
            </Link>
        </nav>
    );
}
```

### 주요 옵션

| prop       | 기본값  | 설명                                                    |
| ---------- | ------- | ------------------------------------------------------- |
| `replace`  | `false` | `true`이면 히스토리 스택에 추가하지 않고 현재 항목 교체 |
| `scroll`   | `true`  | `false`이면 네비게이션 시 스크롤 위치 유지              |
| `prefetch` | `null`  | `false`이면 뷰포트 진입 시 프리페칭 비활성화            |

```tsx
// 히스토리 교체 (뒤로가기 방지)
<Link href="/login" replace>로그인</Link>

// 스크롤 위치 유지
<Link href="/dashboard" scroll={false}>대시보드</Link>

// 대규모 목록에서 리소스 절약
<Link href={`/item/${id}`} prefetch={false}>아이템</Link>
```

### onNavigate로 네비게이션 차단

폼에 저장되지 않은 변경사항이 있을 때 이탈을 방지하는 패턴.

```tsx
"use client";

import Link from "next/link";

export function CustomLink({
    children,
    isBlocked,
    ...props
}: React.ComponentProps<typeof Link> & { isBlocked: boolean }) {
    return (
        <Link
            onNavigate={(e) => {
                if (
                    isBlocked &&
                    !window.confirm("저장하지 않은 변경사항이 있습니다. 이동하시겠습니까?")
                ) {
                    e.preventDefault();
                }
            }}
            {...props}
        >
            {children}
        </Link>
    );
}
```

---

## 4. 폼 (`next/form`)

`next/form`의 `<Form>`은 HTML `<form>`을 확장하여 프리페칭, 클라이언트 사이드 네비게이션, 점진적 향상을 제공한다.

### string action — 검색 폼 패턴

`action`이 문자열이면 GET 방식으로 URL 쿼리 파라미터를 업데이트한다.

```tsx
// app/ui/search.tsx
import Form from "next/form";
import SearchButton from "./search-button";

export default function Search() {
    return (
        <Form action="/search">
            <input name="query" placeholder="검색어 입력..." />
            <SearchButton />
        </Form>
    );
}
```

```tsx
// app/ui/search-button.tsx — 제출 중 pending 상태 표시
"use client";

import { useFormStatus } from "react-dom";

export default function SearchButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending}>
            {pending ? "검색 중..." : "검색"}
        </button>
    );
}
```

```tsx
// app/search/page.tsx — 결과 페이지에서 searchParams 사용
export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query } = await searchParams;
    const results = await getSearchResults(query);

    return <div>{/* 결과 렌더링 */}</div>;
}
```

### function action — Server Action 뮤테이션 패턴

`action`이 함수이면 Server Action을 실행한다.

```tsx
// app/posts/create/page.tsx
import Form from "next/form";
import { createPost } from "@/posts/actions";

export default function CreatePostPage() {
    return (
        <Form action={createPost}>
            <input name="title" placeholder="제목" />
            <textarea name="content" placeholder="내용" />
            <button type="submit">게시글 작성</button>
        </Form>
    );
}
```

```ts
// app/posts/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
    const title = formData.get("title") as string;
    // DB에 저장...
    const newPost = await db.post.create({ data: { title } });
    redirect(`/posts/${newPost.id}`);
}
```

### 주의사항

- `method`, `encType`, `target` props는 지원하지 않음 → 필요 시 HTML `<form>` 사용
- `action`이 함수일 때 `replace`, `scroll` props는 무시됨
- `<input type="file">`은 `action`이 string일 때 파일명만 전송됨

---

## 5. 폰트 (`next/font`)

`next/font`는 폰트를 빌드 타임에 자체 호스팅하여 외부 네트워크 요청을 제거하고 레이아웃 시프트를 방지한다.

### 핵심 규칙

- Google Fonts는 브라우저에서 구글 서버로 요청이 발생하지 않음 (빌드 타임 다운로드)
- **가변 폰트(variable font)** 사용을 권장 (성능과 유연성 우수)
- 가변 폰트가 아닌 경우 `weight` 지정 필수

### Google Fonts 사용

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

// 가변 폰트 — weight 불필요
const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" className={inter.className}>
            <body>{children}</body>
        </html>
    );
}
```

```tsx
// 가변 폰트가 아닌 경우 — weight 필수
import { Roboto } from "next/font/google";

const roboto = Roboto({
    weight: ["400", "700"],
    style: ["normal", "italic"],
    subsets: ["latin"],
    display: "swap",
});
```

> **참고**: 여러 단어 폰트명은 언더스코어 사용. `Roboto Mono` → `Roboto_Mono`

### 로컬 폰트 사용

```tsx
import localFont from "next/font/local";

const myFont = localFont({
    src: "./fonts/MyFont.woff2",
    display: "swap",
});

// 여러 파일로 구성된 폰트 패밀리
const roboto = localFont({
    src: [
        { path: "./Roboto-Regular.woff2", weight: "400", style: "normal" },
        { path: "./Roboto-Bold.woff2", weight: "700", style: "normal" },
    ],
});
```

### Tailwind CSS 연동 (CSS 변수 방식)

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-roboto-mono",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" className={`${inter.variable} ${robotoMono.variable} antialiased`}>
            <body>{children}</body>
        </html>
    );
}
```

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
    --font-sans: var(--font-inter);
    --font-mono: var(--font-roboto-mono);
}
```

```html
<!-- Tailwind 유틸리티 클래스로 사용 -->
<p class="font-sans">본문 텍스트</p>
<code class="font-mono">코드 텍스트</code>
```

### 여러 폰트 중앙 관리 (권장)

동일한 폰트를 여러 곳에서 사용할 경우, 한 파일에서 정의하고 필요한 곳에 임포트한다.

```ts
// styles/fonts.ts
import { Inter, Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export const notoSansKr = Noto_Sans_KR({
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
});
```

```tsx
// app/layout.tsx
import { notoSansKr } from "@/styles/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" className={notoSansKr.className}>
            <body>{children}</body>
        </html>
    );
}
```

---

## 6. 스크립트 (`next/script`)

### strategy 선택 기준

| strategy                    | 로딩 시점                            | 사용 사례                   |
| --------------------------- | ------------------------------------ | --------------------------- |
| `beforeInteractive`         | 서버에서 주입, Next.js 코드보다 먼저 | 봇 감지, 쿠키 동의          |
| `afterInteractive` (기본값) | 클라이언트, 일부 하이드레이션 후     | 태그 매니저, 분석 도구      |
| `lazyOnload`                | 브라우저 유휴 시간                   | 채팅 위젯, 소셜 미디어 버튼 |
| `worker` (실험적)           | 웹 워커 (메인 스레드 분리)           | 무거운 서드파티 스크립트    |

### 핵심 규칙

- `beforeInteractive`는 반드시 **root layout** (`app/layout.tsx`)에만 배치
- `onLoad`, `onReady`, `onError`는 클라이언트 컴포넌트에서만 사용 가능
- `onLoad`는 `beforeInteractive`와 함께 사용 불가 → `onReady` 사용

### afterInteractive (기본)

```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                {children}
                <Script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXX" />
            </body>
        </html>
    );
}
```

### lazyOnload

```tsx
import Script from "next/script";

export default function Page() {
    return (
        <>
            <Script src="https://example.com/chat-widget.js" strategy="lazyOnload" />
        </>
    );
}
```

### beforeInteractive — root layout 전용

```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                {children}
                <Script src="https://example.com/bot-detector.js" strategy="beforeInteractive" />
            </body>
        </html>
    );
}
```

### onLoad / onReady / onError

```tsx
"use client";

import Script from "next/script";
import { useRef } from "react";

export default function MapPage() {
    const mapRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
            <Script
                id="google-maps"
                src="https://maps.googleapis.com/maps/api/js"
                // onReady: 첫 로드 후 + 컴포넌트 재마운트 시마다 실행
                onReady={() => {
                    new google.maps.Map(mapRef.current!, {
                        center: { lat: 37.5665, lng: 126.978 },
                        zoom: 12,
                    });
                }}
                onError={(e) => {
                    console.error("스크립트 로드 실패", e);
                }}
            />
        </>
    );
}
```

| 콜백      | 실행 시점                         | 사용 사례            |
| --------- | --------------------------------- | -------------------- |
| `onLoad`  | 스크립트 로드 완료 시 1회         | 라이브러리 초기화    |
| `onReady` | 로드 완료 + 컴포넌트 재마운트마다 | 지도, 위젯 재초기화  |
| `onError` | 로드 실패 시                      | 에러 로깅, 폴백 처리 |
