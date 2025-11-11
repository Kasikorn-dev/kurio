-- Verify trigger exists on auth.users
-- Run this in SQL Editor to check if trigger is created

-- ตรวจสอบว่า Trigger มีอยู่จริง (แม้จะไม่แสดงใน UI)
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    CASE tgenabled 
        WHEN 'O' THEN 'Enabled'
        WHEN 'D' THEN 'Disabled'
        ELSE 'Unknown'
    END AS enabled_status,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ตรวจสอบ Function ที่ trigger ใช้
SELECT 
    proname AS function_name,
    pronamespace::regnamespace AS schema_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname = 'handle_new_user';

