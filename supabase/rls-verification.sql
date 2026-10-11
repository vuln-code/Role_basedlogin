-- RLS VERIFICATION TEMPLATE
-- Run each section separately in a disposable/test Supabase project after
-- replacing UUID placeholders with your three demonstration account IDs.
-- The transaction rolls back and does not alter project data.

begin;
set local role authenticated;

-- Choose ONE identity per run by uncommenting it.
-- select set_config('request.jwt.claim.sub', 'ADMIN-UUID-HERE', true);
-- select set_config('request.jwt.claim.sub', 'MANAGER-UUID-HERE', true);
-- select set_config('request.jwt.claim.sub', 'USER-UUID-HERE', true);

-- ADMIN expectation: all profiles.
-- MANAGER expectation: own row plus rows whose manager_id is this manager.
-- USER expectation: own row only.
select id, full_name, email, role, manager_id from public.profiles order by role, email;

-- All browser mutations must fail with "permission denied" because authenticated
-- has no INSERT, UPDATE, or DELETE table privilege. Test one statement at a time.
-- update public.profiles set role = 'ADMIN' where id = auth.uid();
-- update public.profiles set manager_id = auth.uid() where id = auth.uid();
-- delete from public.profiles where id = auth.uid();

rollback;

-- Anonymous check (run separately): must fail with permission denied.
-- begin;
-- set local role anon;
-- select * from public.profiles;
-- rollback;
