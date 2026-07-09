const express = require('express');
const { query } = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { success, error, notFound } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/courses
 * List courses with optional filtering.
 * Query: ?category_id=&difficulty_level=&course_type=&keyword=&page=1&limit=20
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category_id, difficulty_level, course_type, keyword } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = ['c.status = 1'];
    const values = [];
    let idx = 1;

    if (category_id) {
      conditions.push(`c.category_id = $${idx++}`);
      values.push(parseInt(category_id, 10));
    }
    if (difficulty_level) {
      conditions.push(`c.difficulty_level = $${idx++}`);
      values.push(parseInt(difficulty_level, 10));
    }
    if (course_type) {
      conditions.push(`c.course_type = $${idx++}`);
      values.push(parseInt(course_type, 10));
    }
    if (keyword) {
      conditions.push(`(c.course_name ILIKE $${idx} OR c.description ILIKE $${idx})`);
      values.push(`%${keyword}%`);
      idx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM courses c ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await query(
      `SELECT c.*, cc.name as category_name, co.display_name as coach_name
       FROM courses c
       LEFT JOIN course_categories cc ON c.category_id = cc.category_id
       LEFT JOIN coaches co ON c.coach_id = co.coach_id
       ${whereClause}
       ORDER BY c.enrollment_count DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    // If user is authenticated, include enrollment status and progress
    if (req.user) {
      const orderResult = await query(
        `SELECT course_id FROM course_orders WHERE user_id = $1 AND payment_status = 1`,
        [req.user.user_id]
      );
      const enrolledSet = new Set(orderResult.rows.map(r => r.course_id));

      const progressResult = await query(
        `SELECT course_id, COUNT(*) FILTER (WHERE is_completed = 1)::int as completed_chapters,
                COUNT(*)::int as total_chapters
         FROM course_progress WHERE user_id = $1
         GROUP BY course_id`,
        [req.user.user_id]
      );
      const progressMap = {};
      for (const p of progressResult.rows) {
        progressMap[p.course_id] = p;
      }

      for (const course of result.rows) {
        course.is_enrolled = enrolledSet.has(course.course_id);
        if (progressMap[course.course_id]) {
          course.progress = progressMap[course.course_id];
        }
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
 * GET /api/courses/:id
 * Get a single course with its chapters.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const courseResult = await query(
      `SELECT c.*, cc.name as category_name, co.display_name as coach_name
       FROM courses c
       LEFT JOIN course_categories cc ON c.category_id = cc.category_id
       LEFT JOIN coaches co ON c.coach_id = co.coach_id
       WHERE c.course_id = $1`,
      [req.params.id]
    );

    if (courseResult.rows.length === 0) {
      return notFound(res, 'Course not found');
    }

    const course = courseResult.rows[0];

    // Get chapters
    const chaptersResult = await query(
      `SELECT * FROM course_chapters WHERE course_id = $1 ORDER BY chapter_no`,
      [req.params.id]
    );
    course.chapters = chaptersResult.rows;

    // If user authenticated, include enrollment and progress
    if (req.user) {
      const orderResult = await query(
        `SELECT order_id, payment_status FROM course_orders
         WHERE user_id = $1 AND course_id = $2`,
        [req.user.user_id, req.params.id]
      );
      course.is_enrolled = orderResult.rows.length > 0 &&
        orderResult.rows[0].payment_status === 1;

      if (course.is_enrolled) {
        const progressResult = await query(
          `SELECT cp.*, c.chapter_name, c.chapter_no
           FROM course_progress cp
           JOIN course_chapters c ON cp.chapter_id = c.chapter_id
           WHERE cp.user_id = $1 AND cp.course_id = $2
           ORDER BY c.chapter_no`,
          [req.user.user_id, req.params.id]
        );
        course.progress = progressResult.rows;
      }
    }

    return success(res, course);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/courses/:id/enroll
 * Enroll in a course.
 */
router.post('/:id/enroll', authenticate, async (req, res, next) => {
  try {
    const courseId = req.params.id;

    // Check if course exists and is active
    const courseResult = await query(
      `SELECT course_id, price, status FROM courses WHERE course_id = $1`,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return notFound(res, 'Course not found');
    }

    const course = courseResult.rows[0];

    if (course.status !== 1) {
      return error(res, 'Course is not available for enrollment', 400);
    }

    // Check if already enrolled
    const existingOrder = await query(
      `SELECT order_id FROM course_orders WHERE user_id = $1 AND course_id = $2`,
      [req.user.user_id, courseId]
    );

    if (existingOrder.rows.length > 0) {
      return error(res, 'Already enrolled in this course', 409);
    }

    // Create order
    const orderNo = `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const orderResult = await query(
      `INSERT INTO course_orders (user_id, course_id, order_no, amount, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
       RETURNING *`,
      [req.user.user_id, courseId, orderNo, course.price]
    );

    return success(res, orderResult.rows[0], 'Enrolled successfully', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/courses/:id/chapters/:chapterId/progress
 * Get or update course chapter progress.
 * Query: progress (0-100)
 */
router.get('/:id/chapters/:chapterId/progress', authenticate, async (req, res, next) => {
  try {
    const { id: courseId, chapterId } = req.params;

    const result = await query(
      `SELECT * FROM course_progress
       WHERE user_id = $1 AND course_id = $2 AND chapter_id = $3`,
      [req.user.user_id, courseId, chapterId]
    );

    if (result.rows.length === 0) {
      return success(res, { progress_percent: 0, is_completed: 0 });
    }

    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/courses/:id/chapters/:chapterId/progress
 * Update chapter progress.
 */
router.post('/:id/chapters/:chapterId/progress', authenticate, async (req, res, next) => {
  try {
    const { id: courseId, chapterId } = req.params;
    const { progress_percent, is_completed, last_position_seconds } = req.body;

    if (progress_percent === undefined && is_completed === undefined) {
      return error(res, 'progress_percent or is_completed is required');
    }

    const result = await query(
      `INSERT INTO course_progress (user_id, course_id, chapter_id, progress_percent, is_completed, last_position_seconds, last_study_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
       ON CONFLICT (user_id, chapter_id)
       DO UPDATE SET
         progress_percent = GREATEST(course_progress.progress_percent, EXCLUDED.progress_percent),
         is_completed = GREATEST(course_progress.is_completed, EXCLUDED.is_completed),
         last_position_seconds = COALESCE(EXCLUDED.last_position_seconds, course_progress.last_position_seconds),
         last_study_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [req.user.user_id, courseId, chapterId,
       progress_percent || 0,
       is_completed !== undefined ? is_completed : 0,
       last_position_seconds || null]
    );

    return success(res, result.rows[0], 'Progress updated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
