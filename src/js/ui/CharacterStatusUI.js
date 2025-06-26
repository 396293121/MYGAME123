/**
 * 角色状态界面UI
 * 显示角色的属性、等级、经验值和装备等信息
 */

import BaseUI from './BaseUI.js';

class CharacterStatusUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'overlay');
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
    
    // 创建角色信息区域
    this.createCharacterInfo();
    
    // 创建属性区域
    this.createAttributesPanel();
    
    // 创建装备区域
    this.createEquipmentPanel();
    
    // 创建关闭按钮
    this.createCloseButton();
    
    return this;
  }

  /**
   * 创建标题
   */
  createTitle() {
    // 添加角色状态标题
    const title = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.height * 0.1,
      '角色状态',
      {
        fontSize: '32px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5);
    
    this.addElement('title', title);
  }

  /**
   * 创建角色信息区域
   */
  createCharacterInfo() {
    const centerX = this.scene.cameras.main.centerX;
    const startY = this.scene.cameras.main.height * 0.2;
    const player = this.scene.player;
    
    if (!player) return;
    
    // 创建角色头像背景
    const portraitBg = this.scene.add.rectangle(
      centerX - 200,
      startY + 50,
      100,
      100,
      0x333333
    );
    portraitBg.setStrokeStyle(2, 0xffffff);
    this.addElement('portraitBg', portraitBg);
    
    // 创建角色头像（使用玩家精灵的纹理）
    const portrait = this.scene.add.sprite(
      centerX - 200,
      startY + 50,
      player.texture.key
    );
    portrait.setScale(2);
    portrait.setFrame(0); // 使用站立帧作为头像
    this.addElement('portrait', portrait);
    
    // 创建职业文本
    const classText = this.scene.add.text(
      centerX - 200,
      startY + 110,
      player.playerClass || '战士',
      {
        fontSize: '18px',
        fill: '#ffffff'
      }
    );
    classText.setOrigin(0.5);
    this.addElement('classText', classText);
    
    // 创建等级文本
    const levelText = this.scene.add.text(
      centerX - 200,
      startY + 140,
      `等级: ${player.level || 1}`,
      {
        fontSize: '18px',
        fill: '#ffffff'
      }
    );
    levelText.setOrigin(0.5);
    this.addElement('levelText', levelText);
    
    // 创建经验条背景
    const expBarBg = this.scene.add.rectangle(
      centerX,
      startY + 170,
      300,
      20,
      0x333333
    );
    expBarBg.setOrigin(0.5);
    this.addElement('expBarBg', expBarBg);
    
    // 计算经验值百分比
    const expPercent = player.exp ? 
      (player.exp / player.expToNextLevel) : 0;
    
    // 创建经验条
    const expBar = this.scene.add.rectangle(
      centerX - 150 + (300 * expPercent / 2),
      startY + 170,
      300 * expPercent,
      20,
      0x00ff00
    );
    expBar.setOrigin(0, 0.5);
    this.addElement('expBar', expBar);
    
    // 创建经验值文本
    const expText = this.scene.add.text(
      centerX,
      startY + 170,
      `${player.exp || 0}/${player.expToNextLevel || 100}`,
      {
        fontSize: '14px',
        fill: '#ffffff'
      }
    );
    expText.setOrigin(0.5);
    this.addElement('expText', expText);
  }

  /**
   * 创建属性区域
   */
  createAttributesPanel() {
    const startX = this.scene.cameras.main.centerX - 200;
    const startY = this.scene.cameras.main.height * 0.35;
    const player = this.scene.player;
    
    if (!player) return;
    
    // 创建属性面板背景
    const attrPanelBg = this.scene.add.rectangle(
      startX + 100,
      startY + 100,
      200,
      200,
      0x222222,
      0.8
    );
    attrPanelBg.setStrokeStyle(2, 0xffffff);
    this.addElement('attrPanelBg', attrPanelBg);
    
    // 创建属性面板标题
    const attrTitle = this.scene.add.text(
      startX + 100,
      startY + 20,
      '角色属性',
      {
        fontSize: '20px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    attrTitle.setOrigin(0.5);
    this.addElement('attrTitle', attrTitle);
    
    // 属性列表
    const attributes = [
      { name: '力量', value: player.strength || 10 },
      { name: '敏捷', value: player.agility || 10 },
      { name: '智力', value: player.intelligence || 10 },
      { name: '体质', value: player.constitution || 10 },
      { name: '攻击力', value: player.attackPower || 5 },
      { name: '防御力', value: player.defense || 3 },
      { name: '暴击率', value: `${(player.critChance || 0.05) * 100}%` },
      { name: '暴击伤害', value: `${(player.critDamage || 1.5).toFixed(1)}x` }
    ];
    
    // 创建属性文本
    attributes.forEach((attr, index) => {
      const attrText = this.scene.add.text(
        startX + 20,
        startY + 50 + (index * 25),
        `${attr.name}: ${attr.value}`,
        {
          fontSize: '16px',
          fill: '#ffffff'
        }
      );
      this.addElement(`attr_${attr.name}`, attrText);
    });
  }

  /**
   * 创建装备区域
   */
  createEquipmentPanel() {
    const startX = this.scene.cameras.main.centerX + 50;
    const startY = this.scene.cameras.main.height * 0.35;
    const player = this.scene.player;
    
    if (!player) return;
    
    // 创建装备面板背景
    const equipPanelBg = this.scene.add.rectangle(
      startX + 150,
      startY + 100,
      300,
      200,
      0x222222,
      0.8
    );
    equipPanelBg.setStrokeStyle(2, 0xffffff);
    this.addElement('equipPanelBg', equipPanelBg);
    
    // 创建装备面板标题
    const equipTitle = this.scene.add.text(
      startX + 150,
      startY + 20,
      '装备',
      {
        fontSize: '20px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    equipTitle.setOrigin(0.5);
    this.addElement('equipTitle', equipTitle);
    
    // 装备槽位
    const equipSlots = [
      { name: '武器', key: 'weapon' },
      { name: '头盔', key: 'helmet' },
      { name: '胸甲', key: 'armor' },
      { name: '护腿', key: 'legs' },
      { name: '靴子', key: 'boots' },
      { name: '饰品', key: 'accessory' }
    ];
    
    // 创建装备槽位
    equipSlots.forEach((slot, index) => {
      // 创建槽位背景
      const slotBg = this.scene.add.rectangle(
        startX + 70,
        startY + 60 + (index * 40),
        40,
        40,
        0x333333
      );
      slotBg.setStrokeStyle(1, 0xffffff);
      this.addElement(`slot_${slot.key}_bg`, slotBg);
      
      // 创建槽位名称
      const slotName = this.scene.add.text(
        startX + 100,
        startY + 60 + (index * 40),
        slot.name,
        {
          fontSize: '16px',
          fill: '#ffffff'
        }
      );
      slotName.setOrigin(0, 0.5);
      this.addElement(`slot_${slot.key}_name`, slotName);
      
      // 获取装备信息
      const equippedItem = player.equipment && player.equipment[slot.key];
      
      // 如果有装备，显示装备图标和名称
      if (equippedItem) {
        // 创建装备图标
        const itemIcon = this.scene.add.sprite(
          startX + 70,
          startY + 60 + (index * 40),
          'items',
          equippedItem.frame || 0
        );
        itemIcon.setScale(0.8);
        this.addElement(`slot_${slot.key}_icon`, itemIcon);
        
        // 创建装备名称
        const itemName = this.scene.add.text(
          startX + 150,
          startY + 60 + (index * 40),
          equippedItem.name || '未知装备',
          {
            fontSize: '14px',
            fill: this.getItemRarityColor(equippedItem.rarity || 'common')
          }
        );
        itemName.setOrigin(0, 0.5);
        this.addElement(`slot_${slot.key}_item`, itemName);
      } else {
        // 如果没有装备，显示空槽位文本
        const emptyText = this.scene.add.text(
          startX + 150,
          startY + 60 + (index * 40),
          '- 空 -',
          {
            fontSize: '14px',
            fill: '#888888'
          }
        );
        emptyText.setOrigin(0, 0.5);
        this.addElement(`slot_${slot.key}_empty`, emptyText);
      }
    });
  }

  /**
   * 根据物品稀有度获取颜色
   * @param {string} rarity - 物品稀有度
   * @returns {string} 颜色代码
   */
  getItemRarityColor(rarity) {
    const rarityColors = {
      common: '#FFFFFF',    // 白色
      uncommon: '#00FF00',  // 绿色
      rare: '#0070DD',      // 蓝色
      epic: '#A335EE',      // 紫色
      legendary: '#FF8000'  // 橙色
    };
    
    return rarityColors[rarity] || rarityColors.common;
  }

  /**
   * 创建关闭按钮
   */
  createCloseButton() {
    // 创建关闭按钮
    const closeButton = this.scene.add.text(
      this.scene.cameras.main.width * 0.9,
      this.scene.cameras.main.height * 0.1,
      'X',
      {
        fontSize: '32px',
        fill: '#ffffff'
      }
    );
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });
    
    // 添加鼠标悬停效果
    closeButton.on('pointerover', () => {
      closeButton.setStyle({ fill: '#ff0000' });
    });
    
    closeButton.on('pointerout', () => {
      closeButton.setStyle({ fill: '#ffffff' });
    });
    
    // 添加点击事件
    closeButton.on('pointerdown', () => {
      this.hide();
    });
    
    this.addElement('closeButton', closeButton);
  }

  /**
   * 更新UI
   */
  update() {
    super.update();
    
    // 如果UI不可见，不需要更新
    if (!this.visible) return;
    
    const player = this.scene.player;
    if (!player) return;
    
    // 更新等级文本
    const levelText = this.getElement('levelText');
    if (levelText) {
      levelText.setText(`等级: ${player.level || 1}`);
    }
    
    // 更新经验条
    const expBar = this.getElement('expBar');
    const expText = this.getElement('expText');
    if (expBar && expText) {
      const expPercent = player.exp ? 
        (player.exp / player.expToNextLevel) : 0;
      
      expBar.width = 300 * expPercent;
      expBar.x = this.scene.cameras.main.centerX - 150 + (300 * expPercent / 2);
      expText.setText(`${player.exp || 0}/${player.expToNextLevel || 100}`);
    }
    
    // 更新属性文本
    const attributes = [
      { name: '力量', value: player.strength || 10 },
      { name: '敏捷', value: player.agility || 10 },
      { name: '智力', value: player.intelligence || 10 },
      { name: '体质', value: player.constitution || 10 },
      { name: '攻击力', value: player.attackPower || 5 },
      { name: '防御力', value: player.defense || 3 },
      { name: '暴击率', value: `${(player.critChance || 0.05) * 100}%` },
      { name: '暴击伤害', value: `${(player.critDamage || 1.5).toFixed(1)}x` }
    ];
    
    attributes.forEach(attr => {
      const attrText = this.getElement(`attr_${attr.name}`);
      if (attrText) {
        attrText.setText(`${attr.name}: ${attr.value}`);
      }
    });
  }
}

export default CharacterStatusUI;