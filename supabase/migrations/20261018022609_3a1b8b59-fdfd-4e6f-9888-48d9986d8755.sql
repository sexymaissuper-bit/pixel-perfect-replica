CREATE POLICY server_only_settings ON public.admin_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY server_only_orders ON public.store_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY server_only_events ON public.store_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY server_only_attempts ON public.admin_login_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);