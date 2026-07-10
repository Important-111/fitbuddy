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
    profile: {},
    avatar: '👨',
    nickname: '用户',
    goalText: '未设定',
    tags: [],
    stats: {
      workouts: 0,
      minutes: 0,
      calories: '0',
      bmr: 0
    },
    profileData: {
      nickname: '用户',
      height: '--',
      weight: '--',
      targetWeight: '--',
      bmi: '--（--）',
      bmrValue: 0
    },
    settingsShow: false,
    editProfileShow: false,
    settings: {
      trainReminder: true,
      dietReminder: false,
      waterReminder: true,
      nightMode: false
    },
    goalOptions: ['增肌塑形', '减脂瘦身', '提升体能', '保持健康'],
    editForm: {
      nickname: '',
      gender: 'male',
      age: '',
      height: '',
      weight: '',
      goalIndex: 0,
      goalLabel: '增肌塑形'
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
    const records = Store.getCheckins();
    const bmr = calcBMR(p.gender, p.weight, p.height, p.age);
    const bmi = calcBMI(p.weight, p.height);

    const genderText = p.gender === 'male' ? '男' : '女';
    const avatar = getAvatarEmoji(p.gender);
    const nickname = p.nickname || '用户';
    let goalText = p.goal || '未设定';
    if (p.targetWeight) goalText += ' · 目标 ' + p.targetWeight + 'kg';

    const tags = [genderText + ' · ' + (p.age || '--') + '岁'];
    if (p.experience) tags.push(p.experience);
    if (p.locations && p.locations.length) tags.push(p.locations[0] + (p.locations.length > 1 ? '等' : ''));

    const totalWorkouts = records.length;
    const totalMinutes = Store.getTotalMinutes();
    const totalCal = Store.getTotalCaloriesBurned();
    const streak = Store.getStreakDays();

    const stats = {
      workouts: totalWorkouts,
      minutes: totalMinutes,
      calories: totalCal.toLocaleString ? totalCal.toLocaleString() : String(totalCal),
      bmr
    };

    const profileData = {
      nickname,
      height: p.height || '--',
      weight: p.weight || '--',
      targetWeight: p.targetWeight || '--',
      bmi: bmi.value + '（' + bmi.categoryCN + '）',
      bmrValue: bmr.toLocaleString ? bmr.toLocaleString() : String(bmr)
    };

    this.setData({
      profile: p,
      avatar,
      nickname,
      goalText,
      tags,
      stats,
      profileData
    });
  },

  onOpenSettingsPanel() {
    this.setData({ settingsShow: true });
  },

  onCloseSettings() {
    this.setData({ settingsShow: false });
  },

  onCloseSettingsOuter(e) {
    if (e.target === e.currentTarget) {
      this.setData({ settingsShow: false });
    }
  },

  onToggleSetting(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail.value;
    this.setData({ ['settings.' + key]: val });
    const labels = {
      trainReminder: '训练提醒',
      dietReminder: '饮食提醒',
      waterReminder: '喝水提醒',
      nightMode: '夜间勿扰模式'
    };
    wx.showToast({ title: (val ? '开启' : '关闭') + labels[key], icon: 'none' });
  },

  onMenuTap(e) {
    const menu = e.currentTarget.dataset.menu;
    switch (menu) {
      case 'goals':
        wx.navigateTo({ url: '/pages/training-goals/index' });
        break;
      case 'export':
        wx.showToast({ title: '导出功能开发中', icon: 'none' });
        break;
      case 'feedback':
        wx.showToast({ title: '感谢你的反馈！', icon: 'none' });
        break;
      case 'help':
        wx.showToast({ title: '帮助文档开发中', icon: 'none' });
        break;
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onGoalCardTap(e) {
    const goal = e.currentTarget.dataset.goal;
    const p = Store.getProfile() || {};
    p.goal = goal;
    Store.saveProfile(p);
    wx.showToast({ title: '目标已切换至' + goal, icon: 'none' });
    this.loadData();
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？所有数据将被保留在本地。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/welcome/index' });
        }
      }
    });
  },

  // Edit Profile
  onQuickEdit(e) {
    const p = Store.getProfile() || {};
    const goalOptions = this.data.goalOptions;
    let goalIndex = 0;
    const idx = goalOptions.indexOf(p.goal);
    if (idx >= 0) goalIndex = idx;

    this.setData({
      editProfileShow: true,
      editForm: {
        nickname: p.nickname || '',
        gender: p.gender || 'male',
        age: p.age ? String(p.age) : '',
        height: p.height ? String(p.height) : '',
        weight: p.weight ? String(p.weight) : '',
        goalIndex,
        goalLabel: goalOptions[goalIndex]
      }
    });
  },

  onCloseEditProfile() {
    this.setData({ editProfileShow: false });
  },

  onCloseEditProfileOuter(e) {
    if (e.target === e.currentTarget) {
      this.setData({ editProfileShow: false });
    }
  },

  onEditFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['editForm.' + field]: e.detail.value });
  },

  onEditGenderSelect(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ 'editForm.gender': gender });
  },

  onEditGoalChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      'editForm.goalIndex': idx,
      'editForm.goalLabel': this.data.goalOptions[idx]
    });
  },

  onConfirmEditProfile() {
    const form = this.data.editForm;
    const p = Store.getProfile() || {};

    p.nickname = form.nickname || '用户';
    p.gender = form.gender;
    p.age = parseInt(form.age) || 0;
    p.height = parseInt(form.height) || 0;
    p.weight = parseInt(form.weight) || 0;
    p.goal = this.data.goalOptions[form.goalIndex];

    Store.saveProfile(p);

    this.setData({ editProfileShow: false }, () => {
      this.loadData();
    });
    wx.showToast({ title: '资料已保存', icon: 'none' });
  }
});
