/**
 * 游戏管理器
 * 整合所有游戏系统，提供统一的接口来管理游戏状态
 */

import SkillSystem from './systems/SkillSystem.js';
import ItemSystem from './systems/ItemSystem.js';
import InventorySystem from './systems/InventorySystem.js';
import EnemySystem from './systems/EnemySystem.js';
import SaveSystem from './systems/SaveSystem.js';
import LevelManager from './LevelManager.js';
import DialogueSystem from './systems/DialogueSystem.js';
import AwakeningSystem from './systems/AwakeningSystem.js';
import QuestSystem from './systems/QuestSystem.js';
// 导入数据
import DialogueData from './data/DialogueData.js';
import AwakeningData from './data/AwakeningData.js';

class GameManager {
  constructor(game) {
    this.game = game; // Phaser游戏实例
    this.player = null; // 玩家角色
    this.currentScene = null; // 当前场景
    
    // 初始化各个系统
    this.skillSystem = new SkillSystem();
    this.itemSystem = new ItemSystem();
    this.inventorySystem = new InventorySystem(30, this.itemSystem); // 30个物品槽位
    this.enemySystem = new EnemySystem(this.itemSystem);
    this.saveSystem = new SaveSystem();
    this.levelManager = new LevelManager(game); // 关卡管理器
    this.questSystem = new QuestSystem();
    this.awakeningSystem = new AwakeningSystem(); // 觉醒系统
    this.dialogueSystem = null; // 对话系统（需要场景实例，在setCurrentScene中初始化）
    
    // 游戏状态
    this.gameState = {
      playTime: 0, // 游戏时间（秒）
      lastSaveTime: 0, // 上次保存时间
      currentLocation: 'unknown', // 当前位置
      discoveredLocations: [], // 已发现位置
      gameFlags: {} // 游戏标志（用于记录游戏进度和事件）
    };
    
    // 游戏设置
    this.settings = {
      volume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 1.0,
      difficulty: 'normal'
    };
    
    // 计时器（用于更新游戏时间）
    this.gameTimer = null;
  }
  
  /**
   * 初始化游戏管理器
   */
  init() {
    console.log('初始化游戏管理器...');
    
    // 初始化存档系统
    this.saveSystem.init();
    
    // 初始化觉醒系统
    this.awakeningSystem.init(AwakeningData);
    
    // 设置自动存档事件监听
    document.addEventListener('autosave', this.handleAutoSave.bind(this));
    
    // 启动游戏计时器
    this.startGameTimer();
    
    // 应用游戏设置
    this.applySettings();
    
    return this;
  }
  
  /**
   * 处理敌人死亡事件
   * 当敌人被击杀时，增加觉醒值
   * @param {Enemy} enemy - 被击杀的敌人
   */
  handleEnemyDeath(enemy) {
    // 根据敌人类型和属性计算觉醒值
    let awakeningValue = 10; // 基础觉醒值
    
    // 可以根据敌人类型或属性调整觉醒值
    if (enemy.maxHealth > 100) {
      awakeningValue += 5; // 强力敌人提供更多觉醒值
    }
    
    if (enemy.constructor.name === 'FireBat') {
      awakeningValue += 3; // 特定类型敌人可以提供额外觉醒值
    }
    
    // 增加玩家的觉醒值
    if (this.player && this.awakeningSystem) {
      this.awakeningSystem.addAwakeningValue(awakeningValue);
      
      // 如果觉醒值达到阈值且尚未觉醒，自动进入觉醒状态
      if (this.awakeningSystem.canAwaken() && !this.awakeningSystem.isAwakened) {
        this.awakeningSystem.enterAwakening(this.player);
      }
    }
    
    // 更新游戏状态中的击杀统计
    if (!this.gameState.stats) {
      this.gameState.stats = {};
    }
    
    this.gameState.stats.killCount = (this.gameState.stats.killCount || 0) + 1;
  }
  
  /**
   * 设置当前场景
   * @param {Phaser.Scene} scene - 场景实例
   */
  setCurrentScene(scene) {
    this.currentScene = scene;
    
    // 如果场景是GameScene，设置玩家引用
    if (scene.key === 'GameScene' && scene.player) {
      this.setPlayer(scene.player);
    }
    
    // 创建对话系统（需要场景实例）
    if (!this.dialogueSystem && scene) {
      this.dialogueSystem = new DialogueSystem(scene);
    }
    
    // 如果是游戏场景，检查并添加当前位置到已发现位置列表
    if (scene.key === 'GameScene' && this.levelManager.currentLocation) {
      this.addDiscoveredLocation(this.levelManager.currentLocation);
    }
  }
  
  /**
   * 设置玩家角色
   * @param {Character} player - 玩家角色实例
   */
  setPlayer(player) {
    this.player = player;
    
    // 将系统实例传递给玩家
    if (this.player) {
      this.player.skillSystem = this.skillSystem;
      this.player.inventory = this.inventorySystem;
    }
  }
  
  /**
   * 保存玩家当前状态
   * @returns {Object} 玩家状态数据
   */
  savePlayerState() {
    if (!this.player) return null;
    
    return {
      position: {
        x: this.player.x,
        y: this.player.y
      },
      stats: this.player.stats,
      level: this.player.level,
      experience: this.player.experience,
      health: this.player.health,
      mana: this.player.mana,
      class: this.player.constructor.name.toLowerCase(),
      inventory: this.inventorySystem.getItems()
    };
  }
  
  /**
   * 切换游戏关卡
   * @param {string|number} direction - 切换方向，可以是'next'或具体的关卡编号
   */
  changeLevel(direction = 'next') {
    let levelData;
    
    if (direction === 'next') {
      levelData = this.levelManager.goToNextLevel();
    } else if (typeof direction === 'number') {
      levelData = this.levelManager.goToLevel(direction);
    }
    
    if (levelData) {
      // 保存当前玩家状态
      const playerState = this.savePlayerState();
      
      // 将玩家状态存储到注册表
      this.game.registry.set('playerState', playerState);
      
      // 显示关卡切换提示
      if (this.currentScene && this.currentScene.key === 'GameScene') {
        // 显示关卡名称
        const levelText = this.currentScene.add.text(
          this.currentScene.cameras.main.centerX,
          this.currentScene.cameras.main.centerY - 50,
          `进入 ${levelData.name}`,
          { fontSize: '32px', fill: '#fff' }
        ).setOrigin(0.5);
        
        // 淡出效果
        this.currentScene.tweens.add({
          targets: levelText,
          alpha: 0,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => levelText.destroy()
        });
      }
      
      // 重启GameScene并加载新地图
      this.game.scene.getScene('GameScene').scene.restart({ levelData });
    } else {
      // 游戏结束，显示结束场景
      // 如果没有EndGameScene，可以返回主菜单
      this.game.scene.start('MainMenuScene');
    }
  }
  
  /**
   * 切换游戏位置
   * @param {string} locationId - 位置ID
   */
  changeLocation(locationId) {
    // 检查位置是否存在
    const locationLevel = this.levelManager.getLevelByLocationId(locationId);
    if (!locationLevel) return false;
    
    // 检查位置是否相连或已发现
    const currentLocationId = this.levelManager.currentLocation;
    if (currentLocationId && 
        !this.levelManager.areLocationsConnected(currentLocationId, locationId) && 
        !this.isLocationDiscovered(locationId)) {
      console.warn(`位置 ${locationId} 与当前位置不相连且未被发现，无法直接前往`);
      return false;
    }
    
    // 保存当前玩家状态
    if (this.player) {
      this.savePlayerState();
    }
    
    // 前往新位置
    this.levelManager.goToLocation(locationId);
    
    // 存储到注册表
    this.game.registry.set('currentLevel', this.levelManager.currentLevel);
    this.game.registry.set('currentLocation', locationId);
    
    // 添加到已发现位置
    this.addDiscoveredLocation(locationId);
    
    // 显示位置切换提示
    if (this.currentScene) {
      const locationData = this.levelManager.getLocationData(locationId);
      if (locationData) {
        this.currentScene.showLevelTransition(locationData.name);
      }
    }
    
    return true;
  }
  
  /**
   * 启动游戏计时器
   */
  startGameTimer() {
    // 每秒更新游戏时间
    this.gameTimer = setInterval(() => {
      this.gameState.playTime++;
    }, 1000);
  }
  
  /**
   * 停止游戏计时器
   */
  stopGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }
  
  /**
   * 处理自动存档
   */
  handleAutoSave() {
    console.log('执行自动存档...');
    this.saveGame(0); // 使用槽位0作为自动存档
  }
  
  /**
   * 保存游戏
   * @param {number} slot - 存档槽位
   * @returns {boolean} - 是否成功保存
   */
  saveGame(slot) {
    // 获取当前游戏状态
    const gameState = this.getCurrentGameState();
    
    // 保存游戏
    const result = this.saveSystem.saveGame(slot, gameState);
    
    if (result) {
      this.gameState.lastSaveTime = Date.now();
      console.log(`游戏已保存到槽位 ${slot}`);
    }
    
    return result;
  }
  
  /**
   * 加载游戏
   * @param {number} slot - 存档槽位
   * @returns {boolean} - 是否成功加载
   */
  loadGame(slot) {
    // 加载游戏状态
    const gameState = this.saveSystem.loadGame(slot);
    
    if (gameState) {
      // 应用游戏状态
      const result = this.applyGameState(gameState);
      
      if (result) {
        console.log(`从槽位 ${slot} 加载游戏成功`);
      }
      
      return result;
    }
    
    return false;
  }
  
  /**
   * 获取当前游戏状态（用于保存）
   * @returns {Object} - 游戏状态对象
   */
  getCurrentGameState() {
    // 基本游戏状态
    const gameState = {
      ...this.gameState,
      settings: { ...this.settings }
    };
    
    // 玩家数据
    if (this.player) {
      gameState.player = {
        name: this.player.name,
        class: this.player.constructor.name.toLowerCase(),
        level: this.player.level,
        exp: this.player.experience,
        health: this.player.health,
        maxHealth: this.player.maxHealth,
        mana: this.player.mana,
        maxMana: this.player.maxMana,
        stats: { ...this.player.stats },
        position: {
          x: this.player.x,
          y: this.player.y,
          direction: this.player.flipX ? 'left' : 'right'
        },
        skills: this.player.skills.map(skill => skill.id)
      };
      
      // 装备数据
      gameState.equipment = {};
      if (this.player.equipment) {
        Object.keys(this.player.equipment).forEach(slot => {
          const equipment = this.player.equipment[slot];
          if (equipment) {
            gameState.equipment[slot] = {
              id: equipment.id,
              durability: equipment.durability
            };
          }
        });
      }
    }
    
    // 库存数据
    gameState.inventory = this.inventorySystem.serialize();
    
    // 当前场景
    if (this.currentScene) {
      gameState.currentScene = this.currentScene.key;
    }
    
    // 当前位置和已发现位置
    gameState.currentLocation = this.levelManager ? this.levelManager.currentLocation : null;
    gameState.discoveredLocations = this.gameState.discoveredLocations || [];
    
    // 任务数据 - 简化版任务系统只有一个当前任务
    const questData = this.questSystem.getActiveQuestData();
    const activeQuestData = {};
    if (questData && questData.length > 0) {
      const currentQuest = questData[0];
      activeQuestData[currentQuest.id] = {
        objectives: {}
      };
      
      // 转换目标数据格式以兼容存档系统
      if (currentQuest.objectives) {
        currentQuest.objectives.forEach(obj => {
          activeQuestData[currentQuest.id].objectives[obj.id] = {
            current: obj.current,
            required: obj.required,
            completed: obj.completed
          };
        });
      }
    }
    gameState.quests = activeQuestData;
    
    // 觉醒系统数据
    gameState.awakening = this.awakeningSystem.save();
    
    return gameState;
  }
  
  /**
   * 应用游戏状态（用于加载）
   * @param {Object} gameState - 游戏状态对象
   * @returns {boolean} - 是否成功应用
   */
  applyGameState(gameState) {
    if (!gameState) return false;
    
    try {
      // 应用基本游戏状态
      this.gameState = {
        playTime: gameState.playTime || 0,
        lastSaveTime: gameState.lastSaveTime || 0,
        currentLocation: gameState.currentLocation || 'unknown',
        completedQuests: gameState.completedQuests || [],
        discoveredLocations: gameState.discoveredLocations || [],
        gameFlags: gameState.gameFlags || {}
      };
      
      // 应用设置
      if (gameState.settings) {
        this.settings = { ...gameState.settings };
        this.applySettings();
      }
      
      // 应用库存数据
      if (gameState.inventory) {
        this.inventorySystem.deserialize(gameState.inventory);
      }
      
      // 应用任务数据 - 简化版任务系统只有一个当前任务
      if (gameState.quests) {
        // 在简化的任务系统中，setActiveQuests方法会自动只选择第一个任务
        this.questSystem.setActiveQuests(gameState.quests);
        
        // 设置已完成任务
        if (gameState.completedQuests) {
          this.questSystem.setCompletedQuests(gameState.completedQuests);
        }
      }
      
      // 应用觉醒系统数据
      if (gameState.awakening) {
        this.awakeningSystem.load(gameState.awakening);
      }
      
      // 如果当前在游戏场景中，应用玩家数据
      if (this.currentScene && this.currentScene.key === 'GameScene' && this.player && gameState.player) {
        // 应用玩家基本属性
        this.player.level = gameState.player.level || 1;
        this.player.experience = gameState.player.exp || 0;
        this.player.health = gameState.player.health || this.player.maxHealth;
        this.player.mana = gameState.player.mana || this.player.maxMana;
        
        // 应用玩家属性
        if (gameState.player.stats) {
          this.player.stats = { ...gameState.player.stats };
          this.player.updateStats(); // 更新派生属性
        }
        
        // 应用玩家位置
        if (gameState.player.position) {
          this.player.x = gameState.player.position.x;
          this.player.y = gameState.player.position.y;
          this.player.flipX = gameState.player.position.direction === 'left';
        }
        
        // 应用玩家技能
        if (Array.isArray(gameState.player.skills)) {
          this.player.skills = [];
          gameState.player.skills.forEach(skillId => {
            const skill = this.skillSystem.getSkillById(skillId);
            if (skill) {
              this.player.skills.push(skill);
            }
          });
        }
        
        // 应用装备
        if (gameState.equipment && this.player.equipment) {
          // 先卸下所有装备
          Object.keys(this.player.equipment).forEach(slot => {
            const equipment = this.player.equipment[slot];
            if (equipment) {
              equipment.unequip(this.player);
              this.player.equipment[slot] = null;
            }
          });
          
          // 装备新装备
          Object.keys(gameState.equipment).forEach(slot => {
            const equipData = gameState.equipment[slot];
            if (equipData) {
              const equipment = this.itemSystem.createItem(equipData.id);
              if (equipment) {
                equipment.durability = equipData.durability;
                this.player.equipment[slot] = equipment;
                equipment.equip(this.player);
              }
            }
          });
        }
      } else if (gameState.currentScene && gameState.currentScene !== this.currentScene?.key) {
        // 如果需要切换场景
        this.game.scene.start(gameState.currentScene);
      }
      
      // 应用已发现位置数据
      if (gameState.discoveredLocations) {
        this.gameState.discoveredLocations = gameState.discoveredLocations;
      }
      
      // 应用当前位置
      if (gameState.currentLocation && this.levelManager) {
        this.levelManager.currentLocation = gameState.currentLocation;
      }
      
      return true;
    } catch (error) {
      console.error('应用游戏状态失败:', error);
      return false;
    }
  }
  
  /**
   * 应用游戏设置
   */
  applySettings() {
    // 应用音量设置
    if (this.game.sound) {
      this.game.sound.volume = this.settings.volume;
      
      // 设置音乐和音效音量
      this.game.sound.sounds.forEach(sound => {
        if (sound.key.includes('music')) {
          sound.volume = this.settings.musicVolume * this.settings.volume;
        } else {
          sound.volume = this.settings.sfxVolume * this.settings.volume;
        }
      });
    }
  }
  
  /**
   * 更新游戏设置
   * @param {Object} newSettings - 新的设置
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
    
    // 保存设置到本地存储
    try {
      localStorage.setItem('rpg_game_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }
  
  /**
   * 加载设置
   */
  loadSettings() {
    try {
      const settingsStr = localStorage.getItem('rpg_game_settings');
      if (settingsStr) {
        const savedSettings = JSON.parse(settingsStr);
        this.updateSettings(savedSettings);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
  
  /**
   * 添加游戏标志（用于记录游戏进度和事件）
   * @param {string} flag - 标志名称
   * @param {any} value - 标志值
   */
  setGameFlag(flag, value) {
    this.gameState.gameFlags[flag] = value;
  }
  
  /**
   * 获取游戏标志
   * @param {string} flag - 标志名称
   * @param {any} defaultValue - 默认值
   * @returns {any} - 标志值
   */
  getGameFlag(flag, defaultValue = null) {
    return this.gameState.gameFlags[flag] !== undefined ? 
      this.gameState.gameFlags[flag] : defaultValue;
  }
  
  /**
   * 检查游戏标志是否存在
   * @param {string} flag - 标志名称
   * @returns {boolean} - 是否存在
   */
  hasGameFlag(flag) {
    return this.gameState.gameFlags[flag] !== undefined;
  }
  

  
  /**
   * 添加已发现位置
   * @param {string} locationId - 位置ID
   */
  addDiscoveredLocation(locationId) {
    if (!this.gameState.discoveredLocations.includes(locationId)) {
      this.gameState.discoveredLocations.push(locationId);
      
      // 获取位置数据，给予发现经验奖励
      const locationData = this.levelManager.getLocationData(locationId);
      if (locationData && locationData.discoveryExp && this.player) {
        this.player.addExperience(locationData.discoveryExp);
        
        // 显示发现新地点的提示
        if (this.currentScene) {
          this.currentScene.showNotification(`发现新地点: ${locationData.name}`, 'location_discovery');
          this.currentScene.showNotification(`获得 ${locationData.discoveryExp} 经验`, 'experience_gain');
        }
      }
    }
  }
  
  /**
   * 检查位置是否已发现
   * @param {string} locationId - 位置ID
   * @returns {boolean} - 是否已发现
   */
  isLocationDiscovered(locationId) {
    return this.gameState.discoveredLocations.includes(locationId);
  }
  
  /**
   * 设置当前位置
   * @param {string} locationId - 位置ID
   */
  setCurrentLocation(locationId) {
    this.gameState.currentLocation = locationId;
    this.addDiscoveredLocation(locationId);
  }
  
  /**
   * 获取已发现位置列表
   * @returns {Array} 已发现位置ID列表
   */
  getDiscoveredLocations() {
    return this.gameState.discoveredLocations || [];
  }
  
  /**
   * 获取游戏时间（格式化）
   * @returns {string} - 格式化的游戏时间
   */
  getFormattedPlayTime() {
    const hours = Math.floor(this.gameState.playTime / 3600);
    const minutes = Math.floor((this.gameState.playTime % 3600) / 60);
    const seconds = this.gameState.playTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * 开始对话
   * @param {Object} npc - NPC对象
   * @param {string} dialogueKey - 对话键名
   * @param {Function} onEnd - 对话结束回调
   */
  startDialogue(npc, dialogueKey = 'default', onEnd = null) {
    if (!this.dialogueSystem) {
      console.error('对话系统未初始化');
      return;
    }
    
    // 获取NPC的对话数据
    const npcDialogues = DialogueData[npc.id];
    if (!npcDialogues) {
      console.error(`未找到NPC ${npc.id} 的对话数据`);
      return;
    }
    
    // 获取指定对话
    const dialogue = npcDialogues[dialogueKey] || npcDialogues['default'];
    if (!dialogue) {
      console.error(`未找到NPC ${npc.id} 的 ${dialogueKey} 对话`);
      return;
    }
    
    // 检查是否有任务相关对话
    let selectedDialogue = dialogue;
    if (dialogue.questRequirement) {
      const { questId, state } = dialogue.questRequirement;
      
      // 根据任务状态选择合适的对话
      if (state === 'before' && !this.questSystem.isQuestActive(questId) && !this.questSystem.isQuestCompleted(questId)) {
        // 使用当前对话
      } else if (state === 'active' && this.questSystem.isQuestActive(questId)) {
        // 使用当前对话
      } else if (state === 'completed' && this.questSystem.isQuestCompleted(questId)) {
        // 使用当前对话
      } else {
        // 尝试找到默认对话
        selectedDialogue = npcDialogues['default'] || dialogue;
      }
    }
    
    // 开始对话
    this.dialogueSystem.startDialogue(npc.name, selectedDialogue, (option) => {
      // 处理任务相关选项
      if (option && option.action) {
        if (option.action === 'startQuest' && option.questId) {
          // 检查是否已有当前任务
          if (this.questSystem.currentQuest) {
            if (this.currentScene) {
              this.currentScene.showNotification(`你已经有一个进行中的任务，无法接受新任务`);
            }
          } else {
            const success = this.questSystem.startQuest(option.questId);
            if (success && this.currentScene) {
              const quest = this.questSystem.getQuest(option.questId);
              this.currentScene.showNotification(`接受了任务: ${quest.title}`);
            }
          }
        } else if (option.action === 'completeQuest') {
          const rewards = this.questSystem.completeQuest();
          if (rewards && this.currentScene) {
            // 应用任务奖励
            if (rewards.exp && this.player) {
              this.player.addExperience(rewards.exp);
              this.currentScene.showNotification(`获得 ${rewards.exp} 经验`);
            }
            if (rewards.items) {
              rewards.items.forEach(item => {
                this.inventorySystem.addItem(this.itemSystem.createItem(item.id), item.quantity || 1);
                this.currentScene.showNotification(`获得物品: ${item.name || item.id}`);
              });
            }
            this.currentScene.showNotification(`完成了任务`);
          }
        }
      }
      
      // 执行原始回调
      if (onEnd) onEnd(option);
    });
  }
  

  
  /**
   * 检查觉醒能力是否可解锁
   * @param {string} awakeningId - 觉醒能力ID
   * @returns {boolean} 是否可解锁
   */
  canUnlockAwakening(awakeningId) {
    return this.awakeningSystem.canUnlockAwakening(awakeningId, this.player);
  }
  
  /**
   * 解锁觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   * @returns {boolean} 是否成功解锁
   */
  unlockAwakening(awakeningId) {
    return this.awakeningSystem.unlockAwakening(awakeningId, this.player);
  }
  
  /**
   * 激活觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   * @returns {boolean} 是否成功激活
   */
  activateAwakening(awakeningId) {
    return this.awakeningSystem.activateAwakening(awakeningId, this.player);
  }
  
  /**
   * 停用觉醒能力
   * @param {string} awakeningId - 觉醒能力ID
   */
  deactivateAwakening(awakeningId) {
    this.awakeningSystem.deactivateAwakening(awakeningId, this.player);
  }
  
  /**
   * 获取当前觉醒值
   * @returns {number} 当前觉醒值
   */
  getAwakeningValue() {
    return this.awakeningSystem.getAwakeningValue();
  }
  
  /**
   * 获取觉醒阈值
   * @returns {number} 觉醒阈值
   */
  getAwakeningThreshold() {
    return this.awakeningSystem.getAwakeningThreshold();
  }
  
  /**
   * 检查是否可以进入觉醒状态
   * @returns {boolean} 是否可以觉醒
   */
  canAwaken() {
    return this.awakeningSystem.canAwaken();
  }
  
  /**
   * 进入觉醒状态
   * @returns {boolean} 是否成功进入觉醒状态
   */
  enterAwakening() {
    if (this.player) {
      return this.awakeningSystem.enterAwakening(this.player);
    }
    return false;
  }
  
  /**
   * 结束觉醒状态
   */
  endAwakening() {
    if (this.player) {
      this.awakeningSystem.endAwakening(this.player);
    }
  }
  
  /**
   * 更新觉醒系统
   */
  updateAwakeningSystem() {
    if (this.player) {
      this.awakeningSystem.update(this.player);
    }
  }
  
  /**
   * 清理资源（在游戏结束时调用）
   */
  cleanup() {
    // 停止游戏计时器
    this.stopGameTimer();
    
    // 移除事件监听
    document.removeEventListener('autosave', this.handleAutoSave.bind(this));
    
    console.log('游戏管理器已清理');
  }
}

export default GameManager;