const { Store } = require('../../utils/store');

const ALL_GOALS = [
  { name: '减脂', emoji: '🔥' },
  { name: '增肌', emoji: '💪' },
  { name: '塑形', emoji: '✨' },
  { name: '提高力量', emoji: '🏋️' },
  { name: '提高耐力', emoji: '🏃' },
  { name: '改善体态', emoji: '🧍' },
  { name: '翘臀', emoji: '🍑' },
  { name: '腹肌', emoji: '🦬' },
  { name: '腿部塑形', emoji: '🧍' },
  { name: '全身紧致', emoji: '🌟' },
  { name: '康复训练', emoji: '🏥' },
  { name: '其它', emoji: '📋' }
];

Page({
  data: {
    goals: [],
    selectedCount: 0
  },

  onLoad() {
    const profile = Store.getProfile() || {};
    const selectedGoals = profile.goals || [];
    const goals = ALL_GOALS.map(g => ({
      ...g,
      selected: selectedGoals.indexOf(g.name) >= 0
    }));
    const selectedCount = goals.filter(g => g.selected).length;
    this.setData({ goals, selectedCount });
  },

  toggleGoal(e) {
    const idx = e.currentTarget.dataset.index;
    const key = `goals[${idx}].selected`;
    const current = this.data.goals[idx].selected;
    this.setData({ [key]: !current });

    const selectedCount = this.data.goals.filter(g => g.selected).length;
    this.setData({ selectedCount });
  },

  saveGoals() {
    const selected = this.data.goals.filter(g => g.selected).map(g => g.name);
    if (!selected.length) {
      wx.showToast({ title: '请至少选择一个目标', icon: 'none' });
      return;
    }

    const profile = Store.getProfile() || {};
    profile.goals = selected;
    profile.goal = selected[0];
    Store.saveProfile(profile);

    wx.navigateTo({ url: '/pages/training-experience/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
