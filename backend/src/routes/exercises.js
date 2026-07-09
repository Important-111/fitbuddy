const express = require('express');
const { query } = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/exercises/types
 * List all exercise types.
 */
router.get('/types', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT type_id, type_name, type_icon, description FROM exercise_types ORDER BY type_id`
    );
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/exercises
 * List exercises with optional filtering.
 * Query: ?type_id=&difficulty_level=&keyword=&page=1&limit=20
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { type_id, difficulty_level, keyword } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (type_id) {
      conditions.push(`e.type_id = $${idx++}`);
      values.push(parseInt(type_id, 10));
    }

    if (difficulty_level) {
      conditions.push(`e.difficulty_level = $${idx++}`);
      values.push(parseInt(difficulty_level, 10));
    }

    if (keyword) {
      conditions.push(`(e.exercise_name ILIKE $${idx} OR e.description ILIKE $${idx})`);
      values.push(`%${keyword}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM exercises e ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT e.*, et.type_name
       FROM exercises e
       LEFT JOIN exercise_types et ON e.type_id = et.type_id
       ${whereClause}
       ORDER BY e.exercise_id
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    // If user is authenticated, include favorite status
    if (req.user) {
      const favResult = await query(
        `SELECT exercise_id FROM exercise_favorites WHERE user_id = $1`,
        [req.user.user_id]
      );
      const favSet = new Set(favResult.rows.map(r => r.exercise_id));
      for (const row of result.rows) {
        row.is_favorite = favSet.has(row.exercise_id);
      }
    }

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
 * GET /api/exercises/:id
 * Get a single exercise by ID.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, et.type_name
       FROM exercises e
       LEFT JOIN exercise_types et ON e.type_id = et.type_id
       WHERE e.exercise_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Exercise not found');
    }

    const exercise = result.rows[0];

    // Check favorite status if authenticated
    if (req.user) {
      const favResult = await query(
        `SELECT id FROM exercise_favorites WHERE user_id = $1 AND exercise_id = $2`,
        [req.user.user_id, exercise.exercise_id]
      );
      exercise.is_favorite = favResult.rows.length > 0;
    }

    return success(res, exercise);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/exercises/:id/favorite
 * Toggle favorite status for an exercise.
 */
router.post('/:id/favorite', authenticate, async (req, res, next) => {
  try {
    const exerciseId = req.params.id;

    // Check if already favorited
    const existing = await query(
      `SELECT id FROM exercise_favorites WHERE user_id = $1 AND exercise_id = $2`,
      [req.user.user_id, exerciseId]
    );

    if (existing.rows.length > 0) {
      // Remove favorite
      await query(
        `DELETE FROM exercise_favorites WHERE user_id = $1 AND exercise_id = $2`,
        [req.user.user_id, exerciseId]
      );
      return success(res, { is_favorite: false }, 'Favorite removed');
    } else {
      // Add favorite
      await query(
        `INSERT INTO exercise_favorites (user_id, exercise_id, created_at) VALUES ($1, $2, NOW())`,
        [req.user.user_id, exerciseId]
      );
      return success(res, { is_favorite: true }, 'Exercise favorited', 201);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
