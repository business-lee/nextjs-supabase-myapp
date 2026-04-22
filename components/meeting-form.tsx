"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { meetingSchema, type MeetingFormValues } from "@/lib/validations/meeting";
import type { Resolver } from "react-hook-form";
import { APPROVAL_TYPE } from "@/types/domain";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";

interface MeetingFormProps {
    isEditMode?: boolean;
    defaultValues?: Partial<MeetingFormValues>;
    meetingId?: string;
}

export function MeetingForm({ isEditMode = false, defaultValues, meetingId }: MeetingFormProps) {
    const router = useRouter();

    // z.coerce 타입과 zodResolver 간 타입 충돌 방지를 위해 명시적 캐스팅
    const form = useForm<MeetingFormValues, object, MeetingFormValues>({
        resolver: zodResolver(meetingSchema) as Resolver<MeetingFormValues>,
        defaultValues: {
            title: "",
            description: "",
            event_at: "",
            location: "",
            max_participants: undefined,
            entry_fee: 0,
            approval_type: APPROVAL_TYPE.AUTO,
            thumbnail_url: null,
            ...defaultValues,
        },
    });

    function onSubmit(values: MeetingFormValues) {
        // Phase 3에서 실제 API 연동 예정, 현재는 더미 처리
        console.log("폼 제출 값:", values);
        toast.success(isEditMode ? "모임이 수정되었습니다." : "모임이 생성되었습니다.");
        router.push("/protected");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* 모임 제목 */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>모임 제목 *</FormLabel>
                            <FormControl>
                                <Input placeholder="모임 제목을 입력해주세요" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 날짜 및 시간 */}
                <FormField
                    control={form.control}
                    name="event_at"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>날짜 및 시간 *</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 장소 */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>장소</FormLabel>
                            <FormControl>
                                <Input placeholder="모임 장소를 입력해주세요" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* 최대 인원 */}
                    <FormField
                        control={form.control}
                        name="max_participants"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>최대 인원</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="제한 없음"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 참가비 */}
                    <FormField
                        control={form.control}
                        name="entry_fee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>참가비 (원)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* 승인 방식 */}
                <FormField
                    control={form.control}
                    name="approval_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>승인 방식 *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="승인 방식 선택" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={APPROVAL_TYPE.AUTO}>
                                        자동 승인 (선착순)
                                    </SelectItem>
                                    <SelectItem value={APPROVAL_TYPE.MANUAL}>
                                        수동 승인 (주최자 확인)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 썸네일 이미지 */}
                <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>썸네일 이미지</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 모임 설명 */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>모임 설명</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="모임에 대한 설명을 입력해주세요"
                                    className="resize-none"
                                    rows={4}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.back()}
                    >
                        취소
                    </Button>
                    <Button type="submit" className="flex-1">
                        {isEditMode ? "수정 완료" : "모임 만들기"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
