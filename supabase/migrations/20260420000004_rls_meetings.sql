-- 8개 신규 테이블 RLS 활성화
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_participants ENABLE ROW LEVEL SECURITY;

-- meetings RLS 정책 설정
-- 비로그인(anon) 포함 SELECT 전체 허용 (F005: 초대 링크 비로그인 접근 요구사항)
CREATE POLICY meetings_anon_select
    ON public.meetings
    FOR SELECT
    TO anon
    USING (true);

-- 인증된 사용자 SELECT 허용
CREATE POLICY meetings_auth_select
    ON public.meetings
    FOR SELECT
    TO authenticated
    USING (true);

-- 주최자(host_id = auth.uid()) INSERT 허용
CREATE POLICY meetings_host_insert
    ON public.meetings
    FOR INSERT
    TO authenticated
    WITH CHECK (host_id = auth.uid());

-- 주최자 UPDATE 허용
CREATE POLICY meetings_host_update
    ON public.meetings
    FOR UPDATE
    TO authenticated
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

-- 주최자 DELETE 허용
CREATE POLICY meetings_host_delete
    ON public.meetings
    FOR DELETE
    TO authenticated
    USING (host_id = auth.uid());

-- Admin 전체 접근 (is_admin() SECURITY DEFINER 함수 활용)
CREATE POLICY meetings_admin_all
    ON public.meetings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
