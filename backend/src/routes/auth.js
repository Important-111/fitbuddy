const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { success, error } = require('../utils/response');

const router = express.Router();

const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new user with openid, password, and optional nickname.
 * Body: { openid, password, nickname? }
 */
router.post('/register', async (req, res, next) => {
  try {
    const { openid, password, nickname } = req.body;

    if (!openid || !password) {
      return error(res, 'openid and password are required');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return error(res, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const existing = await query('SELECT user_id FROM users WHERE openid = $1', [openid]);
    if (existing.rows.length > 0) {
      return error(res, 'Account already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await query(
      `INSERT INTO users (openid, nickname, password_hash, status, created_at, updated_at)
       VALUES ($1, $2, $3, 1, NOW(), NOW())
       RETURNING user_id, openid, nickname, created_at`,
      [openid, nickname || openid, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

    return success(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Log in with openid and password. The password is verified against
 * the bcrypt hash stored in users.password_hash.
 *
 * Accounts created before migration_003 have no hash on record; those
 * logins are rejected instead of being silently allowed.
 *
 * Body: { openid, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { openid, password } = req.body;

    if (!openid || !password) {
      return error(res, 'openid and password are required');
    }

    const result = await query(
      `SELECT user_id, openid, nickname, avatar_url, phone, status, password_hash
       FROM users WHERE openid = $1`,
      [openid]
    );

    if (result.rows.length === 0) {
      return error(res, 'Invalid credentials', 401);
    }

    const user = result.rows[0];

    if (user.status === 0) {
      return error(res, 'Account has been disabled', 403);
    }

    // 历史账号（迁移前创建）没有密码哈希，不能放行
    if (!user.password_hash) {
      return error(res, 'Account has no password set, please reset it', 401);
    }

    const matched = await bcrypt.compare(password, user.password_hash);
    if (!matched) {
      return error(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user.user_id);
    const { password_hash, ...safeUser } = user;

    return success(res, { user: safeUser, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
