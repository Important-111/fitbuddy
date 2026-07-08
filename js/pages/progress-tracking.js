/* ===== 进度追踪页 ===== */

function renderProgressTracking() {
  var p = Store.getProfile() || {};
  var records = Store.getCheckins();
  var weightHistory = Store.getWeightHistory();

  var totalWorkouts = records.length;
  var totalMinutes = Store.getTotalMinutes();
  var totalCal = Store.getTotalCaloriesBurned();
  var streak = Store.getStreakDays();
  var completionRate = Store.getCompletionRate();

  // 生成体重变化图表条
  var chartBars = '';
  var displayWeights = weightHistory.slice(-7);
  if (displayWeights.length === 0) {
    // 模拟数据
    chartBars =
      '<div class="chart-bar-wrap"><div class="chart-bar" style="height:90%"></div><span class="chart-bar-label">--</span></div>' +
      '<div class="chart-bar-wrap"><div class="chart-bar" style="height:85%"></div><span class="chart-bar-label">--</span></div>' +
      '<div class="chart-bar-wrap"><div class="chart-bar" style="height:80%"></div><span class="chart-bar-label">--</span></div>' +
      '<div class="chart-bar-wrap"><div class="chart-bar" style="height:75%"></div><span class="chart-bar-label">--</span></div>' +
      '<div class="chart-bar-wrap"><div class="chart-bar" style="height:70%"></div><span class="chart-bar-label">--</span></div>';
  } else {
    var maxW = 0;
    var minW = Infinity;
    displayWeights.forEach(function(w) {
      if (w.weight > maxW) maxW = w.weight;
      if (w.weight < minW) minW = w.weight;
    });
    var range = (maxW - minW) || 1;

    displayWeights.forEach(function(w) {
      var h = 40 + ((maxW - w.weight) / range) * 60;
      chartBars += '<div class="chart-bar-wrap"><div class="chart-bar" style="height:' + h + '%"></div><span class="chart-bar-label">' + parseFloat(w.weight.toFixed(1)) + '</span></div>';
    });
  }

  // 围度变化表
  var initialWeight = weightHistory.length > 0 ? weightHistory[0].weight : (p.weight || 0);
  var currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : (p.weight || 0);
  var weightChange = (currentWeight - initialWeight).toFixed(1);
  var weightChangeClass = weightChange < 0 ? 'color:var(--success)' : (weightChange > 0 ? 'color:var(--danger)' : '');

  var initialBMI = calcBMI(initialWeight, p.height).value;
  var currentBMI = calcBMI(currentWeight, p.height).value;
  var bmiChange = (parseFloat(currentBMI) - parseFloat(initialBMI)).toFixed(1);

  // 本周分析
  var weekWorkouts = 0;
  var today = new Date();
  var monday = getMonday(today);
  for (var i = 0; i < records.length; i++) {
    var rd = new Date(records[i].date);
    if (rd >= monday) weekWorkouts++;
  }

  document.getElementById('page-progress-tracking').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'dashboard\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">进度追踪</span>' +
    '</div>' +
    '<div class="overview-cards">' +
      '<div class="overview-card"><div class="overview-val">' + (records.length > 0 ? streak : '--') + '</div><div class="overview-lbl">连续打卡</div></div>' +
      '<div class="overview-card"><div class="overview-val">' + totalWorkouts + '</div><div class="overview-lbl">累计次数</div></div>' +
      '<div class="overview-card"><div class="overview-val">' + formatMinutes(totalMinutes) + '</div><div class="overview-lbl">累计时长</div></div>' +
      '<div class="overview-card"><div class="overview-val">' + totalCal.toLocaleString() + '</div><div class="overview-lbl">累计消耗(kcal)</div></div>' +
      '<div class="overview-card"><div class="overview-val">' + completionRate + '%</div><div class="overview-lbl">完成率</div></div>' +
      '<div class="overview-card"><div class="overview-val">' + streak + '</div><div class="overview-lbl">连续打卡</div></div>' +
    '</div>' +
    '<div class="milestone-section">' +
      '<div class="section-title">里程碑成就</div>' +
      '<div class="milestone-scroll">' +
        '<div class="milestone-card' + (records.length >= 1 ? ' achieved' : '') + '"><div class="milestone-icon">&#x1F389;</div><div class="milestone-name">首次训练</div><div class="milestone-date">' + (records.length >= 1 ? '已达成' : '未达成') + '</div></div>' +
        '<div class="milestone-card' + (streak >= 7 ? ' achieved' : '') + '"><div class="milestone-icon">&#x1F525;</div><div class="milestone-name">连续7天</div><div class="milestone-date">' + (streak >= 7 ? '已达成' : '还差 ' + (7 - streak) + ' 天') + '</div></div>' +
        '<div class="milestone-card' + (totalWorkouts >= 10 ? ' achieved' : '') + '"><div class="milestone-icon">&#x2B50;</div><div class="milestone-name">累计10次</div><div class="milestone-date">' + (totalWorkouts >= 10 ? '已达成' : '还差 ' + (10 - totalWorkouts) + ' 次') + '</div></div>' +
        '<div class="milestone-card' + (streak >= 30 ? ' achieved' : '') + '"><div class="milestone-icon">&#x1F3AF;</div><div class="milestone-name">连续30天</div><div class="milestone-date">' + (streak >= 30 ? '已达成' : '还差 ' + (30 - streak) + ' 天') + '</div></div>' +
        '<div class="milestone-card' + (totalWorkouts >= 100 ? ' achieved' : '') + '"><div class="milestone-icon">&#x1F4AA;</div><div class="milestone-name">累计100次</div><div class="milestone-date">' + (totalWorkouts >= 100 ? '已达成' : '还差 ' + (100 - totalWorkouts) + ' 次') + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="chart-section">' +
      '<div class="chart-card">' +
        '<div class="chart-header"><span class="chart-title">体重变化趋势</span><span class="chart-period">近' + Math.max(displayWeights.length, 5) + '天</span></div>' +
        '<div class="chart-placeholder">' + chartBars + '</div>' +
        '<div class="chart-legend">' +
          '<div class="chart-legend-item"><div class="chart-legend-dot primary"></div>体重 (kg)</div>' +
          (p.targetWeight ? '<div class="chart-legend-item"><div class="chart-legend-dot accent"></div>目标 (' + p.targetWeight + 'kg)</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="chart-section">' +
      '<div class="chart-card">' +
        '<div class="chart-header"><span class="chart-title">围度变化</span><span class="chart-period">累计</span></div>' +
        '<div style="overflow-x:auto">' +
          '<table class="data-table">' +
            '<tr><th>指标</th><th>初始</th><th>当前</th><th>变化</th></tr>' +
            '<tr><td>体重</td><td>' + initialWeight.toFixed(1) + 'kg</td><td>' + currentWeight.toFixed(1) + 'kg</td><td style="' + weightChangeClass + '">' + (weightChange > 0 ? '+' : '') + weightChange + 'kg</td></tr>' +
            '<tr><td>BMI</td><td>' + initialBMI + '</td><td>' + currentBMI + '</td><td style="color:var(--success)">' + (bmiChange > 0 ? '+' : '') + bmiChange + '</td></tr>' +
            (p.waist ? '<tr><td>腰围</td><td>' + (p.waist || '--') + 'cm</td><td>' + (p.waist || '--') + 'cm</td><td style="color:var(--success)">--</td></tr>' : '') +
            (p.hip ? '<tr><td>臀围</td><td>' + (p.hip || '--') + 'cm</td><td>' + (p.hip || '--') + 'cm</td><td style="color:var(--success)">--</td></tr>' : '') +
            (p.bodyFat ? '<tr><td>体脂率</td><td>' + (p.bodyFat || '--') + '%</td><td>' + (p.bodyFat || '--') + '%</td><td style="color:var(--success)">--</td></tr>' : '') +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="weekly-analysis">' +
      '<div class="section-title">本周AI分析</div>' +
      '<div class="analysis-card">' +
        '<div class="analysis-icon">&#x1F4CA;</div>' +
        '<div class="analysis-info"><div class="analysis-title">训练完成率</div><div class="analysis-desc">本周完成 ' + weekWorkouts + '/' + (p.daysPerWeek || 4) + ' 次训练</div></div>' +
        '<span class="analysis-status ' + (weekWorkouts >= (p.daysPerWeek || 4) * 0.6 ? 'status-good' : 'status-warn') + '">' + (weekWorkouts > 0 ? Math.round(weekWorkouts / (p.daysPerWeek || 4) * 100) : 0) + '%</span>' +
      '</div>' +
      '<div class="analysis-card">' +
        '<div class="analysis-icon">&#x26A1;</div>' +
        '<div class="analysis-info"><div class="analysis-title">体重变化</div><div class="analysis-desc">' + (records.length > 0 ? '有打卡记录，趋势追踪中' : '暂无打卡记录，开始记录吧') + '</div></div>' +
        '<span class="analysis-status ' + (weightChange < 0 ? 'status-good' : 'status-warn') + '">' + (weightChange > 0 ? '+' : '') + weightChange + 'kg</span>' +
      '</div>' +
      '<div class="analysis-card">' +
        '<div class="analysis-icon">&#x1F4AA;</div>' +
        '<div class="analysis-info"><div class="analysis-title">疲劳恢复</div><div class="analysis-desc">' + (records.length > 0 ? '有打卡记录，状态正常' : '暂无数据') + '</div></div>' +
        '<span class="analysis-status status-good">正常</span>' +
      '</div>' +
      '<div class="analysis-card">' +
        '<div class="analysis-icon">&#x1F4A1;</div>' +
        '<div class="analysis-info"><div class="analysis-title">调整建议</div><div class="analysis-desc">' + (weekWorkouts >= (p.daysPerWeek || 4) ? '本周目标已达成，下周可以增加强度' : (weekWorkouts > 0 ? '完成率尚可，下周保持当前训练量' : '开始训练吧，建立运动习惯是第一步')) + '</div></div>' +
        '<span class="analysis-status status-good">' + (weekWorkouts >= (p.daysPerWeek || 4) ? '增加' : '保持') + '</span>' +
      '</div>' +
    '</div>';
}
