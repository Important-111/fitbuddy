const express = require('express');
const { query, getClient } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/points-mall
 * List items in the points mall.
 * Query: ?item_type=&status=&page=1&limit=20
 */
router.get('/', async (req, res, next) => {
  try {
    const { item_type } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = ['(status IS NULL OR status = 1)'];
    const values = [];
    let idx = 1;

    if (item_type !== undefined) {
      conditions.push(`item_type = $${idx++}`);
      values.push(parseInt(item_type, 10));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM points_mall ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT * FROM points_mall ${whereClause}
       ORDER BY points_required ASC
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
 * GET /api/points-mall/:itemId
 * Get detail of a single mall item.
 */
router.get('/:itemId', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM points_mall WHERE item_id = $1`,
      [req.params.itemId]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Item not found');
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/points-mall/exchange
 * Exchange points for an item.
 * Body: { item_id, quantity?, receiver_name?, receiver_phone?, receiver_address? }
 */
router.post('/exchange', authenticate, async (req, res, next) => {
  const client = await getClient();
  try {
    const { item_id, quantity, receiver_name, receiver_phone, receiver_address } = req.body;

    if (!item_id) {
      return error(res, 'item_id is required');
    }

    const qty = quantity || 1;

    await client.query('BEGIN');

    // Get item details
    const itemResult = await client.query(
      `SELECT * FROM points_mall WHERE item_id = $1 AND (status IS NULL OR status = 1)`,
      [item_id]
    );

    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return notFound(res, 'Item not found or unavailable');
    }

    const item = itemResult.rows[0];

    // Check stock
    if (item.stock !== null && item.stock < qty) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient stock', 400);
    }

    // Get user points
    const pointsResult = await client.query(
      `SELECT * FROM user_points WHERE user_id = $1 FOR UPDATE`,
      [req.user.user_id]
    );

    let userPoints;
    if (pointsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return error(res, 'Points account not found. Please check in first.', 400);
    }
    userPoints = pointsResult.rows[0];

    const totalPointsRequired = item.points_required * qty;

    if (userPoints.balance < totalPointsRequired) {
      await client.query('ROLLBACK');
      return error(res, 'Insufficient points balance', 400);
    }

    // Deduct points
    await client.query(
      `UPDATE user_points SET balance = balance - $1, total_spent = total_spent + $1, updated_at = NOW()
       WHERE user_id = $2`,
      [totalPointsRequired, req.user.user_id]
    );

    // Record points growth
    await client.query(
      `INSERT INTO user_growth (user_id, points_change, change_type, description, balance_after, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [req.user.user_id, -totalPointsRequired, 2,
       `Exchanged for ${item.item_name} x${qty}`,
       userPoints.balance - totalPointsRequired]
    );

    // Update stock
    if (item.stock !== null) {
      await client.query(
        `UPDATE points_mall SET stock = stock - $1 WHERE item_id = $2`,
        [qty, item_id]
      );
    }

    // Create exchange record
    const exchangeResult = await client.query(
      `INSERT INTO points_exchange (user_id, item_id, points_spent, quantity, status,
        receiver_name, receiver_phone, receiver_address, exchange_time, updated_at)
       VALUES ($1, $2, $3, $4, 1, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [req.user.user_id, item_id, totalPointsRequired, qty,
       receiver_name || null, receiver_phone || null, receiver_address || null]
    );

    await client.query('COMMIT');

    return success(res, exchangeResult.rows[0], 'Exchange successful', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

/**
 * GET /api/points-mall/exchange/history
 * Get the authenticated user's exchange history.
 */
router.get('/exchange/history', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT pe.*, pm.item_name, pm.item_type, pm.image_url
       FROM points_exchange pe
       LEFT JOIN points_mall pm ON pe.item_id = pm.item_id
       WHERE pe.user_id = $1
       ORDER BY pe.exchange_time DESC`,
      [req.user.user_id]
    );

    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
