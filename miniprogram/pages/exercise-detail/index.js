// 4 个动作数据源
const EXERCISE_DATA = {
  "squat": {
    "name": "自重深蹲",
    "eng": "Bodyweight Squat",
    "emoji": "🧍",
    "level": "⭐ 初级",
    "muscle_label": "下肢训练",
    "type_label": "自重训练",
    "purpose": "增强下肢力量，提升核心稳定",
    "primary_muscle": "臀大肌、股四头肌",
    "secondary_muscle": "核心肌群、腘绳肌、小腿肌群",
    "level_value": "⭐ 初级",
    "fit_for": "所有健身水平，特别适合新手",
    "sets": "3组 × 12次",
    "rest": "60秒",
    "tags": [
      "臀大肌",
      "股四头肌",
      "核心肌群",
      "小腿肌群"
    ],
    "points": [
      "双脚与肩同宽，脚尖略微向外打开约15度",
      "保持背部挺直，核心收紧，胸部上挺",
      "下蹲时臀部向后坐，如同坐椅子，膝盖与脚尖方向一致",
      "下蹲至大腿与地面平行或更低，保持脚跟不离地",
      "用臀部发力推起，回到起始站姿，膝盖微屈不锁死"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "用鼻子深吸气，感受腹部扩张",
    "breath_out": "站起时",
    "breath_out_text": "用嘴巴缓缓呼气，收紧核心",
    "mistakes": [
      [
        "膝盖内扣",
        "下蹲时膝盖向内塌陷，容易伤到膝关节。保持膝盖与脚尖方向一致"
      ],
      [
        "弓背弯腰",
        "背部弯曲导致腰椎压力过大。全程保持背部挺直，核心收紧"
      ],
      [
        "脚跟离地",
        "重心前移导致脚跟抬起。全程保持全脚掌着地"
      ],
      [
        "下蹲过浅",
        "只做半程动作，效果大打折扣。尽量蹲至大腿与地面平行"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Bodyweight Squat Tutorial",
        "How to Do a Perfect Squat"
      ],
      [
        "B站",
        "pl-bl",
        "徒手深蹲教学",
        "从零开始学会标准深蹲"
      ],
      [
        "Keep",
        "pl-kp",
        "臀腿燃脂课程",
        "包含深蹲及其他下肢训练"
      ],
      [
        "小红书",
        "pl-xs",
        "女生臀腿训练",
        "深蹲变式及臀腿训练合集"
      ]
    ]
  },
  "bridge": {
    "name": "臀桥",
    "eng": "Glute Bridge",
    "emoji": "🧎",
    "level": "⭐ 初级",
    "muscle_label": "臀部训练",
    "type_label": "自重训练",
    "purpose": "激活臀大肌，改善臀部形态与下背痛",
    "primary_muscle": "臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐ 初级",
    "fit_for": "久坐人群、臀部松弛者、新手",
    "sets": "3组 × 15次",
    "rest": "45秒",
    "tags": [
      "臀大肌",
      "腘绳肌",
      "核心肌群"
    ],
    "points": [
      "仰卧在瑜伽垫上，双膝弯曲，双脚平放与肩同宽",
      "脚跟靠近臀部，双手平放在身体两侧",
      "收紧核心，脚跟发力将臀部抬离地面",
      "顶部膝盖、髋部、肩膀呈一条直线，臀部主动夹紧",
      "有控制地缓慢下落，避免突然掉落"
    ],
    "breath_in": "上抬时",
    "breath_in_text": "呼气，臀部发力向上推",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "过度挺腰",
        "用腰部代偿发力导致下背痛。顶部应收紧臀部而非腰部"
      ],
      [
        "脚跟离地",
        "抬髋时脚跟离地减弱臀部发力。脚跟全程踩实"
      ],
      [
        "未到顶",
        "臀部抬得不够高，肌肉刺激不足。顶部身体成一条直线"
      ],
      [
        "下落太快",
        "自由落体式下落容易受伤。用 2-3 秒有控制地下落"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Glute Bridge Tutorial",
        "Proper Form & Tips"
      ],
      [
        "B站",
        "pl-bl",
        "臀桥标准动作",
        "臀部激活教学"
      ],
      [
        "Keep",
        "pl-kp",
        "蜜桃臀训练",
        "臀桥及变式"
      ],
      [
        "小红书",
        "pl-xs",
        "臀桥合集",
        "女生臀部训练"
      ]
    ]
  },
  "lunge": {
    "name": "弓步蹲",
    "eng": "Lunge",
    "emoji": "🏃",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢训练",
    "type_label": "自重训练",
    "purpose": "单侧腿部训练，改善不平衡与核心稳定",
    "primary_muscle": "股四头肌、臀大肌",
    "secondary_muscle": "腘绳肌、小腿肌群、核心肌群",
    "level_value": "⭐⭐ 中级",
    "fit_for": "有一定训练基础者，改善左右不平衡",
    "sets": "3组 × 12次（每侧）",
    "rest": "60秒",
    "tags": [
      "股四头肌",
      "臀大肌",
      "核心肌群",
      "腘绳肌"
    ],
    "points": [
      "双脚并拢站立，双手叉腰或自然下垂",
      "一只脚向前迈出一大步（约 60-90 厘米）",
      "前脚膝盖弯曲下蹲，直到前侧大腿与地面平行",
      "后腿膝盖向地面靠近但不触地，保持核心稳定",
      "前脚脚跟发力推回起始位置，左右交替进行"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下降身体",
    "breath_out": "站起时",
    "breath_out_text": "呼气，前脚跟发力推回",
    "mistakes": [
      [
        "前膝超脚尖",
        "前膝超过脚尖增加膝关节压力。前膝应与脚尖保持同一垂直线"
      ],
      [
        "前膝内扣",
        "膝盖向内塌陷损伤膝关节。膝盖应正对脚尖方向"
      ],
      [
        "步幅过小",
        "步子太小变成蹲起而非弓步。步幅约 60-90 厘米"
      ],
      [
        "上身前倾",
        "上身过度前倾减少臀部发力。保持上身直立，核心收紧"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Lunge Tutorial",
        "How to Do Lunges Correctly"
      ],
      [
        "B站",
        "pl-bl",
        "弓步蹲教学",
        "标准动作讲解"
      ],
      [
        "Keep",
        "pl-kp",
        "单腿训练",
        "弓步蹲及变式"
      ],
      [
        "小红书",
        "pl-xs",
        "弓步蹲合集",
        "腿部线条训练"
      ]
    ]
  },
  "side-leg": {
    "name": "侧卧抬腿",
    "eng": "Side Lying Leg Raise",
    "emoji": "🛌",
    "level": "⭐ 初级",
    "muscle_label": "臀部训练",
    "type_label": "自重训练",
    "purpose": "训练臀中肌，改善髋部稳定性与臀部侧方线条",
    "primary_muscle": "臀中肌",
    "secondary_muscle": "臀小肌、阔筋膜张肌",
    "level_value": "⭐ 初级",
    "fit_for": "所有水平，改善臀部侧方凹陷、跑步膝痛人群",
    "sets": "3组 × 15次（每侧）",
    "rest": "30秒",
    "tags": [
      "臀中肌",
      "臀小肌",
      "阔筋膜张肌"
    ],
    "points": [
      "侧卧在瑜伽垫上，下方手臂垫在头下，身体成一条直线",
      "双腿伸直并拢，上方腿放在下方腿上",
      "收紧腹部，避免身体前后晃动",
      "上方腿缓慢向上抬起约 45 度，脚尖朝前或微微朝下",
      "在最高点稍作停顿，缓慢下落但不与下方腿接触"
    ],
    "breath_in": "上抬时",
    "breath_in_text": "呼气，臀部外侧发力向上抬",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "抬腿过高",
        "超过 45 度会代偿腰部和骨盆。控制动作幅度，重点在臀中肌发力"
      ],
      [
        "脚尖朝上",
        "脚尖朝上训练的是股四头肌而非臀中肌。脚尖朝前或微朝下"
      ],
      [
        "身体前后晃",
        "骨盆不稳导致代偿。保持身体稳定，可弯曲下方膝盖增加支撑"
      ],
      [
        "下落太快",
        "自由落体式下落效果减半。用 2-3 秒有控制地下落"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Side Lying Leg Raise",
        "Gluteus Medius Activation"
      ],
      [
        "B站",
        "pl-bl",
        "侧卧抬腿教学",
        "臀中肌训练"
      ],
      [
        "Keep",
        "pl-kp",
        "臀部侧方训练",
        "臀中肌激活"
      ],
      [
        "小红书",
        "pl-xs",
        "侧臀塌陷改善",
        "臀中肌专项"
      ]
    ]
  },
  "jumping-jack": {
    "name": "开合跳",
    "eng": "Jumping Jack",
    "emoji": "🤸",
    "level": "⭐ 初级",
    "muscle_label": "全身燃脂",
    "type_label": "有氧训练",
    "purpose": "快速提升心率，全身燃脂热身",
    "primary_muscle": "心肺系统",
    "secondary_muscle": "肩部、小腿、核心肌群",
    "level_value": "⭐ 初级",
    "fit_for": "所有水平，特别适合热身与燃脂",
    "sets": "3组 × 30秒",
    "rest": "15秒",
    "tags": ["心肺", "肩部", "小腿", "核心"],
    "points": [
      "双脚并拢站立，双手自然下垂放在身体两侧",
      "双脚向外跳开约肩宽，同时双手从两侧向上举过头顶",
      "落地时前脚掌着地，膝盖微屈缓冲",
      "立刻跳回起始位置，双手放下",
      "保持稳定节奏，呼吸均匀不要憋气"
    ],
    "breath_in": "跳开时",
    "breath_in_text": "吸气，配合手脚打开",
    "breath_out": "跳回时",
    "breath_out_text": "呼气，回到起始位置",
    "mistakes": [
      ["落地过重", "全脚掌或脚跟着地冲击大。前脚掌着地，膝盖微屈缓冲"],
      ["手臂未过头", "手臂举到肩膀高度燃脂效果减半。双手过头顶完整画弧"],
      ["节奏过快", "为求快导致动作变形。保持中等节奏，动作完整优先"],
      ["憋气", "紧张时容易憋气。保持自然呼吸节奏"]
    ],
    "videos": [
      ["YouTube", "pl-yt", "Jumping Jack Tutorial", "Proper Form for Cardio"],
      ["B站", "pl-bl", "开合跳教学", "热身燃脂入门"],
      ["Keep", "pl-kp", "燃脂热身", "开合跳组合训练"],
      ["小红书", "pl-xs", "居家燃脂", "开合跳合集"]
    ]
  },
  "high-knees": {
    "name": "高抬腿",
    "eng": "High Knees",
    "emoji": "🏃",
    "level": "⭐ 初级",
    "muscle_label": "核心+下肢",
    "type_label": "有氧训练",
    "purpose": "提升心肺与下肢爆发力，核心稳定",
    "primary_muscle": "髂腰肌、腹直肌",
    "secondary_muscle": "股四头肌、小腿、心肺",
    "level_value": "⭐ 初级",
    "fit_for": "所有水平，提升心肺与下肢力量",
    "sets": "3组 × 30秒",
    "rest": "15秒",
    "tags": ["核心", "股四头肌", "小腿", "心肺"],
    "points": [
      "双脚并拢站立，双手放在身体两侧或叉腰",
      "原地交替抬腿，膝盖尽量抬高至髋部高度",
      "前脚掌着地，快速切换左右腿",
      "手臂自然摆动配合腿部节奏",
      "保持核心收紧，上身略微前倾"
    ],
    "breath_in": "抬腿时",
    "breath_in_text": "均匀呼吸，配合抬腿节奏",
    "breath_out": "落地时",
    "breath_out_text": "保持稳定节奏，不要憋气",
    "mistakes": [
      ["膝盖抬得过低", "未到髋部高度效果减半。尽量抬高至髋部水平"],
      ["脚跟着地", "脚跟着地冲击大且慢。前脚掌着地快速切换"],
      ["后仰", "上身向后倾斜减少核心发力。保持上身略前倾，核心收紧"],
      ["节奏混乱", "忽快忽慢容易疲劳。保持稳定的中等节奏"]
    ],
    "videos": [
      ["YouTube", "pl-yt", "High Knees Tutorial", "Cardio Form Guide"],
      ["B站", "pl-bl", "高抬腿教学", "核心燃脂训练"],
      ["Keep", "pl-kp", "HIIT 燃脂", "高抬腿组合"],
      ["小红书", "pl-xs", "居家有氧", "高抬腿合集"]
    ]
  },
  "jump-squat": {
    "name": "深蹲跳",
    "eng": "Jump Squat",
    "emoji": "🦘",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢爆发力",
    "type_label": "增强式训练",
    "purpose": "下肢爆发力训练，大量消耗热量",
    "primary_muscle": "股四头肌、臀大肌",
    "secondary_muscle": "小腿、核心肌群",
    "level_value": "⭐⭐ 中级",
    "fit_for": "有深蹲基础者，提升爆发力与燃脂",
    "sets": "3组 × 12次",
    "rest": "30秒",
    "tags": ["股四头肌", "臀大肌", "小腿", "核心"],
    "points": [
      "双脚与肩同宽，脚尖略微外展 15 度",
      "下蹲至大腿与地面平行，保持背部挺直",
      "从底部用爆发力蹬地跳起，尽量向上跳高",
      "落地时前脚掌着地，膝盖微屈缓冲，立刻进入下一次下蹲",
      "保持节奏稳定，避免膝盖内扣"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下蹲",
    "breath_out": "跳起时",
    "breath_out_text": "呼气，爆发力向上跳起",
    "mistakes": [
      ["落地过重", "全脚掌或伸直膝盖着地冲击大。前脚掌着地，膝盖微屈缓冲"],
      ["膝盖内扣", "起跳或落地时膝盖向内塌陷。膝盖始终对齐脚尖方向"],
      ["跳得过高失去控制", "盲目求高度导致落地不稳。中等高度优先保证动作标准"],
      ["背部弯曲", "下蹲或起跳时弓背。全程保持背部挺直，核心收紧"]
    ],
    "videos": [
      ["YouTube", "pl-yt", "Jump Squat Tutorial", "Plyometric Form"],
      ["B站", "pl-bl", "深蹲跳教学", "爆发力训练"],
      ["Keep", "pl-kp", "HIIT 燃脂", "深蹲跳组合"],
      ["小红书", "pl-xs", "燃脂动作", "深蹲跳合集"]
    ]
  },
  "mountain-climber": {
    "name": "登山跑",
    "eng": "Mountain Climber",
    "emoji": "🏔️",
    "level": "⭐⭐ 中级",
    "muscle_label": "核心+全身",
    "type_label": "有氧+核心",
    "purpose": "核心稳定与全身燃脂的综合动作",
    "primary_muscle": "腹直肌、腹横肌",
    "secondary_muscle": "肩部、股四头肌、心肺",
    "level_value": "⭐⭐ 中级",
    "fit_for": "有基础者，提升核心稳定与心肺",
    "sets": "3组 × 30秒",
    "rest": "15秒",
    "tags": ["核心", "腹直肌", "肩部", "心肺"],
    "points": [
      "从俯卧撑姿势开始，双手撑地与肩同宽，手臂伸直",
      "身体从头到脚成一条直线，核心收紧不塌腰",
      "右膝向胸部靠拢，然后迅速伸回起始位置",
      "立刻换左膝向胸部靠拢，左右交替如跑步",
      "保持上身稳定，呼吸均匀不要憋气"
    ],
    "breath_in": "伸腿时",
    "breath_in_text": "吸气，配合腿部伸展",
    "breath_out": "收腿时",
    "breath_out_text": "呼气，膝盖向胸部靠拢",
    "mistakes": [
      ["塌腰", "腰部下沉导致腰椎压力。核心收紧，身体保持一条直线"],
      ["臀部过高", "臀部翘起减少核心发力。臀部与身体齐平"],
      ["手肘外翻", "手肘向外翻影响稳定。手肘微向内夹，肩膀在手腕正上方"],
      ["节奏过快失去控制", "盲目求快动作变形。保持中等节奏，动作完整优先"]
    ],
    "videos": [
      ["YouTube", "pl-yt", "Mountain Climber Form", "Core + Cardio"],
      ["B站", "pl-bl", "登山跑教学", "核心燃脂训练"],
      ["Keep", "pl-kp", "HIIT 核心", "登山跑组合"],
      ["小红书", "pl-xs", "核心训练", "登山跑合集"]
    ]
  }
};

function findExercise(exId) {
  return EXERCISE_DATA[exId] || EXERCISE_DATA['squat'];
}

Page({
  data: {
    exId: '',
    exerciseName: '',
    exerciseEng: '',
    exerciseEmoji: '',
    levelLabel: '',
    muscleLabel: '',
    typeLabel: '',
    infoRows: [],
    muscleTags: [],
    steps: [],
    cautions: [],
    videos: [],
    breath: '',
    breathSteps: []
  },

  onLoad(options) {
    const exId = options && options.id ? options.id : 'squat';
    this.renderExercise(exId);
  },

  renderExercise(exId) {
    const d = findExercise(exId);
    this.setData({
      exId: exId,
      exerciseName: d.name,
      exerciseEng: d.eng,
      exerciseEmoji: d.emoji,
      levelLabel: d.level,
      muscleLabel: d.muscle_label,
      typeLabel: d.type_label,
      infoRows: [
        { key: '动作目的', value: d.purpose },
        { key: '主要肌群', value: d.primary_muscle },
        { key: '辅助肌群', value: d.secondary_muscle },
        { key: '难度等级', value: d.level_value },
        { key: '适合人群', value: d.fit_for },
        { key: '今日训练量', value: d.sets, highlight: true },
        { key: '组间休息', value: d.rest }
      ],
      muscleTags: d.tags,
      steps: d.points.map(function(text, idx) { return { num: idx + 1, text: text }; }),
      breath: '💪 ' + d.breath_in + '：' + d.breath_in_text + '\n' + '💪 ' + d.breath_out + '：' + d.breath_out_text,
      breathSteps: [
        { phase: d.breath_in, text: d.breath_in_text },
        { phase: d.breath_out, text: d.breath_out_text }
      ],
      cautions: d.mistakes.map(function(m) { return { title: m[0], text: m[1] }; }),
      videos: d.videos.map(function(v) { return { platform: v[0], platformClass: v[1], title: v[2], desc: v[3] }; })
    });
  }
});
