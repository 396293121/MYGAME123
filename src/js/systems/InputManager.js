/**
 * 输入管理器
 * 负责管理游戏中的所有输入控制，包括键盘、鼠标等
 */

import { getCharacterConfig } from '../data/CharacterConfig.js';

class InputManager {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - 场景实例
   */
  constructor(scene) {
    this.scene = scene;
    this.cursors = null; // 方向键
    this.actionKeys = {}; // 动作键（攻击、跳跃等）
    this.skillKeys = {}; // 技能键映射
    this.eventListeners = []; // 事件监听器列表
    this.playerClass = null; // 玩家职业
  }

  /**
   * 初始化输入管理器
   * @param {string} playerClass - 玩家职业类型
   */
  init(playerClass = 'warrior') {
    this.playerClass = playerClass;
    
    // 创建方向键
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    // 创建攻击键
    this.actionKeys.attack = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 动态创建技能键
    this.initSkillKeys();
    
    // 创建暂停键
    this.actionKeys.pause = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.addKeyListener(this.actionKeys.pause, 'down', () => {
      this.togglePauseMenu();
    });
    
    return this;
  }

  /**
   * 初始化技能键映射
   */
  initSkillKeys() {
    const config = getCharacterConfig(this.playerClass);
    if (!config || !config.skillKeyMappings) {
      console.warn(`No skill key mappings found for class: ${this.playerClass}`);
      return;
    }

    // 清空现有技能键
    this.skillKeys = {};

    // 根据配置创建技能键
    Object.entries(config.skillKeyMappings).forEach(([keyCode, skillInfo]) => {
      const phaserKeyCode = Phaser.Input.Keyboard.KeyCodes[keyCode];
      if (phaserKeyCode) {
        this.skillKeys[keyCode] = {
          key: this.scene.input.keyboard.addKey(phaserKeyCode),
          skillId: skillInfo.skillId,
          methodName: skillInfo.methodName
        };
      }
    });
  }

  /**
   * 添加键盘事件监听器
   * @param {Phaser.Input.Keyboard.Key} key - 键
   * @param {string} event - 事件类型（'down', 'up', 'press'）
   * @param {Function} callback - 回调函数
   */
  addKeyListener(key, event, callback) {
    key.on(event, callback);
    this.eventListeners.push({ key, event, callback });
  }

  /**
   * 更新输入状态
   * 在场景的update方法中调用
   */
  update() {
    if (!this.scene.player) return;
    
    // 处理攻击输入
    if (this.actionKeys.attack && this.actionKeys.attack.isDown && this.scene.player.canAttack) {
      const attackInfo = this.scene.player.attack();
      // 攻击已启动，伤害判定将在动画关键帧时通过事件系统处理
      if (attackInfo && attackInfo.initiated) {
        console.log('Player attack initiated:', attackInfo);
      }
    }
    
    // 处理技能输入
    this.handleSkillInputs();
  }

  /**
   * 处理技能输入
   */
  handleSkillInputs() {
    Object.entries(this.skillKeys).forEach(([keyCode, skillInfo]) => {
      if (Phaser.Input.Keyboard.JustDown(skillInfo.key)) {
        const player = this.scene.player;
        if (player && player[skillInfo.methodName] && typeof player[skillInfo.methodName] === 'function') {
          const skillUsed = player[skillInfo.methodName]();
          if (skillUsed) {
            console.log(`${skillInfo.methodName} skill activated`);
          }
        }
      }
    });
  }

  /**
   * 更新玩家职业（当玩家切换职业时调用）
   * @param {string} newPlayerClass - 新的玩家职业
   */
  updatePlayerClass(newPlayerClass) {
    if (this.playerClass !== newPlayerClass) {
      this.playerClass = newPlayerClass;
      this.initSkillKeys();
    }
  }

  /**
   * 切换暂停菜单
   * 直接调用UIManager的toggleMenu方法控制暂停菜单
   */
  togglePauseMenu() {
    if (this.scene.uiManager) {
      this.scene.uiManager.toggleMenu('pauseMenuUI');
    }
  }

  /**
   * 销毁输入管理器
   * 清理所有事件监听器
   */
  destroy() {
    // 清理所有事件监听器
    this.eventListeners.forEach(({ key, event, callback }) => {
      key.off(event, callback);
    });
    this.eventListeners = [];
  }
}

export default InputManager;