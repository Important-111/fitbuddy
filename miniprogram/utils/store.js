/* ===== FitBuddy 数据存储层 (微信缓存) ===== */

const PREFIX = 'fitbuddy_';

function getData(key) {
  try {
    const raw = wx.getStorageSync(PREFIX + key);
    return raw || null;
  } catch (e) { return null; }
}

function setData(key, val) {
  wx.setStorageSync(PREFIX + key, val);
}

function removeData(key) {
  wx.removeStorageSync(PREFIX + key);
}

const Store = {
  getProfile() {
    return getData('profile');
  },
  saveProfile(profile) {
    setData('profile', profile);
  },

  getCheckins() {
    return getData('checkins') || [];
  },
  saveCheckins(records) {
    setData('checkins', records);
  },
  addCheckin(record) {
    let records = Store.getCheckins();
    const idx = records.findIndex(r => r.date === record.date);
    if (idx >= 0) records[idx] = record;
    else records.push(record);
    Store.saveCheckins(records);
    return records;
  },
  getCheckinByDate(date) {
    return Store.getCheckins().find(r => r.date === date) || null;
  },

  getStreakDays() {
    const records = Store.getCheckins();
    if (!records.length) return 0;
    records.sort((a, b) => b.date.localeCompare(a.date));
    const today = getDateStr(new Date());
    const todayChecked = records.some(r => r.date === today);
    let checkDate = today;
    if (!todayChecked) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      checkDate = getDateStr(d);
    }
    let streak = 0;
    let idx = 0;
    while (idx < records.length) {
      if (records[idx].date === checkDate) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = getDateStr(d);
        idx = 0;
      } else {
        idx++;
      }
    }
    return streak;
  },

  getTotalWorkouts() {
    return Store.getCheckins().length;
  },
  getTotalCaloriesBurned() {
    return Store.getCheckins().length * 280;
  },
  getTotalMinutes() {
    return Store.getCheckins().length * 35;
  },

  getWeightHistory() {
    const records = Store.getCheckins();
    const history = records.filter(r => r.weight).map(r => ({ date: r.date, weight: r.weight }));
    history.sort((a, b) => a.date.localeCompare(b.date));
    return history;
  },

  getCompletionRate() {
    const records = Store.getCheckins();
    if (!records.length) return 0;
    const sum = records.reduce((s, r) => s + (r.completion || 100), 0);
    return Math.round(sum / records.length);
  },

  saveWorkoutProgress(progress) {
    setData('workout_progress', progress);
  },
  getWorkoutProgress() {
    return getData('workout_progress') || {};
  },
  markWorkoutDone(date) {
    const progress = Store.getWorkoutProgress();
    progress[date] = { done: true };
    Store.saveWorkoutProgress(progress);
  },

  getDietLogs() {
    return getData('diet_logs') || [];
  },
  saveDietLogs(records) {
    setData('diet_logs', records);
  },
  addDietLog(record) {
    const records = Store.getDietLogs();
    record.id = Date.now();
    record.createdAt = getDateStr(new Date());
    records.push(record);
    Store.saveDietLogs(records);
    return records;
  },
  removeDietLog(id) {
    let records = Store.getDietLogs().filter(r => r.id !== id);
    Store.saveDietLogs(records);
    return records;
  },
  getTodayDietLogs() {
    const today = getDateStr(new Date());
    return Store.getDietLogs().filter(r => r.createdAt === today);
  },

  clearAll() {
    ['profile', 'checkins', 'workout_progress', 'diet_logs'].forEach(k => removeData(k));
  }
};

/* ===== 工具函数 ===== */
function calcBMI(weight, height) {
  if (!weight || !height) return { value: '--', category: '', categoryCN: '请输入身高体重' };
  const h = height / 100;
  const bmi = weight / (h * h);
  let cn = '', en = '';
  if (bmi < 18.5) { cn = '偏瘦'; en = 'underweight'; }
  else if (bmi < 24) { cn = '正常'; en = 'normal'; }
  else if (bmi < 28) { cn = '偏胖'; en = 'overweight'; }
  else { cn = '肥胖'; en = 'obese'; }
  return { value: bmi.toFixed(1), category: en, categoryCN: cn };
}

function calcBMR(gender, weight, height, age) {
  if (!weight || !height || !age) return 0;
  if (gender === 'male') return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

function calcDailyCalories(bmr, goal) {
  if (!bmr) return 0;
  if (goal === '减脂' || goal === '减脂瘦身') return Math.round(bmr * 1.2 - 500);
  if (goal === '增肌' || goal === '增肌塑形') return Math.round(bmr * 1.2 + 300);
  return Math.round(bmr * 1.2);
}

function getDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDate(date, format) {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  switch (format) {
    case 'yyyy-mm-dd': return `${y}-${m}-${day}`;
    case 'mm-dd': return `${m}/${day}`;
    case 'weekday': return weekdays[d.getDay()];
    case 'md-weekday': return `${m}/${day} ${weekdays[d.getDay()]}`;
    default: return `${y}-${m}-${day}`;
  }
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

function getAvatarEmoji(gender) {
  return gender === 'male' ? '👨' : '👩';
}

function getGoalEmoji(goal) {
  const map = {
    '减脂': '🔥', '减脂瘦身': '🔥',
    '增肌': '💪', '增肌塑形': '💪',
    '塑形': '✨',
    '提升体能': '🏋',
    '保持健康': '🌿',
    '提高力量': '🏋',
    '提高耐力': '🏃',
    '改善体态': '🧍',
    '翘臀': '🍑',
    '腹肌': '🦬',
    '腿部塑形': '🧍',
    '全身紧致': '🌟',
    '康复训练': '🏥'
  };
  return map[goal] || '🎯';
}

module.exports = {
  Store,
  calcBMI,
  calcBMR,
  calcDailyCalories,
  getDateStr,
  formatDate,
  getMonday,
  getGreeting,
  getAvatarEmoji,
  getGoalEmoji
};
