/**
 * 物品基类
 * 所有游戏物品的基础类
 */
class Item {
  constructor(config) {
    this.id = config.id || 'unknown_item';
    this.name = config.name || 'Unknown Item';
    this.description = config.description || 'No description available.';
    this.type = config.type || 'misc'; // misc, weapon, armor, accessory, consumable
    this.rarity = config.rarity || 'common'; // common, uncommon, rare, epic, legendary
    this.icon = config.icon || 'default_item_icon';
    this.stackable = config.stackable !== undefined ? config.stackable : false;
    this.maxStack = config.maxStack || 1;
    this.value = config.value || 0; // 商店价值
    this.usable = config.usable !== undefined ? config.usable : false;
    
    // 物品效果（如果有）
    this.effects = config.effects || [];
  }
  
  // 使用物品
  use(character) {
    if (!this.usable) {
      console.log(`${this.name} cannot be used.`);
      return false;
    }
    
    console.log(`${character.constructor.name} uses ${this.name}`);
    
    // 应用物品效果
    this.applyEffects(character);
    
    return true;
  }
  
  // 应用物品效果
  applyEffects(character) {
    if (!this.effects || this.effects.length === 0) return;
    
    this.effects.forEach(effect => {
      switch (effect.type) {
        case 'heal':
          this.applyHealEffect(character, effect);
          break;
        case 'mana':
          this.applyManaEffect(character, effect);
          break;
        case 'buff':
          this.applyBuffEffect(character, effect);
          break;
        case 'damage':
          this.applyDamageEffect(character, effect);
          break;
        default:
          console.log(`Unknown effect type: ${effect.type}`);
      }
    });
  }
  
  // 治疗效果
  applyHealEffect(character, effect) {
    const amount = effect.value;
    const oldHealth = character.health;
    
    character.health = Math.min(character.health + amount, character.maxHealth);
    
    const healedAmount = character.health - oldHealth;
    console.log(`${character.constructor.name} healed for ${healedAmount} health.`);
  }
  
  // 魔法恢复效果
  applyManaEffect(character, effect) {
    const amount = effect.value;
    const oldMana = character.mana;
    
    character.mana = Math.min(character.mana + amount, character.maxMana);
    
    const restoredAmount = character.mana - oldMana;
    console.log(`${character.constructor.name} restored ${restoredAmount} mana.`);
  }
  
  // 增益效果
  applyBuffEffect(character, effect) {
    // 增益效果需要在角色上添加临时状态
    if (!character.buffs) character.buffs = [];
    
    // 创建增益对象
    const buff = {
      id: effect.id || `${this.id}_buff`,
      stat: effect.stat, // 影响的属性
      value: effect.value, // 增益值
      duration: effect.duration || 10000, // 持续时间（毫秒）
      startTime: Date.now() // 开始时间
    };
    
    // 添加增益
    character.buffs.push(buff);
    
    console.log(`${character.constructor.name} gained ${buff.stat} +${buff.value} for ${buff.duration/1000}s.`);
    
    // 设置增益结束计时器
    setTimeout(() => {
      // 移除增益
      if (character.buffs) {
        const index = character.buffs.findIndex(b => b.id === buff.id);
        if (index !== -1) {
          character.buffs.splice(index, 1);
          console.log(`${buff.stat} buff expired for ${character.constructor.name}.`);
        }
      }
    }, buff.duration);
  }
  
  // 伤害效果（用于攻击性物品）
  applyDamageEffect(character, effect) {
    // 这个方法通常用于对敌人造成伤害
    // 在这个基础实现中，我们假设角色有一个attack方法
    if (typeof character.attack === 'function') {
      character.attack(effect.value, effect.damageType || 'physical');
    }
  }
  
  // 获取物品信息
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      value: this.value,
      usable: this.usable
    };
  }
  
  // 获取物品描述文本
  getDescription() {
    let desc = this.description;
    
    // 添加效果描述
    if (this.effects && this.effects.length > 0) {
      desc += '\n\nEffects:';
      this.effects.forEach(effect => {
        switch (effect.type) {
          case 'heal':
            desc += `\n- Restores ${effect.value} health`;
            break;
          case 'mana':
            desc += `\n- Restores ${effect.value} mana`;
            break;
          case 'buff':
            desc += `\n- Increases ${effect.stat} by ${effect.value} for ${effect.duration/1000}s`;
            break;
          case 'damage':
            desc += `\n- Deals ${effect.value} ${effect.damageType || 'physical'} damage`;
            break;
        }
      });
    }
    
    return desc;
  }
}

export default Item;