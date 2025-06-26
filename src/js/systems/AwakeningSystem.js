/**
 * 觉醒系统
 * 管理角色的觉醒能力和状态
 */

class AwakeningSystem {
  constructor() {
    // 觉醒能力数据库
    this.awakeningAbilities = {};
    
    // 已解锁的觉醒能力
    this.unlockedAwakenings = {};
    
    // 当前激活的觉醒能力
    this.activeAwakenings = {};
    
    // 觉醒能力冷却时间
    this.awakeningCooldowns = {};
    
    // 觉醒值 - 新增
    this.awakeningValue = 0;
    
    // 觉醒值阈值 - 新增
    this.awakeningThreshold = 100;
    
    // 觉醒值衰减速率（每秒） - 新增
    this.awakeningDecayRate = 10;
    
    // 是否处于觉醒状态 - 新增
    this.isAwakened = false;
    
    // 上次更新时间 - 新增
    this.lastUpdateTime = Date.now();
    
    // 觉醒能力等级 - 新增
    this.awakeningLevels = {};
    
    // 觉醒能力最大等级 - 新增
    this.maxAwakeningLevel = 5;
  }
  
  /**
   * 初始化觉醒系统
   * @param {Object} awakeningData - 觉醒能力数据
   */
  init(awakeningData) {
    this.awakeningAbilities = awakeningData || {};
    console.log('觉醒系统初始化完成');
  }
  
  /**
   * 增加觉醒值
   * @param {number} amount - 增加的觉醒值数量
   */
  addAwakeningValue(amount) {
    this.awakeningValue += amount;
    console.log(`增加觉醒值: ${amount}, 当前觉醒值: ${this.awakeningValue}`);
  }
  
  /**
   * 减少觉醒值
   * @param {number} amount - 减少的觉醒值数量
   */
  reduceAwakeningValue(amount) {
    this.awakeningValue = Math.max(0, this.awakeningValue - amount);
    
    // 如果觉醒值降为0且处于觉醒状态，则结束觉醒
    if (this.awakeningValue <= 0 && this.isAwakened) {
      this.endAwakening();
    }
  }
  
  /**
   * 获取当前觉醒值
   * @returns {number} 当前觉醒值
   */
  getAwakeningValue() {
    return this.awakeningValue;
  }
  
  /**
   * 获取觉醒阈值
   * @returns {number} 觉醒阈值
   */
  getAwakeningThreshold() {
    return this.awakeningThreshold;
  }
  
  /**
   * 检查是否可以进入觉醒状态
   * @returns {boolean} 是否可以觉醒
   */
  canAwaken() {
    return this.awakeningValue >= this.awakeningThreshold && !this.isAwakened;
  }
  
  /**
   * 进入觉醒状态
   * @param {Character} character - 角色对象
   * @returns {boolean} 是否成功进入觉醒状态
   */
  enterAwakening(character) {
    if (!this.canAwaken()) {
      return false;
    }
    
    this.isAwakened = true;
    console.log(`角色 ${character.name} 进入觉醒状态！`);
    
    // 应用觉醒状态的基础增益
    this.applyAwakeningBaseEffects(character);
    
    return true;
  }
  
  /**
   * 结束觉醒状态
   * @param {Character} character - 角色对象
   */
  endAwakening(character) {
    if (!this.isAwakened) {
      return;
    }
    
    this.isAwakened = false;
    console.log(`角色 ${character.name} 的觉醒状态结束`);
    
    // 移除觉醒状态的基础增益
    this.removeAwakeningBaseEffects(character);
    
    // 停用所有激活的觉醒能力
    if (character && character.id && this.activeAwakenings[character.id]) {
      Object.keys(this.activeAwakenings[character.id]).forEach(awakeningId => {
        this.deactivateAwakening(awakeningId, character);
      });
    }
  }
  
  /**
   * 应用觉醒状态的基础增益
   * @param {Character} character - 角色对象
   */
  applyAwakeningBaseEffects(character) {
    // 保存原始属性值
    if (!character._originalAwakeningStats) {
      character._originalAwakeningStats = {};
    }
    
    // 基础属性提升（示例：所有属性提升20%）
    const stats = ['strength', 'dexterity', 'intelligence', 'vitality', 'speed'];
    stats.forEach(stat => {
      if (character[stat]) {
        character._originalAwakeningStats[stat] = character[stat];
        character[stat] = Math.floor(character[stat] * 1.2); // 提升20%
      }
    });
    
    // 更新角色状态
    character.updateStats();
  }
  
  /**
   * 移除觉醒状态的基础增益
   * @param {Character} character - 角色对象
   */
  removeAwakeningBaseEffects(character) {
    // 恢复原始属性值
    if (character._originalAwakeningStats) {
      Object.entries(character._originalAwakeningStats).forEach(([stat, value]) => {
        character[stat] = value;
      });
      
      delete character._originalAwakeningStats;
    }
    
    // 更新角色状态
    character.updateStats();
  }
  
  /**
   * 检查觉醒能力是否可解锁
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   * @returns {boolean} 是否可解锁
   */
  canUnlockAwakening(awakeningId, character) {
    const awakening = this.awakeningAbilities[awakeningId];
    
    if (!awakening) {
      console.error(`觉醒能力不存在: ${awakeningId}`);
      return false;
    }
    
    // 检查是否已解锁
    if (this.isAwakeningUnlocked(awakeningId, character.id)) {
      return false;
    }
    
    // 检查职业要求
    if (awakening.requiredClass && character.constructor.name.toLowerCase() !== awakening.requiredClass.toLowerCase()) {
      return false;
    }
    
    // 检查等级要求
    if (awakening.requiredLevel && character.level < awakening.requiredLevel) {
      return false;
    }
    
    // 检查前置觉醒能力
    if (awakening.prerequisites && awakening.prerequisites.length > 0) {
      for (const prereqId of awakening.prerequisites) {
        if (!this.isAwakeningUnlocked(prereqId, character.id)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 解锁觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   * @returns {boolean} 是否成功解锁
   */
  unlockAwakening(awakeningId, character) {
    if (!this.canUnlockAwakening(awakeningId, character)) {
      return false;
    }
    
    const characterId = character.id;
    
    // 初始化角色的觉醒能力列表
    if (!this.unlockedAwakenings[characterId]) {
      this.unlockedAwakenings[characterId] = [];
    }
    
    // 添加到已解锁列表
    this.unlockedAwakenings[characterId].push(awakeningId);
    
    const awakening = this.awakeningAbilities[awakeningId];
    console.log(`角色 ${character.name} 解锁了觉醒能力: ${awakening.name}`);
    
    // 应用觉醒能力的被动效果
    if (awakening.passiveEffects) {
      this.applyPassiveEffects(awakening.passiveEffects, character);
    }
    
    return true;
  }
  
  /**
   * 激活觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   * @returns {boolean} 是否成功激活
   */
  activateAwakening(awakeningId, character) {
    const characterId = character.id;
    
    // 检查是否处于觉醒状态
    if (!this.isAwakened) {
      console.log(`未处于觉醒状态，无法激活觉醒能力: ${awakeningId}`);
      return false;
    }
    
    // 检查是否已解锁
    if (!this.isAwakeningUnlocked(awakeningId, characterId)) {
      console.error(`觉醒能力未解锁: ${awakeningId}`);
      return false;
    }
    
    // 检查冷却时间
    if (this.isAwakeningOnCooldown(awakeningId, characterId)) {
      console.log(`觉醒能力冷却中: ${awakeningId}`);
      return false;
    }
    
    const awakening = this.awakeningAbilities[awakeningId];
    
    // 检查觉醒值消耗
    if (awakening.costs) {
      // 使用觉醒值代替MP
      const awakeningCost = awakening.costs.mp || 0;
      if (this.awakeningValue < awakeningCost) {
        console.log(`觉醒值不足，无法激活觉醒能力: ${awakening.name}`);
        return false;
      }
      
      // 扣除觉醒值
      this.reduceAwakeningValue(awakeningCost);
    }
    
    // 初始化角色的激活觉醒能力
    if (!this.activeAwakenings[characterId]) {
      this.activeAwakenings[characterId] = {};
    }
    
    // 设置激活状态和持续时间
    this.activeAwakenings[characterId][awakeningId] = {
      activatedAt: Date.now(),
      duration: awakening.duration || 0
    };
    
    console.log(`角色 ${character.name} 激活了觉醒能力: ${awakening.name}`);
    
    // 应用觉醒能力的主动效果
    if (awakening.activeEffects) {
      this.applyActiveEffects(awakening.activeEffects, character);
    }
    
    return true;
  }
  
  /**
   * 停用觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   */
  deactivateAwakening(awakeningId, character) {
    const characterId = character.id;
    
    if (!this.activeAwakenings[characterId] || !this.activeAwakenings[characterId][awakeningId]) {
      return;
    }
    
    const awakening = this.awakeningAbilities[awakeningId];
    
    // 移除激活状态
    delete this.activeAwakenings[characterId][awakeningId];
    
    // 设置冷却时间
    if (awakening.cooldown) {
      if (!this.awakeningCooldowns[characterId]) {
        this.awakeningCooldowns[characterId] = {};
      }
      
      this.awakeningCooldowns[characterId][awakeningId] = {
        startedAt: Date.now(),
        duration: awakening.cooldown
      };
    }
    
    console.log(`角色 ${character.name} 的觉醒能力已停用: ${awakening.name}`);
    
    // 移除觉醒能力的主动效果
    if (awakening.activeEffects) {
      this.removeActiveEffects(awakening.activeEffects, character);
    }
  }
  
  /**
   * 更新觉醒系统状态
   * @param {Character} character - 角色对象
   */
  update(character) {
    const characterId = character.id;
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = currentTime;
    
    // 如果处于觉醒状态，减少觉醒值
    if (this.isAwakened && deltaTime > 0) {
      const decayAmount = this.awakeningDecayRate * deltaTime;
      this.reduceAwakeningValue(decayAmount);
      
      // 如果觉醒值降为0，结束觉醒状态
      if (this.awakeningValue <= 0) {
        this.endAwakening(character);
      }
    }
    
    // 更新激活的觉醒能力
    if (this.activeAwakenings[characterId]) {
      Object.entries(this.activeAwakenings[characterId]).forEach(([awakeningId, data]) => {
        const awakening = this.awakeningAbilities[awakeningId];
        
        // 检查持续时间是否结束
        if (data.duration > 0 && currentTime - data.activatedAt >= data.duration) {
          this.deactivateAwakening(awakeningId, character);
        }
      });
    }
    
    // 更新冷却中的觉醒能力
    if (this.awakeningCooldowns[characterId]) {
      Object.entries(this.awakeningCooldowns[characterId]).forEach(([awakeningId, data]) => {
        // 检查冷却时间是否结束
        if (currentTime - data.startedAt >= data.duration) {
          delete this.awakeningCooldowns[characterId][awakeningId];
        }
      });
    }
  }
  
  /**
   * 应用觉醒能力的被动效果
   * @param {Array} effects - 效果列表
   * @param {Character} character - 角色对象
   */
  applyPassiveEffects(effects, character) {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'statBoost':
          // 增加属性
          if (effect.stat && effect.value) {
            character[effect.stat] += effect.value;
          }
          break;
          
        case 'unlockSkill':
          // 解锁技能
          if (effect.skillId) {
            character.unlockSkill(effect.skillId);
          }
          break;
          
        // 可以添加更多效果类型
        
        default:
          console.warn(`未知的被动效果类型: ${effect.type}`);
      }
    });
    
    // 更新角色状态
    character.updateStats();
  }
  
  /**
   * 应用觉醒能力的主动效果
   * @param {Array} effects - 效果列表
   * @param {Character} character - 角色对象
   */
  applyActiveEffects(effects, character) {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'tempStatBoost':
          // 临时增加属性
          if (effect.stat && effect.value) {
            // 保存原始值
            if (!character._originalStats) {
              character._originalStats = {};
            }
            
            if (character._originalStats[effect.stat] === undefined) {
              character._originalStats[effect.stat] = character[effect.stat];
            }
            
            // 应用增益
            character[effect.stat] += effect.value;
          }
          break;
          
        case 'damageBoost':
          // 伤害增益
          if (!character._damageModifiers) {
            character._damageModifiers = [];
          }
          
          character._damageModifiers.push(effect);
          break;
          
        // 可以添加更多效果类型
        
        default:
          console.warn(`未知的主动效果类型: ${effect.type}`);
      }
    });
    
    // 更新角色状态
    character.updateStats();
  }
  
  /**
   * 移除觉醒能力的主动效果
   * @param {Array} effects - 效果列表
   * @param {Character} character - 角色对象
   */
  removeActiveEffects(effects, character) {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'tempStatBoost':
          // 恢复原始属性值
          if (effect.stat && character._originalStats && character._originalStats[effect.stat] !== undefined) {
            character[effect.stat] = character._originalStats[effect.stat];
            delete character._originalStats[effect.stat];
          }
          break;
          
        case 'damageBoost':
          // 移除伤害增益
          if (character._damageModifiers) {
            const index = character._damageModifiers.findIndex(mod => 
              mod.type === effect.type && mod.value === effect.value);
            
            if (index !== -1) {
              character._damageModifiers.splice(index, 1);
            }
          }
          break;
          
        // 可以添加更多效果类型
        
        default:
          console.warn(`未知的效果移除类型: ${effect.type}`);
      }
    });
    
    // 更新角色状态
    character.updateStats();
  }
  
  /**
   * 检查觉醒能力是否已解锁
   * @param {string} awakeningId - 觉醒能力ID
   * @param {string} characterId - 角色ID
   * @returns {boolean} 是否已解锁
   */
  isAwakeningUnlocked(awakeningId, characterId) {
    return this.unlockedAwakenings[characterId] && 
           this.unlockedAwakenings[characterId].includes(awakeningId);
  }
  
  /**
   * 检查觉醒能力是否已激活
   * @param {string} awakeningId - 觉醒能力ID
   * @param {string} characterId - 角色ID
   * @returns {boolean} 是否已激活
   */
  isAwakeningActive(awakeningId, characterId) {
    return this.activeAwakenings[characterId] && 
           this.activeAwakenings[characterId][awakeningId] !== undefined;
  }
  
  /**
   * 检查觉醒能力是否在冷却中
   * @param {string} awakeningId - 觉醒能力ID
   * @param {string} characterId - 角色ID
   * @returns {boolean} 是否在冷却中
   */
  isAwakeningOnCooldown(awakeningId, characterId) {
    return this.awakeningCooldowns[characterId] && 
           this.awakeningCooldowns[characterId][awakeningId] !== undefined;
  }
  
  /**
   * 获取觉醒能力冷却剩余时间
   * @param {string} awakeningId - 觉醒能力ID
   * @param {string} characterId - 角色ID
   * @returns {number} 剩余冷却时间（毫秒）
   */
  getAwakeningCooldownRemaining(awakeningId, characterId) {
    if (!this.isAwakeningOnCooldown(awakeningId, characterId)) {
      return 0;
    }
    
    const cooldownData = this.awakeningCooldowns[characterId][awakeningId];
    const elapsed = Date.now() - cooldownData.startedAt;
    const remaining = Math.max(0, cooldownData.duration - elapsed);
    
    return remaining;
  }
  
  /**
   * 获取已解锁的觉醒能力列表
   * @param {string} characterId - 角色ID
   * @returns {Array} 已解锁的觉醒能力列表
   */
  getUnlockedAwakenings(characterId) {
    if (!this.unlockedAwakenings[characterId]) {
      return [];
    }
    
    return this.unlockedAwakenings[characterId].map(id => ({
      id,
      ...this.awakeningAbilities[id],
      isActive: this.isAwakeningActive(id, characterId),
      cooldownRemaining: this.getAwakeningCooldownRemaining(id, characterId)
    }));
  }
  
  /**
   * 获取可解锁的觉醒能力列表
   * @param {Character} character - 角色对象
   * @returns {Array} 可解锁的觉醒能力列表
   */
  getAvailableAwakenings(character) {
    const result = [];
    
    Object.entries(this.awakeningAbilities).forEach(([id, awakening]) => {
      if (this.canUnlockAwakening(id, character)) {
        result.push({
          id,
          ...awakening
        });
      }
    });
    
    return result;
  }
  
  /**
   * 当击杀敌人时增加觉醒值
   * @param {Enemy} enemy - 被击杀的敌人
   */
  onEnemyKilled(enemy) {
    // 根据敌人类型或等级给予不同的觉醒值
    let awakeningGain = 10; // 基础值
    
    if (enemy.level) {
      // 根据敌人等级增加觉醒值
      awakeningGain += enemy.level * 2;
    }
    
    if (enemy.isBoss) {
      // Boss敌人给予更多觉醒值
      awakeningGain *= 3;
    }
    
    this.addAwakeningValue(awakeningGain);
  }
  
  /**
   * 获取觉醒能力的当前等级
   * @param {string} awakeningId - 觉醒能力ID
   * @param {string} characterId - 角色ID
   * @returns {number} 觉醒能力等级
   */
  getAwakeningLevel(awakeningId, characterId) {
    if (!this.awakeningLevels[characterId] || !this.awakeningLevels[characterId][awakeningId]) {
      return 1; // 默认等级为1
    }
    
    return this.awakeningLevels[characterId][awakeningId];
  }
  
  /**
   * 检查觉醒能力是否可以升级
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   * @param {Object} inventory - 角色物品栏
   * @returns {Object} 包含是否可升级及原因的对象
   */
  canUpgradeAwakening(awakeningId, character, inventory) {
    const characterId = character.id;
    
    // 检查是否已解锁
    if (!this.isAwakeningUnlocked(awakeningId, characterId)) {
      return { canUpgrade: false, reason: '觉醒能力未解锁' };
    }
    
    // 获取当前等级
    const currentLevel = this.getAwakeningLevel(awakeningId, characterId);
    
    // 检查是否已达到最大等级
    if (currentLevel >= this.maxAwakeningLevel) {
      return { canUpgrade: false, reason: '已达到最大等级' };
    }
    
    // 获取升级所需资源
    const requiredResources = this.getUpgradeRequirements(awakeningId, currentLevel);
    
    // 检查资源是否足够
    for (const resource of requiredResources) {
      const hasEnough = inventory.hasItem(resource.id, resource.amount);
      if (!hasEnough) {
        return { canUpgrade: false, reason: `缺少材料: ${resource.name} x${resource.amount}` };
      }
    }
    
    return { canUpgrade: true };
  }
  
  /**
   * 获取升级觉醒能力所需的资源
   * @param {string} awakeningId - 觉醒能力ID
   * @param {number} currentLevel - 当前等级
   * @returns {Array} 所需资源列表
   */
  getUpgradeRequirements(awakeningId, currentLevel) {
    // 根据当前等级确定所需的精血类型和数量
    const requirements = [];
    
    switch(currentLevel) {
      case 1: // 升级到2级
        requirements.push({ id: 'blood_essence_minor', name: '微量精血', amount: 3 });
        break;
      case 2: // 升级到3级
        requirements.push({ id: 'blood_essence_minor', name: '微量精血', amount: 5 });
        break;
      case 3: // 升级到4级
        requirements.push({ id: 'blood_essence_minor', name: '微量精血', amount: 5 });
        requirements.push({ id: 'blood_essence_medium', name: '中量精血', amount: 2 });
        break;
      case 4: // 升级到5级
        requirements.push({ id: 'blood_essence_medium', name: '中量精血', amount: 5 });
        requirements.push({ id: 'blood_essence_major', name: '大量精血', amount: 1 });
        break;
      default:
        break;
    }
    
    return requirements;
  }
  
  /**
   * 升级觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   * @param {Object} inventory - 角色物品栏
   * @returns {Object} 升级结果
   */
  upgradeAwakening(awakeningId, character, inventory) {
    const characterId = character.id;
    const result = this.canUpgradeAwakening(awakeningId, character, inventory);
    
    if (!result.canUpgrade) {
      return { success: false, message: result.reason };
    }
    
    // 获取当前等级
    const currentLevel = this.getAwakeningLevel(awakeningId, characterId);
    
    // 获取升级所需资源
    const requiredResources = this.getUpgradeRequirements(awakeningId, currentLevel);
    
    // 消耗资源
    for (const resource of requiredResources) {
      inventory.removeItem(resource.id, resource.amount);
    }
    
    // 初始化角色的觉醒能力等级
    if (!this.awakeningLevels[characterId]) {
      this.awakeningLevels[characterId] = {};
    }
    
    // 升级能力
    this.awakeningLevels[characterId][awakeningId] = currentLevel + 1;
    
    // 应用升级效果
    this.applyUpgradeEffects(awakeningId, character, currentLevel + 1);
    
    return { 
      success: true, 
      message: `${this.awakeningAbilities[awakeningId].name} 已升级到 ${currentLevel + 1} 级！`, 
      newLevel: currentLevel + 1 
    };
  }
  
  /**
   * 应用觉醒能力升级效果
   * @param {string} awakeningId - 觉醒能力ID
   * @param {Character} character - 角色对象
   * @param {number} newLevel - 新等级
   */
  applyUpgradeEffects(awakeningId, character, newLevel) {
    const awakening = this.awakeningAbilities[awakeningId];
    
    // 根据等级提升被动效果
    if (awakening.passiveEffects) {
      // 移除旧的被动效果
      if (character._awakeningPassiveEffects && character._awakeningPassiveEffects[awakeningId]) {
        this.removePassiveEffects(character._awakeningPassiveEffects[awakeningId], character);
      }
      
      // 应用新的被动效果（根据等级增强）
      const enhancedPassiveEffects = this.getEnhancedEffects(awakening.passiveEffects, newLevel);
      this.applyPassiveEffects(enhancedPassiveEffects, character);
      
      // 保存应用的效果以便将来移除
      if (!character._awakeningPassiveEffects) {
        character._awakeningPassiveEffects = {};
      }
      character._awakeningPassiveEffects[awakeningId] = enhancedPassiveEffects;
    }
    
    // 更新角色状态
    character.updateStats();
  }
  
  /**
   * 根据等级增强效果
   * @param {Array} effects - 原始效果列表
   * @param {number} level - 能力等级
   * @returns {Array} 增强后的效果列表
   */
  getEnhancedEffects(effects, level) {
    // 创建效果的深拷贝
    const enhancedEffects = JSON.parse(JSON.stringify(effects));
    
    // 根据等级增强效果
    enhancedEffects.forEach(effect => {
      // 对于数值类型的效果，根据等级增强
      if (effect.type === 'statBoost' || effect.type === 'tempStatBoost') {
        effect.value = Math.floor(effect.value * (1 + (level - 1) * 0.2)); // 每级增加20%
      } else if (effect.type === 'damageBoost' || effect.type === 'elementalDamageBoost') {
        effect.value = effect.value * (1 + (level - 1) * 0.15); // 每级增加15%
      } else if (effect.type === 'healthRegen' || effect.type === 'manaRegen') {
        effect.value = Math.floor(effect.value * (1 + (level - 1) * 0.25)); // 每级增加25%
      }
      // 可以添加更多效果类型的增强逻辑
    });
    
    return enhancedEffects;
  }
  
  /**
   * 保存觉醒系统状态
   * @returns {Object} 觉醒系统状态数据
   */
  save() {
    return {
      unlockedAwakenings: this.unlockedAwakenings,
      awakeningValue: this.awakeningValue,
      isAwakened: this.isAwakened,
      awakeningLevels: this.awakeningLevels // 保存觉醒能力等级
    };
  }
  
  /**
   * 加载觉醒系统状态
   * @param {Object} data - 觉醒系统状态数据
   */
  load(data) {
    if (data) {
      if (data.unlockedAwakenings) {
        this.unlockedAwakenings = data.unlockedAwakenings;
      }
      
      if (data.awakeningValue !== undefined) {
        this.awakeningValue = data.awakeningValue;
      }
      
      if (data.isAwakened !== undefined) {
        this.isAwakened = data.isAwakened;
      }
      
      if (data.awakeningLevels) {
        this.awakeningLevels = data.awakeningLevels;
      }
    }
  }
}

export default AwakeningSystem;