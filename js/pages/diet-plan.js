/* ===== 饮食建议页 ===== */

function renderDietPlan() {
  var p = Store.getProfile() || {};
  var bmr = calcBMR(p.gender, p.weight, p.height, p.age);
  var dailyCal = calcDailyCalories(bmr, p.goal);
  var protein = Math.round(p.weight * 1.6);
  var carbs = Math.round(dailyCal * 0.4 / 4);
  var fat = Math.round(dailyCal * 0.25 / 9);

  // 根据目标调整
  if (p.goal && (p.goal.indexOf('增肌') >= 0)) {
    protein = Math.round(p.weight * 2);
    carbs = Math.round(dailyCal * 0.45 / 4);
    fat = Math.round(dailyCal * 0.2 / 9);
  } else if (p.goal && (p.goal.indexOf('减脂') >= 0)) {
    protein = Math.round(p.weight * 1.8);
    carbs = Math.round(dailyCal * 0.35 / 4);
    fat = Math.round(dailyCal * 0.25 / 9);
  }

  var currentProtein = Math.round(protein * 0.75);
  var currentCarbs = Math.round(carbs * 0.6);
  var currentFat = Math.round(fat * 0.45);

  document.getElementById('page-diet-plan').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'dashboard\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">饮食建议</span>' +
    '</div>' +
    '<div class="nutri-banner">' +
      '<h2>今日营养目标</h2>' +
      '<div class="nutri-row">' +
        '<div class="nutri-item"><div class="nutri-val">' + dailyCal.toLocaleString() + '</div><div class="nutri-lbl">热量(kcal)</div></div>' +
        '<div class="nutri-item"><div class="nutri-val">' + protein + 'g</div><div class="nutri-lbl">蛋白质</div></div>' +
        '<div class="nutri-item"><div class="nutri-val">' + carbs + 'g</div><div class="nutri-lbl">碳水</div></div>' +
        '<div class="nutri-item"><div class="nutri-val">' + fat + 'g</div><div class="nutri-lbl">脂肪</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="goal-tabs">' +
      '<div class="goal-tab' + ((p.goal && p.goal.indexOf('减脂') >= 0) ? ' active' : '') + '" onclick="selectGoalTab(this)">减脂</div>' +
      '<div class="goal-tab' + ((p.goal && p.goal.indexOf('增肌') >= 0) ? ' active' : '') + '" onclick="selectGoalTab(this)">增肌</div>' +
      '<div class="goal-tab' + ((!p.goal || (p.goal.indexOf('减脂') < 0 && p.goal.indexOf('增肌') < 0)) ? ' active' : '') + '" onclick="selectGoalTab(this)">塑形</div>' +
    '</div>' +
    '<div class="meal-section">' +
      '<div class="section-title">今日饮食方案</div>' +
      '<div class="meal-card">' +
        '<div class="meal-header"><span class="meal-time"><span class="meal-emoji">&#x1F31E;</span>早餐 · 7:30</span><span class="meal-cal">~430 kcal</span></div>' +
        '<div class="meal-items">' +
          '<span class="meal-item">全麦面包 2片</span>' +
          '<span class="meal-item">水煮蛋 2个</span>' +
          '<span class="meal-item">牛奶 250ml</span>' +
          '<span class="meal-item">小番茄 100g</span>' +
        '</div>' +
        '<div class="meal-note">蛋白质 28g · 碳水 45g · 脂肪 15g</div>' +
      '</div>' +
      '<div class="meal-card">' +
        '<div class="meal-header"><span class="meal-time"><span class="meal-emoji">&#x2600;&#xFE0F;</span>午餐 · 12:00</span><span class="meal-cal">~500 kcal</span></div>' +
        '<div class="meal-items">' +
          '<span class="meal-item">糙米饭 150g</span>' +
          '<span class="meal-item">鸡胸肉 150g</span>' +
          '<span class="meal-item">西兰花 100g</span>' +
          '<span class="meal-item">橄榄油 5ml</span>' +
        '</div>' +
        '<div class="meal-note">蛋白质 42g · 碳水 55g · 脂肪 12g</div>' +
      '</div>' +
      '<div class="meal-card">' +
        '<div class="meal-header"><span class="meal-time"><span class="meal-emoji">&#x1F33F;</span>加餐 · 15:30</span><span class="meal-cal">~200 kcal</span></div>' +
        '<div class="meal-items">' +
          '<span class="meal-item">希腊酸奶 150g</span>' +
          '<span class="meal-item">坚果 20g</span>' +
          '<span class="meal-item">蓝莓 50g</span>' +
        '</div>' +
        '<div class="meal-note">蛋白质 15g · 碳水 18g · 脂肪 8g</div>' +
      '</div>' +
      '<div class="meal-card">' +
        '<div class="meal-header"><span class="meal-time"><span class="meal-emoji">&#x1F319;</span>晚餐 · 18:30</span><span class="meal-cal">~400 kcal</span></div>' +
        '<div class="meal-items">' +
          '<span class="meal-item">蒸鱼 150g</span>' +
          '<span class="meal-item">杂粮饭 100g</span>' +
          '<span class="meal-item">时蔬沙拉</span>' +
          '<span class="meal-item">豆腐汤 1碗</span>' +
        '</div>' +
        '<div class="meal-note">蛋白质 38g · 碳水 40g · 脂肪 10g</div>' +
      '</div>' +
    '</div>' +
    '<div class="macro-section">' +
      '<div class="section-title">宏量营养素配比</div>' +
      '<div class="macro-card">' +
        '<div class="macro-row">' +
          '<span class="macro-label">蛋白质</span>' +
          '<div class="macro-bar-wrap"><div class="macro-bar protein" style="width:' + Math.round(currentProtein / protein * 100) + '%"></div></div>' +
          '<span class="macro-value">' + currentProtein + 'g / ' + protein + 'g</span>' +
        '</div>' +
        '<div class="macro-row">' +
          '<span class="macro-label">碳水</span>' +
          '<div class="macro-bar-wrap"><div class="macro-bar carb" style="width:' + Math.round(currentCarbs / carbs * 100) + '%"></div></div>' +
          '<span class="macro-value">' + currentCarbs + 'g / ' + carbs + 'g</span>' +
        '</div>' +
        '<div class="macro-row">' +
          '<span class="macro-label">脂肪</span>' +
          '<div class="macro-bar-wrap"><div class="macro-bar fat" style="width:' + Math.round(currentFat / fat * 100) + '%"></div></div>' +
          '<span class="macro-value">' + currentFat + 'g / ' + fat + 'g</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="water-section">' +
      '<div class="water-card">' +
        '<div class="water-icon">&#x1F4A7;</div>' +
        '<div class="water-info"><h4>饮水提醒</h4><p>今日目标 2.0L · 已完成 1.2L</p></div>' +
        '<div class="water-progress"><span>60%</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="meal-section">' +
      '<div class="section-title">饮食小贴士</div>' +
      '<div class="meal-card">' +
        '<div class="meal-header"><span class="meal-time">&#x1F4A1; 减脂期饮食原则</span></div>' +
        '<div class="meal-note" style="font-size:12px;line-height:1.6">' +
          '1. 保证蛋白质摄入充足（每kg体重1.6g），防止肌肉流失<br>' +
          '2. 碳水选择低GI食物（全麦、糙米、燕麦）<br>' +
          '3. 每天喝足2L水，促进代谢<br>' +
          '4. 晚餐尽量在19:00前完成<br>' +
          '5. 减少加工食品和含糖饮料<br>' +
          '6. 每周可安排1次自由餐，避免过度压抑' +
        '</div>' +
      '</div>' +
    '</div>';
}

function selectGoalTab(el) {
  document.querySelectorAll('.goal-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  showToast('切换至' + el.textContent + '模式');
}
