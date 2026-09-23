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
    settingsShow: false
  },

  onLoad(options) {
    this.loadData();
    // 兼容旧的 profile?edit=1 入口（welcome 已改为直接跳 basic-info）：
    // 用 redirectTo 转到 basic-info 的编辑态，避免返回时二次跳转
    if (options && options.edit === '1') {
      wx.redirectTo({ url: '/pages/basic-info/index?from=profile' });
    }
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

  // 「功能设置」菜单：只处理真实存在的入口（原先 export/help 只弹「开发中」，已移除）
  onMenuTap(e) {
    const menu = e.currentTarget.dataset.menu;
    switch (menu) {
      case 'goals':
        wx.navigateTo({ url: '/pages/training-goals/index' });
        break;
      case 'feedback':
        this.jumpToFeedback();
        break;
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

  // 快捷切换主目标：`goal` 是训练引擎读的主目标，`goals` 是「训练目标」页的多选列表。
  // 两者必须同步——此前只写 goal，导致目标页仍显示旧选中态。
  onGoalCardTap(e) {
    const goal = e.currentTarget.dataset.goal;
    const p = Store.getProfile() || {};
    const rest = (p.goals || []).filter(g => g !== goal);
    p.goal = goal;
    p.goals = [goal].concat(rest);
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
          wx.reLaunch({ url: '/pages/welcome/index' });
        }
      }
    });
  },

  // 编辑身体数据：统一跳 basic-info 的编辑态（字段比原弹窗更全——
  // 多了目标体重/腰围/臀围/体脂率），保存后 navigateBack 回本页，onShow 重载
  onQuickEdit() {
    wx.navigateTo({ url: '/pages/basic-info/index?from=profile' });
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
      content: '注销后您的所有数据（基础信息、训练记录等）将被永久删除且不可恢复。是否继续？',
      confirmText: '确认注销',
      confirmColor: '#EF4444',
      cancelText: '取消',
      success: (res) => {
        if (!res.confirm) return;
        wx.showModal({
          title: '再次确认',
          content: '此操作不可撤销，请再次确认是否注销账号。',
          confirmText: '确定注销',
          confirmColor: '#EF4444',
          cancelText: '取消',
          success: (r2) => {
            if (!r2.confirm) return;
            this.doDeleteAccount();
          }
        });
      }
    });
  },

  // 注销账号：清空本地与云端全部数据（Store.clearAll 内部保证先云后本地的顺序）
  // 云端清除失败时保留本地数据并明确告知用户，避免产生「假注销」
  doDeleteAccount() {
    wx.showLoading({ title: '正在注销...', mask: true });
    Store.clearAll().then(function (ok) {
      wx.hideLoading();
      if (!ok) {
        wx.showModal({
          title: '注销未完成',
          content: '云端数据清除失败，可能是网络问题。您的数据仍完整保留，请检查网络后重试。',
          showCancel: false,
          confirmText: '我知道了'
        });
        return;
      }
      wx.showToast({ title: '账号已注销', icon: 'none' });
      setTimeout(function () {
        wx.reLaunch({ url: '/pages/welcome/index' });
      }, 1500);
    });
  }
});
