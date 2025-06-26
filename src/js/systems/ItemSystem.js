/**
 * 物品系统
 * 管理游戏中的物品，包括物品的创建、使用、装备和管理
 */

import Item from '../classes/Item.js';
import Equipment from '../classes/Equipment.js';
import ItemData from '../data/ItemData.js';
import EquipmentData from '../data/EquipmentData.js';

class ItemSystem {
  constructor() {
    // 初始化物品数据
    this.itemData = ItemData;
    this.equipmentData = EquipmentData;
    
    // 物品类型映射
    this.itemTypes = {
      consumable: Item,
      material: Item,
      quest: Item,
      weapon: Equipment,
      armor: Equipment,
      accessory: Equipment
    };
  }
  
  /**
   * 创建物品实例
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量（对于可堆叠物品）
   * @returns {Item|Equipment|null} - 创建的物品实例
   */
  createItem(itemId, quantity = 1) {
    // 查找物品数据
    let itemData = this.findItemData(itemId);
    
    if (!itemData) {
      console.error(`物品数据未找到: ${itemId}`);
      return null;
    }
    
    // 根据物品类型创建相应的实例
    const ItemClass = this.getItemClass(itemData.type);
    if (!ItemClass) {
      console.error(`未知的物品类型: ${itemData.type}`);
      return null;
    }
    
    // 创建物品实例
    const item = new ItemClass(itemData);
    
    // 设置数量（如果物品可堆叠）
    if (item.stackable && quantity > 1) {
      item.quantity = Math.min(quantity, item.maxStack);
    }
    
    return item;
  }
  
  /**
   * 查找物品数据
   * @param {string} itemId - 物品ID
   * @returns {Object|null} - 物品数据
   */
  findItemData(itemId) {
    // 在消耗品中查找
    if (this.itemData.consumables[itemId]) {
      return this.itemData.consumables[itemId];
    }
    
    // 在材料中查找
    if (this.itemData.materials[itemId]) {
      return this.itemData.materials[itemId];
    }
    
    // 在任务物品中查找
    if (this.itemData.questItems[itemId]) {
      return this.itemData.questItems[itemId];
    }
    
    // 在武器中查找
    if (this.equipmentData.weapons[itemId]) {
      return this.equipmentData.weapons[itemId];
    }
    
    // 在防具中查找
    if (this.equipmentData.armors[itemId]) {
      return this.equipmentData.armors[itemId];
    }
    
    // 在头盔中查找
    if (this.equipmentData.helmets[itemId]) {
      return this.equipmentData.helmets[itemId];
    }
    
    // 在饰品中查找
    if (this.equipmentData.accessories[itemId]) {
      return this.equipmentData.accessories[itemId];
    }
    
    return null;
  }
  
  /**
   * 获取物品类
   * @param {string} type - 物品类型
   * @returns {Function|null} - 物品类构造函数
   */
  getItemClass(type) {
    return this.itemTypes[type] || null;
  }
  
  /**
   * 使用物品
   * @param {Item} item - 要使用的物品
   * @param {Character} character - 使用物品的角色
   * @returns {boolean} - 是否成功使用物品
   */
  useItem(item, character) {
    if (!item || !item.usable) {
      return false;
    }
    
    // 使用物品
    const result = item.use(character);
    
    // 如果使用成功且物品可堆叠，减少数量
    if (result && item.stackable && item.quantity > 0) {
      item.quantity--;
    }
    
    return result;
  }
  
  /**
   * 装备物品
   * @param {Equipment} equipment - 要装备的装备
   * @param {Character} character - 装备的角色
   * @returns {boolean} - 是否成功装备
   */
  equipItem(equipment, character) {
    if (!equipment || !(equipment instanceof Equipment)) {
      return false;
    }
    
    // 检查职业限制
    if (equipment.classRestrictions && 
        equipment.classRestrictions.length > 0 && 
        !equipment.classRestrictions.includes(character.class)) {
      console.log(`${character.name} 无法装备 ${equipment.name}（职业限制）`);
      return false;
    }
    
    // 检查等级限制
    if (equipment.requiredLevel && character.level < equipment.requiredLevel) {
      console.log(`${character.name} 无法装备 ${equipment.name}（等级不足）`);
      return false;
    }
    
    // 卸下当前装备的物品（如果有）
    const currentEquipment = character.equipment[equipment.slot];
    if (currentEquipment) {
      this.unequipItem(currentEquipment, character);
    }
    
    // 装备新物品
    character.equipment[equipment.slot] = equipment;
    equipment.equip(character);
    
    console.log(`${character.name} 装备了 ${equipment.name}`);
    return true;
  }
  
  /**
   * 卸下装备
   * @param {Equipment} equipment - 要卸下的装备
   * @param {Character} character - 装备的角色
   * @returns {boolean} - 是否成功卸下
   */
  unequipItem(equipment, character) {
    if (!equipment || !(equipment instanceof Equipment)) {
      return false;
    }
    
    // 确保装备已经装备在角色身上
    if (character.equipment[equipment.slot] !== equipment) {
      return false;
    }
    
    // 卸下装备
    character.equipment[equipment.slot] = null;
    equipment.unequip(character);
    
    console.log(`${character.name} 卸下了 ${equipment.name}`);
    return true;
  }
  
  /**
   * 修复装备
   * @param {Equipment} equipment - 要修复的装备
   * @param {number} amount - 修复量（可选，默认为最大耐久度）
   * @returns {boolean} - 是否成功修复
   */
  repairEquipment(equipment, amount = null) {
    if (!equipment || !(equipment instanceof Equipment)) {
      return false;
    }
    
    return equipment.repair(amount);
  }
  
  /**
   * 获取物品描述
   * @param {Item|Equipment} item - 物品
   * @returns {string} - 物品描述
   */
  getItemDescription(item) {
    if (!item) {
      return '';
    }
    
    return item.getDescription();
  }
  
  /**
   * 获取物品信息
   * @param {Item|Equipment} item - 物品
   * @returns {Object} - 物品信息
   */
  getItemInfo(item) {
    if (!item) {
      return {};
    }
    
    return item.getInfo();
  }
  
  /**
   * 根据掉落表生成物品
   * @param {Array} dropTable - 掉落表
   * @returns {Array} - 生成的物品列表
   */
  generateDrops(dropTable) {
    if (!dropTable || !Array.isArray(dropTable)) {
      return [];
    }
    
    const drops = [];
    
    dropTable.forEach(drop => {
      // 检查掉落几率
      if (Math.random() <= drop.chance) {
        // 确定数量
        const minQuantity = drop.minQuantity || 1;
        const maxQuantity = drop.maxQuantity || minQuantity;
        const quantity = Math.floor(Math.random() * (maxQuantity - minQuantity + 1)) + minQuantity;
        
        // 创建物品
        const item = this.createItem(drop.itemId, quantity);
        if (item) {
          drops.push(item);
        }
      }
    });
    
    return drops;
  }
  
  /**
   * 生成金币掉落
   * @param {Object} goldDrop - 金币掉落配置 {min, max}
   * @returns {number} - 掉落的金币数量
   */
  generateGoldDrop(goldDrop) {
    if (!goldDrop || typeof goldDrop !== 'object') {
      return 0;
    }
    
    const min = goldDrop.min || 0;
    const max = goldDrop.max || min;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default ItemSystem;