/* ===== FitBuddy 主应用 - 路由、导航、初始化 ===== */

var App = {
  /** 当前页面名称 */
  currentPage: null,

  /** 页面渲染函数映射 */
  renderers: {
    'welcome': renderWelcome,
    'basic-info': renderBasicInfo,
    'training-goals': renderTrainingGoals,
    'training-experience': renderTrainingExperience,
    'analysis-report': renderAnalysisReport,
    'dashboard': renderDashboard,
    'training-plan': renderTrainingPlan,
    'daily-workout': renderDailyWorkout,
    'exercise-detail': renderExerciseDetail,
    'daily-checkin': renderDailyCheckin,
    'progress-tracking': renderProgressTracking,
    'diet-plan': renderDietPlan,
    'profile': renderProfile
  },

  /** 需要底部 tab 的页面 */
  tabPages: ['dashboard', 'training-plan', 'progress-tracking', 'diet-plan', 'profile'],

  /** 初始化应用 */
  init: function() {
    // 监听 hash 变化
    window.addEventListener('hashchange', function() {
      App.handleRoute();
    });

    // 初始路由
    App.handleRoute();
  },

  /** 处理路由 */
  handleRoute: function() {
    var hash = window.location.hash.replace('#', '') || 'default';
    var page = hash;

    // 首次使用检查
    if (page === 'default' || page === '') {
      var profile = Store.getProfile();
      page = profile ? 'dashboard' : 'welcome';
    }

    App.showPage(page);
  },

  /** 显示指定页面 */
  showPage: function(pageId) {
    if (!App.renderers[pageId]) {
      pageId = 'welcome';
    }

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(function(el) {
      el.classList.remove('active');
    });

    // 渲染目标页面
    var pageEl = document.getElementById('page-' + pageId);
    if (!pageEl) {
      // 动态创建页面容器
      pageEl = document.createElement('div');
      pageEl.id = 'page-' + pageId;
      pageEl.className = 'page';
      var appContainer = document.getElementById('app-pages');
      if (!appContainer) {
        var ac = document.querySelector('.app-container');
        if (ac) {
          // 找第一个子元素之前的插入点
          ac.insertBefore(pageEl, ac.firstChild);
        }
      } else {
        appContainer.appendChild(pageEl);
      }
    }

    // 调用渲染函数
    try {
      App.renderers[pageId]();
    } catch(e) {
      console.error('Render error for', pageId, e);
    }

    // 激活页面
    pageEl.classList.add('active');

    // Tab 导航显示/隐藏
    var bottomTab = document.getElementById('bottomTab');
    if (bottomTab) {
      if (App.tabPages.indexOf(pageId) >= 0) {
        bottomTab.style.display = 'flex';
        // 高亮当前 tab
        var tabs = bottomTab.querySelectorAll('.tab-item');
        tabs.forEach(function(tab) {
          tab.classList.remove('active');
          var href = tab.getAttribute('data-page');
          if (href === pageId) tab.classList.add('active');
        });
      } else {
        bottomTab.style.display = 'none';
      }
    }

    App.currentPage = pageId;
  },

  /** 导航到指定页面 */
  navigate: function(page) {
    window.location.hash = '#' + page;
  }
};

// ===== 全局工具函数引用 =====
// 这些函数在页面 HTML 中被 onclick 引用，需要暴露到全局

// 性别选择
function selectGender(el, gender) {
  document.querySelectorAll('.gender-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
}

// Chip 选择（单选）
function selectChip(el, selector) {
  var group = el.getAttribute('data-group');
  if (group) {
    document.querySelectorAll(selector + '[data-group="' + group + '"]').forEach(function(c) { c.classList.remove('selected'); });
  } else {
    document.querySelectorAll(selector).forEach(function(c) { c.classList.remove('selected'); });
  }
  el.classList.add('selected');
}

// Chip 选择（多选）
function toggleChip(el) {
  el.classList.toggle('selected');
}

// 健康情况选择
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
    (document.querySelectorAll('#healthGroup .option-chip') || []).forEach(function(c) {
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

// 弹窗控制
function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// ===== 编辑资料弹窗（欢迎页用） =====
function openEditProfileModal() {
  var p = Store.getProfile() || {};
  var m = document.getElementById('editProfileModal');
  if (!m) {
    // 动态创建
    var body = document.body;
    var div = document.createElement('div');
    div.id = 'editProfileModal';
    div.className = 'modal-overlay';
    div.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<div class="modal-title">编辑基本资料</div>' +
          '<button class="modal-close" onclick="closeModal(\'editProfileModal\')">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-row"><div class="form-group"><label class="form-label">昵称</label><input type="text" class="form-input" id="modalNickname"></div></div>' +
          '<div class="form-group"><label class="form-label">性别</label><div class="gender-group">' +
            '<div class="gender-option" onclick="selectGender(this,\'male\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="7" r="5"/><path d="M22 2L14 10"/><path d="M14 2h8v8"/></svg>男</div>' +
            '<div class="gender-option" onclick="selectGender(this,\'female\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="9" r="5"/><path d="M12 14v7"/><path d="M9 18h6"/></svg>女</div>' +
          '</div></div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label class="form-label">年龄</label><div class="input-with-unit"><input type="number" class="form-input" id="modalAge"><span class="input-unit">岁</span></div></div>' +
            '<div class="form-group"><label class="form-label">身高</label><div class="input-with-unit"><input type="number" class="form-input" id="modalHeight"><span class="input-unit">cm</span></div></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label class="form-label">体重</label><div class="input-with-unit"><input type="number" class="form-input" id="modalWeight"><span class="input-unit">kg</span></div></div>' +
            '<div class="form-group"><label class="form-label">健身目标</label><select class="form-input" id="modalGoal">' +
              '<option value="增肌塑形">增肌塑形</option><option value="减脂瘦身">减脂瘦身</option><option value="提升体能">提升体能</option><option value="保持健康">保持健康</option>' +
            '</select></div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="closeModal(\'editProfileModal\')">取消</button>' +
          '<button class="btn-confirm" onclick="confirmEditProfile()">保存</button>' +
        '</div>' +
      '</div>';
    // 点击遮罩关闭
    div.addEventListener('click', function(e) {
      if (e.target === div) closeModal('editProfileModal');
    });
    body.appendChild(div);
    m = div;
  }

  // 填充当前值
  var nn = document.getElementById('modalNickname');
  if (nn) nn.value = p.nickname || '';
  var genOpts = m.querySelectorAll('.gender-option');
  genOpts.forEach(function(o) {
    o.classList.remove('selected');
    var txt = o.textContent.trim();
    if ((txt === '男' && p.gender === 'male') || (txt === '女' && p.gender === 'female')) {
      o.classList.add('selected');
    }
  });
  if (!p.gender && genOpts.length > 0) genOpts[0].classList.add('selected');
  var age = document.getElementById('modalAge');
  if (age) age.value = p.age || '';
  var ht = document.getElementById('modalHeight');
  if (ht) ht.value = p.height || '';
  var wt = document.getElementById('modalWeight');
  if (wt) wt.value = p.weight || '';
  var goal = document.getElementById('modalGoal');
  if (goal) goal.value = p.goal || '增肌塑形';

  m.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function confirmEditProfile() {
  var nn = document.getElementById('modalNickname');
  var genEl = document.querySelector('#editProfileModal .gender-option.selected');
  var age = document.getElementById('modalAge');
  var ht = document.getElementById('modalHeight');
  var wt = document.getElementById('modalWeight');
  var goal = document.getElementById('modalGoal');

  var gender = 'male';
  if (genEl) {
    gender = genEl.textContent.trim() === '女' ? 'female' : 'male';
  }

  var p = Store.getProfile() || {};
  p.nickname = nn ? nn.value || '用户' : '用户';
  p.gender = gender;
  p.age = parseInt(age ? age.value : 0) || 0;
  p.height = parseInt(ht ? ht.value : 0) || 0;
  p.weight = parseInt(wt ? wt.value : 0) || 0;
  p.goal = goal ? goal.value : '增肌塑形';
  Store.saveProfile(p);

  closeModal('editProfileModal');

  // 重新渲染欢迎页
  if (App.currentPage === 'welcome') {
    renderWelcome();
    renderWelcomeProfileGrid(p);
  }
  showToast('资料已保存');
}

// ESC 关闭弹窗
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(function(m) {
      closeModal(m.id);
    });
  }
});

// DOM 准备完毕后初始化
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
