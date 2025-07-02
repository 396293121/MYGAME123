/**
 * 统一敌人配置文件
 * 合并原EnemyData.js和EnemyAnimationConfig.js，消除配置重复
 * 提供统一的配置访问接口
 */

// 通用时间配置常量
const TIMING_CONFIG = {
  // 受伤闪烁时间
  HURT_FLASH_DURATION: 100,
  // 攻击判定延时
  ATTACK_HIT_DELAY: 300,
  // 巡逻随机概率
  PATROL_RANDOM_CHANCE: 0.005,
  // 巡逻等待时间
  PATROL_WAIT_TIME: 2000,
  // 基础攻击冷却时间
  BASE_ATTACK_COOLDOWN: 1500,
  // 死亡淡出时间
  DEATH_FADE_DURATION: 2000,
  // 物理体禁用延迟
  BODY_DISABLE_DELAY: 500,
  // 调试显示持续时间
  DEBUG_DISPLAY_DURATION: 200,
  // 状态转换延时
  STATE_TRANSITION_DELAY: 50,
  // 受伤恢复持续时间
  HURT_RECOVERY_DURATION: 500,
  // 死亡动画持续时间
  DEATH_ANIMATION_DURATION: 1000
};

// 通用物理配置常量
const PHYSICS_CONFIG = {
  // 弹跳系数
  BOUNCE: 0.1,
  // 距离判定阈值
  DISTANCE_THRESHOLD: 10,
  // 移动阈值
  MOVEMENT_THRESHOLD: 5
};

// 卡住检测配置常量
const STUCK_DETECTION_CONFIG = {
  // 检测时间间隔（毫秒）
  CHECK_INTERVAL: 2000,
  // 卡住判定时间（毫秒）
  STUCK_TIME_THRESHOLD: 5000,
  // 最小移动距离（像素）
  MIN_MOVEMENT_DISTANCE: 20
};

const EnemyConfig = {
  // 通用配置
  TIMING: TIMING_CONFIG,
  PHYSICS: PHYSICS_CONFIG,
  STUCK_DETECTION: STUCK_DETECTION_CONFIG,
  
  // 野猪配置
  WILD_BOAR: {
    // 基础数据
    id: 'wild_boar',
    name: '野猪',
    description: '铁山村附近常见的野猪，性情暴躁。',
    type: 'normal',
    level: 2,
    
    // 属性配置
    stats: {
      health: 40,
      attack: 18,
      defense: 15,
      speed: 80,
      exp: 15
    },
    
    // 能力配置
    abilities: ['charge', 'tusk_attack'],
    
    // 掉落配置
    drops: [
      { itemId: 'pig_tusk', chance: 0.6, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'thick_hide', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'monster_meat', chance: 0.8, minQuantity: 1, maxQuantity: 2 }
    ],
    gold: { min: 2, max: 8 },
    
    // 精灵和纹理配置
    sprite: 'wild_boar_sprite',
    textureKey: 'wild_boar_sprite',
    
    // 尺寸配置
    standardSize: {
      width: 250,
      height: 141
    },
    
    // 锚点配置
    anchorPoint: {
      x: 0.5,
      y: 1.0
    },
    
    // 物理体配置
    physicsBody: {
      width: 127,
      height: 87,
      offsetX: 0,
      offsetY: 0
    },
    
    // 行为配置（统一原来重复的配置）
    behavior: {
      type: 'territorial',
      detectionRadius: 150,
      aggroRadius: 180,
      attackRange: 40,
      patrolRadius: 100,
      chaseSpeed: 80,
      chargeSpeed: 160,
      returnToPatrolDelay: 3000,
      attackCooldown: 1500,
      chargeTriggerDistance: 80,
      chargeMinDistance: 40,
      chargeCooldown: 5000, // 5秒冷却
      chargeStunDuration: 1500 // 冲锋后眩晕1.5秒
    },
    
    // 时间配置（消除硬编码）
    timing: {
      hurtFlashDuration: TIMING_CONFIG.HURT_FLASH_DURATION,
      attackHitDelay: TIMING_CONFIG.ATTACK_HIT_DELAY,
      chargeDuration: 1000,
      chargeStunDuration: 1500,
      deathFadeDuration: TIMING_CONFIG.DEATH_FADE_DURATION,
      invulnerabilityDuration: 500
    },
    
    // 增强动画系统配置
    enhancedAnimation: {
      charge: {
        speedMultiplier: 2.0,
        duration: 1500,
        cooldown: 5000,
        stunDuration: 1500,
        frameRateMultiplier: 1.5
      },
      attack: {
        keyFrame: { frameNumber: 6 },
        hitbox: {
          width: 60,
          height: 50,
          offsetX: 30,
          offsetY: -10
        },
        knockback: {
          force: 150,
          duration: 300
        }
      },
      hurt: {
        invulnerabilityDuration: 500,
        flashDuration: 100,
        knockbackResistance: 0.7
      },
      die: {
        fadeOutDuration: 1000,
        bodyDisableDelay: 500
      }
    },
    
    // 状态机配置
    stateMachine: {
      states: {
        IDLE: 'idle',
        PATROL: 'patrol',
        CHASE: 'chase',
        ATTACK: 'attack',
        CHARGE: 'charge',
        HURT: 'hurt',
        STUNNED: 'stunned',
        DIE: 'die'
      },
      transitions: {
        idle: ['patrol', 'chase', 'hurt', 'die'],
        patrol: ['idle', 'chase', 'hurt', 'die'],
        chase: ['idle', 'attack', 'charge', 'hurt', 'die'],
        attack: ['idle', 'chase', 'hurt', 'die'],
        charge: ['stunned', 'hurt', 'die'],
        hurt: ['idle', 'chase', 'die'],
        stunned: ['idle', 'chase', 'hurt', 'die'],
        die: []
      }
    },
    
    // 动画配置
    animations: {
      idle: {
        key: 'wild_boar_idle',
        frames: {
          type: 'frameNames',
          prefix: '野猪站立_frame_',
          start: 1,
          end: 16,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 6,
        repeat: -1
      },
      move: {
        key: 'wild_boar_move',
        frames: {
          type: 'frameNames',
          prefix: '野猪奔跑_frame_',
          start: 1,
          end: 28,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 12,
        repeat: -1
      },
      attack: {
        key: 'wild_boar_attack',
        frames: {
          type: 'frameNames',
          prefix: '野猪攻击_frame_',
          start: 1,
          end: 12,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 15,
        repeat: 0
      },
      charge: {
        key: 'wild_boar_charge',
        frames: {
          type: 'frameNames',
          prefix: '野猪冲锋_frame_',
          start: 1,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 18,
        repeat: -1
      },
      hurt: {
        key: 'wild_boar_hurt',
        frames: {
          type: 'frameNames',
          prefix: '野猪受伤_frame_',
          start: 11,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 10,
        repeat: 0
      },
      stunned: {
        key: 'wild_boar_stunned',
        frames: {
          type: 'frameNames',
          prefix: '野猪眩晕_frame_',
          start: 17,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 8,
        repeat: -1
      },
      die: {
        key: 'wild_boar_die',
        frames: {
          type: 'frameNames',
          prefix: '野猪死亡_frame_',
          start: 1,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 15,
        repeat: 0
      }
    },
    
    // 音效配置
    soundEffects: {
      idle: null,
      move: null,
      attack: 'wild_boar_attack_sound',
      charge: 'boar_charge',
      hurt: 'wild_boar_hurt_sound',
      stunned: null,
      die: 'wild_boar_die_sound'
    }
  },
  
  // 大型野猪配置
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
    
    sprite: 'wild_boar_sprite',
    textureKey: 'wild_boar_sprite',
    
    standardSize: {
      width: 160,
      height: 120
    },
    
    physicsBody: {
      width: 80,
      height: 50,
      offsetX: 0,
      offsetY: 25
    },
    
    behavior: {
      type: 'aggressive',
      detectionRadius: 200,
      aggroRadius: 250,
      attackRange: 50,
      patrolRadius: 120,
      chaseSpeed: 70,
      chargeSpeed: 180,
      returnToPatrolDelay: 5000,
      attackCooldown: 2000,
      chargeTriggerDistance: 100,
      chargeMinDistance: 50,
      chargeCooldown: 8000,
      stompRadius: 100,
      stompCooldown: 15000,
      stompTriggerHealthPercent: 0.5
    },
    
    timing: {
      hurtFlashDuration: TIMING_CONFIG.HURT_FLASH_DURATION,
      attackHitDelay: TIMING_CONFIG.ATTACK_HIT_DELAY,
      chargeDuration: 1000,
      chargeStunDuration: 1500,
      deathFadeDuration: TIMING_CONFIG.DEATH_FADE_DURATION,
      invulnerabilityDuration: 500,
      stompChargeTime: 1000
    },
    
    enhancedAnimation: {
      stomp: {
        radius: 100,
        damage: 15,
        cooldown: 15000,
        chargeTime: 1000,
        shakeIntensity: 10
      },
      attack: {
        keyFrame: { frameNumber: 2 },
        hitbox: {
          width: 70,
          height: 50,
          offsetX: 35,
          offsetY: 0
        },
        knockback: {
          force: 200,
          duration: 400
        }
      }
    },
    
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
    }
  },
  
  // 猪王配置
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
    
    sprite: 'wild_boar_sprite',
    textureKey: 'wild_boar_sprite',
    
    behavior: {
      type: 'boss',
      detectionRadius: 300,
      aggroRadius: 350,
      attackRange: 70,
      chargeSpeed: 220,
      chargeDamage: 25,
      quakeRadius: 200,
      quakeDamage: 15,
      summonType: 'wild_boar',
      summonCount: 2,
      summonCooldown: 25000,
      enrageThreshold: 0.3
    },
    
    timing: {
      hurtFlashDuration: TIMING_CONFIG.HURT_FLASH_DURATION,
      attackHitDelay: TIMING_CONFIG.ATTACK_HIT_DELAY,
      deathFadeDuration: TIMING_CONFIG.DEATH_FADE_DURATION
    },
    
    enrageBonus: {
      attack: 1.5,
      speed: 1.3,
      defense: 0.8
    },
    
    resistances: {
      physical: 0.2,
      fire: -0.1,
      ice: 0.1
    },
    
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
    
    music: 'boar_king_battle_theme'
  },
  
  // 神秘人配置
  MYSTERIOUS_STRANGER: {
    id: 'mysterious_stranger',
    name: '神秘人',
    description: '一个身着黑衣、戴着墨镜的神秘人，似乎拥有强大的力量。',
    type: 'boss',
    level: 5,
    characterClass: 'warrior',
    awakened: true,
    
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
    
    behavior: {
      type: 'aggressive',
      detectionRadius: 300,
      aggroRadius: 350,
      attackRange: 70,
      specialAttackRange: 150,
      awakeningThreshold: 0.5
    },
    
    timing: {
      hurtFlashDuration: TIMING_CONFIG.HURT_FLASH_DURATION,
      attackHitDelay: TIMING_CONFIG.ATTACK_HIT_DELAY,
      deathFadeDuration: TIMING_CONFIG.DEATH_FADE_DURATION
    },
    
    forcedOutcome: 'victory',
    
    resistances: {
      physical: 0.2,
      fire: 0.1,
      ice: 0.1
    },
    
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
    
    dialogues: {
      encounter: "你不该来这里，勇士！",
      awakening: "现在，感受真正的力量吧！",
      victory: "你还太弱小...去寻找真正的力量吧..."
    }
  }
};

/**
 * 统一配置访问接口
 */
class EnemyConfigManager {
  /**
   * 获取敌人配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object} 敌人配置对象
   */
  static getConfig(enemyType) {
    const config = EnemyConfig[enemyType.toUpperCase()];
    if (!config) {
      console.warn(`Enemy config not found for type: ${enemyType}`);
      return null;
    }
    return config;
  }
  
  /**
   * 获取敌人行为配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object} 行为配置对象
   */
  static getBehaviorConfig(enemyType) {
    const config = this.getConfig(enemyType);
    return config ? config.behavior : null;
  }
  
  /**
   * 获取敌人时间配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object} 时间配置对象
   */
  static getTimingConfig(enemyType) {
    const config = this.getConfig(enemyType);
    return config ? config.timing : TIMING_CONFIG;
  }
  
  /**
   * 获取敌人动画配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object} 动画配置对象
   */
  static getAnimationConfig(enemyType) {
    const config = this.getConfig(enemyType);
    return config ? config.animations : null;
  }
  
  /**
   * 获取敌人音效配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object} 音效配置对象
   */
  static getSoundConfig(enemyType) {
    const config = this.getConfig(enemyType);
    return config ? config.soundEffects : null;
  }
  
  /**
   * 获取通用时间配置
   * @returns {Object} 通用时间配置
   */
  static getGlobalTimingConfig() {
    return TIMING_CONFIG;
  }
  
  /**
   * 获取通用物理配置
   * @returns {Object} 通用物理配置
   */
  static getGlobalPhysicsConfig() {
    return PHYSICS_CONFIG;
  }
  
  /**
   * 获取敌人数据（别名方法，用于向后兼容）
   * @param {string} enemyType - 敌人类型
   * @returns {Object} 敌人配置对象
   */
  static getEnemyData(enemyType) {
    return this.getConfig(enemyType);
  }
  
  /**
   * 获取通用时间配置（别名方法）
   * @returns {Object} 通用时间配置
   */
  static getTimingConfig() {
    return TIMING_CONFIG;
  }
  
  /**
   * 获取通用物理配置（别名方法）
   * @returns {Object} 通用物理配置
   */
  static getPhysicsConfig() {
    return PHYSICS_CONFIG;
  }
  
  /**
   * 获取卡住检测配置
   * @returns {Object} 卡住检测配置
   */
  static getStuckDetectionConfig() {
    return STUCK_DETECTION_CONFIG;
  }
}

// 向后兼容性支持
const EnemyData = {};
Object.keys(EnemyConfig).forEach(key => {
  if (key !== 'TIMING' && key !== 'PHYSICS') {
    EnemyData[key] = EnemyConfig[key];
  }
});

export { EnemyConfig, EnemyConfigManager, TIMING_CONFIG, PHYSICS_CONFIG, STUCK_DETECTION_CONFIG };
export default EnemyData; // 保持向后兼容性