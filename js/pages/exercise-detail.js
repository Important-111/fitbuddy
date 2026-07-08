/* ===== 动作说明页 ===== */

function renderExerciseDetail() {
  document.getElementById('page-exercise-detail').innerHTML =
    '<div class="top-bar">' +
      '<button class="btn-back" onclick="App.navigate(\'daily-workout\')">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="top-bar-title">动作详解</span>' +
    '</div>' +
    '<div class="exercise-hero">&#x1F9CD;</div>' +
    '<div class="exercise-name-section">' +
      '<div class="exercise-main-name">自重深蹲</div>' +
      '<div class="exercise-eng-name">Bodyweight Squat</div>' +
      '<div class="exercise-tags">' +
        '<span class="exercise-tag tag-level">&#x2B50; 初级</span>' +
        '<span class="exercise-tag tag-muscle">下肢训练</span>' +
        '<span class="exercise-tag tag-type">自重训练</span>' +
      '</div>' +
    '</div>' +
    '<div class="info-section">' +
      '<div class="info-title">动作概要</div>' +
      '<div class="info-card">' +
        '<div class="info-row"><span class="info-key">动作目的</span><span class="info-value">增强下肢力量，提升核心稳定</span></div>' +
        '<div class="info-row"><span class="info-key">主要肌群</span><span class="info-value">臀大肌、股四头肌</span></div>' +
        '<div class="info-row"><span class="info-key">辅助肌群</span><span class="info-value">核心肌群、腘绳肌、小腿肌群</span></div>' +
        '<div class="info-row"><span class="info-key">难度等级</span><span class="info-value">&#x2B50; 初级</span></div>' +
        '<div class="info-row"><span class="info-key">适合人群</span><span class="info-value">所有健身水平，特别适合新手</span></div>' +
        '<div class="info-row"><span class="info-key">今日训练量</span><span class="info-value" style="color:var(--primary)">3组 × 12次</span></div>' +
        '<div class="info-row"><span class="info-key">组间休息</span><span class="info-value">60秒</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="info-section">' +
      '<div class="info-title">目标肌群</div>' +
      '<div class="muscle-group">' +
        '<span class="muscle-tag">臀大肌</span>' +
        '<span class="muscle-tag">股四头肌</span>' +
        '<span class="muscle-tag">核心肌群</span>' +
        '<span class="muscle-tag">小腿肌群</span>' +
      '</div>' +
    '</div>' +
    '<div class="info-section">' +
      '<div class="info-title">动作要点</div>' +
      '<div class="info-card">' +
        '<ul class="points-list">' +
          '<li><span class="point-num">1</span>双脚与肩同宽，脚尖略微向外打开约15度</li>' +
          '<li><span class="point-num">2</span>保持背部挺直，核心收紧，胸部上挺</li>' +
          '<li><span class="point-num">3</span>下蹲时臀部向后坐，如同坐椅子，膝盖与脚尖方向一致</li>' +
          '<li><span class="point-num">4</span>下蹲至大腿与地面平行或更低，保持脚跟不离地</li>' +
          '<li><span class="point-num">5</span>用臀部发力推起，回到起始站姿，膝盖微屈不锁死</li>' +
        '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="info-section">' +
      '<div class="info-title">呼吸方式</div>' +
      '<div class="info-card">' +
        '<p style="font-size:13px;color:var(--text-primary);line-height:1.6">&#x1F4AA; <strong>下蹲时</strong>：用鼻子深吸气，感受腹部扩张<br>&#x1F4AA; <strong>站起时</strong>：用嘴巴缓缓呼气，收紧核心</p>' +
      '</div>' +
    '</div>' +
    '<div class="info-section">' +
      '<div class="info-title">常见错误</div>' +
      '<div class="info-card">' +
        '<ul class="points-list caution-list">' +
          '<li><span class="point-num">!</span><strong>膝盖内扣：</strong>下蹲时膝盖向内塌陷，容易伤到膝关节。保持膝盖与脚尖方向一致</li>' +
          '<li><span class="point-num">!</span><strong>弓背弯腰：</strong>背部弯曲导致腰椎压力过大。全程保持背部挺直，核心收紧</li>' +
          '<li><span class="point-num">!</span><strong>脚跟离地：</strong>重心前移导致脚跟抬起。全程保持全脚掌着地</li>' +
          '<li><span class="point-num">!</span><strong>下蹲过浅：</strong>只做半程动作，效果大打折扣。尽量蹲至大腿与地面平行</li>' +
        '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="video-section">' +
      '<div class="info-title">视频教程推荐</div>' +
      '<div class="video-card">' +
        '<span class="video-platform pl-yt">YouTube</span>' +
        '<div class="video-info"><div class="video-title">Bodyweight Squat Tutorial</div><div class="video-desc">How to Do a Perfect Squat</div></div>' +
      '</div>' +
      '<div class="video-card">' +
        '<span class="video-platform pl-bl">B站</span>' +
        '<div class="video-info"><div class="video-title">徒手深蹲教学</div><div class="video-desc">从零开始学会标准深蹲</div></div>' +
      '</div>' +
      '<div class="video-card">' +
        '<span class="video-platform pl-kp">Keep</span>' +
        '<div class="video-info"><div class="video-title">臀腿燃脂课程</div><div class="video-desc">包含深蹲及其他下肢训练</div></div>' +
      '</div>' +
      '<div class="video-card">' +
        '<span class="video-platform pl-xs">小红书</span>' +
        '<div class="video-info"><div class="video-title">女生臀腿训练</div><div class="video-desc">深蹲变式及臀腿训练合集</div></div>' +
      '</div>' +
    '</div>';
}
