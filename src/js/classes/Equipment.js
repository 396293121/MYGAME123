/**
 * 装备类
 * 可以被角色装备的物品
 */
import Item from './Item.js';

class Equipment extends Item {
  constructor(config) {
    // 确保类型是装备类型
    config.type = config.type || 'weapon';
    config.stackable = false; // 装备不可堆叠
    
    super(config);
    
    // 装备特有属性
    this.slot = config.slot || 'weapon'; // weapon, armor, helmet, accessory
    this.stats = config.stats || {}; // { attack: 10, defense: 5, ... }
    this.durability = config.durability !== undefined ? config.durability : -1; // -1表示无限耐久
    this.maxDurability = this.durability;
    this.level = config.level || 1; // 装备等级
    this.requiredLevel = config.requiredLevel || 1; // 使用所需等级
    this.equipped = false; // 是否已装备
    
    // 特殊效果
    this.specialEffects = config.specialEffects || [];
    
    // 职业限制
    this.classRestrictions = config.classRestrictions || []; // 空数组表示无限制
  }
  
  // 装备到角色
  equip(character) {
    // 检查等级要求
    if (character.level < this.requiredLevel) {
      console.log(`${character.constructor.name} is not high enough level to equip ${this.name}.`);
      return false;
    }
    
    // 检查职业限制
    if (this.classRestrictions.length > 0) {
      const characterClass = character.constructor.name.toLowerCase();
      if (!this.classRestrictions.includes(characterClass)) {
        console.log(`${this.name} cannot be equipped by ${character.constructor.name}.`);
        return false;
      }
    }
    
    // 应用装备属性加成
    this.applyStats(character);
    
    // 应用特殊效果
    this.applySpecialEffects(character);
    
    this.equipped = true;
    console.log(`${character.constructor.name} equipped ${this.name}.`);
    
    return true;
  }
  
  // 从角色卸下
  unequip(character) {
    // 移除装备属性加成
    this.removeStats(character);
    
    // 移除特殊效果
    this.removeSpecialEffects(character);
    
    this.equipped = false;
    console.log(`${character.constructor.name} unequipped ${this.name}.`);
    
    return true;
  }
  
  // 应用装备属性加成
  applyStats(character) {
    // 保存原始属性用于卸下时恢复
    this.originalStats = {};
    
    // 应用每个属性加成
    for (const [stat, value] of Object.entries(this.stats)) {
      // 保存原始值
      if (character.stats[stat] !== undefined) {
        this.originalStats[stat] = character.stats[stat];
        character.stats[stat] += value;
      } else if (character.attributes[stat] !== undefined) {
        this.originalStats[stat] = character.attributes[stat];
        character.attributes[stat] += value;
      }
    }
    
    // 更新角色衍生属性
    if (typeof character.updateStats === 'function') {
      character.updateStats();
    }
  }
  
  // 移除装备属性加成
  removeStats(character) {
    // 恢复原始属性
    for (const [stat, value] of Object.entries(this.stats)) {
      if (character.stats[stat] !== undefined && this.originalStats[stat] !== undefined) {
        character.stats[stat] = this.originalStats[stat];
      } else if (character.attributes[stat] !== undefined && this.originalStats[stat] !== undefined) {
        character.attributes[stat] = this.originalStats[stat];
      }
    }
    
    // 更新角色衍生属性
    if (typeof character.updateStats === 'function') {
      character.updateStats();
    }
    
    // 清除原始属性记录
    this.originalStats = {};
  }
  
  // 应用特殊效果
  applySpecialEffects(character) {
    this.specialEffects.forEach(effect => {
      // 这里可以实现各种特殊效果
      // 例如：添加技能、改变外观、增加特殊能力等
      console.log(`Applied special effect: ${effect.name} to ${character.constructor.name}`);
      
      // 如果效果是添加技能
      if (effect.type === 'addSkill' && effect.skillId) {
        if (!character.equipmentSkills) character.equipmentSkills = [];
        character.equipmentSkills.push(effect.skillId);
      }
      
      // 如果效果是改变外观
      if (effect.type === 'changeAppearance' && effect.texture) {
        this.originalTexture = character.sprite.texture.key;
        character.sprite.setTexture(effect.texture);
      }
    });
  }
  
  // 移除特殊效果
  removeSpecialEffects(character) {
    this.specialEffects.forEach(effect => {
      console.log(`Removed special effect: ${effect.name} from ${character.constructor.name}`);
      
      // 如果效果是添加技能
      if (effect.type === 'addSkill' && effect.skillId) {
        if (character.equipmentSkills) {
          const index = character.equipmentSkills.indexOf(effect.skillId);
          if (index !== -1) {
            character.equipmentSkills.splice(index, 1);
          }
        }
      }
      
      // 如果效果是改变外观
      if (effect.type === 'changeAppearance' && this.originalTexture) {
        character.sprite.setTexture(this.originalTexture);
        this.originalTexture = null;
      }
    });
  }
  
  // 减少耐久度
  reduceDurability(amount = 1) {
    // 如果是无限耐久，直接返回
    if (this.durability === -1) return true;
    
    this.durability -= amount;
    
    // 检查是否耐久已尽
    if (this.durability <= 0) {
      this.durability = 0;
      console.log(`${this.name} has broken!`);
      return false;
    }
    
    return true;
  }
  
  // 修复装备
  repair(amount) {
    // 如果是无限耐久，不需要修复
    if (this.durability === -1) return;
    
    this.durability = Math.min(this.durability + amount, this.maxDurability);
    console.log(`${this.name} repaired. Durability: ${this.durability}/${this.maxDurability}`);
  }
  
  // 获取装备信息
  getInfo() {
    const info = super.getInfo();
    
    // 添加装备特有信息
    info.slot = this.slot;
    info.stats = this.stats;
    info.durability = this.durability;
    info.maxDurability = this.maxDurability;
    info.level = this.level;
    info.requiredLevel = this.requiredLevel;
    
    return info;
  }
  
  // 重写获取描述方法
  getDescription() {
    let desc = super.getDescription();
    
    // 添加装备属性描述
    desc += '\n\nStats:';
    for (const [stat, value] of Object.entries(this.stats)) {
      desc += `\n- ${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${value}`;
    }
    
    // 添加耐久度信息
    if (this.durability !== -1) {
      desc += `\n\nDurability: ${this.durability}/${this.maxDurability}`;
    }
    
    // 添加等级要求
    desc += `\n\nRequired Level: ${this.requiredLevel}`;
    
    // 添加职业限制
    if (this.classRestrictions.length > 0) {
      desc += `\n\nClass Restrictions: ${this.classRestrictions.join(', ')}`;
    }
    
    return desc;
  }
}

export default Equipment;