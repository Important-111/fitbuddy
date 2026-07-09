const { Store, calcBMI, calcBMR, calcDailyCalories, getDateStr, formatDate, getMonday, getGreeting, getAvatarEmoji, getGoalEmoji } = require('../../utils/store');

Page({
  data: {
    greeting: '',
    avatar: '',
    nickname: '',
    streakDays: 0,
    totalWorkouts: '0次',
    totalMinutes: '0min',
    totalCal: '0',
    todayName: '',
    goal: '',
    weightLost: '0.0',
    weightTarget: '11',
    weightProgress: 0,
    completionRate: 0,
    weightTrend: '保持中'
  },

  onLoad() {
    this.loadDashboardData();
  },

  onShow() {
    this.loadDashboardData();
  },

  loadDashboardData() {
    const p = Store.getProfile() || {};
    const streak = Store.getStreakDays();
    const totalWorkouts = Store.getTotalWorkouts();
    const totalMinutes = Store.getTotalMinutes();
    const totalCal = Store.getTotalCaloriesBurned();

    const weightHistory = Store.getWeightHistory();
    const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : (p.weight || 0);
    const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : (p.weight || 0);
    const weightLost = startWeight - currentWeight;
    const weightTarget = p.targetWeight ? (startWeight - p.targetWeight) : 11;
    const weightProgress = weightTarget > 0 ? Math.min(100, Math.round(weightLost / weightTarget * 100)) : 0;

    const today = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const todayName = weekdays[today.getDay()];

    this.setData({
      greeting: getGreeting(),
      avatar: getAvatarEmoji(p.gender),
      nickname: p.nickname || '用户',
      streakDays: streak,
      totalWorkouts: totalWorkouts + '次',
      totalMinutes: this._formatMinutes(totalMinutes),
      totalCal: totalCal.toLocaleString(),
      todayName: todayName,
      goal: p.goal || '臀腿力量训练',
      weightLost: (weightLost > 0 ? '-' : '') + weightLost.toFixed(1),
      weightTarget: weightTarget.toFixed(0),
      weightProgress: weightProgress,
      completionRate: Store.getCompletionRate(),
      weightTrend: weightLost > 0 ? '↓ ' + weightLost.toFixed(1) + 'kg 趋势良好' : '保持中'
    });
  },

  _formatMinutes(mins) {
    if (mins < 60) return mins + 'min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h + 'h' + (m > 0 ? m + 'min' : '');
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
