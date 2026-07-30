const { Store } = require('../../utils/store');

const DEFAULT_TIMER_SEC = 30;
const WARMUP_TIMER_SEC = 300;

// 动作 emoji（用于换动作弹窗的「当前动作」展示）
const EX_EMOJI = {
  'squat': '🦵', 'bridge': '🍑', 'lunge': '🦵', 'side-leg': '🍑',
  'jumping-jack': '⚡', 'high-knees': '🔥', 'jump-squat': '⚡', 'mountain-climber': '🔥'
};

// v2.1 自由替换动作：每个正式训练动作的替身动作池（必须和原动作同名/同类型变式）
const SWAP_POOL = {
  'squat': [
    { exId: 'sumo-squat', name: '相扑深蹲', emoji: '🦵', detail: '宽站距深蹲，重点刺激大腿内侧', sets: '3组 × 15次', rest: '组间休息 45秒', tags: ['内收肌', '塑形'] },
    { exId: 'jump-squat', name: '跳跃深蹲', emoji: '⚡', detail: '爆发力训练，提升心率燃脂效率', sets: '3组 × 12次', rest: '组间休息 45秒', tags: ['燃脂', '高强度'] },
    { exId: 'box-squat', name: '箱式深蹲', emoji: '📦', detail: '坐椅式下蹲，强化离心控制', sets: '3组 × 12次', rest: '组间休息 45秒', tags: ['控制', '护膝盖'] },
    { exId: 'pause-squat', name: '暂停深蹲', emoji: '⏸️', detail: '底部停顿2秒，增加肌张力', sets: '3组 × 10次', rest: '组间休息 60秒', tags: ['肌张力', '进阶'] }
  ],
  'bridge': [
    { exId: 'single-leg-bridge', name: '单腿臀桥', emoji: '🍑', detail: '单腿支撑顶髋，强化臀部力量不平衡', sets: '3组 × 12次（每侧）', rest: '组间休息 45秒', tags: ['进阶', '单侧'] },
    { exId: 'feet-elevated-bridge', name: '高位臀桥', emoji: '🪑', detail: '双脚垫高，增大臀大肌拉伸', sets: '3组 × 15次', rest: '组间休息 45秒', tags: ['拉伸', '塑形'] },
    { exId: 'frog-bridge', name: '蛙式臀桥', emoji: '🐸', detail: '脚心相对，强化臀中肌发力', sets: '3组 × 15次', rest: '组间休息 30秒', tags: ['臀中肌', '激活'] },
    { exId: 'hold-bridge', name: '静止臀桥', emoji: '⏱️', detail: '顶峰收缩保持，提升臀部耐力', sets: '3组 × 45秒', rest: '组间休息 30秒', tags: ['耐力', '低冲击'] }
  ],
  'lunge': [
    { exId: 'reverse-lunge', name: '反向弓步蹲', emoji: '🔙', detail: '后撤步弓步，对膝盖压力小于前弓步', sets: '3组 × 12次（每侧）', rest: '组间休息 60秒', tags: ['护膝盖', '低冲击'] },
    { exId: 'side-lunge', name: '侧弓步蹲', emoji: '↔️', detail: '侧向跨步下蹲，刺激大腿内侧', sets: '3组 × 12次（每侧）', rest: '组间休息 45秒', tags: ['内收肌', '变化方向'] },
    { exId: 'walking-lunge', name: '行走弓步蹲', emoji: '🚶', detail: '行进间交替弓步，提升平衡能力', sets: '3组 × 20步', rest: '组间休息 60秒', tags: ['功能性', '动态'] },
    { exId: 'jump-lunge', name: '跳跃弓步蹲', emoji: '⚡', detail: '弓步跳换，爆发力+燃脂双效', sets: '3组 × 10次（每侧）', rest: '组间休息 60秒', tags: ['高强度', '燃脂'] }
  ],
  'side-leg': [
    { exId: 'clamshell', name: '蚌式开合', emoji: '🦪', detail: '侧卧屈膝开合，激活臀中肌', sets: '3组 × 20次（每侧）', rest: '组间休息 30秒', tags: ['臀中肌', '低冲击'] },
    { exId: 'side-plank-leg', name: '侧平板抬腿', emoji: '📊', detail: '侧平板支撑姿态下抬上侧腿，难度进阶', sets: '3组 × 12次（每侧）', rest: '组间休息 45秒', tags: ['高强度', '核心'] },
    { exId: 'standing-side-leg', name: '站姿侧抬腿', emoji: '🧍', detail: '站立位侧向抬腿，可扶墙保持平衡', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒', tags: ['低冲击', '简单'] },
    { exId: 'kneeling-side-leg', name: '跪姿侧抬腿', emoji: '🧎', detail: '四点支撑位侧向抬腿，更稳定', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒', tags: ['稳定', '臀中肌'] }
  ],
  'jumping-jack': [
    { exId: 'side-jack', name: '侧向开合跳', emoji: '⚡', detail: '左右脚交替侧向开合，减少肩部冲击', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['低冲击', '燃脂'] },
    { exId: 'cross-jack', name: '交叉开合跳', emoji: '🔥', detail: '手脚交叉开合，增加协调难度', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['协调', '燃脂'] },
    { exId: 'squat-jack', name: '深蹲开合跳', emoji: '🦵', detail: '开合同时加入深蹲，强化下肢', sets: '3组 × 20次', rest: '组间休息 20秒', tags: ['下肢', '燃脂'] },
    { exId: 'clap-jack', name: '击掌开合跳', emoji: '👏', detail: '跳起在头顶击掌，增加上肢参与', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['上肢', '燃脂'] }
  ],
  'high-knees': [
    { exId: 'fast-knee', name: '快速高抬腿', emoji: '⚡', detail: '加快频率高抬膝，冲刺感', sets: '3组 × 20秒', rest: '组间休息 15秒', tags: ['高强度'] },
    { exId: 'march-knee', name: '原地高抬腿', emoji: '🔥', detail: '控制节奏原地抬膝，稳定心肺', sets: '3组 × 45秒', rest: '组间休息 15秒', tags: ['低冲击'] },
    { exId: 'punch-knee', name: '高抬腿冲拳', emoji: '👊', detail: '抬膝同时对侧出拳，激活上肢', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['上肢', '协调'] },
    { exId: 'side-knee', name: '侧向高抬腿', emoji: '↔️', detail: '左右转体抬膝，强化侧腹', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['侧腹', '协调'] }
  ],
  'jump-squat': [
    { exId: 'continuous-jump-squat', name: '连续跳跃深蹲', emoji: '🔥', detail: '落地即起，保持连续爆发', sets: '3组 × 15次', rest: '组间休息 30秒', tags: ['燃脂', '爆发'] },
    { exId: 'turn-jump-squat', name: '转体深蹲跳', emoji: '🔄', detail: '跳起转体180度，增加方向控制', sets: '3组 × 12次', rest: '组间休息 30秒', tags: ['协调', '爆发'] },
    { exId: 'single-leg-jump-squat', name: '单腿深蹲跳', emoji: '🦵', detail: '单腿落地缓冲，提升单侧爆发', sets: '3组 × 8次（每侧）', rest: '组间休息 30秒', tags: ['单侧', '高强度'] },
    { exId: 'hands-behind-jump-squat', name: '抱头深蹲跳', emoji: '🤲', detail: '双手抱头深蹲跳，核心参与更多', sets: '3组 × 12次', rest: '组间休息 30秒', tags: ['核心', '爆发'] }
  ],
  'mountain-climber': [
    { exId: 'spider-climber', name: '蜘蛛式登山跑', emoji: '🕷️', detail: '膝盖外展提膝，侧腹训练', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['侧腹', '燃脂'] },
    { exId: 'side-climber', name: '侧向登山跑', emoji: '🔥', detail: '膝盖向同侧肘部提，旋转核心', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['旋转', '核心'] },
    { exId: 'cross-climber', name: '交叉登山跑', emoji: '⚡', detail: '膝盖对角提膝，全身协调', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['协调', '燃脂'] },
    { exId: 'slow-climber', name: '慢速登山跑', emoji: '🐢', detail: '慢速控制提膝，强化核心稳定', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['核心', '低冲击'] }
  ]
};

// 动态热身：可选热身动作池（点「选择动作」弹出，可勾选本次要做的项目）
const WARMUP_POOL = [
  { id: 'jumping-jack',  name: '开合跳',     emoji: '⚡', detail: '全身燃脂热身，快速提升心率', sec: 30, sets: '1组 × 30秒' },
  { id: 'high-knees',    name: '高抬腿',     emoji: '🔥', detail: '核心与下肢联动，激活心肺功能', sec: 30, sets: '1组 × 30秒' },
  { id: 'hip-circles',   name: '髋关节环绕', emoji: '🔄', detail: '活动髋关节，预防运动损伤', sec: 30, sets: '1组 × 30秒' },
  { id: 'ankle-circles', name: '踝关节活动', emoji: '🦶', detail: '唤醒踝关节，提升落地稳定性', sec: 20, sets: '1组 × 20秒' },
  { id: 'jog-in-place',  name: '原地慢跑',   emoji: '🏃', detail: '低强度有氧，逐步升高体温', sec: 45, sets: '1组 × 45秒' },
  { id: 'arm-circles',   name: '手臂环绕',   emoji: '🤸', detail: '放松肩袖肌群，改善肩关节活动度', sec: 20, sets: '1组 × 20秒' },
  { id: 'chest-open',    name: '扩胸运动',   emoji: '💪', detail: '打开胸廓，激活胸背肌群', sec: 20, sets: '1组 × 20秒' },
  { id: 'calf-raise',    name: '提踵',       emoji: '🦵', detail: '激活小腿与跟腱，增强踝关节刚性', sec: 20, sets: '1组 × 20秒' },
  { id: 'cat-cow',       name: '拳击出拳',   emoji: '🥊', detail: '原地交替直拳摆拳，激活肩部与上肢爆发力', sec: 30, sets: '1组 × 30秒' },
  { id: 'side-shuffle',  name: '侧滑步',     emoji: '⛹️', detail: '动态横向移动，激活臀中肌', sec: 30, sets: '1组 × 30秒' }
];
const WARMUP_DEFAULT = ['jumping-jack', 'high-knees', 'hip-circles', 'ankle-circles'];

// 训练后拉伸：可选拉伸动作池（点「选择动作」弹出，可勾选本次要做的项目）
// 与原型 stretch swap-group 完全对齐（10 选 N · 8 分钟）
const STRETCH_POOL = [
  { id: 'stretch-quad',      name: '股四头肌拉伸', emoji: '🦵', detail: '站姿屈膝抓脚踝，拉伸大腿前侧',           sets: '每侧 30秒 × 2组', sec: 30 },
  { id: 'stretch-hamstring', name: '腘绳肌拉伸',   emoji: '🦵', detail: '坐姿前屈或站姿体前屈，拉伸大腿后侧',     sets: '每侧 30秒 × 2组', sec: 30 },
  { id: 'stretch-glute',     name: '臀大肌拉伸',   emoji: '🍑', detail: '仰卧4字拉伸，缓解臀部深层紧张',           sets: '每侧 30秒 × 2组', sec: 30 },
  { id: 'stretch-child',     name: '婴儿式放松',   emoji: '🧘', detail: '跪姿臀部坐脚跟，前倾延伸背部',             sets: '1组 × 60秒',              sec: 60 },
  { id: 'stretch-calf',      name: '小腿拉伸',     emoji: '🦶', detail: '弓步推墙或台阶拉伸，缓解小腿紧绷',         sets: '每侧 30秒 × 2组', sec: 30 },
  { id: 'stretch-hip',       name: '髋屈肌拉伸',   emoji: '🔄', detail: '弓步下沉髋部，打开髋关节前侧',             sets: '每侧 30秒 × 2组', sec: 30 },
  { id: 'stretch-spine',     name: '猫牛式',       emoji: '🐈', detail: '四足跪姿脊柱流动，舒缓腰背紧张',           sets: '1组 × 10次缓慢流动',     sec: 30 },
  { id: 'stretch-cobra',     name: '眼镜蛇式',     emoji: '🐍', detail: '俯卧撑起上身，伸展腹直肌与前链',           sets: '保持 30秒 × 2组', sec: 30 },
  { id: 'stretch-shoulder',  name: '肩部拉伸',     emoji: '💪', detail: '交叉手臂跨胸前，放松三角肌后束',           sets: '每侧 30秒 × 2组', sec: 30 },
  { id: 'stretch-pigeon',    name: '鸽子式',       emoji: '🕊️', detail: '深度打开髋关节，进阶拉伸臀外旋肌',         sets: '每侧 45秒 × 1组',       sec: 45 }
];
const STRETCH_DEFAULT = ['stretch-quad', 'stretch-hamstring', 'stretch-glute', 'stretch-child'];

function buildStretches(selectedIds) {
  const picked = (selectedIds && selectedIds.length) ? selectedIds : STRETCH_DEFAULT.slice();
  const items = picked.map(function(id, idx) {
    const s = STRETCH_POOL.find(function(x) { return x.id === id; }) || STRETCH_POOL[0];
    // detail 兼容旧字段：原型拉伸卡片 detail = "每侧保持30秒 × 2组 · 缓解..."
    const detail = s.sets + ' · ' + s.detail.replace(/，.*/, '');
    return { id: s.id, name: s.name, emoji: s.emoji, detail: detail, rest: s.sets, sets: s.sets, done: false, num: idx + 1 };
  });
  return withTimer(items, DEFAULT_TIMER_SEC);
}

function buildWarmups(selectedIds) {
  const picked = (selectedIds && selectedIds.length) ? selectedIds : WARMUP_DEFAULT.slice();
  const items = picked.map(function(id, idx) {
    const w = WARMUP_POOL.find(function(x) { return x.id === id; }) || WARMUP_POOL[0];
    const dur = w.sec + '秒';
    // 保留 WARMUP_POOL 里已注入的 "N组 × N秒" 组数字段；兼容历史数据，若无则按"1组 × N秒"构造
    const setsLabel = w.sets && w.sets.indexOf('组') >= 0 ? w.sets : ('1组 × ' + dur);
    // phase 内连续编号（与原型对齐：热身动作按 1/2/3... 显示）
    return { id: w.id, name: w.name, emoji: w.emoji, detail: w.detail, rest: dur, sets: setsLabel, done: false, num: idx + 1 };
  });
  return withTimer(items, WARMUP_TIMER_SEC);
}

function parseRestSeconds(text, fallback) {
  if (!text) return (fallback !== undefined ? fallback : DEFAULT_TIMER_SEC);
  const m = String(text).match(/(\d+)\s*秒/);
  if (m) return Math.max(5, parseInt(m[1]));
  return (fallback !== undefined ? fallback : DEFAULT_TIMER_SEC);
}

function parseTotalSets(item) {
  const sources = [item.sets, item.detail];
  for (let i = 0; i < sources.length; i++) {
    if (!sources[i]) continue;
    const m = String(sources[i]).match(/(\d+)\s*组/);
    if (m) return parseInt(m[1]);
  }
  // 计时类（热身/拉伸）没有明确组数时，按 1 组兜底，避免弹窗显示 "—"
  if (item.sec && item.sec > 0) return 1;
  return 0;
}

function formatTimer(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function withTimer(items, fallback) {
  return (items || []).map(it => {
    const sec = parseRestSeconds(it.rest || it.detail, fallback);
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

Page({
  data: {
    workoutName: '臀腿力量训练',
    workoutSub: '力量训练 · 重点激活下肢肌群',
    workoutMinutes: '35',
    workoutCalories: '280',
    totalSets: 0,
    warmups: [],
    exercises: [],
    stretches: [],
    // 最后5秒倒数
    countdownShow: false,
    countdownPulse: false,
    countdownNum: 5,
    // 组进度弹窗
    setProgressShow: false,
    setProgress: {
      exerciseName: '',
      done: 0,
      total: 0,
      percent: 0,
      isLast: false
    },
    // 当前活跃 timer 定位（用于 nextSet 重置）
    _activeList: '',
    _activeIdx: -1,
    // v2.1 自由替换动作
    swapShow: false,
    swapCurrent: { exId: '', name: '', emoji: '💪' },
    swapOptions: [],
    _swapIdx: -1,
    // 底部「自由替换动作」：先选要替换哪个动作
    swapPickShow: false,
    swapPickList: [],
    // 动态热身：选择热身动作
    warmupSelectShow: false,
    warmupCandidates: [],
    warmupSelectedCount: 0,
    // 训练后拉伸：选择拉伸动作（镜像热身选择范式）
    stretchSelectShow: false,
    stretchCandidates: [],
    stretchSelectedCount: 0
  },

  onLoad() {
    this._timers = {};
    this.loadWorkoutData();
  },

  onUnload() {
    this.clearAllTimers();
    this.setData({ countdownShow: false, setProgressShow: false });
  },

  onHide() {
    this.clearAllTimers();
    this.setData({ countdownShow: false, setProgressShow: false });
  },

  clearAllTimers() {
    if (this._timers) {
      Object.keys(this._timers).forEach(k => {
        if (this._timers[k]) {
          clearInterval(this._timers[k]);
          this._timers[k] = null;
        }
      });
    }
  },

  loadWorkoutData() {
    const p = Store.getProfile() || {};
    const isFatLoss = p.goal && (p.goal.indexOf('减脂') >= 0);

    let warmups, exercises, stretches;

    if (isFatLoss) {
      warmups = buildWarmups();
      exercises = [
        { num: 1, exId: 'jumping-jack', name: '开合跳', detail: '全身燃脂动作，快速提升心率', sets: '3组 × 30秒', rest: '组间休息 15秒' },
        { num: 2, exId: 'high-knees', name: '高抬腿', detail: '核心+下肢燃脂，提高心肺功能', sets: '3组 × 30秒', rest: '组间休息 15秒' },
        { num: 3, exId: 'jump-squat', name: '深蹲跳', detail: '爆发力训练，燃烧大量热量', sets: '3组 × 12次', rest: '组间休息 30秒' },
        { num: 4, exId: 'mountain-climber', name: '登山跑', detail: '核心+全身综合燃脂动作', sets: '3组 × 30秒', rest: '组间休息 15秒' }
      ];
      // 默认拉伸由 STRETCH_POOL 生成（与原型一致：股四/腘绳/小腿/婴儿式）
      stretches = buildStretches(['stretch-quad', 'stretch-hamstring', 'stretch-calf', 'stretch-child']);

      this.setData({
        workoutName: 'HIIT 燃脂训练',
        workoutSub: '高效燃脂 · 快速代谢提升',
        workoutMinutes: '25',
        workoutCalories: '250'
      });
    } else {
      warmups = buildWarmups();
      exercises = [
        { num: 1, exId: 'squat', name: '自重深蹲', detail: '经典下肢训练动作，主要训练臀大肌和股四头肌', sets: '3组 × 12次', rest: '组间休息 60秒' },
        { num: 2, exId: 'bridge', name: '臀桥', detail: '针对臀大肌的孤立训练，改善臀部形态', sets: '3组 × 15次', rest: '组间休息 45秒' },
        { num: 3, exId: 'lunge', name: '弓步蹲', detail: '单侧训练动作，改善腿部不平衡，加强核心稳定', sets: '3组 × 12次（每侧）', rest: '组间休息 60秒' },
        { num: 4, exId: 'side-leg', name: '侧卧抬腿', detail: '训练臀中肌，改善髋部稳定性和臀部侧方线条', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒' }
      ];
      // 默认拉伸用 STRETCH_POOL 默认 4 项（与原型一致：股四/腘绳/臀大肌/婴儿式）
      stretches = buildStretches();

      this.setData({
        workoutName: '臀腿力量训练',
        workoutSub: '力量训练 · 重点激活下肢肌群',
        workoutMinutes: '35',
        workoutCalories: '280'
      });
    }

    exercises = withTimer(exercises).map(function(e) {
      return Object.assign({}, e, {
        emoji: EX_EMOJI[e.exId] || '💪',
        swaps: SWAP_POOL[e.exId] || []
      });
    });
    // stretches 已由 buildStretches 注入 timer 字段，无需再 withTimer
    stretches = stretches;
    warmups = warmups;

    // 计算总组数
    let totalSets = 0;
    exercises.forEach(function(e) {
      const m = e.sets.match(/(\d+)组/);
      if (m) totalSets += parseInt(m[1]);
    });

    this.setData({
      warmups: warmups,
      exercises: exercises,
      stretches: stretches,
      totalSets: totalSets
    });
  },

  noop() {},

  // —— 动作倒计时声音提示（Web Audio 实时合成，无需音频文件）——
  initAudio() {
    if (this._audioCtx) {
      // 已被挂起时尝试唤醒（部分机型需用户手势后 resume）
      if (this._audioCtx.resume && this._audioCtx.state === 'suspended') {
        try { this._audioCtx.resume(); } catch (e) {}
      }
      return this._audioCtx;
    }
    try {
      if (wx.createWebAudioContext) {
        this._audioCtx = wx.createWebAudioContext();
        if (this._audioCtx && this._audioCtx.resume) {
          try { this._audioCtx.resume(); } catch (e) {}
        }
      }
    } catch (e) {
      this._audioCtx = null;
    }
    return this._audioCtx || null;
  },

  // 合成单个提示音：freq 频率 / duration 时长(秒) / type 波形 / delay 延迟(秒)
  playTone(freq, duration, type, delay) {
    const ctx = this.initAudio();
    if (!ctx) return;
    try {
      const t0 = (ctx.currentTime || 0) + (delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.5, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch (e) {}
  },

  // 完成提示音：两声升调「叮咚」，与倒数滴声明显区分
  playFinishSound() {
    this.playTone(880, 0.18, 'sine', 0);        // 第一声
    this.playTone(1318.5, 0.38, 'sine', 0.18);  // 第二声（升调）
  },

  _keyOf(list, idx) {
    return list + '-' + idx;
  },

  toggleTimer(e) {
    const ds = e.currentTarget.dataset;
    const list = ds.list;
    const idx = parseInt(ds.idx);
    const items = (this.data[list] || []).slice();
    const it = Object.assign({}, items[idx]);
    const k = this._keyOf(list, idx);

    if (it.timerState === 'running') {
      // pause
      it.timerState = '';
      it.timerBtnLabel = '继续';
      if (this._timers[k]) {
        clearInterval(this._timers[k]);
        this._timers[k] = null;
      }
      // 关闭可能残留的全屏倒数遮罩（最后5秒内暂停时）
      this.setData({ countdownShow: false, countdownPulse: false });
    } else {
      // start: if finished or 0, reset to default
      let startSec = parseInt(it.timerSec);
      if (!startSec || startSec <= 0 || it.timerState === 'finished') {
        startSec = parseInt(it.timerDefaultSec) || DEFAULT_TIMER_SEC;
      }
      it.timerSec = startSec;
      it.timerDisplay = formatTimer(startSec);
      it.timerState = 'running';
      it.timerBtnLabel = '暂停';
      this.initAudio();

      const self = this;
      const tickKey = k;
      if (this._timers[tickKey]) clearInterval(this._timers[tickKey]);
      this._timers[tickKey] = setInterval(function() {
        const cur = (self.data[list] || []).slice();
        const curItem = Object.assign({}, cur[idx]);
        curItem.timerSec = Math.max(0, (parseInt(curItem.timerSec) || 0) - 1);
        curItem.timerDisplay = formatTimer(curItem.timerSec);

        // 最后5秒全屏倒数
        if (curItem.timerSec > 0 && curItem.timerSec <= 5) {
          self.showCountdownPulse(curItem.timerSec);
          if (curItem.timerSec === 1) {
            // 最后一秒：加强提醒（升调双声「滴-嘟」，比前4秒更紧迫）
            self.playTone(1046.5, 0.15, 'triangle', 0);
            self.playTone(1568, 0.32, 'triangle', 0.14);
          } else {
            self.playTone(880, 0.12, 'sine'); // 普通倒数滴声
          }
        }

        if (curItem.timerSec <= 0) {
          clearInterval(self._timers[tickKey]);
          self._timers[tickKey] = null;
          curItem.timerState = 'finished';
          curItem.timerBtnLabel = '完成';
          // 完成组数 +1
          const total = parseInt(curItem.totalSets) || 0;
          let done = parseInt(curItem.completedSets) || 0;
          if (total > 0) {
            done = Math.min(done + 1, total);
          } else {
            done = done + 1;
          }
          curItem.completedSets = done;
          cur[idx] = curItem;
          const dataPatch = {};
          dataPatch[list] = cur;
          self.setData(dataPatch);
          // 关闭倒数层，弹组进度
          self.setData({ countdownShow: false, countdownPulse: false });
          self.playFinishSound(); // 完成提示音
          self.showSetProgress(list, idx);
          return;
        }
        cur[idx] = curItem;
        const patch = {};
        patch[list] = cur;
        self.setData(patch);
      }, 1000);
    }
    items[idx] = it;
    const patch = {};
    patch[list] = items;
    this.setData(patch);
  },

  showCountdownPulse(num) {
    // 重启 pulse 动画：先 false 再 true
    this.setData({ countdownShow: true, countdownPulse: false, countdownNum: num });
    try { wx.vibrateShort && wx.vibrateShort({ type: 'light' }); } catch (e) {}
    const self = this;
    setTimeout(function() {
      self.setData({ countdownPulse: true });
    }, 30);
  },

  showSetProgress(list, idx) {
    const items = this.data[list] || [];
    const it = items[idx];
    if (!it) return;
    let total = parseInt(it.totalSets) || 0;
    let done = parseInt(it.completedSets) || 0;
    // 兜底：热身/拉伸是计时类（多数 1 组），若 totalSets 未正确赋值，按 1 组渲染
    if (total <= 0 && (list === 'warmups' || list === 'stretches')) {
      total = 1;
    }
    const isLast = total > 0 && done >= total;
    const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 100;
    this._activeList = list;
    this._activeIdx = idx;
    this.setData({
      setProgressShow: true,
      setProgress: {
        exerciseName: it.name || '本组',
        done: done,
        total: total,
        percent: percent,
        isLast: isLast
      }
    });
    try { wx.vibrateShort && wx.vibrateShort({ type: 'medium' }); } catch (e) {}
  },

  closeSetProgress() {
    this.setData({ setProgressShow: false });
  },

  nextSet() {
    const list = this._activeList;
    const idx = this._activeIdx;
    if (!list || idx < 0) {
      this.setData({ setProgressShow: false });
      return;
    }
    const items = (this.data[list] || []).slice();
    const it = Object.assign({}, items[idx]);
    // 若已完成全部组数 — 仅关闭弹窗，不跳转
    let total = parseInt(it.totalSets) || 0;
    let done = parseInt(it.completedSets) || 0;
    // 兜底：热身/拉伸未赋 totalSets 时按 1 组计算
    if (total <= 0 && (list === 'warmups' || list === 'stretches')) {
      total = 1;
    }
    if (total > 0 && done >= total) {
      this.setData({ setProgressShow: false });
      return;
    }
    // 重置该 timer 为默认时长
    const reset = parseInt(it.timerDefaultSec) || DEFAULT_TIMER_SEC;
    it.timerSec = reset;
    it.timerDisplay = formatTimer(reset);
    it.timerState = '';
    it.timerBtnLabel = '开始';
    items[idx] = it;
    const patch = {};
    patch[list] = items;
    patch.setProgressShow = false;
    this.setData(patch);
  },

  adjustTimer(e) {
    const ds = e.currentTarget.dataset;
    const list = ds.list;
    const idx = parseInt(ds.idx);
    const delta = parseInt(ds.delta);
    const items = (this.data[list] || []).slice();
    const it = Object.assign({}, items[idx]);

    if (it.timerState === 'running') return; // 运行中不可调

    let next = Math.max(0, (parseInt(it.timerSec) || 0) + delta);
    it.timerSec = next;
    it.timerDisplay = formatTimer(next);
    it.timerState = '';
    it.timerBtnLabel = '开始';
    items[idx] = it;
    const patch = {};
    patch[list] = items;
    this.setData(patch);
  },

  navigateBack() {
    wx.navigateBack();
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  // ===== v2.1 自由替换动作 =====
  openSwap(e) {
    const exId = e.currentTarget.dataset.exid;
    const list = this.data.exercises || [];
    const idx = list.findIndex(function(x) { return x.exId === exId; });
    if (idx < 0) return;
    const item = list[idx];
    const swaps = item.swaps || [];
    if (!swaps.length) {
      wx.showToast({ title: '该动作暂无可替换项', icon: 'none' });
      return;
    }
    this.setData({
      swapShow: true,
      swapCurrent: { exId: item.exId, name: item.name, emoji: item.emoji || '💪' },
      swapOptions: swaps,
      _swapIdx: idx
    });
  },

  openSwapFromBottom() {
    const list = (this.data.exercises || []).filter(function(x) { return x.swaps && x.swaps.length; });
    if (!list.length) {
      wx.showToast({ title: '暂无可替换动作', icon: 'none' });
      return;
    }
    const pickList = list.map(function(x) {
      return { exId: x.exId, name: x.name, emoji: x.emoji || '💪', sets: x.sets };
    });
    this.setData({ swapPickShow: true, swapPickList: pickList });
  },

  openSwapPick(e) {
    const exId = e.currentTarget.dataset.exid;
    this.setData({ swapPickShow: false });
    this.openSwap({ currentTarget: { dataset: { exid: exId } } });
  },

  closeSwapPick() {
    this.setData({ swapPickShow: false });
  },

  closeSwap() {
    this.setData({ swapShow: false });
  },

  applySwap(e) {
    const newExId = e.currentTarget.dataset.exid;
    const idx = this.data._swapIdx;
    if (idx < 0) { this.closeSwap(); return; }
    const opt = (this.data.swapOptions || []).find(function(s) { return s.exId === newExId; });
    if (!opt) { this.closeSwap(); return; }
    const exercises = (this.data.exercises || []).slice();
    const it = Object.assign({}, exercises[idx]);
    it.name = opt.name;
    it.detail = opt.detail;
    it.sets = opt.sets;
    it.rest = opt.rest;
    it.exId = opt.exId;
    it.emoji = opt.emoji;
    it.swaps = this.data.swapOptions; // 替身后保持同一替身池，可继续替换/换回
    exercises[idx] = it;
    this.setData({ exercises: exercises, swapShow: false });
    wx.showToast({ title: '已替换为 ' + opt.name, icon: 'success' });
  },

  // ===== 动态热身：选择热身动作 =====
  openWarmupSelect() {
    const curIds = (this.data.warmups || []).map(function(w) { return w.id; });
    const candidates = WARMUP_POOL.map(function(w) {
      return {
        id: w.id,
        name: w.name,
        emoji: w.emoji,
        detail: w.detail,
        selected: curIds.indexOf(w.id) >= 0
      };
    });
    const count = candidates.filter(function(c) { return c.selected; }).length;
    this.setData({
      warmupSelectShow: true,
      warmupCandidates: candidates,
      warmupSelectedCount: count
    });
  },

  toggleWarmup(e) {
    const id = e.currentTarget.dataset.id;
    const candidates = (this.data.warmupCandidates || []).slice();
    const idx = candidates.findIndex(function(c) { return c.id === id; });
    if (idx < 0) return;
    candidates[idx] = Object.assign({}, candidates[idx], { selected: !candidates[idx].selected });
    const count = candidates.filter(function(c) { return c.selected; }).length;
    this.setData({ warmupCandidates: candidates, warmupSelectedCount: count });
  },

  closeWarmupSelect() {
    this.setData({ warmupSelectShow: false });
  },

  confirmWarmup() {
    const selectedIds = (this.data.warmupCandidates || [])
      .filter(function(c) { return c.selected; })
      .map(function(c) { return c.id; });
    if (!selectedIds.length) {
      wx.showToast({ title: '请至少选择 1 个热身动作', icon: 'none' });
      return;
    }
    const warmups = buildWarmups(selectedIds);
    this.setData({ warmups: warmups, warmupSelectShow: false });
    wx.showToast({ title: '已更新热身动作', icon: 'success' });
  },

  // ===== 训练后拉伸：选择拉伸动作（100% 镜像热身选择范式） =====
  openStretchSelect() {
    const curIds = (this.data.stretches || []).map(function(s) { return s.id; });
    const candidates = STRETCH_POOL.map(function(s) {
      return {
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        detail: s.detail,
        sets: s.sets,
        selected: curIds.indexOf(s.id) >= 0
      };
    });
    const count = candidates.filter(function(c) { return c.selected; }).length;
    this.setData({
      stretchSelectShow: true,
      stretchCandidates: candidates,
      stretchSelectedCount: count
    });
  },

  toggleStretch(e) {
    const id = e.currentTarget.dataset.id;
    const candidates = (this.data.stretchCandidates || []).slice();
    const idx = candidates.findIndex(function(c) { return c.id === id; });
    if (idx < 0) return;
    candidates[idx] = Object.assign({}, candidates[idx], { selected: !candidates[idx].selected });
    const count = candidates.filter(function(c) { return c.selected; }).length;
    this.setData({ stretchCandidates: candidates, stretchSelectedCount: count });
  },

  closeStretchSelect() {
    this.setData({ stretchSelectShow: false });
  },

  confirmStretch() {
    const selectedIds = (this.data.stretchCandidates || [])
      .filter(function(c) { return c.selected; })
      .map(function(c) { return c.id; });
    if (!selectedIds.length) {
      wx.showToast({ title: '请至少选择 1 个拉伸动作', icon: 'none' });
      return;
    }
    const stretches = buildStretches(selectedIds);
    this.setData({ stretches: stretches, stretchSelectShow: false });
    wx.showToast({ title: '已更新拉伸动作', icon: 'success' });
  }
});
