/**
 * 物品栏UI组件
 * 显示和管理玩家的物品
 */

import UIComponent from './UIComponent.js';

class InventoryUI extends UIComponent {
  constructor(scene) {
    super(scene, 'modal');
    
    // 物品栏配置
    this.slotSize = 50; // 物品槽大小
    this.slotSpacing = 10; // 物品槽间距
    this.columns = 5; // 列数
    this.rows = 4; // 行数
    
    // UI元素
    this.inventoryPanel = null;
    this.slots = [];
    this.selectedSlot = null;
    this.itemInfoPanel = null;
    
    // 物品信息
    this.itemNameText = null;
    this.itemDescriptionText = null;
    this.itemStatsText = null;
    this.useButton = null;
    this.dropButton = null;
  }
  
  /**
   * 初始化组件
   */
  init() {
    super.init();
    
    // 创建物品栏面板
    this.createInventoryPanel();
    
    // 创建物品信息面板
    this.createItemInfoPanel();
  }
  
  /**
   * 创建物品栏面板
   */
  createInventoryPanel() {
    // 计算面板大小
    const panelWidth = this.columns * this.slotSize + (this.columns + 1) * this.slotSpacing;
    const panelHeight = this.rows * this.slotSize + (this.rows + 1) * this.slotSpacing + 60;
    
    // 创建面板
    this.inventoryPanel = this.createPanel(
      this.gameWidth / 2 - 150,
      this.gameHeight / 2,
      panelWidth,
      panelHeight
    );
    this.container.add(this.inventoryPanel);
    
    // 添加标题
    const title = this.scene.add.text(0, -panelHeight / 2 + 20, '物品栏', {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.inventoryPanel.add(title);
    
    // 创建物品槽
    this.createSlots();
    
    // 创建关闭按钮
    const closeButton = this.createButton(
      panelWidth / 2 - 15,
      -panelHeight / 2 + 15,
      'X',
      () => this.hide(),
      { fontSize: '14px', fill: '#ff0000' }
    );
    this.inventoryPanel.add(closeButton);
  }
  
  /**
   * 创建物品槽
   */
  createSlots() {
    // 计算起始位置
    const startX = -((this.columns * this.slotSize + (this.columns - 1) * this.slotSpacing) / 2);
    const startY = -this.inventoryPanel.list[0].height / 2 + 50;
    
    // 创建物品槽
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const x = startX + col * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
        const y = startY + row * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
        
        // 创建物品槽背景
        const slot = this.scene.add.rectangle(x, y, this.slotSize, this.slotSize, 0x333333);
        slot.setStrokeStyle(2, 0x666666);
        slot.setInteractive();
        slot.slotIndex = row * this.columns + col;
        
        // 添加点击事件
        slot.on('pointerdown', () => {
          this.selectSlot(slot);
        });
        
        // 添加悬停效果
        slot.on('pointerover', () => {
          slot.setStrokeStyle(2, 0xffffff);
        });
        
        slot.on('pointerout', () => {
          if (this.selectedSlot !== slot) {
            slot.setStrokeStyle(2, 0x666666);
          }
        });
        
        // 添加到面板
        this.inventoryPanel.add(slot);
        
        // 创建物品图标（初始为空）
        const icon = this.scene.add.sprite(x, y, 'items', 0);
        icon.setVisible(false);
        icon.setScale(0.8);
        this.inventoryPanel.add(icon);
        
        // 创建物品数量文本
        const countText = this.scene.add.text(x + 15, y + 15, '', {
          fontSize: '12px',
          fill: '#ffffff'
        }).setOrigin(1, 1);
        this.inventoryPanel.add(countText);
        
        // 保存槽位信息
        this.slots.push({
          background: slot,
          icon: icon,
          countText: countText,
          item: null
        });
      }
    }
  }
  
  /**
   * 创建物品信息面板
   */
  createItemInfoPanel() {
    // 面板大小和位置
    const panelWidth = 300;
    const panelHeight = 250;
    const panelX = this.gameWidth / 2 + 150;
    const panelY = this.gameHeight / 2;
    
    // 创建面板
    this.itemInfoPanel = this.createPanel(
      panelX,
      panelY,
      panelWidth,
      panelHeight
    );
    this.container.add(this.itemInfoPanel);
    
    // 添加标题
    const title = this.scene.add.text(0, -panelHeight / 2 + 20, '物品信息', {
      fontSize: '18px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.itemInfoPanel.add(title);
    
    // 物品名称
    this.itemNameText = this.scene.add.text(0, -panelHeight / 2 + 50, '', {
      fontSize: '16px',
      fill: '#ffcc00',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.itemInfoPanel.add(this.itemNameText);
    
    // 物品描述
    this.itemDescriptionText = this.scene.add.text(0, -panelHeight / 2 + 80, '', {
      fontSize: '14px',
      fill: '#cccccc',
      wordWrap: { width: panelWidth - 40 },
      align: 'center'
    }).setOrigin(0.5, 0);
    this.itemInfoPanel.add(this.itemDescriptionText);
    
    // 物品属性
    this.itemStatsText = this.scene.add.text(0, -panelHeight / 2 + 140, '', {
      fontSize: '14px',
      fill: '#ffffff',
      wordWrap: { width: panelWidth - 40 },
      align: 'center'
    }).setOrigin(0.5, 0);
    this.itemInfoPanel.add(this.itemStatsText);
    
    // 使用按钮
    this.useButton = this.createButton(
      -60,
      panelHeight / 2 - 30,
      '使用',
      () => this.useSelectedItem(),
      { fontSize: '14px', fill: '#ffffff' }
    );
    this.useButton.setVisible(false);
    this.itemInfoPanel.add(this.useButton);
    
    // 丢弃按钮
    this.dropButton = this.createButton(
      60,
      panelHeight / 2 - 30,
      '丢弃',
      () => this.dropSelectedItem(),
      { fontSize: '14px', fill: '#ffffff' }
    );
    this.dropButton.setVisible(false);
    this.itemInfoPanel.add(this.dropButton);
  }
  
  /**
   * 选择物品槽
   * @param {Phaser.GameObjects.Rectangle} slot - 物品槽对象
   */
  selectSlot(slot) {
    // 重置之前选择的槽位
    if (this.selectedSlot) {
      this.selectedSlot.setStrokeStyle(2, 0x666666);
    }
    
    // 设置新选择的槽位
    this.selectedSlot = slot;
    slot.setStrokeStyle(2, 0xffcc00);
    
    // 获取槽位中的物品
    const slotData = this.slots[slot.slotIndex];
    const item = slotData.item;
    
    // 更新物品信息面板
    this.updateItemInfo(item);
  }
  
  /**
   * 更新物品信息面板
   * @param {Object} item - 物品数据
   */
  updateItemInfo(item) {
    if (!item) {
      // 没有物品，清空信息面板
      this.itemNameText.setText('');
      this.itemDescriptionText.setText('选择一个物品查看详细信息');
      this.itemStatsText.setText('');
      this.useButton.setVisible(false);
      this.dropButton.setVisible(false);
      return;
    }
    
    // 更新物品信息
    this.itemNameText.setText(item.name);
    this.itemDescriptionText.setText(item.description || '无描述');
    
    // 更新物品属性
    let statsText = '';
    if (item.type === 'weapon') {
      statsText += `攻击力: +${item.attack || 0}\n`;
    } else if (item.type === 'armor') {
      statsText += `防御力: +${item.defense || 0}\n`;
    } else if (item.type === 'potion') {
      if (item.healthRestore) statsText += `恢复生命: +${item.healthRestore}\n`;
      if (item.manaRestore) statsText += `恢复魔法: +${item.manaRestore}\n`;
    }
    
    if (item.effects) {
      item.effects.forEach(effect => {
        statsText += `${effect.description}\n`;
      });
    }
    
    this.itemStatsText.setText(statsText);
    
    // 显示按钮
    this.useButton.setVisible(item.usable !== false);
    this.dropButton.setVisible(true);
  }
  
  /**
   * 使用选中的物品
   */
  useSelectedItem() {
    if (!this.selectedSlot) return;
    
    const slotIndex = this.selectedSlot.slotIndex;
    const slotData = this.slots[slotIndex];
    const item = slotData.item;
    
    if (!item || item.usable === false) return;
    
    // 调用物品系统使用物品
    if (this.scene.game.gameManager && this.scene.game.gameManager.inventorySystem) {
      const used = this.scene.game.gameManager.inventorySystem.useItem(slotIndex);
      
      if (used) {
        // 更新物品栏
        this.updateInventory();
      }
    }
  }
  
  /**
   * 丢弃选中的物品
   */
  dropSelectedItem() {
    if (!this.selectedSlot) return;
    
    const slotIndex = this.selectedSlot.slotIndex;
    
    // 调用物品系统丢弃物品
    if (this.scene.game.gameManager && this.scene.game.gameManager.inventorySystem) {
      const dropped = this.scene.game.gameManager.inventorySystem.dropItem(slotIndex);
      
      if (dropped) {
        // 更新物品栏
        this.updateInventory();
      }
    }
  }
  
  /**
   * 更新物品栏
   */
  updateInventory() {
    // 获取物品系统
    const inventorySystem = this.scene.game.gameManager?.inventorySystem;
    if (!inventorySystem) return;
    
    // 获取物品列表
    const items = inventorySystem.getItems();
    
    // 更新每个槽位
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const item = items[i];
      
      if (item) {
        // 有物品，显示图标和数量
        slot.item = item;
        slot.icon.setTexture('items', item.frameIndex || 0);
        slot.icon.setVisible(true);
        
        // 显示数量（如果大于1）
        if (item.count > 1) {
          slot.countText.setText(item.count);
        } else {
          slot.countText.setText('');
        }
      } else {
        // 没有物品，隐藏图标和数量
        slot.item = null;
        slot.icon.setVisible(false);
        slot.countText.setText('');
      }
    }
    
    // 如果有选中的槽位，更新物品信息
    if (this.selectedSlot) {
      const slotData = this.slots[this.selectedSlot.slotIndex];
      this.updateItemInfo(slotData.item);
    }
  }
  
  /**
   * 显示组件
   */
  onShow() {
    // 更新物品栏
    this.updateInventory();
    
    // 重置选中的槽位
    this.selectedSlot = null;
    this.updateItemInfo(null);
    
    // 添加背景遮罩
    this.addBackgroundMask();
  }
  
  /**
   * 添加背景遮罩
   */
  addBackgroundMask() {
    // 创建半透明背景遮罩
    if (!this.backgroundMask) {
      this.backgroundMask = this.scene.add.rectangle(
        this.gameWidth / 2,
        this.gameHeight / 2,
        this.gameWidth,
        this.gameHeight,
        0x000000,
        0.5
      );
      this.backgroundMask.setInteractive();
      this.backgroundMask.on('pointerdown', () => {
        // 点击背景关闭物品栏
        this.hide();
      });
      this.container.add(this.backgroundMask);
      
      // 确保背景在最底层
      this.backgroundMask.setDepth(-1);
    } else {
      this.backgroundMask.setVisible(true);
    }
  }
  
  /**
   * 隐藏组件
   */
  onHide() {
    // 隐藏背景遮罩
    if (this.backgroundMask) {
      this.backgroundMask.setVisible(false);
    }
  }
}

export default InventoryUI;