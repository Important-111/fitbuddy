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

  // 宏量营养素卡路里配比（用于环形图）
  var calProtein = currentProtein * 4;
  var calCarbs = currentCarbs * 4;
  var calFat = currentFat * 9;
  var calTotal = calProtein + calCarbs + calFat || 1;
  var pPct = (calProtein / calTotal * 100).toFixed(1);
  var cPct = (calCarbs / calTotal * 100).toFixed(1);
  var fPct = (calFat / calTotal * 100).toFixed(1);
  var ringR = 15.9, ringC = 2 * Math.PI * ringR;
  function ringSeg(pct, offset) {
    var len = parseFloat(pct) / 100 * ringC;
    var off = offset / 100 * ringC;
    return 'stroke-dasharray="' + len.toFixed(1) + ' ' + ringC.toFixed(1) + '" stroke-dashoffset="-' + off.toFixed(1) + '"';
  }

  // 今日饮食日志
  var todayLogs = Store.getTodayDietLogs();
  var mealTypes = ['早餐', '午餐', '晚餐', '加餐'];
  var logsByMeal = {};
  mealTypes.forEach(function(m) { logsByMeal[m] = []; });
  todayLogs.forEach(function(l) {
    if (logsByMeal[l.mealType]) logsByMeal[l.mealType].push(l);
  });

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
      '<div class="macro-card macro-ring-card">' +
        '<div class="macro-ring-wrap">' +
          '<svg width="140" height="140" viewBox="0 0 36 36">' +
            '<circle cx="18" cy="18" r="' + ringR + '" fill="none" stroke="#F3F4F6" stroke-width="3"/>' +
            '<circle cx="18" cy="18" r="' + ringR + '" fill="none" stroke="#FF6B35" stroke-width="3" transform="rotate(-90 18 18)" ' + ringSeg(pPct, 0) + '/>' +
            '<circle cx="18" cy="18" r="' + ringR + '" fill="none" stroke="#36CFC9" stroke-width="3" transform="rotate(-90 18 18)" ' + ringSeg(cPct, parseFloat(pPct)) + '/>' +
            '<circle cx="18" cy="18" r="' + ringR + '" fill="none" stroke="#F59E0B" stroke-width="3" transform="rotate(-90 18 18)" ' + ringSeg(fPct, parseFloat(pPct) + parseFloat(cPct)) + '/>' +
            '<text x="18" y="17" text-anchor="middle" font-size="5" font-weight="bold" fill="var(--text-primary)">' + dailyCal + '</text>' +
            '<text x="18" y="22" text-anchor="middle" font-size="2.8" fill="var(--text-secondary)">kcal</text>' +
          '</svg>' +
          '<div class="macro-ring-legend">' +
            '<div class="ring-legend-item"><span class="ring-dot protein"></span>蛋白质 ' + pPct + '%</div>' +
            '<div class="ring-legend-item"><span class="ring-dot carb"></span>碳水 ' + cPct + '%</div>' +
            '<div class="ring-legend-item"><span class="ring-dot fat"></span>脂肪 ' + fPct + '%</div>' +
          '</div>' +
        '</div>' +
        '<div class="macro-bars">' +
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
    '</div>' +
    '<div class="meal-section" id="dietLogSection">' +
      '<div class="section-title">今日饮食记录 <span class="section-subtitle" style="font-size:11px;color:var(--text-secondary)">（手动记录）</span></div>' +
      (todayLogs.length === 0 ? '<div class="empty-state" style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px">暂无记录，点击下方按钮添加</div>' : '') +
      mealTypes.map(function(mt) {
        var logs = logsByMeal[mt] || [];
        if (logs.length === 0) return '';
        var mealCal = logs.reduce(function(s, l) { return s + (Number(l.calories) || 0); }, 0);
        return '<div class="diet-log-meal">' +
          '<div class="diet-log-meal-header"><span>' + mt + '</span><span class="diet-log-meal-cal">' + mealCal + ' kcal</span></div>' +
          logs.map(function(l) {
            return '<div class="diet-log-item" data-id="' + l.id + '">' +
              '<span class="diet-log-item-name">' + escapeHtml(l.foodName) + '</span>' +
              '<span class="diet-log-item-nutri">P' + (Number(l.protein) || 0) + ' C' + (Number(l.carbs) || 0) + ' F' + (Number(l.fat) || 0) + '</span>' +
              '<span class="diet-log-item-cal">' + (l.calories || 0) + 'kcal</span>' +
              '<span class="diet-log-item-del" onclick="deleteDietLog(' + l.id + ')">✕</span>' +
            '</div>';
          }).join('') +
        '</div>';
      }).join('') +
      '<div class="diet-log-add-bar" id="dietLogAddBar">' +
        '<button class="btn-outline btn-sm" onclick="toggleDietForm()">+ 添加饮食记录</button>' +
      '</div>' +
      '<div class="diet-log-form" id="dietLogForm" style="display:none">' +
        '<div class="diet-form-row"><input class="diet-input" id="dietFoodName" placeholder="食物名称" /></div>' +
        '<div class="diet-form-row diet-form-row-grid">' +
          '<select class="diet-input" id="dietMealType"><option value="">餐次</option><option>早餐</option><option>午餐</option><option>晚餐</option><option>加餐</option></select>' +
          '<input class="diet-input" id="dietCalories" type="number" placeholder="卡路里" />' +
        '</div>' +
        '<div class="diet-form-row diet-form-row-grid">' +
          '<input class="diet-input" id="dietProtein" type="number" placeholder="蛋白质(g)" />' +
          '<input class="diet-input" id="dietCarbs" type="number" placeholder="碳水(g)" />' +
          '<input class="diet-input" id="dietFat" type="number" placeholder="脂肪(g)" />' +
        '</div>' +
        '<div class="diet-form-row diet-form-actions">' +
          '<button class="btn-primary btn-sm" onclick="submitDietLog()">保存</button>' +
          '<button class="btn-outline btn-sm" onclick="toggleDietForm()">取消</button>' +
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

/* ===== 饮食记录（手动录入）===== */

var _dietFormVisible = false;

function toggleDietForm() {
  _dietFormVisible = !_dietFormVisible;
  document.getElementById('dietLogForm').style.display = _dietFormVisible ? 'block' : 'none';
  document.getElementById('dietLogAddBar').style.display = _dietFormVisible ? 'none' : 'block';
}

function submitDietLog() {
  var foodName = document.getElementById('dietFoodName').value.trim();
  var mealType = document.getElementById('dietMealType').value;
  var calories = parseInt(document.getElementById('dietCalories').value) || 0;
  var protein = parseInt(document.getElementById('dietProtein').value) || 0;
  var carbs = parseInt(document.getElementById('dietCarbs').value) || 0;
  var fat = parseInt(document.getElementById('dietFat').value) || 0;

  if (!foodName) { showToast('请输入食物名称'); return; }
  if (!mealType) { showToast('请选择餐次'); return; }

  Store.addDietLog({ foodName: foodName, mealType: mealType, calories: calories, protein: protein, carbs: carbs, fat: fat });
  showToast('已记录：' + foodName);
  toggleDietForm();
  // 重置表单
  document.getElementById('dietFoodName').value = '';
  document.getElementById('dietCalories').value = '';
  document.getElementById('dietProtein').value = '';
  document.getElementById('dietCarbs').value = '';
  document.getElementById('dietFat').value = '';
  // 刷新日志区域
  renderDietPlan();
}

function deleteDietLog(id) {
  Store.removeDietLog(id);
  renderDietPlan();
  showToast('已删除');
}
