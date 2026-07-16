Page({
  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/profile/index' }) });
  },
  goPrivacy() {
    wx.navigateTo({ url: '/pages/agreement/privacy/index' });
  }
});
