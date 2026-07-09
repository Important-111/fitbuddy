Page({
  data: {
    // 预留数据绑定结构，支持后续通过 onLoad options 传入动态数据
    exerciseName: '自重深蹲',
    exerciseEngName: 'Bodyweight Squat',
    tags: [
      { text: '初级', class: 'tag-level', icon: '⭐' },
      { text: '下肢训练', class: 'tag-muscle' },
      { text: '自重训练', class: 'tag-type' }
    ],
    infoRows: [
      { key: '动作目的', value: '增强下肢力量，提升核心稳定' },
      { key: '主要肌群', value: '臀大肌、股四头肌' },
      { key: '辅助肌群', value: '核心肌群、腘绳肌、小腿肌群' },
      { key: '难度等级', value: '⭐ 初级' },
      { key: '适合人群', value: '所有健身水平，特别适合新手' },
      { key: '今日训练量', value: '3组 × 12次', highlight: true },
      { key: '组间休息', value: '60秒' }
    ],
    muscleGroups: ['臀大肌', '股四头肌', '核心肌群', '小腿肌群'],
    steps: [
      { num: 1, text: '双脚与肩同宽，脚尖略微向外打开约15度' },
      { num: 2, text: '保持背部挺直，核心收紧，胸部上挺' },
      { num: 3, text: '下蹲时臀部向后坐，如同坐椅子，膝盖与脚尖方向一致' },
      { num: 4, text: '下蹲至大腿与地面平行或更低，保持脚跟不离地' },
      { num: 5, text: '用臀部发力推起，回到起始站姿，膝盖微屈不锁死' }
    ],
    cautions: [
      { text: '膝盖内扣：下蹲时膝盖向内塌陷，容易伤到膝关节。保持膝盖与脚尖方向一致' },
      { text: '弓背弯腰：背部弯曲导致腰椎压力过大。全程保持背部挺直，核心收紧' },
      { text: '脚跟离地：重心前移导致脚跟抬起。全程保持全脚掌着地' },
      { text: '下蹲过浅：只做半程动作，效果大打折扣。尽量蹲至大腿与地面平行' }
    ],
    videos: [
      { platform: 'YouTube', platformClass: 'pl-yt', title: 'Bodyweight Squat Tutorial', desc: 'How to Do a Perfect Squat' },
      { platform: 'B站', platformClass: 'pl-bl', title: '徒手深蹲教学', desc: '从零开始学会标准深蹲' },
      { platform: 'Keep', platformClass: 'pl-kp', title: '臀腿燃脂课程', desc: '包含深蹲及其他下肢训练' },
      { platform: '小红书', platformClass: 'pl-xs', title: '女生臀腿训练', desc: '深蹲变式及臀腿训练合集' }
    ]
  },

  navigateBack() {
    wx.navigateBack();
  }
});
