/**
 * 反馈UI
 * 显示游戏中的各种反馈信息，如任务更新、物品获取、成就解锁等
 */

import BaseUI from './BaseUI.js';

class FeedbackUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'hud');
    
    // 消息队列
    this.messageQueue = [];
    
    // 当前显示的消息
    this.currentMessages = [];
    
    // 消息类型配置
    this.messageTypes = {
      quest: { color: '#88ff88', icon: 'quest_icon', sound: 'quest_update' },
      item: { color: '#ffdd88', icon: 'item_icon', sound: 'item_pickup' },
      achievement: { color: '#88ddff', icon: 'achievement_icon', sound: 'achievement' },
      warning: { color: '#ff8888', icon: 'warning_icon', sound: 'warning' },
      info: { color: '#ffffff', icon: 'info_icon', sound: 'notification' }
    };
    
    // 消息显示时间（毫秒）
    this.messageDuration = 5000;
    
    // 消息淡出时间（毫秒）
    this.messageFadeTime = 500;
    
    // 最大同时显示消息数
    this.maxMessages = 3;
  }

  /**
   * 初始化UI
   */
  init() {
    super.init();
    
    // 创建消息容器
    this.createMessageContainer();
    
    // 创建任务追踪器
    this.createQuestTracker();
    
    // 默认显示
    this.visible = true;
    
    return this;
  }

  /**
   * 创建消息容器
   */
  createMessageContainer() {
    // 创建消息容器
    const messageContainer = this.scene.add.container(0, 0);
    messageContainer.setDepth(100); // 确保消息显示在最上层
    
    // 添加到主容器
    this.container.add(messageContainer);
    this.elements.messageContainer = messageContainer;
  }

  /**
   * 创建任务追踪器
   */
  createQuestTracker() {
    // 创建任务追踪器容器
    const trackerContainer = this.scene.add.container(0, 0);
    
    // 创建任务追踪器背景
    const trackerBg = this.scene.add.rectangle(
      this.scene.cameras.main.width - 210,
      120,
      200, 180,
      0x000000, 0.6
    );
    trackerBg.setOrigin(0.5);
    trackerBg.setStrokeStyle(1, 0x888888);
    
    // 创建任务追踪器标题
    const trackerTitle = this.scene.add.text(
      trackerBg.x,
      trackerBg.y - 70,
      '当前任务',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    trackerTitle.setOrigin(0.5);
    
    // 创建任务名称文本
    const questName = this.scene.add.text(
      trackerBg.x,
      trackerBg.y - 40,
      '',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffdd88',
        align: 'center',
        wordWrap: { width: 180 }
      }
    );
    questName.setOrigin(0.5);
    
    // 创建任务目标容器
    const objectivesContainer = this.scene.add.container(0, 0);
    
    // 添加到任务追踪器容器
    trackerContainer.add(trackerBg);
    trackerContainer.add(trackerTitle);
    trackerContainer.add(questName);
    trackerContainer.add(objectivesContainer);
    
    // 添加到主容器
    this.container.add(trackerContainer);
    this.elements.trackerContainer = trackerContainer;
    this.elements.trackerBg = trackerBg;
    this.elements.trackerTitle = trackerTitle;
    this.elements.questName = questName;
    this.elements.objectivesContainer = objectivesContainer;
  }

  /**
   * 添加消息到队列
   * @param {string} text - 消息文本
   * @param {string} type - 消息类型（quest, item, achievement, warning, info）
   * @param {Object} data - 附加数据
   */
  addMessage(text, type = 'info', data = {}) {
    // 创建消息对象
    const message = {
      text,
      type,
      data,
      timestamp: Date.now(),
      element: null
    };
    
    // 添加到队列
    this.messageQueue.push(message);
    
    // 处理消息队列
    this.processMessageQueue();
    
    // 播放消息音效
    const soundKey = this.messageTypes[type]?.sound;
    if (soundKey && this.scene.sound.get(soundKey)) {
      this.scene.sound.play(soundKey, { volume: 0.5 });
    }
  }

  /**
   * 处理消息队列
   */
  processMessageQueue() {
    // 如果当前显示的消息数量已达最大值，不处理队列
    if (this.currentMessages.length >= this.maxMessages) {
      return;
    }
    
    // 如果队列为空，不处理
    if (this.messageQueue.length === 0) {
      return;
    }
    
    // 取出队列中的第一条消息
    const message = this.messageQueue.shift();
    
    // 创建消息元素
    this.createMessageElement(message);
    
    // 添加到当前显示的消息列表
    this.currentMessages.push(message);
    
    // 设置消息自动消失的定时器
    this.scene.time.delayedCall(this.messageDuration, () => {
      this.removeMessage(message);
    });
  }

  /**
   * 创建消息元素
   * @param {Object} message - 消息对象
   */
  createMessageElement(message) {
    const messageContainer = this.elements.messageContainer;
    
    // 计算消息位置
    const x = 20;
    const y = this.scene.cameras.main.height - 100 - this.currentMessages.length * 60;
    
    // 创建消息容器
    const msgContainer = this.scene.add.container(x, y);
    
    // 获取消息类型配置
    const typeConfig = this.messageTypes[message.type] || this.messageTypes.info;
    
    // 创建消息背景
    const msgBg = this.scene.add.rectangle(
      0, 0,
      300, 50,
      0x000000, 0.7
    );
    msgBg.setOrigin(0);
    msgBg.setStrokeStyle(2, typeConfig.color);
    
    // 创建消息图标（如果有）
    let iconX = 25;
    if (typeConfig.icon && this.scene.textures.exists(typeConfig.icon)) {
      const icon = this.scene.add.image(iconX, 25, typeConfig.icon);
      icon.setOrigin(0.5);
      icon.setScale(0.8);
      msgContainer.add(icon);
      iconX = 50; // 调整文本位置
    }
    
    // 创建消息文本
    const msgText = this.scene.add.text(
      iconX, 25,
      message.text,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: typeConfig.color,
        wordWrap: { width: 240 }
      }
    );
    msgText.setOrigin(0, 0.5);
    
    // 添加到消息容器
    msgContainer.add(msgBg);
    msgContainer.add(msgText);
    
    // 添加到主消息容器
    messageContainer.add(msgContainer);
    
    // 设置消息元素引用
    message.element = msgContainer;
    
    // 添加动画效果
    msgContainer.setAlpha(0);
    msgContainer.setX(-300);
    
    this.scene.tweens.add({
      targets: msgContainer,
      x: x,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  /**
   * 移除消息
   * @param {Object} message - 消息对象
   */
  removeMessage(message) {
    // 如果消息已经被移除，不处理
    if (!message.element || !this.currentMessages.includes(message)) {
      return;
    }
    
    // 添加淡出动画
    this.scene.tweens.add({
      targets: message.element,
      x: -300,
      alpha: 0,
      duration: this.messageFadeTime,
      ease: 'Power2',
      onComplete: () => {
        // 从当前消息列表中移除
        const index = this.currentMessages.indexOf(message);
        if (index !== -1) {
          this.currentMessages.splice(index, 1);
        }
        
        // 销毁消息元素
        if (message.element) {
          message.element.destroy();
          message.element = null;
        }
        
        // 重新排列剩余消息
        this.rearrangeMessages();
        
        // 处理队列中的下一条消息
        this.processMessageQueue();
      }
    });
  }

  /**
   * 重新排列消息
   */
  rearrangeMessages() {
    // 重新计算每条消息的位置
    this.currentMessages.forEach((message, index) => {
      if (message.element) {
        const y = this.scene.cameras.main.height - 100 - index * 60;
        
        // 添加移动动画
        this.scene.tweens.add({
          targets: message.element,
          y: y,
          duration: 200,
          ease: 'Power2'
        });
      }
    });
  }

  /**
   * 更新任务追踪器
   */
  updateQuestTracker() {
    // 获取任务系统
    const questSystem = this.scene.game.gameManager.questSystem;
    if (!questSystem) return;
    
    // 获取当前活跃任务
    const activeQuest = questSystem.getActiveQuest();
    
    // 清空目标容器
    this.elements.objectivesContainer.removeAll(true);
    
    // 如果没有活跃任务，隐藏追踪器
    if (!activeQuest) {
      this.elements.trackerContainer.setVisible(false);
      return;
    }
    
    // 显示追踪器
    this.elements.trackerContainer.setVisible(true);
    
    // 更新任务名称
    this.elements.questName.setText(activeQuest.title);
    
    // 更新任务目标
    const objectivesContainer = this.elements.objectivesContainer;
    const startY = this.elements.trackerBg.y - 10;
    const itemSpacing = 25;
    
    activeQuest.objectives.forEach((objective, index) => {
      const y = startY + index * itemSpacing;
      
      // 获取目标进度
      const progress = activeQuest.progress.objectives[objective.id];
      const completed = progress && progress.completed;
      
      // 创建目标文本
      let objectiveText = `${objective.description}`;
      if (progress) {
        objectiveText += ` (${progress.current}/${progress.required})`;
      }
      
      // 创建目标文本对象
      const objText = this.scene.add.text(
        this.elements.trackerBg.x - 90,
        y,
        objectiveText,
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: completed ? '#88ff88' : '#ffffff',
          wordWrap: { width: 180 }
        }
      );
      objText.setOrigin(0, 0.5);
      
      // 如果目标已完成，添加复选标记
      if (completed) {
        const checkmark = this.scene.add.text(
          this.elements.trackerBg.x - 100,
          y,
          '✓',
          {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#88ff88'
          }
        );
        checkmark.setOrigin(0.5);
        objectivesContainer.add(checkmark);
      }
      
      // 添加到容器
      objectivesContainer.add(objText);
    });
    
    // 调整追踪器背景高度
    const bgHeight = 80 + activeQuest.objectives.length * itemSpacing;
    this.elements.trackerBg.height = bgHeight;
  }

  /**
   * 显示任务更新反馈
   * @param {string} questId - 任务ID
   * @param {string} status - 任务状态（started, updated, completed）
   * @param {Object} data - 附加数据
   */
  showQuestFeedback(questId, status, data = {}) {
    // 获取任务系统
    const questSystem = this.scene.game.gameManager.questSystem;
    if (!questSystem) return;
    
    // 获取任务信息
    const quest = questSystem.getQuest(questId);
    if (!quest) return;
    
    let message = '';
    
    switch (status) {
      case 'started':
        message = `新任务: ${quest.title}`;
        break;
      case 'updated':
        if (data.objectiveId) {
          const objective = quest.objectives.find(obj => obj.id === data.objectiveId);
          if (objective) {
            message = `任务更新: ${quest.title} - ${objective.description}`;
            if (data.progress) {
              message += ` (${data.progress.current}/${data.progress.required})`;
            }
          } else {
            message = `任务更新: ${quest.title}`;
          }
        } else {
          message = `任务更新: ${quest.title}`;
        }
        break;
      case 'completed':
        message = `任务完成: ${quest.title}`;
        break;
      default:
        message = `任务: ${quest.title}`;
    }
    
    // 添加消息
    this.addMessage(message, 'quest', { questId, status, ...data });
  }

  /**
   * 显示物品获取反馈
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   */
  showItemFeedback(itemId, quantity = 1) {
    // 获取物品系统
    const itemSystem = this.scene.game.gameManager.itemSystem;
    if (!itemSystem) return;
    
    // 获取物品信息
    const item = itemSystem.getItem(itemId);
    if (!item) return;
    
    // 构建消息
    let message = '';
    if (quantity > 1) {
      message = `获得 ${item.name} x${quantity}`;
    } else {
      message = `获得 ${item.name}`;
    }
    
    // 添加消息
    this.addMessage(message, 'item', { itemId, quantity });
  }

  /**
   * 显示成就解锁反馈
   * @param {string} achievementId - 成就ID
   * @param {string} name - 成就名称
   */
  showAchievementFeedback(achievementId, name) {
    // 构建消息
    const message = `成就解锁: ${name}`;
    
    // 添加消息
    this.addMessage(message, 'achievement', { achievementId, name });
  }

  /**
   * 显示警告反馈
   * @param {string} text - 警告文本
   */
  showWarning(text) {
    this.addMessage(text, 'warning');
  }

  /**
   * 显示信息反馈
   * @param {string} text - 信息文本
   */
  showInfo(text) {
    this.addMessage(text, 'info');
  }

  /**
   * 更新UI
   * @param {Object} data - 更新数据
   */
  update(data = {}) {
    super.update(data);
    
    // 更新任务追踪器
    this.updateQuestTracker();
    
    return this;
  }
}

export default FeedbackUI;