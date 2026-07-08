/* ===== 每日训练详情页 ===== */

function renderDailyWorkout() {
  var p = Store.getProfile() || {};
  var isFatLoss = p.goal && (p.goal.indexOf('减脂') >= 0);

  var exercises, warmups, stretches;

  if (isFatLoss) {
    warmups = [
      { name: '动态热身', detail: '开合跳 · 高抬腿 · 髋关节环绕 · 踝关节活动', sets: '完成热身', done: true }
    ];
    exercises = [
      { num: 1, name: '开合跳', detail: '全身燃脂动作，快速提升心率', sets: '3组 × 30秒', rest: '组间休息 15秒' },
      { num: 2, name: '高抬腿', detail: '核心+下肢燃脂，提高心肺功能', sets: '3组 × 30秒', rest: '组间休息 15秒' },
      { num: 3, name: '深蹲跳', detail: '爆发力训练，燃烧大量热量', sets: '3组 × 12次', rest: '组间休息 30秒' },
      { num: 4, name: '登山跑', detail: '核心+全身综合燃脂动作', sets: '3组 × 30秒', rest: '组间休息 15秒' }
    ];
    stretches = [
      { name: '股四头肌拉伸', detail: '每侧保持30秒 × 2组' },
      { name: '腘绳肌拉伸', detail: '每侧保持30秒 × 2组' },
      { name: '小腿拉伸', detail: '每侧保持30秒 × 2组' },
      { name: '婴儿式放松', detail: '保持60秒，深呼吸放松全身' }
    ];
  } else {
    warmups = [
      { name: '动态热身', detail: '开合跳 · 高抬腿 · 髋关节环绕 · 踝关节活动', sets: '完成热身', done: true }
    ];
    exercises = [
      { num: 1, name: '自重深蹲', detail: '经典下肢训练动作，主要训练臀大肌和股四头肌', sets: '3组 × 12次', rest: '组间休息 60秒' },
      { num: 2, name: '臀桥', detail: '针对臀大肌的孤立训练，改善臀部形态', sets: '3组 × 15次', rest: '组间休息 45秒' },
      { num: 3, name: '弓步蹲', detail: '单侧训练动作，改善腿部不平衡，加强核心稳定', sets: '3组 × 12次（每侧）', rest: '组间休息 60秒' },
      { num: 4, name: '侧卧抬腿', detail: '训练臀中肌，改善髋部稳定性和臀部侧方线条', sets: '3组 × 15次（每侧）', rest: '组间休息 30秒' }
    ];
    stretches = [
      { name: '股四头肌拉伸', detail: '每侧保持30秒 × 2组' },
      { name: '腘绳肌拉伸', detail: '每侧保持30秒 × 2组' },
      { name: '臀大肌拉伸', detail: '每侧保持30秒 × 2组' },
      { name: '婴儿式放松', detail: '保持60秒，深呼吸放松全身' }
    ];
  }

  function renderExerciseCard(ex, idx) {
    return '<div class="exercise-card' + (ex.done ? ' completed' : '') + '" onclick="App.navigate(\'exercise-detail\')">' +
      '<div class="exercise-num">' + (ex.done ? '✓' : ex.num) + '</div>' +
      '<div class="exercise-info">' +
        '<div class="exercise-name">' + ex.name + '</div>' +
        '<div class="exercise-detail">' + ex.detail + '</div>' +
        '<div class="exercise-sets">' + ex.sets + '</div>' +
        (ex.rest ? '<div class="exercise-rest">' + ex.rest + '</div>' : '') +
      '</div>' +
      '<div class="exercise-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>' +
    '</div>';
  }

  function renderStretchCard(s, idx) {
    return '<div class="stretch-card">' +
      '<div class="exercise-num">' + (idx + 1) + '</div>' +
      '<div class="exercise-info">' +
        '<div class="exercise-name">' + s.name + '</div>' +
        '<div class="exercise-detail">' + s.detail + '</div>' +
      '</div>' +
    '</div>';
  }

  var warmupHtml = warmups.map(function(w) { return renderExerciseCard(w, 0); }).join('');
  var exerciseHtml = exercises.map(function(e, i) {
    var html = renderExerciseCard(e, i);
    if (i < exercises.length - 1) {
      html += '<div class="flow-arrow">↓</div>';
    }
    return html;
  }).join('');
  var stretchHtml = stretches.map(function(s, i) { return renderStretchCard(s, i); }).join('');

  var totalSets = 0;
  exercises.forEach(function(e) { var m = e.sets.match(/(\d+)组/); if (m) totalSets += parseInt(m[1]); });

  document.getElementById('page-daily-workout').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'training-plan\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">今日训练</span>' +
    '</div>' +
    '<div class="workout-header">' +
      '<div class="workout-header-top">' +
        '<div>' +
          '<h2>' + (isFatLoss ? 'HIIT 燃脂训练' : '臀腿力量训练') + '</h2>' +
          '<p>' + (isFatLoss ? '高效燃脂 · 快速代谢提升' : '力量训练 · 重点激活下肢肌群') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="workout-meta">' +
        '<div class="workout-meta-item"><div class="workout-meta-val">' + (isFatLoss ? '25' : '35') + '</div><div class="workout-meta-lbl">分钟</div></div>' +
        '<div class="workout-meta-item"><div class="workout-meta-val">' + exercises.length + '+' + stretches.length + '</div><div class="workout-meta-lbl">动作+拉伸</div></div>' +
        '<div class="workout-meta-item"><div class="workout-meta-val">' + (isFatLoss ? '250' : '280') + '</div><div class="workout-meta-lbl">预计消耗(kcal)</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="phase-section">' +
      '<div class="phase-title"><span class="phase-icon warmup">&#x1F525;</span>热身激活（5分钟）</div>' +
      warmupHtml +
    '</div>' +
    '<div class="phase-section">' +
      '<div class="phase-title"><span class="phase-icon main">&#x1F4AA;</span>正式训练（' + (isFatLoss ? '20' : '25') + '分钟）</div>' +
      exerciseHtml +
    '</div>' +
    '<div class="phase-section">' +
      '<div class="phase-title"><span class="phase-icon stretch">&#x1F9D8;</span>训练后拉伸（8分钟）</div>' +
      stretchHtml +
    '</div>' +
    '<div class="total-calories">' +
      '<div class="total-item"><div class="total-item-val">' + (isFatLoss ? '250' : '280') + '</div><div class="total-item-lbl">预计消耗(kcal)</div></div>' +
      '<div class="total-item"><div class="total-item-val">' + (isFatLoss ? '25' : '35') + '</div><div class="total-item-lbl">训练时长(分钟)</div></div>' +
      '<div class="total-item"><div class="total-item-val">' + totalSets + '</div><div class="total-item-lbl">总组数</div></div>' +
    '</div>' +
    '<div class="bottom-bar">' +
      '<button class="btn-outline" onclick="App.navigate(\'exercise-detail\')">查看动作详解</button>' +
      '<button class="btn-primary" onclick="App.navigate(\'daily-checkin\')">完成训练 · 去打卡</button>' +
    '</div>';
}
