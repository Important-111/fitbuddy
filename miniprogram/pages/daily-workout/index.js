const { Store } = require('../../utils/store');

Page({
  data: {
    workoutName: '臀腿力量训练',
    workoutSub: '力量训练 · 重点激活下肢肌群',
    workoutMinutes: '35',
    workoutCalories: '280',
    totalSets: 0,
    warmups: [],
    exercises: [],
    stretches: []
  },

  onLoad() {
    this.loadWorkoutData();
  },

  loadWorkoutData() {
    const p = Store.getProfile() || {};
    const isFatLoss = p.goal && (p.goal.indexOf('减脂') >= 0);

    let warmups, exercises, stretches;

    if (isFatLoss) {
      warmups = [
        { name: '动态热身', detail: '开合跳 · 高抬腿 · 髋关节环绕 · 踝关节活动', sets: '完成热身', done: true }
      ];
      exercises = [
        { num: 1, name: '开合跳', detail: '全身燃脂动作，快速提升心率', sets: '3组 × 30秒', rest: '组间休息 15秒' },
        { num: 2, name: '高抬腿', detail: '核心+下肢燃脂，提高心肺功能', sets: '3组 × 30秒', rest: '组间休息 15秒' },
        { num: 3, name: '深蹲跳', detail: '爆发力训练，燃烧大量热量', sets: '3组 × 12次', rest: '组间休息 30秒' },
        { num: 4, name: '登山跑', detail: '核心+全身综合燃脂动作', sets: '3组 × 30秒', rest: '组间休息 15秒' }
      ];
      stretches = [
        { name: '股四头肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '腘绳肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '小腿拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '婴儿式放松', detail: '保持60秒，深呼吸放松全身' }
      ];

      this.setData({
        workoutName: 'HIIT 燃脂训练',
        workoutSub: '高效燃脂 · 快速代谢提升',
        workoutMinutes: '25',
        workoutCalories: '250'
      });
    } else {
      warmups = [
        { name: '动态热身', detail: '开合跳 · 高抬腿 · 髋关节环绕 · 踝关节活动', sets: '完成热身', done: true }
      ];
      exercises = [
        { num: 1, name: '自重深蹲', detail: '经典下肢训练动作，主要训练臀大肌和股四头肌', sets: '3组 × 12次', rest: '组间休息 60秒' },
        { num: 2, name: '臀桥', detail: '针对臀大肌的孤立训练，改善臀部形态', sets: '3组 × 15次', rest: '组间休息 45秒' },
        { num: 3, name: '弓步蹲', detail: '单侧训练动作，改善腿部不平衡，加强核心稳定', sets: '3组 × 12次（每侧）', rest: '组间休息 60秒' },
        { num: 4, name: '侧卧抬腿', detail: '训练臀中肌，改善髋部稳定性和臀部侧方线条', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒' }
      ];
      stretches = [
        { name: '股四头肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '腘绳肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '臀大肌拉伸', detail: '每侧保持30秒 × 2组' },
        { name: '婴儿式放松', detail: '保持60秒，深呼吸放松全身' }
      ];

      this.setData({
        workoutName: '臀腿力量训练',
        workoutSub: '力量训练 · 重点激活下肢肌群',
        workoutMinutes: '35',
        workoutCalories: '280'
      });
    }

    // 计算总组数
    let totalSets = 0;
    exercises.forEach(function(e) {
      const m = e.sets.match(/(\d+)组/);
      if (m) totalSets += parseInt(m[1]);
    });

    this.setData({
      warmups: warmups,
      exercises: exercises,
      stretches: stretches,
      totalSets: totalSets
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
