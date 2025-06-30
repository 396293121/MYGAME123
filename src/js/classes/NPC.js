/**
 * NPC类
 * 用于创建游戏中的非玩家角色，支持对话和任务交互
 */

class NPC {
  constructor(scene, x, y, texture, name, dialogues = []) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.name = name;
    this.dialogues = dialogues; // 对话内容数组
    this.currentDialogueIndex = 0;
    this.isInteractable = true;
    this.interactionDistance = 50; // 玩家可以与NPC交互的距离
    this.questsAvailable = []; // 该NPC提供的任务
    this.questsCompleted = []; // 该NPC已完成的任务
    
    // 设置物理属性
    this.sprite.setImmovable(true);
    this.sprite.body.setAllowGravity(false);
    
    // 添加交互提示（当玩家靠近时显示）
    this.interactionIndicator = scene.add.sprite(x, y - 40, 'interaction_indicator');
    this.interactionIndicator.setVisible(false);
    
    // 添加NPC名称标签
    this.nameTag = scene.add.text(x, y - 20, name, {
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.nameTag.setOrigin(0.5);
  }
  
  /**
   * 更新NPC状态
   * @param {Object} player - 玩家角色
   */
  update(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 检查玩家是否在交互范围内
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    const isInRange = distance < this.interactionDistance;
    this.interactionIndicator.setVisible(isInRange && this.isInteractable);
    
    // 更新交互提示位置
    this.interactionIndicator.x = this.sprite.x;
    this.interactionIndicator.y = this.sprite.y - 40;
    
    // 更新名称标签位置
    this.nameTag.x = this.sprite.x;
    this.nameTag.y = this.sprite.y - 20;
  }
  
  /**
   * 与NPC交互（开始对话）
   * @returns {Object} 当前对话内容
   */
  interact() {
    if (!this.isInteractable) return null;
    
    // 获取当前对话
    const dialogue = this.getCurrentDialogue();
    
    // 如果对话有多个部分，准备下一部分
    if (this.hasMoreDialogue()) {
      this.currentDialogueIndex++;
    } else {
      // 对话结束，重置索引以便下次交互
      this.currentDialogueIndex = 0;
    }
    
    return dialogue;
  }
  
  /**
   * 获取当前对话内容
   * @returns {Object} 当前对话内容
   */
  getCurrentDialogue() {
    if (this.dialogues.length === 0) return null;
    return this.dialogues[this.currentDialogueIndex];
  }
  
  /**
   * 检查是否有更多对话
   * @returns {boolean} 是否有更多对话
   */
  hasMoreDialogue() {
    return this.currentDialogueIndex < this.dialogues.length - 1;
  }
  
  /**
   * 设置NPC对话内容
   * @param {Array} dialogues - 对话内容数组
   */
  setDialogues(dialogues) {
    this.dialogues = dialogues;
    this.currentDialogueIndex = 0;
  }
  
  /**
   * 添加任务到NPC
   * @param {string} questId - 任务ID
   */
  addQuest(questId) {
    if (!this.questsAvailable.includes(questId)) {
      this.questsAvailable.push(questId);
    }
  }
  
  /**
   * 完成NPC任务
   * @param {string} questId - 任务ID
   */
  completeQuest(questId) {
    const index = this.questsAvailable.indexOf(questId);
    if (index !== -1) {
      this.questsAvailable.splice(index, 1);
      this.questsCompleted.push(questId);
    }
  }
  
  /**
   * 检查NPC是否有可用任务
   * @returns {boolean} 是否有可用任务
   */
  hasAvailableQuests() {
    return this.questsAvailable.length > 0;
  }
  
  /**
   * 设置NPC是否可交互
   * @param {boolean} value - 是否可交互
   */
  setInteractable(value) {
    this.isInteractable = value;
    this.interactionIndicator.setVisible(false);
  }
}

export default NPC;