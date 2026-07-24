const { Store, calcBMI, getAvatarEmoji } = require('../../utils/store');

Page({
  data: {
    hasProfile: false,
    profile: {},
    bmi: { value: '--', category: '', categoryCN: '' },
    bmiTagClass: '',
    bmiTagStyle: '',
    // 推荐视频教程（PATCHED: welcome video exId mapping）
    videos: [
      { exId: 'squat', title: '自重深蹲动作详解', cat: '力量', duration: '3:25', thumb: '' },
      { exId: 'bridge', title: '臀桥动作详解', cat: '力量', duration: '4:10', thumb: 'green' },
      { exId: 'lunge', title: '弓步蹲动作详解', cat: '力量', duration: '5:48', thumb: 'blue' },
      { exId: 'side-leg', title: '侧卧抬腿动作详解', cat: '力量', duration: '6:32', thumb: 'purple' }
    ]
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  loadProfile() {
    const profile = Store.getProfile();
    if (profile && profile.nickname) {
      const bmi = calcBMI(profile.weight, profile.height);
      const bmiTagInfo = this.getBmiTagInfo(bmi);
      this.setData({
        hasProfile: true,
        profile,
        bmi,
        bmiTagClass: bmiTagInfo.cls,
        bmiTagStyle: bmiTagInfo.style
      });
    } else {
      this.setData({
        hasProfile: false,
        profile: {},
        bmi: { value: '--', category: '', categoryCN: '' },
        bmiTagClass: '',
        bmiTagStyle: ''
      });
    }
  },

  getBmiTagInfo(bmi) {
    let cls = 'profile-tag';
    let style = '';
    if (bmi.category === 'underweight') {
      cls += ' male';
      style = 'background:rgba(22,93,255,0.1);color:#165DFF';
    } else if (bmi.category === 'normal') {
      style = 'background:rgba(54,207,201,0.08);color:#0E9384';
    } else if (bmi.category === 'overweight') {
      style = 'background:rgba(245,158,11,0.1);color:#F59E0B';
    } else if (bmi.category === 'obese') {
      style = 'background:rgba(239,68,68,0.1);color:#EF4444';
    }
    return { cls, style };
  },

  goToBasicInfo() {
    wx.navigateTo({ url: '/pages/basic-info/index' });
  },

  goToAnalysis() {
    wx.navigateTo({ url: '/pages/analysis-report/index' });
  },

  onEditProfile() {
    wx.navigateTo({ url: '/pages/profile/index' });
  },

  // 视频点击 → 跳转到对应动作说明页（exId 映射）
  onTapVideo(e) {
    const exId = e.currentTarget.dataset.exid;
    if (!exId) return;
    wx.navigateTo({ url: '/pages/exercise-detail/index?id=' + exId });
  },

  goToTrainingPlan() {
    wx.navigateTo({ url: '/pages/training-plan/index' });
  }
});
