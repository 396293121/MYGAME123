/**
 * 存档系统
 * 管理游戏的存档和读档功能，包括保存游戏状态、加载游戏状态和管理多个存档
 */

class SaveSystem {
  constructor() {
    this.savePrefix = 'rpg_game_save_';
    this.maxSaveSlots = 5; // 最大存档槽位数
    this.currentSaveSlot = null; // 当前使用的存档槽位
    this.autoSaveEnabled = true; // 是否启用自动存档
    this.autoSaveInterval = 5 * 60 * 1000; // 自动存档间隔（毫秒）
    this.autoSaveTimer = null; // 自动存档定时器
  }
  
  /**
   * 初始化存档系统
   */
  init() {
    // 检查浏览器是否支持localStorage
    if (!this._isLocalStorageAvailable()) {
      console.error('本地存储不可用，存档功能将不能正常工作。');
      return false;
    }
    
    // 启动自动存档（如果启用）
    if (this.autoSaveEnabled) {
      this._startAutoSave();
    }
    
    return true;
  }
  
  /**
   * 保存游戏
   * @param {number} slot - 存档槽位（1-5）
   * @param {Object} gameState - 游戏状态对象
   * @returns {boolean} - 是否成功保存
   */
  saveGame(slot, gameState) {
    // 验证槽位有效性
    if (!this._isValidSlot(slot)) {
      console.error(`无效的存档槽位: ${slot}`);
      return false;
    }
    
    try {
      // 添加元数据
      const saveData = {
        version: '1.0.0', // 游戏版本
        timestamp: Date.now(), // 保存时间戳
        gameState: gameState // 游戏状态
      };
      
      // 序列化并保存
      const saveKey = this._getSaveKey(slot);
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      // 更新当前存档槽位
      this.currentSaveSlot = slot;
      
      console.log(`游戏已保存到槽位 ${slot}`);
      return true;
    } catch (error) {
      console.error('保存游戏失败:', error);
      return false;
    }
  }
  
  /**
   * 加载游戏
   * @param {number} slot - 存档槽位（1-5）
   * @returns {Object|null} - 游戏状态对象，如果加载失败则返回null
   */
  loadGame(slot) {
    // 验证槽位有效性
    if (!this._isValidSlot(slot)) {
      console.error(`无效的存档槽位: ${slot}`);
      return null;
    }
    
    try {
      // 获取存档数据
      const saveKey = this._getSaveKey(slot);
      const saveDataString = localStorage.getItem(saveKey);
      
      if (!saveDataString) {
        console.log(`槽位 ${slot} 没有存档数据`);
        return null;
      }
      
      // 解析存档数据
      const saveData = JSON.parse(saveDataString);
      
      // 验证存档数据
      if (!saveData || !saveData.gameState) {
        console.error(`槽位 ${slot} 的存档数据无效`);
        return null;
      }
      
      // 更新当前存档槽位
      this.currentSaveSlot = slot;
      
      console.log(`从槽位 ${slot} 加载游戏成功`);
      return saveData.gameState;
    } catch (error) {
      console.error('加载游戏失败:', error);
      return null;
    }
  }
  
  /**
   * 删除存档
   * @param {number} slot - 存档槽位（1-5）
   * @returns {boolean} - 是否成功删除
   */
  deleteSave(slot) {
    // 验证槽位有效性
    if (!this._isValidSlot(slot)) {
      console.error(`无效的存档槽位: ${slot}`);
      return false;
    }
    
    try {
      // 删除存档
      const saveKey = this._getSaveKey(slot);
      localStorage.removeItem(saveKey);
      
      // 如果删除的是当前槽位，重置当前槽位
      if (this.currentSaveSlot === slot) {
        this.currentSaveSlot = null;
      }
      
      console.log(`槽位 ${slot} 的存档已删除`);
      return true;
    } catch (error) {
      console.error('删除存档失败:', error);
      return false;
    }
  }
  
  /**
   * 获取所有存档的元数据
   * @returns {Array} - 存档元数据数组
   */
  getSaveMetadata() {
    const metadata = [];
    
    for (let slot = 1; slot <= this.maxSaveSlots; slot++) {
      const saveKey = this._getSaveKey(slot);
      const saveDataString = localStorage.getItem(saveKey);
      
      if (saveDataString) {
        try {
          const saveData = JSON.parse(saveDataString);
          
          metadata.push({
            slot: slot,
            timestamp: saveData.timestamp,
            date: new Date(saveData.timestamp).toLocaleString(),
            version: saveData.version,
            characterName: saveData.gameState.character?.name || '未知',
            characterLevel: saveData.gameState.character?.level || 1,
            playTime: saveData.gameState.playTime || 0,
            location: saveData.gameState.location || '未知'
          });
        } catch (error) {
          console.error(`解析槽位 ${slot} 的存档元数据失败:`, error);
        }
      }
    }
    
    // 按时间戳降序排序（最新的在前）
    metadata.sort((a, b) => b.timestamp - a.timestamp);
    
    return metadata;
  }
  
  /**
   * 检查槽位是否有存档
   * @param {number} slot - 存档槽位（1-5）
   * @returns {boolean} - 是否有存档
   */
  hasSave(slot) {
    if (!this._isValidSlot(slot)) {
      return false;
    }
    
    const saveKey = this._getSaveKey(slot);
    return localStorage.getItem(saveKey) !== null;
  }
  
  /**
   * 自动保存游戏
   * @param {Object} gameState - 游戏状态对象
   * @returns {boolean} - 是否成功保存
   */
  autoSave(gameState) {
    // 如果没有当前槽位，使用自动存档槽位
    const slot = this.currentSaveSlot || 0; // 0为自动存档槽位
    
    try {
      // 添加元数据
      const saveData = {
        version: '1.0.0', // 游戏版本
        timestamp: Date.now(), // 保存时间戳
        gameState: gameState, // 游戏状态
        isAutoSave: true // 标记为自动存档
      };
      
      // 序列化并保存
      const saveKey = this._getSaveKey(slot);
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      console.log('游戏已自动保存');
      return true;
    } catch (error) {
      console.error('自动保存游戏失败:', error);
      return false;
    }
  }
  
  /**
   * 启用/禁用自动存档
   * @param {boolean} enabled - 是否启用
   */
  setAutoSaveEnabled(enabled) {
    this.autoSaveEnabled = enabled;
    
    if (enabled) {
      this._startAutoSave();
    } else {
      this._stopAutoSave();
    }
  }
  
  /**
   * 设置自动存档间隔
   * @param {number} minutes - 间隔分钟数
   */
  setAutoSaveInterval(minutes) {
    if (minutes > 0) {
      this.autoSaveInterval = minutes * 60 * 1000;
      
      // 如果自动存档已启用，重新启动定时器
      if (this.autoSaveEnabled) {
        this._stopAutoSave();
        this._startAutoSave();
      }
    }
  }
  
  /**
   * 导出存档数据
   * @param {number} slot - 存档槽位（1-5）
   * @returns {string|null} - 导出的存档数据字符串，如果导出失败则返回null
   */
  exportSave(slot) {
    // 验证槽位有效性
    if (!this._isValidSlot(slot)) {
      console.error(`无效的存档槽位: ${slot}`);
      return null;
    }
    
    try {
      // 获取存档数据
      const saveKey = this._getSaveKey(slot);
      const saveDataString = localStorage.getItem(saveKey);
      
      if (!saveDataString) {
        console.log(`槽位 ${slot} 没有存档数据`);
        return null;
      }
      
      // 编码为Base64以便于传输
      return btoa(saveDataString);
    } catch (error) {
      console.error('导出存档失败:', error);
      return null;
    }
  }
  
  /**
   * 导入存档数据
   * @param {string} saveDataString - 导出的存档数据字符串
   * @param {number} slot - 存档槽位（1-5）
   * @returns {boolean} - 是否成功导入
   */
  importSave(saveDataString, slot) {
    // 验证槽位有效性
    if (!this._isValidSlot(slot)) {
      console.error(`无效的存档槽位: ${slot}`);
      return false;
    }
    
    try {
      // 解码Base64数据
      const decodedString = atob(saveDataString);
      
      // 验证JSON格式
      const saveData = JSON.parse(decodedString);
      
      if (!saveData || !saveData.gameState) {
        console.error('导入的存档数据无效');
        return false;
      }
      
      // 保存到指定槽位
      const saveKey = this._getSaveKey(slot);
      localStorage.setItem(saveKey, decodedString);
      
      console.log(`存档已导入到槽位 ${slot}`);
      return true;
    } catch (error) {
      console.error('导入存档失败:', error);
      return false;
    }
  }
  
  /**
   * 获取当前游戏状态（用于保存）
   * @param {Object} game - 游戏实例
   * @returns {Object} - 游戏状态对象
   */
  getCurrentGameState(game) {
    // 这个方法需要根据具体游戏实现来收集所有需要保存的状态
    // 以下是一个示例实现
    
    const gameState = {
      // 玩家角色数据
      character: game.player ? {
        name: game.player.name,
        class: game.player.class,
        level: game.player.level,
        exp: game.player.exp,
        health: game.player.health,
        maxHealth: game.player.maxHealth,
        mana: game.player.mana,
        maxMana: game.player.maxMana,
        stats: { ...game.player.stats },
        position: {
          x: game.player.sprite.x,
          y: game.player.sprite.y,
          direction: game.player.direction
        },
        skills: game.player.skills.map(skill => skill.id),
        equipment: {}
      } : null,
      
      // 库存数据
      inventory: game.inventorySystem ? game.inventorySystem.serialize() : null,
      
      // 游戏进度
      progress: {
        completedQuests: game.questSystem ? game.questSystem.getCompletedQuestIds() : [],
        activeQuests: game.questSystem ? game.questSystem.getActiveQuestData() : [],
        unlockedAreas: game.worldSystem ? game.worldSystem.getUnlockedAreaIds() : [],
        discoveredLocations: game.worldSystem ? game.worldSystem.getDiscoveredLocationIds() : []
      },
      
      // 游戏设置
      settings: {
        volume: game.settings ? game.settings.volume : 1.0,
        musicVolume: game.settings ? game.settings.musicVolume : 0.7,
        sfxVolume: game.settings ? game.settings.sfxVolume : 1.0,
        difficulty: game.settings ? game.settings.difficulty : 'normal'
      },
      
      // 当前场景信息
      currentScene: game.scene ? game.scene.key : null,
      location: game.currentLocation || '未知',
      
      // 游戏时间信息
      playTime: game.playTime || 0,
      gameDate: game.gameDate ? {
        day: game.gameDate.day,
        month: game.gameDate.month,
        year: game.gameDate.year,
        hour: game.gameDate.hour,
        minute: game.gameDate.minute
      } : null,
      
      // 版本信息
      saveVersion: '1.0.0'
    };
    
    // 保存装备数据
    if (game.player && game.player.equipment) {
      Object.keys(game.player.equipment).forEach(slot => {
        const equipment = game.player.equipment[slot];
        if (equipment) {
          gameState.character.equipment[slot] = {
            id: equipment.id,
            durability: equipment.durability
          };
        }
      });
    }
    
    return gameState;
  }
  
  /**
   * 应用游戏状态（用于加载）
   * @param {Object} game - 游戏实例
   * @param {Object} gameState - 游戏状态对象
   * @returns {boolean} - 是否成功应用
   */
  applyGameState(game, gameState) {
    // 这个方法需要根据具体游戏实现来应用所有加载的状态
    // 以下是一个示例实现
    
    try {
      // 检查游戏状态是否有效
      if (!gameState) {
        console.error('游戏状态无效');
        return false;
      }
      
      // 应用玩家角色数据
      if (gameState.character && game.player) {
        // 设置基本属性
        game.player.name = gameState.character.name;
        game.player.class = gameState.character.class;
        game.player.level = gameState.character.level;
        game.player.exp = gameState.character.exp;
        game.player.health = gameState.character.health;
        game.player.maxHealth = gameState.character.maxHealth;
        game.player.mana = gameState.character.mana;
        game.player.maxMana = gameState.character.maxMana;
        
        // 设置属性
        if (gameState.character.stats) {
          game.player.stats = { ...gameState.character.stats };
          game.player.updateStats(); // 更新派生属性
        }
        
        // 设置位置
        if (gameState.character.position) {
          game.player.sprite.x = gameState.character.position.x;
          game.player.sprite.y = gameState.character.position.y;
          game.player.direction = gameState.character.position.direction;
        }
        
        // 设置技能
        if (Array.isArray(gameState.character.skills) && game.skillSystem) {
          game.player.skills = [];
          gameState.character.skills.forEach(skillId => {
            const skill = game.skillSystem.getSkillById(skillId);
            if (skill) {
              game.player.skills.push(skill);
            }
          });
        }
        
        // 设置装备
        if (gameState.character.equipment && game.itemSystem) {
          Object.keys(gameState.character.equipment).forEach(slot => {
            const equipData = gameState.character.equipment[slot];
            if (equipData) {
              const equipment = game.itemSystem.createItem(equipData.id);
              if (equipment) {
                equipment.durability = equipData.durability;
                game.player.equipment[slot] = equipment;
                equipment.equip(game.player);
              }
            }
          });
        }
      }
      
      // 应用库存数据
      if (gameState.inventory && game.inventorySystem) {
        game.inventorySystem.deserialize(gameState.inventory);
      }
      
      // 应用游戏进度
      if (gameState.progress) {
        // 应用任务进度
        if (game.questSystem) {
          if (Array.isArray(gameState.progress.completedQuests)) {
            game.questSystem.setCompletedQuests(gameState.progress.completedQuests);
          }
          
          if (Array.isArray(gameState.progress.activeQuests)) {
            game.questSystem.setActiveQuests(gameState.progress.activeQuests);
          }
        }
        
        // 应用世界进度
        if (game.worldSystem) {
          if (Array.isArray(gameState.progress.unlockedAreas)) {
            game.worldSystem.setUnlockedAreas(gameState.progress.unlockedAreas);
          }
          
          if (Array.isArray(gameState.progress.discoveredLocations)) {
            game.worldSystem.setDiscoveredLocations(gameState.progress.discoveredLocations);
          }
        }
      }
      
      // 应用游戏设置
      if (gameState.settings && game.settings) {
        game.settings.volume = gameState.settings.volume;
        game.settings.musicVolume = gameState.settings.musicVolume;
        game.settings.sfxVolume = gameState.settings.sfxVolume;
        game.settings.difficulty = gameState.settings.difficulty;
        
        // 应用音量设置
        if (game.sound) {
          game.sound.setVolume(gameState.settings.volume);
          game.sound.setMusicVolume(gameState.settings.musicVolume);
          game.sound.setSfxVolume(gameState.settings.sfxVolume);
        }
      }
      
      // 应用场景信息
      if (gameState.currentScene && gameState.currentScene !== game.scene.key) {
        game.scene.start(gameState.currentScene);
      }
      
      // 应用位置信息
      if (gameState.location) {
        game.currentLocation = gameState.location;
      }
      
      // 应用游戏时间信息
      if (gameState.playTime) {
        game.playTime = gameState.playTime;
      }
      
      if (gameState.gameDate && game.gameDate) {
        game.gameDate.day = gameState.gameDate.day;
        game.gameDate.month = gameState.gameDate.month;
        game.gameDate.year = gameState.gameDate.year;
        game.gameDate.hour = gameState.gameDate.hour;
        game.gameDate.minute = gameState.gameDate.minute;
      }
      
      console.log('游戏状态已成功应用');
      return true;
    } catch (error) {
      console.error('应用游戏状态失败:', error);
      return false;
    }
  }
  
  /**
   * 启动自动存档定时器
   * @private
   */
  _startAutoSave() {
    // 停止现有的定时器（如果有）
    this._stopAutoSave();
    
    // 创建新的定时器
    this.autoSaveTimer = setInterval(() => {
      // 触发自动存档事件
      const event = new CustomEvent('autosave');
      document.dispatchEvent(event);
    }, this.autoSaveInterval);
    
    console.log(`自动存档已启用，间隔: ${this.autoSaveInterval / 60000} 分钟`);
  }
  
  /**
   * 停止自动存档定时器
   * @private
   */
  _stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('自动存档已禁用');
    }
  }
  
  /**
   * 获取存档键名
   * @param {number} slot - 存档槽位
   * @returns {string} - 存档键名
   * @private
   */
  _getSaveKey(slot) {
    return `${this.savePrefix}${slot}`;
  }
  
  /**
   * 检查槽位是否有效
   * @param {number} slot - 存档槽位
   * @returns {boolean} - 是否有效
   * @private
   */
  _isValidSlot(slot) {
    // 槽位0保留给自动存档
    return Number.isInteger(slot) && slot >= 0 && slot <= this.maxSaveSlots;
  }
  
  /**
   * 检查localStorage是否可用
   * @returns {boolean} - 是否可用
   * @private
   */
  _isLocalStorageAvailable() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default SaveSystem;