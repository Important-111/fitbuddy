/* ===== 每日打卡页 ===== */

var _lastCheckinData = null;

function renderDailyCheckin() {
  var today = todayStr();
  var existingRecord = Store.getCheckinByDate(today);
  var p = Store.getProfile() || {};

  document.getElementById('page-daily-checkin').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'daily-workout\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">训练打卡</span>' +
    '</div>' +
    '<div class="checkin-hero">' +
      '<div class="checkin-hero-emoji">&#x1F3CB;&#x200D;&#x2640;&#xFE0F;</div>' +
      '<h2>今天的训练完成了吗？</h2>' +
      '<p>记录你的训练数据，让FitBuddy更好地为你调整计划</p>' +
    '</div>' +
    '<div class="rating-section">' +
      '<div class="rating-label">训练完成度</div>' +
      '<div class="rating-stars" id="completeStars">' +
        renderStar('20%', 20, existingRecord) +
        renderStar('40%', 40, existingRecord) +
        renderStar('60%', 60, existingRecord) +
        renderStar('80%', 80, existingRecord) +
        renderStar('100%', 100, existingRecord) +
      '</div>' +
    '</div>' +
    '<div class="form-section">' +
      '<div class="form-group">' +
        '<label class="form-label">今日体重</label>' +
        '<div class="input-with-unit"><input type="number" class="form-input" placeholder="' + (p.weight || 66) + '" id="checkinWeight" value="' + (existingRecord ? existingRecord.weight : (p.weight || '')) + '"><span class="input-unit">kg</span></div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">今日饮水</label>' +
        '<div class="input-with-unit"><input type="number" class="form-input" placeholder="2000" id="checkinWater" value="' + (existingRecord ? existingRecord.water : '') + '"><span class="input-unit">ml</span></div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">昨晚睡眠</label>' +
        '<div class="input-with-unit"><input type="number" class="form-input" placeholder="8" id="checkinSleep" value="' + (existingRecord ? existingRecord.sleep : '') + '" step="0.5"><span class="input-unit">小时</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="rating-section">' +
      '<div class="rating-label">今日疲劳程度</div>' +
      '<div class="rating-stars" id="fatigueStars">' +
        renderFatigueStar(1, existingRecord) +
        renderFatigueStar(3, existingRecord) +
        renderFatigueStar(5, existingRecord) +
        renderFatigueStar(7, existingRecord) +
        renderFatigueStar(10, existingRecord) +
      '</div>' +
      '<div style="text-align:center;font-size:11px;color:var(--text-secondary);margin-top:6px">1=精力充沛 · 5=正常 · 10=极度疲劳</div>' +
    '</div>' +
    '<div class="rating-section">' +
      '<div class="rating-label">今日心情</div>' +
      '<div class="rating-stars" id="moodStars">' +
        renderMoodStar('\u{1F629}', 1, existingRecord) +
        renderMoodStar('\u{1F615}', 3, existingRecord) +
        renderMoodStar('\u{1F610}', 5, existingRecord) +
        renderMoodStar('\u{1F60A}', 7, existingRecord) +
        renderMoodStar('\u{1F929}', 10, existingRecord) +
      '</div>' +
    '</div>' +
    '<div class="pain-section">' +
      '<h4>&#x1FA7A; 训练后是否出现疼痛？（可多选）</h4>' +
      '<div class="pain-tags" id="painTags">' +
        '<span class="pain-tag none' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('没有疼痛') >= 0 ? ' selected' : (!existingRecord ? ' selected' : '')) + '" onclick="togglePainTag(this)">没有疼痛</span>' +
        '<span class="pain-tag' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('膝盖') >= 0 ? ' selected' : '') + '" onclick="togglePainTag(this)">膝盖</span>' +
        '<span class="pain-tag' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('腰部') >= 0 ? ' selected' : '') + '" onclick="togglePainTag(this)">腰部</span>' +
        '<span class="pain-tag' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('肩颈') >= 0 ? ' selected' : '') + '" onclick="togglePainTag(this)">肩颈</span>' +
        '<span class="pain-tag' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('手腕') >= 0 ? ' selected' : '') + '" onclick="togglePainTag(this)">手腕</span>' +
        '<span class="pain-tag' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('脚踝') >= 0 ? ' selected' : '') + '" onclick="togglePainTag(this)">脚踝</span>' +
        '<span class="pain-tag' + (existingRecord && existingRecord.pains && existingRecord.pains.indexOf('其它') >= 0 ? ' selected' : '') + '" onclick="togglePainTag(this)">其它</span>' +
      '</div>' +
    '</div>' +
    '<div class="form-section">' +
      '<button class="btn-submit" onclick="submitCheckin()">提交打卡</button>' +
    '</div>' +
    '<div class="motivation-modal" id="motivationModal">' +
      '<div class="motivation-content">' +
        '<div class="motivation-emoji">&#x1F525;</div>' +
        '<h2>训练完成！太棒了！</h2>' +
        '<p>今天的努力离目标又近了一步</p>' +
        '<div class="motivation-stats" id="motivationStats"></div>' +
        '<button class="btn-modal" onclick="closeMotivation()">继续加油 &#x1F4AA;</button>' +
      '</div>' +
    '</div>';
}

function renderStar(text, val, record) {
  var selected = record && record.completion === val;
  if (!record && val === 100) selected = true;
  return '<div class="rating-star' + (selected ? ' selected' : '') + '" onclick="selectCheckinStar(this,\'completeStars\')" data-val="' + val + '">' + text + '</div>';
}

function renderFatigueStar(val, record) {
  var selected = record && record.fatigue === val;
  if (!record && val === 5) selected = true;
  return '<div class="rating-star' + (selected ? ' selected' : '') + '" onclick="selectCheckinStar(this,\'fatigueStars\')" data-val="' + val + '">' + val + '</div>';
}

function renderMoodStar(emoji, val, record) {
  var selected = record && record.mood === val;
  if (!record && val === 7) selected = true;
  return '<div class="rating-star' + (selected ? ' selected' : '') + '" onclick="selectCheckinStar(this,\'moodStars\')" data-val="' + val + '">' + emoji + '</div>';
}

function selectCheckinStar(el, groupId) {
  document.querySelectorAll('#' + groupId + ' .rating-star').forEach(function(s) { s.classList.remove('selected'); });
  el.classList.add('selected');
}

function togglePainTag(el) {
  if (el.classList.contains('none')) {
    document.querySelectorAll('.pain-tag').forEach(function(t) { if (!t.classList.contains('none')) t.classList.remove('selected'); });
    el.classList.toggle('selected');
  } else {
    document.querySelector('.pain-tag.none').classList.remove('selected');
    el.classList.toggle('selected');
  }
}

function submitCheckin() {
  var completion = parseInt(document.querySelector('#completeStars .rating-star.selected').getAttribute('data-val')) || 100;
  var weight = parseFloat(document.getElementById('checkinWeight').value) || '';
  var water = parseInt(document.getElementById('checkinWater').value) || '';
  var sleep = parseFloat(document.getElementById('checkinSleep').value) || '';
  var fatigue = parseInt(document.querySelector('#fatigueStars .rating-star.selected').getAttribute('data-val')) || 5;
  var mood = parseInt(document.querySelector('#moodStars .rating-star.selected').getAttribute('data-val')) || 7;

  var pains = [];
  document.querySelectorAll('.pain-tag.selected').forEach(function(el) {
    pains.push(el.textContent.trim());
  });

  if (!weight) { showToast('请输入今日体重'); return; }

  var record = {
    date: todayStr(),
    completion: completion,
    weight: weight,
    water: water,
    sleep: sleep,
    fatigue: fatigue,
    mood: mood,
    pains: pains
  };

  Store.addCheckin(record);
  Store.markWorkoutDone(record.date);

  // 更新用户体重
  var p = Store.getProfile() || {};
  p.weight = weight;
  Store.saveProfile(p);

  // 显示激励弹窗
  var streak = Store.getStreakDays();
  var totalCal = Store.getTotalCaloriesBurned();
  var targetDiff = p.targetWeight ? Math.max(0, Math.round((p.weight - p.targetWeight) * 10) / 10) : 0;
  var daysToGoal = targetDiff > 0 ? Math.round(targetDiff / 0.65 * 7) : '--';

  document.getElementById('motivationStats').innerHTML =
    '<div class="motivation-stat-row"><span>连续打卡</span><span class="motivation-stat-val">' + streak + ' 天</span></div>' +
    '<div class="motivation-stat-row"><span>累计消耗</span><span class="motivation-stat-val">' + totalCal.toLocaleString() + ' kcal</span></div>' +
    '<div class="motivation-stat-row"><span>距离目标还差</span><span class="motivation-stat-val">' + (targetDiff > 0 ? targetDiff : 0) + ' kg</span></div>' +
    '<div class="motivation-stat-row"><span>预计达标</span><span class="motivation-stat-val">约 ' + daysToGoal + ' 天后</span></div>';

  document.getElementById('motivationModal').classList.add('show');
}

function closeMotivation() {
  document.getElementById('motivationModal').classList.remove('show');
  App.navigate('dashboard');
}
