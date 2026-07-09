const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/body-metrics
 * List body metrics for the authenticated user.
 * Query: ?start_date=&end_date=&page=1&limit=20
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 365);
    const offset = (page - 1) * limit;

    const conditions = ['user_id = $1'];
    const values = [req.user.user_id];
    let idx = 2;

    if (start_date) {
      conditions.push(`measured_at >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`measured_at <= $${idx++}`);
      values.push(end_date);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM body_metrics ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT * FROM body_metrics ${whereClause}
       ORDER BY measured_at DESC
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
 * POST /api/body-metrics
 * Create a body metric record.
 * Body: { measured_at, weight_kg?, body_fat_pct?, muscle_kg?, bmi?, chest_cm?, waist_cm?, hip_cm?, extra? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { measured_at, weight_kg, body_fat_pct, muscle_kg, bmi, chest_cm, waist_cm, hip_cm, extra } = req.body;

    if (!measured_at) {
      return error(res, 'measured_at is required');
    }

    const result = await query(
      `INSERT INTO body_metrics (user_id, measured_at, weight_kg, body_fat_pct, muscle_kg,
        bmi, chest_cm, waist_cm, hip_cm, extra, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [req.user.user_id, measured_at, weight_kg || null, body_fat_pct || null,
       muscle_kg || null, bmi || null, chest_cm || null, waist_cm || null,
       hip_cm || null, extra ? JSON.stringify(extra) : null]
    );

    return success(res, result.rows[0], 'Body metric created', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/body-metrics/:metricId
 * Get a single body metric record.
 */
router.get('/:metricId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM body_metrics WHERE metric_id = $1 AND user_id = $2`,
      [req.params.metricId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Body metric not found');
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/body-metrics/:metricId
 * Update a body metric record.
 */
router.put('/:metricId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['measured_at', 'weight_kg', 'body_fat_pct', 'muscle_kg',
      'bmi', 'chest_cm', 'waist_cm', 'hip_cm', 'extra'];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const value = field === 'extra' ? JSON.stringify(req.body[field]) : req.body[field];
        updates.push(`${field} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (updates.length === 0) {
      return error(res, 'No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(req.params.metricId, req.user.user_id);

    const result = await query(
      `UPDATE body_metrics SET ${updates.join(', ')} WHERE metric_id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Body metric not found');
    }

    return success(res, result.rows[0], 'Body metric updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/body-metrics/:metricId
 * Delete a body metric record.
 */
router.delete('/:metricId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM body_metrics WHERE metric_id = $1 AND user_id = $2 RETURNING metric_id`,
      [req.params.metricId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Body metric not found');
    }

    return success(res, null, 'Body metric deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
