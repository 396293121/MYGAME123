/**
 * 任务数据
 * 定义游戏中的任务和剧情
 */

const QuestData = {
  // 战士第一章任务线
  'warrior_ch1_hunting': {
    id: 'warrior_ch1_hunting',
    title: '一个平凡的日子',
    description: '完成部落的狩猎仪式，证明自己的实力。',
    type: 'main',
    classRestriction: 'warrior',
    giver: 'tribal_chief',
    location: 'warrior_village',
    prerequisites: [],
    objectives: [
      { id: 'kill_wild_boars', description: '击杀野猪', required: 10 },
      { id: 'defeat_boar_king', description: '击败猪王', required: 1 }
    ],
    rewards: {
      exp: 200,
      gold: 100,
      items: ['boar_king_emblem', 'health_potion'],
      flags: ['warrior_ch1_hunting_completed']
    },
    nextQuest: 'warrior_ch1_intruder'
  },
  
  'warrior_ch1_intruder': {
    id: 'warrior_ch1_intruder',
    title: '神秘入侵者',
    description: '调查并阻止在村庄附近出现的神秘人。',
    type: 'main',
    classRestriction: 'warrior',
    giver: 'tribal_chief',
    location: 'ancient_altar',
    prerequisites: ['warrior_ch1_hunting'],
    objectives: [
      { id: 'find_intruder', description: '找到神秘入侵者', required: 1 },
      { id: 'fight_intruder', description: '与神秘入侵者战斗', required: 1 }
    ],
    rewards: {
      exp: 300,
      gold: 150,
      items: ['mysterious_emblem'],
      flags: ['warrior_ch1_defeated']
    },
    nextQuest: 'warrior_ch1_revelation',
    forcedOutcome: 'defeat' // 强制剧情失败
  },
  
  'warrior_ch1_revelation': {
    id: 'warrior_ch1_revelation',
    title: '觉醒的秘密',
    description: '向部落酋长寻求关于觉醒力量的知识。',
    type: 'main',
    classRestriction: 'warrior',
    giver: 'tribal_chief',
    location: 'warrior_village',
    prerequisites: ['warrior_ch1_intruder'],
    objectives: [
      { id: 'talk_to_chief', description: '与部落酋长交谈', required: 1 },
      { id: 'learn_about_awakening', description: '了解觉醒的秘密', required: 1 }
    ],
    rewards: {
      exp: 250,
      gold: 100,
      items: ['ancient_map'],
      flags: ['warrior_ch1_revelation_completed']
    },
    nextQuest: 'warrior_ch1_departure'
  },
  
  'warrior_ch1_departure': {
    id: 'warrior_ch1_departure',
    title: '觉醒之路',
    description: '离开部落，前往小城寻找了解觉醒能力的老者。',
    type: 'main',
    classRestriction: 'warrior',
    giver: 'tribal_chief',
    location: 'warrior_village',
    prerequisites: ['warrior_ch1_revelation'],
    objectives: [
      { id: 'prepare_journey', description: '准备旅程', required: 1 },
      { id: 'leave_village', description: '离开部落', required: 1 }
    ],
    rewards: {
      exp: 350,
      gold: 200,
      items: ['travel_supplies', 'warrior_rune'],
      flags: ['warrior_ch1_completed'],
      chapterComplete: 'warrior_ch1' // 标记第一章完成
    },
    nextQuest: 'warrior_ch2_arrival' // 指向第二章开始
  },
  
  // 法师第一章任务线占位
  'mage_ch1_start': {
    id: 'mage_ch1_start',
    title: '魔法学徒',
    description: '开始你作为魔法学徒的旅程。',
    type: 'main',
    classRestriction: 'mage',
    giver: 'archmage',
    location: 'magic_academy',
    prerequisites: [],
    objectives: [
      { id: 'meet_archmage', description: '与大法师会面', required: 1 }
    ],
    rewards: {
      exp: 100,
      gold: 50,
      items: ['apprentice_staff'],
      flags: ['mage_ch1_started']
    },
    nextQuest: null
  },
  
  // 弓箭手第一章任务线占位
  'archer_ch1_start': {
    id: 'archer_ch1_start',
    title: '森林守护者',
    description: '开始你作为弓箭手的旅程。',
    type: 'main',
    classRestriction: 'archer',
    giver: 'master_hunter',
    location: 'ancient_forest',
    prerequisites: [],
    objectives: [
      { id: 'meet_hunter', description: '与猎人大师会面', required: 1 }
    ],
    rewards: {
      exp: 100,
      gold: 50,
      items: ['hunter_bow'],
      flags: ['archer_ch1_started']
    },
    nextQuest: null
  },
  
  // 支线任务
  'side_lost_child': {
    id: 'side_lost_child',
    title: '迷路的孩子',
    description: '帮助村民找回在森林中迷路的孩子。',
    type: 'side',
    giver: 'worried_parent',
    location: 'warrior_village',
    prerequisites: [],
    objectives: [
      { id: 'search_forest', description: '搜索森林', required: 1 },
      { id: 'defeat_wolves', description: '击退狼群', required: 3 },
      { id: 'rescue_child', description: '救回孩子', required: 1 }
    ],
    rewards: {
      exp: 200,
      gold: 100,
      items: ['healing_herbs'],
      reputation: { faction: 'village', amount: 50 }
    }
  }
};

export default QuestData;