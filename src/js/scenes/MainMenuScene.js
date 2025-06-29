/**
 * 主菜单场景
 * 游戏的第一个场景，显示游戏标题、开始按钮和选项按钮
 */

import MainMenuUI from '../ui/MainMenuUI.js';
import UIManager from '../ui/UIManager.js';

class MainMenuScene extends Phaser.Scene {
  constructor() {
    // 调用父类构造函数并设置场景的唯一键名为'MainMenuScene'
    // 这个键名在场景切换时会用到
    super({ key: 'MainMenuScene' });
    
    // UI管理器
    this.uiManager = null;
    
    // 背景音乐（现在由GameManager统一管理）
    // this.menuMusic = null; // 已移除，使用GameManager管理
  }

  preload() {
    // 预加载阶段：加载菜单所需的所有资源（图片和音频）
    // 背景图片
    this.load.image('background', 'assets/images/ui/backgrounds/menu_background.png');
    // 游戏标志/标题图片
    this.load.image('logo', 'assets/images/ui/icons/game_logo.png');
    // 游戏标题文字图片
    this.load.image('menu_title', 'assets/images/ui/icons/menu_title.png');
    // 开始游戏按钮图片
    this.load.image('play_button', 'assets/images/ui/buttons/play_button.png');
    // 继续游戏按钮图片
    this.load.image('continue_button', 'assets/images/ui/buttons/continue_button.png');
    // 选项按钮图片
    this.load.image('options_button', 'assets/images/ui/buttons/options_button.png');
    // 退出游戏按钮图片
    this.load.image('exit_button', 'assets/images/ui/buttons/exit_button.png');
    // 背景音乐
    this.load.audio('menu_music', 'assets/audio/menu_music.wav');
    // 按钮点击音效
    this.load.audio('button_click', 'assets/audio/button_click.mp3');
  }

  create() {
    // 创建阶段：设置场景中的所有游戏对象
    
    // 使用GameManager播放背景音乐
    if (this.game.gameManager) {
      this.game.gameManager.playSceneBgMusic(this, {
        key: 'menu_music',
        volume: 0.5
      });
    }
    
    // 添加按钮点击音效并创建1秒的音频标记
    this.buttonSound = this.sound.add('button_click');
    this.buttonSound.addMarker({
      name: 'click',
      start: 0,
      duration: 1.0
    });
    
    // 初始化UI管理器
    this.uiManager = new UIManager(this);
    
    // 创建并注册主菜单UI
    const mainMenuUI = new MainMenuUI(this);
    mainMenuUI.init();
    
    // 注册UI到管理器
    this.uiManager.register('mainMenuUI', mainMenuUI);
    
    // 显示主菜单UI
    this.uiManager.show('mainMenuUI');
    
    // 设置场景切换事件监听
    this.events.on('shutdown', () => {
      // 场景关闭时停止音乐（由GameManager统一管理）
      if (this.game.gameManager) {
        this.game.gameManager.stopBgMusic();
      }
    });
  }
}

export default MainMenuScene;