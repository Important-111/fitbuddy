const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/checkins
 * List check-in records for the authenticated user.
 * Query: ?start_date=&end_date=&limit=30
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 365);

    let conditions = ['user_id = $1'];
    const values = [req.user.user_id];
    let idx = 2;

    if (start_date) {
      conditions.push(`checkin_date >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`checkin_date <= $${idx++}`);
      values.push(end_date);
    }

    const result = await query(
      `SELECT * FROM checkin_records WHERE ${conditions.join(' AND ')}
       ORDER BY checkin_date DESC
       LIMIT $${idx}`,
      [...values, limit]
    );

    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/checkins
 * Create a check-in record.
 * Body: { checkin_date, checkin_type, target_achieved?, notes? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { checkin_date, checkin_type, target_achieved, notes } = req.body;

    if (!checkin_date || checkin_type === undefined) {
      return error(res, 'checkin_date and checkin_type are required');
    }

    // Calculate streak days
    const lastCheckin = await query(
      `SELECT checkin_date, streak_days FROM checkin_records
       WHERE user_id = $1
       ORDER BY checkin_date DESC LIMIT 1`,
      [req.user.user_id]
    );

    let streakDays = 1;
    if (lastCheckin.rows.length > 0) {
      const lastDate = new Date(lastCheckin.rows[0].checkin_date);
      const currentDate = new Date(checkin_date);
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakDays = (lastCheckin.rows[0].streak_days || 0) + 1;
      } else if (diffDays === 0) {
        // Same day - update existing checkin or return existing
        // Let's handle by updating target_achieved
        return error(res, 'Already checked in today', 409);
      }
      // If diff > 1, streak resets to 1
    }

    const result = await query(
      `INSERT INTO checkin_records (user_id, checkin_date, checkin_type, target_achieved,
        streak_days, points, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [req.user.user_id, checkin_date, checkin_type, target_achieved !== undefined ? target_achieved : null,
       streakDays, (target_achieved ? 10 : 5), notes || null]
    );

    return success(res, result.rows[0], 'Check-in recorded', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkins/streak
 * Get the current check-in streak information.
 */
router.get('/streak', authenticate, async (req, res, next) => {
  try {
    // Get all checkin dates for this user ordered descending
    const result = await query(
      `SELECT checkin_date, streak_days, points, target_achieved, checkin_type
       FROM checkin_records
       WHERE user_id = $1
       ORDER BY checkin_date DESC`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return success(res, {
        current_streak: 0,
        longest_streak: 0,
        total_checkins: 0,
        total_points: 0,
        today_checked_in: false,
        recent_checkins: [],
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const todayCheckedIn = result.rows[0].checkin_date === todayStr;

    // The streak from the most recent record
    currentStreak = result.rows[0].streak_days || 0;

    // Calculate total stats
    const totalCheckins = result.rows.length;
    const totalPoints = result.rows.reduce((sum, r) => sum + (r.points || 0), 0);

    const recentCheckins = result.rows.slice(0, 7);

    return success(res, {
      current_streak: currentStreak,
      longest_streak: Math.max(...result.rows.map(r => r.streak_days || 0)),
      total_checkins: totalCheckins,
      total_points: totalPoints,
      today_checked_in: todayCheckedIn,
      recent_checkins: recentCheckins,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
