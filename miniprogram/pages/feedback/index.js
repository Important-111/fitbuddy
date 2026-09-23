const { Store } = require('../../utils/store');
const cloudSync = require('../../utils/cloudSync');

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
      agreed: false
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
    this.renderHistory(this.readLocalHistory());

    // 云端有记录时，处理状态与开发者回复以云端为准（这两项只在后台修改）
    cloudSync.pullFeedback().then((cloudList) => {
      if (!cloudList || !cloudList.length) return;
      const merged = cloudSync.mergeFeedback(this.readLocalHistory(), cloudList);
      try { wx.setStorageSync('user_feedback_history', merged); } catch (e) {}
      this.renderHistory(merged);
    });
  },

  readLocalHistory() {
    try {
      return wx.getStorageSync('user_feedback_history') || [];
    } catch (e) {
      return [];
    }
  },

  renderHistory(list) {
    const enriched = (list || []).map(it => Object.assign({}, it, {
      typeLabel: TYPE_LABEL_MAP[it.type] || '其他',
      statusLabel: STATUS_LABEL_MAP[it.status] || '待处理',
      // WXML 读的是 adminReply，而这里过去只写入 admin_reply（下划线命名），
      // 导致「开发者回复」区块即使后台填了内容也永远不显示
      adminReply: it.admin_reply || '',
      timeLabel: formatTime(it.ts || Date.now())
    }));
    this.setData({ history: enriched });
  },

  // 未送达的反馈入重试队列，由 app 启动时统一补交
  enqueuePending(record) {
    try {
      const q = wx.getStorageSync('pending_feedback_sync') || [];
      q.push(record);
      wx.setStorageSync('pending_feedback_sync', q);
    } catch (e) {}
  },

  onTypeSelect(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ 'form.type': value });
  },

  onContentInput(e) {
    this.setData({ 'form.content': e.detail.value });
  },

  onCopyEmail() {
    wx.setClipboardData({
      data: 'support@fitbuddy.app',
      success: () => {
        wx.showToast({ title: '邮箱已复制', icon: 'success' });
      }
    });
  },

  onCopyPhone() {
    wx.setClipboardData({
      data: '400-888-0000',
      success: () => {
        wx.showToast({ title: '座机已复制', icon: 'success' });
      }
    });
  },

  onSubmit() {
    const { type, content, agreed } = this.data.form;
    if (!agreed) {
      wx.showToast({ title: '请先勾选同意协议', icon: 'none' });
      return;
    }
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
      contact: '',
      status: 'pending',
      admin_reply: '',
      device_info: this.getDeviceInfo()
    };

    // 先落本地：弱网下用户输入不丢，历史列表立刻可见
    const list = this.readLocalHistory();
    list.unshift(record);
    if (list.length > 50) list.length = 50;
    try { wx.setStorageSync('user_feedback_history', list); } catch (e) {}

    // 真正提交到云数据库。改造前这里只写本地 + 弹「反馈已提交」，
    // 而那条 pending 队列全项目无人消费，开发者永远收不到。
    // 现在送达失败会入重试队列，并把提示语改成实情，不再假装成功。
    cloudSync.pushFeedback(record).then((ok) => {
      if (!ok) this.enqueuePending(record);
      this.setData({
        submitting: false,
        form: { type: 'suggestion', content: '', agreed: false }
      });
      this.loadHistory();
      wx.showToast({
        title: ok ? '反馈已提交，感谢支持' : '已保存，联网后自动提交',
        icon: ok ? 'success' : 'none'
      });
    });
  },

  getDeviceInfo() {
    try {
      // wx.getSystemInfoSync 官方已废弃，优先用拆分后的新接口，旧环境自动回退
      let brand = '', model = '', system = '', version = '', SDKVersion = '';
      if (typeof wx.getDeviceInfo === 'function') {
        const d = wx.getDeviceInfo() || {};
        brand = d.brand || '';
        model = d.model || '';
        system = d.system || '';
      }
      if (typeof wx.getAppBaseInfo === 'function') {
        const a = wx.getAppBaseInfo() || {};
        version = a.version || '';
        SDKVersion = a.SDKVersion || '';
      }
      if (!brand && typeof wx.getSystemInfoSync === 'function') {
        const sys = wx.getSystemInfoSync() || {};
        brand = sys.brand || '';
        model = sys.model || '';
        system = sys.system || '';
        version = sys.version || '';
        SDKVersion = sys.SDKVersion || '';
      }
      return JSON.stringify({ brand, model, system, version, SDKVersion });
    } catch (e) {
      return '';
    }
  },

  navigateBack() {
    wx.navigateBack();
  },

  toggleAgree() {
    this.setData({ 'form.agreed': !this.data.form.agreed });
  },

  openService() {
    wx.navigateTo({ url: '/pages/agreement/service/index' });
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/agreement/privacy/index' });
  }
});
