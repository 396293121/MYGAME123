/**
 * 输入管理器
 * 负责管理游戏中的所有输入控制，包括键盘、鼠标等
 */

class InputManager {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - 场景实例
   */
  constructor(scene) {
    this.scene = scene;
    this.cursors = null; // 方向键
    this.actionKeys = {}; // 动作键（攻击、跳跃等）
    this.eventListeners = []; // 事件监听器列表
  }

  /**
   * 初始化输入管理器
   */
  init() {
    // 创建方向键
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    // 创建攻击键
    this.actionKeys.attack = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 创建技能键
    this.actionKeys.heavySlash = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.actionKeys.whirlwind = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.actionKeys.battleCry = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // 创建暂停键
    this.actionKeys.pause = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.addKeyListener(this.actionKeys.pause, 'down', () => {
      this.togglePauseMenu();
    });
    
    return this;
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
    if (this.actionKeys.heavySlash && Phaser.Input.Keyboard.JustDown(this.actionKeys.heavySlash)) {
      if (this.scene.player.heavySlash && typeof this.scene.player.heavySlash === 'function') {
        const skillUsed = this.scene.player.heavySlash();
        if (skillUsed) {
          console.log('Heavy Slash skill activated');
        }
      }
    }
    
    if (this.actionKeys.whirlwind && Phaser.Input.Keyboard.JustDown(this.actionKeys.whirlwind)) {
      if (this.scene.player.whirlwind && typeof this.scene.player.whirlwind === 'function') {
        const skillUsed = this.scene.player.whirlwind();
        if (skillUsed) {
          console.log('Whirlwind skill activated');
        }
      }
    }
    
    if (this.actionKeys.battleCry && Phaser.Input.Keyboard.JustDown(this.actionKeys.battleCry)) {
      if (this.scene.player.battleCry && typeof this.scene.player.battleCry === 'function') {
        const skillUsed = this.scene.player.battleCry();
        if (skillUsed) {
          console.log('Battle Cry skill activated');
        }
      }
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