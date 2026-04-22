"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const supabase = createClient();
            const ext = file.name.split(".").pop();
            const fileName = `${Date.now()}.${ext}`;

            const { error } = await supabase.storage
                .from("meeting-thumbnails")
                .upload(fileName, file, { upsert: true });

            if (error) throw error;

            const {
                data: { publicUrl },
            } = supabase.storage.from("meeting-thumbnails").getPublicUrl(fileName);

            onChange(publicUrl);
        } catch {
            // 업로드 실패 시 무시
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />
            {value ? (
                <div className="relative h-40 w-full overflow-hidden rounded-md border">
                    <Image src={value} alt="썸네일 미리보기" fill className="object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => onChange(null)}
                        disabled={disabled}
                    >
                        <X size={14} />
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="border-muted-foreground/30 hover:border-primary flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <span className="text-muted-foreground text-sm">업로드 중...</span>
                    ) : (
                        <>
                            <ImageIcon size={24} className="text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">
                                클릭하여 이미지 업로드
                            </span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
