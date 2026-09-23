const { Store, calcBMI, calcBMR, calcDailyCalories } = require('../../utils/store');
const engine = require('../../utils/trainingEngine');

const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

Page({
  data: {
    bmi: { value: '--', category: '', categoryCN: '' },
    bmr: 0,
    dailyCal: 0,
    protein: 0,
    water: '2.0L',
    bmiStatusStyle: '',
    bmiStatusText: '',
    genderText: '',
    height: '',
    weight: '',
    targetWeightDisplay: '--',
    bodyFatDisplay: '--',
    hasWaistHip: false,
    waistHipRatio: '',
    weeklyLoss: '0.5-0.8',
    weeksToGoal: '--',
    daysPerWeek: 4,
    trainingDetail: '',
    // 训练安排由真实周计划生成，不再写死「周一/周三/周五/周六」
    scheduleLine: '',
    safetyNotice: ''
  },

  onLoad() {
    const p = Store.getProfile();
    if (!p || !p.nickname) {
      wx.navigateTo({ url: '/pages/basic-info/index' });
      return;
    }

    const bmi = calcBMI(p.weight, p.height);
    const bmr = calcBMR(p.gender, p.weight, p.height, p.age);
    const dailyCal = calcDailyCalories(bmr, p.goal);
    const protein = Math.round(p.weight * 1.6);

    let bmiStatusStyle = '';
    let bmiStatusText = '正常（18.5-24）';
    if (bmi.category === 'underweight') {
      bmiStatusStyle = 'color:var(--warning);';
      bmiStatusText = '偏瘦（正常18.5-24）';
    } else if (bmi.category === 'overweight') {
      bmiStatusStyle = 'color:var(--warning);';
      bmiStatusText = '偏胖（正常18.5-24）';
    } else if (bmi.category === 'obese') {
      bmiStatusStyle = 'color:var(--danger);';
      bmiStatusText = '肥胖（正常18.5-24）';
    } else {
      bmiStatusStyle = 'color:var(--success);';
      bmiStatusText = '正常（18.5-24）';
    }

    const genderText = p.gender === 'male' ? '男' : '女';

    const targetDiff = p.targetWeight ? Math.abs(p.weight - p.targetWeight) : 0;
    const weeksToGoal = targetDiff > 0 ? Math.round(targetDiff / 0.65) : '--';

    let trainingDetail = '以力量训练+有氧结合为主';
    if (p.goal && p.goal.indexOf('减脂') >= 0) {
      trainingDetail = '以有氧燃脂为主，重点训练大肌群提高代谢';
    } else if (p.goal && p.goal.indexOf('增肌') >= 0) {
      trainingDetail = '以力量训练为主，重点训练臀腿与核心大肌群';
    } else if (p.goal && p.goal.indexOf('塑形') >= 0) {
      trainingDetail = '以中等强度力量训练+有氧循环，重点训练臀腿和核心';
    }

    // 训练安排必须来自真正会执行的周计划：
    // 原实现写死「周一/周三/周五/周六」4 天，且提到并不存在的「上肢+核心」，
    // 用户选了每周 2 天也会看到 4 天安排。
    const plan = engine.buildWeekPlan(p);
    const scheduleLine = plan.days
      .map(function (d, i) { return d.isRest ? null : WEEKDAY_NAMES[i] + '：' + d.name; })
      .filter(function (x) { return !!x; })
      .join(' · ');

    const hasWaistHip = p.waist && p.hip;
    const waistHipRatio = hasWaistHip ? (p.waist / p.hip).toFixed(2) : '';

    this.setData({
      bmi,
      bmr: bmr.toLocaleString(),
      dailyCal: dailyCal.toLocaleString(),
      protein,
      bmiStatusStyle,
      bmiStatusText,
      genderText,
      height: p.height,
      weight: p.weight,
      targetWeightDisplay: p.targetWeight ? p.targetWeight + 'kg' : '--',
      bodyFatDisplay: p.bodyFat ? p.bodyFat + '%' : '--',
      hasWaistHip,
      waistHipRatio,
      weeksToGoal,
      daysPerWeek: engine.getDaysPerWeek(p),
      trainingDetail,
      scheduleLine,
      safetyNotice: plan.safetyNotice || ''
    });
  },

  goToDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
