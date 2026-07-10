/* ===== FitBuddy 健身教练 - 应用入口 ===== */

App({
  onLaunch() {
    try {
      wx.cloud.init({
        env: 'cloudbase-d2gh39c9caffcf418',
        traceUser: true
      });
    } catch (e) {
      console.log('[FitBuddy] 云开发未配置，使用本地存储模式');
    }

    const windowInfo = wx.getWindowInfo();
    const deviceInfo = wx.getDeviceInfo();
    const appBaseInfo = wx.getAppBaseInfo();
    this.globalData.systemInfo = { ...windowInfo, ...deviceInfo, ...appBaseInfo, platform: deviceInfo.platform };
    this.globalData.statusBarHeight = windowInfo.statusBarHeight;
    this.globalData.screenWidth = windowInfo.screenWidth;
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 20,
    screenWidth: 375,
    userInfo: null
  }
});
