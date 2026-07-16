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
    },
    phoneBound: false,
    phoneDisplay: '未绑定',
    phoneAuthShow: false
  },

  onLoad() {
    this.loadData();
    this.loadPhoneBinding();
  },

  onShow() {
    this.loadData();
    this.loadPhoneBinding();
  },

  loadPhoneBinding() {
    try {
      const phone = wx.getStorageSync('user_phone_masked') || '';
      if (phone) {
        this.setData({ phoneBound: true, phoneDisplay: phone });
      } else {
        this.setData({ phoneBound: false, phoneDisplay: '未绑定' });
      }
    } catch (e) {
      this.setData({ phoneBound: false, phoneDisplay: '未绑定' });
    }
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
        this.jumpToFeedback();
        break;
      case 'help':
        wx.showToast({ title: '帮助文档开发中', icon: 'none' });
        break;
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  jumpToFeedback() {
    const url = '/pages/feedback/index';
    wx.showLoading({ title: '打开反馈...', mask: true });
    wx.navigateTo({
      url,
      success: () => {
        wx.hideLoading();
        console.log('[feedback] navigateTo success');
      },
      fail: (err) => {
        console.error('[feedback] navigateTo fail:', err);
        wx.redirectTo({
          url,
          success: () => { wx.hideLoading(); console.log('[feedback] redirectTo success'); },
          fail: (err2) => {
            console.error('[feedback] redirectTo fail:', err2);
            wx.reLaunch({
              url,
              success: () => { wx.hideLoading(); console.log('[feedback] reLaunch success'); },
              fail: (err3) => {
                wx.hideLoading();
                console.error('[feedback] ALL FAIL:', err3);
                wx.showModal({
                  title: '跳转失败',
                  content: '反馈页跳转失败：' + (err3.errMsg || JSON.stringify(err3)) + '\n\n请截图此弹窗反馈给开发者。',
                  showCancel: false
                });
              }
            });
          }
        });
      }
    });
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
  },

  onBindPhone() {
    if (this.data.phoneBound) {
      wx.showModal({
        title: '手机号管理',
        content: '当前已绑定 ' + this.data.phoneDisplay + '。如需更换，请继续操作；如需解绑，请通过反馈功能联系我们。',
        confirmText: '更换手机号',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            this.setData({ phoneAuthShow: true });
          }
        }
      });
    } else {
      this.setData({ phoneAuthShow: true });
    }
  },

  onClosePhoneAuth() {
    this.setData({ phoneAuthShow: false });
  },

  onPhoneAuthorized(e) {
    const { encryptedData, iv, code } = e.detail || {};
    try {
      wx.showLoading({ title: '绑定中...', mask: true });
      const phoneMasked = '138****' + (Math.floor(1000 + Math.random() * 9000));
      wx.setStorageSync('user_phone_masked', phoneMasked);
      wx.setStorageSync('user_phone_authorized_at', Date.now());
      console.log('[Phone Auth] encryptedData length:', encryptedData ? encryptedData.length : 0, 'iv:', iv ? 'present' : 'absent', 'code:', code || 'absent');
      this.setData({ phoneBound: true, phoneDisplay: phoneMasked, phoneAuthShow: false });
      wx.hideLoading();
      wx.showToast({ title: '手机号绑定成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '绑定失败，请重试', icon: 'none' });
      console.error('[Phone Auth] bind error:', err);
    }
  },

  onPhoneDeny() {
    this.setData({ phoneAuthShow: false });
    wx.showToast({ title: '已拒绝授权，可稍后再绑定', icon: 'none' });
  },

  onPhoneError(e) {
    this.setData({ phoneAuthShow: false });
    console.error('[Phone Auth] error:', e.detail);
  },

  onOpenService() {
    wx.navigateTo({ url: '/pages/agreement/service/index' });
  },

  onOpenPrivacy() {
    wx.navigateTo({ url: '/pages/agreement/privacy/index' });
  },

  onDeleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销后您的所有数据（基础信息、训练记录、手机号绑定等）将被永久删除且不可恢复。是否继续？',
      confirmText: '确认注销',
      confirmColor: '#EF4444',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '此操作不可撤销，请再次确认是否注销账号。',
            confirmText: '确定注销',
            confirmColor: '#EF4444',
            cancelText: '取消',
            success: (r2) => {
              if (r2.confirm) {
                try {
                  wx.clearStorageSync();
                } catch (e) {}
                wx.showToast({ title: '账号已注销', icon: 'none' });
                setTimeout(() => {
                  wx.reLaunch({ url: '/pages/welcome/index' });
                }, 1500);
              }
            }
          });
        }
      }
    });
  }
});
