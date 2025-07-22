// AI能力描述和特征说明系统
// AI Capability Descriptions and Characteristics System

import { AIDifficulty } from './types';

export interface AIDescription {
  difficulty: AIDifficulty;
  name: string;
  category: '初学者' | '进阶' | '中级' | '高级' | '专业';
  level: string;
  capabilities: string[];
  characteristics: string[];
  suitableFor: string[];
  thinkingTime: number; // 思考时间（毫秒）
  errorRate: number; // 失误率 (0-1)
  description: string; // 简短描述
  detailedDescription: string; // 详细描述
}

/**
 * 完整的AI能力描述库
 */
export const AI_DESCRIPTIONS: Record<AIDifficulty, AIDescription> = {
  // 初学者级别 (30K-25K)
  [AIDifficulty.AI_30K]: {
    difficulty: AIDifficulty.AI_30K,
    name: 'AI-30K (入门初学)',
    category: '初学者',
    level: '30级',
    capabilities: [
      '基本落子规则',
      '简单提子操作',
      '避免明显自杀'
    ],
    characteristics: [
      '经常漏气送死',
      '不懂布局章法',
      '随机性很高',
      '常出现低级失误'
    ],
    suitableFor: [
      '刚学会围棋基本规则的初学者',
      '想要轻松获胜建立信心的玩家',
      '练习基本吃子技巧'
    ],
    thinkingTime: 300,
    errorRate: 0.7,
    description: '只会基本落子，容易露破绽，适合刚入门的你',
    detailedDescription: '这个AI刚刚学会围棋的基本规则，经常会出现送死、漏气等明显错误。它的下法很随意，几乎没有布局概念，适合初学者练习基本的吃子技巧和建立信心。'
  },

  [AIDifficulty.AI_25K]: {
    difficulty: AIDifficulty.AI_25K,
    name: 'AI-25K (基础练习)',
    category: '初学者',
    level: '25级',
    capabilities: [
      '理解气的概念',
      '简单做眼',
      '基本提子'
    ],
    characteristics: [
      '会简单提子、做眼',
      '常见死活可应对',
      '大局观较弱',
      '布局较混乱'
    ],
    suitableFor: [
      '掌握基本规则的初学者',
      '练习简单死活',
      '学习基本眼位概念'
    ],
    thinkingTime: 400,
    errorRate: 0.6,
    description: '会简单提子、做眼，但大局观较弱',
    detailedDescription: '这个AI已经理解了气和眼的基本概念，能够进行简单的提子和做眼，但在布局和大局观方面还很薄弱，适合练习基本的死活和眼位。'
  },

  // 进阶级别 (20K-15K)
  [AIDifficulty.AI_20K]: {
    difficulty: AIDifficulty.AI_20K,
    name: 'AI-20K (进阶入门)',
    category: '进阶',  
    level: '20级',
    capabilities: [
      '识别基本定式',
      '简单杀棋',
      '基本布局思路'
    ],
    characteristics: [
      '能识别基本定式、简单杀棋',
      '有布局思路',
      '略懂攻防',
      '中盘仍较弱'
    ],
    suitableFor: [
      '有一定基础的玩家',
      '练习基本定式',
      '学习简单攻防'
    ],
    thinkingTime: 500,
    errorRate: 0.5,
    description: '能识别基本定式、简单杀棋，有布局思路',
    detailedDescription: '这个AI开始有了基本的布局概念，能够识别一些简单的定式，会进行基本的攻防，但在复杂的中盘战斗中仍然较弱。'
  },

  [AIDifficulty.AI_15K]: {
    difficulty: AIDifficulty.AI_15K,
    name: 'AI-15K (布局练习)',
    category: '进阶',
    level: '15级',
    capabilities: [
      '常见布局选择',
      '基本大局观',
      '简单攻防转换'
    ],
    characteristics: [
      '有一定大局观',
      '开始主动做活',
      '能识别常见陷阱',
      '收官仍有问题'
    ],
    suitableFor: [
      '学习布局的玩家',
      '练习基本大局观',
      '提高攻防意识'
    ],
    thinkingTime: 600,
    errorRate: 0.4,
    description: '有一定大局观，开始主动做活，能识别常见陷阱',
    detailedDescription: '这个AI具备了基本的大局观，能够主动选择布局方向，开始懂得做活和杀棋的基本原理，能识别一些常见的陷阱，但在收官阶段仍有明显不足。'
  },

  // 中级级别 (10K-5K)  
  [AIDifficulty.AI_10K]: {
    difficulty: AIDifficulty.AI_10K,
    name: 'AI-10K (实用提升)',
    category: '中级',
    level: '10级',
    capabilities: [
      '合理布局选择',
      '基本中盘战斗',
      '简单收官计算'
    ],
    characteristics: [
      '布局合理',
      '能做劫争',
      '基本不会出现明显失误',
      '开始有中盘概念'
    ],
    suitableFor: [
      '进入中级阶段的玩家',
      '练习中盘战斗',
      '学习劫争技巧'
    ],
    thinkingTime: 800,
    errorRate: 0.3,
    description: '布局合理，能做劫争，基本不会出现明显失误',
    detailedDescription: '这个AI的布局比较合理，开始具备中盘战斗的能力，能够进行基本的劫争，很少出现明显的失误，是进入中级阶段很好的练习对手。'
  },

  [AIDifficulty.AI_5K]: {
    difficulty: AIDifficulty.AI_5K,
    name: 'AI-5K (技巧提升)',
    category: '中级',
    level: '5级',
    capabilities: [
      '精确收官计算',
      '多步变化阅读',
      '攻防兼备'
    ],
    characteristics: [
      '具备收官能力',
      '能阅读多步变化',
      '攻防兼备',
      '很少犯错'
    ],
    suitableFor: [
      '中级进阶玩家',
      '练习收官技巧',
      '提高计算能力'
    ],
    thinkingTime: 1000,
    errorRate: 0.25,
    description: '具备收官能力，能阅读多步变化，攻防兼备',
    detailedDescription: '这个AI具备了良好的收官能力，能够阅读多步变化，在攻防方面比较均衡，很少犯明显错误，是提高技巧的理想对手。'
  },

  // 高级级别 (1K-3D)
  [AIDifficulty.AI_1K]: {
    difficulty: AIDifficulty.AI_1K,
    name: 'AI-1K (段位冲刺)',
    category: '高级',
    level: '1级',
    capabilities: [
      '复杂定式应用',
      '攻防转换',
      '形势判断'
    ],
    characteristics: [
      '应对复杂定式、攻防转换',
      '形势判断较准确',
      '计算力提升',
      '开始有职业感觉'
    ],
    suitableFor: [
      '冲击段位的玩家',
      '练习复杂定式',
      '提高形势判断'
    ],
    thinkingTime: 1200,
    errorRate: 0.2,
    description: '应对复杂定式、攻防转换，形势判断较准确',
    detailedDescription: '这个AI能够应对复杂的定式变化，善于攻防转换，形势判断比较准确，计算力明显提升，开始有了一些职业棋手的感觉。'
  },

  [AIDifficulty.AI_1D]: {
    difficulty: AIDifficulty.AI_1D,
    name: 'AI-1D (业余初段)',
    category: '高级',
    level: '1段',
    capabilities: [
      '全局观控制',
      '复杂死活',
      '精确计算'
    ],
    characteristics: [
      '全局观与计算力提升',
      '能主动布局',
      '擅长侵消和转换',
      '失误明显减少'
    ],
    suitableFor: [
      '业余初段玩家',
      '练习全局观',
      '提高计算精度'
    ],
    thinkingTime: 1500,
    errorRate: 0.15,
    description: '全局观与计算力提升，能主动布局，擅长侵消和转换',
    detailedDescription: '这个AI具备了良好的全局观和计算力，能够主动进行布局规划，擅长侵消和攻防转换，失误明显减少，是业余初段水平的体现。'
  },

  [AIDifficulty.AI_2D]: {
    difficulty: AIDifficulty.AI_2D,
    name: 'AI-2D (稳固提升)',
    category: '高级',
    level: '2段',
    capabilities: [
      '深度形势判断',
      '厚薄理解',
      '复杂劫争'
    ],
    characteristics: [
      '形势判断精确',
      '理解厚薄概念',
      '复杂劫争处理得当',
      '整体水平均衡'
    ],
    suitableFor: [
      '业余2段左右玩家',
      '练习厚薄概念',
      '提高劫争技巧'
    ],
    thinkingTime: 1800,
    errorRate: 0.12,
    description: '形势判断精确，理解厚薄概念，复杂劫争处理得当',
    detailedDescription: '这个AI的形势判断非常精确，深入理解厚薄的概念，能够很好地处理复杂的劫争，整体水平比较均衡，是业余2段的良好体现。'
  },

  [AIDifficulty.AI_3D]: {
    difficulty: AIDifficulty.AI_3D,
    name: 'AI-3D (高段挑战)',
    category: '高级',
    level: '3段',
    capabilities: [
      '高级定式理解',
      '复杂死活与劫争',
      '精确计算与收官'
    ],
    characteristics: [
      '高级定式理解',
      '复杂死活与劫争',
      '精确计算与细腻收官',
      '很少出现失误'
    ],
    suitableFor: [
      '业余高段玩家',
      '挑战高难度对局',
      '完善技术细节'
    ],
    thinkingTime: 2000,
    errorRate: 0.1,
    description: '高级定式理解，复杂死活与劫争，精确计算与细腻收官',
    detailedDescription: '这个AI深入理解高级定式，能够处理复杂的死活和劫争，计算精确，收官细腻，很少出现失误，代表了业余高段的水平。'
  },

  // 专业级别 (4D-7D)
  [AIDifficulty.AI_4D]: {
    difficulty: AIDifficulty.AI_4D,
    name: 'AI-4D (专业进阶)',
    category: '专业',
    level: '4段',
    capabilities: [
      '深层战略思考',
      '创新布局',
      '完美收官'
    ],
    characteristics: [
      '战略思考深入',
      '布局有创新',
      '收官接近完美',
      '失误极少'
    ],
    suitableFor: [
      '业余高段以上玩家',
      '学习战略思考',
      '追求完美技艺'
    ],
    thinkingTime: 2500,
    errorRate: 0.08,
    description: '战略思考深入，布局有创新，收官接近完美',
    detailedDescription: '这个AI的战略思考非常深入，布局常有创新，收官接近完美，失误极少，代表了准专业的水平，是高段玩家的理想挑战对象。'
  },

  [AIDifficulty.AI_5D]: {
    difficulty: AIDifficulty.AI_5D,
    name: 'AI-5D (准职业)',
    category: '专业',
    level: '5段',
    capabilities: [
      '职业级判断',
      '超强计算',
      '艺术化表现'
    ],
    characteristics: [
      '接近职业级别',
      '计算力超强',
      '棋风有艺术性',
      '几乎不犯错'
    ],
    suitableFor: [
      '接近职业水平的玩家',
      '追求极致技巧',
      '欣赏高质量对局'
    ],
    thinkingTime: 3000,
    errorRate: 0.05,
    description: '接近职业级别，计算力超强，棋风有艺术性',
    detailedDescription: '这个AI接近职业级别，拥有超强的计算力，棋风具有艺术性，几乎不会犯错，能够展现围棋的高级美感。'
  },

  [AIDifficulty.AI_6D]: {
    difficulty: AIDifficulty.AI_6D,
    name: 'AI-6D (艺术大师)',
    category: '专业',
    level: '6段',
    capabilities: [
      '艺术级表现',
      '完美判断',
      '创造性思维'
    ],
    characteristics: [
      '棋艺达到艺术级别',
      '判断近乎完美',
      '思维具有创造性',
      '展现围棋之美'
    ],
    suitableFor: [
      '追求艺术境界的玩家',
      '学习创造性思维',
      '欣赏围棋艺术'
    ],
    thinkingTime: 3500,
    errorRate: 0.03,
    description: '棋艺达到艺术级别，判断近乎完美，思维具有创造性',
    detailedDescription: '这个AI的棋艺达到了艺术级别，判断近乎完美，思维具有高度的创造性，能够展现围棋的深层艺术美感。'
  },

  [AIDifficulty.AI_7D]: {
    difficulty: AIDifficulty.AI_7D,
    name: 'AI-7D (技艺巅峰)',
    category: '专业',
    level: '7段',
    capabilities: [
      '巅峰技艺',
      '完美表现',
      '哲学思考'
    ],
    characteristics: [
      '技艺达到巅峰',
      '表现接近完美',
      '蕴含哲学思考',
      '极少失误'
    ],
    suitableFor: [
      '追求极致的玩家',
      '体验巅峰对局',
      '感受围棋哲学'
    ],
    thinkingTime: 4000,
    errorRate: 0.02,
    description: '技艺达到巅峰，表现接近完美，蕴含哲学思考',
    detailedDescription: '这个AI的技艺达到了巅峰，表现接近完美，每一手棋都蕴含着深层的哲学思考，极少失误，代表了围棋技艺的最高境界。'
  },

  // 职业级别 (1P-9P)
  [AIDifficulty.AI_1P]: {
    difficulty: AIDifficulty.AI_1P,
    name: 'AI-1P (职业入门)',
    category: '专业',
    level: '职业1段',
    capabilities: [
      '职业级技巧',
      '超人计算',
      '完美无瑕'
    ],
    characteristics: [
      '具备超强计算与判断',
      '几乎不犯错',
      '可作为最高难度供高手挑战',
      '职业级别表现'
    ],
    suitableFor: [
      '职业棋手',
      '顶级业余高手',
      '极限挑战'
    ],
    thinkingTime: 5000,
    errorRate: 0.01,
    description: '具备超强计算与判断，几乎不犯错，职业级别挑战',
    detailedDescription: '这个AI具备了职业棋手的水平，拥有超强的计算能力和精准的判断力，几乎不会犯错，是职业级别的挑战对手。'
  },

  [AIDifficulty.AI_3P]: {
    difficulty: AIDifficulty.AI_3P,
    name: 'AI-3P (职业精英)',
    category: '专业',
    level: '职业3段',
    capabilities: [
      '精英级技巧',
      '完美表现',
      '超越人类'
    ],
    characteristics: [
      '职业精英水平',
      '表现近乎完美',
      '超越一般人类认知',
      '代表围棋最高水平'
    ],
    suitableFor: [
      '职业高段棋手',
      '世界级选手',
      '终极挑战'
    ],
    thinkingTime: 6000,
    errorRate: 0.005,
    description: '职业精英水平，表现近乎完美，超越一般人类认知',
    detailedDescription: '这个AI达到了职业精英的水平，表现近乎完美，在某些方面甚至超越了一般人类棋手的认知，代表了围棋AI的高级水平。'
  },

  [AIDifficulty.AI_5P]: {
    difficulty: AIDifficulty.AI_5P,
    name: 'AI-5P (超级大师)',
    category: '专业',
    level: '职业5段',
    capabilities: [
      '大师级洞察',
      '超人表现',
      '创新突破'
    ],
    characteristics: [
      '具备大师级洞察力',
      '表现超越人类',
      '能创新突破传统',
      '几乎无懈可击'
    ],
    suitableFor: [
      '世界冠军级别',
      '围棋研究',
      '极限探索'
    ],
    thinkingTime: 7000,
    errorRate: 0.002,
    description: '具备大师级洞察力，表现超越人类，能创新突破传统',
    detailedDescription: '这个AI具备了大师级的洞察力，表现远超一般人类，能够创新突破传统定式，几乎无懈可击，是世界冠军级别的对手。'
  },

  [AIDifficulty.AI_7P]: {
    difficulty: AIDifficulty.AI_7P,
    name: 'AI-7P (传奇级别)',
    category: '专业',
    level: '职业7段',
    capabilities: [
      '传奇级能力',
      '完美无缺',
      '重新定义围棋'
    ],
    characteristics: [
      '传奇级别的能力',
      '表现完美无缺',
      '重新定义围棋理解',
      '超越时代的存在'
    ],
    suitableFor: [
      '历史级棋手',
      '围棋理论研究',
      '突破极限'
    ],
    thinkingTime: 8000,
    errorRate: 0.001,
    description: '传奇级别的能力，重新定义围棋理解，超越时代',
    detailedDescription: '这个AI达到了传奇级别，表现完美无缺，能够重新定义人类对围棋的理解，是超越时代的存在。'
  },

  [AIDifficulty.AI_9P]: {
    difficulty: AIDifficulty.AI_9P,
    name: 'AI-9P (围棋之神)',
    category: '专业',
    level: '职业9段',
    capabilities: [
      '神级表现',
      '完美无瑕',
      '围棋的终极形态'
    ],
    characteristics: [
      '神级的表现',
      '完美无瑕的技艺',
      '代表围棋的终极形态',
      '无法超越的存在'
    ],
    suitableFor: [
      '围棋之神的挑战',
      '理论研究的极致',
      '不可能的任务'
    ],
    thinkingTime: 10000,
    errorRate: 0.0001,
    description: '顶级水平，几乎不犯错，围棋AI的最高境界！',
    detailedDescription: '这个AI代表了围棋AI的最高境界，拥有神级的表现和完美无瑕的技艺，代表了围棋的终极形态，是几乎无法超越的存在。对于绝大多数人来说，这是一个不可能战胜的对手。'
  }
};

/**
 * 根据AI难度获取描述信息
 */
export function getAIDescription(difficulty: AIDifficulty): AIDescription {
  return AI_DESCRIPTIONS[difficulty];
}

/**
 * 获取AI简短描述（用于UI显示）
 */
export function getAIShortDescription(difficulty: AIDifficulty): string {
  return AI_DESCRIPTIONS[difficulty].description;
}

/**
 * 获取AI详细描述（用于帮助界面）
 */
export function getAIDetailedDescription(difficulty: AIDifficulty): string {
  return AI_DESCRIPTIONS[difficulty].detailedDescription;
}

/**
 * 根据类别筛选AI
 */
export function getAIByCategory(category: '初学者' | '进阶' | '中级' | '高级' | '专业'): AIDescription[] {
  return Object.values(AI_DESCRIPTIONS).filter(ai => ai.category === category);
}

/**
 * 获取推荐的AI对手（基于玩家段位）
 */
export function getRecommendedAI(playerRankValue: number): {
  recommended: AIDifficulty[]; // 推荐的AI（同级±1）
  challenging: AIDifficulty[]; // 挑战性AI（高1-3级）
  practice: AIDifficulty[];    // 练习用AI（低1-3级）
  all: AIDifficulty[];        // 所有可选AI（±3级内）
} {
  const recommended: AIDifficulty[] = [];
  const challenging: AIDifficulty[] = [];
  const practice: AIDifficulty[] = [];
  const all: AIDifficulty[] = [];
  
  Object.values(AI_DESCRIPTIONS).forEach(ai => {
    const aiRankValue = convertAIToRankValue(ai.difficulty);
    const rankDifference = aiRankValue - playerRankValue;
    
    // 所有可挑战的AI（±3级内，符合围棋挑战规则）
    if (rankDifference >= -3 && rankDifference <= 3) {
      all.push(ai.difficulty);
      
      // 推荐AI（同级±1）
      if (Math.abs(rankDifference) <= 1) {
        recommended.push(ai.difficulty);
      }
      
      // 挑战性AI（高1-3级）
      if (rankDifference > 0 && rankDifference <= 3) {
        challenging.push(ai.difficulty);
      }
      
      // 练习用AI（低1-3级）
      if (rankDifference < 0 && rankDifference >= -3) {
        practice.push(ai.difficulty);
      }
    }
  });
  
  return { recommended, challenging, practice, all };
}

/**
 * 检查玩家是否可以挑战特定AI（基于段位差距）
 */
export function canChallengeAI(playerRankValue: number, aiDifficulty: AIDifficulty): {
  canChallenge: boolean;
  reason?: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
} {
  const aiRankValue = convertAIToRankValue(aiDifficulty);
  const rankDifference = aiRankValue - playerRankValue;
  
  // 基本挑战规则：可以挑战±3级内的AI
  if (Math.abs(rankDifference) > 3) {
    const tooHigh = rankDifference > 3;
    return {
      canChallenge: false,
      reason: tooHigh 
        ? `AI水平过高，建议先提升到${getDifficultyDisplayName(getAIDifficultyByRankValue(playerRankValue + 3))}级别后再挑战`
        : `AI水平过低，建议挑战更高级别的AI来提升棋艺`,
      difficulty: 'extreme'
    };
  }
  
  // 确定挑战难度
  let difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  if (rankDifference <= -2) {
    difficulty = 'easy';
  } else if (rankDifference <= 1) {
    difficulty = 'normal';
  } else if (rankDifference <= 3) {
    difficulty = 'hard';
  } else {
    difficulty = 'extreme';
  }
  
  return { canChallenge: true, difficulty };
}

/**
 * 根据段位数值获取对应的AI难度
 */
function getAIDifficultyByRankValue(rankValue: number): AIDifficulty {
  // 找到最接近的AI难度
  let closestAI = AIDifficulty.AI_30K;
  let smallestDifference = Infinity;
  
  Object.values(AIDifficulty).forEach(difficulty => {
    const aiRankValue = convertAIToRankValue(difficulty);
    const difference = Math.abs(aiRankValue - rankValue);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestAI = difficulty;
    }
  });
  
  return closestAI;
}

/**
 * 获取AI难度的显示名称
 */
function getDifficultyDisplayName(difficulty: AIDifficulty): string {
  return AI_DESCRIPTIONS[difficulty]?.name || difficulty;
}

/**
 * 将AI难度转换为段位数值（与rank.ts中的numericValue对应）
 */
function convertAIToRankValue(difficulty: AIDifficulty): number {
  // 完整的段位映射，与rank.ts保持一致
  const mapping: Record<string, number> = {
    // 级位 (30K-1K)
    '30K': 1, '29K': 2, '28K': 3, '27K': 4, '26K': 5,
    '25K': 6, '24K': 7, '23K': 8, '22K': 9, '21K': 10,
    '20K': 11, '19K': 12, '18K': 13, '17K': 14, '16K': 15,
    '15K': 16, '14K': 17, '13K': 18, '12K': 19, '11K': 20,
    '10K': 21, '9K': 22, '8K': 23, '7K': 24, '6K': 25,
    '5K': 26, '4K': 27, '3K': 28, '2K': 29, '1K': 30,
    
    // 业余段位 (1D-9D)
    '1D': 31, '2D': 32, '3D': 33, '4D': 34, '5D': 35,
    '6D': 36, '7D': 37, '8D': 38, '9D': 39,
    
    // 职业段位 (1P-9P)
    '1P': 40, '2P': 41, '3P': 42, '4P': 43, '5P': 44,
    '6P': 45, '7P': 46, '8P': 47, '9P': 48
  };
  
  return mapping[difficulty] || 1;
}

/**
 * 为玩家推荐最合适的AI训练计划
 */
export function getAITrainingPlan(playerRankValue: number): {
  currentLevel: string;
  nextGoal: string;
  trainingAIs: AIDifficulty[];
  advice: string;
} {
  const currentAI = getAIDifficultyByRankValue(playerRankValue);
  const nextGoalAI = getAIDifficultyByRankValue(playerRankValue + 2);
  
  const recommendations = getRecommendedAI(playerRankValue);
  
  let advice = '';
  if (playerRankValue <= 16) { // 15K及以下
    advice = '建议重点练习基本死活和简单定式，多与同级或略高级别的AI对弈。';
  } else if (playerRankValue <= 30) { // 1K及以下
    advice = '现在可以学习复杂定式和中盘战斗，建议挑战稍高级别的AI来提升实战能力。';
  } else if (playerRankValue <= 39) { // 业余段位
    advice = '专注于全局观和形势判断的提升，与高段AI对弈可以学习更深层的棋理。';
  } else { // 职业段位
    advice = '保持巅峰状态，与最高级别AI切磋可以发现自己的薄弱环节。';
  }
  
  return {
    currentLevel: getDifficultyDisplayName(currentAI),
    nextGoal: getDifficultyDisplayName(nextGoalAI),
    trainingAIs: [...recommendations.practice, ...recommendations.recommended, ...recommendations.challenging.slice(0, 2)],
    advice
  };
}