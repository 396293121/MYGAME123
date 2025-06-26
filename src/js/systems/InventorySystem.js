/**
 * 库存系统
 * 管理玩家的物品库存，包括物品的添加、移除、使用、装备和排序等功能
 */

import Item from '../classes/Item.js';
import Equipment from '../classes/Equipment.js';
import ItemSystem from './ItemSystem.js';

class InventorySystem {
  /**
   * 构造函数
   * @param {number} capacity - 库存容量
   * @param {ItemSystem} itemSystem - 物品系统实例
   */
  constructor(capacity = 20, itemSystem = null) {
    this.capacity = capacity; // 库存容量
    this.items = []; // 物品列表
    this.gold = 0; // 金币
    this.itemSystem = itemSystem || new ItemSystem(); // 物品系统
    this.onInventoryChanged = null; // 库存变化回调
  }
  
  /**
   * 添加物品到库存
   * @param {Item} item - 要添加的物品
   * @param {number} quantity - 数量（对于可堆叠物品）
   * @returns {boolean} - 是否成功添加
   */
  addItem(item, quantity = 1) {
    if (!item) {
      return false;
    }
    
    // 如果物品可堆叠，尝试合并到现有堆叠
    if (item.stackable) {
      // 查找相同ID的物品
      const existingItem = this.items.find(i => i.id === item.id && i.quantity < i.maxStack);
      
      if (existingItem) {
        // 计算可以添加的数量
        const spaceLeft = existingItem.maxStack - existingItem.quantity;
        const amountToAdd = Math.min(quantity, spaceLeft);
        
        existingItem.quantity += amountToAdd;
        quantity -= amountToAdd;
        
        // 如果全部添加完毕，返回成功
        if (quantity <= 0) {
          this._triggerInventoryChanged();
          return true;
        }
      }
    }
    
    // 如果还有剩余数量或物品不可堆叠，创建新的物品实例
    while (quantity > 0 && this.items.length < this.capacity) {
      // 创建新的物品实例
      const newItem = this.itemSystem.createItem(item.id, Math.min(quantity, item.maxStack || 1));
      if (!newItem) {
        break;
      }
      
      // 添加到库存
      this.items.push(newItem);
      
      // 更新剩余数量
      quantity -= newItem.quantity;
    }
    
    this._triggerInventoryChanged();
    
    // 如果还有剩余数量，表示库存已满
    return quantity <= 0;
  }
  
  /**
   * 从库存中移除物品
   * @param {number} index - 物品在库存中的索引
   * @param {number} quantity - 要移除的数量（对于可堆叠物品）
   * @returns {Item|null} - 移除的物品，如果失败则返回null
   */
  removeItem(index, quantity = 1) {
    // 检查索引是否有效
    if (index < 0 || index >= this.items.length) {
      return null;
    }
    
    const item = this.items[index];
    
    // 如果物品可堆叠且数量大于1
    if (item.stackable && item.quantity > quantity) {
      item.quantity -= quantity;
      this._triggerInventoryChanged();
      
      // 创建一个新的物品实例返回
      return this.itemSystem.createItem(item.id, quantity);
    } else {
      // 移除整个物品
      const removedItem = this.items.splice(index, 1)[0];
      this._triggerInventoryChanged();
      return removedItem;
    }
  }
  
  /**
   * 使用物品
   * @param {number} index - 物品在库存中的索引
   * @param {Character} character - 使用物品的角色
   * @returns {boolean} - 是否成功使用
   */
  useItem(index, character) {
    // 检查索引是否有效
    if (index < 0 || index >= this.items.length) {
      return false;
    }
    
    const item = this.items[index];
    
    // 使用物品
    const result = this.itemSystem.useItem(item, character);
    
    // 如果使用成功且物品数量为0，从库存中移除
    if (result && item.stackable && item.quantity <= 0) {
      this.items.splice(index, 1);
    }
    
    this._triggerInventoryChanged();
    return result;
  }
  
  /**
   * 装备物品
   * @param {number} index - 物品在库存中的索引
   * @param {Character} character - 装备物品的角色
   * @returns {boolean} - 是否成功装备
   */
  equipItem(index, character) {
    // 检查索引是否有效
    if (index < 0 || index >= this.items.length) {
      return false;
    }
    
    const item = this.items[index];
    
    // 确保物品是装备
    if (!(item instanceof Equipment)) {
      return false;
    }
    
    // 装备物品
    const result = this.itemSystem.equipItem(item, character);
    
    // 如果装备成功，从库存中移除
    if (result) {
      this.items.splice(index, 1);
      this._triggerInventoryChanged();
    }
    
    return result;
  }
  
  /**
   * 卸下装备并添加到库存
   * @param {Equipment} equipment - 要卸下的装备
   * @param {Character} character - 装备的角色
   * @returns {boolean} - 是否成功卸下并添加到库存
   */
  unequipToInventory(equipment, character) {
    // 确保有足够的库存空间
    if (this.items.length >= this.capacity) {
      return false;
    }
    
    // 卸下装备
    const result = this.itemSystem.unequipItem(equipment, character);
    
    // 如果卸下成功，添加到库存
    if (result) {
      this.items.push(equipment);
      this._triggerInventoryChanged();
    }
    
    return result;
  }
  
  /**
   * 获取物品
   * @param {number} index - 物品在库存中的索引
   * @returns {Item|null} - 物品实例，如果索引无效则返回null
   */
  getItem(index) {
    if (index < 0 || index >= this.items.length) {
      return null;
    }
    
    return this.items[index];
  }
  
  /**
   * 查找物品
   * @param {string} itemId - 物品ID
   * @returns {Object|null} - 包含物品和索引的对象，如果未找到则返回null
   */
  findItem(itemId) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id === itemId) {
        return { item: this.items[i], index: i };
      }
    }
    
    return null;
  }
  
  /**
   * 检查是否有足够的物品
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 需要的数量
   * @returns {boolean} - 是否有足够的物品
   */
  hasItem(itemId, quantity = 1) {
    let totalQuantity = 0;
    
    for (const item of this.items) {
      if (item.id === itemId) {
        totalQuantity += item.stackable ? item.quantity : 1;
        
        if (totalQuantity >= quantity) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 消耗物品
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 需要消耗的数量
   * @returns {boolean} - 是否成功消耗
   */
  consumeItem(itemId, quantity = 1) {
    // 检查是否有足够的物品
    if (!this.hasItem(itemId, quantity)) {
      return false;
    }
    
    let remainingQuantity = quantity;
    
    // 从后往前遍历，以避免删除元素时索引变化的问题
    for (let i = this.items.length - 1; i >= 0 && remainingQuantity > 0; i--) {
      const item = this.items[i];
      
      if (item.id === itemId) {
        if (item.stackable && item.quantity > remainingQuantity) {
          // 减少堆叠数量
          item.quantity -= remainingQuantity;
          remainingQuantity = 0;
        } else {
          // 消耗整个物品
          const consumedQuantity = item.stackable ? item.quantity : 1;
          remainingQuantity -= consumedQuantity;
          this.items.splice(i, 1);
        }
      }
    }
    
    this._triggerInventoryChanged();
    return remainingQuantity <= 0;
  }
  
  /**
   * 添加金币
   * @param {number} amount - 金币数量
   */
  addGold(amount) {
    if (amount > 0) {
      this.gold += amount;
      this._triggerInventoryChanged();
    }
  }
  
  /**
   * 移除金币
   * @param {number} amount - 金币数量
   * @returns {boolean} - 是否成功移除
   */
  removeGold(amount) {
    if (amount > 0 && this.gold >= amount) {
      this.gold -= amount;
      this._triggerInventoryChanged();
      return true;
    }
    return false;
  }
  
  /**
   * 获取指定物品的总数量
   * @param {string} itemId - 物品ID
   * @returns {number} - 物品总数量
   */
  getItemCount(itemId) {
    let totalQuantity = 0;
    
    for (const item of this.items) {
      if (item.id === itemId) {
        totalQuantity += item.stackable ? item.quantity : 1;
      }
    }
    
    return totalQuantity;
  }
  
  /**
   * 检查是否有足够的金币
   * @param {number} amount - 金币数量
   * @returns {boolean} - 是否有足够的金币
   */
  hasGold(amount) {
    return this.gold >= amount;
  }
  
  /**
   * 获取库存中的空闲槽位数量
   * @returns {number} - 空闲槽位数量
   */
  getFreeSlots() {
    return this.capacity - this.items.length;
  }
  
  /**
   * 检查库存是否已满
   * @returns {boolean} - 库存是否已满
   */
  isFull() {
    return this.items.length >= this.capacity;
  }
  
  /**
   * 扩展库存容量
   * @param {number} additionalSlots - 要添加的槽位数量
   */
  expandCapacity(additionalSlots) {
    if (additionalSlots > 0) {
      this.capacity += additionalSlots;
      this._triggerInventoryChanged();
    }
  }
  
  /**
   * 按类型对物品进行排序
   */
  sortByType() {
    this.items.sort((a, b) => {
      // 首先按类型排序
      if (a.type !== b.type) {
        const typeOrder = {
          weapon: 1,
          armor: 2,
          accessory: 3,
          consumable: 4,
          material: 5,
          quest: 6
        };
        
        return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
      }
      
      // 然后按稀有度排序
      const rarityOrder = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5
      };
      
      if (a.rarity !== b.rarity) {
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      }
      
      // 最后按名称排序
      return a.name.localeCompare(b.name);
    });
    
    this._triggerInventoryChanged();
  }
  
  /**
   * 按稀有度对物品进行排序
   */
  sortByRarity() {
    this.items.sort((a, b) => {
      // 首先按稀有度排序
      const rarityOrder = {
        legendary: 1,
        epic: 2,
        rare: 3,
        uncommon: 4,
        common: 5
      };
      
      if (a.rarity !== b.rarity) {
        return (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99);
      }
      
      // 然后按类型排序
      const typeOrder = {
        weapon: 1,
        armor: 2,
        accessory: 3,
        consumable: 4,
        material: 5,
        quest: 6
      };
      
      if (a.type !== b.type) {
        return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
      }
      
      // 最后按名称排序
      return a.name.localeCompare(b.name);
    });
    
    this._triggerInventoryChanged();
  }
  
  /**
   * 按价值对物品进行排序
   */
  sortByValue() {
    this.items.sort((a, b) => {
      // 按价值排序（从高到低）
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      
      // 然后按名称排序
      return a.name.localeCompare(b.name);
    });
    
    this._triggerInventoryChanged();
  }
  
  /**
   * 获取库存的序列化数据（用于保存）
   * @returns {Object} - 序列化的库存数据
   */
  serialize() {
    return {
      capacity: this.capacity,
      gold: this.gold,
      items: this.items.map(item => {
        // 基本物品数据
        const itemData = {
          id: item.id,
          type: item.type
        };
        
        // 如果物品可堆叠，添加数量
        if (item.stackable) {
          itemData.quantity = item.quantity;
        }
        
        // 如果是装备，添加耐久度
        if (item instanceof Equipment) {
          itemData.durability = item.durability;
        }
        
        return itemData;
      })
    };
  }
  
  /**
   * 从序列化数据加载库存
   * @param {Object} data - 序列化的库存数据
   * @returns {boolean} - 是否成功加载
   */
  deserialize(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // 清空当前库存
    this.items = [];
    
    // 设置容量和金币
    this.capacity = data.capacity || this.capacity;
    this.gold = data.gold || 0;
    
    // 加载物品
    if (Array.isArray(data.items)) {
      data.items.forEach(itemData => {
        const item = this.itemSystem.createItem(itemData.id, itemData.quantity || 1);
        
        if (item) {
          // 如果是装备，设置耐久度
          if (item instanceof Equipment && itemData.durability !== undefined) {
            item.durability = itemData.durability;
          }
          
          this.items.push(item);
        }
      });
    }
    
    this._triggerInventoryChanged();
    return true;
  }
  
  /**
   * 触发库存变化回调
   * @private
   */
  _triggerInventoryChanged() {
    if (typeof this.onInventoryChanged === 'function') {
      this.onInventoryChanged(this);
    }
  }
}

export default InventorySystem;