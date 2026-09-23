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
  { name: '恢复训练', emoji: '💆' },
  { name: '其它', emoji: '📋' }
];

Page({
  data: {
    // 编辑态：从训练计划页的「改目标」进来时为 true。此时不显示建档进度条，
    // 保存后回到来源页而不是继续往建档链下游走。
    editMode: false,
    goals: [],
    selectedCount: 0
  },

  onLoad(options) {
    // 契约：带 from 参数即为编辑态（三页一致，来源页由 navigateBack 决定）
    const editMode = !!(options && options.from);
    const profile = Store.getProfile() || {};
    const selectedGoals = profile.goals || [];
    const goals = ALL_GOALS.map(g => ({
      ...g,
      selected: selectedGoals.indexOf(g.name) >= 0
    }));
    const selectedCount = goals.filter(g => g.selected).length;
    this.setData({ editMode, goals, selectedCount });
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

    // 编辑态：直接回到来源页（训练计划页 onShow 会按新目标重算周计划），
    // 不再往建档链下游的「训练条件」推——那是建档流程的走法。
    if (this.data.editMode) {
      wx.showToast({ title: '已保存，计划已更新', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 700);
      return;
    }

    wx.navigateTo({ url: '/pages/training-experience/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
