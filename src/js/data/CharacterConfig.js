/**
 * 角色配置文件
 * 定义所有角色的基础属性和职业特性
 * 避免在类构造方法中硬编码参数
 */

const CHARACTER_CONFIGS = {
  warrior: {
    // 基础属性配置
    attributes: {
      strength: 8,      // 战士起始力量更高
      agility: 4,       // 战士敏捷较低
      vitality: 7,      // 战士体力较高
      intelligence: 3   // 战士智力较低
    },
    
    // 职业特性
    weaponType: 'sword',
    attackRange: 'melee', // 近战攻击
    
    // 技能键位映射配置
    skillKeyMappings: {
      'Q': { skillId: 'heavy_slash', methodName: 'heavySlash' },
      'W': { skillId: 'whirlwind', methodName: 'whirlwind' },
      'E': { skillId: 'battle_cry', methodName: 'battleCry' }
    },
    
    // 技能动画列表
    skillAnimations: ['heavy_slash', 'whirlwind', 'battle_cry'],
    
    // 技能配置
    classSkills: {
      HEAVY_SLASH: {
        name: '重斩',
        description: '造成150%攻击力的强力一击',
        damage: 1.5,
        cooldown: 5000, // 5秒冷却
        range: 80,
        attackType: 'single'
      },
      WHIRLWIND: {
        name: '旋风斩',
        description: '对周围所有敌人造成120%攻击力的伤害',
        damage: 1.2,
        cooldown: 8000, // 8秒冷却
        range: 120,
        attackType: 'aoe',
        // 旋风斩攻击范围配置
        attackArea: {
          width: 195,
          height: 144,
          offsetX: -92.5,
          offsetY: 0  // 调整Y偏移，使攻击判定矩形框底部中心与角色脚底中心对齐
        }
      },
      BATTLE_CRY: {
        name: '战吼',
        description: '提高20%攻击力，持续10秒，并震慑周围敌人',
        buffMultiplier: 1.2,
        duration: 10000, // 10秒持续时间
        cooldown: 15000, // 15秒冷却
        attackType: 'buff',
        // 震慑效果配置
        stunRange: {
          width: 200,
          height: 100,
          offsetX: -100,
          offsetY: -50
        },
        stunDuration: 2000 // 2秒眩晕
      }
    }
  },
  
  mage: {
    // 法师配置（预留）
    attributes: {
      strength: 3,
      agility: 5,
      vitality: 4,
      intelligence: 8
    },
    weaponType: 'staff',
    attackRange: 'ranged',
    
    // 技能键位映射配置
    skillKeyMappings: {
      'Q': { skillId: 'fireball', methodName: 'fireball' },
      'W': { skillId: 'ice_shard', methodName: 'iceShard' },
      'E': { skillId: 'lightning_bolt', methodName: 'lightningBolt' }
    },
    
    // 技能动画列表
    skillAnimations: ['fireball', 'ice_shard', 'lightning_bolt'],
    
    classSkills: {
      // 法师技能配置可在此添加
    }
  },
  
  archer: {
    // 弓箭手配置（预留）
    attributes: {
      strength: 5,
      agility: 8,
      vitality: 5,
      intelligence: 4
    },
    weaponType: 'bow',
    attackRange: 'ranged',
    
    // 技能键位映射配置
    skillKeyMappings: {
      'Q': { skillId: 'power_shot', methodName: 'powerShot' },
      'W': { skillId: 'multi_shot', methodName: 'multiShot' },
      'E': { skillId: 'explosive_arrow', methodName: 'explosiveArrow' }
    },
    
    // 技能动画列表
    skillAnimations: ['power_shot', 'multi_shot', 'explosive_arrow'],
    
    classSkills: {
      // 弓箭手技能配置可在此添加
    }
  }
};

/**
 * 获取角色配置
 * @param {string} characterType - 角色类型
 * @returns {Object|null} 角色配置对象
 */
function getCharacterConfig(characterType) {
  return CHARACTER_CONFIGS[characterType] || null;
}

/**
 * 获取角色属性配置
 * @param {string} characterType - 角色类型
 * @returns {Object|null} 属性配置对象
 */
function getCharacterAttributes(characterType) {
  const config = getCharacterConfig(characterType);
  return config ? config.attributes : null;
}

/**
 * 获取角色技能配置
 * @param {string} characterType - 角色类型
 * @returns {Object|null} 技能配置对象
 */
function getCharacterSkills(characterType) {
  const config = getCharacterConfig(characterType);
  return config ? config.classSkills : null;
}

export { CHARACTER_CONFIGS, getCharacterConfig, getCharacterAttributes, getCharacterSkills };
export default CHARACTER_CONFIGS;