import { Suspense } from "react";
import { getProfile, getMeetingStats } from "./actions";
import { ProfileForm } from "@/components/profile-form";
import { LogoutButton } from "@/components/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function ProfileContent() {
    const [profile, stats] = await Promise.all([getProfile(), getMeetingStats()]);

    return (
        <>
            {/* 모임 통계 */}
            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardContent className="pt-5 pb-5 text-center">
                        <p className="text-3xl font-bold">{stats.created}</p>
                        <p className="text-muted-foreground mt-1 text-sm">만든 모임</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-5 text-center">
                        <p className="text-3xl font-bold">{stats.joined}</p>
                        <p className="text-muted-foreground mt-1 text-sm">참여한 모임</p>
                    </CardContent>
                </Card>
            </div>

            {/* 기본 정보 */}
            <Card className="w-full">
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
        </>
    );
}

function ProfileContentSkeleton() {
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
        </>
    );
}

export default function ProfilePage() {
    return (
        <div className="flex w-full flex-1 flex-col gap-5 p-4">
            <div>
                <h1 className="text-2xl font-bold">내 프로필</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    프로필 정보를 조회하고 수정할 수 있습니다.
                </p>
            </div>

            <Suspense fallback={<ProfileContentSkeleton />}>
                <ProfileContent />
            </Suspense>

            {/* 로그아웃 */}
            <LogoutButton />
        </div>
    );
}
