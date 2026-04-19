import { Suspense } from "react";
import { getProfile } from "./actions";
import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 프로필 데이터를 조회하고 폼을 렌더링하는 서버 컴포넌트
 * Suspense 내부에서 실행되어 동적 데이터 접근이 허용됩니다.
 */
async function ProfileContent() {
    const profile = await getProfile();

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>
                    가입일: {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm profile={profile} />
            </CardContent>
        </Card>
    );
}

/**
 * 프로필 페이지
 * ProfileContent를 Suspense로 감싸 동적 데이터 접근을 허용합니다.
 */
export default function ProfilePage() {
    return (
        <div className="flex w-full flex-1 flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold">내 프로필</h1>
                <p className="text-muted-foreground mt-2">
                    프로필 정보를 조회하고 수정할 수 있습니다.
                </p>
            </div>

            <Suspense
                fallback={
                    <Card className="w-full max-w-2xl">
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-sm">프로필을 불러오는 중...</p>
                        </CardContent>
                    </Card>
                }
            >
                <ProfileContent />
            </Suspense>
        </div>
    );
}
