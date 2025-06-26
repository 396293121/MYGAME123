/**
 * 觉醒能力数据
 * 定义游戏中各职业的觉醒能力
 */

const AwakeningData = {
  // 战士职业觉醒能力
  'warrior_berserk': {
    name: '狂战士之怒',
    description: '释放内心的狂暴，大幅提升攻击力和速度，但降低防御力',
    requiredClass: 'warrior',
    requiredLevel: 10,
    prerequisites: [],
    passiveEffects: [
      { type: 'statBoost', stat: 'strength', value: 5 }
    ],
    activeEffects: [
      { type: 'tempStatBoost', stat: 'physicalAttack', value: 50 },
      { type: 'tempStatBoost', stat: 'speed', value: 20 },
      { type: 'tempStatBoost', stat: 'physicalDefense', value: -20 }
    ],
    costs: { mp: 30 },
    duration: 20000, // 20秒
    cooldown: 60000, // 60秒
    icon: 'berserk_icon'
  },
  
  'warrior_guardian': {
    name: '守护之魂',
    description: '唤醒守护者的灵魂，大幅提升防御力和生命恢复',
    requiredClass: 'warrior',
    requiredLevel: 15,
    prerequisites: [],
    passiveEffects: [
      { type: 'statBoost', stat: 'vitality', value: 10 }
    ],
    activeEffects: [
      { type: 'tempStatBoost', stat: 'physicalDefense', value: 50 },
      { type: 'tempStatBoost', stat: 'magicDefense', value: 30 },
      { type: 'healthRegen', value: 5 } // 每秒恢复5点生命
    ],
    costs: { mp: 40 },
    duration: 30000, // 30秒
    cooldown: 90000, // 90秒
    icon: 'guardian_icon'
  },
  
  'warrior_warlord': {
    name: '战争领主',
    description: '觉醒为战场上的领袖，提升自身和队友的战斗能力',
    requiredClass: 'warrior',
    requiredLevel: 25,
    prerequisites: ['warrior_berserk', 'warrior_guardian'],
    passiveEffects: [
      { type: 'statBoost', stat: 'strength', value: 15 },
      { type: 'statBoost', stat: 'vitality', value: 15 },
      { type: 'unlockSkill', skillId: 'rally_cry' } // 解锁新技能：战吼
    ],
    activeEffects: [
      { type: 'tempStatBoost', stat: 'physicalAttack', value: 30 },
      { type: 'tempStatBoost', stat: 'physicalDefense', value: 30 },
      { type: 'auraEffect', range: 200, effects: [
        { type: 'allyStatBoost', stat: 'physicalAttack', value: 15 },
        { type: 'allyStatBoost', stat: 'physicalDefense', value: 15 }
      ]}
    ],
    costs: { mp: 60 },
    duration: 40000, // 40秒
    cooldown: 180000, // 180秒
    icon: 'warlord_icon'
  },
  
  // 法师职业觉醒能力
  'mage_archmage': {
    name: '大法师之力',
    description: '觉醒内在的魔法潜能，大幅提升魔法攻击力和魔法恢复',
    requiredClass: 'mage',
    requiredLevel: 10,
    prerequisites: [],
    passiveEffects: [
      { type: 'statBoost', stat: 'intelligence', value: 10 }
    ],
    activeEffects: [
      { type: 'tempStatBoost', stat: 'magicAttack', value: 50 },
      { type: 'manaRegen', value: 5 } // 每秒恢复5点魔法
    ],
    costs: { mp: 30 },
    duration: 20000, // 20秒
    cooldown: 60000, // 60秒
    icon: 'archmage_icon'
  },
  
  'mage_elementalist': {
    name: '元素使者',
    description: '与元素力量共鸣，提升元素魔法效果并减少消耗',
    requiredClass: 'mage',
    requiredLevel: 15,
    prerequisites: [],
    passiveEffects: [
      { type: 'spellCostReduction', value: 0.1 } // 减少10%魔法消耗
    ],
    activeEffects: [
      { type: 'elementalDamageBoost', value: 0.3 }, // 提升30%元素伤害
      { type: 'spellCooldownReduction', value: 0.5 } // 减少50%技能冷却
    ],
    costs: { mp: 40 },
    duration: 25000, // 25秒
    cooldown: 80000, // 80秒
    icon: 'elementalist_icon'
  },
  
  'mage_timemage': {
    name: '时间法师',
    description: '掌握时间魔法的奥秘，可以加速自己或减缓敌人',
    requiredClass: 'mage',
    requiredLevel: 25,
    prerequisites: ['mage_archmage', 'mage_elementalist'],
    passiveEffects: [
      { type: 'statBoost', stat: 'intelligence', value: 20 },
      { type: 'cooldownReduction', value: 0.1 }, // 所有技能冷却时间减少10%
      { type: 'unlockSkill', skillId: 'time_stop' } // 解锁新技能：时间停止
    ],
    activeEffects: [
      { type: 'timeWarp', selfSpeedMultiplier: 2.0, enemySpeedMultiplier: 0.5 }, // 自身速度翻倍，敌人速度减半
      { type: 'spellCooldownReduction', value: 0.8 } // 减少80%技能冷却
    ],
    costs: { mp: 70 },
    duration: 15000, // 15秒
    cooldown: 240000, // 240秒
    icon: 'timemage_icon'
  },
  
  // 弓箭手职业觉醒能力
  'archer_hawkeye': {
    name: '鹰眼',
    description: '视力大幅提升，增加攻击距离和暴击率',
    requiredClass: 'archer',
    requiredLevel: 10,
    prerequisites: [],
    passiveEffects: [
      { type: 'statBoost', stat: 'dexterity', value: 10 }
    ],
    activeEffects: [
      { type: 'tempStatBoost', stat: 'critRate', value: 0.3 }, // 增加30%暴击率
      { type: 'rangeIncrease', value: 100 } // 增加100点攻击距离
    ],
    costs: { mp: 25 },
    duration: 30000, // 30秒
    cooldown: 60000, // 60秒
    icon: 'hawkeye_icon'
  },
  
  'archer_windwalker': {
    name: '风行者',
    description: '与风元素共鸣，大幅提升移动速度和闪避率',
    requiredClass: 'archer',
    requiredLevel: 15,
    prerequisites: [],
    passiveEffects: [
      { type: 'statBoost', stat: 'speed', value: 10 }
    ],
    activeEffects: [
      { type: 'tempStatBoost', stat: 'speed', value: 50 },
      { type: 'tempStatBoost', stat: 'dodgeRate', value: 0.2 }, // 增加20%闪避率
      { type: 'movementEffect', type: 'noClip', value: true } // 可以穿过敌人
    ],
    costs: { mp: 30 },
    duration: 20000, // 20秒
    cooldown: 70000, // 70秒
    icon: 'windwalker_icon'
  },
  
  'archer_ranger': {
    name: '神射手',
    description: '觉醒为传说中的神射手，箭无虚发，一击必杀',
    requiredClass: 'archer',
    requiredLevel: 25,
    prerequisites: ['archer_hawkeye', 'archer_windwalker'],
    passiveEffects: [
      { type: 'statBoost', stat: 'dexterity', value: 20 },
      { type: 'critDamageBoost', value: 0.2 }, // 增加20%暴击伤害
      { type: 'unlockSkill', skillId: 'arrow_rain' } // 解锁新技能：箭雨
    ],
    activeEffects: [
      { type: 'perfectAim', value: true }, // 箭矢会自动追踪目标
      { type: 'tempStatBoost', stat: 'critRate', value: 0.5 }, // 增加50%暴击率
      { type: 'tempStatBoost', stat: 'critDamage', value: 0.5 }, // 增加50%暴击伤害
      { type: 'arrowEffect', effect: 'penetration', value: true } // 箭矢可以穿透敌人
    ],
    costs: { mp: 50 },
    duration: 25000, // 25秒
    cooldown: 180000, // 180秒
    icon: 'ranger_icon'
  }
};

export default AwakeningData;