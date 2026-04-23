-- settlements 테이블 생성 (모임당 정산 1개 제약)
-- UNIQUE(meeting_id)로 모임당 정산 1개 비즈니스 규칙 DB 레벨 강제
CREATE TABLE IF NOT EXISTS public.settlements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    total_amount integer NOT NULL CHECK (total_amount > 0),
    split_type text NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'manual')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(meeting_id)
);

-- settlements updated_at 자동 갱신 트리거
CREATE TRIGGER set_settlements_updated_at
    BEFORE UPDATE ON public.settlements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- settlement_items 테이블 생성 (정산 항목)
CREATE TABLE IF NOT EXISTS public.settlement_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id uuid NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
    label text NOT NULL,
    amount integer NOT NULL CHECK (amount > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- settlement_items 인덱스
CREATE INDEX IF NOT EXISTS settlement_items_settlement_id_idx
    ON public.settlement_items (settlement_id);

-- settlement_participants 테이블 생성 (정산 참가자별 금액)
CREATE TABLE IF NOT EXISTS public.settlement_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id uuid NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_due integer NOT NULL CHECK (amount_due >= 0),
    is_paid boolean NOT NULL DEFAULT false,
    paid_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(settlement_id, user_id)
);

-- settlement_participants 인덱스
CREATE INDEX IF NOT EXISTS settlement_participants_settlement_id_idx
    ON public.settlement_participants (settlement_id);
CREATE INDEX IF NOT EXISTS settlement_participants_user_id_idx
    ON public.settlement_participants (user_id);
