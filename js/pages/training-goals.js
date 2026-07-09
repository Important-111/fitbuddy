/* ===== 训练目标选择 - 步骤 2/3 ===== */

function renderTrainingGoals() {
  var profile = Store.getProfile() || {};
  var selectedGoals = profile.goals || [];

  document.getElementById('page-training-goals').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'basic-info\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">建立你的档案</span>' +
    '</div>' +
    '<div class="progress-bar-wrap">' +
      '<div class="progress-steps">' +
        '<div class="progress-step done">&#10003;</div>' +
        '<div class="progress-step active">2</div>' +
        '<div class="progress-step">3</div>' +
      '</div>' +
      '<div class="progress-bar-bg"><div class="progress-bar-fill" style="width:66%"></div></div>' +
      '<div class="progress-label">步骤 2/3 · 选择训练目标（可多选）</div>' +
    '</div>' +
    '<div class="form-section">' +
      '<h2 class="section-title-inline">训练目标</h2>' +
      '<p class="section-desc">选择你想要达成的目标，AI将据此制定个性化训练计划</p>' +
      '<div class="goal-grid" id="goalGrid">' +
        renderGoalCard('减脂', '\u{1F525}', selectedGoals.indexOf('减脂') >= 0) +
        renderGoalCard('增肌', '\u{1F4AA}', selectedGoals.indexOf('增肌') >= 0) +
        renderGoalCard('塑形', '\u{2728}', selectedGoals.indexOf('塑形') >= 0) +
        renderGoalCard('提高力量', '\u{1F3CB}', selectedGoals.indexOf('提高力量') >= 0) +
        renderGoalCard('提高耐力', '\u{1F3C3}', selectedGoals.indexOf('提高耐力') >= 0) +
        renderGoalCard('改善体态', '\u{1F9CD}', selectedGoals.indexOf('改善体态') >= 0) +
        renderGoalCard('翘臀', '\u{1F351}', selectedGoals.indexOf('翘臀') >= 0) +
        renderGoalCard('腹肌', '\u{1F9AC}', selectedGoals.indexOf('腹肌') >= 0) +
        renderGoalCard('腿部塑形', '\u{1F9CD}', selectedGoals.indexOf('腿部塑形') >= 0) +
        renderGoalCard('全身紧致', '\u{1F31F}', selectedGoals.indexOf('全身紧致') >= 0) +
        renderGoalCard('康复训练', '\u{1F3E5}', selectedGoals.indexOf('康复训练') >= 0) +
        renderGoalCard('其它', '\u{1F4CB}', selectedGoals.indexOf('其它') >= 0) +
      '</div>' +
    '</div>' +
    '<div class="bottom-nav">' +
      '<button class="btn-primary" onclick="saveTrainingGoals()">下一步：训练经验与条件</button>' +
      '<div class="selected-count" id="goalCountDisplay">已选择 ' + selectedGoals.length + ' 个目标</div>' +
    '</div>';
}

function renderGoalCard(name, emoji, selected) {
  return '<div class="goal-card' + (selected ? ' selected' : '') + '" onclick="toggleGoalCard(this)" data-goal="' + name + '"><div class="goal-icon">' + emoji + '</div><div class="goal-name">' + name + '</div></div>';
}

function toggleGoalCard(el) {
  el.classList.toggle('selected');
  var count = document.querySelectorAll('.goal-card.selected').length;
  document.getElementById('goalCountDisplay').textContent = '已选择 ' + count + ' 个目标';
}

function saveTrainingGoals() {
  var selected = document.querySelectorAll('.goal-card.selected');
  var goals = [];
  selected.forEach(function(el) { goals.push(el.getAttribute('data-goal')); });
  if (!goals.length) { showToast('请至少选择一个目标'); return; }

  var profile = Store.getProfile() || {};
  profile.goals = goals;
  // 第一个目标作为主要目标
  profile.goal = goals[0];
  Store.saveProfile(profile);

  App.navigate('training-experience');
}
