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
    goalTab: '',
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    macro: {
      ringR: 15.9,
      proteinPct: '0',
      carbPct: '0',
      fatPct: '0',
      proteinStroke: '',
      carbStroke: '',
      carbOffset: '',
      fatStroke: '',
      fatOffset: '',
      proteinPercent: 0,
      carbPercent: 0,
      fatPercent: 0,
      currentProtein: 0,
      currentCarbs: 0,
      currentFat: 0
    },
    dietLogs: [],
    dietFormVisible: false,
    mealTypeOptions: ['早餐', '午餐', '晚餐', '加餐'],
    dietForm: {
      foodName: '',
      mealTypeIndex: 0,
      mealTypeLabel: '早餐',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    }
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const p = Store.getProfile() || {};
    const goal = p.goal || '';

    // Determine goal tab
    let goalTab = '塑形';
    if (goal.indexOf('减脂') >= 0) goalTab = '减脂';
    else if (goal.indexOf('增肌') >= 0) goalTab = '增肌';

    const bmr = calcBMR(p.gender, p.weight, p.height, p.age);
    let dailyCal = calcDailyCalories(bmr, goal);
    if (!dailyCal) dailyCal = 2000;

    let protein = Math.round(p.weight * 1.6);
    let carbs = Math.round(dailyCal * 0.4 / 4);
    let fat = Math.round(dailyCal * 0.25 / 9);

    if (goalTab === '增肌') {
      protein = Math.round(p.weight * 2);
      carbs = Math.round(dailyCal * 0.45 / 4);
      fat = Math.round(dailyCal * 0.2 / 9);
    } else if (goalTab === '减脂') {
      protein = Math.round(p.weight * 1.8);
      carbs = Math.round(dailyCal * 0.35 / 4);
      fat = Math.round(dailyCal * 0.25 / 9);
    }

    const currentProtein = Math.round(protein * 0.75);
    const currentCarbs = Math.round(carbs * 0.6);
    const currentFat = Math.round(fat * 0.45);

    const calProtein = currentProtein * 4;
    const calCarbs = currentCarbs * 4;
    const calFat = currentFat * 9;
    const calTotal = calProtein + calCarbs + calFat || 1;
    const pPct = (calProtein / calTotal * 100).toFixed(1);
    const cPct = (calCarbs / calTotal * 100).toFixed(1);
    const fPct = (calFat / calTotal * 100).toFixed(1);

    const ringR = 15.9;
    const ringC = 2 * Math.PI * ringR;

    function ringSeg(pct, offset) {
      const len = parseFloat(pct) / 100 * ringC;
      const off = offset / 100 * ringC;
      return {
        strokeDasharray: len.toFixed(1) + ' ' + ringC.toFixed(1),
        strokeDashoffset: '-' + off.toFixed(1)
      };
    }

    const proteinSeg = ringSeg(pPct, 0);
    const carbSeg = ringSeg(cPct, parseFloat(pPct));
    const fatSeg = ringSeg(fPct, parseFloat(pPct) + parseFloat(cPct));

    const nutrition = {
      calories: dailyCal.toLocaleString ? dailyCal.toLocaleString() : String(dailyCal),
      protein,
      carbs,
      fat
    };

    const macro = {
      ringR,
      proteinPct: pPct,
      carbPct: cPct,
      fatPct: fPct,
      proteinStroke: proteinSeg.strokeDasharray,
      carbStroke: carbSeg.strokeDasharray,
      carbOffset: carbSeg.strokeDashoffset,
      fatStroke: fatSeg.strokeDasharray,
      fatOffset: fatSeg.strokeDashoffset,
      proteinPercent: Math.round(currentProtein / protein * 100),
      carbPercent: Math.round(currentCarbs / carbs * 100),
      fatPercent: Math.round(currentFat / fat * 100),
      currentProtein,
      currentCarbs,
      currentFat
    };

    // Diet logs
    const todayLogs = Store.getTodayDietLogs();
    const mealTypes = ['早餐', '午餐', '晚餐', '加餐'];
    const logsByMeal = {};
    mealTypes.forEach(m => { logsByMeal[m] = []; });
    todayLogs.forEach(l => {
      if (logsByMeal[l.mealType]) logsByMeal[l.mealType].push(l);
    });

    const dietLogs = mealTypes.map(mt => {
      const logs = logsByMeal[mt] || [];
      const totalCal = logs.reduce((s, l) => s + (Number(l.calories) || 0), 0);
      return { mealType: mt, logs, totalCal };
    });

    this.setData({ nutrition, macro, dietLogs, goalTab });
  },

  onSelectGoalTab(e) {
    const goal = e.currentTarget.dataset.goal;
    this.setData({ goalTab: goal }, () => {
      this.loadData();
    });
    wx.showToast({ title: '切换至' + goal + '模式', icon: 'none' });
  },

  onToggleDietForm() {
    this.setData({
      dietFormVisible: !this.data.dietFormVisible,
      dietForm: {
        foodName: '',
        mealTypeIndex: 0,
        mealTypeLabel: '早餐',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      }
    });
  },

  onFormFoodNameInput(e) {
    this.setData({ 'dietForm.foodName': e.detail.value });
  },

  onFormMealTypeChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      'dietForm.mealTypeIndex': idx,
      'dietForm.mealTypeLabel': this.data.mealTypeOptions[idx]
    });
  },

  onFormCaloriesInput(e) {
    this.setData({ 'dietForm.calories': e.detail.value });
  },

  onFormProteinInput(e) {
    this.setData({ 'dietForm.protein': e.detail.value });
  },

  onFormCarbsInput(e) {
    this.setData({ 'dietForm.carbs': e.detail.value });
  },

  onFormFatInput(e) {
    this.setData({ 'dietForm.fat': e.detail.value });
  },

  onSubmitDietLog() {
    const form = this.data.dietForm;
    const foodName = form.foodName.trim();
    const mealType = this.data.mealTypeOptions[form.mealTypeIndex];
    const calories = parseInt(form.calories) || 0;
    const protein = parseInt(form.protein) || 0;
    const carbs = parseInt(form.carbs) || 0;
    const fat = parseInt(form.fat) || 0;

    if (!foodName) {
      wx.showToast({ title: '请输入食物名称', icon: 'none' });
      return;
    }

    Store.addDietLog({ foodName, mealType, calories, protein, carbs, fat });
    wx.showToast({ title: '已记录：' + foodName, icon: 'none' });

    this.setData({
      dietFormVisible: false,
      dietForm: {
        foodName: '',
        mealTypeIndex: 0,
        mealTypeLabel: '早餐',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      }
    }, () => {
      this.loadData();
    });
  },

  onDeleteDietLog(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    Store.removeDietLog(id);
    this.loadData();
    wx.showToast({ title: '已删除', icon: 'none' });
  }
});
