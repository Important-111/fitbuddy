/* ===== 欢迎引导页 ===== */

function renderWelcome() {
  var profile = Store.getProfile();
  var hasProfile = profile && profile.nickname;

  var page = document.getElementById('page-welcome');

  // 已有档案 -> 显示资料卡片
  if (hasProfile) {
    page.innerHTML =
      '<div class="welcome-hero">' +
        '<div class="hero-icon">' +
          '<svg viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M18 8C18 8 22 4 24 4C26 4 30 8 30 8"></path>' +
            '<path d="M24 4V8"></path>' +
            '<circle cx="24" cy="24" r="20"></circle>' +
            '<path d="M18 28C18 28 21 32 24 32C27 32 30 28 30 28"></path>' +
            '<path d="M16 20L18 22"></path>' +
            '<path d="M30 20L32 22"></path>' +
            '<circle cx="20" cy="18" r="1.5" fill="#FFFFFF"></circle>' +
            '<circle cx="28" cy="18" r="1.5" fill="#FFFFFF"></circle>' +
          '</svg>' +
        '</div>' +
        '<h1 class="hero-title">FitBuddy</h1>' +
        '<p class="hero-subtitle">你的AI私人健身教练，陪你达成每一个目标</p>' +
      '</div>' +
      '<div class="profile-section">' +
        '<div class="profile-card">' +
          '<div class="profile-header">' +
            '<div class="profile-title">' +
              '<div class="profile-title-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                  '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>' +
                  '<circle cx="12" cy="7" r="4"></circle>' +
                '</svg>' +
              '</div>' +
              '我的基本资料' +
            '</div>' +
            '<div class="profile-action" onclick="openEditProfileModal()">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">' +
                '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>' +
                '<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>' +
              '</svg>' +
              '编辑' +
            '</div>' +
          '</div>' +
          '<div class="profile-grid" id="welcomeProfileGrid"></div>' +
        '</div>' +
      '</div>' +
      '<div class="features-section">' +
        '<div class="features-section-title">FitBuddy 能为你做什么</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon orange">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>' +
          '</div>' +
          '<div class="feature-text"><h3>个性化训练计划</h3><p>基于你的身体数据和目标，AI生成专属每日/每周/每月训练方案</p></div>' +
        '</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon green">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#36CFC9" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
          '</div>' +
          '<div class="feature-text"><h3>动态智能调整</h3><p>根据训练完成度和身体反馈，每周自动优化训练强度和内容</p></div>' +
        '</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon blue">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>' +
          '</div>' +
          '<div class="feature-text"><h3>专业动作指导</h3><p>每个训练动作配有详细说明、常见错误纠正和视频教程推荐</p></div>' +
        '</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon purple">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>' +
          '</div>' +
          '<div class="feature-text"><h3>全方位进度追踪</h3><p>体重、围度、体脂变化一目了然，里程碑激励让你保持动力</p></div>' +
        '</div>' +
      '</div>' +
      '<div class="bottom-cta">' +
        '<button class="btn-primary" onclick="App.navigate(\'analysis-report\')">查看我的分析报告</button>' +
        '<p class="privacy-note">你的数据仅用于制定训练计划，不会被分享</p>' +
      '</div>';

    renderWelcomeProfileGrid(profile);
  } else {
    // 首次使用 -> 显示注册引导
    page.innerHTML =
      '<div class="welcome-hero">' +
        '<div class="hero-icon">' +
          '<svg viewBox="0 0 48 48" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M18 8C18 8 22 4 24 4C26 4 30 8 30 8"></path>' +
            '<path d="M24 4V8"></path>' +
            '<circle cx="24" cy="24" r="20"></circle>' +
            '<path d="M18 28C18 28 21 32 24 32C27 32 30 28 30 28"></path>' +
            '<path d="M16 20L18 22"></path>' +
            '<path d="M30 20L32 22"></path>' +
            '<circle cx="20" cy="18" r="1.5" fill="#FFFFFF"></circle>' +
            '<circle cx="28" cy="18" r="1.5" fill="#FFFFFF"></circle>' +
          '</svg>' +
        '</div>' +
        '<h1 class="hero-title">FitBuddy</h1>' +
        '<p class="hero-subtitle">你的AI私人健身教练，陪你达成每一个目标</p>' +
      '</div>' +
      '<div class="features-section">' +
        '<div class="features-section-title">FitBuddy 能为你做什么</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg></div>' +
          '<div class="feature-text"><h3>个性化训练计划</h3><p>基于你的身体数据和目标，AI生成专属每日/每周/每月训练方案</p></div>' +
        '</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="#36CFC9" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>' +
          '<div class="feature-text"><h3>动态智能调整</h3><p>根据训练完成度和身体反馈，每周自动优化训练强度和内容</p></div>' +
        '</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg></div>' +
          '<div class="feature-text"><h3>专业动作指导</h3><p>每个训练动作配有详细说明、常见错误纠正和视频教程推荐</p></div>' +
        '</div>' +
        '<div class="feature-card">' +
          '<div class="feature-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg></div>' +
          '<div class="feature-text"><h3>全方位进度追踪</h3><p>体重、围度、体脂变化一目了然，里程碑激励让你保持动力</p></div>' +
        '</div>' +
      '</div>' +
      '<div class="bottom-cta">' +
        '<button class="btn-primary" onclick="App.navigate(\'basic-info\')">开始建档</button>' +
        '<p class="privacy-note">你的数据仅用于制定训练计划，不会被分享</p>' +
      '</div>';
  }
}

function renderWelcomeProfileGrid(p) {
  var grid = document.getElementById('welcomeProfileGrid');
  if (!grid) return;

  var bmi = calcBMI(p.weight, p.height);
  var genderTag = p.gender === 'male'
    ? '<span class="profile-tag male">男</span>'
    : '<span class="profile-tag female">女</span>';

  var bmiTag = '';
  if (bmi.value !== '--') {
    var cls = 'profile-tag';
    var color = '';
    if (bmi.category === 'underweight') { cls += ' male'; color = '#165DFF'; }
    else if (bmi.category === 'normal') { cls += ''; }
    else if (bmi.category === 'overweight') { color = '#F59E0B'; cls += ''; }
    else { color = '#EF4444'; cls += ''; }
    var style = color ? 'style="background:' + (bmi.category === 'underweight' ? 'rgba(22,93,255,0.1)' : bmi.category === 'normal' ? 'rgba(54,207,201,0.08)' : bmi.category === 'overweight' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)') + ';color:' + color + '"' : '';
    bmiTag = '<span class="' + cls + '" ' + style + '>' + bmi.categoryCN + '</span>';
  }

  grid.innerHTML =
    '<div class="profile-item"><span class="profile-label">昵称</span><span class="profile-value">' + escapeHtml(p.nickname) + '</span></div>' +
    '<div class="profile-item"><span class="profile-label">性别</span><span class="profile-value">' + genderTag + '</span></div>' +
    '<div class="profile-item"><span class="profile-label">年龄</span><span class="profile-value">' + p.age + ' 岁</span></div>' +
    '<div class="profile-item"><span class="profile-label">身高</span><span class="profile-value">' + p.height + ' cm</span></div>' +
    '<div class="profile-item"><span class="profile-label">体重</span><span class="profile-value">' + p.weight + ' kg</span></div>' +
    '<div class="profile-item"><span class="profile-label">BMI</span><span class="profile-value">' + bmi.value + ' ' + bmiTag + '</span></div>' +
    '<div class="profile-item full"><span class="profile-label">健身目标</span><span class="profile-value">' + escapeHtml(p.goal) + '</span></div>';
}
