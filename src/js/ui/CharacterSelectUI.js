/**
 * 角色选择UI
 * 显示游戏的角色选择界面，包括三种职业角色选项和开始游戏按钮
 */

import BaseUI from './BaseUI.js';

class CharacterSelectUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'overlay');
    
    // 当前选择的角色类型
    this.selectedCharacter = null;
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
    
    // 创建角色选择区域
    this.createCharacterOptions();
    
    // 创建按钮
    this.createButtons();
    
    // 创建角色信息区域
    this.createCharacterInfo();
    
    return this;
  }
  
  /**
   * 创建背景
   * 覆盖BaseUI中的createBackground方法，使用角色选择场景的背景图片
   */
  createBackground() {
    // 添加背景图片
    const background = this.scene.add.image(0, 0, 'select_background')
      .setOrigin(0)
      .setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height);
    
    this.addElement('background', background);
  }

  /**
   * 创建标题
   */
  createTitle() {
    // 添加场景标题
    const title = this.scene.add.text(
      this.scene.cameras.main.centerX,
      50,
      '选择你的职业',
      { fontSize: '32px', fill: '#fff', fontWeight: 'bold' }
    ).setOrigin(0.5);
    
    this.addElement('title', title);
  }

  /**
   * 创建角色选择区域
   */
  createCharacterOptions() {
    // 角色之间的水平间距
    const characterSpacing = 250;
    // 第一个角色的X坐标（从屏幕中心向左偏移一个间距）
    const startX = this.scene.cameras.main.centerX - characterSpacing;
    // 角色的Y坐标（屏幕高度的40%位置）
    const characterY = this.scene.cameras.main.height * 0.4;
    
    // 创建战士选项
    this.createCharacterOption(
      startX,
      characterY,
      'warrior_character',
      '战士',
      '高攻高物防，近战攻击',
      'warrior'
    );
    
    // 创建法师选项
    this.createCharacterOption(
      startX + characterSpacing,
      characterY,
      'mage_character',
      '法师',
      '高魔攻高魔防，远程攻击',
      'mage'
    );
    
    // 创建射手选项
    this.createCharacterOption(
      startX + characterSpacing * 2,
      characterY,
      'archer_character',
      '射手',
      '高攻高速，远程攻击',
      'archer'
    );
  }

  /**
   * 创建角色选择选项
   * @param {number} x - 选项的X坐标
   * @param {number} y - 选项的Y坐标
   * @param {string} texture - 角色头像的图片键名
   * @param {string} name - 角色名称
   * @param {string} description - 角色简短描述
   * @param {string} characterClass - 角色类型标识符（warrior/mage/archer）
   */
  createCharacterOption(x, y, texture, name, description, characterClass) {
    // 创建一个容器来组织角色选项的所有元素
    const container = this.scene.add.container(x, y);
    
    // 添加角色完整图片
    // 设置适当的尺寸，确保角色完整显示且比例协调
    const character = this.scene.add.image(0, 0, texture)
      .setOrigin(0.5)
      .setScale(0.8); // 缩放到适合选择界面的大小
    
    // 添加角色名称文本
    // 将文本位置下移，确保在角色图片下方显示
    const nameText = this.scene.add.text(0, 150, name, {
      fontSize: '24px',
      fill: '#fff',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    // 将角色图片和名称添加到容器中
    container.add([character, nameText]);
    
    // 设置容器的交互区域大小
    // 增加交互区域以适应完整角色图片
    container.setSize(character.width * character.scaleX, character.height * character.scaleY + 50);
    container.setInteractive();
    
    
    // 添加鼠标悬停效果
    container.on('pointerover', () => {
      // 放大角色图片
      character.setScale(0.9); // 悬停时稍微放大
      // 更新信息文本
      this.updateCharacterInfoText(
        `${name}\n\n${description}\n\n点击选择此职业`
      );
    });
    
    // 添加鼠标离开效果
    container.on('pointerout', () => {
      // 如果当前角色不是已选择的角色，则恢复原始大小
      if (this.selectedCharacter !== characterClass) {
        character.setScale(0.8); // 恢复原始大小
      }
      
      // 更新信息文本
      if (!this.selectedCharacter) {
        this.updateCharacterInfoText('请选择一个职业');
      } else {
        this.updateCharacterInfo();
      }
    });
    
    // 添加点击事件
    container.on('pointerdown', () => {
      // 播放选择音效
      if (this.scene.selectSound) {
        this.scene.selectSound.play();
      }
      
      // 重置所有角色选项的选择状态
      this.resetSelections();
      
      // 设置当前选择的角色
      this.selectedCharacter = characterClass;
      
      // 保持角色图片放大状态，作为选中状态的视觉提示
      character.setScale(0.9);
      
      // 更新角色详细信息
      this.updateCharacterInfo();
      
      // 启用开始按钮
      this.enableStartButton();
    });
    
    // 存储角色信息到容器中
    container.characterClass = characterClass;
    container.character = character; // 更改变量名从portrait到character
    container.description = description;
    
    // 添加到UI元素集合
    this.addElement(`${characterClass}Container`, container);
    
    return container;
  }

  /**
   * 创建按钮
   */
  createButtons() {
    // 添加开始游戏按钮（初始为半透明状态，表示禁用）
    const startButton = this.scene.add.image(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.height * 0.8,
      'start_button'
    ).setOrigin(0.5).setAlpha(0.5);
    
    this.addElement('startButton', startButton);
    
    // 添加返回按钮
    const backButton = this.scene.add.image(
      100,
      50,
      'back_button'
    ).setOrigin(0.5).setScale(0.7);
    
    // 使返回按钮可交互
    backButton.setInteractive();
    
    // 添加悬停效果
    backButton.on('pointerover', () => {
      backButton.setScale(0.8);
    });
    
    backButton.on('pointerout', () => {
      backButton.setScale(0.7);
    });
    
    // 添加返回按钮点击事件
    backButton.on('pointerdown', () => {
      // 播放按钮点击音效
      if (this.scene.buttonSound) {
        this.scene.buttonSound.play('click');
      }
      
      // 返回主菜单场景
      this.scene.scene.start('MainMenuScene');
    });
    
    this.addElement('backButton', backButton);
  }

  /**
   * 创建角色信息区域
   */
  createCharacterInfo() {
    // 添加角色详细信息文本区域
    const characterInfoText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.height * 0.65,
      '请选择一个职业',
      { fontSize: '18px', fill: '#fff', align: 'center' }
    ).setOrigin(0.5);
    
    this.addElement('characterInfoText', characterInfoText);
  }

  /**
   * 更新角色信息文本
   * @param {string} text - 要显示的文本
   */
  updateCharacterInfoText(text) {
    const characterInfoText = this.getElement('characterInfoText');
    if (characterInfoText) {
      characterInfoText.setText(text);
    }
  }

  /**
   * 重置所有角色选择的状态
   */
  resetSelections() {
    // 重置战士
    const warriorContainer = this.getElement('warriorContainer');
    if (warriorContainer) {
      warriorContainer.character.setScale(0.8);
    }
    
    // 重置法师
    const mageContainer = this.getElement('mageContainer');
    if (mageContainer) {
      mageContainer.character.setScale(0.8);
    }
    
    // 重置射手
    const archerContainer = this.getElement('archerContainer');
    if (archerContainer) {
      archerContainer.character.setScale(0.8);
    }
    
    // 禁用开始按钮
    this.disableStartButton();
  }

  /**
   * 启用开始按钮
   */
  enableStartButton() {
    const startButton = this.getElement('startButton');
    if (startButton) {
      // 移除所有事件监听器
      startButton.removeAllListeners();
      // 设置为完全不透明
      startButton.setAlpha(1.0);
      // 使按钮可交互
      startButton.setInteractive();
      
      // 添加悬停效果
      startButton.on('pointerover', () => {
        startButton.setScale(1.1);
      });
      
      startButton.on('pointerout', () => {
        startButton.setScale(1.0);
      });
      
      // 添加点击事件
      startButton.on('pointerdown', () => {
        // 播放按钮点击音效
        if (this.scene.buttonSound) {
          this.scene.buttonSound.play('click');
        }
        
        // 保存选择的角色类型到注册表
        this.scene.registry.set('selectedCharacter', this.selectedCharacter);
        
        // 切换到游戏主场景
        this.scene.scene.start('GameScene');
      });
    }
  }

  /**
   * 禁用开始按钮
   */
  disableStartButton() {
    const startButton = this.getElement('startButton');
    if (startButton) {
      // 移除所有事件监听器
      startButton.removeAllListeners();
      // 设置为半透明
      startButton.setAlpha(0.5);
      // 禁用交互功能
      startButton.disableInteractive();
    }
  }

  /**
   * 更新角色详细信息
   */
  updateCharacterInfo() {
    // 如果没有选择角色，直接返回
    if (!this.selectedCharacter) return;
    
    // 用于存储角色详细信息的文本
    let info = '';
    
    // 根据选择的角色类型设置不同的信息
    switch (this.selectedCharacter) {
      case 'warrior': // 战士
        info = '战士\n\n高攻高物防但低速较低魔防\n使用近战攻击，武器类型为剑\n\n特点：\n- 强大的近战伤害\n- 高生命值和物理防御\n- 可以使用重型装备\n- 擅长群体控制技能';
        break;
      case 'mage': // 法师
        info = '法师\n\n高魔攻较高魔法低物防中速\n使用远程攻击，武器类型为法杖\n\n特点：\n- 强大的魔法伤害\n- 多样的元素技能\n- 区域效果攻击\n- 可以使用传送技能';
        break;
      case 'archer': // 射手
        info = '射手\n\n高攻高速较低物防较低魔防\n使用远程攻击，武器类型为弓箭\n\n特点：\n- 高物理伤害\n- 快速的攻击速度\n- 高暴击率\n- 擅长单体高伤害';
        break;
    }
    
    // 更新信息文本
    this.updateCharacterInfoText(info);
  }
}

export default CharacterSelectUI;