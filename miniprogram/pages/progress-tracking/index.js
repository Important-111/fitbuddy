const {
  Store,
  calcBMI,
  calcBMR,
  calcDailyCalories,
  getDateStr,
  formatDate,
  getMonday,
  getGreeting,
  getAvatarEmoji,
  getGoalEmoji
} = require('../../utils/store');

Page({
  data: {
    periodFilter: 'week',
    overview: {
      streak: 0,
      workouts: 0,
      minutes: '0',
      calories: '0',
      completionRate: 0
    },
    chartData: {
      bars: [],
      count: 0
    },
    milestones: [],
    measurements: {
      initialWeight: 0,
      currentWeight: 0,
      weightChangeDisplay: '',
      weightChangeStyle: '',
      initialBMI: '--',
      currentBMI: '--',
      bmiChange: ''
    },
    analysis: {
      weekWorkouts: 0,
      daysPerWeek: 4,
      weekRate: 0,
      weekRateClass: 'status-warn',
      weightDesc: '',
      weightDisplay: '',
      weightClass: 'status-warn',
      fatigueDesc: '',
      suggestion: '',
      suggestionLabel: '保持'
    },
    targetWeight: null,
    profile: {}
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const p = Store.getProfile() || {};
    const records = Store.getCheckins();
    const weightHistory = Store.getWeightHistory();

    // Determine filter date
    let filterDate = new Date(0);
    const filter = this.data.periodFilter;
    if (filter === 'week') {
      filterDate = getMonday(new Date());
    } else if (filter === 'month') {
      const n = new Date();
      filterDate = new Date(n.getFullYear(), n.getMonth(), 1);
    }

    const filteredRecords = records.filter(r => new Date(r.date) >= filterDate);
    const filteredWeightHistory = weightHistory.filter(w => new Date(w.date) >= filterDate);

    const totalWorkouts = filteredRecords.length;
    const totalMinutes = totalWorkouts * 35;
    const totalCal = totalWorkouts * 280;
    let compSum = 0;
    filteredRecords.forEach(r => { compSum += (r.completion || 100); });
    const completionRate = filteredRecords.length > 0 ? Math.round(compSum / filteredRecords.length) : 0;
    const streak = Store.getStreakDays();

    // Overview
    const overview = {
      streak,
      workouts: totalWorkouts,
      minutes: String(totalMinutes),
      calories: totalCal.toLocaleString ? totalCal.toLocaleString() : String(totalCal),
      completionRate
    };

    // Chart bars
    const displayWeights = filteredWeightHistory.slice(-7);
    const bars = [];
    if (displayWeights.length === 0) {
      // Placeholder bars
      const labels = ['--', '--', '--', '--', '--'];
      const heights = [90, 85, 80, 75, 70];
      for (let i = 0; i < 5; i++) {
        bars.push({ height: heights[i], label: labels[i] });
      }
    } else {
      let maxW = 0, minW = Infinity;
      displayWeights.forEach(w => {
        if (w.weight > maxW) maxW = w.weight;
        if (w.weight < minW) minW = w.weight;
      });
      const range = (maxW - minW) || 1;
      displayWeights.forEach(w => {
        const h = 40 + ((maxW - w.weight) / range) * 60;
        bars.push({ height: Math.round(h), label: String(w.weight.toFixed(1)) });
      });
    }

    const chartData = { bars, count: Math.max(displayWeights.length, 5) };

    // Milestones
    const milestoneDefs = [
      { key: 'first', icon: '🎉', name: '首次训练', achieved: totalWorkouts >= 1, cond: totalWorkouts >= 1, statusDone: '已达成', statusPending: '未达成' },
      { key: 'streak7', icon: '🔥', name: '连续7天', achieved: streak >= 7, cond: streak >= 7, statusDone: '已达成', statusPending: `还差 ${7 - streak} 天` },
      { key: 'total10', icon: '⭐', name: '累计10次', achieved: totalWorkouts >= 10, cond: totalWorkouts >= 10, statusDone: '已达成', statusPending: `还差 ${10 - totalWorkouts} 次` },
      { key: 'streak30', icon: '🎯', name: '连续30天', achieved: streak >= 30, cond: streak >= 30, statusDone: '已达成', statusPending: `还差 ${30 - streak} 天` },
      { key: 'total100', icon: '💪', name: '累计100次', achieved: totalWorkouts >= 100, cond: totalWorkouts >= 100, statusDone: '已达成', statusPending: `还差 ${100 - totalWorkouts} 次` }
    ];
    const milestones = milestoneDefs.map(m => ({
      icon: m.icon,
      name: m.name,
      achieved: m.achieved,
      status: m.cond ? m.statusDone : m.statusPending
    }));

    // Measurements
    const initialWeight = weightHistory.length > 0 ? weightHistory[0].weight : (p.weight || 0);
    const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : (p.weight || 0);
    const weightChange = (currentWeight - initialWeight).toFixed(1);
    let weightChangeClass = '';
    if (parseFloat(weightChange) < 0) weightChangeClass = 'color:var(--success)';
    else if (parseFloat(weightChange) > 0) weightChangeClass = 'color:var(--danger)';

    const initialBMI = calcBMI(initialWeight, p.height).value;
    const currentBMI = calcBMI(currentWeight, p.height).value;
    const bmiChange = (parseFloat(currentBMI) - parseFloat(initialBMI)).toFixed(1);

    const measurements = {
      initialWeight: initialWeight.toFixed(1),
      currentWeight: currentWeight.toFixed(1),
      weightChangeDisplay: (parseFloat(weightChange) > 0 ? '+' : '') + weightChange + 'kg',
      weightChangeStyle: weightChangeClass,
      initialBMI,
      currentBMI,
      bmiChange: (parseFloat(bmiChange) > 0 ? '+' : '') + bmiChange
    };

    // Weekly analysis
    const today = new Date();
    const monday = getMonday(today);
    let weekWorkouts = 0;
    for (let i = 0; i < filteredRecords.length; i++) {
      const rd = new Date(filteredRecords[i].date);
      if (rd >= monday) weekWorkouts++;
    }
    const daysPerWeek = p.daysPerWeek || 4;
    const weekRate = weekWorkouts > 0 ? Math.round(weekWorkouts / daysPerWeek * 100) : 0;
    const weekRateClass = weekWorkouts >= Math.round(daysPerWeek * 0.6) ? 'status-good' : 'status-warn';

    let weightDesc = '暂无打卡记录，开始记录吧';
    let weightDisplay = weightChange + 'kg';
    if (records.length > 0) {
      weightDesc = '有打卡记录，趋势追踪中';
    }
    const weightClass = parseFloat(weightChange) < 0 ? 'status-good' : 'status-warn';

    const fatigueDesc = records.length > 0 ? '有打卡记录，状态正常' : '暂无数据';

    let suggestion = '开始训练吧，建立运动习惯是第一步';
    let suggestionLabel = '保持';
    if (weekWorkouts >= daysPerWeek) {
      suggestion = '本周目标已达成，下周可以增加强度';
      suggestionLabel = '增加';
    } else if (weekWorkouts > 0) {
      suggestion = '完成率尚可，下周保持当前训练量';
      suggestionLabel = '保持';
    }

    const analysis = {
      weekWorkouts,
      daysPerWeek,
      weekRate,
      weekRateClass,
      weightDesc,
      weightDisplay: (parseFloat(weightChange) > 0 ? '+' : '') + weightChange + 'kg',
      weightClass,
      fatigueDesc,
      suggestion,
      suggestionLabel
    };

    this.setData({
      overview,
      chartData,
      milestones,
      measurements,
      analysis,
      targetWeight: p.targetWeight || null,
      profile: p
    });
  },

  onSwitchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ periodFilter: filter }, () => {
      this.loadData();
    });
  }
});
