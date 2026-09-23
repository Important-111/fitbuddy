const { Store, calcBMI } = require('../../utils/store');

Page({
  data: {
    // 编辑态：带 from 参数进入时为 true（建档链三页同一套契约）。
    // 编辑态不显示「步骤 1/3」进度条，保存后回来源页而不往下游推。
    editMode: false,
    gender: 'male',
    nickname: '',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    waist: '',
    hip: '',
    bodyFat: '',
    bmiValue: '--',
    bmiCategory: '请输入身高体重'
  },

  onLoad(options) {
    // 契约：带 from 参数即为编辑态（与 training-goals / training-experience 一致）
    const editMode = !!(options && options.from);
    const profile = Store.getProfile() || {};
    this.setData({
      editMode,
      gender: profile.gender || 'male',
      nickname: profile.nickname || '',
      age: profile.age || '',
      height: profile.height || '',
      weight: profile.weight || '',
      targetWeight: profile.targetWeight || '',
      waist: profile.waist || '',
      hip: profile.hip || '',
      bodyFat: profile.bodyFat || ''
    });
    this.calcBMILive();
  },

  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ gender });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const val = e.detail.value;
    this.setData({ [field]: val });
  },

  onCalcBMI(e) {
    const field = e.currentTarget.dataset.field;
    const val = e.detail.value;
    this.setData({ [field]: val });
    this.calcBMILive();
  },

  calcBMILive() {
    const h = parseFloat(this.data.height);
    const w = parseFloat(this.data.weight);
    if (h > 0 && w > 0) {
      const bmi = calcBMI(w, h);
      this.setData({
        bmiValue: bmi.value,
        bmiCategory: bmi.categoryCN
      });
    } else {
      this.setData({
        bmiValue: '--',
        bmiCategory: '请输入身高体重'
      });
    }
  },

  saveBasicInfo() {
    const { gender, nickname, age, height, weight, targetWeight, waist, hip, bodyFat } = this.data;

    if (!nickname || !nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!age || parseInt(age) < 1) {
      wx.showToast({ title: '请输入有效年龄', icon: 'none' });
      return;
    }
    if (!height || parseFloat(height) < 50) {
      wx.showToast({ title: '请输入有效身高', icon: 'none' });
      return;
    }
    if (!weight || parseFloat(weight) < 10) {
      wx.showToast({ title: '请输入有效体重', icon: 'none' });
      return;
    }

    const profile = Store.getProfile() || {};
    profile.nickname = nickname.trim();
    profile.gender = gender;
    profile.age = parseInt(age);
    profile.height = parseFloat(height);
    profile.weight = parseFloat(weight);
    profile.targetWeight = targetWeight ? parseFloat(targetWeight) : '';
    profile.waist = waist ? parseFloat(waist) : '';
    profile.hip = hip ? parseFloat(hip) : '';
    profile.bodyFat = bodyFat ? parseFloat(bodyFat) : '';
    Store.saveProfile(profile);

    // 编辑态：回到来源页（计划页 onShow 会按新档案重算 BMI/热量目标），
    // 不再往建档链下游的「选择训练目标」推——那是建档流程的走法
    if (this.data.editMode) {
      wx.showToast({ title: '已保存，计划已更新', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 700);
      return;
    }

    wx.navigateTo({ url: '/pages/training-goals/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
