// protected 영역 레이아웃 - 상단 네비게이션과 하단 네비게이션은 (main)/layout.tsx에서 처리

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
