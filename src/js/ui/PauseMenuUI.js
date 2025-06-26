/**
 * 暂停菜单UI
 * 显示游戏暂停时的菜单界面，包括继续游戏、存档、读档、设置和退出按钮
 */

import BaseUI from './BaseUI.js';

class PauseMenuUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'modal');
  }

  /**
   * 初始化UI
   */
  init() {
    super.init();
    
    // 创建背景
    this.createBackground();
    
    // 创建标题
    this.createTitle();
    
    // 创建按钮
    this.createButtons();
    
    return this;
  }

  /**
   * 创建标题
   */
  createTitle() {
    // 添加暂停菜单标题
    const title = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.height * 0.2,
      '游戏暂停',
      {
        fontSize: '32px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5);
    
    this.addElement('title', title);
  }

  /**
   * 创建按钮
   */
  createButtons() {
    const centerX = this.scene.cameras.main.centerX;
    const startY = this.scene.cameras.main.height * 0.35;
    const buttonSpacing = 60;
    
    // 继续游戏按钮
    const continueButton = this.createButton(
      centerX,
      startY,
      'continue_button',
      () => {
        // 隐藏暂停菜单并恢复游戏
        this.hide();
        this.scene.physics.resume();
        this.scene.scene.resume();
      },
      '继续游戏'
    );
    this.addElement('continueButton', continueButton);
    
    // 保存游戏按钮
    const saveButton = this.createButton(
      centerX,
      startY + buttonSpacing,
      'save_button',
      () => {
        // 保存游戏
        this.scene.saveGame();
        
        // 显示保存成功提示
        this.showSaveSuccessMessage();
      },
      '保存游戏'
    );
    this.addElement('saveButton', saveButton);
    
    // 读取游戏按钮
    const loadButton = this.createButton(
      centerX,
      startY + buttonSpacing * 2,
      'load_button',
      () => {
        // 检查是否有存档
        if (this.scene.game.gameManager && this.scene.game.gameManager.saveSystem.hasSaveData()) {
          // 加载存档
          this.scene.loadSaveDataIfExists();
          
          // 隐藏暂停菜单并恢复游戏
          this.hide();
          this.scene.physics.resume();
          this.scene.scene.resume();
          
          // 显示加载成功提示
          this.showLoadSuccessMessage();
        } else {
          // 显示无存档提示
          this.showNoSaveDataMessage();
        }
      },
      '读取游戏'
    );
    this.addElement('loadButton', loadButton);
    
    // 设置按钮
    const optionsButton = this.createButton(
      centerX,
      startY + buttonSpacing * 3,
      'options_button',
      () => {
        // 显示设置菜单
        if (this.scene.game.gameManager && this.scene.game.gameManager.uiManager) {
          this.scene.game.gameManager.uiManager.show('optionsUI');
        }
      },
      '设置'
    );
    this.addElement('optionsButton', optionsButton);
    
    // 返回主菜单按钮
    const mainMenuButton = this.createButton(
      centerX,
      startY + buttonSpacing * 4,
      'exit_button',
      () => {
        // 返回主菜单
        this.scene.scene.start('MainMenuScene');
      },
      '返回主菜单'
    );
    this.addElement('mainMenuButton', mainMenuButton);
  }

  /**
   * 显示保存成功提示
   */
  showSaveSuccessMessage() {
    // 创建提示文本
    const message = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 100,
      '游戏已保存！',
      {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      }
    );
    message.setOrigin(0.5);
    message.setDepth(100);
    
    // 2秒后自动消失
    this.scene.time.delayedCall(2000, () => {
      message.destroy();
    });
  }

  /**
   * 显示加载成功提示
   */
  showLoadSuccessMessage() {
    // 创建提示文本
    const message = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 100,
      '游戏已加载！',
      {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      }
    );
    message.setOrigin(0.5);
    message.setDepth(100);
    
    // 2秒后自动消失
    this.scene.time.delayedCall(2000, () => {
      message.destroy();
    });
  }

  /**
   * 显示无存档提示
   */
  showNoSaveDataMessage() {
    // 创建提示文本
    const message = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 100,
      '没有找到存档数据！',
      {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      }
    );
    message.setOrigin(0.5);
    message.setDepth(100);
    
    // 2秒后自动消失
    this.scene.time.delayedCall(2000, () => {
      message.destroy();
    });
  }

  /**
   * 显示UI
   * @param {Object} data - 显示时传递的数据
   */
  show(data = {}) {
    super.show(data);
    
    // 暂停游戏物理和场景更新
    this.scene.physics.pause();
    
    return this;
  }

  /**
   * 隐藏UI
   */
  hide() {
    super.hide();
    
    // 恢复游戏物理
    this.scene.physics.resume();
    
    return this;
  }
}

export default PauseMenuUI;