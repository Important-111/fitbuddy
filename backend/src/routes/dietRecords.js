const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/diet-records
 * List diet records for the authenticated user.
 * Query: ?start_date=&end_date=&meal_type=&page=1&limit=20
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { start_date, end_date, meal_type } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
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
    if (meal_type !== undefined) {
      conditions.push(`meal_type = $${idx++}`);
      values.push(parseInt(meal_type, 10));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM diet_records ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT * FROM diet_records ${whereClause}
       ORDER BY record_date DESC, meal_type
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
 * POST /api/diet-records
 * Create a diet record.
 * Body: { record_date, meal_type, food_name, food_type?, calories?, protein?, carbs?, fat?, weight?, image_url?, notes? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { record_date, meal_type, food_name, food_type, calories, protein, carbs, fat, weight, image_url, notes } = req.body;

    if (!record_date || meal_type === undefined || !food_name) {
      return error(res, 'record_date, meal_type, and food_name are required');
    }

    const result = await query(
      `INSERT INTO diet_records (user_id, record_date, meal_type, food_name, food_type,
        calories, protein, carbs, fat, weight, image_url, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [req.user.user_id, record_date, meal_type, food_name, food_type || null,
       calories || null, protein || null, carbs || null, fat || null,
       weight || null, image_url || null, notes || null]
    );

    return success(res, result.rows[0], 'Diet record created', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/diet-records/:recordId
 * Get a single diet record.
 */
router.get('/:recordId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM diet_records WHERE record_id = $1 AND user_id = $2`,
      [req.params.recordId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Diet record not found');
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/diet-records/:recordId
 * Update a diet record.
 */
router.put('/:recordId', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['record_date', 'meal_type', 'food_name', 'food_type',
      'calories', 'protein', 'carbs', 'fat', 'weight', 'image_url', 'notes'];

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
      `UPDATE diet_records SET ${updates.join(', ')} WHERE record_id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Diet record not found');
    }

    return success(res, result.rows[0], 'Diet record updated');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/diet-records/:recordId
 * Delete a diet record.
 */
router.delete('/:recordId', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM diet_records WHERE record_id = $1 AND user_id = $2 RETURNING record_id`,
      [req.params.recordId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Diet record not found');
    }

    return success(res, null, 'Diet record deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
