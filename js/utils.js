/* ===== FitBuddy 工具函数 ===== */

/**
 * 计算 BMI
 * @param {number} weight - 体重 (kg)
 * @param {number} height - 身高 (cm)
 * @returns {{value: string, category: string, categoryCN: string}}
 */
function calcBMI(weight, height) {
  if (!weight || !height) return { value: '--', category: '', categoryCN: '请输入身高体重' };
  var h = height / 100;
  var bmi = weight / (h * h);
  var val = bmi.toFixed(1);
  var cn = '';
  var en = '';
  if (bmi < 18.5) { cn = '偏瘦'; en = 'underweight'; }
  else if (bmi < 24) { cn = '正常'; en = 'normal'; }
  else if (bmi < 28) { cn = '偏胖'; en = 'overweight'; }
  else { cn = '肥胖'; en = 'obese'; }
  return { value: val, category: en, categoryCN: cn };
}

/**
 * 计算 BMR（基础代谢率）
 * @param {string} gender - 'male' 或 'female'
 * @param {number} weight - 体重 (kg)
 * @param {number} height - 身高 (cm)
 * @param {number} age - 年龄
 * @returns {number}
 */
function calcBMR(gender, weight, height, age) {
  if (!weight || !height || !age) return 0;
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

/**
 * 计算每日推荐摄入热量
 * @param {number} bmr - 基础代谢
 * @param {string} goal - 健身目标
 * @returns {number}
 */
function calcDailyCalories(bmr, goal) {
  if (!bmr) return 0;
  if (goal === '减脂' || goal === '减脂瘦身') {
    return Math.round(bmr * 1.2 - 500);
  }
  if (goal === '增肌' || goal === '增肌塑形') {
    return Math.round(bmr * 1.2 + 300);
  }
  return Math.round(bmr * 1.2);
}

/**
 * 格式化日期
 * @param {Date|string} date
 * @param {string} format - 'yyyy-mm-dd' | 'mm-dd' | 'weekday'
 * @returns {string}
 */
function formatDate(date, format) {
  var d = typeof date === 'string' ? new Date(date) : date;
  var y = d.getFullYear();
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var day = ('0' + d.getDate()).slice(-2);
  var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  switch (format) {
    case 'yyyy-mm-dd': return y + '-' + m + '-' + day;
    case 'mm-dd': return m + '/' + day;
    case 'weekday': return weekdays[d.getDay()];
    case 'md-weekday': return m + '/' + day + ' ' + weekdays[d.getDay()];
    default: return y + '-' + m + '-' + day;
  }
}

/**
 * 获取今天的日期字符串
 */
function todayStr() {
  return formatDate(new Date(), 'yyyy-mm-dd');
}

/**
 * 获取当前周一的日期
 */
function getMonday(d) {
  var date = new Date(d);
  var day = date.getDay();
  var diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

/**
 * HTML 转义
 */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/**
 * 显示 Toast 提示
 */
var _toastTimer = null;
function showToast(msg, duration) {
  duration = duration || 1800;
  var t = document.getElementById('featureToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'featureToast';
    t.className = 'feature-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { t.classList.remove('show'); }, duration);
}

/**
 * 根据性别获取头像 emoji
 */
function getAvatarEmoji(gender) {
  return gender === 'male' ? '\u{1F468}' : '\u{1F469}';
}

/**
 * 根据目标获取配色
 */
function getGoalEmoji(goal) {
  var goalMap = {
    '减脂': '\u{1F525}', '减脂瘦身': '\u{1F525}',
    '增肌': '\u{1F4AA}', '增肌塑形': '\u{1F4AA}',
    '塑形': '\u{2728}',
    '提升体能': '\u{1F3CB}',
    '保持健康': '\u{1F33F}',
    '提高力量': '\u{1F3CB}',
    '提高耐力': '\u{1F3C3}',
    '改善体态': '\u{1F9CD}',
    '翘臀': '\u{1F351}',
    '腹肌': '\u{1F9AC}',
    '腿部塑形': '\u{1F9CD}',
    '全身紧致': '\u{1F31F}',
    '康复训练': '\u{1F3E5}'
  };
  return goalMap[goal] || '\u{1F3AF}';
}

/**
 * 获取当前时间段的问候语
 */
function getGreeting() {
  var h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}
