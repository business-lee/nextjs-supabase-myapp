import { LoginForm } from "@/components/login-form";

type Props = {
    searchParams: Promise<{ redirect?: string }>;
};

export default async function Page({ searchParams }: Props) {
    const { redirect: redirectTo } = await searchParams;
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm redirectTo={redirectTo} />
            </div>
        </div>
    );
}
