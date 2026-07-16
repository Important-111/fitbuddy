Component({
  properties: {
    visible: { type: Boolean, value: false }
  },
  data: {
    agreed: false
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
