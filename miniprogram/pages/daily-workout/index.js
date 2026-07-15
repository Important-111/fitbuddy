const { Store } = require('../../utils/store');

const DEFAULT_TIMER_SEC = 30;
const WARMUP_TIMER_SEC = 300;

function parseRestSeconds(text, fallback) {
  if (!text) return (fallback !== undefined ? fallback : DEFAULT_TIMER_SEC);
  const m = String(text).match(/(\d+)\s*秒/);
  if (m) return Math.max(5, parseInt(m[1]));
  return (fallback !== undefined ? fallback : DEFAULT_TIMER_SEC);
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
    return Object.assign({}, it, {
      timerDefaultSec: sec,
      timerSec: sec,
      timerDisplay: formatTimer(sec),
      timerState: '',
      timerBtnLabel: '开始'
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
    stretches: []
  },

  onLoad() {
    this._timers = {};
    this.loadWorkoutData();
  },

  onUnload() {
    this.clearAllTimers();
  },

  onHide() {
    this.clearAllTimers();
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
      warmups = [
        { name: '动态热身', detail: '开合跳 · 高抬腿 · 髋关节环绕 · 踝关节活动', sets: '完成热身', done: true }
      ];
      exercises = [
        { num: 1, name: '开合跳', detail: '全身燃脂动作，快速提升心率', sets: '3组 × 30秒', rest: '组间休息 15秒' },
        { num: 2, name: '高抬腿', detail: '核心+下肢燃脂，提高心肺功能', sets: '3组 × 30秒', rest: '组间休息 15秒' },
        { num: 3, name: '深蹲跳', detail: '爆发力训练，燃烧大量热量', sets: '3组 × 12次', rest: '组间休息 30秒' },
        { num: 4, name: '登山跑', detail: '核心+全身综合燃脂动作', sets: '3组 × 30秒', rest: '组间休息 15秒' }
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
      warmups = [
        { name: '动态热身', detail: '开合跳 · 高抬腿 · 髋关节环绕 · 踝关节活动', sets: '完成热身', done: true }
      ];
      exercises = [
        { num: 1, name: '自重深蹲', detail: '经典下肢训练动作，主要训练臀大肌和股四头肌', sets: '3组 × 12次', rest: '组间休息 60秒' },
        { num: 2, name: '臀桥', detail: '针对臀大肌的孤立训练，改善臀部形态', sets: '3组 × 15次', rest: '组间休息 45秒' },
        { num: 3, name: '弓步蹲', detail: '单侧训练动作，改善腿部不平衡，加强核心稳定', sets: '3组 × 12次（每侧）', rest: '组间休息 60秒' },
        { num: 4, name: '侧卧抬腿', detail: '训练臀中肌，改善髋部稳定性和臀部侧方线条', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒' }
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

    exercises = withTimer(exercises);
    stretches = withTimer(stretches);
    warmups = withTimer(warmups, WARMUP_TIMER_SEC);

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
        if (curItem.timerSec <= 0) {
          clearInterval(self._timers[tickKey]);
          self._timers[tickKey] = null;
          curItem.timerState = 'finished';
          curItem.timerBtnLabel = '完成';
          try { wx.vibrateShort && wx.vibrateShort({ type: 'medium' }); } catch (e2) {}
          wx.showToast({
            title: '⏰ ' + (curItem.name || '本组') + ' 倒计时完成',
            icon: 'none',
            duration: 1800
          });
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
  }
});
