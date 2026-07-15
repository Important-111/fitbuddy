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
    completionOptions: [
      { label: '20%', val: 20, selected: false },
      { label: '40%', val: 40, selected: false },
      { label: '60%', val: 60, selected: false },
      { label: '80%', val: 80, selected: false },
      { label: '100%', val: 100, selected: true }
    ],
    fatigueOptions: [
      { label: '1', val: 1, selected: false },
      { label: '3', val: 3, selected: false },
      { label: '5', val: 5, selected: true },
      { label: '7', val: 7, selected: false },
      { label: '10', val: 10, selected: false }
    ],
    moodOptions: [
      { emoji: '😩', val: 1, selected: false },
      { emoji: '😕', val: 3, selected: false },
      { emoji: '😐', val: 5, selected: false },
      { emoji: '😊', val: 7, selected: true },
      { emoji: '🤩', val: 10, selected: false }
    ],
    painOptions: [
      { label: '没有疼痛', val: '没有疼痛', selected: true, isNone: true },
      { label: '膝盖', val: '膝盖', selected: false, isNone: false },
      { label: '腰部', val: '腰部', selected: false, isNone: false },
      { label: '肩颈', val: '肩颈', selected: false, isNone: false },
      { label: '手腕', val: '手腕', selected: false, isNone: false },
      { label: '脚踝', val: '脚踝', selected: false, isNone: false },
      { label: '其它', val: '其它', selected: false, isNone: false }
    ],
    weight: '',
    water: '',
    sleep: '',
    defaultWeight: '66',
    motivationShow: false,
    motivationData: {
      streak: 0,
      totalCal: 0,
      targetDiff: 0,
      daysToGoal: '--'
    }
  },

  onLoad() {
    this.loadCheckinData();
  },

  onShow() {
    this.loadCheckinData();
  },

  loadCheckinData() {
    const today = getDateStr(new Date());
    const existingRecord = Store.getCheckinByDate(today);
    const p = Store.getProfile() || {};

    // Reset selections
    const completionOptions = this.data.completionOptions.map(o => ({
      ...o,
      selected: existingRecord ? existingRecord.completion === o.val : o.val === 100
    }));
    const fatigueOptions = this.data.fatigueOptions.map(o => ({
      ...o,
      selected: existingRecord ? existingRecord.fatigue === o.val : o.val === 5
    }));
    const moodOptions = this.data.moodOptions.map(o => ({
      ...o,
      selected: existingRecord ? existingRecord.mood === o.val : o.val === 7
    }));

    // Pain tags
    const existingPains = existingRecord ? existingRecord.pains || [] : [];
    const painOptions = this.data.painOptions.map(o => {
      if (existingPains.length > 0) {
        return { ...o, selected: existingPains.indexOf(o.val) >= 0 };
      }
      return { ...o, selected: o.isNone };
    });

    this.setData({
      completionOptions,
      fatigueOptions,
      moodOptions,
      painOptions,
      weight: existingRecord ? String(existingRecord.weight || '') : (p.weight ? String(p.weight) : ''),
      water: existingRecord ? String(existingRecord.water || '') : '',
      sleep: existingRecord ? String(existingRecord.sleep || '') : '',
      defaultWeight: p.weight ? String(p.weight) : '66'
    });
  },

  onSelectCompletion(e) {
    const val = parseInt(e.currentTarget.dataset.val);
    const options = this.data.completionOptions.map(o => ({
      ...o,
      selected: o.val === val
    }));
    this.setData({ completionOptions: options });
  },

  onSelectFatigue(e) {
    const val = parseInt(e.currentTarget.dataset.val);
    const options = this.data.fatigueOptions.map(o => ({
      ...o,
      selected: o.val === val
    }));
    this.setData({ fatigueOptions: options });
  },

  onSelectMood(e) {
    const val = parseInt(e.currentTarget.dataset.val);
    const options = this.data.moodOptions.map(o => ({
      ...o,
      selected: o.val === val
    }));
    this.setData({ moodOptions: options });
  },

  onTogglePain(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const options = this.data.painOptions.map((o, i) => {
      if (i !== index) return o;
      return { ...o, selected: !o.selected };
    });

    // Special handling: if "没有疼痛" is toggled, clear others; if others toggled, clear "没有疼痛"
    const clickedItem = this.data.painOptions[index];
    let result;
    if (clickedItem.isNone) {
      // Toggling "没有疼痛" - if becoming selected, deselect all others
      const becomingSelected = !clickedItem.selected;
      result = options.map(o => ({
        ...o,
        selected: o.isNone ? becomingSelected : !becomingSelected
      }));
    } else {
      // Toggling a specific pain - deselect "没有疼痛"
      const noneSelected = options.find(o => o.isNone).selected;
      result = options.map(o => ({
        ...o,
        selected: o.isNone ? false : (i === index ? !clickedItem.selected : o.selected)
      }));
    }

    this.setData({ painOptions: result });
  },

  onWeightInput(e) {
    this.setData({ weight: e.detail.value });
  },

  onWaterInput(e) {
    this.setData({ water: e.detail.value });
  },

  onSleepInput(e) {
    this.setData({ sleep: e.detail.value });
  },

  onSubmitCheckin() {
    const completion = this.data.completionOptions.find(o => o.selected)?.val || 100;
    const weight = parseFloat(this.data.weight) || 0;
    const water = parseInt(this.data.water) || 0;
    const sleep = parseFloat(this.data.sleep) || 0;
    const fatigue = this.data.fatigueOptions.find(o => o.selected)?.val || 5;
    const mood = this.data.moodOptions.find(o => o.selected)?.val || 7;
    const pains = this.data.painOptions.filter(o => o.selected).map(o => o.val);

    if (!weight) {
      wx.showToast({ title: '请输入今日体重', icon: 'none' });
      return;
    }

    const record = {
      date: getDateStr(new Date()),
      completion,
      weight,
      water,
      sleep,
      fatigue,
      mood,
      pains
    };

    Store.addCheckin(record);
    Store.markWorkoutDone(record.date);

    // Update user weight
    const p = Store.getProfile() || {};
    p.weight = weight;
    Store.saveProfile(p);

    // Show motivation modal
    const streak = Store.getStreakDays();
    const totalCal = Store.getTotalCaloriesBurned();
    const targetDiff = p.targetWeight ? Math.max(0, Math.round((p.weight - p.targetWeight) * 10) / 10) : 0;
    const daysToGoal = targetDiff > 0 ? Math.round(targetDiff / 0.65 * 7) : '--';

    // Format totalCal with locale
    const formattedTotalCal = totalCal.toLocaleString ? totalCal.toLocaleString() : String(totalCal);

    this.setData({
      motivationShow: true,
      motivationData: {
        streak,
        totalCal: formattedTotalCal,
        targetDiff: targetDiff > 0 ? targetDiff : 0,
        daysToGoal
      }
    });
  },

  onCloseMotivation() {
    this.setData({ motivationShow: false, jumping: true });
    setTimeout(() => { wx.reLaunch({ url: '/pages/dashboard/index' }); }, 350);
  },

  onCloseMotivationOuter(e) {
    if (e.target === e.currentTarget) {
      this.setData({ motivationShow: false });
    }
  }
});
