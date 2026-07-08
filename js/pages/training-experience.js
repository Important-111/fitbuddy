/* ===== 训练经验与条件 - 步骤 3/3 ===== */

function renderTrainingExperience() {
  var p = Store.getProfile() || {};
  document.getElementById('page-training-experience').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'training-goals\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">建立你的档案</span>' +
    '</div>' +
    '<div class="progress-bar-wrap">' +
      '<div class="progress-steps">' +
        '<div class="progress-step done">&#10003;</div>' +
        '<div class="progress-step done">&#10003;</div>' +
        '<div class="progress-step active">3</div>' +
      '</div>' +
      '<div class="progress-bar-bg"><div class="progress-bar-fill" style="width:100%"></div></div>' +
      '<div class="progress-label">步骤 3/3 · 训练条件与健康状况</div>' +
    '</div>' +
    '<div class="form-section">' +
      '<h2 class="section-title-inline">训练条件</h2>' +
      '<p class="section-desc">最后一步，让我们了解你的训练环境和身体状况</p>' +
      '<div class="form-group">' +
        '<label class="form-label">训练经验</label>' +
        '<div class="option-group">' +
          renderChip('完全小白', 'exp', p.experience === '完全小白' || !p.experience) +
          renderChip('训练不足半年', 'exp', p.experience === '训练不足半年') +
          renderChip('训练1年', 'exp', p.experience === '训练1年') +
          renderChip('训练3年以上', 'exp', p.experience === '训练3年以上') +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">训练地点（可多选）</label>' +
        '<div class="option-group" id="locationGroup">' +
          renderToggleChip('家里', 'loc', p.locations && p.locations.indexOf('家里') >= 0) +
          renderToggleChip('健身房', 'loc', p.locations && p.locations.indexOf('健身房') >= 0) +
          renderToggleChip('办公室', 'loc', p.locations && p.locations.indexOf('办公室') >= 0) +
          renderToggleChip('户外', 'loc', p.locations && p.locations.indexOf('户外') >= 0) +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">可用器械（可多选）</label>' +
        '<div class="equip-grid" id="equipGroup">' +
          renderEquipChip('无器械', p.equipment && p.equipment.indexOf('无器械') >= 0) +
          renderEquipChip('瑜伽垫', p.equipment && p.equipment.indexOf('瑜伽垫') >= 0) +
          renderEquipChip('弹力带', p.equipment && p.equipment.indexOf('弹力带') >= 0) +
          renderEquipChip('哑铃', p.equipment && p.equipment.indexOf('哑铃') >= 0) +
          renderEquipChip('壶铃', p.equipment && p.equipment.indexOf('壶铃') >= 0) +
          renderEquipChip('引体向上杆', p.equipment && p.equipment.indexOf('引体向上杆') >= 0) +
          renderEquipChip('跳绳', p.equipment && p.equipment.indexOf('跳绳') >= 0) +
          renderEquipChip('跑步机', p.equipment && p.equipment.indexOf('跑步机') >= 0) +
          renderEquipChip('动感单车', p.equipment && p.equipment.indexOf('动感单车') >= 0) +
          renderEquipChip('其它', p.equipment && p.equipment.indexOf('其它') >= 0) +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">每周训练几天</label>' +
        '<div class="days-group" id="daysGroup">' +
          renderDayChip(1, p.daysPerWeek === 1) +
          renderDayChip(2, p.daysPerWeek === 2) +
          renderDayChip(3, p.daysPerWeek === 3 || !p.daysPerWeek) +
          renderDayChip(4, p.daysPerWeek === 4) +
          renderDayChip(5, p.daysPerWeek === 5) +
          renderDayChip(6, p.daysPerWeek === 6) +
          renderDayChip(7, p.daysPerWeek === 7) +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">每天可训练多久</label>' +
        '<div class="time-group" id="timeGroup">' +
          renderTimeChip('15分钟', p.minutesPerSession === '15分钟') +
          renderTimeChip('20分钟', p.minutesPerSession === '20分钟') +
          renderTimeChip('30分钟', p.minutesPerSession === '30分钟' || !p.minutesPerSession) +
          renderTimeChip('45分钟', p.minutesPerSession === '45分钟') +
          renderTimeChip('60分钟', p.minutesPerSession === '60分钟') +
          renderTimeChip('90分钟', p.minutesPerSession === '90分钟') +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">健康情况（可多选）</label>' +
        '<div class="option-group" id="healthGroup">' +
          renderHealthChip('膝盖疼', p.healthIssues && p.healthIssues.indexOf('膝盖疼') >= 0) +
          renderHealthChip('腰疼', p.healthIssues && p.healthIssues.indexOf('腰疼') >= 0) +
          renderHealthChip('肩颈疼', p.healthIssues && p.healthIssues.indexOf('肩颈疼') >= 0) +
          renderHealthChip('高血压', p.healthIssues && p.healthIssues.indexOf('高血压') >= 0) +
          renderHealthChip('糖尿病', p.healthIssues && p.healthIssues.indexOf('糖尿病') >= 0) +
          renderHealthChip('心脏病', p.healthIssues && p.healthIssues.indexOf('心脏病') >= 0) +
          renderHealthChip('孕期', p.healthIssues && p.healthIssues.indexOf('孕期') >= 0) +
          renderHealthChip('术后恢复', p.healthIssues && p.healthIssues.indexOf('术后恢复') >= 0) +
          renderHealthChip('其它疾病', p.healthIssues && p.healthIssues.indexOf('其它疾病') >= 0) +
          renderNoneHealthChip('没有以上情况', !p.healthIssues || p.healthIssues.indexOf('没有以上情况') >= 0 || p.healthIssues.length === 0) +
        '</div>' +
      '</div>' +
      '<div class="health-warning">' +
        '<p><strong>&#x26A0; 安全提醒：</strong>如果你选择了任何健康问题，AI将自动降低训练强度并调整方案。如有严重健康问题，请先咨询医生。</p>' +
      '</div>' +
    '</div>' +
    '<div class="bottom-nav">' +
      '<button class="btn-primary" onclick="saveTrainingExperience()">完成建档，查看分析报告</button>' +
    '</div>';
}

function renderChip(text, group, selected) {
  return '<div class="option-chip' + (selected ? ' selected' : '') + '" onclick="selectChip(this,\'.option-chip\')" data-group="' + group + '">' + text + '</div>';
}

function renderToggleChip(text, group, selected) {
  return '<div class="option-chip' + (selected ? ' selected' : '') + '" onclick="toggleChip(this)" data-group="' + group + '">' + text + '</div>';
}

function renderEquipChip(text, selected) {
  return '<div class="equip-chip' + (selected ? ' selected' : '') + '" onclick="toggleChip(this)">' + text + '</div>';
}

function renderDayChip(val, selected) {
  return '<div class="day-chip' + (selected ? ' selected' : '') + '" onclick="selectChip(this,\'.day-chip\')" data-val="' + val + '">' + val + '</div>';
}

function renderTimeChip(text, selected) {
  return '<div class="time-chip' + (selected ? ' selected' : '') + '" onclick="selectChip(this,\'.time-chip\')">' + text + '</div>';
}

function renderHealthChip(text, selected) {
  return '<div class="option-chip' + (selected ? ' selected' : '') + '" onclick="toggleHealthChip(this)">' + text + '</div>';
}

function renderNoneHealthChip(text, selected) {
  return '<div class="option-chip' + (selected ? ' selected' : '') + '" onclick="toggleHealthChip(this)" style="' + (selected ? 'border-color:var(--success);color:var(--success);background:rgba(16,185,129,0.08)' : '') + '">' + text + '</div>';
}

function selectChip(el, selector) {
  var group = el.getAttribute('data-group');
  if (group) {
    document.querySelectorAll(selector + '[data-group="' + group + '"]').forEach(function(c) { c.classList.remove('selected'); });
  } else {
    document.querySelectorAll(selector).forEach(function(c) { c.classList.remove('selected'); });
  }
  el.classList.add('selected');
}

function toggleChip(el) {
  el.classList.toggle('selected');
}

function toggleHealthChip(el) {
  if (el.textContent.trim() === '没有以上情况') {
    document.querySelectorAll('#healthGroup .option-chip').forEach(function(c) {
      if (c.textContent.trim() !== '没有以上情况') c.classList.remove('selected');
    });
    el.classList.toggle('selected');
    if (el.classList.contains('selected')) {
      el.style.borderColor = 'var(--success)';
      el.style.color = 'var(--success)';
      el.style.background = 'rgba(16,185,129,0.08)';
    } else {
      el.style.borderColor = '';
      el.style.color = '';
      el.style.background = '';
    }
  } else {
    var noneChip = null;
    document.querySelectorAll('#healthGroup .option-chip').forEach(function(c) {
      if (c.textContent.trim() === '没有以上情况') noneChip = c;
    });
    if (noneChip) {
      noneChip.classList.remove('selected');
      noneChip.style.borderColor = '';
      noneChip.style.color = '';
      noneChip.style.background = '';
    }
    el.classList.toggle('selected');
  }
}

function saveTrainingExperience() {
  var expEl = document.querySelector('.option-chip[data-group="exp"].selected');
  var locations = [];
  document.querySelectorAll('#locationGroup .option-chip.selected').forEach(function(el) { locations.push(el.textContent.trim()); });
  var equipment = [];
  document.querySelectorAll('#equipGroup .equip-chip.selected').forEach(function(el) { equipment.push(el.textContent.trim()); });
  var dayEl = document.querySelector('.day-chip.selected');
  var timeEl = document.querySelector('.time-chip.selected');
  var healthIssues = [];
  document.querySelectorAll('#healthGroup .option-chip.selected').forEach(function(el) { healthIssues.push(el.textContent.trim()); });

  if (!expEl) { showToast('请选择训练经验'); return; }
  if (!locations.length) { showToast('请选择训练地点'); return; }
  if (!dayEl) { showToast('请选择每周训练天数'); return; }
  if (!timeEl) { showToast('请选择每次训练时长'); return; }

  var profile = Store.getProfile() || {};
  profile.experience = expEl.textContent.trim();
  profile.locations = locations;
  profile.equipment = equipment;
  profile.daysPerWeek = parseInt(dayEl.getAttribute('data-val') || dayEl.textContent.trim());
  profile.minutesPerSession = timeEl.textContent.trim();
  profile.healthIssues = healthIssues;
  Store.saveProfile(profile);

  App.navigate('analysis-report');
}
