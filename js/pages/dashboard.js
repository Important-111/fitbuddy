/* ===== 首页仪表盘 ===== */

function renderDashboard() {
  var p = Store.getProfile() || {};
  var streak = Store.getStreakDays();
  var totalWorkouts = Store.getTotalWorkouts();
  var totalMinutes = Store.getTotalMinutes();
  var totalCal = Store.getTotalCaloriesBurned();

  var weightHistory = Store.getWeightHistory();
  var startWeight = weightHistory.length > 0 ? weightHistory[0].weight : (p.weight || 0);
  var currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : (p.weight || 0);
  var weightLost = startWeight - currentWeight;
  var weightTarget = p.targetWeight ? (startWeight - p.targetWeight) : 11;
  var weightProgress = weightTarget > 0 ? Math.min(100, Math.round(weightLost / weightTarget * 100)) : 0;

  var avatar = getAvatarEmoji(p.gender);
  var nickname = p.nickname || '用户';

  // 计算今日训练信息
  var today = new Date();
  var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var todayName = weekdays[today.getDay()];
  var dayNum = today.getDate();
  var month = today.getMonth() + 1;

  document.getElementById('page-dashboard').innerHTML =
    '<div class="top-bar justify-between">' +
      '<div>' +
        '<div class="top-greeting">' + getGreeting() + ' &#x1F31E;</div>' +
        '<div class="top-name">' + escapeHtml(nickname) + '</div>' +
      '</div>' +
      '<div class="top-avatar" id="dashAvatar">' + avatar + '</div>' +
    '</div>' +
    '<div class="streak-banner">' +
      '<div class="streak-header">' +
        '<div>' +
          '<div class="streak-fire">&#x1F525;</div>' +
          '<div class="streak-label">连续打卡</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div class="streak-days">' + streak + '</div>' +
          '<div class="streak-label">天</div>' +
        '</div>' +
      '</div>' +
      '<div class="streak-stats">' +
        '<div class="streak-stat"><div class="streak-stat-val">' + totalWorkouts + '次</div><div class="streak-stat-lbl">累计训练</div></div>' +
        '<div class="streak-stat"><div class="streak-stat-val">' + formatMinutes(totalMinutes) + '</div><div class="streak-stat-lbl">累计时长</div></div>' +
        '<div class="streak-stat"><div class="streak-stat-val">' + totalCal.toLocaleString() + '</div><div class="streak-stat-lbl">消耗热量</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="today-section">' +
      '<div class="section-header">' +
        '<h3 class="section-title-inline">今日训练</h3>' +
        '<a class="section-link" onclick="App.navigate(\'training-plan\')">查看周计划</a>' +
      '</div>' +
      '<div class="today-card">' +
        '<div class="today-card-header">' +
          '<span class="today-day">' + todayName + ' · ' + (p.goal || '臀腿力量训练') + '</span>' +
          '<span class="today-type">' + (p.goal ? '综合训练' : '力量训练') + '</span>' +
        '</div>' +
        '<div class="today-goal">今日目标：完成4个动作，重点激活目标肌群</div>' +
        '<div class="today-meta">' +
          '<div class="today-meta-item"><div class="today-meta-val">35</div><div class="today-meta-lbl">预计分钟</div></div>' +
          '<div class="today-meta-item"><div class="today-meta-val">4</div><div class="today-meta-lbl">训练动作</div></div>' +
          '<div class="today-meta-item"><div class="today-meta-val">280</div><div class="today-meta-lbl">预计消耗(kcal)</div></div>' +
        '</div>' +
        '<button class="btn-start" onclick="App.navigate(\'daily-workout\')">开始今日训练</button>' +
      '</div>' +
    '</div>' +
    '<div class="quick-actions">' +
      '<div class="quick-action" onclick="App.navigate(\'daily-checkin\')"><div class="quick-action-icon">&#x2705;</div><div class="quick-action-text">打卡</div></div>' +
      '<div class="quick-action" onclick="App.navigate(\'diet-plan\')"><div class="quick-action-icon">&#x1F372;</div><div class="quick-action-text">饮食</div></div>' +
      '<div class="quick-action" onclick="App.navigate(\'progress-tracking\')"><div class="quick-action-icon">&#x1F4C8;</div><div class="quick-action-text">进度</div></div>' +
      '<div class="quick-action" onclick="App.navigate(\'profile\')"><div class="quick-action-icon">&#x2699;</div><div class="quick-action-text">我的</div></div>' +
    '</div>' +
    '<div class="progress-section">' +
      '<div class="section-header">' +
        '<h3 class="section-title-inline">目标进度</h3>' +
        '<a class="section-link" onclick="App.navigate(\'progress-tracking\')">详细数据</a>' +
      '</div>' +
      '<div class="progress-card">' +
        '<div class="progress-row">' +
          '<div class="progress-item">' +
            '<span class="progress-label">体重变化</span>' +
            '<div class="progress-bar-wrap-sm"><div class="progress-bar-fill-sm" style="width:' + weightProgress + '%"></div></div>' +
          '</div>' +
          '<span class="progress-value">' + (weightLost > 0 ? '-' : '') + weightLost.toFixed(1) + 'kg / -' + weightTarget.toFixed(0) + 'kg</span>' +
        '</div>' +
        '<div class="progress-row">' +
          '<div class="progress-item">' +
            '<span class="progress-label">训练完成率</span>' +
            '<div class="progress-bar-wrap-sm"><div class="progress-bar-fill-sm" style="width:' + Store.getCompletionRate() + '%"></div></div>' +
          '</div>' +
          '<span class="progress-value" style="color:var(--success)">' + Store.getCompletionRate() + '%</span>' +
        '</div>' +
        '<div class="weight-trend">' +
          '<span style="color:var(--text-secondary)">本周体重</span>' +
          '<span class="weight-down">&#x2193; ' + (weightLost > 0 ? weightLost.toFixed(1) : '0') + 'kg 趋势良好</span>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function formatMinutes(mins) {
  if (mins < 60) return mins + 'min';
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return h + 'h' + (m > 0 ? m + 'min' : '');
}
