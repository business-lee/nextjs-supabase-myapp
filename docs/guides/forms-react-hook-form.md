# React Hook Form + Zod + Server Actions 폼 처리 가이드

> **버전**: Next.js 16.2.3 / react-hook-form ^7 / zod ^3  
> **최종 업데이트**: 2026-04-14  
> **목적**: React Hook Form + Zod + Server Actions 조합의 최적 폼 처리 패턴 정리

---

## 1. 개요

| 도구                    | 역할                                       |
| ----------------------- | ------------------------------------------ |
| **React Hook Form**     | 폼 상태 관리, 제출 처리, 성능 최적화       |
| **Zod**                 | 스키마 기반 타입 안전 유효성 검사          |
| **@hookform/resolvers** | React Hook Form ↔ Zod 연결 브릿지          |
| **Server Actions**      | 서버에서 폼 데이터 처리 (DB 저장, 인증 등) |

**이 조합을 사용하는 이유:**

- 불필요한 리렌더링 없이 고성능 폼 관리 (React Hook Form)
- 클라이언트/서버 모두에서 동일한 스키마로 검증 (Zod)
- API 라우트 없이 서버 로직 직접 호출 (Server Actions)

---

## 2. 설치

```bash
npm install react-hook-form @hookform/resolvers zod
```

---

## 3. 핵심 규칙 요약

| 규칙           | 내용                                                              |
| -------------- | ----------------------------------------------------------------- |
| 폼 컴포넌트    | 반드시 `'use client'` 선언                                        |
| 스키마 타입    | `z.infer<typeof formSchema>`로 타입 추론                          |
| `any` 타입     | 사용 금지 — Zod 스키마로 타입 보장                                |
| `enum` 타입    | 사용 금지 — `z.union([z.literal(...)])` 또는 `z.enum([...])` 사용 |
| 검증 모드      | 기본값 `"onSubmit"`, UX 고려 시 `"onBlur"`                        |
| 에러 표시      | `data-invalid` + `aria-invalid` + `<FieldError />` 세트로 처리    |
| Server Actions | `useTransition` + `startTransition`으로 비동기 처리               |
| 배열 필드 key  | 반드시 `field.id` 사용 (인덱스 사용 금지)                         |

---

## 4. Zod 스키마 작성

### 4-1. 기본 스키마

```tsx
import * as z from "zod";

const formSchema = z.object({
    title: z
        .string()
        .min(5, "제목은 최소 5자 이상이어야 합니다.")
        .max(32, "제목은 최대 32자까지 입력할 수 있습니다."),
    description: z
        .string()
        .min(20, "내용은 최소 20자 이상이어야 합니다.")
        .max(100, "내용은 최대 100자까지 입력할 수 있습니다."),
    email: z.string().email("올바른 이메일 형식이 아닙니다."),
    age: z.number().min(0).max(120),
    isActive: z.boolean(),
    language: z.string().optional(),
});
```

### 4-2. 고급 스키마 패턴

```tsx
// 비밀번호 확인 — superRefine으로 교차 필드 검증
const passwordSchema = z
    .object({
        password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
        confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "비밀번호가 일치하지 않습니다.",
                path: ["confirmPassword"],
            });
        }
    });

// 선택적 문자열 (빈 문자열 허용)
const optionalString = z.string().optional().or(z.literal(""));

// 숫자 입력 (input은 항상 string → 변환 필요)
const numberField = z.coerce.number().min(1, "1 이상의 숫자를 입력하세요.");
```

### 4-3. 배열 스키마

```tsx
const formSchema = z.object({
    emails: z
        .array(
            z.object({
                address: z.string().email("올바른 이메일 형식이 아닙니다."),
            }),
        )
        .min(1, "이메일을 최소 1개 이상 추가하세요.")
        .max(5, "이메일은 최대 5개까지 추가할 수 있습니다."),
});
```

---

## 5. useForm 설정

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
    title: z.string().min(5, "제목은 최소 5자 이상이어야 합니다."),
    description: z.string().min(20, "내용은 최소 20자 이상이어야 합니다."),
});

// z.infer로 타입 자동 추론 — 별도 타입 선언 불필요
type FormValues = z.infer<typeof formSchema>;

export function ExampleForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
        mode: "onBlur", // 검증 모드 설정 (기본값: "onSubmit")
    });

    function onSubmit(data: FormValues) {
        console.log(data);
    }

    return <form onSubmit={form.handleSubmit(onSubmit)}>{/* 필드 구성 */}</form>;
}
```

---

## 6. 검증 모드

```tsx
const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur", // 검증 시점 설정
});
```

| 모드          | 검증 시점               | 권장 상황                       |
| ------------- | ----------------------- | ------------------------------- |
| `"onSubmit"`  | 제출 시 (기본값)        | 간단한 폼                       |
| `"onBlur"`    | 필드에서 포커스 이탈 시 | 일반적인 회원가입/설정 폼       |
| `"onChange"`  | 입력 변경마다           | 실시간 검증이 필요한 경우       |
| `"onTouched"` | 첫 blur 이후 변경마다   | `"onChange"`보다 덜 공격적인 UX |
| `"all"`       | blur + change 모두      | 엄격한 검증이 필요한 경우       |

---

## 7. 필드 타입별 패턴

> **공통 규칙**: `<Field data-invalid={fieldState.invalid}>` + 컨트롤에 `aria-invalid={fieldState.invalid}`

### 7-1. Input (텍스트 입력)

```tsx
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Controller
    name="title"
    control={form.control}
    render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>제목</FieldLabel>
            <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="제목을 입력하세요"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
    )}
/>;
```

### 7-2. Textarea

```tsx
import { Textarea } from "@/components/ui/textarea";

<Controller
    name="description"
    control={form.control}
    render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>내용</FieldLabel>
            <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="내용을 입력하세요"
                className="min-h-[120px]"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
    )}
/>;
```

### 7-3. Select

`field.value`와 `field.onChange`를 `<Select />`에 직접 연결합니다.

```tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

<Controller
    name="language"
    control={form.control}
    render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>언어</FieldLabel>
            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
    )}
/>;
```

### 7-4. Checkbox (배열)

체크박스 배열은 `field.value`를 배열로 관리하며, `includes`/`filter`로 값을 추가/제거합니다.

```tsx
import { Checkbox } from "@/components/ui/checkbox"

const items = [
    { id: "news", label: "뉴스 알림" },
    { id: "updates", label: "업데이트 알림" },
]

<Controller
    name="notifications"
    control={form.control}
    render={({ field, fieldState }) => (
        <FieldSet>
            <FieldLegend variant="label">알림 설정</FieldLegend>
            <FieldGroup data-slot="checkbox-group">
                {items.map((item) => (
                    <Field
                        key={item.id}
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                    >
                        <Checkbox
                            id={`notification-${item.id}`}
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value.includes(item.id)}
                            onCheckedChange={(checked) => {
                                const newValue = checked
                                    ? [...field.value, item.id]
                                    : field.value.filter((v) => v !== item.id)
                                field.onChange(newValue)
                            }}
                        />
                        <FieldLabel htmlFor={`notification-${item.id}`}>
                            {item.label}
                        </FieldLabel>
                    </Field>
                ))}
            </FieldGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </FieldSet>
    )}
/>
```

### 7-5. RadioGroup

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const plans = [
    { id: "free", label: "무료" },
    { id: "pro", label: "프로" },
]

<Controller
    name="plan"
    control={form.control}
    render={({ field, fieldState }) => (
        <FieldSet>
            <FieldLegend>요금제</FieldLegend>
            <RadioGroup
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
            >
                {plans.map((plan) => (
                    <Field
                        key={plan.id}
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                    >
                        <RadioGroupItem
                            value={plan.id}
                            id={`plan-${plan.id}`}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldLabel htmlFor={`plan-${plan.id}`}>
                            {plan.label}
                        </FieldLabel>
                    </Field>
                ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </FieldSet>
    )}
/>
```

### 7-6. Switch

```tsx
import { Switch } from "@/components/ui/switch";

<Controller
    name="twoFactor"
    control={form.control}
    render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <FieldContent>
                <FieldLabel htmlFor={field.name}>2단계 인증</FieldLabel>
                <FieldDescription>
                    계정 보안을 강화하려면 2단계 인증을 활성화하세요.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Switch
                id={field.name}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
            />
        </Field>
    )}
/>;
```

---

## 8. 에러 표시

에러 표시는 반드시 세 가지를 세트로 적용합니다.

```tsx
// 1. Field 컨테이너에 data-invalid
<Field data-invalid={fieldState.invalid}>

// 2. 폼 컨트롤(Input, Select 등)에 aria-invalid
<Input aria-invalid={fieldState.invalid} />

// 3. 조건부 FieldError 렌더링
{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
```

**`FieldDescription`은 에러가 없을 때도 항상 렌더링합니다:**

```tsx
<Field data-invalid={fieldState.invalid}>
    <FieldLabel>이름</FieldLabel>
    <Input {...field} aria-invalid={fieldState.invalid} />
    <FieldDescription>실명을 입력하세요.</FieldDescription>
    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
</Field>
```

---

## 9. 배열 필드 (useFieldArray)

### 기본 설정

```tsx
import { useFieldArray, useForm } from "react-hook-form";

const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emails", // 스키마의 배열 필드명
});
```

### 항목 추가 / 제거

```tsx
// 추가
<Button
    type="button"
    variant="outline"
    onClick={() => append({ address: "" })}
    disabled={fields.length >= 5}
>
    이메일 추가
</Button>;

// 제거 (항목이 2개 이상일 때만 표시)
{
    fields.length > 1 && (
        <Button type="button" variant="ghost" onClick={() => remove(index)}>
            삭제
        </Button>
    );
}
```

### 배열 Controller 패턴

```tsx
{
    fields.map((field, index) => (
        <Controller
            key={field.id} // 반드시 field.id 사용 (index 사용 금지)
            name={`emails.${index}.address`}
            control={form.control}
            render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <Input
                        {...controllerField}
                        id={`email-${index}`}
                        aria-invalid={fieldState.invalid}
                        type="email"
                        placeholder="name@example.com"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    ));
}
```

---

## 10. 폼 리셋

```tsx
// 기본값으로 리셋
<Button type="button" variant="outline" onClick={() => form.reset()}>
    초기화
</Button>;

// 특정 값으로 리셋 (예: 서버에서 받아온 데이터로)
form.reset({
    title: "새 제목",
    description: "새 내용",
});
```

---

## 11. Server Actions 연동

Server Actions는 `useTransition`으로 비동기 처리합니다. 폼 검증은 클라이언트(Zod)에서 먼저 수행되고, 통과한 데이터만 서버로 전달됩니다.

### 클라이언트 폼 컴포넌트

```tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createPostAction } from "@/app/actions/post";

const formSchema = z.object({
    title: z.string().min(5, "제목은 최소 5자 이상이어야 합니다."),
    content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다."),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePostForm() {
    const [isPending, startTransition] = useTransition();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", content: "" },
    });

    function onSubmit(data: FormValues) {
        startTransition(async () => {
            const result = await createPostAction(data);
            if (result.error) {
                form.setError("root", { message: result.error });
            } else {
                form.reset();
            }
        });
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* 서버 에러 표시 */}
            {form.formState.errors.root && (
                <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
            )}
            {/* 필드 구성 */}
            <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
            </Button>
        </form>
    );
}
```

### Server Action 함수

```tsx
// app/actions/post.ts
"use server";

import * as z from "zod";

const formSchema = z.object({
    title: z.string().min(5),
    content: z.string().min(10),
});

export async function createPostAction(
    data: z.infer<typeof formSchema>,
): Promise<{ error?: string }> {
    // 서버 측에서도 Zod로 재검증 (보안)
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
        return { error: "잘못된 데이터입니다." };
    }

    try {
        // DB 저장 로직
        return {};
    } catch {
        return { error: "저장에 실패했습니다." };
    }
}
```

---

## 12. Next.js Server Actions 설정

`next.config.ts`에서 Server Actions 동작을 설정할 수 있습니다.

```ts
// next.config.ts
const nextConfig = {
    experimental: {
        serverActions: {
            // 외부 도메인에서 Server Actions 호출 허용 (프록시 사용 시)
            allowedOrigins: ["my-proxy.com", "*.my-proxy.com"],

            // 요청 바디 최대 크기 (기본값: 1MB)
            // 파일 업로드 등 대용량 데이터 전송 시 증가
            bodySizeLimit: "2mb",
        },
    },
};

export default nextConfig;
```

| 옵션             | 기본값           | 설명                                          |
| ---------------- | ---------------- | --------------------------------------------- |
| `allowedOrigins` | 동일 출처만 허용 | CSRF 방지를 위한 허용 도메인 목록             |
| `bodySizeLimit`  | `"1mb"`          | 요청 바디 최대 크기 (bytes, kb, mb 단위 지원) |

---

## 13. 자주 하는 실수 & 주의사항

### ❌ 배열 필드 key에 index 사용

```tsx
// 잘못된 방법 — 항목 추가/삭제 시 렌더링 오류 발생
{fields.map((field, index) => (
    <Controller key={index} ... />
))}

// 올바른 방법
{fields.map((field, index) => (
    <Controller key={field.id} ... />
))}
```

### ❌ Select/Switch에 field 스프레드

```tsx
// 잘못된 방법 — Select는 spread 불가
<Select {...field}>

// 올바른 방법 — value와 onValueChange 명시적 전달
<Select value={field.value} onValueChange={field.onChange}>
```

### ❌ 숫자 입력 타입 불일치

```tsx
// HTML input은 항상 string 반환 — z.number()만 쓰면 검증 실패
const schema = z.object({ age: z.number() });

// 올바른 방법 — z.coerce.number()로 자동 변환
const schema = z.object({ age: z.coerce.number().min(0) });
```

### ❌ Server Actions에서 검증 생략

```tsx
// 클라이언트 검증만 믿으면 보안 취약 — 서버에서도 반드시 재검증
export async function action(data: FormValues) {
    const parsed = formSchema.safeParse(data); // 서버 측 재검증 필수
    if (!parsed.success) return { error: "잘못된 데이터" };
    // ...
}
```

### ❌ form.formState를 구조 분해하지 않고 사용

```tsx
// 잘못된 방법 — 리렌더링 최적화 불가
const formState = form.formState;

// 올바른 방법 — 필요한 것만 구조 분해
const { isSubmitting, errors } = form.formState;
```
