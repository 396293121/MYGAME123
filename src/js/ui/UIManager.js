/**
 * UI管理器
 * 负责管理所有UI界面，包括注册、显示、隐藏和切换UI
 */

class UIManager {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    this.scene = scene;
    this.uis = {}; // 存储所有UI实例
    this.activeUIs = []; // 当前活动的UI列表
    this.hudUIs = []; // 常驻HUD类型UI列表
  }

  /**
   * 注册UI
   * @param {string} key - UI键名
   * @param {BaseUI} ui - UI实例
   */
  register(key, ui) {
    this.uis[key] = ui;
    
    // 如果是HUD类型，添加到HUD列表
    if (ui.type === 'hud') {
      this.hudUIs.push(key);
    }
    
    return this;
  }

  /**
   * 显示UI
   * @param {string} key - UI键名
   * @param {Object} data - 传递给UI的数据
   */
  show(key, data = {}) {
    const ui = this.uis[key];
    if (!ui) {
      console.error(`UI不存在: ${key}`);
      return this;
    }
    
    // 如果是模态或覆盖类型，隐藏其他非HUD类型的UI
    if (ui.type === 'modal' || ui.type === 'overlay') {
      this.hideAllExcept(this.hudUIs);
    }
    
    // 显示UI
    ui.show(data);
    
    // 添加到活动UI列表
    if (!this.activeUIs.includes(key)) {
      this.activeUIs.push(key);
    }
    
    return this;
  }

  /**
   * 隐藏UI
   * @param {string} key - UI键名
   */
  hide(key) {
    const ui = this.uis[key];
    if (!ui) {
      console.error(`UI不存在: ${key}`);
      return this;
    }
    
    // 隐藏UI
    ui.hide();
    
    // 从活动UI列表中移除
    const index = this.activeUIs.indexOf(key);
    if (index !== -1) {
      this.activeUIs.splice(index, 1);
    }
    
    return this;
  }

  /**
   * 切换UI显示状态
   * @param {string} key - UI键名
   * @param {Object} data - 传递给UI的数据
   */
  toggle(key, data = {}) {
    const ui = this.uis[key];
    if (!ui) {
      console.error(`UI不存在: ${key}`);
      return this;
    }
    
    if (ui.visible) {
      this.hide(key);
    } else {
      this.show(key, data);
    }
    
    return this;
  }

  /**
   * 隐藏所有UI，除了指定的UI
   * @param {Array<string>} exceptions - 不需要隐藏的UI键名列表
   */
  hideAllExcept(exceptions = []) {
    Object.keys(this.uis).forEach(key => {
      if (!exceptions.includes(key) && this.uis[key].visible) {
        this.hide(key);
      }
    });
    
    return this;
  }

  /**
   * 隐藏所有UI
   */
  hideAll() {
    Object.keys(this.uis).forEach(key => {
      if (this.uis[key].visible) {
        this.hide(key);
      }
    });
    
    return this;
  }

  /**
   * 显示所有HUD类型UI
   */
  showHUDs() {
    this.hudUIs.forEach(key => {
      this.show(key);
    });
    
    return this;
  }

  /**
   * 获取UI实例
   * @param {string} key - UI键名
   * @returns {BaseUI} UI实例
   */
  getUI(key) {
    return this.uis[key];
  }

  /**
   * 更新所有活动UI
   * @param {Object} data - 更新数据
   */
  update(data = {}) {
    this.activeUIs.forEach(key => {
      this.uis[key].update(data);
    });
  }

  /**
   * 销毁所有UI
   */
  destroy() {
    Object.keys(this.uis).forEach(key => {
      this.uis[key].destroy();
    });
    
    this.uis = {};
    this.activeUIs = [];
    this.hudUIs = [];
  }
}

export default UIManager;