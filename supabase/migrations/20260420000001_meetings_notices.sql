-- meetings 테이블 생성
-- enum 타입 금지 정책에 따라 CHECK 제약으로 상태값 관리
CREATE TABLE IF NOT EXISTS public.meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    event_at timestamptz NOT NULL,
    location text,
    max_participants integer CHECK (max_participants > 0),
    entry_fee integer NOT NULL DEFAULT 0 CHECK (entry_fee >= 0),
    approval_type text NOT NULL DEFAULT 'auto' CHECK (approval_type IN ('auto', 'manual')),
    carpool_enabled boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'closed', 'cancelled')),
    invite_token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- meetings 인덱스 생성
CREATE INDEX IF NOT EXISTS meetings_host_id_idx ON public.meetings (host_id);
CREATE INDEX IF NOT EXISTS meetings_status_idx ON public.meetings (status);
CREATE INDEX IF NOT EXISTS meetings_event_at_idx ON public.meetings (event_at);

-- meetings updated_at 자동 갱신 트리거
CREATE TRIGGER set_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- notices 테이블 생성
CREATE TABLE IF NOT EXISTS public.notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    is_pinned boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- notices 인덱스 생성
CREATE INDEX IF NOT EXISTS notices_meeting_id_idx ON public.notices (meeting_id);
CREATE INDEX IF NOT EXISTS notices_is_pinned_idx ON public.notices (is_pinned);

-- notices updated_at 자동 갱신 트리거
CREATE TRIGGER set_notices_updated_at
    BEFORE UPDATE ON public.notices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
