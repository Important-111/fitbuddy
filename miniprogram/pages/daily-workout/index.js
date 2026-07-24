const { Store } = require('../../utils/store');

const DEFAULT_TIMER_SEC = 30;
const WARMUP_TIMER_SEC = 300;

// 动作 emoji（用于换动作弹窗的「当前动作」展示）
const EX_EMOJI = {
  'squat': '🦵', 'bridge': '🍑', 'lunge': '🦵', 'side-leg': '🍑',
  'jumping-jack': '⚡', 'high-knees': '🔥', 'jump-squat': '⚡', 'mountain-climber': '🔥'
};

// v2.1 自由替换动作：每个正式训练动作的替身动作池（同肌群）
const SWAP_POOL = {
  'squat': [
    { exId: 'wall-sit', name: '靠墙静蹲', emoji: '🧱', detail: '背靠墙壁保持坐姿，对膝关节压力小', sets: '3组 × 45秒', rest: '组间休息 45秒', tags: ['低冲击', '护膝盖'] },
    { exId: 'bulgarian-split', name: '保加利亚分腿蹲', emoji: '🦵', detail: '单腿后搭高处，强化单侧下肢力量', sets: '3组 × 10次（每侧）', rest: '组间休息 60秒', tags: ['高强度', '单侧训练'] },
    { exId: 'jump-squat', name: '跳跃深蹲', emoji: '⚡', detail: '爆发力训练，提升心率燃脂效率', sets: '3组 × 12次', rest: '组间休息 45秒', tags: ['燃脂', '高强度'] },
    { exId: 'sumo-squat', name: '相扑深蹲', emoji: '🦵', detail: '宽站距深蹲，重点刺激大腿内侧', sets: '3组 × 15次', rest: '组间休息 45秒', tags: ['内收肌', '塑形'] }
  ],
  'bridge': [
    { exId: 'single-leg-bridge', name: '单腿臀桥', emoji: '🍑', detail: '单腿支撑顶髋，强化臀部力量不平衡', sets: '3组 × 12次（每侧）', rest: '组间休息 45秒', tags: ['进阶', '单侧'] },
    { exId: 'clamshell', name: '蚌式开合', emoji: '🦪', detail: '侧卧屈膝开合，激活臀中肌', sets: '3组 × 20次（每侧）', rest: '组间休息 30秒', tags: ['臀中肌', '低冲击'] },
    { exId: 'kneeling-kickback', name: '跪姿后踢腿', emoji: '🍑', detail: '四足跪姿向后上方踢腿，孤立臀大肌', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒', tags: ['孤立训练'] },
    { exId: 'barbell-bridge', name: '负重臀桥', emoji: '🏋️', detail: '加大负重突破臀大肌力量瓶颈', sets: '4组 × 10次', rest: '组间休息 60秒', tags: ['负重', '进阶'] }
  ],
  'lunge': [
    { exId: 'reverse-lunge', name: '反向弓步', emoji: '🔙', detail: '后撤步弓步，对膝盖压力小于前弓步', sets: '3组 × 12次（每侧）', rest: '组间休息 60秒', tags: ['护膝盖', '低冲击'] },
    { exId: 'side-lunge', name: '侧弓步', emoji: '↔️', detail: '侧向跨步下蹲，刺激大腿内侧', sets: '3组 × 12次（每侧）', rest: '组间休息 45秒', tags: ['内收肌', '变化方向'] },
    { exId: 'walking-lunge', name: '行走弓步', emoji: '🚶', detail: '行进间交替弓步，提升平衡能力', sets: '3组 × 20步', rest: '组间休息 60秒', tags: ['功能性', '动态'] },
    { exId: 'jump-lunge', name: '跳跃弓步', emoji: '⚡', detail: '弓步跳换，爆发力+燃脂双效', sets: '3组 × 10次（每侧）', rest: '组间休息 60秒', tags: ['高强度', '燃脂'] }
  ],
  'side-leg': [
    { exId: 'clamshell-2', name: '蚌式开合', emoji: '🦪', detail: '屈膝侧卧开合，臀中肌经典动作', sets: '3组 × 20次（每侧）', rest: '组间休息 30秒', tags: ['臀中肌', '经典'] },
    { exId: 'side-plank-leg', name: '侧平板抬腿', emoji: '📊', detail: '侧平板支撑姿态下抬上侧腿，难度进阶', sets: '3组 × 12次（每侧）', rest: '组间休息 45秒', tags: ['高强度', '核心'] },
    { exId: 'standing-side-leg', name: '站姿侧抬腿', emoji: '🧍', detail: '站立位侧向抬腿，可扶墙保持平衡', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒', tags: ['低冲击', '简单'] },
    { exId: 'resistance-band-walk', name: '弹力带侧走', emoji: '🎟️', detail: '膝盖套弹力带横向螃蟹步行走', sets: '3组 × 20步（每方向）', rest: '组间休息 45秒', tags: ['臀中肌', '需器材'] }
  ],
  'jumping-jack': [
    { exId: 'side-jack', name: '侧向开合跳', emoji: '⚡', detail: '左右脚交替侧向开合，减少肩部冲击', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['低冲击', '燃脂'] },
    { exId: 'cross-jack', name: '交叉开合跳', emoji: '🔥', detail: '手脚交叉开合，增加协调难度', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['协调', '燃脂'] },
    { exId: 'squat-jack', name: '深蹲开合跳', emoji: '🦵', detail: '开合同时加入深蹲，强化下肢', sets: '3组 × 20次', rest: '组间休息 20秒', tags: ['下肢', '燃脂'] },
    { exId: 'star-jack', name: '星跳', emoji: '🌟', detail: '全身展开跳跃，最大心率提升', sets: '3组 × 15次', rest: '组间休息 20秒', tags: ['高强度'] }
  ],
  'high-knees': [
    { exId: 'butt-kick', name: '踢臀跑', emoji: '🔥', detail: '原地快速踢臀，提升步频', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['燃脂', '简单'] },
    { exId: 'jog-in-place', name: '原地慢跑', emoji: '🏃', detail: '低强度热身跑，易坚持', sets: '3组 × 45秒', rest: '组间休息 15秒', tags: ['低冲击'] },
    { exId: 'fast-knee', name: '快速高抬膝', emoji: '⚡', detail: '加快频率高抬膝，冲刺感', sets: '3组 × 20秒', rest: '组间休息 15秒', tags: ['高强度'] },
    { exId: 'ski-jump', name: '滑雪跳', emoji: '🎿', detail: '左右跳跃模拟滑雪，训练灵敏', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['灵敏', '燃脂'] }
  ],
  'jump-squat': [
    { exId: 'lunge-jump', name: '弓步跳', emoji: '🦵', detail: '交替弓步跳，下肢爆发', sets: '3组 × 12次', rest: '组间休息 30秒', tags: ['高强度', '燃脂'] },
    { exId: 'burpee', name: '波比跳', emoji: '🔥', detail: '深蹲+俯卧撑+跳，全身燃脂', sets: '3组 × 8次', rest: '组间休息 30秒', tags: ['全身', '高强度'] },
    { exId: 'vertical-jump', name: '纵跳', emoji: '⚡', detail: '原地向上爆发纵跳，训练弹跳', sets: '3组 × 15次', rest: '组间休息 30秒', tags: ['爆发'] },
    { exId: 'split-jump', name: '交替分腿跳', emoji: '🦵', detail: '左右分腿跳换，动态下肢', sets: '3组 × 20次', rest: '组间休息 30秒', tags: ['燃脂'] }
  ],
  'mountain-climber': [
    { exId: 'plank-shoulder-tap', name: '平板交替摸肩', emoji: '💪', detail: '平板支撑交替摸肩，核心稳定', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['核心', '低冲击'] },
    { exId: 'spider-climber', name: '蜘蛛式登山', emoji: '🕷️', detail: '膝盖外展提膝，侧腹训练', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['侧腹', '燃脂'] },
    { exId: 'side-climber', name: '侧向登山', emoji: '🔥', detail: '膝盖向同侧肘部提，旋转核心', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['旋转', '核心'] },
    { exId: 'cross-climber', name: '交叉登山', emoji: '⚡', detail: '膝盖对角提膝，全身协调', sets: '3组 × 30秒', rest: '组间休息 15秒', tags: ['协调', '燃脂'] }
  ]
};

// 动态热身：可选热身动作池（点「选择动作」弹出，可勾选本次要做的项目）
const WARMUP_POOL = [
  { id: 'jumping-jack',  name: '开合跳',     emoji: '⚡', detail: '全身燃脂热身，快速提升心率', sec: 30 },
  { id: 'high-knees',    name: '高抬腿',     emoji: '🔥', detail: '核心与下肢联动，激活心肺功能', sec: 30 },
  { id: 'hip-circles',   name: '髋关节环绕', emoji: '🔄', detail: '活动髋关节，预防运动损伤', sec: 30 },
  { id: 'ankle-circles', name: '踝关节活动', emoji: '🦶', detail: '唤醒踝关节，提升落地稳定性', sec: 20 },
  { id: 'jog-in-place',  name: '原地慢跑',   emoji: '🏃', detail: '低强度有氧，逐步升高体温', sec: 45 },
  { id: 'arm-circles',   name: '手臂环绕',   emoji: '🤸', detail: '放松肩袖肌群，改善肩关节活动度', sec: 20 },
  { id: 'chest-open',    name: '扩胸运动',   emoji: '💪', detail: '打开胸廓，激活胸背肌群', sec: 20 },
  { id: 'calf-raise',    name: '提踵',       emoji: '🦵', detail: '激活小腿与跟腱，增强踝关节刚性', sec: 20 },
  { id: 'cat-cow',       name: '猫牛式',     emoji: '🐱', detail: '脊柱灵活热身，舒缓腰背', sec: 30 },
  { id: 'side-shuffle',  name: '侧滑步',     emoji: '↔️', detail: '动态横向移动，激活臀中肌', sec: 30 }
];
const WARMUP_DEFAULT = ['jumping-jack', 'high-knees', 'hip-circles', 'ankle-circles'];

function buildWarmups(selectedIds) {
  const picked = (selectedIds && selectedIds.length) ? selectedIds : WARMUP_DEFAULT.slice();
  const items = picked.map(function(id) {
    const w = WARMUP_POOL.find(function(x) { return x.id === id; }) || WARMUP_POOL[0];
    const dur = w.sec + '秒';
    return { id: w.id, name: w.name, emoji: w.emoji, detail: w.detail, rest: dur, sets: dur, done: false };
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
    warmupSelectedCount: 0
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
      stretches = [
        { name: '股四头肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '腘绳肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '小腿拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '婴儿式放松', detail: '保持60秒，深呼吸放松全身' }
      ];

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
      stretches = [
        { name: '股四头肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '腘绳肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '臀大肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '婴儿式放松', detail: '保持60秒，深呼吸放松全身' }
      ];

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
    stretches = withTimer(stretches);
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
    const total = parseInt(it.totalSets) || 0;
    const done = parseInt(it.completedSets) || 0;
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
    const total = parseInt(it.totalSets) || 0;
    const done = parseInt(it.completedSets) || 0;
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
  }
});
