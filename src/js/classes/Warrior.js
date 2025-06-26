/**
 * 战士职业类
 * 高攻高物防但低速较低魔防，使用近战攻击，武器类型为剑
 */
import Character from './Character.js';

class Warrior extends Character {
  constructor(scene, x, y) {
    // 使用战士的默认纹理
    super(scene, x, y, 'warrior', 0);
    
    // 战士特有属性调整
    this.attributes = {
      strength: 8,      // 战士起始力量更高
      agility: 4,       // 战士敏捷较低
      vitality: 7,      // 战士体力较高
      intelligence: 3   // 战士智力较低
    };
    
    // 更新衍生属性
    this.updateStats();
    
    // 战士特有的属性
    this.weaponType = 'sword';
    this.attackRange = 'melee'; // 近战攻击
    
    // 战士特有技能
    this.classSkills = {
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
      }
    };
  }
  
  // 重写更新衍生属性方法，强化战士的物理攻击和防御
  updateStats() {
    super.updateStats();
    
    // 战士的物理攻击和防御加成更高
    this.stats.physicalAttack += this.attributes.strength * 0.5;
    this.stats.physicalDefense += this.attributes.vitality * 0.5;
    
    // 战士的魔法防御较低
    this.stats.magicDefense -= 2;
    
    // 战士的速度较慢
    this.stats.speed -= 10;
  }
  
  // 重写攻击方法
  attack() {
    console.log('Warrior performs a sword slash!');
    // 这里可以添加战士特有的攻击动画和效果
    
    // 返回伤害值，基于物理攻击力
    return this.stats.physicalAttack;
  }
  
  // 战士特有技能 - 重斩
  heavySlash() {
    if (this.useSkill('heavy_slash')) {
      console.log('Warrior performs Heavy Slash!');
      // 造成150%的物理伤害
      return this.stats.physicalAttack * 1.5;
    }
    return 0;
  }
  
  // 战士特有技能 - 盾击
  shieldBash() {
    if (this.useSkill('shield_bash')) {
      console.log('Warrior performs Shield Bash!');
      // 返回伤害值和眩晕效果
      return {
        damage: this.stats.physicalAttack * 0.8,
        effect: {
          type: 'stun',
          duration: 1000 // 1秒眩晕
        }
      };
    }
    return 0;
  }
  
  // 战士特有技能 - 战吼
  battleCry() {
    if (this.useSkill('battle_cry')) {
      console.log('Warrior performs Battle Cry!');
      
      // 提高攻击力
      const originalAttack = this.stats.physicalAttack;
      this.stats.physicalAttack *= 1.2;
      
      // 10秒后恢复
      setTimeout(() => {
        this.stats.physicalAttack = originalAttack;
        console.log('Battle Cry effect ended');
      }, 10000);
      
      return true;
    }
    return false;
  }
}

export default Warrior;