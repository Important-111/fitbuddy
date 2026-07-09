/* ===== FitBuddy 健身教练 - 应用入口 ===== */

App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloudbase-d2gh39c9caffcf418',
      traceUser: true
    });

    const sysInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = sysInfo;
    this.globalData.statusBarHeight = sysInfo.statusBarHeight;
    this.globalData.screenWidth = sysInfo.screenWidth;
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 20,
    screenWidth: 375,
    userInfo: null
  }
});
