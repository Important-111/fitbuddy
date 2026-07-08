/* ===== 个人中心页 ===== */

function renderProfile() {
  var p = Store.getProfile() || {};
  var records = Store.getCheckins();
  var bmr = calcBMR(p.gender, p.weight, p.height, p.age);
  var bmi = calcBMI(p.weight, p.height);

  var genderText = p.gender === 'male' ? '男' : '女';
  var avatar = getAvatarEmoji(p.gender);
  var nickname = p.nickname || '用户';
  var goalText = p.goal || '未设定';
  if (p.targetWeight) goalText += ' · 目标 ' + p.targetWeight + 'kg';

  var tags = [genderText + ' · ' + (p.age || '--') + '岁'];
  if (p.experience) tags.push(p.experience);
  if (p.locations && p.locations.length) tags.push(p.locations[0] + (p.locations.length > 1 ? '等' : ''));

  var totalWorkouts = records.length;
  var totalMinutes = Store.getTotalMinutes();
  var totalCal = Store.getTotalCaloriesBurned();
  var streak = Store.getStreakDays();

  document.getElementById('page-profile').innerHTML =
    '<div class="top-bar justify-between">' +
      '<span class="top-bar-title">个人中心</span>' +
      '<button class="btn-settings" onclick="openSettingsPanel()" aria-label="设置">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
          '<circle cx="12" cy="12" r="3"/>' +
          '<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +
    '<div class="profile-header">' +
      '<div class="profile-avatar">' + avatar + '</div>' +
      '<div class="profile-info">' +
        '<div class="profile-name">' + escapeHtml(nickname) + '</div>' +
        '<div class="profile-goal">' + escapeHtml(goalText) + '</div>' +
        '<div class="profile-tags">' +
          tags.map(function(t) { return '<span class="profile-tag">' + escapeHtml(t) + '</span>'; }).join('') +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="goal-cards">' +
      '<div class="goal-cards-row">' +
        '<div class="goal-card" onclick="showToast(\'减脂\')">' +
          '<div class="goal-card-icon" style="background:#FEE2E2">&#x1F525;</div>' +
          '<div class="goal-card-title">减脂</div>' +
          '<div class="goal-card-desc">燃烧脂肪 · 塑造线条</div>' +
        '</div>' +
        '<div class="goal-card" onclick="showToast(\'增肌\')">' +
          '<div class="goal-card-icon" style="background:#DBEAFE">&#x1F4AA;</div>' +
          '<div class="goal-card-title">增肌</div>' +
          '<div class="goal-card-desc">增加肌肉 · 提升力量</div>' +
        '</div>' +
        '<div class="goal-card" onclick="showToast(\'塑形\')">' +
          '<div class="goal-card-icon" style="background:#F3E8FF">&#x1F31F;</div>' +
          '<div class="goal-card-title">塑形</div>' +
          '<div class="goal-card-desc">优化体态 · 完美曲线</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="stat-summary">' +
      '<div class="stat-summary-item"><div class="stat-summary-val">' + totalWorkouts + '</div><div class="stat-summary-lbl">训练次数</div></div>' +
      '<div class="stat-summary-item"><div class="stat-summary-val">' + totalMinutes + '</div><div class="stat-summary-lbl">总时长(min)</div></div>' +
      '<div class="stat-summary-item"><div class="stat-summary-val">' + totalCal.toLocaleString() + '</div><div class="stat-summary-lbl">消耗(kcal)</div></div>' +
      '<div class="stat-summary-item"><div class="stat-summary-val">' + bmr + '</div><div class="stat-summary-lbl">BMR(kcal)</div></div>' +
    '</div>' +
    '<div class="info-section">' +
      '<div class="section-title">身体数据档案</div>' +
      '<div class="info-list">' +
        '<div class="info-item editable" onclick="quickEdit(\'nickname\')"><span class="info-key">昵称</span><span class="info-value" id="prof-nickname">' + escapeHtml(nickname) + ' <span class="edit-icon">&#x270E;</span></span></div>' +
        '<div class="info-item"><span class="info-key">身高</span><span class="info-value" id="prof-height">' + (p.height || '--') + ' cm</span></div>' +
        '<div class="info-item"><span class="info-key">当前体重</span><span class="info-value" id="prof-weight">' + (p.weight || '--') + ' kg</span></div>' +
        '<div class="info-item"><span class="info-key">目标体重</span><span class="info-value" id="prof-target">' + (p.targetWeight || '--') + ' kg</span></div>' +
        '<div class="info-item"><span class="info-key">BMI</span><span class="info-value">' + bmi.value + '（' + bmi.categoryCN + '）</span></div>' +
        (p.waist ? '<div class="info-item"><span class="info-key">腰围 / 臀围</span><span class="info-value">' + p.waist + 'cm / ' + (p.hip || '--') + 'cm</span></div>' : '') +
        (p.bodyFat ? '<div class="info-item"><span class="info-key">体脂率</span><span class="info-value">' + p.bodyFat + '%</span></div>' : '') +
        '<div class="info-item"><span class="info-key">基础代谢</span><span class="info-value">' + bmr.toLocaleString() + ' kcal</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="menu-section">' +
      '<div class="section-title">功能设置</div>' +
      '<div class="menu-card">' +
        '<div class="menu-item" onclick="showToast(\'训练提醒\')">' +
          '<div class="menu-icon" style="background:#E0F2FE">&#x1F514;</div>' +
          '<div class="menu-text"><div class="menu-title">训练提醒</div><div class="menu-desc">每日训练时间提醒</div></div>' +
          '<div class="menu-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>' +
        '</div>' +
        '<div class="menu-item" onclick="showToast(\'数据导出\')">' +
          '<div class="menu-icon" style="background:#FEF3C7">&#x1F4CA;</div>' +
          '<div class="menu-text"><div class="menu-title">数据导出</div><div class="menu-desc">导出训练和身体数据</div></div>' +
          '<div class="menu-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>' +
        '</div>' +
        '<div class="menu-item" onclick="App.navigate(\'training-goals\')">' +
          '<div class="menu-icon" style="background:var(--primary-light)">&#x1F3AF;</div>' +
          '<div class="menu-text"><div class="menu-title">重新设定目标</div><div class="menu-desc">修改训练目标和计划</div></div>' +
          '<div class="menu-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>' +
        '</div>' +
        '<div class="menu-item" onclick="showToast(\'反馈建议\')">' +
          '<div class="menu-icon" style="background:#F3E8FF">&#x1F4AC;</div>' +
          '<div class="menu-text"><div class="menu-title">反馈建议</div><div class="menu-desc">帮助我们做得更好</div></div>' +
          '<div class="menu-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>' +
        '</div>' +
        '<div class="menu-item" onclick="showToast(\'帮助与支持\')">' +
          '<div class="menu-icon" style="background:#FEE2E2">&#x2753;</div>' +
          '<div class="menu-text"><div class="menu-title">帮助与支持</div><div class="menu-desc">常见问题和联系客服</div></div>' +
          '<div class="menu-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<button class="logout-btn" onclick="handleLogout()">退出登录</button>' +
    '<div class="version-text">FitBuddy v1.0.0 · AI Fitness Coach</div>';
}

function handleLogout() {
  if (confirm('确认退出登录？所有数据将被保留在本地。')) {
    App.navigate('welcome');
  }
}

function openSettingsPanel() {
  var panel = document.getElementById('settingsPanel');
  if (panel) {
    panel.classList.add('show');
  } else {
    showToast('设置面板即将开放');
  }
}

function quickEdit(field) {
  var p = Store.getProfile() || {};
  var val = prompt('请输入新的值', p[field] || '');
  if (val && val.trim()) {
    p[field] = val.trim();
    Store.saveProfile(p);
    renderProfile();
    showToast('已更新');
  }
}
