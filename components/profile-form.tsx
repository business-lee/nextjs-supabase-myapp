"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/app/(main)/protected/profile/actions";
import { type Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const profileFormSchema = z.object({
    full_name: z.string().max(50, "이름은 50자를 초과할 수 없습니다.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    profile: ProfileRow;
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: profile.full_name ?? "",
        },
    });

    const onSubmit = async (values: ProfileFormValues) => {
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await updateProfile({
                full_name: values.full_name || null,
            });

            setMessage({
                type: result.success ? "success" : "error",
                text: result.message,
            });
        } catch {
            setMessage({ type: "error", text: "예기치 않은 오류가 발생했습니다." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 이메일 (수정 불가) */}
                <div className="space-y-2">
                    <FormLabel>이메일</FormLabel>
                    <Input value={profile.email} disabled className="bg-muted" />
                    <FormDescription>이메일은 변경할 수 없습니다.</FormDescription>
                </div>

                {/* 이름 */}
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>이름</FormLabel>
                            <FormControl>
                                <Input placeholder="홍길동" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 결과 메시지 */}
                {message && (
                    <p
                        className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}
                    >
                        {message.text}
                    </p>
                )}

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "저장 중..." : "프로필 저장"}
                </Button>
            </form>
        </Form>
    );
}
