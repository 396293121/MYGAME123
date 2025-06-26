/**
 * 法师职业类
 * 高魔攻较高魔法低物防中速，使用远程攻击，武器类型为法杖
 */
import Character from './Character.js';

class Mage extends Character {
  constructor(scene, x, y) {
    // 使用法师的默认纹理
    super(scene, x, y, 'mage', 0);
    
    // 法师特有属性调整
    this.attributes = {
      strength: 3,      // 法师力量较低
      agility: 5,       // 法师敏捷中等
      vitality: 4,      // 法师体力较低
      intelligence: 9   // 法师智力高
    };
    
    // 更新衍生属性
    this.updateStats();
    
    // 法师特有的属性
    this.weaponType = 'staff';
    this.attackRange = 'ranged'; // 远程攻击
    
    // 法师特有技能
    this.classSkills = {
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
      }
    };
    
    // 法师初始魔法值更高
    this.maxMana = 100;
    this.mana = 100;
  }
  
  // 重写更新衍生属性方法，强化法师的魔法攻击和魔法防御
  updateStats() {
    super.updateStats();
    
    // 法师的魔法攻击加成更高
    this.stats.magicAttack += this.attributes.intelligence * 0.8;
    
    // 法师的魔法防御加成
    this.stats.magicDefense += this.attributes.intelligence * 0.3;
    
    // 法师的物理防御较低
    this.stats.physicalDefense -= 2;
    
    // 更新最大魔法值
    this.maxMana = 100 + (this.attributes.intelligence * 10);
  }
  
  // 重写攻击方法
  attack() {
    console.log('Mage casts a magic bolt!');
    // 这里可以添加法师特有的攻击动画和效果
    
    // 返回伤害值，基于魔法攻击力
    return this.stats.magicAttack;
  }
  
  // 法师特有技能 - 火球术
  fireball() {
    if (this.useSkill('fireball')) {
      console.log('Mage casts Fireball!');
      // 造成魔法伤害
      return {
        damage: this.stats.magicAttack * 1.2,
        type: 'magic',
        element: 'fire'
      };
    }
    return 0;
  }
  
  // 法师特有技能 - 冰刺
  iceSpike() {
    if (this.useSkill('ice_spike')) {
      console.log('Mage casts Ice Spike!');
      // 返回伤害值和减速效果
      return {
        damage: this.stats.magicAttack * 0.9,
        type: 'magic',
        element: 'ice',
        effect: {
          type: 'slow',
          amount: 0.3, // 减速30%
          duration: 3000 // 3秒
        }
      };
    }
    return 0;
  }
  
  // 法师特有技能 - 奥术爆炸
  arcaneExplosion() {
    if (this.useSkill('arcane_explosion')) {
      console.log('Mage casts Arcane Explosion!');
      
      // 范围伤害
      return {
        damage: this.stats.magicAttack * 0.8,
        type: 'magic',
        element: 'arcane',
        radius: 150 // 爆炸半径
      };
    }
    return 0;
  }
  
  // 法师特有的魔法值恢复方法
  regenerateMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
    return this.mana;
  }
}

export default Mage;