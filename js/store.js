/* ===== FitBuddy 数据管理 (localStorage) ===== */

var Store = {
  /** 获取用户档案 */
  getProfile: function() {
    try {
      var data = localStorage.getItem('fitbuddy_profile');
      return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
  },

  /** 保存用户档案 */
  saveProfile: function(profile) {
    localStorage.setItem('fitbuddy_profile', JSON.stringify(profile));
  },

  /** 获取打卡记录 */
  getCheckins: function() {
    try {
      var data = localStorage.getItem('fitbuddy_checkins');
      return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
  },

  /** 保存打卡记录 */
  saveCheckins: function(records) {
    localStorage.setItem('fitbuddy_checkins', JSON.stringify(records));
  },

  /** 添加一条打卡记录 */
  addCheckin: function(record) {
    var records = Store.getCheckins();
    // 检查当天是否已有记录
    var idx = -1;
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === record.date) { idx = i; break; }
    }
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    Store.saveCheckins(records);
    return records;
  },

  /** 获取某天的打卡记录 */
  getCheckinByDate: function(date) {
    var records = Store.getCheckins();
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === date) return records[i];
    }
    return null;
  },

  /** 计算连续打卡天数 */
  getStreakDays: function() {
    var records = Store.getCheckins();
    if (!records.length) return 0;
    // 按日期排序（降序）
    records.sort(function(a, b) { return b.date.localeCompare(a.date); });
    var streak = 0;
    var today = todayStr();
    var checkDate = today;
    // 检查今天是否打卡
    var todayChecked = false;
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === today) { todayChecked = true; break; }
    }
    if (!todayChecked) {
      // 如果今天没打卡，从昨天开始算
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      checkDate = formatDate(yesterday, 'yyyy-mm-dd');
    }
    var idx = 0;
    while (idx < records.length) {
      if (records[idx].date === checkDate) {
        streak++;
        var d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = formatDate(d, 'yyyy-mm-dd');
        idx = 0;
      } else {
        idx++;
      }
    }
    return streak;
  },

  /** 获取累计训练次数 */
  getTotalWorkouts: function() {
    return Store.getCheckins().length;
  },

  /** 计算累计消耗 (从天打卡记录估算) */
  getTotalCaloriesBurned: function() {
    return Store.getCheckins().length * 280;
  },

  /** 获取累计训练时长 (分钟) */
  getTotalMinutes: function() {
    return Store.getCheckins().length * 35;
  },

  /** 获取体重变化记录 (从打卡记录提取) */
  getWeightHistory: function() {
    var records = Store.getCheckins();
    var history = [];
    for (var i = 0; i < records.length; i++) {
      if (records[i].weight) {
        history.push({ date: records[i].date, weight: records[i].weight });
      }
    }
    history.sort(function(a, b) { return a.date.localeCompare(b.date); });
    return history;
  },

  /** 计算完成率 */
  getCompletionRate: function() {
    var records = Store.getCheckins();
    if (!records.length) return 0;
    var sum = 0;
    for (var i = 0; i < records.length; i++) {
      sum += (records[i].completion || 100);
    }
    return Math.round(sum / records.length);
  },

  /** 保存训练完成状态 */
  saveWorkoutProgress: function(progress) {
    localStorage.setItem('fitbuddy_workout_progress', JSON.stringify(progress));
  },

  /** 获取训练完成状态 */
  getWorkoutProgress: function() {
    try {
      var data = localStorage.getItem('fitbuddy_workout_progress');
      return data ? JSON.parse(data) : {};
    } catch(e) { return {}; }
  },

  /** 标记某天的训练为已完成 */
  markWorkoutDone: function(date) {
    var progress = Store.getWorkoutProgress();
    progress[date] = { done: true };
    Store.saveWorkoutProgress(progress);
  },

  /** 清除所有数据 */
  clearAll: function() {
    localStorage.removeItem('fitbuddy_profile');
    localStorage.removeItem('fitbuddy_checkins');
    localStorage.removeItem('fitbuddy_workout_progress');
  }
};
