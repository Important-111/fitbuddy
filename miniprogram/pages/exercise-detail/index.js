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
    "tags": [
      "心肺",
      "肩部",
      "小腿",
      "核心"
    ],
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
      [
        "落地过重",
        "全脚掌或脚跟着地冲击大。前脚掌着地，膝盖微屈缓冲"
      ],
      [
        "手臂未过头",
        "手臂举到肩膀高度燃脂效果减半。双手过头顶完整画弧"
      ],
      [
        "节奏过快",
        "为求快导致动作变形。保持中等节奏，动作完整优先"
      ],
      [
        "憋气",
        "紧张时容易憋气。保持自然呼吸节奏"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Jumping Jack Tutorial",
        "Proper Form for Cardio"
      ],
      [
        "B站",
        "pl-bl",
        "开合跳教学",
        "热身燃脂入门"
      ],
      [
        "Keep",
        "pl-kp",
        "燃脂热身",
        "开合跳组合训练"
      ],
      [
        "小红书",
        "pl-xs",
        "居家燃脂",
        "开合跳合集"
      ]
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
    "tags": [
      "核心",
      "股四头肌",
      "小腿",
      "心肺"
    ],
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
      [
        "膝盖抬得过低",
        "未到髋部高度效果减半。尽量抬高至髋部水平"
      ],
      [
        "脚跟着地",
        "脚跟着地冲击大且慢。前脚掌着地快速切换"
      ],
      [
        "后仰",
        "上身向后倾斜减少核心发力。保持上身略前倾，核心收紧"
      ],
      [
        "节奏混乱",
        "忽快忽慢容易疲劳。保持稳定的中等节奏"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "High Knees Tutorial",
        "Cardio Form Guide"
      ],
      [
        "B站",
        "pl-bl",
        "高抬腿教学",
        "核心燃脂训练"
      ],
      [
        "Keep",
        "pl-kp",
        "HIIT 燃脂",
        "高抬腿组合"
      ],
      [
        "小红书",
        "pl-xs",
        "居家有氧",
        "高抬腿合集"
      ]
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
    "tags": [
      "股四头肌",
      "臀大肌",
      "小腿",
      "核心"
    ],
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
      [
        "落地过重",
        "全脚掌或伸直膝盖着地冲击大。前脚掌着地，膝盖微屈缓冲"
      ],
      [
        "膝盖内扣",
        "起跳或落地时膝盖向内塌陷。膝盖始终对齐脚尖方向"
      ],
      [
        "跳得过高失去控制",
        "盲目求高度导致落地不稳。中等高度优先保证动作标准"
      ],
      [
        "背部弯曲",
        "下蹲或起跳时弓背。全程保持背部挺直，核心收紧"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Jump Squat Tutorial",
        "Plyometric Form"
      ],
      [
        "B站",
        "pl-bl",
        "深蹲跳教学",
        "爆发力训练"
      ],
      [
        "Keep",
        "pl-kp",
        "HIIT 燃脂",
        "深蹲跳组合"
      ],
      [
        "小红书",
        "pl-xs",
        "燃脂动作",
        "深蹲跳合集"
      ]
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
    "tags": [
      "核心",
      "腹直肌",
      "肩部",
      "心肺"
    ],
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
      [
        "塌腰",
        "腰部下沉导致腰椎压力。核心收紧，身体保持一条直线"
      ],
      [
        "臀部过高",
        "臀部翘起减少核心发力。臀部与身体齐平"
      ],
      [
        "手肘外翻",
        "手肘向外翻影响稳定。手肘微向内夹，肩膀在手腕正上方"
      ],
      [
        "节奏过快失去控制",
        "盲目求快动作变形。保持中等节奏，动作完整优先"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Mountain Climber Form",
        "Core + Cardio"
      ],
      [
        "B站",
        "pl-bl",
        "登山跑教学",
        "核心燃脂训练"
      ],
      [
        "Keep",
        "pl-kp",
        "HIIT 核心",
        "登山跑组合"
      ],
      [
        "小红书",
        "pl-xs",
        "核心训练",
        "登山跑合集"
      ]
    ]
  },
  "wall-sit": {
    "name": "靠墙静蹲",
    "eng": "Wall Sit",
    "emoji": "🧱",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢训练",
    "type_label": "静力训练",
    "purpose": "静态强化股四头肌与耐力，保护膝关节",
    "primary_muscle": "股四头肌",
    "secondary_muscle": "臀大肌、小腿肌群、核心肌群",
    "level_value": "⭐⭐ 中级",
    "fit_for": "想提升腿部耐力、康复护膝人群",
    "sets": "3组 × 45秒",
    "rest": "45秒",
    "tags": [
      "股四头肌",
      "臀大肌",
      "耐力"
    ],
    "points": [
      "背靠墙站立，双脚向前迈出约一步距离",
      "缓慢下蹲至大腿与地面平行，膝盖弯曲约 90 度",
      "膝盖不超过脚尖，全脚掌着地",
      "背部紧贴墙面，核心收紧保持身体稳定",
      "保持呼吸均匀，坚持目标时长后缓慢站起"
    ],
    "breath_in": "保持时",
    "breath_in_text": "均匀深呼吸，避免憋气",
    "breath_out": "站起时",
    "breath_out_text": "呼气，缓慢推墙站起",
    "mistakes": [
      [
        "膝盖超脚尖",
        "增加膝关节压力。调整脚的位置向前移"
      ],
      [
        "大腿高于平行",
        "刺激不足。尽量蹲至大腿与地面平行"
      ],
      [
        "背部离墙",
        "失去支撑效果。整个背部全程贴墙"
      ],
      [
        "憋气",
        "血压升高。保持自然均匀呼吸"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Wall Sit Tutorial",
        "Proper Form Guide"
      ],
      [
        "B站",
        "pl-bl",
        "靠墙静蹲教学",
        "护膝必练动作"
      ],
      [
        "Keep",
        "pl-kp",
        "腿部耐力课程",
        "靠墙静蹲专项"
      ],
      [
        "小红书",
        "pl-xs",
        "护膝训练",
        "康复静蹲合集"
      ]
    ]
  },
  "bulgarian-split": {
    "name": "保加利亚分腿蹲",
    "eng": "Bulgarian Split Squat",
    "emoji": "🦵",
    "level": "⭐⭐⭐ 高级",
    "muscle_label": "下肢训练",
    "type_label": "自重训练",
    "purpose": "单腿力量与平衡，深度刺激臀腿",
    "primary_muscle": "股四头肌、臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐⭐⭐ 高级",
    "fit_for": "中高阶训练者，改善左右不平衡",
    "sets": "3组 × 10次（每侧）",
    "rest": "60秒",
    "tags": [
      "股四头肌",
      "臀大肌",
      "核心肌群",
      "平衡"
    ],
    "points": [
      "背对健身凳（或沙发）站立，后脚脚背搭在凳面上",
      "前脚向前迈一步，调整距离使下蹲时前膝呈 90 度",
      "核心收紧，保持上身直立，双手叉腰或持哑铃",
      "下蹲至前侧大腿与地面平行，后膝向地面靠近",
      "前脚脚跟发力推起，回到起始位置"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下降",
    "breath_out": "站起时",
    "breath_out_text": "呼气，前脚跟发力推起",
    "mistakes": [
      [
        "前膝超脚尖",
        "增加膝关节压力。调整前脚位置向前"
      ],
      [
        "步幅不当",
        "太近变蹲起，太远拉伸过大。下蹲时前膝 90 度"
      ],
      [
        "上身前倾",
        "减少臀部发力。保持上身直立"
      ],
      [
        "后腿借力",
        "减少前腿刺激。重心放在前脚"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Bulgarian Split Squat",
        "Form Tutorial"
      ],
      [
        "B站",
        "pl-bl",
        "保加利亚分腿蹲",
        "单腿训练讲解"
      ],
      [
        "Keep",
        "pl-kp",
        "下肢进阶",
        "保加利亚蹲课程"
      ],
      [
        "小红书",
        "pl-xs",
        "翘臀不粗腿",
        "保加利亚蹲合集"
      ]
    ]
  },
  "sumo-squat": {
    "name": "相扑深蹲",
    "eng": "Sumo Squat",
    "emoji": "🧘",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢训练",
    "type_label": "自重训练",
    "purpose": "强化大腿内侧与臀部，改善内收肌力量",
    "primary_muscle": "股四头肌、内收肌",
    "secondary_muscle": "臀大肌、腘绳肌",
    "level_value": "⭐⭐ 中级",
    "fit_for": "想改善大腿内侧松弛、塑形腿部",
    "sets": "3组 × 15次",
    "rest": "45秒",
    "tags": [
      "内收肌",
      "股四头肌",
      "臀大肌"
    ],
    "points": [
      "双脚站立，间距约两倍肩宽，脚尖向外 45 度",
      "保持背部挺直，核心收紧",
      "下蹲时膝盖沿脚尖方向打开，臀部垂直下降",
      "蹲至大腿与地面平行，膝盖不超脚尖",
      "脚跟发力推起，回到起始位置"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下蹲",
    "breath_out": "站起时",
    "breath_out_text": "呼气，脚跟发力推起",
    "mistakes": [
      [
        "膝盖内扣",
        "增加膝关节压力。膝盖必须沿脚尖方向打开"
      ],
      [
        "步幅太窄",
        "刺激不足。步幅约两倍肩宽"
      ],
      [
        "弓背",
        "腰部代偿。保持背部挺直"
      ],
      [
        "下蹲过浅",
        "内收肌刺激不足。尽量蹲至大腿平行"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Sumo Squat Tutorial",
        "Inner Thigh Focus"
      ],
      [
        "B站",
        "pl-bl",
        "相扑深蹲",
        "大腿内侧训练"
      ],
      [
        "Keep",
        "pl-kp",
        "腿部塑形",
        "相扑蹲课程"
      ],
      [
        "小红书",
        "pl-xs",
        "大腿内侧",
        "女生塑形合集"
      ]
    ]
  },
  "single-leg-bridge": {
    "name": "单腿臀桥",
    "eng": "Single-Leg Glute Bridge",
    "emoji": "🦵",
    "level": "⭐⭐ 中级",
    "muscle_label": "臀部训练",
    "type_label": "自重训练",
    "purpose": "单侧臀部激活，改善左右不平衡",
    "primary_muscle": "臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐⭐ 中级",
    "fit_for": "想深度刺激臀部、改善左右不平衡",
    "sets": "3组 × 12次（每侧）",
    "rest": "45秒",
    "tags": [
      "臀大肌",
      "腘绳肌",
      "核心肌群"
    ],
    "points": [
      "仰卧在瑜伽垫上，双膝弯曲，双脚平放",
      "将一条腿伸直抬起，离开地面",
      "另一条腿脚跟发力，将臀部抬离地面",
      "顶部膝盖、髋部、肩膀呈一条直线，臀部夹紧",
      "有控制地下落，完成一侧后换边"
    ],
    "breath_in": "上抬时",
    "breath_in_text": "呼气，臀部发力向上推",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "骨盆倾斜",
        "一侧臀部力量不足导致骨盆歪斜。保持骨盆水平"
      ],
      [
        "伸直腿下垂",
        "未保持张力。伸直腿与支撑腿大腿保持平行"
      ],
      [
        "过度挺腰",
        "腰部代偿。顶部收紧臀部而非腰部"
      ],
      [
        "下落太快",
        "刺激不足。用 2-3 秒有控制地下落"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Single-Leg Glute Bridge",
        "Form & Tips"
      ],
      [
        "B站",
        "pl-bl",
        "单腿臀桥",
        "进阶臀部训练"
      ],
      [
        "Keep",
        "pl-kp",
        "臀部进阶",
        "单腿臀桥课程"
      ],
      [
        "小红书",
        "pl-xs",
        "翘臀进阶",
        "单腿臀桥合集"
      ]
    ]
  },
  "clamshell": {
    "name": "蚌式开合",
    "eng": "Clamshell",
    "emoji": "🐚",
    "level": "⭐ 初级",
    "muscle_label": "臀部训练",
    "type_label": "自重训练",
    "purpose": "激活臀中肌，改善髋部稳定性",
    "primary_muscle": "臀中肌",
    "secondary_muscle": "臀小肌",
    "level_value": "⭐ 初级",
    "fit_for": "新手、臀中肌薄弱、跑步膝痛人群",
    "sets": "3组 × 15次（每侧）",
    "rest": "30秒",
    "tags": [
      "臀中肌",
      "臀小肌",
      "激活"
    ],
    "points": [
      "侧卧在瑜伽垫上，双膝弯曲约 90 度",
      "双脚并拢，下方手臂垫在头下",
      "保持脚并拢，上方膝盖向上打开如蚌壳",
      "顶部稍作停顿，感受臀外侧发力",
      "有控制地下落，完成一侧后换边"
    ],
    "breath_in": "开合时",
    "breath_in_text": "呼气，臀外侧发力打开",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "骨盆后倾",
        "代偿臀中肌发力。保持骨盆稳定不晃动"
      ],
      [
        "开合幅度过大",
        "腰椎代偿。打开到自然最大幅度即可"
      ],
      [
        "脚分离",
        "减少臀中肌刺激。双脚并拢"
      ],
      [
        "速度太快",
        "靠惯性。用 2 秒打开，2 秒下落"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Clamshell Exercise",
        "Gluteus Medius"
      ],
      [
        "B站",
        "pl-bl",
        "蚌式开合",
        "臀中肌激活"
      ],
      [
        "Keep",
        "pl-kp",
        "臀部激活",
        "蚌式专项"
      ],
      [
        "小红书",
        "pl-xs",
        "臀中肌训练",
        "蚌式合集"
      ]
    ]
  },
  "kneeling-kickback": {
    "name": "跪姿后踢腿",
    "eng": "Kneeling Kickback",
    "emoji": "🧎",
    "level": "⭐ 初级",
    "muscle_label": "臀部训练",
    "type_label": "自重训练",
    "purpose": "孤立臀大肌，改善臀部形态",
    "primary_muscle": "臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐ 初级",
    "fit_for": "新手、想翘臀不粗腿",
    "sets": "3组 × 15次（每侧）",
    "rest": "30秒",
    "tags": [
      "臀大肌",
      "腘绳肌"
    ],
    "points": [
      "四足跪姿，双手撑地，肩膀在手腕正上方",
      "双膝在髋部正下方，背部保持平直",
      "一条腿屈膝 90 度，脚跟向上踢起",
      "顶部感受臀大肌收缩，膝盖保持弯曲",
      "有控制地下落，完成一侧后换边"
    ],
    "breath_in": "上踢时",
    "breath_in_text": "呼气，臀部发力向上踢",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "腰部下塌",
        "腰椎代偿。保持核心收紧，背部平直"
      ],
      [
        "腿伸直",
        "变成腘绳肌发力。膝盖保持 90 度弯曲"
      ],
      [
        "速度太快",
        "靠惯性。用 2 秒上踢，2 秒下落"
      ],
      [
        "脚跟不向上",
        "刺激不足。脚跟正对天花板"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Donkey Kick Tutorial",
        "Glute Isolation"
      ],
      [
        "B站",
        "pl-bl",
        "跪姿后踢腿",
        "翘臀必练"
      ],
      [
        "Keep",
        "pl-kp",
        "臀部孤立",
        "后踢腿课程"
      ],
      [
        "小红书",
        "pl-xs",
        "翘臀不粗腿",
        "后踢腿合集"
      ]
    ]
  },
  "barbell-bridge": {
    "name": "负重臀桥",
    "eng": "Barbell Glute Bridge",
    "emoji": "🏋️",
    "level": "⭐⭐⭐ 高级",
    "muscle_label": "臀部训练",
    "type_label": "负重训练",
    "purpose": "进阶强化臀大肌，提升臀部力量",
    "primary_muscle": "臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐⭐⭐ 高级",
    "fit_for": "中高阶训练者，想加大臀部负荷",
    "sets": "4组 × 10次",
    "rest": "60秒",
    "tags": [
      "臀大肌",
      "腘绳肌",
      "负重"
    ],
    "points": [
      "仰卧在瑜伽垫上，杠铃横跨髋部（可垫毛巾）",
      "双手正握杠铃杆，双膝弯曲，双脚平放与肩同宽",
      "脚跟发力将杠铃推起，臀部抬离地面",
      "顶部膝盖、髋部、肩膀呈一条直线",
      "有控制地下落，避免突然掉落"
    ],
    "breath_in": "上抬时",
    "breath_in_text": "呼气，臀部发力推起",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "过度挺腰",
        "腰部代偿。顶部收紧臀部而非腰部"
      ],
      [
        "杠铃位置不当",
        "压迫关节。调整至髋骨凹陷处"
      ],
      [
        "脚跟离地",
        "减弱臀部发力。脚跟全程踩实"
      ],
      [
        "下落太快",
        "失去张力。用 2-3 秒有控制地下落"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Barbell Glute Bridge",
        "Form Tutorial"
      ],
      [
        "B站",
        "pl-bl",
        "负重臀桥",
        "进阶臀部训练"
      ],
      [
        "Keep",
        "pl-kp",
        "臀部力量",
        "负重臀桥课程"
      ],
      [
        "小红书",
        "pl-xs",
        "翘臀进阶",
        "负重臀桥合集"
      ]
    ]
  },
  "reverse-lunge": {
    "name": "后撤弓步",
    "eng": "Reverse Lunge",
    "emoji": "🚶",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢训练",
    "type_label": "自重训练",
    "purpose": "减少膝盖压力，深度刺激臀腿",
    "primary_muscle": "股四头肌、臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐⭐ 中级",
    "fit_for": "膝盖不适人群、想减低膝关节压力",
    "sets": "3组 × 12次（每侧）",
    "rest": "45秒",
    "tags": [
      "股四头肌",
      "臀大肌",
      "核心肌群"
    ],
    "points": [
      "双脚并拢站立，双手叉腰",
      "一只脚向后迈出一大步",
      "后脚前脚掌着地，后膝向地面下蹲",
      "前侧大腿与地面平行，膝盖呈 90 度",
      "前脚脚跟发力推回起始位置，左右交替"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下降",
    "breath_out": "站起时",
    "breath_out_text": "呼气，前脚跟发力推回",
    "mistakes": [
      [
        "前膝超脚尖",
        "增加膝关节压力。前膝与脚尖垂直"
      ],
      [
        "步幅太小",
        "变成蹲起。后脚向后迈一大步"
      ],
      [
        "上身前倾",
        "减少臀部发力。保持上身直立"
      ],
      [
        "后膝触地",
        "冲击力大。后膝向地面靠近但不触地"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Reverse Lunge Tutorial",
        "Knee-Friendly"
      ],
      [
        "B站",
        "pl-bl",
        "后撤弓步",
        "护膝下肢训练"
      ],
      [
        "Keep",
        "pl-kp",
        "下肢训练",
        "后撤弓步课程"
      ],
      [
        "小红书",
        "pl-xs",
        "弓步变式",
        "后撤弓步合集"
      ]
    ]
  },
  "side-lunge": {
    "name": "侧弓步",
    "eng": "Side Lunge",
    "emoji": "↔️",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢训练",
    "type_label": "自重训练",
    "purpose": "训练大腿内侧与单侧臀部",
    "primary_muscle": "股四头肌、内收肌",
    "secondary_muscle": "臀中肌、腘绳肌",
    "level_value": "⭐⭐ 中级",
    "fit_for": "想改善大腿内侧、提升侧向稳定",
    "sets": "3组 × 12次（每侧）",
    "rest": "45秒",
    "tags": [
      "内收肌",
      "股四头肌",
      "臀中肌"
    ],
    "points": [
      "双脚并拢站立，双手叉腰或胸前合十",
      "一只脚向侧方迈出一大步",
      "迈出腿膝盖弯曲下蹲，另一条腿保持伸直",
      "下蹲至大腿与地面平行，膝盖沿脚尖方向",
      "迈出腿脚跟发力推回起始位置，左右交替"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下蹲",
    "breath_out": "站起时",
    "breath_out_text": "呼气，脚跟发力推回",
    "mistakes": [
      [
        "伸直腿弯膝",
        "失去拉伸效果。另一条腿保持伸直"
      ],
      [
        "迈出腿膝盖内扣",
        "损伤膝关节。膝盖沿脚尖方向"
      ],
      [
        "步幅太小",
        "刺激不足。向侧方迈一大步"
      ],
      [
        "上身过度前倾",
        "减少内侧刺激。保持上身直立"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Side Lunge Tutorial",
        "Inner Thigh"
      ],
      [
        "B站",
        "pl-bl",
        "侧弓步",
        "腿部多角度训练"
      ],
      [
        "Keep",
        "pl-kp",
        "腿部训练",
        "侧弓步课程"
      ],
      [
        "小红书",
        "pl-xs",
        "大腿内侧",
        "侧弓步合集"
      ]
    ]
  },
  "walking-lunge": {
    "name": "行走弓步",
    "eng": "Walking Lunge",
    "emoji": "🚶",
    "level": "⭐⭐ 中级",
    "muscle_label": "下肢训练",
    "type_label": "功能性训练",
    "purpose": "动态训练下肢，提升平衡与协调",
    "primary_muscle": "股四头肌、臀大肌",
    "secondary_muscle": "腘绳肌、核心肌群",
    "level_value": "⭐⭐ 中级",
    "fit_for": "想提升下肢功能性、协调性",
    "sets": "3组 × 12次（每侧）",
    "rest": "60秒",
    "tags": [
      "股四头肌",
      "臀大肌",
      "平衡"
    ],
    "points": [
      "双脚并拢站立，双手叉腰或自然下垂",
      "一只脚向前迈出一大步",
      "下蹲至前侧大腿与地面平行，后膝靠近地面",
      "前脚脚跟发力站起的同时，后脚向前迈出下一步",
      "连续向前行走，左右交替"
    ],
    "breath_in": "下蹲时",
    "breath_in_text": "吸气，有控制地下降",
    "breath_out": "站起时",
    "breath_out_text": "呼气，前脚跟发力推起",
    "mistakes": [
      [
        "步幅太小",
        "失去弓步效果。每步约 60-90 厘米"
      ],
      [
        "前膝超脚尖",
        "增加膝关节压力。前膝与脚尖垂直"
      ],
      [
        "核心不稳",
        "左右晃动。收紧核心保持稳定"
      ],
      [
        "后膝触地",
        "冲击力大。后膝靠近但不触地"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Walking Lunge",
        "Proper Form"
      ],
      [
        "B站",
        "pl-bl",
        "行走弓步",
        "功能性训练"
      ],
      [
        "Keep",
        "pl-kp",
        "下肢动态",
        "行走弓步课程"
      ],
      [
        "小红书",
        "pl-xs",
        "燃脂腿部",
        "行走弓步合集"
      ]
    ]
  },
  "jump-lunge": {
    "name": "跳跃弓步",
    "eng": "Jump Lunge",
    "emoji": "💥",
    "level": "⭐⭐⭐ 高级",
    "muscle_label": "下肢训练",
    "type_label": "爆发力训练",
    "purpose": "爆发力训练，提升下肢功率与心肺",
    "primary_muscle": "股四头肌、臀大肌",
    "secondary_muscle": "小腿肌群、核心肌群",
    "level_value": "⭐⭐⭐ 高级",
    "fit_for": "中高阶训练者，想挑战爆发力",
    "sets": "3组 × 10次（每侧）",
    "rest": "60秒",
    "tags": [
      "股四头肌",
      "臀大肌",
      "爆发力",
      "心肺"
    ],
    "points": [
      "起始弓步姿势，前脚弯曲 90 度，后脚伸直",
      "核心收紧，准备爆发力跳跃",
      "双脚蹬地起跳，空中交换前后腿位置",
      "落地时屈膝缓冲，回到弓步姿势",
      "连续交替跳跃，保持节奏稳定"
    ],
    "breath_in": "下蹲准备时",
    "breath_in_text": "吸气，蓄力准备",
    "breath_out": "跳起时",
    "breath_out_text": "呼气，爆发力向上跳",
    "mistakes": [
      [
        "落地膝盖锁死",
        "增加冲击。落地必须屈膝缓冲"
      ],
      [
        "跳跃幅度小",
        "失去爆发力意义。尽量向上跳"
      ],
      [
        "核心不稳",
        "空中姿势变形。收紧核心"
      ],
      [
        "节奏过快",
        "容易失去平衡。每次落地稳定后再起跳"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Jump Lunge Tutorial",
        "Plyometric"
      ],
      [
        "B站",
        "pl-bl",
        "跳跃弓步",
        "HIIT动作"
      ],
      [
        "Keep",
        "pl-kp",
        "HIIT训练",
        "跳跃弓步课程"
      ],
      [
        "小红书",
        "pl-xs",
        "燃脂爆汗",
        "跳跃弓步合集"
      ]
    ]
  },
  "clamshell-2": {
    "name": "阻力带蚌式",
    "eng": "Resistance Band Clamshell",
    "emoji": "🐚",
    "level": "⭐⭐ 中级",
    "muscle_label": "臀部训练",
    "type_label": "阻力带训练",
    "purpose": "进阶激活臀中肌，提升髋部稳定",
    "primary_muscle": "臀中肌",
    "secondary_muscle": "臀小肌",
    "level_value": "⭐⭐ 中级",
    "fit_for": "已掌握基础蚌式，想加大强度",
    "sets": "3组 × 15次（每侧）",
    "rest": "30秒",
    "tags": [
      "臀中肌",
      "臀小肌",
      "阻力带"
    ],
    "points": [
      "侧卧在瑜伽垫上，阻力带套在双腿膝盖上方",
      "双膝弯曲约 90 度，双脚并拢",
      "保持脚并拢，上方膝盖向上打开克服阻力",
      "顶部感受臀外侧收缩，稍作停顿",
      "有控制地下落，完成一侧后换边"
    ],
    "breath_in": "开合时",
    "breath_in_text": "呼气，克服阻力向上打开",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "阻力带位置不当",
        "刺激不足。套在膝盖上方"
      ],
      [
        "骨盆后倾",
        "代偿发力。保持骨盆稳定"
      ],
      [
        "开合幅度过大",
        "腰椎代偿。打开到自然最大幅度即可"
      ],
      [
        "脚分离",
        "减弱阻力效果。双脚并拢"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Banded Clamshell",
        "Glute Activation"
      ],
      [
        "B站",
        "pl-bl",
        "阻力带蚌式",
        "臀中肌进阶"
      ],
      [
        "Keep",
        "pl-kp",
        "阻力带臀部",
        "蚌式专项"
      ],
      [
        "小红书",
        "pl-xs",
        "臀中肌进阶",
        "阻力带合集"
      ]
    ]
  },
  "side-plank-leg": {
    "name": "侧平板抬腿",
    "eng": "Side Plank Leg Lift",
    "emoji": "📏",
    "level": "⭐⭐⭐ 高级",
    "muscle_label": "核心训练",
    "type_label": "复合训练",
    "purpose": "强化核心稳定与臀中肌，多肌群协同",
    "primary_muscle": "腹斜肌、臀中肌",
    "secondary_muscle": "腹横肌、肩部肌群",
    "level_value": "⭐⭐⭐ 高级",
    "fit_for": "中高阶训练者，想综合训练核心+臀",
    "sets": "3组 × 10次（每侧）",
    "rest": "45秒",
    "tags": [
      "腹斜肌",
      "臀中肌",
      "核心稳定"
    ],
    "points": [
      "侧卧姿势，前臂支撑地面，肘部在肩膀正下方",
      "身体保持一条直线，核心收紧撑起",
      "上方腿伸直，缓慢向上抬起约 45 度",
      "顶部感受臀外侧与腹斜肌收缩",
      "有控制地下落，完成一侧后换边"
    ],
    "breath_in": "抬腿时",
    "breath_in_text": "呼气，核心与臀部协同发力",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "髋部下沉",
        "失去平板效果。髋部保持抬起"
      ],
      [
        "腿部下垂",
        "未充分发力。腿伸直抬高"
      ],
      [
        "肘部位置不当",
        "肩膀代偿。肘部在肩膀正下方"
      ],
      [
        "憋气",
        "血压升高。保持自然呼吸"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Side Plank Leg Lift",
        "Advanced Core"
      ],
      [
        "B站",
        "pl-bl",
        "侧平板抬腿",
        "复合训练"
      ],
      [
        "Keep",
        "pl-kp",
        "核心进阶",
        "侧平板课程"
      ],
      [
        "小红书",
        "pl-xs",
        "核心训练",
        "侧平板合集"
      ]
    ]
  },
  "standing-side-leg": {
    "name": "站姿侧抬腿",
    "eng": "Standing Side Leg Raise",
    "emoji": "🧍",
    "level": "⭐ 初级",
    "muscle_label": "臀部训练",
    "type_label": "自重训练",
    "purpose": "训练臀中肌，改善髋部稳定与平衡",
    "primary_muscle": "臀中肌",
    "secondary_muscle": "臀小肌、核心肌群",
    "level_value": "⭐ 初级",
    "fit_for": "新手、想改善平衡与髋部稳定",
    "sets": "3组 × 15次（每侧）",
    "rest": "30秒",
    "tags": [
      "臀中肌",
      "臀小肌",
      "平衡"
    ],
    "points": [
      "双脚并拢站立，可扶墙或椅子保持平衡",
      "核心收紧，保持身体直立",
      "一条腿伸直向侧方抬起约 45 度",
      "顶部感受臀外侧收缩，脚尖朝前",
      "有控制地下落，完成一侧后换边"
    ],
    "breath_in": "上抬时",
    "breath_in_text": "呼气，臀外侧发力向侧方抬",
    "breath_out": "下落时",
    "breath_out_text": "吸气，缓慢有控制地下落",
    "mistakes": [
      [
        "身体侧倾",
        "代偿发力。保持身体直立"
      ],
      [
        "抬腿过高",
        "腰椎代偿。45 度即可"
      ],
      [
        "脚尖朝上",
        "变成股四头肌发力。脚尖朝前"
      ],
      [
        "速度太快",
        "靠惯性。用 2 秒上抬，2 秒下落"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Standing Side Leg Raise",
        "Balance"
      ],
      [
        "B站",
        "pl-bl",
        "站姿侧抬腿",
        "臀中肌训练"
      ],
      [
        "Keep",
        "pl-kp",
        "臀部训练",
        "站姿侧抬腿课程"
      ],
      [
        "小红书",
        "pl-xs",
        "改善臀凹陷",
        "站姿侧抬腿合集"
      ]
    ]
  },
  "resistance-band-walk": {
    "name": "阻力带侧行走",
    "eng": "Resistance Band Lateral Walk",
    "emoji": "🚶",
    "level": "⭐⭐ 中级",
    "muscle_label": "臀部训练",
    "type_label": "阻力带训练",
    "purpose": "深度激活臀中肌，改善髋部稳定",
    "primary_muscle": "臀中肌",
    "secondary_muscle": "臀小肌、阔筋膜张肌",
    "level_value": "⭐⭐ 中级",
    "fit_for": "想深度激活臀部、跑步人群",
    "sets": "3组 × 15步（每方向）",
    "rest": "30秒",
    "tags": [
      "臀中肌",
      "臀小肌",
      "阻力带"
    ],
    "points": [
      "阻力带套在双腿脚踝或膝盖上方",
      "双脚与肩同宽，微屈膝下蹲姿势",
      "保持蹲姿，一只脚向侧方迈出一步",
      "另一只脚跟随靠近，但保持阻力带张力",
      "向一个方向行走 15 步，再反向走回"
    ],
    "breath_in": "迈步时",
    "breath_in_text": "呼气，克服阻力向侧方迈",
    "breath_out": "跟随时",
    "breath_out_text": "吸气，控制脚步靠近",
    "mistakes": [
      [
        "膝盖内扣",
        "减弱效果。膝盖沿脚尖方向"
      ],
      [
        "直立行走",
        "失去臀中肌刺激。保持微屈膝蹲姿"
      ],
      [
        "脚步太大",
        "难以保持张力。小步侧移"
      ],
      [
        "阻力带位置不当",
        "刺激不足。套在脚踝或膝盖上方"
      ]
    ],
    "videos": [
      [
        "YouTube",
        "pl-yt",
        "Lateral Band Walk",
        "Gluteus Medius"
      ],
      [
        "B站",
        "pl-bl",
        "阻力带侧行走",
        "臀中肌激活"
      ],
      [
        "Keep",
        "pl-kp",
        "阻力带训练",
        "侧行走课程"
      ],
      [
        "小红书",
        "pl-xs",
        "蜜桃臀",
        "阻力带侧行走合集"
      ]
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
