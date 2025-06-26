/**
 * 关卡管理器
 * 负责管理游戏中的多个关卡，提供关卡切换和状态管理功能
 */

import LevelData from './data/LevelData.js';

class LevelManager {
  constructor(game) {
    this.game = game;
    this.currentLevel = 1;
    this.currentLocation = null;
    this.locationData = LevelData.locations;
    
    // 关卡配置数据 - 从LevelData导入
    this.levels = LevelData.levels;
  }
  
  /**
   * 获取当前关卡数据
   * @returns {Object} 当前关卡的配置数据
   */
  getCurrentLevel() {
    return this.levels[this.currentLevel - 1];
  }
  
  /**
   * 根据位置ID获取关卡数据
   * @param {string} locationId - 位置ID
   * @returns {Object|null} 关卡数据，如果不存在则返回null
   */
  getLevelByLocationId(locationId) {
    return this.levels.find(level => level.locationId === locationId) || null;
  }
  
  /**
   * 获取位置数据
   * @param {string} locationId - 位置ID
   * @returns {Object|null} 位置数据，如果不存在则返回null
   */
  getLocationData(locationId) {
    return this.locationData[locationId] || null;
  }
  
  /**
   * 获取当前位置数据
   * @returns {Object|null} 当前位置数据
   */
  getCurrentLocationData() {
    const currentLevel = this.getCurrentLevel();
    return currentLevel ? this.getLocationData(currentLevel.locationId) : null;
  }
  
  /**
   * 前往下一关卡
   * @returns {Object|null} 下一关卡的配置数据，如果已是最后一关则返回null
   */
  goToNextLevel() {
    if (this.currentLevel < this.levels.length) {
      this.currentLevel++;
      return this.getCurrentLevel();
    }
    return null; // 所有关卡完成
  }
  
  /**
   * 前往指定关卡
   * @param {number} levelNumber - 关卡编号（从1开始）
   * @returns {Object|null} 指定关卡的配置数据，如果关卡不存在则返回null
   */
  goToLevel(levelNumber) {
    if (levelNumber >= 1 && levelNumber <= this.levels.length) {
      this.currentLevel = levelNumber;
      const level = this.getCurrentLevel();
      this.currentLocation = level.locationId;
      return level;
    }
    return null; // 关卡不存在
  }
  
  /**
   * 前往指定位置
   * @param {string} locationId - 位置ID
   * @returns {Object|null} 关卡数据，如果位置不存在则返回null
   */
  goToLocation(locationId) {
    const levelIndex = this.levels.findIndex(level => level.locationId === locationId);
    if (levelIndex !== -1) {
      this.currentLevel = levelIndex + 1;
      this.currentLocation = locationId;
      return this.getCurrentLevel();
    }
    return null; // 位置不存在
  }
  
  /**
   * 获取关卡总数
   * @returns {number} 关卡总数
   */
  getTotalLevels() {
    return this.levels.length;
  }
  
  /**
   * 检查是否为最后一关
   * @returns {boolean} 是否为最后一关
   */
  isLastLevel() {
    return this.currentLevel === this.levels.length;
  }
  
  /**
   * 获取所有关卡的基本信息
   * @returns {Array} 关卡基本信息列表
   */
  getLevelInfoList() {
    return this.levels.map(level => ({
      id: level.id,
      key: level.key,
      name: level.name,
      difficulty: level.difficulty,
      requiredLevel: level.requiredLevel,
      description: level.description
    }));
  }
  
  /**
   * 检查玩家是否满足进入指定关卡的要求
   * @param {number} levelId - 关卡ID
   * @param {Player} player - 玩家对象
   * @returns {boolean} 是否满足要求
   */
  canEnterLevel(levelId, player) {
    const level = this.levels.find(l => l.id === levelId);
    if (!level) return false;
    
    return player.level >= level.requiredLevel;
  }
  
  /**
   * 获取关卡完成后的奖励
   * @param {number} levelId - 关卡ID
   * @returns {Object|null} 关卡奖励数据，如果关卡不存在则返回null
   */
  getLevelRewards(levelId) {
    const level = this.levels.find(l => l.id === levelId);
    if (!level) return null;
    
    return level.rewards;
  }
  
  /**
   * 获取位置的连接地点
   * @param {string} locationId - 位置ID
   * @returns {Array|null} 连接地点数组，如果位置不存在则返回null
   */
  getLocationConnections(locationId) {
    const location = this.getLocationData(locationId);
    return location ? location.connections : null;
  }
  
  /**
   * 检查两个位置是否相连
   * @param {string} fromLocationId - 起始位置ID
   * @param {string} toLocationId - 目标位置ID
   * @returns {boolean} 是否相连
   */
  areLocationsConnected(fromLocationId, toLocationId) {
    const connections = this.getLocationConnections(fromLocationId);
    if (!connections) return false;
    
    return connections.some(conn => conn.locationId === toLocationId);
  }
}

export default LevelManager;