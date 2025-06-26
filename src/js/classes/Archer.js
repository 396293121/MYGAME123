/**
 * 射手职业类
 * 高攻高速较低物防较低魔防，远程攻击武器为弓箭
 */
import Character from './Character.js';

class Archer extends Character {
  constructor(scene, x, y) {
    // 使用射手的默认纹理
    super(scene, x, y, 'archer', 0);
    
    // 射手特有属性调整
    this.attributes = {
      strength: 6,      // 射手力量中等偏高
      agility: 9,       // 射手敏捷高
      vitality: 4,      // 射手体力较低
      intelligence: 4   // 射手智力较低
    };
    
    // 更新衍生属性
    this.updateStats();
    
    // 射手特有的属性
    this.weaponType = 'bow';
    this.attackRange = 'ranged'; // 远程攻击
    this.criticalChance = 0.15;  // 15%暴击率
    this.criticalDamage = 1.5;   // 150%暴击伤害
    
    // 射手特有技能
    this.classSkills = {
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
      }
    };
  }
  
  // 重写更新衍生属性方法，强化射手的攻击和速度
  updateStats() {
    super.updateStats();
    
    // 射手的物理攻击加成
    this.stats.physicalAttack += this.attributes.strength * 0.3 + this.attributes.agility * 0.3;
    
    // 射手的速度加成
    this.stats.speed += this.attributes.agility * 3;
    
    // 射手的物理防御和魔法防御较低
    this.stats.physicalDefense -= 1;
    this.stats.magicDefense -= 1;
    
    // 射手的暴击率随敏捷提高
    this.criticalChance = 0.15 + (this.attributes.agility * 0.01);
  }
  
  // 重写攻击方法
  attack() {
    console.log('Archer fires an arrow!');
    // 这里可以添加射手特有的攻击动画和效果
    
    // 计算是否暴击
    const isCritical = Math.random() < this.criticalChance;
    
    // 返回伤害值，基于物理攻击力，考虑暴击
    let damage = this.stats.physicalAttack;
    if (isCritical) {
      damage *= this.criticalDamage;
      console.log('Critical hit!');
    }
    
    return {
      damage: damage,
      isCritical: isCritical,
      type: 'physical',
      range: 'ranged'
    };
  }
  
  // 射手特有技能 - 快速射击
  quickShot() {
    if (this.useSkill('quick_shot')) {
      console.log('Archer performs Quick Shot!');
      
      // 造成80%的物理伤害，但冷却时间短
      return {
        damage: this.stats.physicalAttack * 0.8,
        type: 'physical',
        range: 'ranged'
      };
    }
    return 0;
  }
  
  // 射手特有技能 - 穿透箭
  piercingArrow() {
    if (this.useSkill('piercing_arrow')) {
      console.log('Archer fires a Piercing Arrow!');
      
      // 返回伤害值和穿透效果
      return {
        damage: this.stats.physicalAttack * 1.1,
        type: 'physical',
        range: 'ranged',
        piercing: true, // 可以穿透多个敌人
        maxTargets: 3   // 最多穿透3个目标
      };
    }
    return 0;
  }
  
  // 射手特有技能 - 箭雨
  rainOfArrows() {
    if (this.useSkill('rain_of_arrows')) {
      console.log('Archer unleashes Rain of Arrows!');
      
      // 范围伤害
      return {
        damage: this.stats.physicalAttack * 0.6, // 每支箭的伤害
        type: 'physical',
        range: 'ranged',
        radius: 120,    // 影响半径
        arrows: 8,      // 箭的数量
        duration: 2000  // 持续时间（毫秒）
      };
    }
    return 0;
  }
  
  // 射手特有的闪避方法
  dodge() {
    // 基于敏捷计算闪避几率
    const dodgeChance = 0.05 + (this.attributes.agility * 0.01);
    return Math.random() < dodgeChance;
  }
}

export default Archer;