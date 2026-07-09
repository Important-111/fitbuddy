/* ===== 基础信息采集 - 步骤 1/3 ===== */

function renderBasicInfo() {
  var profile = Store.getProfile() || {};
  document.getElementById('page-basic-info').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'welcome\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">建立你的档案</span>' +
    '</div>' +
    '<div class="progress-bar-wrap">' +
      '<div class="progress-steps">' +
        '<div class="progress-step active">1</div>' +
        '<div class="progress-step">2</div>' +
        '<div class="progress-step">3</div>' +
      '</div>' +
      '<div class="progress-bar-bg"><div class="progress-bar-fill" style="width:33%"></div></div>' +
      '<div class="progress-label">步骤 1/3 · 基础身体信息</div>' +
    '</div>' +
    '<div class="form-section">' +
      '<h2 class="section-title-inline">基础信息</h2>' +
      '<p class="section-desc">请如实填写以下信息，这将帮助我们为你制定最合适的训练计划</p>' +
      '<div class="form-group">' +
        '<label class="form-label">性别</label>' +
        '<div class="gender-group">' +
          '<div class="gender-option' + (profile.gender === 'male' ? ' selected' : '') + '" onclick="selectGender(this,\'male\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="7" r="5"/><path d="M22 2L14 10"/><path d="M14 2h8v8"/></svg>男' +
          '</div>' +
          '<div class="gender-option' + (profile.gender === 'female' ? ' selected' : '') + '" onclick="selectGender(this,\'female\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="9" r="5"/><path d="M12 14v7"/><path d="M9 18h6"/></svg>女' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label class="form-label">昵称</label>' +
          '<input type="text" class="form-input" placeholder="如何称呼你" id="inputNickname" value="' + escapeHtml(profile.nickname || '') + '">' +
        '</div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label class="form-label">年龄</label>' +
          '<div class="input-with-unit"><input type="number" class="form-input" placeholder="25" id="inputAge" value="' + (profile.age || '') + '" oninput="calcBMILive()"><span class="input-unit">岁</span></div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">身高</label>' +
          '<div class="input-with-unit"><input type="number" class="form-input" placeholder="170" id="inputHeight" value="' + (profile.height || '') + '" oninput="calcBMILive()"><span class="input-unit">cm</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label class="form-label">当前体重</label>' +
          '<div class="input-with-unit"><input type="number" class="form-input" placeholder="70" id="inputWeight" value="' + (profile.weight || '') + '" oninput="calcBMILive()"><span class="input-unit">kg</span></div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">目标体重</label>' +
          '<div class="input-with-unit"><input type="number" class="form-input" placeholder="60" id="inputTargetWeight" value="' + (profile.targetWeight || '') + '"><span class="input-unit">kg</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">BMI <span>（自动计算）</span></label>' +
        '<div class="bmi-display">' +
          '<span class="bmi-label">身体质量指数</span>' +
          '<div style="text-align:right"><div class="bmi-value" id="bmiValue">--</div><span class="bmi-category" id="bmiCat">请输入身高体重</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label class="form-label">腰围 <span>（选填）</span></label>' +
          '<div class="input-with-unit"><input type="number" class="form-input" placeholder="80" id="inputWaist" value="' + (profile.waist || '') + '"><span class="input-unit">cm</span></div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">臀围 <span>（选填）</span></label>' +
          '<div class="input-with-unit"><input type="number" class="form-input" placeholder="95" id="inputHip" value="' + (profile.hip || '') + '"><span class="input-unit">cm</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">体脂率 <span>（不知道可跳过）</span></label>' +
        '<div class="input-with-unit"><input type="number" class="form-input" placeholder="25" id="inputBodyFat" value="' + (profile.bodyFat || '') + '"><span class="input-unit">%</span></div>' +
        '<div class="form-tip">可使用体脂秤测量，没有可跳过</div>' +
      '</div>' +
    '</div>' +
    '<div class="bottom-nav">' +
      '<button class="btn-primary" onclick="saveBasicInfo()">下一步：选择训练目标</button>' +
    '</div>';

  // 触发一次 BMI 计算
  calcBMILive();
}

function calcBMILive() {
  var h = parseFloat(document.getElementById('inputHeight').value);
  var w = parseFloat(document.getElementById('inputWeight').value);
  var bmiEl = document.getElementById('bmiValue');
  var catEl = document.getElementById('bmiCat');
  if (h > 0 && w > 0) {
    var bmi = calcBMI(w, h);
    bmiEl.textContent = bmi.value;
    catEl.textContent = bmi.categoryCN;
  } else {
    bmiEl.textContent = '--';
    catEl.textContent = '请输入身高体重';
  }
}

function saveBasicInfo() {
  var genderEl = document.querySelector('.gender-option.selected');
  var nickname = document.getElementById('inputNickname').value.trim();
  var age = parseInt(document.getElementById('inputAge').value);
  var height = parseFloat(document.getElementById('inputHeight').value);
  var weight = parseFloat(document.getElementById('inputWeight').value);
  var targetWeight = parseFloat(document.getElementById('inputTargetWeight').value);
  var waist = parseFloat(document.getElementById('inputWaist').value) || '';
  var hip = parseFloat(document.getElementById('inputHip').value) || '';
  var bodyFat = parseFloat(document.getElementById('inputBodyFat').value) || '';
  var gender = genderEl ? genderEl.getAttribute('onclick').match(/'([^']+)'/)[1] : 'male';

  if (!nickname) { showToast('请输入昵称'); return; }
  if (!age || age < 1) { showToast('请输入有效年龄'); return; }
  if (!height || height < 50) { showToast('请输入有效身高'); return; }
  if (!weight || weight < 10) { showToast('请输入有效体重'); return; }

  var profile = Store.getProfile() || {};
  profile.nickname = nickname;
  profile.gender = gender;
  profile.age = age;
  profile.height = height;
  profile.weight = weight;
  profile.targetWeight = targetWeight;
  profile.waist = waist;
  profile.hip = hip;
  profile.bodyFat = bodyFat;
  Store.saveProfile(profile);

  App.navigate('training-goals');
}
