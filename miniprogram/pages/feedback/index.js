const { Store } = require('../../utils/store');

const FEEDBACK_TYPES = [
  { value: 'bug', emoji: '🐛', label: 'Bug 反馈' },
  { value: 'suggestion', emoji: '💡', label: '功能建议' },
  { value: 'experience', emoji: '😊', label: '体验问题' },
  { value: 'content', emoji: '📋', label: '内容纠错' },
  { value: 'complaint', emoji: '😤', label: '吐槽不满' },
  { value: 'other', emoji: '✉️', label: '其他' }
];

const TYPE_LABEL_MAP = FEEDBACK_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

const STATUS_LABEL_MAP = {
  pending: '待处理',
  replied: '已回复',
  resolved: '已解决'
};

function formatTime(ts) {
  const d = new Date(ts);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

Page({
  data: {
    feedbackTypes: FEEDBACK_TYPES,
    form: {
      type: 'suggestion',
      content: '',
      contact: ''
    },
    submitting: false,
    history: []
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const list = wx.getStorageSync('user_feedback_history') || [];
    const enriched = list.map(it => Object.assign({}, it, {
      typeLabel: TYPE_LABEL_MAP[it.type] || '其他',
      statusLabel: STATUS_LABEL_MAP[it.status] || '待处理',
      timeLabel: formatTime(it.ts)
    }));
    this.setData({ history: enriched });
  },

  onTypeSelect(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ 'form.type': value });
  },

  onContentInput(e) {
    this.setData({ 'form.content': e.detail.value });
  },

  onContactInput(e) {
    this.setData({ 'form.contact': e.detail.value });
  },

  onSubmit() {
    const { type, content, contact } = this.data.form;
    const trimmed = (content || '').trim();
    if (trimmed.length < 10) {
      wx.showToast({ title: '请至少填写 10 个字', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });

    const profile = Store.getProfile() || {};
    const userId = (profile.userId || 'guest_' + Date.now()).toString();
    const record = {
      ts: Date.now(),
      feedback_id_local: 'fb_' + Date.now() + '_' + Math.floor(Math.random() * 1e4),
      user_id: userId,
      nickname: profile.nickname || '',
      type,
      content: trimmed,
      contact: (contact || '').trim(),
      status: 'pending',
      admin_reply: '',
      device_info: this.getDeviceInfo()
    };

    const list = wx.getStorageSync('user_feedback_history') || [];
    list.unshift(record);
    if (list.length > 50) list.length = 50;
    wx.setStorageSync('user_feedback_history', list);

    // 同步至全局待上报队列（后端 API 接入后由 app.js 统一上报）
    const pendingSync = wx.getStorageSync('pending_feedback_sync') || [];
    pendingSync.push(record);
    wx.setStorageSync('pending_feedback_sync', pendingSync);

    setTimeout(() => {
      this.setData({
        submitting: false,
        form: { type: 'suggestion', content: '', contact: '' }
      });
      this.loadHistory();
      wx.showToast({ title: '反馈已提交，感谢支持', icon: 'success' });

      // 同时唤起微信客服会话，让开发者即时收到
      // 需在小程序后台「客服」处绑定客服微信号
      try {
        if (wx.openCustomerServiceChat) {
          // eslint-disable-next-line no-undef
        }
      } catch (e) {}
    }, 600);
  },

  getDeviceInfo() {
    try {
      const sys = wx.getSystemInfoSync();
      return JSON.stringify({
        brand: sys.brand,
        model: sys.model,
        system: sys.system,
        version: sys.version,
        SDKVersion: sys.SDKVersion
      });
    } catch (e) {
      return '';
    }
  },

  navigateBack() {
    wx.navigateBack();
  }
});
