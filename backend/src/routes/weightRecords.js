const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/weight-records
 * List weight records for the authenticated user.
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
      conditions.push(`record_date >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`record_date <= $${idx++}`);
      values.push(end_date);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM weight_records ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT * FROM weight_records ${whereClause}
       ORDER BY record_date DESC
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
 * POST /api/weight-records
 * Create a weight record.
 * Body: { record_date, weight, bmi?, body_fat_rate?, notes? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { record_date, weight, bmi, body_fat_rate, notes } = req.body;

    if (!record_date || weight === undefined) {
      return error(res, 'record_date and weight are required');
    }

    const result = await query(
      `INSERT INTO weight_records (user_id, record_date, weight, bmi, body_fat_rate, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [req.user.user_id, record_date, weight, bmi || null, body_fat_rate || null, notes || null]
    );

    return success(res, result.rows[0], 'Weight record created', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/weight-records/:recordId
 * Get a single weight record.
 */
router.get('/:recordId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM weight_records WHERE record_id = $1 AND user_id = $2`,
      [req.params.recordId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Weight record not found');
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/weight-records/:recordId
 * Update a weight record.
 */
router.put('/:recordId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['record_date', 'weight', 'bmi', 'body_fat_rate', 'notes'];
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
      `UPDATE weight_records SET ${updates.join(', ')} WHERE record_id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Weight record not found');
    }

    return success(res, result.rows[0], 'Weight record updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/weight-records/:recordId
 * Delete a weight record.
 */
router.delete('/:recordId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM weight_records WHERE record_id = $1 AND user_id = $2 RETURNING record_id`,
      [req.params.recordId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Weight record not found');
    }

    return success(res, null, 'Weight record deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
