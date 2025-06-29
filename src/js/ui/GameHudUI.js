/**
 * 游戏HUD UI
 * 显示游戏中的HUD界面，包括生命条、魔法条、经验条、等级文本、职业文本和技能图标等
 */

import BaseUI from './BaseUI.js';

class GameHudUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'hud');
    
    // HUD配置
    this.config = {
      barWidth: 200,
      barHeight: 20,
      barSpacing: 10,
      barPadding: 2,
      skillIconSize: 40,
      skillIconSpacing: 10
    };
  }

  /**
   * 初始化UI
   */
  init() {
    super.init();
    
    // 创建状态条（生命、魔法、经验）
    this.createStatusBars();
    
    // 创建状态文本（等级、职业）
    this.createStatusTexts();
    
    // 创建技能图标 暂注释
   // this.createSkillIcons();
    
    // 创建资源显示（金币、精血）
    this.createResourceDisplay();
    
    // 创建任务追踪器
    this.createQuestTracker();
    
    return this;
  }

  /**
   * 创建状态条
   */
  createStatusBars() {
    const { barWidth, barHeight, barSpacing, barPadding } = this.config;
    const startX = 20;
    const startY = 20;
    
    // 创建生命条背景
    const healthBarBg = this.scene.add.rectangle(
      startX,
      startY,
      barWidth,
      barHeight,
      0x000000,
      0.7
    );
    healthBarBg.setOrigin(0, 0);
    healthBarBg.setStrokeStyle(1, 0xffffff);
    
    // 创建生命条
    const healthBar = this.scene.add.rectangle(
      startX + barPadding,
      startY + barPadding,
      barWidth - barPadding * 2,
      barHeight - barPadding * 2,
      0xff0000
    );
    healthBar.setOrigin(0, 0);
    
    // 创建魔法条背景
    const manaBarBg = this.scene.add.rectangle(
      startX,
      startY + barHeight + barSpacing,
      barWidth,
      barHeight,
      0x000000,
      0.7
    );
    manaBarBg.setOrigin(0, 0);
    manaBarBg.setStrokeStyle(1, 0xffffff);
    
    // 创建魔法条
    const manaBar = this.scene.add.rectangle(
      startX + barPadding,
      startY + barHeight + barSpacing + barPadding,
      barWidth - barPadding * 2,
      barHeight - barPadding * 2,
      0x0000ff
    );
    manaBar.setOrigin(0, 0);
    
    // 创建经验条背景
    const expBarBg = this.scene.add.rectangle(
      startX,
      startY + (barHeight + barSpacing) * 2,
      barWidth,
      barHeight / 2,
      0x000000,
      0.7
    );
    expBarBg.setOrigin(0, 0);
    expBarBg.setStrokeStyle(1, 0xffffff);
    
    // 创建经验条
    const expBar = this.scene.add.rectangle(
      startX + barPadding,
      startY + (barHeight + barSpacing) * 2 + barPadding,
      barWidth - barPadding * 2,
      barHeight / 2 - barPadding * 2,
      0xffff00
    );
    expBar.setOrigin(0, 0);
    
    // 添加到容器
    this.addElement('healthBarBg', healthBarBg);
    this.addElement('healthBar', healthBar);
    this.addElement('manaBarBg', manaBarBg);
    this.addElement('manaBar', manaBar);
    this.addElement('expBarBg', expBarBg);
    this.addElement('expBar', expBar);
    
    // 添加状态条标签
    const healthText = this.scene.add.text(
      startX + barWidth + 10,
      startY + barHeight / 2,
      'HP: 100/100',
      { fontSize: '14px', fill: '#ffffff' }
    );
    healthText.setOrigin(0, 0.5);
    
    const manaText = this.scene.add.text(
      startX + barWidth + 10,
      startY + barHeight + barSpacing + barHeight / 2,
      'MP: 100/100',
      { fontSize: '14px', fill: '#ffffff' }
    );
    manaText.setOrigin(0, 0.5);
    
    const expText = this.scene.add.text(
      startX + barWidth + 10,
      startY + (barHeight + barSpacing) * 2 + barHeight / 4,
      'EXP: 0/100',
      { fontSize: '12px', fill: '#ffffff' }
    );
    expText.setOrigin(0, 0.5);
    
    this.addElement('healthText', healthText);
    this.addElement('manaText', manaText);
    this.addElement('expText', expText);
  }

  /**
   * 创建状态文本
   */
  createStatusTexts() {
    const startX = 20;
    const startY = 20 + (this.config.barHeight + this.config.barSpacing) * 2 + this.config.barHeight / 2 + 20;
    
    // 创建等级文本
    const levelText = this.scene.add.text(
      startX,
      startY,
      'LV: 1',
      { fontSize: '16px', fill: '#ffffff' }
    );
    levelText.setOrigin(0, 0);
    
    // 创建职业文本
    const classText = this.scene.add.text(
      startX + 80,
      startY,
      '职业: 战士',
      { fontSize: '16px', fill: '#ffffff' }
    );
    classText.setOrigin(0, 0);
    
    this.addElement('levelText', levelText);
    this.addElement('classText', classText);
  }

  /**
   * 创建技能图标
   */
  createSkillIcons() {
    const { skillIconSize, skillIconSpacing } = this.config;
    const startX = 20;
    const startY = this.scene.cameras.main.height - skillIconSize - 20;
    
    // 创建技能图标背景
    for (let i = 0; i < 4; i++) {
      const skillBg = this.scene.add.rectangle(
        startX + (skillIconSize + skillIconSpacing) * i,
        startY,
        skillIconSize,
        skillIconSize,
        0x000000,
        0.7
      );
      skillBg.setOrigin(0, 0);
      skillBg.setStrokeStyle(1, 0xffffff);
      
      this.addElement(`skillBg${i}`, skillBg);
      
      // 创建技能图标
      const skillIcon = this.scene.add.sprite(
        startX + (skillIconSize + skillIconSpacing) * i + skillIconSize / 2,
        startY + skillIconSize / 2,
        'skill_effects',
        i
      );
      skillIcon.setScale(0.6);
      
      this.addElement(`skillIcon${i}`, skillIcon);
      
      // 创建技能快捷键文本
      const keyText = this.scene.add.text(
        startX + (skillIconSize + skillIconSpacing) * i + 5,
        startY + 5,
        ['Q', 'W', 'E', 'R'][i],
        { fontSize: '12px', fill: '#ffffff' }
      );
      
      this.addElement(`keyText${i}`, keyText);
      
      // 创建冷却遮罩（初始隐藏）
      const cooldownMask = this.scene.add.rectangle(
        startX + (skillIconSize + skillIconSpacing) * i,
        startY,
        skillIconSize,
        skillIconSize,
        0x000000,
        0.7
      );
      cooldownMask.setOrigin(0, 0);
      cooldownMask.setVisible(false);
      
      this.addElement(`cooldownMask${i}`, cooldownMask);
      
      // 创建冷却文本（初始隐藏）
      const cooldownText = this.scene.add.text(
        startX + (skillIconSize + skillIconSpacing) * i + skillIconSize / 2,
        startY + skillIconSize / 2,
        '',
        { fontSize: '16px', fill: '#ffffff' }
      );
      cooldownText.setOrigin(0.5);
      cooldownText.setVisible(false);
      
      this.addElement(`cooldownText${i}`, cooldownText);
    }
  }

  /**
   * 创建资源显示
   */
  createResourceDisplay() {
    const startX = this.scene.cameras.main.width - 150;
    const startY = 20;
    
    // 创建金币图标
    const coinIcon = this.scene.add.sprite(startX, startY, 'items', 10);
    coinIcon.setOrigin(0, 0.5);
    
    // 创建金币文本
    const coinText = this.scene.add.text(
      startX + 30,
      startY,
      '0',
      { fontSize: '16px', fill: '#ffff00' }
    );
    coinText.setOrigin(0, 0.5);
    
    // 创建精血图标
    const bloodIcon = this.scene.add.sprite(startX, startY + 30, 'items', 20);
    bloodIcon.setOrigin(0, 0.5);
    
    // 创建精血文本
    const bloodText = this.scene.add.text(
      startX + 30,
      startY + 30,
      '0',
      { fontSize: '16px', fill: '#ff0000' }
    );
    bloodText.setOrigin(0, 0.5);
    
    this.addElement('coinIcon', coinIcon);
    this.addElement('coinText', coinText);
    this.addElement('bloodIcon', bloodIcon);
    this.addElement('bloodText', bloodText);
  }

  /**
   * 创建任务追踪器
   */
  createQuestTracker() {
    const startX = this.scene.cameras.main.width - 250;
    const startY = 80;
    
    // 创建任务追踪器背景
    const questBg = this.scene.add.rectangle(
      startX,
      startY,
      230,
      100,
      0x000000,
      0.5
    );
    questBg.setOrigin(0, 0);
    questBg.setStrokeStyle(1, 0xffffff);
    
    // 创建任务标题
    const questTitle = this.scene.add.text(
      startX + 10,
      startY + 10,
      '当前任务',
      { fontSize: '16px', fill: '#ffff00' }
    );
    questTitle.setOrigin(0, 0);
    
    // 创建任务描述
    const questDesc = this.scene.add.text(
      startX + 10,
      startY + 35,
      '无任务',
      { fontSize: '14px', fill: '#ffffff', wordWrap: { width: 210 } }
    );
    questDesc.setOrigin(0, 0);
    
    // 创建任务目标
    const questObjective = this.scene.add.text(
      startX + 10,
      startY + 70,
      '',
      { fontSize: '12px', fill: '#aaaaaa' }
    );
    questObjective.setOrigin(0, 0);
    
    this.addElement('questBg', questBg);
    this.addElement('questTitle', questTitle);
    this.addElement('questDesc', questDesc);
    this.addElement('questObjective', questObjective);
  }

  /**
   * 更新UI
   * @param {Object} data - 更新数据
   */
  update(data = {}) {
    super.update(data);
    
    const { player, gameState } = data;
    
    if (player) {
      // 更新生命条
      this.updateHealthBar(player);
      
      // 更新魔法条
      this.updateManaBar(player);
      
      // 更新经验条
      this.updateExpBar(player);
      
      // 更新等级和职业文本
      this.updateStatusTexts(player);
    }
    
    if (gameState) {
      // 更新资源显示
      this.updateResourceDisplay(gameState);
      
      // 更新任务追踪器
      this.updateQuestTracker(gameState);
      
      // 更新技能冷却
      this.updateSkillCooldowns(gameState);
    }
  }

  /**
   * 更新生命条
   * @param {Player} player - 玩家对象
   */
  updateHealthBar(player) {
    const healthBar = this.getElement('healthBar');
    const healthText = this.getElement('healthText');
    const { barWidth, barPadding } = this.config;
    
    if (healthBar && healthText && player.stats) {
      const { health, maxHealth } = player.stats;
      const healthPercent = Math.max(0, Math.min(health / maxHealth, 1));
      
      healthBar.width = (barWidth - barPadding * 2) * healthPercent;
      healthText.setText(`HP: ${Math.floor(health)}/${Math.floor(maxHealth)}`);
    }
  }

  /**
   * 更新魔法条
   * @param {Player} player - 玩家对象
   */
  updateManaBar(player) {
    const manaBar = this.getElement('manaBar');
    const manaText = this.getElement('manaText');
    const { barWidth, barPadding } = this.config;
    
    if (manaBar && manaText && player.stats) {
      const { mana, maxMana } = player.stats;
      const manaPercent = Math.max(0, Math.min(mana / maxMana, 1));
      
      manaBar.width = (barWidth - barPadding * 2) * manaPercent;
      manaText.setText(`MP: ${Math.floor(mana)}/${Math.floor(maxMana)}`);
    }
  }

  /**
   * 更新经验条
   * @param {Player} player - 玩家对象
   */
  updateExpBar(player) {
    const expBar = this.getElement('expBar');
    const expText = this.getElement('expText');
    const { barWidth, barPadding } = this.config;
    
    if (expBar && expText) {
      const { experience, experienceToNextLevel } = player;
      const expPercent = Math.max(0, Math.min(experience / experienceToNextLevel, 1));
      
      expBar.width = (barWidth - barPadding * 2) * expPercent;
      expText.setText(`EXP: ${Math.floor(experience)}/${Math.floor(experienceToNextLevel)}`);
    }
  }

  /**
   * 更新状态文本
   * @param {Player} player - 玩家对象
   */
  updateStatusTexts(player) {
    const levelText = this.getElement('levelText');
    const classText = this.getElement('classText');
    
    if (levelText) {
      levelText.setText(`LV: ${player.level}`);
    }
    
    if (classText) {
      let className = '未知';
      
      if (player.constructor.name === 'Warrior') {
        className = '战士';
      } else if (player.constructor.name === 'Mage') {
        className = '法师';
      } else if (player.constructor.name === 'Archer') {
        className = '射手';
      }
      
      classText.setText(`职业: ${className}`);
    }
  }

  /**
   * 更新资源显示
   * @param {Object} gameState - 游戏状态
   */
  updateResourceDisplay(gameState) {
    const coinText = this.getElement('coinText');
    const bloodText = this.getElement('bloodText');
    
    if (coinText && gameState.resources) {
      coinText.setText(gameState.resources.gold.toString());
    }
    
    if (bloodText && gameState.resources) {
      bloodText.setText(gameState.resources.bloodEssence.toString());
    }
  }

  /**
   * 更新任务追踪器
   * @param {Object} gameState - 游戏状态
   */
  updateQuestTracker(gameState) {
    const questDesc = this.getElement('questDesc');
    const questObjective = this.getElement('questObjective');
    
    if (questDesc && questObjective && gameState.activeQuest) {
      const quest = gameState.activeQuest;
      
      questDesc.setText(quest.title);
      
      if (quest.objectives && quest.objectives.length > 0) {
        const objective = quest.objectives[0];
        questObjective.setText(`${objective.description}: ${objective.current}/${objective.target}`);
      } else {
        questObjective.setText('');
      }
    } else if (questDesc) {
      questDesc.setText('无任务');
      if (questObjective) questObjective.setText('');
    }
  }

  /**
   * 更新技能冷却
   * @param {Object} gameState - 游戏状态
   */
  updateSkillCooldowns(gameState) {
    if (!gameState.skillCooldowns) return;
    
    const skillIds = ['heavy_slash', 'shield_bash', 'battle_cry', 'whirlwind'];
    
    for (let i = 0; i < 4; i++) {
      const cooldownMask = this.getElement(`cooldownMask${i}`);
      const cooldownText = this.getElement(`cooldownText${i}`);
      
      if (cooldownMask && cooldownText) {
        const skillId = skillIds[i];
        const cooldown = gameState.skillCooldowns[skillId];
        
        if (cooldown && cooldown > 0) {
          cooldownMask.setVisible(true);
          cooldownText.setVisible(true);
          cooldownText.setText(Math.ceil(cooldown).toString());
        } else {
          cooldownMask.setVisible(false);
          cooldownText.setVisible(false);
        }
      }
    }
  }
}

export default GameHudUI;