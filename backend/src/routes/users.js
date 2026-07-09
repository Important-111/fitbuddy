const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get the authenticated user's profile.
 */
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT user_id, openid, nickname, avatar_url, gender, phone, birthday,
              height, weight, target_weight, fitness_level, membership_type, status,
              created_at, updated_at
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'User not found');
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/profile
 * Update the authenticated user's profile.
 * Body: partial user fields (nickname, avatar_url, gender, phone, birthday,
 *       height, weight, target_weight, fitness_level)
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const allowedFields = [
      'nickname', 'avatar_url', 'gender', 'phone', 'birthday',
      'height', 'weight', 'target_weight', 'fitness_level',
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(req.body[field]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return error(res, 'No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.user.user_id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${idx}
       RETURNING user_id, openid, nickname, avatar_url, gender, phone, birthday,
                 height, weight, target_weight, fitness_level, membership_type, status,
                 created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'User not found');
    }

    return success(res, result.rows[0], 'Profile updated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
