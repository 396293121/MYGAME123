/**
 * 任务UI
 * 显示和管理游戏中的任务，包括当前任务、任务目标进度和已完成任务
 */

import BaseUI from './BaseUI.js';

class QuestUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'modal');
    
    // 任务分类
    this.categories = {
      active: '进行中',
      completed: '已完成'
    };
    
    // 当前选中的分类
    this.currentCategory = 'active';
    
    // 当前选中的任务
    this.selectedQuest = null;
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
    
    // 创建分类标签
    this.createCategoryTabs();
    
    // 创建任务列表
    this.createQuestList();
    
    // 创建任务详情面板
    this.createQuestDetails();
    
    // 创建关闭按钮
    this.createCloseButton();
    
    // 默认隐藏
    this.visible = false;
    
    return this;
  }

  /**
   * 创建背景
   */
  createBackground() {
    // 创建半透明黑色背景
    const bg = this.scene.add.rectangle(
      0, 0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000, 0.7
    );
    bg.setOrigin(0);
    bg.setInteractive();
    
    // 添加到容器
    this.container.add(bg);
    this.elements.background = bg;
    
    // 创建任务面板背景
    const panelBg = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      700, 500,
      0x222222, 0.9
    );
    panelBg.setOrigin(0.5);
    panelBg.setStrokeStyle(2, 0xaaaaaa);
    
    // 添加到容器
    this.container.add(panelBg);
    this.elements.panelBg = panelBg;
  }

  /**
   * 创建标题
   */
  createTitle() {
    const title = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 230,
      '任务日志',
      {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5);
    
    // 添加到容器
    this.container.add(title);
    this.elements.title = title;
  }

  /**
   * 创建分类标签
   */
  createCategoryTabs() {
    const tabY = this.scene.cameras.main.height / 2 - 180;
    const tabWidth = 120;
    const tabHeight = 40;
    const tabSpacing = 10;
    const startX = this.scene.cameras.main.width / 2 - (Object.keys(this.categories).length * (tabWidth + tabSpacing)) / 2 + tabWidth / 2;
    
    // 创建标签容器
    const tabsContainer = this.scene.add.container(0, 0);
    this.container.add(tabsContainer);
    this.elements.tabsContainer = tabsContainer;
    
    // 创建各个分类标签
    let i = 0;
    for (const [category, label] of Object.entries(this.categories)) {
      const x = startX + i * (tabWidth + tabSpacing);
      
      // 创建标签背景
      const tabBg = this.scene.add.rectangle(x, tabY, tabWidth, tabHeight, 0x444444);
      tabBg.setStrokeStyle(2, 0x888888);
      tabBg.setOrigin(0.5);
      tabBg.setInteractive();
      
      // 创建标签文本
      const tabText = this.scene.add.text(x, tabY, label, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      tabText.setOrigin(0.5);
      
      // 添加点击事件
      tabBg.on('pointerdown', () => {
        this.selectCategory(category);
      });
      
      // 添加到容器
      tabsContainer.add(tabBg);
      tabsContainer.add(tabText);
      
      // 保存引用
      this.elements[`${category}TabBg`] = tabBg;
      this.elements[`${category}TabText`] = tabText;
      
      i++;
    }
    
    // 默认选中第一个分类
    this.selectCategory('active');
  }

  /**
   * 创建任务列表
   */
  createQuestList() {
    // 创建任务列表背景
    const listBg = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2 - 250,
      this.scene.cameras.main.height / 2,
      200, 350,
      0x333333, 0.8
    );
    listBg.setOrigin(0.5);
    listBg.setStrokeStyle(1, 0x888888);
    
    // 添加到容器
    this.container.add(listBg);
    this.elements.listBg = listBg;
    
    // 创建任务列表容器
    const listContainer = this.scene.add.container(0, 0);
    this.container.add(listContainer);
    this.elements.listContainer = listContainer;
  }

  /**
   * 创建任务详情面板
   */
  createQuestDetails() {
    // 创建详情面板背景
    const detailsBg = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2 + 150,
      this.scene.cameras.main.height / 2,
      400, 350,
      0x333333, 0.8
    );
    detailsBg.setOrigin(0.5);
    detailsBg.setStrokeStyle(1, 0x888888);
    
    // 添加到容器
    this.container.add(detailsBg);
    this.elements.detailsBg = detailsBg;
    
    // 创建详情面板容器
    const detailsContainer = this.scene.add.container(0, 0);
    this.container.add(detailsContainer);
    this.elements.detailsContainer = detailsContainer;
    
    // 创建任务标题
    const questTitle = this.scene.add.text(
      this.scene.cameras.main.width / 2 + 150,
      this.scene.cameras.main.height / 2 - 150,
      '',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    questTitle.setOrigin(0.5);
    detailsContainer.add(questTitle);
    this.elements.questTitle = questTitle;
    
    // 创建任务描述
    const questDesc = this.scene.add.text(
      this.scene.cameras.main.width / 2 + 150,
      this.scene.cameras.main.height / 2 - 110,
      '',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#cccccc',
        wordWrap: { width: 350 }
      }
    );
    questDesc.setOrigin(0.5, 0);
    detailsContainer.add(questDesc);
    this.elements.questDesc = questDesc;
    
    // 创建任务目标标题
    const objectivesTitle = this.scene.add.text(
      this.scene.cameras.main.width / 2 - 30,
      this.scene.cameras.main.height / 2 - 30,
      '任务目标:',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    objectivesTitle.setOrigin(0, 0.5);
    detailsContainer.add(objectivesTitle);
    this.elements.objectivesTitle = objectivesTitle;
    
    // 创建任务目标容器
    const objectivesContainer = this.scene.add.container(0, 0);
    detailsContainer.add(objectivesContainer);
    this.elements.objectivesContainer = objectivesContainer;
    
    // 创建任务奖励标题
    const rewardsTitle = this.scene.add.text(
      this.scene.cameras.main.width / 2 - 30,
      this.scene.cameras.main.height / 2 + 80,
      '任务奖励:',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    rewardsTitle.setOrigin(0, 0.5);
    detailsContainer.add(rewardsTitle);
    this.elements.rewardsTitle = rewardsTitle;
    
    // 创建任务奖励容器
    const rewardsContainer = this.scene.add.container(0, 0);
    detailsContainer.add(rewardsContainer);
    this.elements.rewardsContainer = rewardsContainer;
  }

  /**
   * 创建关闭按钮
   */
  createCloseButton() {
    // 创建关闭按钮背景
    const closeBtnBg = this.scene.add.circle(
      this.scene.cameras.main.width / 2 + 350,
      this.scene.cameras.main.height / 2 - 230,
      20,
      0x555555
    );
    closeBtnBg.setStrokeStyle(2, 0xaaaaaa);
    closeBtnBg.setInteractive();
    
    // 创建关闭按钮文本
    const closeBtnText = this.scene.add.text(
      closeBtnBg.x,
      closeBtnBg.y,
      'X',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    closeBtnText.setOrigin(0.5);
    
    // 添加点击事件
    closeBtnBg.on('pointerdown', () => {
      this.hide();
    });
    
    // 添加悬停效果
    closeBtnBg.on('pointerover', () => {
      closeBtnBg.setFillStyle(0x777777);
    });
    
    closeBtnBg.on('pointerout', () => {
      closeBtnBg.setFillStyle(0x555555);
    });
    
    // 添加到容器
    this.container.add(closeBtnBg);
    this.container.add(closeBtnText);
    this.elements.closeBtnBg = closeBtnBg;
    this.elements.closeBtnText = closeBtnText;
  }

  /**
   * 选择分类
   * @param {string} category - 分类名称
   */
  selectCategory(category) {
    // 更新当前分类
    this.currentCategory = category;
    
    // 更新标签样式
    for (const cat of Object.keys(this.categories)) {
      const tabBg = this.elements[`${cat}TabBg`];
      const tabText = this.elements[`${cat}TabText`];
      
      if (cat === category) {
        tabBg.setFillStyle(0x666666);
        tabBg.setStrokeStyle(2, 0xaaaaaa);
        tabText.setColor('#ffffff');
      } else {
        tabBg.setFillStyle(0x444444);
        tabBg.setStrokeStyle(2, 0x888888);
        tabText.setColor('#aaaaaa');
      }
    }
    
    // 更新任务列表
    this.updateQuestList();
    
    // 清空任务详情
    this.clearQuestDetails();
  }

  /**
   * 更新任务列表
   */
  updateQuestList() {
    // 清空任务列表
    const listContainer = this.elements.listContainer;
    listContainer.removeAll(true);
    
    // 获取任务系统
    const questSystem = this.scene.game.gameManager.questSystem;
    if (!questSystem) return;
    
    // 获取任务列表
    let quests = [];
    if (this.currentCategory === 'active') {
      const activeQuest = questSystem.getActiveQuest();
      if (activeQuest) quests = [activeQuest];
    } else if (this.currentCategory === 'completed') {
      quests = questSystem.getCompletedQuests();
    }
    
    // 创建任务项
    const startY = this.scene.cameras.main.height / 2 - 150;
    const itemHeight = 40;
    const itemSpacing = 10;
    
    quests.forEach((quest, index) => {
      const y = startY + index * (itemHeight + itemSpacing);
      
      // 创建任务项背景
      const itemBg = this.scene.add.rectangle(
        this.scene.cameras.main.width / 2 - 250,
        y,
        180, itemHeight,
        0x444444
      );
      itemBg.setOrigin(0.5);
      itemBg.setInteractive();
      
      // 创建任务项文本
      const itemText = this.scene.add.text(
        itemBg.x,
        itemBg.y,
        quest.title,
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ffffff',
          wordWrap: { width: 160 }
        }
      );
      itemText.setOrigin(0.5);
      
      // 添加点击事件
      itemBg.on('pointerdown', () => {
        this.selectQuest(quest);
        
        // 更新选中状态
        listContainer.getAll().forEach(child => {
          if (child.type === 'Rectangle') {
            child.setFillStyle(0x444444);
          }
        });
        itemBg.setFillStyle(0x666666);
      });
      
      // 添加悬停效果
      itemBg.on('pointerover', () => {
        if (this.selectedQuest !== quest) {
          itemBg.setFillStyle(0x555555);
        }
      });
      
      itemBg.on('pointerout', () => {
        if (this.selectedQuest !== quest) {
          itemBg.setFillStyle(0x444444);
        }
      });
      
      // 添加到容器
      listContainer.add(itemBg);
      listContainer.add(itemText);
    });
    
    // 如果没有任务，显示提示信息
    if (quests.length === 0) {
      const noQuestText = this.scene.add.text(
        this.scene.cameras.main.width / 2 - 250,
        this.scene.cameras.main.height / 2,
        this.currentCategory === 'active' ? '没有进行中的任务' : '没有已完成的任务',
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#aaaaaa'
        }
      );
      noQuestText.setOrigin(0.5);
      listContainer.add(noQuestText);
    }
  }

  /**
   * 选择任务
   * @param {Object} quest - 任务数据
   */
  selectQuest(quest) {
    this.selectedQuest = quest;
    this.updateQuestDetails();
  }

  /**
   * 更新任务详情
   */
  updateQuestDetails() {
    // 清空任务详情
    this.clearQuestDetails();
    
    if (!this.selectedQuest) return;
    
    // 更新任务标题
    this.elements.questTitle.setText(this.selectedQuest.title);
    
    // 更新任务描述
    this.elements.questDesc.setText(this.selectedQuest.description);
    
    // 更新任务目标
    const objectivesContainer = this.elements.objectivesContainer;
    const startY = this.scene.cameras.main.height / 2;
    const itemSpacing = 30;
    
    this.selectedQuest.objectives.forEach((objective, index) => {
      const y = startY + index * itemSpacing;
      
      // 创建目标文本
      let objectiveText = objective.description;
      
      // 如果是进行中的任务，显示进度
      if (this.currentCategory === 'active' && this.selectedQuest.progress) {
        const progress = this.selectedQuest.progress.objectives[objective.id];
        if (progress) {
          objectiveText += ` (${progress.current}/${progress.required})`;
        }
      }
      
      // 创建目标文本对象
      const objText = this.scene.add.text(
        this.scene.cameras.main.width / 2 - 10,
        y,
        objectiveText,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: this.currentCategory === 'completed' || 
                 (this.selectedQuest.progress && 
                  this.selectedQuest.progress.objectives[objective.id] && 
                  this.selectedQuest.progress.objectives[objective.id].completed) ? 
                 '#88ff88' : '#ffffff'
        }
      );
      objText.setOrigin(0, 0.5);
      
      // 添加到容器
      objectivesContainer.add(objText);
    });
    
    // 更新任务奖励
    if (this.selectedQuest.rewards) {
      const rewardsContainer = this.elements.rewardsContainer;
      const rewards = this.selectedQuest.rewards;
      let rewardTexts = [];
      
      // 经验奖励
      if (rewards.exp) {
        rewardTexts.push(`经验: ${rewards.exp}`);
      }
      
      // 金币奖励
      if (rewards.gold) {
        rewardTexts.push(`金币: ${rewards.gold}`);
      }
      
      // 物品奖励
      if (rewards.items && rewards.items.length > 0) {
        const itemSystem = this.scene.game.gameManager.itemSystem;
        const itemNames = rewards.items.map(itemId => {
          const item = itemSystem ? itemSystem.getItem(itemId) : null;
          return item ? item.name : itemId;
        });
        rewardTexts.push(`物品: ${itemNames.join(', ')}`);
      }
      
      // 声望奖励
      if (rewards.reputation) {
        rewardTexts.push(`声望: ${rewards.reputation.faction} +${rewards.reputation.amount}`);
      }
      
      // 创建奖励文本
      const rewardY = this.scene.cameras.main.height / 2 + 110;
      const rewardSpacing = 25;
      
      rewardTexts.forEach((text, index) => {
        const y = rewardY + index * rewardSpacing;
        
        const rewardText = this.scene.add.text(
          this.scene.cameras.main.width / 2 - 10,
          y,
          text,
          {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffdd88'
          }
        );
        rewardText.setOrigin(0, 0.5);
        
        // 添加到容器
        rewardsContainer.add(rewardText);
      });
    }
  }

  /**
   * 清空任务详情
   */
  clearQuestDetails() {
    // 清空任务标题和描述
    this.elements.questTitle.setText('');
    this.elements.questDesc.setText('');
    
    // 清空任务目标
    this.elements.objectivesContainer.removeAll(true);
    
    // 清空任务奖励
    this.elements.rewardsContainer.removeAll(true);
  }

  /**
   * 显示UI
   * @param {Object} data - 显示时传递的数据
   */
  show(data = {}) {
    super.show(data);
    
    // 更新任务列表
    this.updateQuestList();
    
    return this;
  }

  /**
   * 更新UI
   * @param {Object} data - 更新数据
   */
  update(data = {}) {
    super.update(data);
    
    // 如果UI可见，更新任务列表
    if (this.visible) {
      this.updateQuestList();
      
      // 如果有选中的任务，更新任务详情
      if (this.selectedQuest) {
        // 重新获取最新的任务数据
        const questSystem = this.scene.game.gameManager.questSystem;
        if (questSystem) {
          if (this.currentCategory === 'active') {
            const activeQuest = questSystem.getActiveQuest();
            if (activeQuest && activeQuest.id === this.selectedQuest.id) {
              this.selectedQuest = activeQuest;
            }
          } else if (this.currentCategory === 'completed') {
            const completedQuests = questSystem.getCompletedQuests();
            const updatedQuest = completedQuests.find(q => q.id === this.selectedQuest.id);
            if (updatedQuest) {
              this.selectedQuest = updatedQuest;
            }
          }
        }
        
        this.updateQuestDetails();
      }
    }
    
    return this;
  }
}

export default QuestUI;