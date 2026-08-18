const { Store, calcBMI, getAvatarEmoji } = require('../../utils/store');

const GOAL_OPTIONS = ['增肌塑形', '减脂瘦身', '提升体能', '保持健康'];

Page({
  data: {
    hasProfile: false,
    profile: {},
    bmi: { value: '--', category: '', categoryCN: '' },
    bmiTagStyle: '',
    // 编辑资料弹窗（对齐原型 v32235 编辑基本资料 modal）
    showEditModal: false,
    genderOptions: ['男', '女'],
    goalOptions: GOAL_OPTIONS,
    editForm: {
      nickname: '',
      gender: 'male',
      genderIndex: 0,
      age: '',
      height: '',
      weight: '',
      goal: '增肌塑形',
      goalIndex: 0
    }
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  loadProfile() {
    const profile = Store.getProfile();
    if (profile && profile.nickname) {
      const bmi = calcBMI(profile.weight, profile.height);
      this.setData({
        hasProfile: true,
        profile,
        bmi,
        bmiTagStyle: this.getBmiTagStyle(bmi)
      });
    } else {
      this.setData({
        hasProfile: false,
        profile: {},
        bmi: { value: '--', category: '', categoryCN: '' },
        bmiTagStyle: ''
      });
    }
  },

  // BMI tag 色值对齐新版原型 renderProfile：
  // 偏瘦=青色 / 正常=默认 primary 样式（空 style）/ 偏胖=琥珀 / 肥胖=红
  getBmiTagStyle(bmi) {
    if (bmi.category === 'underweight') {
      return 'background:rgba(54,207,201,0.12);color:#36CFC9;';
    }
    if (bmi.category === 'overweight') {
      return 'background:rgba(245,158,11,0.1);color:#F59E0B;';
    }
    if (bmi.category === 'obese') {
      return 'background:rgba(239,68,68,0.1);color:#EF4444;';
    }
    return '';
  },

  goToBasicInfo() {
    wx.navigateTo({ url: '/pages/basic-info/index' });
  },

  goToAnalysis() {
    wx.navigateTo({ url: '/pages/analysis-report/index' });
  },

  /* ===== 编辑资料弹窗 ===== */

  openEditModal() {
    const p = this.data.profile || {};
    const goalOptions = this.data.goalOptions;
    let goal = p.goal;
    if (!goal || goalOptions.indexOf(goal) < 0) goal = goalOptions[0];
    this.setData({
      showEditModal: true,
      editForm: {
        nickname: p.nickname || '',
        gender: p.gender === 'female' ? 'female' : 'male',
        genderIndex: p.gender === 'female' ? 1 : 0,
        age: p.age ? String(p.age) : '',
        height: p.height ? String(p.height) : '',
        weight: p.weight ? String(p.weight) : '',
        goal: goal,
        goalIndex: goalOptions.indexOf(goal)
      }
    });
  },

  closeEditModal() {
    this.setData({ showEditModal: false });
  },

  // 阻止弹窗内容区点击冒泡到遮罩
  noop() {},

  onEditInput(e) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    this.setData({ ['editForm.' + field]: e.detail.value });
  },

  onGenderChange(e) {
    const idx = Number(e.detail.value);
    this.setData({
      'editForm.genderIndex': idx,
      'editForm.gender': idx === 1 ? 'female' : 'male'
    });
  },

  onGoalChange(e) {
    const idx = Number(e.detail.value);
    this.setData({
      'editForm.goalIndex': idx,
      'editForm.goal': this.data.goalOptions[idx]
    });
  },

  // 保存校验规则与原型 saveProfile() 一致
  saveProfile() {
    const f = this.data.editForm;
    const nickname = (f.nickname || '').trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    const age = parseInt(f.age, 10);
    if (!age || age < 10 || age > 100) {
      wx.showToast({ title: '请输入有效年龄（10-100）', icon: 'none' });
      return;
    }
    const height = parseInt(f.height, 10);
    if (!height || height < 100 || height > 250) {
      wx.showToast({ title: '请输入有效身高（100-250cm）', icon: 'none' });
      return;
    }
    const weight = parseInt(f.weight, 10);
    if (!weight || weight < 30 || weight > 300) {
      wx.showToast({ title: '请输入有效体重（30-300kg）', icon: 'none' });
      return;
    }
    const profile = Object.assign({}, this.data.profile, {
      nickname: nickname,
      gender: f.gender,
      age: age,
      height: height,
      weight: weight,
      goal: f.goal
    });
    Store.saveProfile(profile);
    this.closeEditModal();
    this.loadProfile();
    wx.showToast({ title: '保存成功', icon: 'success' });
  }

});
