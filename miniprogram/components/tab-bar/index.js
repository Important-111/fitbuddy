Component({
  properties: {
    active: {
      type: String,
      value: 'dashboard'
    }
  },
  data: {
    tabs: [
      { key: 'dashboard', label: '首页', url: '/pages/dashboard/index' },
      { key: 'training-plan', label: '训练', url: '/pages/training-plan/index' },
      { key: 'progress-tracking', label: '进度', url: '/pages/progress-tracking/index' },
      { key: 'diet-plan', label: '饮食', url: '/pages/diet-plan/index' },
      { key: 'profile', label: '我的', url: '/pages/profile/index' }
    ]
  },
  methods: {
    onTap(e) {
      const { key, url } = e.currentTarget.dataset;
      if (key === this.data.active) return;
      wx.redirectTo({ url });
    }
  }
});
