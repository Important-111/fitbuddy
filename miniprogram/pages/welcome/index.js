const { Store, calcBMI, getAvatarEmoji } = require('../../utils/store');

Page({
  data: {
    hasProfile: false,
    profile: {},
    bmi: { value: '--', category: '', categoryCN: '' },
    bmiTagClass: '',
    bmiTagStyle: ''
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
    const profile = Store.getProfile();
    if (!profile) return;
    wx.showModal({
      title: '编辑基本资料',
      editable: true,
      placeholderText: '此功能将在后续版本完善',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
