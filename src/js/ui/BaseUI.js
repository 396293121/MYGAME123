/**
 * 基础UI类
 * 所有UI界面的基类，提供通用的UI功能
 */

class BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   * @param {string} type - UI类型（'hud', 'modal', 'popup', 'overlay'）
   */
  constructor(scene, type = 'hud') {
    this.scene = scene;
    this.type = type; // UI类型：hud(常驻), modal(模态), popup(弹出), overlay(覆盖)
    this.visible = false;
    this.active = false;
    this.container = null; // 主容器
    this.elements = {}; // UI元素集合
    this.callbacks = {}; // 回调函数集合
    this.data = {}; // 自定义数据
  }

  /**
   * 初始化UI
   */
  init() {
    // 创建主容器
    this.container = this.scene.add.container(0, 0);
    this.container.setVisible(false);
    
    // 根据类型设置深度
    switch (this.type) {
      case 'hud':
        this.container.setDepth(10);
        break;
      case 'popup':
        this.container.setDepth(20);
        break;
      case 'modal':
        this.container.setDepth(30);
        break;
      case 'overlay':
        this.container.setDepth(40);
        break;
    }
    
    // 设置为固定位置（不随相机移动）
    if (this.type !== 'hud') {
      this.container.setScrollFactor(0);
    }
    
    return this;
  }

  /**
   * 显示UI
   * @param {Object} data - 显示时传递的数据
   */
  show(data = {}) {
    if (!this.container) {
      this.init();
    }
    
    this.data = {...this.data, ...data};
    this.container.setVisible(true);
    this.visible = true;
    this.active = true;
    
    // 如果是模态或覆盖类型，添加背景遮罩
    if ((this.type === 'modal' || this.type === 'overlay') && !this.elements.background) {
      this.createBackground();
    }
    
    // 触发显示回调
    if (this.callbacks.onShow) {
      this.callbacks.onShow(this.data);
    }
    
    return this;
  }

  /**
   * 隐藏UI
   */
  hide() {
    if (this.container) {
      this.container.setVisible(false);
      this.visible = false;
      this.active = false;
      
      // 触发隐藏回调
      if (this.callbacks.onHide) {
        this.callbacks.onHide();
      }
    }
    
    return this;
  }

  /**
   * 创建背景遮罩
   */
  createBackground() {
    // 创建半透明黑色背景
    const bg = this.scene.add.rectangle(
      0, 0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000, 0.7
    );
    bg.setOrigin(0);
    
    // 添加点击事件（如果是模态窗口，点击背景不关闭；如果是弹出窗口，点击背景关闭）
    if (this.type === 'popup' || this.type === 'overlay') {
      bg.setInteractive();
      bg.on('pointerdown', () => {
        this.hide();
      });
    }
    
    this.container.add(bg);
    this.elements.background = bg;
  }

  /**
   * 更新UI
   * @param {Object} data - 更新数据
   */
  update(data = {}) {
    this.data = {...this.data, ...data};
    
    // 触发更新回调
    if (this.callbacks.onUpdate) {
      this.callbacks.onUpdate(this.data);
    }
    
    return this;
  }

  /**
   * 销毁UI
   */
  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
      this.elements = {};
      this.visible = false;
      this.active = false;
      
      // 触发销毁回调
      if (this.callbacks.onDestroy) {
        this.callbacks.onDestroy();
      }
    }
  }

  /**
   * 添加UI元素
   * @param {string} key - 元素键名
   * @param {Phaser.GameObjects.GameObject} element - UI元素
   */
  addElement(key, element) {
    this.elements[key] = element;
    this.container.add(element);
    return element;
  }

  /**
   * 获取UI元素
   * @param {string} key - 元素键名
   * @returns {Phaser.GameObjects.GameObject} UI元素
   */
  getElement(key) {
    return this.elements[key];
  }

  /**
   * 移除UI元素
   * @param {string} key - 元素键名
   */
  removeElement(key) {
    if (this.elements[key]) {
      this.container.remove(this.elements[key]);
      this.elements[key].destroy();
      delete this.elements[key];
    }
  }

  /**
   * 设置回调函数
   * @param {string} event - 事件名称（onShow, onHide, onUpdate, onDestroy）
   * @param {Function} callback - 回调函数
   */
  setCallback(event, callback) {
    this.callbacks[event] = callback;
    return this;
  }

  /**
   * 创建按钮
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} texture - 按钮纹理键名
   * @param {Function} callback - 点击回调函数
   * @param {string} text - 按钮文本
   * @returns {Phaser.GameObjects.Sprite} 按钮精灵
   */
  createButton(x, y, texture, callback, text = '') {
    // 创建按钮精灵
    const button = this.scene.add.sprite(x, y, texture);
    button.setInteractive();
    
    // 添加悬停效果
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    // 添加点击效果和回调
    button.on('pointerdown', () => {
      button.setTint(0xaaaaaa);
      button.setScale(0.95);
      
      // 阻止事件冒泡
    
    });
    
    button.on('pointerup', (pointer) => {  
      button.clearTint();
      button.setScale(1);
      if (callback) callback();
    });
    
    // 如果有文本，添加文本标签
    if (text) {
      const buttonText = this.scene.add.text(x, y, text, {
        fontSize: '16px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      
      this.container.add(buttonText);
      this.elements[`${text}_text`] = buttonText;
    }
    
    // 添加到容器
    this.container.add(button);
    
    return button;
  }
}

export default BaseUI;