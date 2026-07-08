-- ============================================================
-- FitBuddy 健身教练 - 数据库合并迁移脚本 v2
-- 将 fitness_miniprogram (MySQL) 的有用表迁移到 Neon (PostgreSQL)
-- ============================================================

-- ==================== 1. 用户健身目标 ====================
-- 来源：MySQL fitness_miniprogram.fitness_goals
-- FitBuddy 用户可设置多个目标（减脂、增肌、塑形等）

CREATE TABLE IF NOT EXISTS user_fitness_goals (
    goal_id      BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    goal_type    VARCHAR(32) NOT NULL,   -- 减脂, 增肌, 塑形, 提高力量, 提高耐力, 改善体态, 等
    target_value NUMERIC(8,2),           -- 目标数值（如目标体重kg）
    unit         VARCHAR(16),            -- kg, cm, %, 等
    start_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date  DATE,
    achieved_at  TIMESTAMP,              -- 达成时间
    is_primary   BOOLEAN NOT NULL DEFAULT FALSE,  -- 是否主要目标
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_fitness_goals_user ON user_fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fitness_goals_type ON user_fitness_goals(goal_type);

-- ==================== 2. 身体详细指标 ====================
-- 来源：MySQL fitness_miniprogram.body_metrics
-- 扩展 weight_records，增加体成分数据

CREATE TABLE IF NOT EXISTS body_metrics (
    metric_id    BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    measured_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    weight_kg    NUMERIC(5,2),           -- 体重(kg)
    body_fat_pct NUMERIC(4,2),           -- 体脂率(%)
    muscle_kg    NUMERIC(5,2),           -- 肌肉量(kg)
    bmi          NUMERIC(4,2),           -- BMI
    chest_cm     NUMERIC(5,1),           -- 胸围(cm)
    waist_cm     NUMERIC(5,1),           -- 腰围(cm)
    hip_cm       NUMERIC(5,1),           -- 臀围(cm)
    extra        JSONB DEFAULT '{}',     -- 扩展数据
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user ON body_metrics(user_id, measured_at);

-- ==================== 3. 训练组记录 ====================
-- 来源：MySQL fitness_miniprogram.workout_record_details
-- 记录每次训练中每组动作的详细数据

CREATE TABLE IF NOT EXISTS workout_set_details (
    set_id       BIGSERIAL PRIMARY KEY,
    record_id    BIGINT NOT NULL REFERENCES workout_records(record_id) ON DELETE CASCADE,
    exercise_id  BIGINT REFERENCES exercises(exercise_id) ON DELETE SET NULL,
    action_name  VARCHAR(64) NOT NULL,   -- 动作名称
    set_index    SMALLINT NOT NULL,      -- 第几组
    reps         SMALLINT,               -- 次数
    weight_kg    NUMERIC(6,2),           -- 重量(kg)
    duration_sec INTEGER,                -- 持续时间(秒)
    rest_sec     INTEGER,                -- 组间休息(秒)
    note         TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workout_set_details_record ON workout_set_details(record_id, set_index);
CREATE INDEX IF NOT EXISTS idx_workout_set_details_exercise ON workout_set_details(exercise_id);

-- ==================== 4. 教练档案 ====================
-- 来源：MySQL fitness_miniprogram.coaches
-- 规范化教练信息（courses 表目前只存 coach_name 文本）

CREATE TABLE IF NOT EXISTS coaches (
    coach_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    display_name VARCHAR(64) NOT NULL,
    title        VARCHAR(64),            -- 职称
    bio          TEXT,
    avatar_url   VARCHAR(512),
    specialties  TEXT[],                 -- 专长数组
    rating       NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    student_count INTEGER DEFAULT 0,
    years_exp    SMALLINT,
    is_certified BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_coaches_rating ON coaches(rating);

-- 给 courses 表添加 coach_id 外键（如果 coach_id 列不存在才加）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'coach_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN coach_id BIGINT REFERENCES coaches(coach_id);
        CREATE INDEX IF NOT EXISTS idx_courses_coach_id ON courses(coach_id);
    END IF;
END $$;

-- ==================== 5. 课程分类 ====================
-- 来源：MySQL fitness_miniprogram.course_categories
-- 支持多层级的课程分类体系

CREATE TABLE IF NOT EXISTS course_categories (
    category_id  BIGSERIAL PRIMARY KEY,
    parent_id    BIGINT REFERENCES course_categories(category_id) ON DELETE SET NULL,
    name         VARCHAR(64) NOT NULL,
    slug         VARCHAR(64) NOT NULL,
    icon_url     VARCHAR(512),
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_course_categories_parent ON course_categories(parent_id);

-- 给 courses 表添加 category_id 外键（如果列不存在才加）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN category_id BIGINT REFERENCES course_categories(category_id);
        CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
    END IF;
END $$;

-- ==================== 6. 清理课程表冗余字段 ====================
-- courses 表已有 coach_name（文本），添加外键后保留文本字段作为冗余
-- courses 表已有 category（文本），添加外键后保留文本字段作为冗余
-- 不删除已有字段，保证向前兼容
