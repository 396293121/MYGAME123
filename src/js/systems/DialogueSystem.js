/**
 * 对话系统
 * 管理游戏中的对话界面和对话流程
 */

class DialogueSystem {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentDialogue = null;
    this.currentNPC = null;
    this.onDialogueEndCallback = null;
    
    // 创建对话UI
    this.createDialogueUI();
  }
  
  /**
   * 创建对话UI组件
   */
  createDialogueUI() {
    // 对话框背景
    this.dialogueBox = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height - 100,
      this.scene.cameras.main.width - 40,
      160,
      0x000000,
      0.7
    );
    this.dialogueBox.setStrokeStyle(2, 0xffffff);
    this.dialogueBox.setOrigin(0.5);
    
    // NPC名称文本
    this.nameText = this.scene.add.text(
      this.dialogueBox.x - this.dialogueBox.width / 2 + 20,
      this.dialogueBox.y - this.dialogueBox.height / 2 - 15,
      '',
      { fontSize: '18px', fill: '#ffff00', fontStyle: 'bold' }
    );
    
    // 对话内容文本
    this.contentText = this.scene.add.text(
      this.dialogueBox.x - this.dialogueBox.width / 2 + 20,
      this.dialogueBox.y - this.dialogueBox.height / 2 + 20,
      '',
      { fontSize: '16px', fill: '#ffffff', wordWrap: { width: this.dialogueBox.width - 40 } }
    );
    
    // 继续提示
    this.continueText = this.scene.add.text(
      this.dialogueBox.x + this.dialogueBox.width / 2 - 30,
      this.dialogueBox.y + this.dialogueBox.height / 2 - 20,
      '▼',
      { fontSize: '16px', fill: '#ffffff' }
    );
    
    // 创建选项按钮组（用于选择对话选项）
    this.optionButtons = [];
    
    // 默认隐藏对话UI
    this.hideDialogueUI();
  }
  
  /**
   * 开始对话
   * @param {Object} npc - NPC对象
   * @param {Function} onEnd - 对话结束时的回调函数
   */
  startDialogue(npc, onEnd = null) {
    this.currentNPC = npc;
    this.onDialogueEndCallback = onEnd;
    this.isActive = true;
    
    // 显示对话UI
    this.showDialogueUI();
    
    // 获取第一条对话
    const dialogue = npc.interact();
    this.displayDialogue(dialogue);
    
    // 添加点击事件以继续对话
    this.dialogueBox.setInteractive();
    this.dialogueBox.on('pointerdown', () => this.continueDialogue());
  }
  
  /**
   * 继续对话
   */
  continueDialogue() {
    if (!this.isActive || !this.currentNPC) return;
    
    // 如果有更多对话，显示下一条
    if (this.currentNPC.hasMoreDialogue()) {
      const dialogue = this.currentNPC.interact();
      this.displayDialogue(dialogue);
    } else {
      // 对话结束
      this.endDialogue();
    }
  }
  
  /**
   * 显示对话内容
   * @param {Object} dialogue - 对话内容对象
   */
  displayDialogue(dialogue) {
    if (!dialogue) {
      this.endDialogue();
      return;
    }
    
    this.currentDialogue = dialogue;
    
    // 设置名称和内容
    this.nameText.setText(dialogue.speaker || this.currentNPC.name);
    
    // 如果对话内容是字符串，直接显示
    if (typeof dialogue.content === 'string') {
      this.contentText.setText(dialogue.content);
      this.continueText.setVisible(true);
      this.clearOptions();
    } 
    // 如果对话内容包含选项，显示选项按钮
    else if (dialogue.options && Array.isArray(dialogue.options)) {
      this.contentText.setText(dialogue.content || '');
      this.continueText.setVisible(false);
      this.displayOptions(dialogue.options);
    }
  }
  
  /**
   * 显示对话选项
   * @param {Array} options - 选项数组
   */
  displayOptions(options) {
    this.clearOptions();
    
    const startY = this.contentText.y + this.contentText.height + 20;
    const buttonHeight = 30;
    
    options.forEach((option, index) => {
      const button = this.scene.add.rectangle(
        this.dialogueBox.x,
        startY + index * buttonHeight,
        this.dialogueBox.width - 60,
        25,
        0x333333
      );
      button.setStrokeStyle(1, 0xffffff);
      button.setOrigin(0.5);
      button.setInteractive();
      
      const text = this.scene.add.text(
        button.x,
        button.y,
        option.text,
        { fontSize: '14px', fill: '#ffffff' }
      );
      text.setOrigin(0.5);
      
      button.on('pointerover', () => {
        button.setFillStyle(0x555555);
      });
      
      button.on('pointerout', () => {
        button.setFillStyle(0x333333);
      });
      
      button.on('pointerdown', () => {
        if (option.action) {
          option.action();
        }
        
        if (option.nextDialogue) {
          this.displayDialogue(option.nextDialogue);
        } else {
          this.endDialogue();
        }
      });
      
      this.optionButtons.push({ button, text });
    });
  }
  
  /**
   * 清除对话选项
   */
  clearOptions() {
    this.optionButtons.forEach(({ button, text }) => {
      button.destroy();
      text.destroy();
    });
    this.optionButtons = [];
  }
  
  /**
   * 结束对话
   */
  endDialogue() {
    this.isActive = false;
    this.hideDialogueUI();
    this.dialogueBox.off('pointerdown');
    this.currentDialogue = null;
    
    // 调用结束回调
    if (this.onDialogueEndCallback) {
      this.onDialogueEndCallback();
      this.onDialogueEndCallback = null;
    }
  }
  
  /**
   * 显示对话UI
   */
  showDialogueUI() {
    this.dialogueBox.setVisible(true);
    this.nameText.setVisible(true);
    this.contentText.setVisible(true);
    this.continueText.setVisible(true);
  }
  
  /**
   * 隐藏对话UI
   */
  hideDialogueUI() {
    this.dialogueBox.setVisible(false);
    this.nameText.setVisible(false);
    this.contentText.setVisible(false);
    this.continueText.setVisible(false);
    this.clearOptions();
  }
  
  /**
   * 检查对话系统是否活动
   * @returns {boolean} 对话系统是否活动
   */
  isDialogueActive() {
    return this.isActive;
  }
}

export default DialogueSystem;