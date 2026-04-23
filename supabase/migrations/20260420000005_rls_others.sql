-- ============================================================
-- participations RLS 정책
-- ============================================================

-- 본인 행 INSERT (자신의 신청만 가능)
CREATE POLICY participations_self_insert
    ON public.participations
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 본인 행 UPDATE (자신의 참가 신청 수정)
CREATE POLICY participations_self_update
    ON public.participations
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 주최자: 해당 모임 참가자 목록 SELECT
CREATE POLICY participations_host_select
    ON public.participations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = participations.meeting_id
              AND host_id = auth.uid()
        )
    );

-- 주최자: 참가 신청 상태 UPDATE (승인/거절 처리)
CREATE POLICY participations_host_update
    ON public.participations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = participations.meeting_id
              AND host_id = auth.uid()
        )
    );

-- 본인 행 SELECT (자신의 참가 현황 확인)
CREATE POLICY participations_self_select
    ON public.participations
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Admin 전체 접근
CREATE POLICY participations_admin_all
    ON public.participations
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- notices RLS 정책
-- ============================================================

-- 주최자 전체 CRUD (INSERT, UPDATE, DELETE 포함)
CREATE POLICY notices_host_all
    ON public.notices
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = notices.meeting_id
              AND host_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = notices.meeting_id
              AND host_id = auth.uid()
        )
    );

-- approved 참여자 SELECT (participations 서브쿼리 조인)
CREATE POLICY notices_approved_select
    ON public.notices
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.participations
            WHERE meeting_id = notices.meeting_id
              AND user_id = auth.uid()
              AND status = 'approved'
        )
    );

-- Admin 전체 접근
CREATE POLICY notices_admin_all
    ON public.notices
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- carpool_drivers RLS 정책
-- ============================================================

-- approved 참여자만 드라이버 등록 가능 (driver_id = auth.uid() + approved 체크)
CREATE POLICY carpool_drivers_approved_insert
    ON public.carpool_drivers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        driver_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.participations
            WHERE meeting_id = carpool_drivers.meeting_id
              AND user_id = auth.uid()
              AND status = 'approved'
        )
    );

-- approved 참여자 + 주최자 SELECT
CREATE POLICY carpool_drivers_participant_select
    ON public.carpool_drivers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.participations
            WHERE meeting_id = carpool_drivers.meeting_id
              AND user_id = auth.uid()
              AND status = 'approved'
        )
        OR EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = carpool_drivers.meeting_id
              AND host_id = auth.uid()
        )
    );

-- 본인(드라이버)만 UPDATE
CREATE POLICY carpool_drivers_self_update
    ON public.carpool_drivers
    FOR UPDATE
    TO authenticated
    USING (driver_id = auth.uid())
    WITH CHECK (driver_id = auth.uid());

-- 본인(드라이버)만 DELETE
CREATE POLICY carpool_drivers_self_delete
    ON public.carpool_drivers
    FOR DELETE
    TO authenticated
    USING (driver_id = auth.uid());

-- Admin 전체 접근
CREATE POLICY carpool_drivers_admin_all
    ON public.carpool_drivers
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- carpool_passengers RLS 정책
-- ============================================================

-- 본인이 approved 참여자인 경우 탑승 신청 INSERT
CREATE POLICY carpool_passengers_self_insert
    ON public.carpool_passengers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        passenger_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.carpool_drivers cd
            JOIN public.participations p ON p.meeting_id = cd.meeting_id
            WHERE cd.id = carpool_passengers.carpool_driver_id
              AND p.user_id = auth.uid()
              AND p.status = 'approved'
        )
    );

-- 드라이버가 탑승 신청 수락/거절 UPDATE
CREATE POLICY carpool_passengers_driver_update
    ON public.carpool_passengers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.carpool_drivers
            WHERE id = carpool_passengers.carpool_driver_id
              AND driver_id = auth.uid()
        )
    );

-- 본인 탑승 신청 취소 DELETE
CREATE POLICY carpool_passengers_self_delete
    ON public.carpool_passengers
    FOR DELETE
    TO authenticated
    USING (passenger_id = auth.uid());

-- 드라이버 + 본인 SELECT
CREATE POLICY carpool_passengers_select
    ON public.carpool_passengers
    FOR SELECT
    TO authenticated
    USING (
        passenger_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.carpool_drivers
            WHERE id = carpool_passengers.carpool_driver_id
              AND driver_id = auth.uid()
        )
    );

-- Admin 전체 접근
CREATE POLICY carpool_passengers_admin_all
    ON public.carpool_passengers
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- settlements RLS 정책
-- ============================================================

-- 주최자 전체 CRUD
CREATE POLICY settlements_host_all
    ON public.settlements
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = settlements.meeting_id
              AND host_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE id = settlements.meeting_id
              AND host_id = auth.uid()
        )
    );

-- approved 참여자 SELECT
CREATE POLICY settlements_approved_select
    ON public.settlements
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.participations
            WHERE meeting_id = settlements.meeting_id
              AND user_id = auth.uid()
              AND status = 'approved'
        )
    );

-- Admin 전체 접근
CREATE POLICY settlements_admin_all
    ON public.settlements
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- settlement_items RLS 정책
-- ============================================================

-- 주최자 전체 CRUD
CREATE POLICY settlement_items_host_all
    ON public.settlement_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.settlements s
            JOIN public.meetings m ON m.id = s.meeting_id
            WHERE s.id = settlement_items.settlement_id
              AND m.host_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.settlements s
            JOIN public.meetings m ON m.id = s.meeting_id
            WHERE s.id = settlement_items.settlement_id
              AND m.host_id = auth.uid()
        )
    );

-- approved 참여자 SELECT
CREATE POLICY settlement_items_approved_select
    ON public.settlement_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.settlements s
            JOIN public.participations p ON p.meeting_id = s.meeting_id
            WHERE s.id = settlement_items.settlement_id
              AND p.user_id = auth.uid()
              AND p.status = 'approved'
        )
    );

-- Admin 전체 접근
CREATE POLICY settlement_items_admin_all
    ON public.settlement_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- settlement_participants RLS 정책
-- ============================================================

-- 주최자 전체 CRUD
CREATE POLICY settlement_participants_host_all
    ON public.settlement_participants
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.settlements s
            JOIN public.meetings m ON m.id = s.meeting_id
            WHERE s.id = settlement_participants.settlement_id
              AND m.host_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.settlements s
            JOIN public.meetings m ON m.id = s.meeting_id
            WHERE s.id = settlement_participants.settlement_id
              AND m.host_id = auth.uid()
        )
    );

-- 본인 행 SELECT (자신의 정산 금액 확인)
CREATE POLICY settlement_participants_self_select
    ON public.settlement_participants
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 본인 행 UPDATE (납부 완료 체크)
CREATE POLICY settlement_participants_self_update
    ON public.settlement_participants
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admin 전체 접근
CREATE POLICY settlement_participants_admin_all
    ON public.settlement_participants
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
