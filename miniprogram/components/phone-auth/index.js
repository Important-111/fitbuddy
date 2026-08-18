Component({
  properties: {
    visible: { type: Boolean, value: false }
  },
  data: {
    agreed: false,
    showPrivacy: false
  },
  lifetimes: {
    attached() {
      const that = this;
      // 注册微信隐私授权监听：调用 getPhoneNumber 等隐私接口且用户尚未授权时触发
      this._privacyHandler = function (resolve) {
        that.privacyResolve = resolve;
        that.setData({ showPrivacy: true });
      };
      if (typeof wx.onNeedPrivacyAuthorize === 'function') {
        wx.onNeedPrivacyAuthorize(this._privacyHandler);
      }
    },
    detached() {
      // 组件卸载时注销监听，避免重复注册导致多实例叠加
      if (this._privacyHandler && typeof wx.offNeedPrivacyAuthorize === 'function') {
        wx.offNeedPrivacyAuthorize(this._privacyHandler);
      }
    }
  },
  methods: {
    noop() {},
    onMaskTap() {
      this.onClose();
    },
    onClose() {
      this.triggerEvent('close');
      this.setData({ agreed: false });
    },
    toggleAgree() {
      this.setData({ agreed: !this.data.agreed });
    },
    openService() {
      wx.navigateTo({ url: '/pages/agreement/service/index' });
    },
    openPrivacy() {
      wx.navigateTo({ url: '/pages/agreement/privacy/index' });
    },

    /* ===== 微信隐私保护指引授权弹窗 ===== */
    openPrivacyContract() {
      wx.navigateTo({ url: '/pages/agreement/privacy/index' });
    },
    agreePrivacy() {
      if (this.privacyResolve) {
        try {
          this.privacyResolve({ event: 'agree' });
        } catch (e) {
          console.log('[phone-auth] privacy resolve failed', e);
        }
      }
      this.setData({ showPrivacy: false });
    },
    rejectPrivacy() {
      this.setData({ showPrivacy: false });
      wx.showToast({ title: '需先同意隐私保护指引', icon: 'none' });
    },

    onGetPhoneNumber(e) {
      if (!this.data.agreed) {
        wx.showToast({ title: '请先勾选同意协议', icon: 'none' });
        return;
      }
      const { errMsg, encryptedData, iv, code } = e.detail || {};
      if (errMsg && errMsg.indexOf('ok') !== -1) {
        this.triggerEvent('authorized', { encryptedData, iv, code });
      } else if (errMsg && errMsg.indexOf('deny') !== -1) {
        wx.showToast({ title: '您已拒绝授权手机号', icon: 'none' });
        this.triggerEvent('deny');
      } else if (errMsg && errMsg.indexOf('getPhoneNumber:fail no permission') !== -1) {
        wx.showModal({
          title: '无法获取手机号',
          content: '该小程序尚未开通获取手机号能力，需在微信公众平台申请。请改用其他方式绑定或联系客服。',
          showCancel: false,
          confirmText: '我知道了'
        });
        this.triggerEvent('error', { errMsg });
      } else {
        this.triggerEvent('error', { errMsg: errMsg || 'unknown' });
      }
    }
  }
});
