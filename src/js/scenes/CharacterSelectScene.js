/**
 * 角色选择场景
 * 允许玩家选择不同职业的角色（战士、法师、射手）
 * 显示角色属性并提供开始游戏功能
 */

import CharacterSelectUI from '../ui/CharacterSelectUI.js';
import UIManager from '../ui/UIManager.js';

class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    // 调用父类构造函数并设置场景的唯一键名为'CharacterSelectScene'
    super({ key: 'CharacterSelectScene' });
    
    // UI管理器
    this.uiManager = null;
  }

  preload() {
    // 预加载阶段：加载角色选择场景所需的所有资源
    // 背景图片
    this.load.image('select_background', 'assets/images/ui/backgrounds/character_select_bg.png');
    
    // 角色完整图片（替换原来的头像）
    this.load.image('warrior_character', 'assets/images/characters/warrior_character_show.png'); // 战士角色
    this.load.image('mage_character', 'assets/images/characters/mage_character_show.png');       // 法师角色
    this.load.image('archer_character', 'assets/images/characters/archer_character_show.png');    // 射手角色
    

    
    // 按钮图片
    this.load.image('start_button', 'assets/images/ui/buttons/start_button.png'); // 开始游戏按钮
    this.load.image('back_button', 'assets/images/ui/buttons/back_button.png');   // 返回按钮
    
    // 选择音效
    this.load.audio('select_sound', 'assets/audio/button_click.mp3');
    // 按钮点击音效（复用主菜单的音效）
    this.load.audio('button_click', 'assets/audio/button_click.mp3');
  }

  create() {
    // 创建阶段：设置场景中的所有游戏对象
    
    // 添加按钮点击音效并创建1秒的音频标记
    this.buttonSound = this.sound.add('button_click');
    this.buttonSound.addMarker({
      name: 'click',
      start: 0,
      duration: 1.0
    });
    
    // 添加选择音效
    this.selectSound = this.sound.add('select_sound', { volume: 0.5 });
    
    // 初始化UI管理器
    this.uiManager = new UIManager(this);
    
    // 创建并注册角色选择UI
    const characterSelectUI = new CharacterSelectUI(this);
    characterSelectUI.init();
    
    // 注册UI到管理器
    this.uiManager.register('characterSelectUI', characterSelectUI);
    
    // 显示角色选择UI
    this.uiManager.show('characterSelectUI');
  }

}

export default CharacterSelectScene;