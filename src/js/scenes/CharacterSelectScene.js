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
    
    // 背景音乐（现在由GameManager统一管理）
    // this.bgMusic = null; // 已移除，使用GameManager管理
  }

  preload() {
    // 预加载阶段：加载角色选择场景所需的所有资源
    // 背景图片
    this.load.image('select_background', 'assets/images/ui/backgrounds/character_select_bg.png');
    
    // 角色完整图片（替换原来的头像）
    this.load.image('warrior_character', 'assets/images/characters/warrior/warrior_character_show.png'); // 战士角色
    this.load.image('mage_character', 'assets/images/characters/mage/mage_character_show.png');       // 法师角色
    this.load.image('archer_character', 'assets/images/characters/archer/archer_character_show.png');    // 射手角色
    
    // 加载战士行走动画精灵图
    this.load.atlas(
      'warrior_walking', 
      'assets/images/characters/warrior/sprite/walking/2.JSON.png', 
      'assets/images/characters/warrior/sprite/walking/processed_frame.json'
    );
    
    // 职业文字UI图
    this.load.image('warrior_text', 'assets/images/ui/texts/warrior_text.png'); // 战士文字
    this.load.image('mage_text', 'assets/images/ui/texts/mage_text.png');       // 法师文字
    this.load.image('archer_text', 'assets/images/ui/texts/archer_text.png');    // 射手文字
    
    // 选择职业标题
    this.load.image('class_selection_title', 'assets/images/ui/texts/class_selection_title.png');
    
    // 按钮图片
    this.load.image('start_button', 'assets/images/ui/buttons/start_button.png'); // 开始游戏按钮
    this.load.image('back_button', 'assets/images/ui/buttons/back_button.png');   // 返回按钮
    
    // 音频
    this.load.audio('select_sound', 'assets/audio/button_click.mp3');
    this.load.audio('button_click', 'assets/audio/button_click.mp3');
    this.load.audio('character_select_bgm', 'assets/audio/character_select_bgm.wav');
  }

  create() {
    // 创建阶段：设置场景中的所有游戏对象
    
    // 使用GameManager播放背景音乐
    if (this.game.gameManager) {
      this.game.gameManager.playSceneBgMusic(this, {
        key: 'character_select_bgm',
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
    
    // 添加选择音效
    this.selectSound = this.sound.add('select_sound', { volume: 0.5 });
    
    // 创建战士行走动画
    this.anims.create({
      key: 'warrior_walk',
      frames: this.anims.generateFrameNames('warrior_walking', {
        prefix: 'processed_frame_',
        suffix: '.png',
        start: 3,
        end: 22
      }),
      frameRate: 12,
      repeat: -1
    });
    
    // 初始化UI管理器
    this.uiManager = new UIManager(this);
    
    // 创建并注册角色选择UI
    const characterSelectUI = new CharacterSelectUI(this);
    characterSelectUI.init();
    
    // 注册UI到管理器
    this.uiManager.register('characterSelectUI', characterSelectUI);
    
    // 显示角色选择UI
    this.uiManager.show('characterSelectUI');
    this.events.on('shutdown', () => {
      // 场景关闭时停止音乐（由GameManager统一管理）
      if (this.game.gameManager) {
        this.game.gameManager.stopBgMusic();
      }
    });
  }
  
 

}

export default CharacterSelectScene;