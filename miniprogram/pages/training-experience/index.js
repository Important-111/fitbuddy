const { Store } = require('../../utils/store');

const EXPERIENCE_OPTIONS = [
  { label: '完全小白', value: '完全小白' },
  { label: '训练不足半年', value: '训练不足半年' },
  { label: '训练1年', value: '训练1年' },
  { label: '训练3年以上', value: '训练3年以上' }
];

const LOCATION_OPTIONS = [
  { label: '家里', value: '家里' },
  { label: '健身房', value: '健身房' },
  { label: '办公室', value: '办公室' },
  { label: '户外', value: '户外' }
];

const EQUIP_OPTIONS = [
  { label: '无器械', value: '无器械' },
  { label: '瑜伽垫', value: '瑜伽垫' },
  { label: '弹力带', value: '弹力带' },
  { label: '哑铃', value: '哑铃' },
  { label: '壶铃', value: '壶铃' },
  { label: '引体向上杆', value: '引体向上杆' },
  { label: '跳绳', value: '跳绳' },
  { label: '跑步机', value: '跑步机' },
  { label: '动感单车', value: '动感单车' },
  { label: '其它', value: '其它' }
];

const DAY_OPTIONS = [
  { value: 1 }, { value: 2 }, { value: 3 },
  { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }
];

const TIME_OPTIONS = [
  { label: '15分钟', value: '15分钟' },
  { label: '20分钟', value: '20分钟' },
  { label: '30分钟', value: '30分钟' },
  { label: '45分钟', value: '45分钟' },
  { label: '60分钟', value: '60分钟' },
  { label: '90分钟', value: '90分钟' }
];

const HEALTH_OPTIONS = [
  { label: '膝盖疼', value: '膝盖疼' },
  { label: '腰疼', value: '腰疼' },
  { label: '肩颈疼', value: '肩颈疼' },
  { label: '高血压', value: '高血压' },
  { label: '糖尿病', value: '糖尿病' },
  { label: '心脏病', value: '心脏病' },
  { label: '孕期', value: '孕期' },
  { label: '术后恢复', value: '术后恢复' },
  { label: '其它疾病', value: '其它疾病' },
  { label: '没有以上情况', value: '没有以上情况' }
];

Page({
  data: {
    experienceOptions: [],
    locationOptions: [],
    equipOptions: [],
    dayOptions: [],
    timeOptions: [],
    healthOptions: [],
    // Raw selection values for saving
    experience: '完全小白',
    locations: [],
    equipment: [],
    daysPerWeek: 3,
    minutesPerSession: '30分钟',
    healthIssues: []
  },

  onLoad() {
    const p = Store.getProfile() || {};

    // Initialize chip states from profile
    const experienceOptions = EXPERIENCE_OPTIONS.map(o => ({
      ...o,
      selected: o.value === (p.experience || '完全小白')
    }));

    const locationOptions = LOCATION_OPTIONS.map(o => ({
      ...o,
      selected: p.locations && p.locations.indexOf(o.value) >= 0
    }));

    const equipOptions = EQUIP_OPTIONS.map(o => ({
      ...o,
      selected: p.equipment && p.equipment.indexOf(o.value) >= 0
    }));

    const dayOptions = DAY_OPTIONS.map(o => ({
      ...o,
      selected: o.value === (p.daysPerWeek || 3)
    }));

    const timeOptions = TIME_OPTIONS.map(o => ({
      ...o,
      selected: o.value === (p.minutesPerSession || '30分钟')
    }));

    const healthOptions = HEALTH_OPTIONS.map(o => ({
      ...o,
      selected: p.healthIssues && p.healthIssues.indexOf(o.value) >= 0
    }));

    this.setData({
      experienceOptions,
      locationOptions,
      equipOptions,
      dayOptions,
      timeOptions,
      healthOptions,
      experience: p.experience || '完全小白',
      locations: p.locations || [],
      equipment: p.equipment || [],
      daysPerWeek: p.daysPerWeek || 3,
      minutesPerSession: p.minutesPerSession || '30分钟',
      healthIssues: p.healthIssues || []
    });
  },

  // Single select: deselect siblings in same group, select tapped
  selectSingle(e) {
    const group = e.currentTarget.dataset.group;
    const value = e.currentTarget.dataset.value;
    let field = '';
    let newVal = value;

    if (group === 'exp') {
      field = 'experienceOptions';
      this.setData({ experience: value });
    } else if (group === 'days') {
      field = 'dayOptions';
      this.setData({ daysPerWeek: parseInt(value) });
    } else if (group === 'time') {
      field = 'timeOptions';
      this.setData({ minutesPerSession: value });
    }

    const options = [...this.data[field]];
    options.forEach(o => {
      o.selected = o.value === value;
    });

    this.setData({ [field]: options });
  },

  // Multi-select toggle
  toggleMulti(e) {
    const group = e.currentTarget.dataset.group;
    const value = e.currentTarget.dataset.value;

    if (group === 'loc') {
      const options = [...this.data.locationOptions];
      const idx = options.findIndex(o => o.value === value);
      if (idx >= 0) {
        options[idx].selected = !options[idx].selected;
      }
      this.setData({
        locationOptions: options,
        locations: options.filter(o => o.selected).map(o => o.value)
      });
    } else if (group === 'equip') {
      const options = [...this.data.equipOptions];
      const idx = options.findIndex(o => o.value === value);
      if (idx >= 0) {
        options[idx].selected = !options[idx].selected;
      }
      this.setData({
        equipOptions: options,
        equipment: options.filter(o => o.selected).map(o => o.value)
      });
    }
  },

  // Health toggle with "none" logic
  toggleHealth(e) {
    const value = e.currentTarget.dataset.value;
    const options = [...this.data.healthOptions];

    if (value === '没有以上情况') {
      // Deselect all others, toggle "none"
      options.forEach(o => {
        if (o.value === '没有以上情况') {
          o.selected = !o.selected;
        } else {
          o.selected = false;
        }
      });
    } else {
      // Select/deselect this health issue
      const idx = options.findIndex(o => o.value === value);
      if (idx >= 0) {
        options[idx].selected = !options[idx].selected;
      }
      // Deselect "none" if any specific issue selected
      const noneIdx = options.findIndex(o => o.value === '没有以上情况');
      if (noneIdx >= 0 && options[idx].selected) {
        options[noneIdx].selected = false;
      }
    }

    this.setData({
      healthOptions: options,
      healthIssues: options.filter(o => o.selected).map(o => o.value)
    });
  },

  saveExperience() {
    const { experience, locations, equipment, daysPerWeek, minutesPerSession, healthIssues } = this.data;

    if (!experience) {
      wx.showToast({ title: '请选择训练经验', icon: 'none' });
      return;
    }
    if (!locations.length) {
      wx.showToast({ title: '请选择训练地点', icon: 'none' });
      return;
    }
    if (!daysPerWeek) {
      wx.showToast({ title: '请选择每周训练天数', icon: 'none' });
      return;
    }
    if (!minutesPerSession) {
      wx.showToast({ title: '请选择每次训练时长', icon: 'none' });
      return;
    }

    const profile = Store.getProfile() || {};
    profile.experience = experience;
    profile.locations = locations;
    profile.equipment = equipment;
    profile.daysPerWeek = daysPerWeek;
    profile.minutesPerSession = minutesPerSession;
    profile.healthIssues = healthIssues;
    Store.saveProfile(profile);

    wx.navigateTo({ url: '/pages/analysis-report/index' });
  },

  goBack() {
    wx.navigateBack();
  }
});
