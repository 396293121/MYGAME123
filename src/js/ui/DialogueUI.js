/**
 * 对话系统UI
 * 显示游戏中的对话框、NPC对话和任务信息
 */

import BaseUI from './BaseUI.js';

class DialogueUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'overlay');
    
    // 对话数据
    this.dialogueData = null;
    
    // 当前对话索引
    this.currentDialogueIndex = 0;
    
    // 是否正在显示文本
    this.isTyping = false;
    
    // 打字速度（毫秒/字符）
    this.typingSpeed = 30;
    
    // 打字计时器
    this.typingTimer = null;
    
    // 对话框元素
    this.dialogueBox = null;
    this.speakerNameText = null;
    this.dialogueText = null;
    this.portraitImage = null;
    this.continueIndicator = null;
    
    // 选项按钮数组
    this.optionButtons = [];
  }

  /**
   * 初始化UI
   */
  init() {
    super.init();
    
    // 创建对话框
    this.createDialogueBox();
    
    // 创建选项容器
    this.createOptionsContainer();
    
    // 默认隐藏
    this.visible = false;
    
    return this;
  }

  /**
   * 创建对话框
   */
  createDialogueBox() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // 创建对话框背景
    this.dialogueBox = this.scene.add.rectangle(
      width / 2,
      height - 150,
      width - 100,
      200,
      0x000000,
      0.8
    );
    this.dialogueBox.setStrokeStyle(2, 0xffffff);
    this.addElement('dialogueBox', this.dialogueBox);
    
    // 创建肖像框背景
    const portraitBg = this.scene.add.rectangle(
      width / 2 - (width - 200) / 2 + 75,
      height - 150,
      150,
      150,
      0x333333,
      0.9
    );
    portraitBg.setStrokeStyle(1, 0xffffff);
    this.addElement('portraitBg', portraitBg);
    
    // 创建肖像图像
    this.portraitImage = this.scene.add.sprite(
      width / 2 - (width - 200) / 2 + 75,
      height - 150,
      'npc_portraits',
      0
    );
    this.portraitImage.setScale(1.5);
    this.addElement('portraitImage', this.portraitImage);
    
    // 创建说话者名称文本
    this.speakerNameText = this.scene.add.text(
      width / 2 - (width - 300) / 2 + 75,
      height - 230,
      '',
      {
        fontSize: '20px',
        fill: '#ffff00',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    );
    this.speakerNameText.setOrigin(0, 0.5);
    this.addElement('speakerNameText', this.speakerNameText);
    
    // 创建对话文本
    this.dialogueText = this.scene.add.text(
      width / 2 - (width - 300) / 2 + 75,
      height - 180,
      '',
      {
        fontSize: '18px',
        fill: '#ffffff',
        wordWrap: { width: width - 350 }
      }
    );
    this.dialogueText.setOrigin(0, 0);
    this.addElement('dialogueText', this.dialogueText);
    
    // 创建继续指示器
    this.continueIndicator = this.scene.add.text(
      width - 80,
      height - 70,
      '▼',
      {
        fontSize: '24px',
        fill: '#ffffff'
      }
    );
    this.continueIndicator.setOrigin(0.5);
    this.continueIndicator.setVisible(false);
    this.addElement('continueIndicator', this.continueIndicator);
    
    // 添加闪烁动画
    this.scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // 添加点击事件
    this.dialogueBox.setInteractive();
    this.dialogueBox.on('pointerdown', () => {
      this.handleDialogueClick();
    });
  }

  /**
   * 创建选项容器
   */
  createOptionsContainer() {
    // 创建选项容器
    const optionsContainer = this.scene.add.container(0, 0);
    optionsContainer.setVisible(false);
    this.addElement('optionsContainer', optionsContainer);
  }

  /**
   * 显示对话
   * @param {Object} dialogueData - 对话数据
   */
  showDialogue(dialogueData) {
    // 保存对话数据
    this.dialogueData = dialogueData;
    
    // 重置对话索引
    this.currentDialogueIndex = 0;
    
    // 显示UI
    this.show();
    
    // 显示第一条对话
    this.displayCurrentDialogue();
    
    return this;
  }

  /**
   * 显示当前对话
   */
  displayCurrentDialogue() {
    // 检查对话数据是否有效
    if (!this.dialogueData || !this.dialogueData.dialogues || 
        this.currentDialogueIndex >= this.dialogueData.dialogues.length) {
      this.endDialogue();
      return;
    }
    
    // 获取当前对话
    const dialogue = this.dialogueData.dialogues[this.currentDialogueIndex];
    
    // 更新说话者名称
    this.speakerNameText.setText(dialogue.speaker || '');
    
    // 更新肖像
    if (dialogue.portrait !== undefined) {
      this.portraitImage.setFrame(dialogue.portrait);
      this.portraitImage.setVisible(true);
    } else {
      this.portraitImage.setVisible(false);
    }
    
    // 清空对话文本
    this.dialogueText.setText('');
    
    // 隐藏继续指示器
    this.continueIndicator.setVisible(false);
    
    // 隐藏选项
    const optionsContainer = this.getElement('optionsContainer');
    if (optionsContainer) {
      optionsContainer.setVisible(false);
    }
    
    // 清除之前的打字计时器
    if (this.typingTimer) {
      this.typingTimer.remove();
    }
    
    // 开始打字效果
    this.typeText(dialogue.text);
  }

  /**
   * 打字效果
   * @param {string} text - 要显示的文本
   */
  typeText(text) {
    // 设置正在打字标志
    this.isTyping = true;
    
    // 当前已显示的字符数
    let currentCharIndex = 0;
    
    // 创建打字计时器
    this.typingTimer = this.scene.time.addEvent({
      delay: this.typingSpeed,
      callback: () => {
        // 添加下一个字符
        currentCharIndex++;
        this.dialogueText.setText(text.substring(0, currentCharIndex));
        
        // 播放打字音效（每3个字符播放一次）
        if (currentCharIndex % 3 === 0) {
          this.scene.sound.play('typing', { volume: 0.2 });
        }
        
        // 检查是否完成
        if (currentCharIndex >= text.length) {
          // 完成打字
          this.isTyping = false;
          
          // 显示继续指示器或选项
          this.showContinueOrOptions();
          
          // 停止计时器
          this.typingTimer.remove();
          this.typingTimer = null;
        }
      },
      repeat: text.length - 1
    });
  }

  /**
   * 显示继续指示器或选项
   */
  showContinueOrOptions() {
    // 获取当前对话
    const dialogue = this.dialogueData.dialogues[this.currentDialogueIndex];
    
    // 检查是否有选项
    if (dialogue.options && dialogue.options.length > 0) {
      // 显示选项
      this.showOptions(dialogue.options);
    } else {
      // 显示继续指示器
      this.continueIndicator.setVisible(true);
    }
  }

  /**
   * 显示选项
   * @param {Array} options - 选项数组
   */
  showOptions(options) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // 获取选项容器
    const optionsContainer = this.getElement('optionsContainer');
    if (!optionsContainer) return;
    
    // 清空之前的选项按钮
    this.optionButtons.forEach(button => {
      button.destroy();
    });
    this.optionButtons = [];
    
    // 计算选项位置
    const startY = height - 300;
    const optionHeight = 40;
    const optionSpacing = 10;
    
    // 创建选项按钮
    options.forEach((option, index) => {
      // 创建选项背景
      const optionBg = this.scene.add.rectangle(
        width / 2,
        startY + index * (optionHeight + optionSpacing),
        width - 200,
        optionHeight,
        0x333333,
        0.9
      );
      optionBg.setStrokeStyle(1, 0xffffff);
      optionBg.setInteractive({ useHandCursor: true });
      
      // 创建选项文本
      const optionText = this.scene.add.text(
        width / 2,
        startY + index * (optionHeight + optionSpacing),
        option.text,
        {
          fontSize: '16px',
          fill: '#ffffff'
        }
      );
      optionText.setOrigin(0.5);
      
      // 添加悬停效果
      optionBg.on('pointerover', () => {
        optionBg.fillColor = 0x555555;
      });
      
      optionBg.on('pointerout', () => {
        optionBg.fillColor = 0x333333;
      });
      
      // 添加点击事件
      optionBg.on('pointerdown', () => {
        this.handleOptionClick(option);
      });
      
      // 添加到容器
      optionsContainer.add(optionBg);
      optionsContainer.add(optionText);
      
      // 保存按钮引用
      this.optionButtons.push(optionBg);
      this.optionButtons.push(optionText);
    });
    
    // 显示选项容器
    optionsContainer.setVisible(true);
  }

  /**
   * 处理对话框点击
   */
  handleDialogueClick() {
    // 如果正在打字，立即完成当前文本
    if (this.isTyping) {
      // 停止打字计时器
      if (this.typingTimer) {
        this.typingTimer.remove();
        this.typingTimer = null;
      }
      
      // 立即显示完整文本
      const dialogue = this.dialogueData.dialogues[this.currentDialogueIndex];
      this.dialogueText.setText(dialogue.text);
      
      // 更新状态
      this.isTyping = false;
      
      // 显示继续指示器或选项
      this.showContinueOrOptions();
    } else {
      // 如果有选项显示，点击对话框不做任何操作
      const optionsContainer = this.getElement('optionsContainer');
      if (optionsContainer && optionsContainer.visible) {
        return;
      }
      
      // 继续下一条对话
      this.currentDialogueIndex++;
      this.displayCurrentDialogue();
    }
  }

  /**
   * 处理选项点击
   * @param {Object} option - 选项数据
   */
  handleOptionClick(option) {
    // 播放选择音效
    this.scene.sound.play('ui_select', { volume: 0.3 });
    
    // 执行选项回调
    if (option.callback) {
      option.callback();
    }
    
    // 如果有下一条对话索引，跳转到该对话
    if (option.nextIndex !== undefined) {
      this.currentDialogueIndex = option.nextIndex;
      this.displayCurrentDialogue();
    } else {
      // 否则继续下一条对话
      this.currentDialogueIndex++;
      this.displayCurrentDialogue();
    }
  }

  /**
   * 结束对话
   */
  endDialogue() {
    // 隐藏UI
    this.hide();
    
    // 执行对话结束回调
    if (this.dialogueData && this.dialogueData.onComplete) {
      this.dialogueData.onComplete();
    }
    
    // 清空对话数据
    this.dialogueData = null;
  }

  /**
   * 显示UI
   * @param {Object} data - 显示时传递的数据
   */
  show(data = {}) {
    super.show(data);
    
    // 如果传递了对话数据，显示对话
    if (data.dialogueData) {
      this.showDialogue(data.dialogueData);
    }
    
    return this;
  }

  /**
   * 隐藏UI
   */
  hide() {
    super.hide();
    
    // 清除打字计时器
    if (this.typingTimer) {
      this.typingTimer.remove();
      this.typingTimer = null;
    }
    
    return this;
  }
}

export default DialogueUI;