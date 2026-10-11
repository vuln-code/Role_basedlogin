-- TRUSTED ADMINISTRATION ONLY
-- Run in Supabase SQL Editor.
-- All three UUIDs have been configured.

BEGIN;

-- 1. Assign ADMIN role

UPDATE public.profiles
SET
    role = 'ADMIN'::public.app_role,
    manager_id = NULL
WHERE id = '98af2882-2d2d-4fa0-9d62-f93d0457bb3d'::uuid;


-- 2. Assign MANAGER role

UPDATE public.profiles
SET
    role = 'MANAGER'::public.app_role,
    manager_id = NULL
WHERE id = '61312c06-e77e-4328-8645-624ecdc7d1ef'::uuid;


-- 3. Assign USER role and connect USER to MANAGER

UPDATE public.profiles
SET
    role = 'USER'::public.app_role,
    manager_id = '61312c06-e77e-4328-8645-624ecdc7d1ef'::uuid
WHERE id = 'a6defbc6-ea96-4711-aad5-71e9d52181a5'::uuid;


-- 4. Verify all three accounts

SELECT
    id,
    full_name,
    email,
    role,
    manager_id
FROM public.profiles
WHERE id IN (
    '98af2882-2d2d-4fa0-9d62-f93d0457bb3d'::uuid,
    '61312c06-e77e-4328-8645-624ecdc7d1ef'::uuid,
    'a6defbc6-ea96-4711-aad5-71e9d52181a5'::uuid
)
ORDER BY role;

COMMIT;