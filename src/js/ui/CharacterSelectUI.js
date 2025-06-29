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
    
    // 对话框是否已创建的标志
    this.dialogCreated = false;
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
  /**
   * 创建标题
   */
  createTitle() {
    // 添加场景标题（使用图片替代文本） 根据UI背景调整布局
    const title = this.scene.add.image(
      this.scene.cameras.main.centerX+11,
      50+13,
      'class_selection_title'
    ).setOrigin(0.5);
    
    // 为标题图片添加圆角效果
    // 获取图片的宽高
    const width = title.displayWidth;
    const height = title.displayHeight;
    // 设置圆角半径（可以根据需要调整）
    const cornerRadius = 15;
    
    // 不设置交互区域，因为标题不需要交互
    // title.setInteractive(); // 移除这行代码，避免错误
    
    // 应用圆角蒙版
    const mask = this.scene.make.graphics();
    mask.fillStyle(0xffffff);
    mask.fillRoundedRect(
      title.x - width/2, 
      title.y - height/2, 
      width, 
      height, 
      cornerRadius
    );
    
    // 将蒙版应用到标题图片
    title.setMask(mask.createGeometryMask());
    
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
    //根据UI背景重新调整角色UI布局
    this.createCharacterOption(
      startX-124,
      characterY,
      'warrior_character',
      '战士',
      '高攻高物防，近战攻击',
      'warrior'
    );
    
    // 创建法师选项
    this.createCharacterOption(
      startX + characterSpacing+20,
      characterY-24,
      'mage_character',
      '法师',
      '高魔攻高魔防，远程攻击',
      'mage'
    );
    
    // 创建射手选项
    this.createCharacterOption(
      startX + characterSpacing * 2+151,
      characterY-9,
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
    
    // 添加角色名称图片（替代文本）
    const nameImage = this.scene.add.image(0, 250, `${characterClass}_text`)
      .setOrigin(0.5)
      .setScale(0.8); // 适当缩放
    
    // 添加职业描述文本（在角色名称下方）
    const descText = this.scene.add.text(0, 290, `${description}\n点击选择此职业`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, stroke: true, fill: true }
    }).setOrigin(0.5).setAlpha(0); // 初始设置为透明
    
    // 将角色图片、名称图片和描述文本添加到容器中
    container.add([character, nameImage, descText]);
    
    // 设置容器的交互区域大小
    // 增加交互区域以适应完整角色图片
    container.setSize(character.width * character.scaleX, character.height * character.scaleY + 50);
    container.setInteractive();
    
    // 添加呼吸效果动画（轻微的缩放变化）
    // 创建一个永久循环的补间动画，模拟呼吸效果
    const breathingTween = this.scene.tweens.add({
      targets: character,
      scaleX: 0.83, // 轻微放大
      scaleY: 0.83, // 轻微放大
      duration: 1500, // 呼吸周期时长
      yoyo: true, // 来回动画
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut', // 平滑的缓动效果
      paused: false // 立即开始动画
    });
    
    // 存储呼吸动画引用，以便后续控制
    character.breathingTween = breathingTween;
    
    
    // 添加鼠标悬停效果
    container.on('pointerover', () => {
      // 暂停呼吸动画
      if (character.breathingTween) {
        character.breathingTween.pause();
      }
      
      // 放大角色图片
      character.setScale(0.9); // 悬停时稍微放大
      
      // 显示描述文本并添加淡入特效
      this.scene.tweens.add({
        targets: descText,
        alpha: 1,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    // 添加鼠标离开效果
    container.on('pointerout', () => {
      // 如果当前角色不是已选择的角色，则恢复原始大小并重启呼吸动画
      if (this.selectedCharacter !== characterClass) {
        character.setScale(0.8); // 恢复原始大小
        
        // 重启呼吸动画
        if (character.breathingTween) {
          character.breathingTween.resume();
        }
      }
      
      // 如果不是选中的角色，隐藏描述文本
      if (this.selectedCharacter !== characterClass) {
        this.scene.tweens.add({
          targets: descText,
          alpha: 0,
          duration: 200,
          ease: 'Power2'
        });
      }
      
      // 更新信息文本
      if (!this.selectedCharacter) {
        this.updateCharacterInfoText('');
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
      
      // 暂停呼吸动画
      if (character.breathingTween) {
        character.breathingTween.pause();
      }
      
      // 隐藏描述文本
      this.scene.tweens.add({
        targets: descText,
        alpha: 0,
        duration: 200,
        ease: 'Power2'
      });
      
      // 更新角色详细信息并显示对话框
      this.updateCharacterInfo();
      
      // 不再在这里启用开始按钮，而是在对话框中显示
      // this.enableStartButton();
    });
    
    // 存储角色信息到容器中
    container.characterClass = characterClass;
    container.character = character; // 更改变量名从portrait到character
    container.description = description;
    container.descText = descText; // 存储描述文本引用
    
    // 添加到UI元素集合
    this.addElement(`${characterClass}Container`, container);
    
    return container;
  }

  /**
   * 创建按钮
   */
  createButtons() {
    // 不再在这里创建开始游戏按钮，而是在对话框中创建
    // 开始按钮将在showCharacterDialog方法中创建
    
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
      '',
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
      // 隐藏描述文本
      if (warriorContainer.descText) {
        this.scene.tweens.add({
          targets: warriorContainer.descText,
          alpha: 0,
          duration: 200,
          ease: 'Power2'
        });
      }
      // 恢复呼吸动画
      if (warriorContainer.character.breathingTween) {
        warriorContainer.character.breathingTween.resume();
      }
    }
    
    // 重置法师
    const mageContainer = this.getElement('mageContainer');
    if (mageContainer) {
      mageContainer.character.setScale(0.8);
      // 隐藏描述文本
      if (mageContainer.descText) {
        this.scene.tweens.add({
          targets: mageContainer.descText,
          alpha: 0,
          duration: 200,
          ease: 'Power2'
        });
      }
      // 恢复呼吸动画
      if (mageContainer.character.breathingTween) {
        mageContainer.character.breathingTween.resume();
      }
    }
    
    // 重置射手
    const archerContainer = this.getElement('archerContainer');
    if (archerContainer) {
      archerContainer.character.setScale(0.8);
      // 隐藏描述文本
      if (archerContainer.descText) {
        this.scene.tweens.add({
          targets: archerContainer.descText,
          alpha: 0,
          duration: 200,
          ease: 'Power2'
        });
      }
      // 恢复呼吸动画
      if (archerContainer.character.breathingTween) {
        archerContainer.character.breathingTween.resume();
      }
    }
    
    // 禁用开始按钮
    this.disableStartButton();
  }

  /**
   * 启用开始按钮
   * @param {Phaser.GameObjects.Image} startButton - 开始按钮对象
   */
  enableStartButton(startButton) {
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
        this.scene.registry.set('selectedCharacterType', this.selectedCharacter);
        
        // 切换到测试场景
        this.scene.scene.start('TestScene');
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
        info = '高攻高物防但低速较低魔防\n使用近战攻击，武器类型为剑\n\n特点：\n- 强大的近战伤害\n- 高生命值和物理防御\n- 可以使用重型装备\n- 擅长群体控制技能';
        break;
      case 'mage': // 法师
        info = '高魔攻较高魔法低物防中速\n使用远程攻击，武器类型为法杖\n\n特点：\n- 强大的魔法伤害\n- 多样的元素技能\n- 区域效果攻击\n- 可以使用传送技能';
        break;
      case 'archer': // 射手
        info = '高攻高速较低物防较低魔防\n使用远程攻击，武器类型为弓箭\n\n特点：\n- 高物理伤害\n- 快速的攻击速度\n- 高暴击率\n- 擅长单体高伤害';
        break;
    }
    
    // 显示角色详情对话框
    this.showCharacterDialog(info);
  }
  /**
   * 显示角色详情对话框
   * @param {string} info - 角色详细信息文本
   */
  showCharacterDialog(info) {
    // 如果对话框已创建，则只更新内容并确保可见
    if (this.dialogCreated && this.getElement('characterDialog')) {
      const dialogContainer = this.getElement('characterDialog');
      // 如果对话框被隐藏，则显示它
      if (!dialogContainer.visible) {
        dialogContainer.visible = true;
        dialogContainer.alpha = 0;
        // 添加淡入动画
        this.scene.tweens.add({
          targets: dialogContainer,
          alpha: 1,
          duration: 300,
          ease: 'Power2'
        });
      }
      this.updateCharacterDialog(info);
      return;
    }
    
    // 如果对话框不存在但标志为true，重置标志
    if (this.dialogCreated && !this.getElement('characterDialog')) {
      this.dialogCreated = false;
    }
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // 创建对话框容器
    const dialogContainer = this.scene.add.container(0, 0);
    
    // 创建半透明背景，点击时关闭对话框
    const bg = this.scene.add.rectangle(
      0, 0,
      width,
      height,
      0x000000, 0.7
    );
    bg.setOrigin(0);
    bg.setInteractive();
    bg.on('pointerdown', () => {
      // 播放关闭音效
      if (this.scene.buttonSound) {
        this.scene.buttonSound.play('click');
      }
      
      // 关闭对话框
      this.closeCharacterDialog();
    });
    
    // 对话框尺寸
    const dialogWidth = width * 0.7;
    const dialogHeight = height * 0.6;
    
    // 创建对话框背景（使用AI生成的背景提示词："fantasy game UI dialog box with magical border and ancient runes"）
    const dialogBg = this.scene.add.rectangle(
      width / 2,
      height / 2,
      dialogWidth,
      dialogHeight,
      0x1a1a2e, 0.95
    );
    dialogBg.setStrokeStyle(4, 0xc9a959);
    
    // 防止点击对话框时关闭
    dialogBg.setInteractive();
    dialogBg.on('pointerdown', (pointer, x, y, event) => {
      event.stopPropagation();
    });
    
    // 创建角色图片
    let characterImage;
    switch (this.selectedCharacter) {
      case 'warrior':
        // 使用动画精灵图替代静态图片
        characterImage = this.scene.add.sprite(width / 2 - dialogWidth / 4, height / 2 - 30, 'warrior_walking');
        characterImage.setScale(0.8); // 调整大小以适应对话框
        characterImage.setOrigin(0.5, 0.5); // 统一设置锚点为中心点
        characterImage.play('warrior_walk'); // 播放行走动画
        break;
      case 'mage':
        characterImage = this.scene.add.image(width / 2 - dialogWidth / 4, height / 2 - 30, 'mage_character');
        characterImage.setOrigin(0.5, 0.5);
        characterImage.setScale(0.8);
        break;
      case 'archer':
        characterImage = this.scene.add.image(width / 2 - dialogWidth / 4, height / 2 - 30, 'archer_character');
        characterImage.setOrigin(0.5, 0.5);
        characterImage.setScale(0.8);
        break;
    }
    
    // 创建角色名称
    const characterName = this.scene.add.text(
      width / 2 + 20,
      height / 2 - dialogHeight / 2 + 40,
      this.selectedCharacter.charAt(0).toUpperCase() + this.selectedCharacter.slice(1),
      {
        fontSize: '28px',
        fontFamily: 'Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, stroke: true, fill: true }
      }
    ).setOrigin(0, 0.5);
    
    // 创建角色详细信息文本
    const detailText = this.scene.add.text(
      width / 2 + 20,
      height / 2 - dialogHeight / 2 + 80,
      info,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        fill: '#ffffff',
        wordWrap: { width: dialogWidth / 2 - 40 },
        lineSpacing: 8
      }
    ).setOrigin(0, 0);
    
    // 创建开始游戏按钮
    const startButton = this.scene.add.image(
      width / 2 + dialogWidth / 4,
      height / 2 + dialogHeight / 2 - 50,
      'start_button'
    ).setOrigin(0.5);
    
    // 启用开始按钮
    this.enableStartButton(startButton);
    
    // 添加所有元素到对话框容器
    dialogContainer.add([bg, dialogBg, characterImage, characterName, detailText, startButton]);
    
    // 保存对话框元素的引用，以便后续更新
    dialogContainer.characterImage = characterImage;
    dialogContainer.characterName = characterName;
    dialogContainer.detailText = detailText;
    dialogContainer.startButton = startButton;
    
    // 添加到UI元素集合
    this.addElement('characterDialog', dialogContainer);
    
    // 设置对话框已创建标志
    this.dialogCreated = true;
    
    // 添加出现动画
    dialogBg.scaleX = 0;
    dialogBg.scaleY = 0;
    characterImage.setAlpha(0);
    characterName.setAlpha(0);
    detailText.setAlpha(0);
    startButton.setAlpha(0);
    
    // 对话框背景动画
    this.scene.tweens.add({
      targets: dialogBg,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 角色图片、文本和按钮动画
    this.scene.tweens.add({
      targets: [characterImage, characterName, detailText, startButton],
      alpha: 1,
      duration: 500,
      delay: 200,
      ease: 'Power2'
    });
  }
  
  /**
   * 更新角色详情对话框内容
   * @param {string} info - 角色详细信息文本
   */
  updateCharacterDialog(info) {
    const dialogContainer = this.getElement('characterDialog');
    if (!dialogContainer) return;
    
    // 获取对话框尺寸
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const dialogWidth = width * 0.7;
    const dialogHeight = height * 0.6;
    
    // 移除旧的角色图片
    if (dialogContainer.characterImage) {
      dialogContainer.characterImage.destroy();
    }
    
    // 创建新的角色图片
    let characterImage;
    switch (this.selectedCharacter) {
      case 'warrior':
        // 使用动画精灵图替代静态图片
        characterImage = this.scene.add.sprite(width / 2 - dialogWidth / 4, height / 2 - 30, 'warrior_walking');
        characterImage.setScale(0.8); // 调整大小以适应对话框
        characterImage.setOrigin(0.5, 0.5); // 统一设置锚点为中心点
        characterImage.play('warrior_walk'); // 播放行走动画
        break;
      case 'mage':
        characterImage = this.scene.add.image(width / 2 - dialogWidth / 4, height / 2 - 30, 'mage_character');
        break;
      case 'archer':
        characterImage = this.scene.add.image(width / 2 - dialogWidth / 4, height / 2 - 30, 'archer_character');
        break;
    }
    
    // 更新角色名称
    dialogContainer.characterName.setText(
      this.selectedCharacter.charAt(0).toUpperCase() + this.selectedCharacter.slice(1)
    );
    
    // 更新角色详细信息文本
    dialogContainer.detailText.setText(info);
    
    // 添加新的角色图片到容器
    dialogContainer.add(characterImage);
    dialogContainer.characterImage = characterImage;
    
    // 添加淡入动画
    characterImage.setAlpha(0);
    this.scene.tweens.add({
      targets: characterImage,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }
  
  /**
   * 关闭角色详情对话框
   */
  closeCharacterDialog() {
    const dialogContainer = this.getElement('characterDialog');
    if (dialogContainer) {
      // 添加关闭动画
      this.scene.tweens.add({
        targets: dialogContainer,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // 动画完成后隐藏对话框，但不移除它
          dialogContainer.visible = false;
          
          // 重置选择状态
          this.selectedCharacter = null;
          this.resetSelections();
          
          // 清空角色信息文本
          this.updateCharacterInfoText('');
        }
      });
    }
  }
}

  

export default CharacterSelectUI;