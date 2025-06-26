/**
 * 角色基类
 * 所有职业角色的基础类
 */
class Character {
  constructor(scene, x, y, texture, frame) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture, frame);
    
    // 基础属性
    this.level = 1;
    this.exp = 0;
    this.maxHealth = 100;
    this.health = 100;
    this.mana = 50;
    this.maxMana = 50;
    
    // 核心属性
    this.attributes = {
      strength: 5,     // 力量，影响物理攻击
      agility: 5,      // 敏捷，影响移动速度和闪避
      vitality: 5,     // 体力，影响生命值
      intelligence: 5  // 智力，影响魔法攻击和魔法值
    };
    
    // 衍生属性
    this.stats = {
      physicalAttack: 10,   // 物理攻击力
      magicAttack: 5,       // 魔法攻击力
      physicalDefense: 5,   // 物理防御力
      magicDefense: 5,      // 魔法防御力
      speed: 100,           // 移动速度
      jumpForce: 300        // 跳跃力
    };
    
    // 技能和升级
    this.skillPoints = 0;
    this.unlockedSkills = [];
    
    // 设置物理属性
    this.sprite.setCollideWorldBounds(true);
    
    // 动画状态
    this.state = 'idle';
  }
  
  // 更新角色状态
  update() {
    // 基础更新逻辑
  }
  
  // 经验值和升级
  addExp(amount) {
    this.exp += amount;
    const requiredExp = this.level * 100;
    if (this.exp >= requiredExp) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.level++;
    this.exp -= this.level * 100;
    this.skillPoints += 3;
    
    // 每级增加基础属性
    this.attributes.strength += 1;
    this.attributes.agility += 1;
    this.attributes.vitality += 1;
    this.attributes.intelligence += 1;
    
    // 更新衍生属性
    this.updateStats();
    
    // 恢复生命值和魔法值
    this.health = this.maxHealth;
    this.mana = this.maxMana;
  }
  
  // 更新衍生属性
  updateStats() {
    // 基础更新逻辑，子类可以重写此方法
    this.stats.physicalAttack = 5 + (this.attributes.strength * 2);
    this.stats.magicAttack = 5 + (this.attributes.intelligence * 2);
    this.stats.physicalDefense = 5 + (this.attributes.vitality);
    this.stats.magicDefense = 5 + (this.attributes.intelligence);
    this.stats.speed = 100 + (this.attributes.agility * 5);
    
    // 更新最大生命值和魔法值
    this.maxHealth = 100 + (this.attributes.vitality * 10);
    this.maxMana = 50 + (this.attributes.intelligence * 5);
  }
  
  // 技能解锁
  unlockSkill(skillId) {
    if (this.skillPoints > 0 && !this.unlockedSkills.includes(skillId)) {
      this.unlockedSkills.push(skillId);
      this.skillPoints--;
      return true;
    }
    return false;
  }
  
  // 基础攻击方法
  attack() {
    // 基础攻击逻辑，子类可以重写
    console.log(`${this.constructor.name} performs a basic attack`);
  }
  
  // 受伤方法
  takeDamage(amount, damageType = 'physical') {
    let actualDamage = amount;
    
    // 根据伤害类型应用不同的防御
    if (damageType === 'physical') {
      actualDamage = Math.max(1, amount - this.stats.physicalDefense);
    } else if (damageType === 'magic') {
      actualDamage = Math.max(1, amount - this.stats.magicDefense);
    }
    
    this.health -= actualDamage;
    
    // 确保生命值不会低于0
    if (this.health < 0) {
      this.health = 0;
      this.die();
    }
    
    return actualDamage;
  }
  
  // 死亡方法
  die() {
    console.log(`${this.constructor.name} has died`);
    // 子类可以重写此方法以添加特定的死亡行为
  }
  
  // 使用技能
  useSkill(skillId) {
    // 检查技能是否已解锁
    if (!this.unlockedSkills.includes(skillId)) {
      console.log(`Skill ${skillId} not unlocked`);
      return false;
    }
    
    // 获取技能信息
    const skill = Skills[skillId];
    if (!skill) {
      console.log(`Skill ${skillId} not found`);
      return false;
    }
    
    // 检查魔法值是否足够
    if (this.mana < skill.manaCost) {
      console.log('Not enough mana');
      return false;
    }
    
    // 使用魔法值
    this.mana -= skill.manaCost;
    
    // 执行技能效果（这里只是一个占位符，实际效果应该在子类中实现）
    console.log(`Using skill: ${skill.name}`);
    
    return true;
  }
}

export default Character;