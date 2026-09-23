/* ===== FitBuddy 训练生成引擎 =====
 *
 * 背景：改造前「训练内容」只读 profile.goal 一个字段，引导页（步骤 3）收集的
 * 训练经验、器械、场所、每次时长、每周天数、健康情况全部只写不读。
 * 后果是训练经验页上「如果你选择了任何健康问题，将自动降低训练强度并调整训练参考」
 * 这句承诺完全没有实现——勾了「膝盖疼」照样生成深蹲跳。本文件是这批字段的唯一消费方。
 *
 * 设计原则：
 * 1) 只产出真实存在的内容。动作库限定在 exercise-detail 的 EXERCISE_DATA 之内，
 *    保证点进动作详情页看到的是动作本身，而不是兜底数据。
 * 2) 健康优先。任何安全过滤都宁严勿宽，且**必须让用户看见调整了什么**（safetyNotice）。
 * 3) 同日同期结果稳定。选动作不用随机数，用「日期槽位」做种子，
 *    保证周计划卡片上写的动作和点进去看到的一致。
 */

// 关节负荷 k/b/s：0 无 · 1 轻 · 2 中 · 3 高
// impact：0 低冲击 · 1 中 · 2 高冲击（跳跃、爆发、双脚离地）
// lv：难度 1 入门 · 2 进阶 · 3 高阶
// rank：1 主项 · 2 次项 · 3 孤立/收尾，用于排课顺序
const EX_LIB = {
  // === 下肢 ===
  'squat':              { name: '自重深蹲',       emoji: '🦵', focus: 'legs',   rank: 1, k: 2, b: 1, s: 0, impact: 0, lv: 1, sets: '3组 × 12次',          rest: '组间休息 60秒', detail: '经典下肢训练动作，主要训练臀大肌和股四头肌' },
  'sumo-squat':         { name: '相扑深蹲',       emoji: '🦵', focus: 'legs',   rank: 1, k: 2, b: 1, s: 0, impact: 0, lv: 1, sets: '3组 × 15次',          rest: '组间休息 45秒', detail: '宽站距深蹲，重心更稳，重点刺激大腿内侧' },
  'wall-sit':           { name: '靠墙静蹲',       emoji: '🧱', focus: 'legs',   rank: 1, k: 1, b: 0, s: 0, impact: 0, lv: 1, sets: '3组 × 45秒',          rest: '组间休息 30秒', detail: '静力性下肢训练，无冲击，对膝关节压力小' },
  'lunge':              { name: '弓步蹲',         emoji: '🦵', focus: 'legs',   rank: 1, k: 3, b: 1, s: 0, impact: 0, lv: 2, sets: '3组 × 12次（每侧）',  rest: '组间休息 60秒', detail: '单侧训练动作，改善腿部不平衡，加强核心稳定' },
  'reverse-lunge':      { name: '后撤弓步',       emoji: '🔙', focus: 'legs',   rank: 2, k: 2, b: 1, s: 0, impact: 0, lv: 2, sets: '3组 × 12次（每侧）',  rest: '组间休息 60秒', detail: '后撤步弓步，对膝盖压力小于前弓步' },
  'side-lunge':         { name: '侧弓步',         emoji: '↔️', focus: 'legs',   rank: 2, k: 2, b: 1, s: 0, impact: 0, lv: 2, sets: '3组 × 12次（每侧）',  rest: '组间休息 45秒', detail: '侧向跨步下蹲，刺激大腿内侧' },
  'walking-lunge':      { name: '行走弓步',       emoji: '🚶', focus: 'legs',   rank: 2, k: 3, b: 1, s: 0, impact: 1, lv: 2, sets: '3组 × 20步',          rest: '组间休息 60秒', detail: '行进间交替弓步，提升平衡能力' },
  'bulgarian-split':    { name: '保加利亚分腿蹲', emoji: '🪑', focus: 'legs',   rank: 2, k: 2, b: 1, s: 0, impact: 0, lv: 3, sets: '3组 × 10次（每侧）',  rest: '组间休息 60秒', detail: '后脚垫高的分腿蹲，单侧力量进阶' },
  'jump-squat':         { name: '深蹲跳',         emoji: '⚡', focus: 'cardio', rank: 3, k: 3, b: 1, s: 0, impact: 2, lv: 3, sets: '3组 × 12次',          rest: '组间休息 30秒', detail: '爆发力训练，燃烧大量热量' },
  'jump-lunge':         { name: '跳跃弓步',       emoji: '⚡', focus: 'cardio', rank: 3, k: 3, b: 1, s: 0, impact: 2, lv: 3, sets: '3组 × 10次（每侧）',  rest: '组间休息 60秒', detail: '弓步跳换，爆发力与燃脂双效' },

  // === 臀腿塑形 ===
  'bridge':             { name: '臀桥',           emoji: '🍑', focus: 'glutes', rank: 1, k: 0, b: 1, s: 0, impact: 0, lv: 1, sets: '3组 × 15次',          rest: '组间休息 45秒', detail: '针对臀大肌的孤立训练，改善臀部形态' },
  'side-leg':           { name: '侧卧抬腿',       emoji: '🦵', focus: 'glutes', rank: 1, k: 0, b: 0, s: 0, impact: 0, lv: 1, sets: '3组 × 15次（每侧）',  rest: '组间休息 30秒', detail: '训练臀中肌，改善髋部稳定性和臀部侧方线条' },
  'single-leg-bridge':  { name: '单腿臀桥',       emoji: '🍑', focus: 'glutes', rank: 2, k: 0, b: 1, s: 0, impact: 0, lv: 2, sets: '3组 × 12次（每侧）',  rest: '组间休息 45秒', detail: '单腿支撑顶髋，强化臀部力量不平衡' },
  'clamshell':          { name: '蚌式开合',       emoji: '🦪', focus: 'glutes', rank: 2, k: 0, b: 0, s: 0, impact: 0, lv: 1, sets: '3组 × 20次（每侧）',  rest: '组间休息 30秒', detail: '侧卧屈膝开合，激活臀中肌' },
  'standing-side-leg':  { name: '站姿侧抬腿',     emoji: '🧍', focus: 'glutes', rank: 2, k: 0, b: 0, s: 0, impact: 0, lv: 1, sets: '3组 × 15次（每侧）',  rest: '组间休息 30秒', detail: '站立位侧向抬腿，可扶墙保持平衡' },
  'kneeling-kickback':  { name: '跪姿后踢腿',     emoji: '🧎', focus: 'glutes', rank: 2, k: 1, b: 1, s: 0, impact: 0, lv: 1, sets: '3组 × 15次（每侧）',  rest: '组间休息 30秒', detail: '四点支撑位后踢，强化臀大肌' },
  'barbell-bridge':     { name: '负重臀桥',       emoji: '🏋️', focus: 'glutes', rank: 2, k: 0, b: 1, s: 0, impact: 0, lv: 2, equip: ['哑铃', '壶铃'], sets: '3组 × 12次', rest: '组间休息 60秒', detail: '负重顶髋，提升臀部最大力量' },
  'clamshell-2':        { name: '阻力带蚌式',     emoji: '🦪', focus: 'glutes', rank: 2, k: 0, b: 0, s: 0, impact: 0, lv: 1, equip: ['弹力带'], sets: '3组 × 20次（每侧）', rest: '组间休息 30秒', detail: '弹力带增加阻力，强化臀中肌' },
  'resistance-band-walk': { name: '阻力带侧行走', emoji: '🚶', focus: 'glutes', rank: 3, k: 1, b: 0, s: 0, impact: 0, lv: 2, equip: ['弹力带'], sets: '3组 × 15步（每侧）', rest: '组间休息 30秒', detail: '弹性阻力侧向移动，激活臀中肌' },

  // === 核心 ===
  'mountain-climber':   { name: '登山跑',         emoji: '🔥', focus: 'core',   rank: 1, k: 1, b: 2, s: 2, impact: 1, lv: 2, sets: '3组 × 30秒',          rest: '组间休息 15秒', detail: '核心与全身综合燃脂动作，需保持躯干稳定' },
  'side-plank-leg':     { name: '侧平板抬腿',     emoji: '📊', focus: 'core',   rank: 2, k: 1, b: 2, s: 1, impact: 0, lv: 2, sets: '3组 × 12次（每侧）',  rest: '组间休息 45秒', detail: '侧平板支撑姿态下抬上侧腿，核心进阶' },

  // === 心肺 / 燃脂 ===
  'jumping-jack':       { name: '开合跳',         emoji: '⚡', focus: 'cardio', rank: 1, k: 2, b: 0, s: 1, impact: 2, lv: 1, sets: '3组 × 30秒',          rest: '组间休息 15秒', detail: '全身燃脂动作，快速提升心率' },
  'high-knees':         { name: '高抬腿',         emoji: '🔥', focus: 'cardio', rank: 1, k: 2, b: 0, s: 0, impact: 2, lv: 1, sets: '3组 × 30秒',          rest: '组间休息 15秒', detail: '核心与下肢联动，提高心肺功能' }
};

// 训练类型：focuses 决定动作来源的优先顺序（排在前面的优先取）
const SESSION_TYPES = {
  legs:   { name: '下肢力量训练', sub: '力量训练 · 强化臀腿肌群',   focuses: ['legs', 'glutes'] },
  glutes: { name: '臀部塑形训练', sub: '塑形训练 · 重点激活臀中肌', focuses: ['glutes', 'legs'] },
  core:   { name: '核心稳定训练', sub: '核心训练 · 提升躯干稳定性', focuses: ['core', 'glutes'] },
  cardio: { name: '心肺燃脂训练', sub: '有氧训练 · 提升代谢与心肺耐力', focuses: ['cardio', 'legs'] },
  hiit:   { name: 'HIIT 循环燃脂', sub: '高强度间歇 · 短时高效燃脂', focuses: ['cardio', 'core'] },
  full:   { name: '全身综合训练', sub: '全身训练 · 均衡发展各部位', focuses: ['legs', 'glutes', 'core'] }
};

// 按目标排一周的训练类型（轮转使用，保证同一周内不重复单一部位）
const GOAL_SEQUENCE = {
  fatLoss: ['hiit', 'cardio', 'full', 'cardio', 'hiit', 'full', 'legs'],
  muscle:  ['legs', 'full', 'glutes', 'legs', 'full', 'glutes', 'legs'],
  shape:   ['legs', 'cardio', 'glutes', 'full', 'legs', 'full', 'glutes']
};

// 每周训练 N 天时，训练日落在周几（1=周一 … 7=周日）
const TRAINING_DAYS = {
  1: [4],
  2: [2, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 6],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
  7: [1, 2, 3, 4, 5, 6, 7]
};

// 热身池（含健康过滤所需标注）
const WARMUP_POOL = [
  { id: 'jumping-jack',  name: '开合跳',     emoji: '⚡', detail: '全身燃脂热身，快速提升心率',       sec: 30, sets: '1组 × 30秒', k: 2, b: 0, s: 1, impact: 2 },
  { id: 'high-knees',    name: '高抬腿',     emoji: '🔥', detail: '核心与下肢联动，激活心肺功能',       sec: 30, sets: '1组 × 30秒', k: 2, b: 0, s: 0, impact: 2 },
  { id: 'hip-circles',   name: '髋关节环绕', emoji: '🔄', detail: '活动髋关节，预防运动损伤',           sec: 30, sets: '1组 × 30秒', k: 0, b: 0, s: 0, impact: 0 },
  { id: 'ankle-circles', name: '踝关节活动', emoji: '🦶', detail: '唤醒踝关节，提升落地稳定性',         sec: 20, sets: '1组 × 20秒', k: 0, b: 0, s: 0, impact: 0 },
  { id: 'jog-in-place',  name: '原地慢跑',   emoji: '🏃', detail: '低强度有氧，逐步升高体温',           sec: 45, sets: '1组 × 45秒', k: 1, b: 0, s: 0, impact: 0 },
  { id: 'arm-circles',   name: '手臂环绕',   emoji: '🤸', detail: '放松肩袖肌群，改善肩关节活动度',     sec: 20, sets: '1组 × 20秒', k: 0, b: 0, s: 0, impact: 0 },
  { id: 'chest-open',    name: '扩胸运动',   emoji: '💪', detail: '打开胸廓，激活胸背肌群',             sec: 20, sets: '1组 × 20秒', k: 0, b: 0, s: 0, impact: 0 },
  { id: 'calf-raise',    name: '提踵',       emoji: '🦵', detail: '激活小腿与跟腱，增强踝关节刚性',     sec: 20, sets: '1组 × 20秒', k: 0, b: 0, s: 0, impact: 0 },
  { id: 'cat-cow',       name: '拳击出拳',   emoji: '🥊', detail: '原地交替直拳摆拳，激活肩部与上肢爆发力', sec: 30, sets: '1组 × 30秒', k: 0, b: 0, s: 2, impact: 1 },
  { id: 'side-shuffle',  name: '侧滑步',     emoji: '⛹️', detail: '动态横向移动，激活臀中肌',           sec: 30, sets: '1组 × 30秒', k: 1, b: 0, s: 0, impact: 1 }
];
const WARMUP_DEFAULT = ['jumping-jack', 'high-knees', 'hip-circles', 'ankle-circles'];

// 拉伸池（含健康过滤所需标注）
const STRETCH_POOL = [
  { id: 'stretch-quad',      name: '股四头肌拉伸', emoji: '🦵', detail: '站姿屈膝抓脚踝，拉伸大腿前侧',       sets: '每侧 30秒 × 2组', sec: 30, k: 1, b: 0, s: 0 },
  { id: 'stretch-hamstring', name: '腘绳肌拉伸',   emoji: '🦵', detail: '坐姿前屈或站姿体前屈，拉伸大腿后侧', sets: '每侧 30秒 × 2组', sec: 30, k: 0, b: 1, s: 0 },
  { id: 'stretch-glute',     name: '臀大肌拉伸',   emoji: '🍑', detail: '仰卧4字拉伸，缓解臀部深层紧张',       sets: '每侧 30秒 × 2组', sec: 30, k: 1, b: 1, s: 0 },
  { id: 'stretch-child',     name: '婴儿式放松',   emoji: '🧘', detail: '跪姿臀部坐脚跟，前倾延伸背部',       sets: '1组 × 60秒',       sec: 60, k: 1, b: 1, s: 0 },
  { id: 'stretch-calf',      name: '小腿拉伸',     emoji: '🦶', detail: '弓步推墙或台阶拉伸，缓解小腿紧绷',   sets: '每侧 30秒 × 2组', sec: 30, k: 0, b: 0, s: 0 },
  { id: 'stretch-hip',       name: '髋屈肌拉伸',   emoji: '🔄', detail: '弓步下沉髋部，打开髋关节前侧',       sets: '每侧 30秒 × 2组', sec: 30, k: 1, b: 1, s: 0 },
  { id: 'stretch-spine',     name: '猫牛式',       emoji: '🐈', detail: '四足跪姿脊柱流动，舒缓腰背紧张',     sets: '1组 × 10次缓慢流动', sec: 30, k: 1, b: 1, s: 0 },
  { id: 'stretch-cobra',     name: '眼镜蛇式',     emoji: '🐍', detail: '俯卧撑起上身，伸展腹直肌与前链',     sets: '保持 30秒 × 2组', sec: 30, k: 0, b: 2, s: 1 },
  { id: 'stretch-shoulder',  name: '肩部拉伸',     emoji: '💪', detail: '交叉手臂跨胸前，放松三角肌后束',     sets: '每侧 30秒 × 2组', sec: 30, k: 0, b: 0, s: 0 },
  { id: 'stretch-pigeon',    name: '鸽子式',       emoji: '🕊️', detail: '深度打开髋关节，进阶拉伸臀外旋肌',   sets: '每侧 45秒 × 1组', sec: 45, k: 2, b: 1, s: 0 }
];
const STRETCH_DEFAULT = ['stretch-quad', 'stretch-hamstring', 'stretch-glute', 'stretch-child'];

// 健康问题 → 过滤规则
// jointLimit：该部位负荷不得超过此值（默认 3 即不限制）
// noImpact：禁用高冲击动作（impact >= 2）
// maxLevel：难度上限
// systemic：是否属于需要整体降量的系统性风险
const HEALTH_RULES = [
  { id: '膝盖疼',   part: 'k', jointLimit: 1 },
  { id: '腰疼',     part: 'b', jointLimit: 1 },
  { id: '肩颈疼',   part: 's', jointLimit: 1 },
  { id: '高血压',   noImpact: true, systemic: true, advice: '训练中注意监测血压，避免憋气发力' },
  { id: '心脏病',   noImpact: true, systemic: true, maxLevel: 1, advice: '有心脏疾病史，请务必先获得医生许可' },
  { id: '孕期',     noImpact: true, systemic: true, maxLevel: 1, advice: '孕期训练请先咨询产科医生' },
  { id: '术后恢复', noImpact: true, systemic: true, maxLevel: 1, advice: '术后恢复期请遵医嘱，避免超出康复范围' },
  { id: '糖尿病',   systemic: true, maxLevel: 2, advice: '建议随身携带糖块，避免空腹训练' },
  { id: '其它疾病', systemic: false, advice: '如有其它疾病，请先咨询医生' }
];

const EXPERIENCE_LEVEL = {
  '完全小白': 1,
  '训练不足半年': 2,
  '训练1年': 3,
  '训练3年以上': 3
};

function getDaysPerWeek(p) {
  const n = parseInt((p && p.daysPerWeek) || 4, 10);
  if (isNaN(n) || n < 1) return 4;
  if (n > 7) return 7;
  return n;
}

function getSessionMinutes(p) {
  const raw = (p && p.minutesPerSession) || '30分钟';
  const m = String(raw).match(/(\d+)/);
  const v = m ? parseInt(m[1], 10) : 30;
  return v > 0 ? v : 30;
}

function getExerciseCount(minutes) {
  if (minutes <= 20) return 3;
  if (minutes <= 30) return 4;
  if (minutes <= 45) return 5;
  return 6;
}

function getSetsDelta(p) {
  const minutes = getSessionMinutes(p);
  const exp = (p && p.experience) || '';
  let delta = 0;
  if (minutes <= 20) delta -= 1;          // 时间不够，减少组数而不是砍动作
  if (exp === '训练3年以上') delta += 1;  // 老手可加量
  return delta;
}

// 把档案换算成一组过滤条件；同时记录「因为什么被限制」，用于生成安全提示
function buildFlags(p) {
  const health = (p && p.healthIssues) || [];
  const flags = {
    health: health,
    kneeLimit: 3,
    backLimit: 3,
    shoulderLimit: 3,
    noImpact: false,
    maxLevel: EXPERIENCE_LEVEL[(p && p.experience) || ''] || 2,
    systemic: false,
    advices: [],
    reasons: []
  };

  health.forEach(function (h) {
    const rule = HEALTH_RULES.filter(function (r) { return r.id === h; })[0];
    if (!rule) return;
    if (rule.jointLimit !== undefined) {
      if (rule.part === 'k') flags.kneeLimit = Math.min(flags.kneeLimit, rule.jointLimit);
      if (rule.part === 'b') flags.backLimit = Math.min(flags.backLimit, rule.jointLimit);
      if (rule.part === 's') flags.shoulderLimit = Math.min(flags.shoulderLimit, rule.jointLimit);
      flags.reasons.push(h);
    }
    if (rule.noImpact) flags.noImpact = true;
    if (rule.systemic) flags.systemic = true;
    if (rule.maxLevel !== undefined) flags.maxLevel = Math.min(flags.maxLevel, rule.maxLevel);
    if (rule.noImpact || rule.systemic) flags.reasons.push(h);
    if (rule.advice) flags.advices.push(rule.advice);
  });

  return flags;
}

function isAllowed(meta, flags, equipment) {
  if (!meta) return false;
  if (meta.k > flags.kneeLimit) return false;
  if (meta.b > flags.backLimit) return false;
  if (meta.s > flags.shoulderLimit) return false;
  if (flags.noImpact && meta.impact >= 2) return false;
  if (meta.lv > flags.maxLevel) return false;
  if (meta.equip && meta.equip.length) {
    const owned = equipment || [];
    const ok = meta.equip.some(function (e) { return owned.indexOf(e) >= 0; });
    if (!ok) return false;
  }
  return true;
}

function toSessionItem(exId, meta, setCount) {
  // 按 setCount 改写组数：'3组 × 12次' → '2组 × 12次'
  const sets = String(meta.sets).replace(/^\d+组/, setCount + '组');
  return {
    exId: exId,
    name: meta.name,
    emoji: meta.emoji,
    detail: meta.detail,
    sets: sets,
    rest: meta.rest,
    focus: meta.focus
  };
}

function poolFor(focus, flags, equipment) {
  return Object.keys(EX_LIB)
    .filter(function (id) { return EX_LIB[id].focus === focus; })
    .filter(function (id) { return isAllowed(EX_LIB[id], flags, equipment); })
    .sort(function (a, b) {
      if (EX_LIB[a].rank !== EX_LIB[b].rank) return EX_LIB[a].rank - EX_LIB[b].rank;
      return a < b ? -1 : 1;
    });
}

function blockedNames(focuses, flags, equipment) {
  // 仅因健康限制被排除的动作名（不包含器械/难度原因），用于向用户交代
  const relaxed = Object.assign({}, flags, {
    kneeLimit: 3, backLimit: 3, shoulderLimit: 3, noImpact: false, maxLevel: 3
  });
  const out = [];
  focuses.forEach(function (f) {
    Object.keys(EX_LIB).filter(function (id) { return EX_LIB[id].focus === f; }).forEach(function (id) {
      const m = EX_LIB[id];
      if (isAllowed(m, relaxed, equipment) && !isAllowed(m, flags, equipment)) {
        if (out.indexOf(m.name) < 0) out.push(m.name);
      }
    });
  });
  return out;
}

function pickExercises(type, flags, equipment, count, seed) {
  const buckets = type.focuses.map(function (f) { return poolFor(f, flags, equipment); });
  const picked = [];

  // 第一轮：按 focus 优先级轮流取，保证主项优先且不重复
  for (let round = 0; round < count; round++) {
    for (let i = 0; i < buckets.length; i++) {
      if (picked.length >= count) break;
      const list = buckets[i];
      if (!list.length) continue;
      // 用 seed 做偏移，使不同训练日的选动作有差异，但对同一天稳定
      const idx = (round + seed) % list.length;
      for (let t = 0; t < list.length; t++) {
        const cand = list[(idx + t) % list.length];
        if (picked.indexOf(cand) < 0) { picked.push(cand); break; }
      }
    }
    if (picked.length >= count) break;
  }

  // 第二轮：主项池不够时，从全部可用动作里按 rank 补齐
  if (picked.length < count) {
    const all = Object.keys(EX_LIB)
      .filter(function (id) { return isAllowed(EX_LIB[id], flags, equipment); })
      .sort(function (a, b) {
        if (EX_LIB[a].rank !== EX_LIB[b].rank) return EX_LIB[a].rank - EX_LIB[b].rank;
        return a < b ? -1 : 1;
      });
    for (let i = 0; i < all.length && picked.length < count; i++) {
      if (picked.indexOf(all[i]) < 0) picked.push(all[i]);
    }
  }

  return picked;
}

function buildWarmups(selectedIds, p) {
  const flags = buildFlags(p || {});
  const equipment = (p && p.equipment) || [];
  const pool = WARMUP_POOL.filter(function (w) { return isAllowed(w, flags, equipment); });
  const wanted = (selectedIds && selectedIds.length) ? selectedIds : WARMUP_DEFAULT.slice();
  const picked = [];
  wanted.forEach(function (id) {
    const w = WARMUP_POOL.filter(function (x) { return x.id === id; })[0];
    if (w && isAllowed(w, flags, equipment) && picked.indexOf(id) < 0) picked.push(id);
  });
  // 用户选的动作被健康规则挡掉时，用可用池补齐，避免热身被清空
  pool.forEach(function (w) {
    const need = getWarmupTarget(p);
    if (picked.length >= need) return;
    if (picked.indexOf(w.id) < 0) picked.push(w.id);
  });

  return withTimer(picked.map(function (id, idx) {
    const w = WARMUP_POOL.filter(function (x) { return x.id === id; })[0] || pool[0] || WARMUP_POOL[0];
    const dur = w.sec + '秒';
    const setsLabel = w.sets && w.sets.indexOf('组') >= 0 ? w.sets : ('1组 × ' + dur);
    return { id: w.id, name: w.name, emoji: w.emoji, detail: w.detail, rest: dur, sets: setsLabel, done: false, num: idx + 1 };
  }), 300);
}

function buildStretches(selectedIds, p) {
  const flags = buildFlags(p || {});
  const equipment = (p && p.equipment) || [];
  const pool = STRETCH_POOL.filter(function (s) { return isAllowed(s, flags, equipment); });
  const wanted = (selectedIds && selectedIds.length) ? selectedIds : STRETCH_DEFAULT.slice();
  const picked = [];
  wanted.forEach(function (id) {
    const s = STRETCH_POOL.filter(function (x) { return x.id === id; })[0];
    if (s && isAllowed(s, flags, equipment) && picked.indexOf(id) < 0) picked.push(id);
  });
  pool.forEach(function (s) {
    const need = getWarmupTarget(p);
    if (picked.length >= need) return;
    if (picked.indexOf(s.id) < 0) picked.push(s.id);
  });

  return withTimer(picked.map(function (id, idx) {
    const s = STRETCH_POOL.filter(function (x) { return x.id === id; })[0] || pool[0] || STRETCH_POOL[0];
    const detail = s.sets + ' · ' + s.detail.replace(/，.*/, '');
    return { id: s.id, name: s.name, emoji: s.emoji, detail: detail, rest: s.sets, sets: s.sets, done: false, num: idx + 1 };
  }), 30);
}

function getWarmupTarget(p) {
  return getSessionMinutes(p) <= 20 ? 3 : 4;
}

function getWarmupCandidates(p) {
  const flags = buildFlags(p || {});
  const equipment = (p && p.equipment) || [];
  return WARMUP_POOL.filter(function (w) { return isAllowed(w, flags, equipment); });
}

function getStretchCandidates(p) {
  const flags = buildFlags(p || {});
  const equipment = (p && p.equipment) || [];
  return STRETCH_POOL.filter(function (s) { return isAllowed(s, flags, equipment); });
}

// 过滤「自由替换动作」候选：换动作也不能换出个伤膝盖的
function filterSwaps(swaps, p) {
  const flags = buildFlags(p || {});
  const equipment = (p && p.equipment) || [];
  return (swaps || []).filter(function (s) {
    const meta = EX_LIB[s.exId];
    if (!meta) return true; // 库外动作不做健康判断，只做原有展示
    return isAllowed(meta, flags, equipment);
  });
}

function withTimer(items, fallback) {
  return (items || []).map(function (it) {
    const sec = parseSetDuration(it, fallback);
    const total = parseTotalSets(it);
    return Object.assign({}, it, {
      timerDefaultSec: sec,
      timerSec: sec,
      timerDisplay: formatTimer(sec),
      timerState: '',
      timerBtnLabel: '开始',
      totalSets: total,
      completedSets: 0
    });
  });
}

function parseSetDuration(item, fallback) {
  if (item && item.sec && item.sec > 0) return item.sec;
  if (item && item.sets) {
    const m = String(item.sets).match(/(\d+)\s*秒/);
    if (m) return Math.max(5, parseInt(m[1], 10));
  }
  return (fallback !== undefined ? fallback : 30);
}

function parseTotalSets(item) {
  const sources = [item.sets, item.detail];
  for (let i = 0; i < sources.length; i++) {
    if (!sources[i]) continue;
    const m = String(sources[i]).match(/(\d+)\s*组/);
    if (m) return parseInt(m[1], 10);
  }
  if (item.sec && item.sec > 0) return 1;
  return 0;
}

function formatTimer(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function goalSequence(goal) {
  if (goal && goal.indexOf('减脂') >= 0) return GOAL_SEQUENCE.fatLoss;
  if (goal && goal.indexOf('增肌') >= 0) return GOAL_SEQUENCE.muscle;
  return GOAL_SEQUENCE.shape;
}

// 生成一次训练内容。slot 用于让同周不同训练日内容不同（同一天始终稳定）
function buildSession(p, typeKey, slot) {
  const profile = p || {};
  const flags = buildFlags(profile);
  const equipment = profile.equipment || [];
  const type = SESSION_TYPES[typeKey] || SESSION_TYPES.legs;
  const minutes = getSessionMinutes(profile);
  const count = getExerciseCount(minutes);
  const seed = (slot || 0) + (profile.exerciseSeed || 0);
  const setsDelta = getSetsDelta(profile) + (flags.systemic ? -1 : 0);

  const ids = pickExercises(type, flags, equipment, count, seed);
  const items = ids.map(function (id) {
    const meta = EX_LIB[id];
    const base = parseInt((String(meta.sets).match(/^(\d+)组/) || [0, 3])[1], 10) || 3;
    const setCount = Math.max(2, Math.min(4, base + setsDelta));
    return toSessionItem(id, meta, setCount);
  });

  const blocked = blockedNames(type.focuses, flags, equipment);
  const cardioPicked = ids.filter(function (id) { return EX_LIB[id].impact >= 2; }).length;
  const lowered = flags.noImpact || flags.kneeLimit < 3 || flags.backLimit < 3 || flags.shoulderLimit < 3;

  // 标题纠偏：高冲击动作为 0 时不能再叫 HIIT / 燃脂，按类型给不同的低冲击替代名，
  // 否则同周多天会出现多张同名卡片（如「低冲击燃脂训练」重复两次）。
  const LOW_IMPACT_NAMES = {
    hiit: { name: '低冲击循环训练', sub: '低冲击间歇 · 保护关节' },
    cardio: { name: '低强度有氧训练', sub: '低强度有氧 · 保护关节' }
  };
  let name = type.name;
  let sub = type.sub;
  if (LOW_IMPACT_NAMES[typeKey] && cardioPicked === 0 && lowered) {
    name = LOW_IMPACT_NAMES[typeKey].name;
    sub = LOW_IMPACT_NAMES[typeKey].sub;
  }

  // 消耗估算：按训练类型给不同强度系数，并在界面上标注为估算值
  const kcalPerMin = { hiit: 11, cardio: 9, full: 8, legs: 8, glutes: 7, core: 7 }[typeKey] || 8;
  const calories = Math.round(minutes * kcalPerMin * (lowered ? 0.85 : 1));

  return {
    typeKey: typeKey,
    name: name,
    sub: sub,
    minutes: minutes,
    calories: calories,
    warmupIds: buildWarmups(null, profile).map(function (w) { return w.id; }),
    stretchIds: buildStretches(null, profile).map(function (s) { return s.id; }),
    exercises: items,
    adjusted: lowered,
    blockedNames: blocked,
    setsDelta: setsDelta,
    safetyNotice: buildSafetyNotice(profile, flags, blocked, setsDelta)
  };
}

function buildSafetyNotice(p, flags, blocked, setsDelta) {
  const health = (p && p.healthIssues) || [];
  const real = health.filter(function (h) { return h !== '没有以上情况'; });
  if (!real.length) return '';

  const parts = [];
  if (blocked.length) {
    // 列 5 个以上时只列 4 个再报总数，避免「列 5 个却说 6 个」的歧义
    const shown = blocked.slice(0, blocked.length > 5 ? 4 : blocked.length).join('、');
    const more = blocked.length > 5 ? ' 等 ' + blocked.length + ' 个动作' : '';
    parts.push('已避开 ' + shown + more);
  }
  if (flags.noImpact) parts.push('已排除跳跃等高冲击动作');
  if (setsDelta < 0) parts.push('组数已下调，降低单次负荷');
  if (!parts.length) parts.push('已按健康状况调整训练构成');

  let notice = '因「' + real.join('、') + '」，' + parts.join('，') + '。';
  if (flags.advices.length) notice += flags.advices.slice(0, 2).join('；') + '。';
  notice += '如训练中出现不适请立即停止。';
  return notice;
}

// 生成一周计划：训练日数量与分布由 daysPerWeek 决定，内容由档案决定
function buildWeekPlan(p) {
  const profile = p || {};
  const daysPerWeek = getDaysPerWeek(profile);
  const pattern = TRAINING_DAYS[daysPerWeek] || TRAINING_DAYS[3];
  const sequence = goalSequence(profile.goal);
  const flags = buildFlags(profile);
  const equipment = profile.equipment || [];
  const setsDelta = getSetsDelta(profile) + (flags.systemic ? -1 : 0);
  // 一周里所有会出现的训练类型合起来算被避开的动作，避免提示与实际不符
  const focuses = [];
  sequence.forEach(function (t) {
    (SESSION_TYPES[t] ? SESSION_TYPES[t].focuses : []).forEach(function (f) {
      if (focuses.indexOf(f) < 0) focuses.push(f);
    });
  });
  const safety = buildSafetyNotice(profile, flags, blockedNames(focuses, flags, equipment), setsDelta);
  const days = [];
  let slot = 0;
  let restIndex = 0;

  for (let i = 1; i <= 7; i++) {
    const isTraining = pattern.indexOf(i) >= 0;
    if (isTraining) {
      const typeKey = sequence[slot % sequence.length];
      const s = buildSession(profile, typeKey, slot);
      slot++;
      days.push({
        isRest: false,
        typeKey: typeKey,
        name: s.name,
        desc: s.exercises.slice(0, 3).map(function (e) { return e.name; }).join(' · '),
        meta: [s.minutes + '分钟', s.exercises.length + '个动作'],
        minutes: s.minutes,
        calories: s.calories
      });
    } else {
      const gentle = restIndex % 2 === 0;
      restIndex++;
      days.push({
        isRest: true,
        typeKey: null,
        name: gentle ? '休息 + 拉伸恢复' : '完全休息',
        desc: gentle ? '泡沫轴放松 · 静态拉伸' : '充足睡眠 · 补充营养 · 轻度散步',
        meta: gentle ? ['20分钟'] : ['恢复日'],
        minutes: gentle ? 20 : 0,
        calories: gentle ? 50 : 0
      });
    }
  }

  return {
    days: days,
    trainingCount: pattern.length,
    daysPerWeek: daysPerWeek,
    safetyNotice: safety
  };
}

// 今日建议训练的类型（周计划里今天的槽位；今天不是训练日则给第一个训练类型）
function getTodayTypeKey(p, weekOffset) {
  const profile = p || {};
  const daysPerWeek = getDaysPerWeek(profile);
  const pattern = TRAINING_DAYS[daysPerWeek] || TRAINING_DAYS[3];
  const sequence = goalSequence(profile.goal);
  const offset = weekOffset || 0;
  const now = new Date();
  const dow = now.getDay() === 0 ? 7 : now.getDay(); // 1=周一
  const today = dow + offset * 7;
  const idx = pattern.indexOf(((today - 1) % 7) + 1);
  const slot = idx >= 0 ? (Math.floor((today - 1) / 7) * pattern.length + idx) : 0;
  return sequence[slot % sequence.length];
}

module.exports = {
  EX_LIB: EX_LIB,
  SESSION_TYPES: SESSION_TYPES,
  WARMUP_POOL: WARMUP_POOL,
  STRETCH_POOL: STRETCH_POOL,
  WARMUP_DEFAULT: WARMUP_DEFAULT,
  STRETCH_DEFAULT: STRETCH_DEFAULT,
  getDaysPerWeek: getDaysPerWeek,
  getSessionMinutes: getSessionMinutes,
  getExerciseCount: getExerciseCount,
  getWarmupTarget: getWarmupTarget,
  buildFlags: buildFlags,
  buildWarmups: buildWarmups,
  buildStretches: buildStretches,
  getWarmupCandidates: getWarmupCandidates,
  getStretchCandidates: getStretchCandidates,
  filterSwaps: filterSwaps,
  withTimer: withTimer,
  formatTimer: formatTimer,
  parseSetDuration: parseSetDuration,
  parseTotalSets: parseTotalSets,
  buildSession: buildSession,
  buildWeekPlan: buildWeekPlan,
  getTodayTypeKey: getTodayTypeKey
};
