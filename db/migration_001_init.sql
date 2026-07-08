-- ============================================================
-- FitBuddy 健身教练 - 数据库初始化迁移脚本
-- 数据库：PostgreSQL (Neon)
-- 版本：v1.0.0
-- 说明：FitBuddy SPA 的完整数据表定义与种子数据
-- ============================================================

-- ==================== 用户体系 ====================

-- 用户账号表
CREATE TABLE IF NOT EXISTS users (
    user_id        BIGSERIAL PRIMARY KEY,
    openid         VARCHAR(128) NOT NULL,
    nickname       VARCHAR(64),
    avatar_url     VARCHAR(512),
    gender         SMALLINT,            -- 1:男 2:女 0:未知
    phone          VARCHAR(20),
    birthday       DATE,
    height         NUMERIC(5,2),        -- 身高(cm)
    weight         NUMERIC(5,2),        -- 当前体重(kg)
    target_weight  NUMERIC(5,2),        -- 目标体重(kg)
    fitness_level  SMALLINT,            -- 训练经验: 1初学者 2中级 3高级
    membership_type SMALLINT DEFAULT 0, -- 会员类型: 0普通 1月度 2季度 3年度
    status         SMALLINT DEFAULT 1,  -- 1正常 0禁用
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 用户积分账户
CREATE TABLE IF NOT EXISTS user_points (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(user_id),
    balance       INTEGER DEFAULT 0,
    total_earned  INTEGER DEFAULT 0,
    total_spent   INTEGER DEFAULT 0,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- 积分变动流水
CREATE TABLE IF NOT EXISTS user_growth (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(user_id),
    points_change INTEGER NOT NULL,
    change_type   SMALLINT NOT NULL,    -- 1签到 2训练完成 3兑换 4系统赠送
    description   VARCHAR(256),
    balance_after INTEGER,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_growth_user_id ON user_growth(user_id);
CREATE INDEX IF NOT EXISTS idx_user_growth_created_at ON user_growth(created_at);

-- 用户等级定义
CREATE TABLE IF NOT EXISTS user_levels (
    level_id   BIGSERIAL PRIMARY KEY,
    level_no   INTEGER NOT NULL,
    level_name VARCHAR(32) NOT NULL,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    benefits   TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 训练体系 ====================

-- 训练计划
CREATE TABLE IF NOT EXISTS workout_plans (
    plan_id         BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    plan_name       VARCHAR(128) NOT NULL,
    plan_type       SMALLINT,           -- 1减脂 2增肌 3塑形 4耐力 5自定义
    target_days     INTEGER,            -- 计划总天数
    daily_duration  INTEGER,            -- 每日训练时长(分钟)
    difficulty_level SMALLINT,          -- 1入门 2初级 3中级 4高级
    description     TEXT,
    status          SMALLINT DEFAULT 1, -- 1进行中 2已完成 3已暂停
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_status ON workout_plans(status);

-- 计划详情（每天的训练动作安排）
CREATE TABLE IF NOT EXISTS plan_details (
    detail_id       BIGSERIAL PRIMARY KEY,
    plan_id         BIGINT NOT NULL REFERENCES workout_plans(plan_id) ON DELETE CASCADE,
    day_number      INTEGER NOT NULL,   -- 第几天
    exercise_id     BIGINT NOT NULL REFERENCES exercises(exercise_id),
    sets            INTEGER,            -- 组数
    reps            INTEGER,            -- 每组次数
    duration_seconds INTEGER,           -- 时长(秒)
    rest_seconds    INTEGER,            -- 组间休息(秒)
    sort_order      INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_plan_details_plan_id ON plan_details(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_details_exercise_id ON plan_details(exercise_id);

-- ==================== 动作库 ====================

-- 动作分类
CREATE TABLE IF NOT EXISTS exercise_types (
    type_id    BIGSERIAL PRIMARY KEY,
    type_name  VARCHAR(64) NOT NULL,
    type_icon  VARCHAR(256),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 动作库
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id        BIGSERIAL PRIMARY KEY,
    type_id            BIGINT NOT NULL REFERENCES exercise_types(type_id),
    exercise_name      VARCHAR(128) NOT NULL,
    exercise_icon      VARCHAR(256),
    description        TEXT,
    difficulty_level   SMALLINT,           -- 1入门 2初级 3中级 4高级
    calories_per_minute NUMERIC(6,2),
    video_url          VARCHAR(512),
    thumbnail_url      VARCHAR(512),
    duration_seconds   INTEGER,
    target_muscles     TEXT[],             -- 目标肌群数组
    status             SMALLINT DEFAULT 1,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_exercises_type_id ON exercises(type_id);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);

-- 用户收藏动作
CREATE TABLE IF NOT EXISTS exercise_favorites (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(user_id),
    exercise_id BIGINT NOT NULL REFERENCES exercises(exercise_id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, exercise_id)
);

-- ==================== 训练记录 ====================

-- 训练记录
CREATE TABLE IF NOT EXISTS workout_records (
    record_id       BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    plan_id         BIGINT REFERENCES workout_plans(plan_id),
    exercise_id     BIGINT REFERENCES exercises(exercise_id),
    start_time      TIMESTAMP NOT NULL,
    end_time        TIMESTAMP,
    duration_seconds INTEGER,
    sets_completed  INTEGER,
    reps_completed  INTEGER,
    calories_burned NUMERIC(8,2),
    heart_rate_avg  INTEGER,
    status          SMALLINT DEFAULT 1, -- 1进行中 2已完成 3已中断
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workout_records_user_id ON workout_records(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_records_plan_id ON workout_records(plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_records_exercise_id ON workout_records(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_records_start_time ON workout_records(start_time);

-- ==================== 打卡与身体数据 ====================

-- 每日打卡
CREATE TABLE IF NOT EXISTS checkin_records (
    checkin_id      BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    checkin_date    DATE NOT NULL,
    checkin_type    SMALLINT NOT NULL,    -- 1训练打卡 2饮食打卡 3综合打卡
    target_achieved SMALLINT,             -- 是否达成目标: 1是 0否
    streak_days     INTEGER,              -- 连续打卡天数
    points          INTEGER,              -- 获得积分
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, checkin_date, checkin_type)
);
CREATE INDEX IF NOT EXISTS idx_checkin_records_user_id ON checkin_records(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_checkin_date ON checkin_records(checkin_date);

-- 体重记录
CREATE TABLE IF NOT EXISTS weight_records (
    record_id   BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(user_id),
    record_date DATE NOT NULL,
    weight      NUMERIC(5,2) NOT NULL,
    bmi         NUMERIC(4,2),
    body_fat_rate NUMERIC(4,2),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_weight_records_user_id ON weight_records(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_record_date ON weight_records(record_date);

-- ==================== 饮食体系 ====================

-- 饮食记录
CREATE TABLE IF NOT EXISTS diet_records (
    record_id   BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(user_id),
    record_date DATE NOT NULL,
    meal_type   SMALLINT NOT NULL,     -- 1早餐 2午餐 3晚餐 4加餐
    food_name   VARCHAR(128) NOT NULL,
    food_type   VARCHAR(64),
    calories    NUMERIC(8,2),
    protein     NUMERIC(8,2),
    carbs       NUMERIC(8,2),
    fat         NUMERIC(8,2),
    weight      NUMERIC(8,2),          -- 份量(g)
    image_url   VARCHAR(512),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_diet_records_user_id ON diet_records(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_records_record_date ON diet_records(record_date);

-- ==================== 课程体系 ====================

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    course_id         BIGSERIAL PRIMARY KEY,
    course_name       VARCHAR(128) NOT NULL,
    coach_name        VARCHAR(64),
    course_type       SMALLINT NOT NULL,    -- 1录播 2直播 3系列课
    category          VARCHAR(64),
    difficulty_level  SMALLINT,             -- 1入门 2初级 3中级 4高级
    duration_minutes  INTEGER,
    thumbnail_url     VARCHAR(512),
    video_url         VARCHAR(512),
    description       TEXT,
    target_users      TEXT,
    calorie_estimate  NUMERIC(8,2),
    price             NUMERIC(10,2) DEFAULT 0,
    enrollment_count  INTEGER DEFAULT 0,
    rating            NUMERIC(2,1),
    status            SMALLINT DEFAULT 1,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(course_type);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);

-- 课程章节
CREATE TABLE IF NOT EXISTS course_chapters (
    chapter_id      BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    chapter_name    VARCHAR(128) NOT NULL,
    chapter_no      INTEGER NOT NULL,
    video_url       VARCHAR(512),
    duration_minutes INTEGER,
    is_free         SMALLINT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_course_chapters_course_id ON course_chapters(course_id);

-- 课程学习进度
CREATE TABLE IF NOT EXISTS course_progress (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(user_id),
    course_id           BIGINT NOT NULL REFERENCES courses(course_id),
    chapter_id          BIGINT NOT NULL REFERENCES course_chapters(chapter_id),
    progress_percent    INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0,
    is_completed        SMALLINT DEFAULT 0,
    last_study_at       TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, chapter_id)
);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_id ON course_progress(course_id);

-- 课程订单
CREATE TABLE IF NOT EXISTS course_orders (
    order_id        BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    course_id       BIGINT NOT NULL REFERENCES courses(course_id),
    order_no        VARCHAR(64) NOT NULL,
    amount          NUMERIC(10,2),
    payment_method  SMALLINT,
    payment_status  SMALLINT DEFAULT 0,  -- 0待支付 1已支付 2已退款 3已取消
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_course_orders_user_id ON course_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_course_orders_course_id ON course_orders(course_id);
CREATE INDEX IF NOT EXISTS idx_course_orders_order_no ON course_orders(order_no);

-- ==================== 积分商城 ====================

-- 商城商品
CREATE TABLE IF NOT EXISTS points_mall (
    item_id         BIGSERIAL PRIMARY KEY,
    item_name       VARCHAR(128) NOT NULL,
    item_type       SMALLINT NOT NULL,    -- 1实物 2虚拟 3优惠券
    points_required INTEGER NOT NULL,
    stock           INTEGER,
    image_url       VARCHAR(512),
    description     TEXT,
    status          SMALLINT DEFAULT 1,   -- 1上架 0下架
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 兑换记录
CREATE TABLE IF NOT EXISTS points_exchange (
    exchange_id     BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    item_id         BIGINT NOT NULL REFERENCES points_mall(item_id),
    points_spent    INTEGER NOT NULL,
    quantity        INTEGER DEFAULT 1,
    status          SMALLINT DEFAULT 0,    -- 0待处理 1已完成 2已取消
    receiver_name   VARCHAR(64),
    receiver_phone  VARCHAR(20),
    receiver_address TEXT,
    exchange_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_points_exchange_user_id ON points_exchange(user_id);
CREATE INDEX IF NOT EXISTS idx_points_exchange_status ON points_exchange(status);

-- ==================== 通知体系 ====================

-- 用户通知
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id),
    title           VARCHAR(128) NOT NULL,
    content         TEXT,
    type            SMALLINT NOT NULL,     -- 1系统 2训练 3饮食 4积分 5课程
    is_read         SMALLINT DEFAULT 0,
    send_time       TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ==================== 种子数据 ====================

-- 用户等级
INSERT INTO user_levels (level_no, level_name, min_points, max_points, benefits) VALUES
    (1, '健身新手',    0,     99,    '基础功能'),
    (2, '坚持学徒',    100,  299,   '解锁进阶课程'),
    (3, '健身达人',    300,  599,   '解锁全部课程 + 专属徽章'),
    (4, '健身精英',    600,  999,   '高级课程 + 专属教练咨询'),
    (5, '健身传奇',    1000, NULL,  '全部特权 + VIP专属活动')
ON CONFLICT DO NOTHING;

-- 动作分类
INSERT INTO exercise_types (type_name, type_icon, description) VALUES
    ('胸部',    'chest',    '胸肌训练动作'),
    ('背部',    'back',     '背部肌群训练'),
    ('肩部',    'shoulder', '肩部三角肌训练'),
    ('腿部',    'leg',      '下肢力量训练'),
    ('手臂',    'arm',      '肱二头肌/三头肌训练'),
    ('腹部',    'abs',      '核心腹肌训练'),
    ('全身',    'fullbody', '全身综合训练'),
    ('有氧',    'cardio',   '心肺功能训练')
ON CONFLICT DO NOTHING;

-- 动作库
INSERT INTO exercises (type_id, exercise_name, description, difficulty_level, calories_per_minute, target_muscles) VALUES
    (1, '标准俯卧撑',        '双手与肩同宽，身体保持一条直线', 2, 7.0,  ARRAY['胸大肌','肱三头肌','三角肌']),
    (1, '宽距俯卧撑',        '双手间距1.5倍肩宽，侧重胸肌外侧', 2, 6.5,  ARRAY['胸大肌','三角肌前束']),
    (1, '钻石俯卧撑',        '双手呈菱形放在胸前，侧重三头肌', 3, 8.0,  ARRAY['肱三头肌','胸大肌内侧']),
    (2, '引体向上',          '正握单杠，下巴过杠',            3, 8.5,  ARRAY['背阔肌','肱二头肌']),
    (2, '哑铃划船',          '单臂哑铃划船，感受背部收缩',    2, 6.0,  ARRAY['背阔肌','斜方肌','肱二头肌']),
    (2, '超人式',            '俯卧同时抬手脚，激活下背',      1, 3.5,  ARRAY['竖脊肌','臀大肌']),
    (3, '哑铃推举',          '坐姿哑铃向上推举过头顶',        2, 6.0,  ARRAY['三角肌前束','三角肌中束']),
    (3, '侧平举',            '站立侧平举，练肩部中束',        2, 5.0,  ARRAY['三角肌中束']),
    (3, '前平举',            '哑铃前平举，练肩部前束',        2, 5.0,  ARRAY['三角肌前束']),
    (4, '自重深蹲',          '双脚与肩同宽，下蹲至大腿平行',  1, 6.0,  ARRAY['股四头肌','臀大肌','腘绳肌']),
    (4, '弓步蹲',            '交替弓步下蹲，练腿部与平衡',    2, 6.5,  ARRAY['股四头肌','臀大肌']),
    (4, '提踵',              '站立提踵，练小腿',              1, 3.0,  ARRAY['腓肠肌','比目鱼肌']),
    (5, '哑铃弯举',          '站立哑铃弯举，练肱二头肌',      2, 4.5,  ARRAY['肱二头肌']),
    (5, '三头臂屈伸',        '椅子辅助臂屈伸，练肱三头肌',    2, 5.0,  ARRAY['肱三头肌']),
    (6, '卷腹',              '仰卧卷腹，上腹发力',            1, 4.0,  ARRAY['腹直肌']),
    (6, '平板支撑',          '前臂支撑保持身体一条直线',      2, 3.5,  ARRAY['腹横肌','腹直肌','竖脊肌']),
    (6, '俄罗斯转体',        '坐姿交替转体，练腹斜肌',        2, 4.5,  ARRAY['腹外斜肌','腹直肌']),
    (6, '仰卧举腿',          '仰卧抬腿至90度，练下腹',        3, 5.0,  ARRAY['腹直肌下部']),
    (7, '波比跳',            '俯卧撑+收腿+跳跃全流程',        3, 10.0, ARRAY['全身肌群']),
    (7, '开合跳',            '站立开合跳，全身有氧',          1, 8.0,  ARRAY['全身肌群']),
    (8, '慢跑',              '原地或户外慢跑',                1, 8.0,  ARRAY['下肢','心肺']),
    (8, '高抬腿',            '原地快速高抬腿',                2, 9.0,  ARRAY['下肢','核心'])
ON CONFLICT DO NOTHING;
