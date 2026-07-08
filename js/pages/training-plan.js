/* ===== 训练计划页 ===== */

function renderTrainingPlan() {
  var p = Store.getProfile() || {};
  var progress = Store.getWorkoutProgress();
  var checkins = Store.getCheckins();

  // 周数据
  var now = new Date();
  var monday = getMonday(now);
  var weekDays = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push({
      date: formatDate(d, 'yyyy-mm-dd'),
      weekday: formatDate(d, 'weekday'),
      dayNum: d.getDate(),
      month: d.getMonth() + 1
    });
  }

  // 训练计划模板（根据目标动态）
  var workoutTemplates = getWorkoutTemplates(p.goal);

  // 本周完成统计
  var weekDone = 0;
  var weekTotal = 0;
  var weekCalories = 0;
  var weekMinutes = 0;

  var dayCards = '';
  for (var i = 0; i < 7; i++) {
    var wd = weekDays[i];
    // 判断今天
    var isToday = wd.date === todayStr();
    // 判断是否完成
    var isDone = progress[wd.date] && progress[wd.date].done;
    // 检查是否有打卡记录
    var hasCheckin = false;
    for (var ci = 0; ci < checkins.length; ci++) {
      if (checkins[ci].date === wd.date) { hasCheckin = true; break; }
    }

    var workout = workoutTemplates[i];

    // 确定卡片状态
    var cardClass = 'day-card';
    var statusClass = '';
    var statusText = '';

    if (workout.isRest) {
      cardClass += ' rest';
      statusClass = 'status-rest';
      statusText = '休息日';
    } else if (isDone || hasCheckin) {
      cardClass += ' done';
      statusClass = 'status-done';
      statusText = '已完成';
      weekDone++;
      weekTotal++;
      weekCalories += workout.calories || 280;
      weekMinutes += workout.minutes || 35;
    } else if (isToday) {
      cardClass += ' today';
      statusClass = 'status-todo';
      statusText = '待训练';
      weekTotal++;
    } else {
      // 过去的天
      var wdDate = new Date(wd.date);
      if (wdDate < now) {
        statusClass = 'status-rest';
        statusText = '已跳过';
      } else {
        statusClass = 'status-todo';
        statusText = '待训练';
        weekTotal++;
      }
    }

    dayCards +=
      '<div class="' + cardClass + '" onclick="' + (workout.isRest ? '' : 'App.navigate(\'daily-workout\')') + '">' +
        '<div class="day-num"><span class="day-num-name">' + wd.weekday + '</span><span class="day-num-date">' + wd.month + '/' + wd.dayNum + '</span></div>' +
        '<div class="day-info">' +
          '<div class="day-type">' + workout.name + '</div>' +
          '<div class="day-desc">' + workout.desc + '</div>' +
          '<div class="day-meta">' + workout.meta + '</div>' +
        '</div>' +
        '<span class="day-status ' + statusClass + '">' + statusText + '</span>' +
      '</div>';
  }

  // 周统计
  var weekCheckinRate = weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0;

  document.getElementById('page-training-plan').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'dashboard\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">训练计划</span>' +
    '</div>' +
    '<div class="month-goal-card">' +
      '<div class="month-goal-title">' + (now.getMonth() + 1) + '月目标</div>' +
      '<div class="month-goal-main">' + (p.goal || '减脂') + (p.targetWeight ? ' · 目标 ' + p.targetWeight + 'kg' : '') + '</div>' +
      '<div class="month-goal-sub">建立运动习惯 · 完成' + (p.daysPerWeek || 4) * 4 + '次训练</div>' +
      '<div class="month-goals">' +
        '<div class="month-goal-item"><div class="month-goal-item-val">' + (p.daysPerWeek || 4) * 4 + '</div><div class="month-goal-item-lbl">目标次数</div></div>' +
        '<div class="month-goal-item"><div class="month-goal-item-val">' + checkins.length + '</div><div class="month-goal-item-lbl">已完成</div></div>' +
        '<div class="month-goal-item"><div class="month-goal-item-val">' + (checkins.length > 0 ? Math.round(checkins.length / ((p.daysPerWeek || 4) * 4) * 100) : 0) + '%</div><div class="month-goal-item-lbl">完成率</div></div>' +
        '<div class="month-goal-item"><div class="month-goal-item-val">' + (30 - now.getDate()) + '</div><div class="month-goal-item-lbl">剩余天</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="week-tabs" id="weekTabs">' +
      '<div class="week-tab active">本周</div>' +
      '<div class="week-tab">下周</div>' +
    '</div>' +
    '<div class="week-schedule" id="weekSchedule">' +
      dayCards +
    '</div>' +
    '<div class="summary-section">' +
      '<div class="summary-title">本周统计</div>' +
      '<div class="summary-card">' +
        '<div class="summary-item"><div class="summary-item-val">' + weekDone + '/' + weekTotal + '</div><div class="summary-item-lbl">完成训练</div></div>' +
        '<div class="summary-item"><div class="summary-item-val">' + weekMinutes + '</div><div class="summary-item-lbl">训练分钟</div></div>' +
        '<div class="summary-item"><div class="summary-item-val">' + weekCalories + '</div><div class="summary-item-lbl">消耗热量</div></div>' +
        '<div class="summary-item"><div class="summary-item-val">' + (isNaN(weekCheckinRate) ? 0 : weekCheckinRate) + '%</div><div class="summary-item-lbl">完成率</div></div>' +
      '</div>' +
    '</div>';

  // 周 tab 切换
  var tabs = document.querySelectorAll('.week-tab');
  tabs.forEach(function(tab, idx) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      showToast('切换至' + tab.textContent);
    });
  });
}

function getWorkoutTemplates(goal) {
  var isFatLoss = goal && (goal.indexOf('减脂') >= 0);
  var isMuscleGain = goal && (goal.indexOf('增肌') >= 0);

  return [
    { name: isFatLoss ? 'HIIT 高效燃脂' : (isMuscleGain ? '胸部力量训练' : '臀腿力量训练'), desc: isFatLoss ? 'Tabata训练 · 战绳 · 登山跑' : (isMuscleGain ? '俯卧撑 · 哑铃推举' : '深蹲 · 臀桥 · 弓步蹲'), meta: '<span class="day-meta-item">' + (isFatLoss ? '25' : '35') + '分钟</span><span class="day-meta-item">4个动作</span>', minutes: isFatLoss ? 25 : 35, calories: isFatLoss ? 250 : 280, isRest: false },
    { name: '休息 + 拉伸恢复', desc: '泡沫轴放松 · 静态拉伸', meta: '<span class="day-meta-item">20分钟</span>', minutes: 20, calories: 50, isRest: true },
    { name: isMuscleGain ? '背部力量训练' : '上半身力量训练', desc: isMuscleGain ? '引体向上 · 划船 · 硬拉' : '俯卧撑 · 推举 · 划船', meta: '<span class="day-meta-item">' + (isMuscleGain ? '40' : '35') + '分钟</span><span class="day-meta-item">4个动作</span>', minutes: isMuscleGain ? 40 : 35, calories: isMuscleGain ? 320 : 280, isRest: false },
    { name: '休息 + 拉伸恢复', desc: '泡沫轴放松 · 静态拉伸 · 瑜伽放松', meta: '<span class="day-meta-item">20分钟</span>', minutes: 20, calories: 50, isRest: true },
    { name: isFatLoss ? '有氧燃脂' : (isMuscleGain ? '肩部+手臂训练' : 'HIIT 高效燃脂'), desc: isFatLoss ? '慢跑 · 跳绳 · 游泳' : (isMuscleGain ? '哑铃推举 · 侧平举 · 弯举' : 'Tabata · 战绳 · 深蹲跳'), meta: '<span class="day-meta-item">' + (isFatLoss ? '30' : '25') + '分钟</span><span class="day-meta-item">' + (isFatLoss ? '3' : '6') + '个动作</span>', minutes: isFatLoss ? 30 : 25, calories: isFatLoss ? 200 : 250, isRest: false },
    { name: '全身综合训练', desc: '深蹲 · 俯卧撑 · 平板支撑 · 臀桥', meta: '<span class="day-meta-item">40分钟</span><span class="day-meta-item">6个动作</span>', minutes: 40, calories: 320, isRest: false },
    { name: '完全休息', desc: '充足睡眠 · 补充营养 · 轻度散步', meta: '<span class="day-meta-item">恢复日</span>', minutes: 0, calories: 0, isRest: true }
  ];
}
