const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/users/goals
 * List all fitness goals for the authenticated user.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT goal_id, goal_type, target_value, unit, start_date, target_date,
              achieved_at, is_primary, created_at, updated_at
       FROM user_fitness_goals
       WHERE user_id = $1
       ORDER BY is_primary DESC, created_at DESC`,
      [req.user.user_id]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/goals
 * Create a new fitness goal.
 * Body: { goal_type, target_value?, unit?, start_date, target_date?, is_primary? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { goal_type, target_value, unit, start_date, target_date, is_primary } = req.body;

    if (!goal_type || !start_date) {
      return error(res, 'goal_type and start_date are required');
    }

    // If setting as primary, unset other primary goals first
    if (is_primary) {
      await query(
        `UPDATE user_fitness_goals SET is_primary = false WHERE user_id = $1 AND is_primary = true`,
        [req.user.user_id]
      );
    }

    const result = await query(
      `INSERT INTO user_fitness_goals (user_id, goal_type, target_value, unit, start_date, target_date, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [req.user.user_id, goal_type, target_value || null, unit || null, start_date, target_date || null, is_primary !== undefined ? is_primary : false]
    );

    return success(res, result.rows[0], 'Goal created', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/goals/:goalId
 * Get a single fitness goal.
 */
router.get('/:goalId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM user_fitness_goals WHERE goal_id = $1 AND user_id = $2`,
      [req.params.goalId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Goal not found');
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/goals/:goalId
 * Update a fitness goal.
 */
router.put('/:goalId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['goal_type', 'target_value', 'unit', 'start_date', 'target_date', 'is_primary'];
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

    // Handle is_primary change
    if (req.body.is_primary) {
      await query(
        `UPDATE user_fitness_goals SET is_primary = false WHERE user_id = $1 AND is_primary = true AND goal_id != $2`,
        [req.user.user_id, req.params.goalId]
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.goalId, req.user.user_id);

    const result = await query(
      `UPDATE user_fitness_goals SET ${updates.join(', ')} WHERE goal_id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Goal not found');
    }

    return success(res, result.rows[0], 'Goal updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/users/goals/:goalId
 * Delete a fitness goal.
 */
router.delete('/:goalId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM user_fitness_goals WHERE goal_id = $1 AND user_id = $2 RETURNING goal_id`,
      [req.params.goalId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Goal not found');
    }

    return success(res, null, 'Goal deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
