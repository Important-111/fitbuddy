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
      points: [],
      targetWeight: null,
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

  onReady() {
    this.drawWeightChart();
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

    // Chart curve points (canvas)
    const displayWeights = filteredWeightHistory.slice(-7);
    const points = [];
    if (displayWeights.length === 0) {
      // 无数据时不绘制曲线
    } else {
      displayWeights.forEach(w => {
        points.push({
          weight: w.weight,
          date: w.date,
          label: this.formatChartDate(w.date)
        });
      });
    }

    const chartData = {
      points,
      targetWeight: p.targetWeight || null,
      count: Math.max(displayWeights.length, 5)
    };

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
    }, () => {
      // 数据更新后重绘曲线
      this.drawWeightChart();
    });
  },

  // 格式化日期为 M/D
  formatChartDate(dateStr) {
    if (!dateStr) return '';
    const parts = String(dateStr).split('-');
    if (parts.length >= 3) {
      return parseInt(parts[1], 10) + '/' + parseInt(parts[2], 10);
    }
    return dateStr;
  },

  // 使用旧版 Canvas API 绘制体重曲线（兼容性最佳，基础库 1.0.0+）
  drawWeightChart() {
    const points = (this.data.chartData && this.data.chartData.points) || [];
    const targetWeight = (this.data.chartData && this.data.chartData.targetWeight) || null;
    const ctx = wx.createCanvasContext('weightChart', this);

    // 画布逻辑尺寸：与 wxml canvas 的 width/height 一致
    const W = 320;
    const H = 170;
    // 绘图区内边距：left/right 留出 Y 标签空间，bottom 留出 X 轴日期
    const padL = 14;
    const padR = 14;
    const padT = 18;
    const padB = 24;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // 清空
    ctx.clearRect(0, 0, W, H);

    if (points.length === 0) {
      // 无数据占位
      ctx.setFillStyle('#9A9A9A');
      ctx.setFontSize(12);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText('暂无体重数据', W / 2, H / 2);
      ctx.draw();
      return;
    }

    // 计算 Y 轴范围：加入目标线作为参考，确保曲线与目标线都可见
    let minW = Infinity, maxW = -Infinity;
    points.forEach(p => {
      if (p.weight < minW) minW = p.weight;
      if (p.weight > maxW) maxW = p.weight;
    });
    if (targetWeight) {
      if (targetWeight < minW) minW = targetWeight;
      if (targetWeight > maxW) maxW = targetWeight;
    }
    // 上下扩展一点空间避免曲线贴边
    const span = (maxW - minW) || 1;
    const yMin = minW - span * 0.15;
    const yMax = maxW + span * 0.15;
    const yRange = (yMax - yMin) || 1;

    // X 坐标
    const xStep = points.length > 1 ? plotW / (points.length - 1) : 0;
    const coords = points.map((p, i) => ({
      x: padL + (points.length === 1 ? plotW / 2 : i * xStep),
      y: padT + ((yMax - p.weight) / yRange) * plotH,
      weight: p.weight,
      label: p.label
    }));

    // === 横向网格线 ===
    ctx.setStrokeStyle('rgba(255,255,255,0.08)');
    ctx.setLineWidth(1);
    [0.25, 0.5, 0.75].forEach(ratio => {
      const y = padT + plotH * ratio;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
    });

    // === 目标线（虚线） ===
    if (targetWeight) {
      const targetY = padT + ((yMax - targetWeight) / yRange) * plotH;
      ctx.setStrokeStyle('rgba(204,255,0,0.55)');
      ctx.setLineWidth(1);
      ctx.setLineDash([4, 3], 0);
      ctx.beginPath();
      ctx.moveTo(padL, targetY);
      ctx.lineTo(W - padR, targetY);
      ctx.stroke();
      ctx.setLineDash([], 0);
      // 目标值标签
      ctx.setFillStyle('rgba(204,255,0,0.85)');
      ctx.setFontSize(10);
      ctx.setTextAlign('right');
      ctx.setTextBaseline('bottom');
      ctx.fillText('目标 ' + this.formatNum(targetWeight) + 'kg', W - padR, targetY - 2);
    }

    // === Catmull-Rom → 贝塞尔 平滑曲线 ===
    // 区域填充（渐变模拟：用半透明色）
    ctx.beginPath();
    ctx.moveTo(coords[0].x, padT + plotH);
    ctx.lineTo(coords[0].x, coords[0].y);
    this.drawSmoothPath(ctx, coords);
    ctx.lineTo(coords[coords.length - 1].x, padT + plotH);
    ctx.closePath();
    // 旧版 canvas 不支持渐变 fill，用半透明主色模拟区域填充
    ctx.setFillStyle('rgba(204,255,0,0.16)');
    ctx.fill();

    // 曲线线条
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    this.drawSmoothPath(ctx, coords);
    ctx.setStrokeStyle('#CCFF00');
    ctx.setLineWidth(2);
    ctx.setLineDash([], 0);
    ctx.stroke();

    // === 数据点 ===
    coords.forEach((c, i) => {
      const isLast = i === coords.length - 1;
      // 外圈
      ctx.beginPath();
      ctx.arc(c.x, c.y, isLast ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.setFillStyle(isLast ? '#CCFF00' : '#0A0A0A');
      ctx.fill();
      // 内圈 / 边框
      ctx.beginPath();
      ctx.arc(c.x, c.y, isLast ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.setStrokeStyle('#CCFF00');
      ctx.setLineWidth(isLast ? 2 : 1.5);
      ctx.stroke();
      // 最后一点标注最新值
      if (isLast) {
        ctx.setFillStyle('#CCFF00');
        ctx.setFontSize(11);
        ctx.setTextAlign('right');
        ctx.setTextBaseline('bottom');
        ctx.fillText(this.formatNum(c.weight), c.x, c.y - 8);
      }
    });

    // === X 轴日期 ===
    ctx.setFillStyle('#9A9A9A');
    ctx.setFontSize(10);
    ctx.setTextAlign('center');
    ctx.setTextBaseline('top');
    coords.forEach(c => {
      ctx.fillText(c.label, c.x, H - padB + 6);
    });

    ctx.draw();
  },

  // Catmull-Rom 转 三次贝塞尔（标准 0.5 张力），ctx 上累积 path
  drawSmoothPath(ctx, coords) {
    if (coords.length < 2) return;
    if (coords.length === 2) {
      ctx.lineTo(coords[1].x, coords[1].y);
      return;
    }
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i - 1] || coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  },

  // 数字格式化（保留 1 位小数，去掉多余 0）
  formatNum(n) {
    if (n === null || n === undefined) return '';
    const v = parseFloat(n);
    return v.toFixed(1);
  },

  onSwitchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ periodFilter: filter }, () => {
      this.loadData();
    });
  }
});
