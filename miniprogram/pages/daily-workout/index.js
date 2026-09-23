const { Store } = require('../../utils/store');
const engine = require('../../utils/trainingEngine');

const DEFAULT_TIMER_SEC = 30;

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

// 热身 / 拉伸池与训练生成统一由 utils/trainingEngine 提供，本页不再自带副本。
// 这样「健康问题/器械/经验/时长」才有唯一消费方，不会出现两处规则不一致。
const EX_LIB = engine.EX_LIB;

function buildWarmups(selectedIds) {
  return engine.buildWarmups(selectedIds, Store.getProfile());
}

function buildStretches(selectedIds) {
  return engine.buildStretches(selectedIds, Store.getProfile());
}

const withTimer = engine.withTimer;
const formatTimer = engine.formatTimer;

Page({
  data: {
    workoutName: '臀腿力量训练',
    workoutSub: '力量训练 · 重点激活下肢肌群',
    workoutMinutes: '35',
    workoutCalories: '280',
    // 因健康问题调整过训练构成时，页面上必须让用户看得见「调整了什么」
    safetyNotice: '',
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

  onLoad(options) {
    this._timers = {};
    // 从周计划卡片进入时带当日训练类型；直接进入则取周计划里「今天」的槽位
    this._typeKey = (options && options.type) ? decodeURIComponent(options.type) : '';
    this._slot = (options && options.slot) ? parseInt(options.slot, 10) || 0 : 0;
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
    // 训练内容全部交给训练引擎：它会消费健康问题 / 器械 / 经验 / 每次时长 四组档案字段。
    // 改造前这里只有「减脂 → 固定 4 个燃脂动作，其它 → 固定 4 个臀腿动作」两条硬编码分支，
    // 所以勾了「膝盖疼」照样会生成深蹲跳。
    const typeKey = this._typeKey || engine.getTodayTypeKey(p, 0);
    const session = engine.buildSession(p, typeKey, this._slot || 0);

    const warmups = buildWarmups(session.warmupIds);
    const stretches = buildStretches(session.stretchIds);
    const exercises = engine.withTimer(session.exercises).map(function (e, idx) {
      return Object.assign({}, e, {
        num: idx + 1,
        emoji: e.emoji || EX_EMOJI[e.exId] || '💪',
        // 换动作也要过一遍健康规则：不能给膝盖疼的用户换出跳跃深蹲
        swaps: engine.filterSwaps(SWAP_POOL[e.exId] || [], p)
      });
    });

    // 计算总组数
    let totalSets = 0;
    exercises.forEach(function (e) {
      const m = String(e.sets).match(/(\d+)组/);
      if (m) totalSets += parseInt(m[1], 10);
    });

    this.setData({
      workoutName: session.name,
      workoutSub: session.sub,
      workoutMinutes: String(session.minutes),
      workoutCalories: String(session.calories),
      safetyNotice: session.safetyNotice || '',
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
    // 候选池按健康状况过滤：膝盖疼的用户不该在列表里看到开合跳
    const candidates = engine.getWarmupCandidates(Store.getProfile()).map(function(w) {
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
    const candidates = engine.getStretchCandidates(Store.getProfile()).map(function(s) {
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
