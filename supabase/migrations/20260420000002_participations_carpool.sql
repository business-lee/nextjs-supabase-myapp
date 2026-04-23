-- participations 테이블 생성 (참가 신청 관리)
-- UNIQUE(meeting_id, user_id)로 중복 신청 DB 레벨 방지
CREATE TABLE IF NOT EXISTS public.participations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
    waitlist_order integer CHECK (waitlist_order > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(meeting_id, user_id)
);

-- 대기자 자동 승급 로직 성능을 위한 부분 인덱스
CREATE INDEX IF NOT EXISTS participations_waitlist_idx
    ON public.participations (meeting_id, waitlist_order)
    WHERE waitlist_order IS NOT NULL;

-- carpool_drivers 테이블 생성 (카풀 드라이버 등록)
CREATE TABLE IF NOT EXISTS public.carpool_drivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    departure_location text NOT NULL,
    departure_at timestamptz NOT NULL,
    available_seats integer NOT NULL CHECK (available_seats >= 1 AND available_seats <= 8),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(meeting_id, driver_id)
);

-- carpool_passengers 테이블 생성 (카풀 탑승 신청)
CREATE TABLE IF NOT EXISTS public.carpool_passengers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    carpool_driver_id uuid NOT NULL REFERENCES public.carpool_drivers(id) ON DELETE CASCADE,
    passenger_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(carpool_driver_id, passenger_id)
);
