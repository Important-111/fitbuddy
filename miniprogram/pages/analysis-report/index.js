const { Store, calcBMI, calcBMR, calcDailyCalories } = require('../../utils/store');

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
    mondayWorkout: '',
    fridayWorkout: ''
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
    let mondayWorkout = '臀腿力量';
    let fridayWorkout = '综合力量';
    if (p.goal && p.goal.indexOf('减脂') >= 0) {
      trainingDetail = '以有氧燃脂为主，重点训练大肌群提高代谢';
      mondayWorkout = 'HIIT燃脂';
      fridayWorkout = '有氧燃脂';
    } else if (p.goal && p.goal.indexOf('增肌') >= 0) {
      trainingDetail = '以力量训练为主，重点训练胸背腿大肌群';
    } else if (p.goal && p.goal.indexOf('塑形') >= 0) {
      trainingDetail = '以中等强度力量训练+有氧循环，重点训练臀腿和核心';
    }

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
      daysPerWeek: p.daysPerWeek || 4,
      trainingDetail,
      mondayWorkout,
      fridayWorkout
    });
  },

  goToDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
