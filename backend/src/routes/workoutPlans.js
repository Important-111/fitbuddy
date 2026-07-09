const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/workout-plans
 * List all workout plans for the authenticated user.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.user_id]
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workout-plans
 * Create a new workout plan.
 * Body: { plan_name, plan_type?, target_days?, daily_duration?, difficulty_level?, description? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { plan_name, plan_type, target_days, daily_duration, difficulty_level, description } = req.body;

    if (!plan_name) {
      return error(res, 'plan_name is required');
    }

    const result = await query(
      `INSERT INTO workout_plans (user_id, plan_name, plan_type, target_days, daily_duration, difficulty_level, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW(), NOW())
       RETURNING *`,
      [req.user.user_id, plan_name, plan_type || null, target_days || null, daily_duration || null, difficulty_level || null, description || null]
    );

    return success(res, result.rows[0], 'Workout plan created', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workout-plans/:planId
 * Get a single workout plan with its details.
 */
router.get('/:planId', authenticate, async (req, res, next) => {
  try {
    const planResult = await query(
      `SELECT * FROM workout_plans WHERE plan_id = $1 AND user_id = $2`,
      [req.params.planId, req.user.user_id]
    );

    if (planResult.rows.length === 0) {
      return notFound(res, 'Workout plan not found');
    }

    // Fetch plan details (exercises for each day)
    const detailsResult = await query(
      `SELECT pd.*, e.exercise_name, e.exercise_icon, e.calories_per_minute, e.target_muscles
       FROM plan_details pd
       LEFT JOIN exercises e ON pd.exercise_id = e.exercise_id
       WHERE pd.plan_id = $1
       ORDER BY pd.day_number, pd.sort_order`,
      [req.params.planId]
    );

    return success(res, {
      ...planResult.rows[0],
      details: detailsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/workout-plans/:planId
 * Update a workout plan.
 */
router.put('/:planId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['plan_name', 'plan_type', 'target_days', 'daily_duration', 'difficulty_level', 'description', 'status'];
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

    updates.push('updated_at = NOW()');
    values.push(req.params.planId, req.user.user_id);

    const result = await query(
      `UPDATE workout_plans SET ${updates.join(', ')} WHERE plan_id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Workout plan not found');
    }

    return success(res, result.rows[0], 'Workout plan updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workout-plans/:planId
 * Delete a workout plan (cascades to plan_details).
 */
router.delete('/:planId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM workout_plans WHERE plan_id = $1 AND user_id = $2 RETURNING plan_id`,
      [req.params.planId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Workout plan not found');
    }

    return success(res, null, 'Workout plan deleted');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workout-plans/:planId/details
 * Get all details for a workout plan.
 */
router.get('/:planId/details', authenticate, async (req, res, next) => {
  try {
    // Verify the plan belongs to user
    const planCheck = await query(
      `SELECT plan_id FROM workout_plans WHERE plan_id = $1 AND user_id = $2`,
      [req.params.planId, req.user.user_id]
    );
    if (planCheck.rows.length === 0) {
      return notFound(res, 'Workout plan not found');
    }

    const result = await query(
      `SELECT pd.*, e.exercise_name, e.exercise_icon, e.calories_per_minute, e.target_muscles
       FROM plan_details pd
       LEFT JOIN exercises e ON pd.exercise_id = e.exercise_id
       WHERE pd.plan_id = $1
       ORDER BY pd.day_number, pd.sort_order`,
      [req.params.planId]
    );

    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workout-plans/:planId/details
 * Add a detail entry to a workout plan.
 * Body: { day_number, exercise_id, sets?, reps?, duration_seconds?, rest_seconds?, sort_order? }
 */
router.post('/:planId/details', authenticate, async (req, res, next) => {
  try {
    const { day_number, exercise_id, sets, reps, duration_seconds, rest_seconds, sort_order } = req.body;

    if (!day_number || !exercise_id) {
      return error(res, 'day_number and exercise_id are required');
    }

    // Verify plan ownership
    const planCheck = await query(
      `SELECT plan_id FROM workout_plans WHERE plan_id = $1 AND user_id = $2`,
      [req.params.planId, req.user.user_id]
    );
    if (planCheck.rows.length === 0) {
      return notFound(res, 'Workout plan not found');
    }

    const result = await query(
      `INSERT INTO plan_details (plan_id, day_number, exercise_id, sets, reps, duration_seconds, rest_seconds, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [req.params.planId, day_number, exercise_id, sets || null, reps || null, duration_seconds || null, rest_seconds || null, sort_order || null]
    );

    return success(res, result.rows[0], 'Plan detail added', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workout-plans/:planId/details/:detailId
 * Delete a plan detail entry.
 */
router.delete('/:planId/details/:detailId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM plan_details WHERE detail_id = $1 AND plan_id = $2
       AND plan_id IN (SELECT plan_id FROM workout_plans WHERE user_id = $3)
       RETURNING detail_id`,
      [req.params.detailId, req.params.planId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Plan detail not found');
    }

    return success(res, null, 'Plan detail deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
