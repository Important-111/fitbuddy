/* ===== 用户分析报告页 ===== */

function renderAnalysisReport() {
  var p = Store.getProfile();
  if (!p) { App.navigate('basic-info'); return; }

  var bmi = calcBMI(p.weight, p.height);
  var bmr = calcBMR(p.gender, p.weight, p.height, p.age);
  var dailyCal = calcDailyCalories(bmr, p.goal);

  var protein = Math.round(p.weight * 1.6);
  var water = '2.0L';

  var bmiStatusClass = '';
  var bmiStatusText = '正常（18.5-24）';
  if (bmi.category === 'underweight') { bmiStatusClass = 'color:var(--warning)'; bmiStatusText = '偏瘦（正常18.5-24）'; }
  else if (bmi.category === 'overweight') { bmiStatusClass = 'color:var(--warning)'; bmiStatusText = '偏胖（正常18.5-24）'; }
  else if (bmi.category === 'obese') { bmiStatusClass = 'color:var(--danger)'; bmiStatusText = '肥胖（正常18.5-24）'; }
  else { bmiStatusClass = 'color:var(--success)'; bmiStatusText = '正常（18.5-24）'; }

  var genderText = p.gender === 'male' ? '男' : '女';

  // 生成目标预估数据
  var targetDiff = p.targetWeight ? Math.abs(p.weight - p.targetWeight) : 0;
  var weeklyLoss = '0.5-0.8';
  var weeksToGoal = targetDiff > 0 ? Math.round(targetDiff / 0.65) : '--';

  // 训练建议
  var trainingFocus = '力量训练+有氧结合';
  var trainingDetail = '以力量训练+有氧结合为主';
  if (p.goal && (p.goal.indexOf('减脂') >= 0)) {
    trainingFocus = '以有氧燃脂为主，配合力量训练';
    trainingDetail = '以有氧燃脂为主，重点训练大肌群提高代谢';
  } else if (p.goal && (p.goal.indexOf('增肌') >= 0)) {
    trainingFocus = '力量训练为主，渐进负荷';
    trainingDetail = '以力量训练为主，重点训练胸背腿大肌群';
  } else if (p.goal && (p.goal.indexOf('塑形') >= 0)) {
    trainingFocus = '中等强度力量+有氧循环';
    trainingDetail = '以中等强度力量训练+有氧循环，重点训练臀腿和核心';
  }

  document.getElementById('page-analysis-report').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'training-experience\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">你的分析报告</span>' +
    '</div>' +
    '<div class="hero-banner">' +
      '<div class="hero-emoji">&#x1F4CA;</div>' +
      '<h2 class="hero-title">档案分析完成！</h2>' +
      '<p class="hero-subtitle">基于你的数据，AI已生成个性化分析报告</p>' +
    '</div>' +
    '<div class="stats-grid">' +
      '<div class="stat-card"><div class="stat-value">' + bmi.value + '</div><div class="stat-label">BMI 指数</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + bmr.toLocaleString() + '</div><div class="stat-label">基础代谢 (kcal)</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + dailyCal.toLocaleString() + '</div><div class="stat-label">每日建议热量</div></div>' +
      '<div class="stat-card highlight"><div class="stat-value">' + protein + 'g</div><div class="stat-label">每日蛋白质摄入</div></div>' +
    '</div>' +
    '<div class="section-wrap">' +
      '<div class="section-title">身体数据分析</div>' +
      '<div class="info-list">' +
        '<div class="info-item"><span class="info-key">性别</span><span class="info-value">' + genderText + '</span></div>' +
        '<div class="info-item"><span class="info-key">身高 / 体重</span><span class="info-value">' + p.height + 'cm / ' + p.weight + 'kg</span></div>' +
        '<div class="info-item"><span class="info-key">目标体重</span><span class="info-value">' + (p.targetWeight || '--') + 'kg</span></div>' +
        '<div class="info-item"><span class="info-key">体脂率</span><span class="info-value">' + (p.bodyFat || '--') + '%</span></div>' +
        '<div class="info-item"><span class="info-key">BMI 状态</span><span class="info-value" style="' + bmiStatusClass + '">' + bmiStatusText + '</span></div>' +
        (p.waist && p.hip ? '<div class="info-item"><span class="info-key">腰臀比</span><span class="info-value">' + (p.waist / p.hip).toFixed(2) + '</span></div>' : '') +
        '<div class="info-item"><span class="info-key">每日饮水量</span><span class="info-value">' + water + '</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="section-wrap">' +
      '<div class="section-title">目标预估</div>' +
      '<div class="info-list">' +
        '<div class="info-item"><span class="info-key">预计减脂速度</span><span class="info-value">' + weeklyLoss + ' kg/周</span></div>' +
        '<div class="info-item"><span class="info-key">预计达标时间</span><span class="info-value" style="color:var(--primary)">约 ' + weeksToGoal + ' 周</span></div>' +
        '<div class="info-item"><span class="info-key">月目标减重</span><span class="info-value">2-3 kg/月</span></div>' +
        '<div class="info-item"><span class="info-key">周训练次数</span><span class="info-value">' + (p.daysPerWeek || 4) + '次/周</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="section-wrap">' +
      '<div class="section-title">训练建议</div>' +
      '<div class="advice-card">' +
        '<h4>&#x1F3AF; 训练重点</h4>' +
        '<p>' + trainingDetail + '，配合核心训练。</p>' +
      '</div>' +
      '<div class="advice-card">' +
        '<h4>&#x1F4AA; 强度建议</h4>' +
        '<p>新手初期以低强度适应为主，前2周建立运动习惯，之后逐步增加强度。力量训练从自重开始，逐步加入弹力带和哑铃。</p>' +
      '</div>' +
      '<div class="advice-card">' +
        '<h4>&#x1F4CB; 训练安排</h4>' +
        '<p>周一：' + (p.goal && p.goal.indexOf('减脂') >= 0 ? 'HIIT燃脂' : '臀腿力量') + ' · 周三：上肢+核心 · 周五：' + (p.goal && p.goal.indexOf('减脂') >= 0 ? '有氧燃脂' : '综合力量') + ' · 周六：全身综合+拉伸</p>' +
      '</div>' +
    '</div>' +
    '<div class="section-wrap">' +
      '<div class="section-title">注意事项</div>' +
      '<div class="caution-box">' +
        '<h4>&#x26A0; 重要提示</h4>' +
        '<p>1. 新手期以动作标准为首要目标，不追求重量和次数<br>2. 每次训练前充分热身，训练后认真拉伸<br>3. 保持每日饮水量2L以上<br>4. 保证充足睡眠（7-8小时）促进恢复<br>5. 饮食控制与训练同等重要，建议记录每日饮食</p>' +
      '</div>' +
    '</div>' +
    '<div class="bottom-nav">' +
      '<button class="btn-primary" onclick="App.navigate(\'dashboard\')">开始我的训练之旅</button>' +
      '<div class="timeline-est">坚持就是胜利，FitBuddy 会一直陪着你！</div>' +
    '</div>';
}
