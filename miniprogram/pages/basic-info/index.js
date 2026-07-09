const { Store, calcBMI } = require('../../utils/store');

Page({
  data: {
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

  onLoad() {
    const profile = Store.getProfile() || {};
    this.setData({
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

    wx.navigateTo({ url: '/pages/training-goals/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
