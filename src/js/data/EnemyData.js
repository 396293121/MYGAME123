/**
 * 敌人数据库
 * 存储游戏中所有敌人的基础数据
 */

const EnemyData = {
  // 战士第一章敌人
  WILD_BOAR: {
    id: 'wild_boar',
    name: '野猪',
    description: '铁山村附近常见的野猪，性情暴躁。',
    type: 'normal',
    level: 2,
    stats: {
      health: 40,
      attack: 8,
      defense: 5,
      speed: 80,
      exp: 15
    },
    abilities: ['charge', 'tusk_attack'],
    drops: [
      { itemId: 'pig_tusk', chance: 0.6, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'thick_hide', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'monster_meat', chance: 0.8, minQuantity: 1, maxQuantity: 2 }
    ],
    gold: { min: 2, max: 8 },
    sprite: 'wild_boar_sprite',
    animations: {
      idle: 'wild_boar_idle',
      move: 'wild_boar_move',
      attack: 'wild_boar_attack',
      hurt: 'wild_boar_hurt',
      die: 'wild_boar_die'
    },
    soundEffects: {
      attack: 'wild_boar_attack_sound',
      hurt: 'wild_boar_hurt_sound',
      die: 'wild_boar_die_sound'
    },
    behavior: 'territorial', // 在领地内会主动攻击玩家
    detectionRadius: 150,
    aggroRadius: 180,
    attackRange: 40, // 攻击范围
    chargeSpeed: 150, // 冲锋速度
    chargeCooldown: 5 // 冲锋冷却时间（秒）
  },
  
  LARGE_BOAR: {
    id: 'large_boar',
    name: '大型野猪',
    description: '体型更大、更加凶猛的野猪，通常是野猪群的领袖。',
    type: 'elite',
    level: 4,
    stats: {
      health: 80,
      attack: 12,
      defense: 8,
      speed: 70,
      exp: 30
    },
    abilities: ['charge', 'tusk_attack', 'ground_stomp'],
    drops: [
      { itemId: 'pig_tusk', chance: 0.8, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'thick_hide', chance: 0.6, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'monster_meat', chance: 1.0, minQuantity: 2, maxQuantity: 3 },
      { itemId: 'health_potion_small', chance: 0.3, minQuantity: 1, maxQuantity: 1 }
    ],
    gold: { min: 10, max: 20 },
    sprite: 'large_boar_sprite',
    animations: {
      idle: 'large_boar_idle',
      move: 'large_boar_move',
      attack: 'large_boar_attack',
      special: 'large_boar_stomp',
      hurt: 'large_boar_hurt',
      die: 'large_boar_die'
    },
    soundEffects: {
      attack: 'large_boar_attack_sound',
      special: 'large_boar_stomp_sound',
      hurt: 'large_boar_hurt_sound',
      die: 'large_boar_die_sound'
    },
    behavior: 'aggressive', // 主动攻击玩家
    detectionRadius: 200,
    aggroRadius: 250,
    attackRange: 50, // 攻击范围
    chargeSpeed: 180, // 冲锋速度
    chargeCooldown: 8, // 冲锋冷却时间（秒）
    stompRadius: 100, // 践踏影响范围
    stompCooldown: 15 // 践踏冷却时间（秒）
  },
  
  BOAR_KING: {
    id: 'boar_king',
    name: '猪王',
    description: '野猪森林的霸主，体型巨大，拥有锋利的獠牙和坚硬的皮肤。',
    type: 'boss',
    level: 6,
    stats: {
      health: 300,
      attack: 18,
      defense: 12,
      speed: 90,
      exp: 150
    },
    abilities: ['fierce_charge', 'tusk_slash', 'ground_quake', 'summon_boars', 'enraged_state'],
    phases: [
      { threshold: 0.5, abilities: ['enraged_state', 'summon_boars'] }
    ],
    drops: [
      { itemId: 'boar_king_emblem', chance: 1.0, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'pig_tusk', chance: 1.0, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'thick_hide', chance: 1.0, minQuantity: 2, maxQuantity: 4 },
      { itemId: 'monster_meat', chance: 1.0, minQuantity: 3, maxQuantity: 5 },
      { itemId: 'health_potion_medium', chance: 0.7, minQuantity: 1, maxQuantity: 2 }
    ],
    gold: { min: 50, max: 100 },
    sprite: 'boar_king_sprite',
    animations: {
      idle: 'boar_king_idle',
      move: 'boar_king_move',
      attack: 'boar_king_attack',
      fierceCharge: 'boar_king_fierce_charge',
      tuskSlash: 'boar_king_tusk_slash',
      groundQuake: 'boar_king_ground_quake',
      summon: 'boar_king_summon',
      enrage: 'boar_king_enrage',
      hurt: 'boar_king_hurt',
      die: 'boar_king_die'
    },
    soundEffects: {
      attack: 'boar_king_attack_sound',
      fierceCharge: 'boar_king_fierce_charge_sound',
      tuskSlash: 'boar_king_tusk_slash_sound',
      groundQuake: 'boar_king_ground_quake_sound',
      summon: 'boar_king_summon_sound',
      enrage: 'boar_king_enrage_sound',
      hurt: 'boar_king_hurt_sound',
      die: 'boar_king_die_sound'
    },
    behavior: 'boss', // 复杂的Boss行为模式
    detectionRadius: 300,
    aggroRadius: 350,
    chargeSpeed: 220, // 冲锋速度
    chargeDamage: 25, // 冲锋伤害
    quakeRadius: 200, // 地震影响范围
    quakeDamage: 15, // 地震伤害
    summonType: 'wild_boar', // 召唤的敌人类型
    summonCount: 2, // 召唤数量
    summonCooldown: 25, // 召唤冷却时间（秒）
    enrageThreshold: 0.3, // 生命值低于30%时进入狂暴状态
    enrageBonus: { // 狂暴状态加成
      attack: 1.5, // 攻击力提升50%
      speed: 1.3, // 速度提升30%
      defense: 0.8 // 防御降低20%
    },
    resistances: { // 抗性
      physical: 0.2,
      fire: -0.1,
      ice: 0.1
    },
    music: 'boar_king_battle_theme' // Boss战斗音乐
  },
 
  
  

  
  DARK_MAGE: {
    id: 'dark_mage',
    name: '黑暗法师',
    description: '精通黑魔法的法师，可以施放多种强大的法术。',
    type: 'elite',
    level: 12,
    stats: {
      health: 150,
      attack: 15,
      defense: 8,
      magicAttack: 30,
      magicDefense: 20,
      speed: 80,
      exp: 120
    },
    abilities: ['shadow_bolt', 'teleport', 'summon_minion', 'dark_shield'],
    drops: [
      { itemId: 'magic_crystal', chance: 0.7, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'mana_potion_large', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'intelligence_potion', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'arcane_staff', chance: 0.1, minQuantity: 1, maxQuantity: 1 }
    ],
    gold: { min: 40, max: 80 },
    sprite: 'dark_mage_sprite',
    animations: {
      idle: 'dark_mage_idle',
      move: 'dark_mage_move',
      attack: 'dark_mage_attack',
      special: 'dark_mage_summon',
      teleport: 'dark_mage_teleport',
      hurt: 'dark_mage_hurt',
      die: 'dark_mage_die'
    },
    soundEffects: {
      attack: 'dark_mage_attack_sound',
      special: 'dark_mage_summon_sound',
      teleport: 'dark_mage_teleport_sound',
      hurt: 'dark_mage_hurt_sound',
      die: 'dark_mage_die_sound'
    },
    behavior: 'caster', // 优先使用法术攻击
    detectionRadius: 300,
    aggroRadius: 350,
    attackRange: 250, // 攻击范围
    teleportThreshold: 0.4, // 生命值低于40%时会尝试传送
    summonCooldown: 30, // 召唤冷却时间（秒）
    summonType: 'skeleton', // 召唤的敌人类型
    maxSummons: 2 // 最大召唤数量
  },
 
  
  // 战士第一章神秘人BOSS
  MYSTERIOUS_STRANGER: {
    id: 'mysterious_stranger',
    name: '神秘人',
    description: '一个身着黑衣、戴着墨镜的神秘人，似乎拥有强大的力量。',
    type: 'boss',
    level: 5,
    characterClass: 'warrior', // 人型BOSS的职业属性
    awakened: true, // 具有觉醒能力
    stats: {
      health: 300,
      attack: 20,
      defense: 15,
      magicAttack: 10,
      magicDefense: 10,
      speed: 100,
      exp: 200
    },
    abilities: ['heavy_strike', 'shadow_slash', 'battle_cry', 'awakening_surge'],
    phases: [
      { threshold: 0.5, abilities: ['enrage', 'awakening_power'] }
    ],
    drops: [
      { itemId: 'mysterious_emblem', chance: 1.0, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'health_potion', chance: 0.8, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'warrior_tome', chance: 0.5, minQuantity: 1, maxQuantity: 1 }
    ],
    gold: { min: 50, max: 100 },
    sprite: 'mysterious_stranger_sprite',
    animations: {
      idle: 'mysterious_stranger_idle',
      move: 'mysterious_stranger_move',
      attack: 'mysterious_stranger_attack',
      special: 'mysterious_stranger_special',
      awakening: 'mysterious_stranger_awakening',
      hurt: 'mysterious_stranger_hurt',
      die: 'mysterious_stranger_die'
    },
    soundEffects: {
      attack: 'mysterious_stranger_attack_sound',
      special: 'mysterious_stranger_special_sound',
      awakening: 'mysterious_stranger_awakening_sound',
      hurt: 'mysterious_stranger_hurt_sound',
      die: 'mysterious_stranger_die_sound'
    },
    behavior: 'aggressive', // 积极进攻型AI
    detectionRadius: 300,
    aggroRadius: 350,
    attackRange: 70, // 近战攻击范围
    specialAttackRange: 150, // 特殊攻击范围
    awakeningThreshold: 0.5, // 生命值低于50%时激活觉醒能力
    forcedOutcome: 'victory', // 强制战斗结果为胜利（剧情需要）
    resistances: {
      physical: 0.2, // 物理伤害减免20%
      fire: 0.1,
      ice: 0.1
    },
    dialogues: {
      encounter: "你不该来这里，勇士！",
      awakening: "现在，感受真正的力量吧！",
      victory: "你还太弱小...去寻找真正的力量吧..."
    }
  },
  
};

export default EnemyData;