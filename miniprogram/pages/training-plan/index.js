const { Store, calcBMI, calcBMR, calcDailyCalories, getDateStr, formatDate, getMonday, getGreeting, getAvatarEmoji, getGoalEmoji } = require('../../utils/store');

function getWorkoutTemplates(goal) {
  const isFatLoss = goal && (goal.indexOf('减脂') >= 0);
  const isMuscleGain = goal && (goal.indexOf('增肌') >= 0);

  return [
    {
      name: isFatLoss ? 'HIIT 高效燃脂' : (isMuscleGain ? '胸部力量训练' : '臀腿力量训练'),
      desc: isFatLoss ? 'Tabata训练 · 战绳 · 登山跑' : (isMuscleGain ? '俯卧撑 · 哑铃推举' : '深蹲 · 臀桥 · 弓步蹲'),
      meta: [isFatLoss ? '25分钟' : '35分钟', '4个动作'],
      minutes: isFatLoss ? 25 : 35,
      calories: isFatLoss ? 250 : 280,
      isRest: false
    },
    {
      name: '休息 + 拉伸恢复',
      desc: '泡沫轴放松 · 静态拉伸',
      meta: ['20分钟'],
      minutes: 20,
      calories: 50,
      isRest: true
    },
    {
      name: isMuscleGain ? '背部力量训练' : '上半身力量训练',
      desc: isMuscleGain ? '引体向上 · 划船 · 硬拉' : '俯卧撑 · 推举 · 划船',
      meta: [isMuscleGain ? '40分钟' : '35分钟', '4个动作'],
      minutes: isMuscleGain ? 40 : 35,
      calories: isMuscleGain ? 320 : 280,
      isRest: false
    },
    {
      name: '休息 + 拉伸恢复',
      desc: '泡沫轴放松 · 静态拉伸 · 瑜伽放松',
      meta: ['20分钟'],
      minutes: 20,
      calories: 50,
      isRest: true
    },
    {
      name: isFatLoss ? '有氧燃脂' : (isMuscleGain ? '肩部+手臂训练' : 'HIIT 高效燃脂'),
      desc: isFatLoss ? '慢跑 · 跳绳 · 游泳' : (isMuscleGain ? '哑铃推举 · 侧平举 · 弯举' : 'Tabata · 战绳 · 深蹲跳'),
      meta: [isFatLoss ? '30分钟' : '25分钟', isFatLoss ? '3个动作' : '6个动作'],
      minutes: isFatLoss ? 30 : 25,
      calories: isFatLoss ? 200 : 250,
      isRest: false
    },
    {
      name: '全身综合训练',
      desc: '深蹲 · 俯卧撑 · 平板支撑 · 臀桥',
      meta: ['40分钟', '6个动作'],
      minutes: 40,
      calories: 320,
      isRest: false
    },
    {
      name: '完全休息',
      desc: '充足睡眠 · 补充营养 · 轻度散步',
      meta: ['恢复日'],
      minutes: 0,
      calories: 0,
      isRest: true
    }
  ];
}

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

    this.setData({
      p: p,
      checkins: checkins,
      monthTitle: (now.getMonth() + 1) + '月目标',
      monthGoal: (p.goal || '减脂') + (p.targetWeight ? ' · 目标 ' + p.targetWeight + 'kg' : ''),
      monthSub: '建立运动习惯 · 完成' + (p.daysPerWeek || 4) * 4 + '次训练',
      monthTargetCount: (p.daysPerWeek || 4) * 4,
      monthDoneCount: checkins.length,
      monthRate: checkins.length > 0 ? Math.round(checkins.length / ((p.daysPerWeek || 4) * 4) * 100) : 0,
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

    const templates = getWorkoutTemplates(p.goal);
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
        weekCalories += workout.calories || 280;
        weekMinutes += workout.minutes || 35;
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
        canNavigate: !workout.isRest
      };
    });

    const weekCheckinRate = weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0;

    this.setData({
      weekOffset: weekOffset,
      dayCards: dayCards,
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

  onDayCardTap(e) {
    const isRest = e.currentTarget.dataset.rest === 'true';
    if (!isRest) {
      wx.navigateTo({ url: '/pages/daily-workout/index' });
    }
  }
});
