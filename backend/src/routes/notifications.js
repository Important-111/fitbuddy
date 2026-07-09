const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/notifications
 * List notifications for the authenticated user.
 * Query: ?type=&is_read=&page=1&limit=20
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { type, is_read } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = ['user_id = $1'];
    const values = [req.user.user_id];
    let idx = 2;

    if (type !== undefined) {
      conditions.push(`type = $${idx++}`);
      values.push(parseInt(type, 10));
    }
    if (is_read !== undefined) {
      conditions.push(`is_read = $${idx++}`);
      values.push(parseInt(is_read, 10));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT * FROM notifications ${whereClause}
       ORDER BY send_time DESC NULLS LAST, created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as unread FROM notifications WHERE user_id = $1 AND is_read = 0`,
      [req.user.user_id]
    );

    return success(res, {
      items: result.rows,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      unread_count: parseInt(unreadResult.rows[0].unread, 10),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read (or unread).
 * Body: { is_read?: 1 }
 */
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const isRead = req.body.is_read !== undefined ? req.body.is_read : 1;

    const result = await query(
      `UPDATE notifications SET is_read = $1 WHERE notification_id = $2 AND user_id = $3
       RETURNING *`,
      [isRead, req.params.id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return notFound(res, 'Notification not found');
    }

    return success(res, result.rows[0], 'Notification updated');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = $1 AND is_read = 0
       RETURNING notification_id`,
      [req.user.user_id]
    );

    return success(res, { count: result.rowCount }, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
