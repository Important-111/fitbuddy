-- ============================================================
-- FitBuddy - 迁移 003：为 users 表补上 password_hash 字段
-- ============================================================
-- 背景（真实缺陷）：
--   migration_001 建表时 users 表没有密码字段，导致
--     1) /api/auth/register 用 bcrypt 算出的哈希无处存放，被直接丢弃；
--     2) /api/auth/login 无法校验密码，只能"openid 对得上就签发 JWT"，
--        等于任何人知道 openid 即可登录冒充。
-- 本迁移补上字段，配合 auth.js 的真正校验修复该漏洞。
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

COMMENT ON COLUMN users.password_hash IS
  'bcrypt 密码哈希。为 NULL 表示历史账号未设置密码，登录会被拒绝';
