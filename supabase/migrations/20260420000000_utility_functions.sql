-- 유틸리티 DB 함수 생성 마이그레이션
-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Admin 여부 확인 함수 (SECURITY DEFINER로 RLS 순환 참조 방지)
-- profiles 테이블을 직접 조회 (JWT 클레임 방식 사용 금지)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND is_admin = true
    );
$$;
