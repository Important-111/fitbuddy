const { Store, calcBMI, calcBMR, calcDailyCalories, getDateStr, formatDate, getMonday, getGreeting, getAvatarEmoji, getGoalEmoji } = require('../../utils/store');

// 周计划改由 utils/trainingEngine 生成：训练日数量与分布跟随 daysPerWeek，
// 内容跟随 健康问题 / 器械 / 经验 / 每次时长。原先是写死 7 天的固定模板+
// 只读 goal 的会话名，导致「选了每周 6 天」也只排 4 天训练。
const engine = require('../../utils/trainingEngine');
Page({
  data: {
    weekOffset: 0,
    p: {},
    checkins: [],
    monthTitle: '',
    monthGoal: '',
    monthSub: '',
    monthTargetCount: 0,
    monthDoneCount: 0,
    monthRate: 0,
    monthRemainDays: 0,
    weekTabs: [
      { label: '本周', offset: 0 },
      { label: '下周', offset: 1 },
      { label: '下下周', offset: 2 }
    ],
    dayCards: [],
    safetyNotice: '',
    weekDone: 0,
    weekTotal: 0,
    weekMinutes: 0,
    weekCalories: 0,
    weekCheckinRate: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const p = Store.getProfile() || {};
    const checkins = Store.getCheckins();
    const now = new Date();
    // 每周天数统一走引擎，避免各处默认值不一致（此前这里是 || 4，引导页默认是 3）
    const daysPerWeek = engine.getDaysPerWeek(p);

    this.setData({
      p: p,
      checkins: checkins,
      monthTitle: (now.getMonth() + 1) + '月目标',
      monthGoal: (p.goal || '减脂') + (p.targetWeight ? ' · 目标 ' + p.targetWeight + 'kg' : ''),
      monthSub: '建立运动习惯 · 完成' + daysPerWeek * 4 + '次训练',
      monthTargetCount: daysPerWeek * 4,
      monthDoneCount: checkins.length,
      monthRate: checkins.length > 0 ? Math.min(100, Math.round(checkins.length / (daysPerWeek * 4) * 100)) : 0,
      monthRemainDays: 30 - now.getDate()
    });

    this.buildWeekSchedule(this.data.weekOffset);
  },

  buildWeekSchedule(weekOffset) {
    const p = this.data.p;
    const checkins = this.data.checkins;
    const progress = Store.getWorkoutProgress();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    const monday = getMonday(weekStart);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push({
        date: formatDate(d, 'yyyy-mm-dd'),
        weekday: formatDate(d, 'weekday'),
        dayNum: d.getDate(),
        month: d.getMonth() + 1
      });
    }

    // 训练日由 daysPerWeek 决定，内容由档案（健康/器械/经验/时长）决定
    const plan = engine.buildWeekPlan(p);
    const templates = plan.days;
    const today = getDateStr(new Date());

    let weekDone = 0, weekTotal = 0, weekCalories = 0, weekMinutes = 0;

    const dayCards = weekDays.map((wd, i) => {
      const isToday = wd.date === today;
      const isDone = progress[wd.date] && progress[wd.date].done;
      const hasCheckin = checkins.some(c => c.date === wd.date);
      const workout = templates[i];
      const wdDate = new Date(wd.date);

      let cardClass = 'day-card';
      let statusClass = '';
      let statusText = '';

      if (workout.isRest) {
        cardClass += ' rest';
        statusClass = 'status-rest';
        statusText = '休息日';
      } else if (isDone || hasCheckin) {
        cardClass += ' done';
        statusClass = 'status-done';
        statusText = '已完成';
        weekDone++;
        weekTotal++;
        weekCalories += workout.calories || 0;
        weekMinutes += workout.minutes || 0;
      } else if (isToday) {
        cardClass += ' today';
        statusClass = 'status-todo';
        statusText = '待训练';
        weekTotal++;
      } else if (wdDate < now) {
        statusClass = 'status-rest';
        statusText = '已跳过';
      } else {
        statusClass = 'status-todo';
        statusText = '待训练';
        weekTotal++;
      }

      return {
        cardClass: cardClass,
        weekday: wd.weekday,
        month: wd.month,
        dayNum: wd.dayNum,
        workoutName: workout.name,
        workoutDesc: workout.desc,
        metaItems: workout.meta,
        statusClass: statusClass,
        statusText: statusText,
        isRest: workout.isRest,
        isToday: isToday,
        canNavigate: !workout.isRest,
        typeKey: workout.typeKey || '',
        slot: i
      };
    });

    const weekCheckinRate = weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0;

    this.setData({
      weekOffset: weekOffset,
      dayCards: dayCards,
      safetyNotice: plan.safetyNotice || '',
      weekDone: weekDone,
      weekTotal: weekTotal,
      weekMinutes: weekMinutes,
      weekCalories: weekCalories,
      weekCheckinRate: isNaN(weekCheckinRate) ? 0 : weekCheckinRate
    });
  },

  switchWeek(e) {
    const offset = e.currentTarget.dataset.offset;
    this.buildWeekSchedule(offset);
  },

  // 训练条件与健康状况 → 建档第 3 页（与「改目标」分开，各自独立不串链）
  goEditProfile() {
    wx.navigateTo({ url: '/pages/training-experience/index?from=plan' });
  },

  // 月目标卡片上的「改目标」：只改训练目标（减脂/增肌…），与「编辑条件」分开，
  // 各自贴着它所编辑的内容。同样带 from=plan，保存后回本页重算。
  goEditGoal() {
    wx.navigateTo({ url: '/pages/training-goals/index?from=plan' });
  },

  onDayCardTap(e) {
    const ds = e.currentTarget.dataset;
    if (ds.rest === 'true') return;
    // 带上当日训练类型，保证点进去的会话与卡片上写的名字一致
    const q = [];
    if (ds.type) q.push('type=' + encodeURIComponent(ds.type));
    if (ds.slot !== undefined && ds.slot !== null && ds.slot !== '') q.push('slot=' + ds.slot);
    wx.navigateTo({
      url: '/pages/daily-workout/index' + (q.length ? '?' + q.join('&') : '')
    });
  }
});
