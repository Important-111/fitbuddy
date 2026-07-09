const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/workout-records
 * List workout records for the authenticated user.
 * Query: ?plan_id=&start_date=&end_date=&page=1&limit=20
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { plan_id, start_date, end_date } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = ['wr.user_id = $1'];
    const values = [req.user.user_id];
    let idx = 2;

    if (plan_id) {
      conditions.push(`wr.plan_id = $${idx++}`);
      values.push(parseInt(plan_id, 10));
    }
    if (start_date) {
      conditions.push(`wr.start_time >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`wr.start_time <= $${idx++}`);
      values.push(end_date);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM workout_records wr ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT wr.*, e.exercise_name, e.exercise_icon, wp.plan_name
       FROM workout_records wr
       LEFT JOIN exercises e ON wr.exercise_id = e.exercise_id
       LEFT JOIN workout_plans wp ON wr.plan_id = wp.plan_id
       ${whereClause}
       ORDER BY wr.start_time DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    return success(res, {
      items: result.rows,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workout-records
 * Create a new workout record.
 * Body: { plan_id?, exercise_id?, start_time, end_time?, duration_seconds?,
 *         sets_completed?, reps_completed?, calories_burned?, heart_rate_avg?, notes? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { plan_id, exercise_id, start_time, end_time, duration_seconds,
            sets_completed, reps_completed, calories_burned, heart_rate_avg, notes } = req.body;

    if (!start_time) {
      return error(res, 'start_time is required');
    }

    const result = await query(
      `INSERT INTO workout_records (user_id, plan_id, exercise_id, start_time, end_time,
        duration_seconds, sets_completed, reps_completed, calories_burned, heart_rate_avg, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, $11, NOW())
       RETURNING *`,
      [req.user.user_id, plan_id || null, exercise_id || null, start_time, end_time || null,
       duration_seconds || null, sets_completed || null, reps_completed || null,
       calories_burned || null, heart_rate_avg || null, notes || null]
    );

    return success(res, result.rows[0], 'Workout record created', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workout-records/:recordId
 * Get a single workout record with its set details.
 */
router.get('/:recordId', authenticate, async (req, res, next) => {
  try {
    const recordResult = await query(
      `SELECT wr.*, e.exercise_name, e.exercise_icon, wp.plan_name
       FROM workout_records wr
       LEFT JOIN exercises e ON wr.exercise_id = e.exercise_id
       LEFT JOIN workout_plans wp ON wr.plan_id = wp.plan_id
       WHERE wr.record_id = $1 AND wr.user_id = $2`,
      [req.params.recordId, req.user.user_id]
    );

    if (recordResult.rows.length === 0) {
      return notFound(res, 'Workout record not found');
    }

    // Fetch set details
    const setsResult = await query(
      `SELECT * FROM workout_set_details WHERE record_id = $1 ORDER BY set_index`,
      [req.params.recordId]
    );

    return success(res, {
      ...recordResult.rows[0],
      sets: setsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/workout-records/:recordId
 * Update a workout record.
 */
router.put('/:recordId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['plan_id', 'exercise_id', 'start_time', 'end_time',
      'duration_seconds', 'sets_completed', 'reps_completed', 'calories_burned',
      'heart_rate_avg', 'status', 'notes'];

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

    values.push(req.params.recordId, req.user.user_id);

    const result = await query(
      `UPDATE workout_records SET ${updates.join(', ')} WHERE record_id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Workout record not found');
    }

    return success(res, result.rows[0], 'Workout record updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workout-records/:recordId
 * Delete a workout record (cascades to set details).
 */
router.delete('/:recordId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM workout_records WHERE record_id = $1 AND user_id = $2 RETURNING record_id`,
      [req.params.recordId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Workout record not found');
    }

    return success(res, null, 'Workout record deleted');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workout-records/:recordId/sets
 * List all set details for a workout record.
 */
router.get('/:recordId/sets', authenticate, async (req, res, next) => {
  try {
    // Verify record ownership
    const check = await query(
      `SELECT record_id FROM workout_records WHERE record_id = $1 AND user_id = $2`,
      [req.params.recordId, req.user.user_id]
    );
    if (check.rows.length === 0) {
      return notFound(res, 'Workout record not found');
    }

    const result = await query(
      `SELECT ws.*, e.exercise_name
       FROM workout_set_details ws
       LEFT JOIN exercises e ON ws.exercise_id = e.exercise_id
       WHERE ws.record_id = $1
       ORDER BY ws.set_index`,
      [req.params.recordId]
    );

    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workout-records/:recordId/sets
 * Add a set detail to a workout record.
 * Body: { exercise_id?, action_name, set_index, reps?, weight_kg?, duration_sec?, rest_sec?, note? }
 */
router.post('/:recordId/sets', authenticate, async (req, res, next) => {
  try {
    const { exercise_id, action_name, set_index, reps, weight_kg, duration_sec, rest_sec, note } = req.body;

    if (!action_name || set_index === undefined) {
      return error(res, 'action_name and set_index are required');
    }

    // Verify record ownership
    const check = await query(
      `SELECT record_id FROM workout_records WHERE record_id = $1 AND user_id = $2`,
      [req.params.recordId, req.user.user_id]
    );
    if (check.rows.length === 0) {
      return notFound(res, 'Workout record not found');
    }

    const result = await query(
      `INSERT INTO workout_set_details (record_id, exercise_id, action_name, set_index,
        reps, weight_kg, duration_sec, rest_sec, note, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [req.params.recordId, exercise_id || null, action_name, set_index,
       reps || null, weight_kg || null, duration_sec || null, rest_sec || null, note || null]
    );

    return success(res, result.rows[0], 'Set detail added', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/workout-records/:recordId/sets/:setId
 * Update a set detail.
 */
router.put('/:recordId/sets/:setId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['exercise_id', 'action_name', 'set_index', 'reps', 'weight_kg', 'duration_sec', 'rest_sec', 'note'];
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

    values.push(req.params.setId, req.params.recordId, req.user.user_id);

    const result = await query(
      `UPDATE workout_set_details ws
       SET ${updates.join(', ')}
       FROM workout_records wr
       WHERE ws.set_id = $${idx} AND ws.record_id = $${idx + 1}
         AND wr.record_id = ws.record_id AND wr.user_id = $${idx + 2}
       RETURNING ws.*`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Set detail not found');
    }

    return success(res, result.rows[0], 'Set detail updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workout-records/:recordId/sets/:setId
 * Delete a set detail.
 */
router.delete('/:recordId/sets/:setId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM workout_set_details ws
       USING workout_records wr
       WHERE ws.set_id = $1 AND ws.record_id = $2
         AND wr.record_id = ws.record_id AND wr.user_id = $3
       RETURNING ws.set_id`,
      [req.params.setId, req.params.recordId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Set detail not found');
    }

    return success(res, null, 'Set detail deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
