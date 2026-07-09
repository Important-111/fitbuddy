const express = require('express');
const { query, getClient } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/points
 * Get the authenticated user's points balance and summary.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Get points balance
    const pointsResult = await query(
      `SELECT * FROM user_points WHERE user_id = $1`,
      [req.user.user_id]
    );

    // Get user level
    const levelResult = await query(
      `SELECT ul.* FROM user_levels ul
       LEFT JOIN user_points up ON ul.min_points <= COALESCE(up.balance, 0)
       WHERE up.user_id = $1
       ORDER BY ul.level_no DESC
       LIMIT 1`,
      [req.user.user_id]
    );

    let points = null;
    if (pointsResult.rows.length === 0) {
      // Return default points structure
      points = { balance: 0, total_earned: 0, total_spent: 0 };
      return success(res, {
        points,
        level: levelResult.rows[0] || null,
      });
    }

    return success(res, {
      points: pointsResult.rows[0],
      level: levelResult.rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/points/history
 * Get points change history.
 * Query: ?change_type=&page=1&limit=20
 */
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { change_type } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = ['user_id = $1'];
    const values = [req.user.user_id];
    let idx = 2;

    if (change_type !== undefined) {
      conditions.push(`change_type = $${idx++}`);
      values.push(parseInt(change_type, 10));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM user_growth ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT * FROM user_growth ${whereClause}
       ORDER BY created_at DESC
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
 * GET /api/points-mall
 * List items in the points mall.
 * Query: ?item_type=&status=1&page=1&limit=20
 */
router.get('/mall', async (req, res, next) => {
  // Note: This route is mounted at /api/points-mall
  // Since we mount it at /api/points, we handle it in the app.js router setup
  // This is handled in app.js separately
});

/**
 * POST /api/points-mall/exchange
 * Exchange points for an item.
 * Body: { item_id, quantity?, receiver_name?, receiver_phone?, receiver_address? }
 */

module.exports = router;
