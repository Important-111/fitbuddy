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

const MEAL_PLANS = {
  '减脂': [
    { name: '早餐', time: '7:30', emoji: '🌞', calories: 350, protein: 28, carbs: 38, fat: 10, foods: ['全麦面包 1片', '水煮蛋 1个', '脱脂牛奶 200ml', '小番茄 100g'] },
    { name: '午餐', time: '12:00', emoji: '☀️', calories: 400, protein: 38, carbs: 42, fat: 8, foods: ['糙米饭 100g', '鸡胸肉 120g', '西兰花 150g', '橄榄油 3ml'] },
    { name: '加餐', time: '15:30', emoji: '🌿', calories: 150, protein: 10, carbs: 20, fat: 5, foods: ['苹果 1个', '坚果 15g'] },
    { name: '晚餐', time: '18:30', emoji: '🌙', calories: 350, protein: 35, carbs: 30, fat: 12, foods: ['蒸鱼 120g', '杂粮饭 80g', '时蔬沙拉', '豆腐汤 1碗'] }
  ],
  '增肌': [
    { name: '早餐', time: '7:30', emoji: '🌞', calories: 550, protein: 45, carbs: 55, fat: 15, foods: ['全麦面包 3片', '水煮蛋 3个', '全脂牛奶 300ml', '香蕉 1根'] },
    { name: '午餐', time: '12:00', emoji: '☀️', calories: 650, protein: 52, carbs: 60, fat: 18, foods: ['糙米饭 200g', '鸡胸肉 200g', '西兰花 150g', '橄榄油 10ml'] },
    { name: '加餐', time: '15:30', emoji: '🌿', calories: 350, protein: 30, carbs: 25, fat: 12, foods: ['蛋白粉 1勺', '坚果 30g', '全麦饼干 2片'] },
    { name: '晚餐', time: '18:30', emoji: '🌙', calories: 600, protein: 48, carbs: 45, fat: 20, foods: ['牛排 150g', '红薯 200g', '混合蔬菜', '牛油果 1/4个'] }
  ],
  '塑形': [
    { name: '早餐', time: '7:30', emoji: '🌞', calories: 430, protein: 28, carbs: 45, fat: 15, foods: ['全麦面包 2片', '水煮蛋 2个', '牛奶 250ml', '小番茄 100g'] },
    { name: '午餐', time: '12:00', emoji: '☀️', calories: 500, protein: 42, carbs: 55, fat: 12, foods: ['糙米饭 150g', '鸡胸肉 150g', '西兰花 100g', '橄榄油 5ml'] },
    { name: '加餐', time: '15:30', emoji: '🌿', calories: 200, protein: 15, carbs: 18, fat: 8, foods: ['希腊酸奶 150g', '坚果 20g', '蓝莓 50g'] },
    { name: '晚餐', time: '18:30', emoji: '🌙', calories: 400, protein: 38, carbs: 40, fat: 10, foods: ['蒸鱼 150g', '杂粮饭 100g', '时蔬沙拉', '豆腐汤 1碗'] }
  ]
};

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
    mealPlan: [],
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

    // Determine goal tab — only from profile on initial load, preserve manual switches
    let goalTab = this.data.goalTab;
    if (!goalTab) {
      goalTab = '塑形';
      if (goal.indexOf('减脂') >= 0) goalTab = '减脂';
      else if (goal.indexOf('增肌') >= 0) goalTab = '增肌';
    }

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

    const mealPlan = MEAL_PLANS[goalTab] || MEAL_PLANS['塑形'];

    this.setData({ nutrition, macro, dietLogs, goalTab, mealPlan });
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
