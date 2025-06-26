/**
 * 主菜单UI
 * 显示游戏的主菜单界面，包括开始游戏、继续游戏、设置和退出按钮
 */

import BaseUI from './BaseUI.js';

class MainMenuUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'overlay');
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
   * 创建背景
   * 覆盖BaseUI中的createBackground方法，使用游戏的背景图片
   */
  createBackground() {
    // 添加背景图片
    const background = this.scene.add.image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height);
    
    this.addElement('background', background);
  }

  /**
   * 创建标题
   */
  createTitle() {

    
    // 添加游戏标题文字图片
    const menuTitle = this.scene.add.image(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.height * 0.25, 
      'menu_title'
    );
    menuTitle.setOrigin(0.5);
    menuTitle.setDepth(1); // 
    this.addElement('menuTitle', menuTitle);
        // 添加游戏标志/标题
        const logo = this.scene.add.image(
          this.scene.cameras.main.centerX,
          this.scene.cameras.main.height * 0.15, // 调整位置更靠上，为大按钮留出空间
          'logo'
        );
        logo.setOrigin(0.5);
        logo.setDisplaySize(logo.width * 0.3, logo.height * 0.3); // 增加标题大小
        logo.setDepth(2);
        this.addElement('logo', logo);
  }

  /**
   * 创建按钮
   */
  createButtons() {
    const centerX = this.scene.cameras.main.centerX;
    const startY = this.scene.cameras.main.height * 0.45;
    const buttonSpacing = 90;
    
    // 开始游戏按钮
    const playButton = this.createButton(
      centerX,
      startY,
      'play_button',
      () => {
        // 播放按钮点击音效
        if (this.scene.buttonSound) {
          this.scene.buttonSound.play('click');
        }
        
        // 切换到角色选择场景
        this.scene.scene.start('CharacterSelectScene');
      },
      '开始游戏'
    );
    this.addElement('playButton', playButton);
    // 继续游戏按钮
    const continueButton = this.createButton(
      centerX,
      startY + buttonSpacing,
      'continue_button',
      () => {
        // 播放按钮点击音效
        if (this.scene.buttonSound) {
          this.scene.buttonSound.play('click');
        }
        
        // 检查是否有存档
        if (this.scene.game.gameManager && this.scene.game.gameManager.saveSystem.hasSaveData()) {
          // 加载存档并进入游戏场景
          this.scene.game.gameManager.loadGame();
          this.scene.scene.start('GameScene');
        } else {
          // 显示无存档提示
          this.showNoSaveDataMessage();
        }
      },
      '继续游戏'
    );
    this.addElement('continueButton', continueButton);
    
    // 设置按钮
    const optionsButton = this.createButton(
      centerX,
      startY + buttonSpacing * 2,
      'options_button',
      () => {
        // 播放按钮点击音效
        if (this.scene.buttonSound) {
          this.scene.buttonSound.play('click');
        }
        
        // 显示设置菜单
        if (this.scene.game.gameManager && this.scene.game.gameManager.uiManager) {
          this.scene.game.gameManager.uiManager.show('optionsUI');
        }
      },
      '设置'
    );
    this.addElement('optionsButton', optionsButton);
    
    // 退出游戏按钮
    const exitButton = this.createButton(
      centerX,
      startY + buttonSpacing * 3,
      'exit_button',
      () => {
        // 播放按钮点击音效
        if (this.scene.buttonSound) {
          this.scene.buttonSound.play('click');
        }
        
        // 关闭游戏
        if (window.confirm('确定要退出游戏吗？')) {
          window.close();
          // 如果window.close()不起作用（大多数浏览器会阻止），显示提示信息
          const exitText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 50,
            '请手动关闭游戏窗口',
            { fontSize: '24px', fill: '#ffffff' }
          ).setOrigin(0.5);
          
          // 3秒后自动消失
          this.scene.time.delayedCall(3000, () => {
            exitText.destroy();
          });
        }
      },
      '退出游戏'
    );
    this.addElement('exitButton', exitButton);
  }

  /**
   * 显示无存档提示
   */
  showNoSaveDataMessage() {
    // 创建提示文本
    const message = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
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
}

export default MainMenuUI;