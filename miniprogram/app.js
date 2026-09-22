/* ===== FitBuddy 健身助手 - 应用入口 ===== */

const cloudSync = require('./utils/cloudSync');
const { Store } = require('./utils/store');

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

    // 启动时合并云端用户资料：云端较新则写回本地，本地较新则补推云端
    // （跨设备/重装恢复；云不可用时静默跳过，不影响启动）
    cloudSync.pullProfile().then(function (cloudProfile) {
      if (!cloudProfile) return;
      const local = Store.getProfile();
      const merged = cloudSync.mergeProfile(local, cloudProfile);
      if (!merged) return;
      const cloudNewer = merged === cloudProfile && (cloudProfile.updatedAt || 0) > (local && local.updatedAt || 0);
      const localNewer = merged === local && (local.updatedAt || 0) > (cloudProfile.updatedAt || 0);
      if (cloudNewer) {
        Store.saveProfileSilent(cloudProfile);
      } else if (localNewer) {
        cloudSync.pushProfile(local);
      }
    });

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
