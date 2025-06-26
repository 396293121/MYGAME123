/**
 * 技能系统
 * 管理游戏中所有可用的技能
 */

class SkillSystem {
  constructor() {
    // 通用技能
    this.commonSkills = {
      DOUBLE_JUMP: {
        id: 'double_jump',
        name: "二段跳",
        description: "允许在空中再次跳跃",
        cost: 1,
        unlockLevel: 3,
        passive: true
      },
      DASH: {
        id: 'dash',
        name: "冲刺",
        description: "快速向前冲刺一小段距离",
        manaCost: 10,
        cooldown: 3000, // 3秒冷却
        unlockLevel: 5
      },
      HEALTH_POTION: {
        id: 'health_potion',
        name: "生命药水",
        description: "恢复30%生命值",
        cooldown: 30000, // 30秒冷却
        consumable: true,
        unlockLevel: 1
      }
    };
    
    // 战士特有技能
    this.warriorSkills = {
      HEAVY_SLASH: {
        id: 'heavy_slash',
        name: "重斩",
        description: "对目标造成150%物理伤害",
        manaCost: 10,
        cooldown: 3000, // 3秒冷却
        unlockLevel: 3
      },
      SHIELD_BASH: {
        id: 'shield_bash',
        name: "盾击",
        description: "对目标造成伤害并眩晕1秒",
        manaCost: 15,
        cooldown: 5000, // 5秒冷却
        unlockLevel: 5
      },
      BATTLE_CRY: {
        id: 'battle_cry',
        name: "战吼",
        description: "提高自身20%攻击力，持续10秒",
        manaCost: 25,
        cooldown: 15000, // 15秒冷却
        unlockLevel: 7
      },
      WHIRLWIND: {
        id: 'whirlwind',
        name: "旋风斩",
        description: "对周围敌人造成伤害",
        manaCost: 30,
        cooldown: 10000, // 10秒冷却
        unlockLevel: 10
      }
    };
    
    // 法师特有技能
    this.mageSkills = {
      FIREBALL: {
        id: 'fireball',
        name: "火球术",
        description: "发射一个火球，造成魔法伤害",
        manaCost: 15,
        cooldown: 2000, // 2秒冷却
        unlockLevel: 3
      },
      ICE_SPIKE: {
        id: 'ice_spike',
        name: "冰刺",
        description: "发射冰刺，造成伤害并减速目标",
        manaCost: 20,
        cooldown: 4000, // 4秒冷却
        unlockLevel: 5
      },
      ARCANE_EXPLOSION: {
        id: 'arcane_explosion',
        name: "奥术爆炸",
        description: "释放奥术能量，对周围敌人造成伤害",
        manaCost: 30,
        cooldown: 8000, // 8秒冷却
        unlockLevel: 7
      },
      TELEPORT: {
        id: 'teleport',
        name: "传送",
        description: "瞬间传送到指定位置",
        manaCost: 25,
        cooldown: 12000, // 12秒冷却
        unlockLevel: 10
      }
    };
    
    // 射手特有技能
    this.archerSkills = {
      QUICK_SHOT: {
        id: 'quick_shot',
        name: "快速射击",
        description: "快速射出一箭，造成80%伤害但冷却时间短",
        manaCost: 8,
        cooldown: 1500, // 1.5秒冷却
        unlockLevel: 3
      },
      PIERCING_ARROW: {
        id: 'piercing_arrow',
        name: "穿透箭",
        description: "射出一支可穿透多个敌人的箭",
        manaCost: 15,
        cooldown: 5000, // 5秒冷却
        unlockLevel: 5
      },
      RAIN_OF_ARROWS: {
        id: 'rain_of_arrows',
        name: "箭雨",
        description: "向空中射出多支箭，落下时对范围内敌人造成伤害",
        manaCost: 25,
        cooldown: 12000, // 12秒冷却
        unlockLevel: 7
      },
      EAGLE_EYE: {
        id: 'eagle_eye',
        name: "鹰眼",
        description: "提高暴击率30%，持续8秒",
        manaCost: 20,
        cooldown: 20000, // 20秒冷却
        unlockLevel: 10
      }
    };
    
    // 合并所有技能到一个对象中
    this.allSkills = {
      ...this.commonSkills,
      ...this.warriorSkills,
      ...this.mageSkills,
      ...this.archerSkills
    };
  }
  
  // 获取技能信息
  getSkill(skillId) {
    return this.allSkills[skillId];
  }
  
  // 获取特定职业的技能列表
  getClassSkills(className) {
    switch(className.toLowerCase()) {
      case 'warrior':
        return { ...this.commonSkills, ...this.warriorSkills };
      case 'mage':
        return { ...this.commonSkills, ...this.mageSkills };
      case 'archer':
        return { ...this.commonSkills, ...this.archerSkills };
      default:
        return this.commonSkills;
    }
  }
  
  // 检查技能是否可用（冷却、魔法值等）
  isSkillAvailable(character, skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return false;
    
    // 检查角色等级
    if (character.level < skill.unlockLevel) return false;
    
    // 检查技能是否已解锁
    if (!character.unlockedSkills.includes(skillId)) return false;
    
    // 检查魔法值
    if (skill.manaCost && character.mana < skill.manaCost) return false;
    
    // 检查冷却时间（这需要一个冷却系统的实现）
    // 这里假设character有一个cooldowns对象来跟踪技能冷却
    if (skill.cooldown && character.cooldowns && character.cooldowns[skillId] > Date.now()) {
      return false;
    }
    
    return true;
  }
  
  // 使用技能
  useSkill(character, skillId, ...args) {
    if (!this.isSkillAvailable(character, skillId)) {
      return false;
    }
    
    const skill = this.getSkill(skillId);
    
    // 消耗魔法值
    if (skill.manaCost) {
      character.mana -= skill.manaCost;
    }
    
    // 设置冷却时间
    if (skill.cooldown) {
      if (!character.cooldowns) character.cooldowns = {};
      character.cooldowns[skillId] = Date.now() + skill.cooldown;
    }
    
    // 执行技能效果（这里只是一个占位符，实际效果应该在角色类中实现）
    console.log(`${character.constructor.name} uses ${skill.name}`);
    
    // 如果角色有对应的技能方法，则调用它
    const methodName = this.skillIdToMethodName(skillId);
    if (typeof character[methodName] === 'function') {
      return character[methodName](...args);
    }
    
    return true;
  }
  
  // 将技能ID转换为方法名
  skillIdToMethodName(skillId) {
    // 例如：'heavy_slash' -> 'heavySlash'
    return skillId.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }
}

export default SkillSystem;