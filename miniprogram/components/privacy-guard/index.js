/* ===== FitBuddy 隐私保护指引授权弹窗（可复用组件） =====
 *
 * 用途：微信要求调用隐私接口（如 wx.setClipboardData）前，必须先让用户
 * 同意《小程序用户隐私保护指引》。本组件负责弹出自定义暗黑风格弹窗，
 * 并把用户的选择回传给微信。
 *
 * 用法：在用到隐私接口的页面里
 *   1) 页面 .json 的 usingComponents 加 "privacy-guard": "/components/privacy-guard/index"
 *   2) 页面 .wxml 末尾放 <privacy-guard />
 *
 * 关键约束（踩过坑，别改回去）：
 *   - 官方接口名是 wx.onNeedPrivacyAuthorization（带 -ization）。
 *     写成 onNeedPrivacyAuthorize 会导致 typeof 判断恒为 false、监听注册不上，
 *     弹窗变成死代码，实际会退化成微信平台默认白底弹窗。
 *   - 注册了监听就必须调用 resolve，否则被挂起的隐私接口会永久 pending。
 *     同意传 {event:'agree'}，拒绝必须传 {event:'disagree'}。
 *   - 展示弹窗时可先回调 {event:'exposureAuthorization'}（官方推荐，用于曝光统计）。
 *   - 未注册监听时微信会弹自己的默认弹窗，功能仍可用、仍合规，只是样式不统一。
 */

Component({
  data: {
    showPrivacy: false
  },
  lifetimes: {
    attached() {
      const that = this;
      this._privacyHandler = function (resolve) {
        that.privacyResolve = resolve;
        that.setData({ showPrivacy: true });
        try {
          resolve({ event: 'exposureAuthorization' });
        } catch (e) {
          console.log('[privacy-guard] exposure failed', e);
        }
      };
      if (typeof wx.onNeedPrivacyAuthorization === 'function') {
        wx.onNeedPrivacyAuthorization(this._privacyHandler);
      }
    },
    detached() {
      if (this._privacyHandler && typeof wx.offNeedPrivacyAuthorization === 'function') {
        wx.offNeedPrivacyAuthorization(this._privacyHandler);
      }
    }
  },
  methods: {
    noop() {},

    openPrivacyContract() {
      wx.navigateTo({ url: '/pages/agreement/privacy/index' });
    },

    agreePrivacy() {
      const resolve = this.privacyResolve;
      this.privacyResolve = null;
      if (resolve) {
        try {
          resolve({ event: 'agree' });
        } catch (e) {
          console.log('[privacy-guard] resolve failed', e);
        }
      }
      this.setData({ showPrivacy: false });
    },

    rejectPrivacy() {
      // 必须回调 disagree，否则被挂起的隐私接口既不放行也不报错，会一直卡住
      const resolve = this.privacyResolve;
      this.privacyResolve = null;
      if (resolve) {
        try {
          resolve({ event: 'disagree' });
        } catch (e) {
          console.log('[privacy-guard] resolve failed', e);
        }
      }
      this.setData({ showPrivacy: false });
      wx.showToast({ title: '需先同意隐私保护指引', icon: 'none' });
    }
  }
});
