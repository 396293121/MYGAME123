/**
 * 敌人系统
 * 管理游戏中所有敌人的生成、行为和交互
 */
import Enemy from '../classes/Enemy.js';
import MysteriousStranger from '../classes/enemies/MysteriousStranger.js';
import BoarKing from '../classes/enemies/BoarKing.js';
import LargeBoar from '../classes/enemies/LargeBoar.js';
import WildBoar from '../classes/enemies/WildBoar.js';
import EnemyConfig from '../data/EnemyConfig.js';
import ConfigManager from './ConfigManager.js';
import EventBus from './EventBus.js';
import Logger from './Logger.js';

class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    
    // 获取配置
    this.config = ConfigManager.get('enemySystem');
    
    // 敌人类型映射
    this.enemyTypes = {
      'mysterious_stranger': MysteriousStranger,
      'boar_king': BoarKing,
      'large_boar': LargeBoar,
      'wild_boar': WildBoar
    };
    
    // 创建类型到构造函数的反向映射（优化instanceof检查）
    this.typeByConstructor = new Map();
    Object.entries(this.enemyTypes).forEach(([type, Constructor]) => {
      this.typeByConstructor.set(Constructor, type);
    });
    
    // 敌人池（用于优化性能）
    this.enemyPool = {};
    this.poolStats = {}; // 对象池统计信息
    
    // 敌人池将在场景准备好后初始化
    this.poolInitialized = false;
    
    // 碰撞组管理
    this.colliders = [];
    this.collisionGroups = {
      enemies: null,
      platforms: null,
      player: null
    };
    
    // 事件监听器
    this.eventListeners = [];
    
    // 空间分割网格（用于优化碰撞检测）
    this.spatialGrid = {
      cellSize: this.config.spatialGrid.cellSize,
      grid: new Map(),
      bounds: { x: 0, y: 0, width: 0, height: 0 }
    };
    
    // 性能监控
    this.performanceStats = {
      poolHits: 0,
      poolMisses: 0,
      totalCreated: 0,
      totalRecycled: 0
    };
    
    // 绑定事件总线
    this.setupEventListeners();
    
    Logger.info('EnemySystem initialized', {
      poolSizes: this.config.objectPool.initialSizes,
      spatialGridSize: this.config.spatialGrid.cellSize
    });
  }
  
  /**
   * 初始化敌人对象池（优化版）
   * @public
   */
  initializeEnemyPool() {
    if (this.poolInitialized) {
      return;
    }
    
    // 批量初始化对象池
    const poolPromises = Object.entries(this.enemyTypes).map(([type, EnemyClass]) => {
      return this.initializePoolForType(type, EnemyClass);
    });
    
    Promise.all(poolPromises).then(() => {
      this.poolInitialized = true;
      Logger.info('Enemy pools initialized', {
        totalPools: Object.keys(this.enemyPool).length,
        totalObjects: Object.values(this.poolStats).reduce((sum, stat) => sum + stat.poolSize, 0),
        stats: this.poolStats
      });
    }).catch(error => {
      Logger.error('Failed to initialize enemy pools', error);
    });
  }
  
  /**
   * 为特定类型初始化对象池
   * @private
   */
  async initializePoolForType(type, EnemyClass) {
    this.enemyPool[type] = [];
    this.poolStats[type] = {
      created: 0,
      recycled: 0,
      inUse: 0,
      poolSize: 0,
      maxSize: 0,
      growthCount: 0
    };
    
    // 预分配对象
    const initialSize = this.config.objectPool.initialSizes.hasOwnProperty(type) 
      ? this.config.objectPool.initialSizes[type] 
      : this.config.objectPool.defaultSize;
      
    const maxSize = this.config.objectPool.maxSizes?.[type] || this.config.objectPool.maxSize || 50;
    this.poolStats[type].maxSize = maxSize;
    
    for (let i = 0; i < initialSize; i++) {
      try {
        const enemy = await this.createPooledEnemy(type, EnemyClass);
        if (enemy) {
          this.enemyPool[type].push(enemy);
          this.poolStats[type].poolSize++;
          this.poolStats[type].created++;
        }
      } catch (error) {
        Logger.error(`Failed to pre-allocate ${type} #${i}`, error);
      }
    }
  }
  
  /**
   * 创建池化敌人对象
   * @private
   */
  async createPooledEnemy(type, EnemyClass) {
    const enemy = new EnemyClass(this.scene, -2000, -2000); // 在屏幕外创建
    
    // 优化：禁用物理和渲染
    enemy.sprite.setActive(false);
    enemy.sprite.setVisible(false);
    if (enemy.sprite.body) {
      enemy.sprite.body.enable = false;
    }
    
    // 标记为池化对象
    enemy._pooled = true;
    enemy._poolType = type;
    enemy._poolId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 添加重置方法
    enemy.resetForPool = this.createResetMethod(enemy);
    
    return enemy;
  }
  
  /**
   * 创建对象重置方法
   * @private
   */
  createResetMethod(enemy) {
    return function(x, y) {
      // 重置位置
      this.sprite.setPosition(x, y);
      
      // 重置状态
      this.currentState = this.states.IDLE;
      this.health = this.maxHealth;
      this.canAttack = true;
      
      // 重置物理属性
      if (this.sprite.body) {
        this.sprite.body.setVelocity(0, 0);
        this.sprite.body.enable = true;
      }
      
      // 重置显示
      this.sprite.setActive(true);
      this.sprite.setVisible(true);
      this.sprite.setAlpha(1);
      this.sprite.setTint(0xffffff);
      
      // 重置动画
      if (this.sprite.anims) {
        this.sprite.anims.stop();
      }
      
      // 清理事件监听器
      this.sprite.removeAllListeners();
      
      // 重置特殊状态
      this.isCharging = false;
      this.isStomping = false;
      this.isEnraged = false;
      
      // 重置计时器
      this.lastAttackTime = 0;
      this.lastPatrolWait = 0;
      
      Logger.debug(`Reset pooled enemy: ${this._poolId}`);
    };
  }
  
  /**
   * 设置事件监听器
   * @private
   */
  setupEventListeners() {
    // 监听配置变化
    EventBus.on('config:enemySystem:changed', (newConfig) => {
      this.config = newConfig;
      Logger.debug('EnemySystem config updated', newConfig);
    });
    
    // 监听性能统计请求
    EventBus.on('enemySystem:getStats', () => {
      EventBus.emit('enemySystem:stats', {
        performance: this.performanceStats,
        pools: this.poolStats,
        activeEnemies: this.enemies.length
      });
    });
    
    // 监听玩家攻击事件
    if (window.eventBus) {
      window.eventBus.on('playerAttackHit', (attackInfo) => {
        this.handlePlayerAttackHit(attackInfo);
      }, this);
    }
  }
  
  /**
   * 从对象池获取敌人（优化版）
   * @param {string} type - 敌人类型
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {Enemy|null} 敌人实例
   */
  getEnemyFromPool(type, x, y) {
    if (!this.poolInitialized) {
      this.initializeEnemyPool();
    }
    
    const pool = this.enemyPool[type];
    if (!pool) {
      Logger.warn(`No pool found for enemy type: ${type}`);
      return null;
    }
    
    let enemy = null;
    
    // 尝试从池中获取对象
    if (pool.length > 0) {
      enemy = pool.pop();
      this.poolStats[type].poolSize--;
      this.poolStats[type].inUse++;
      this.performanceStats.poolHits++;
      
      // 重置对象状态
      if (enemy.resetForPool) {
        enemy.resetForPool(x, y);
      }
      
      Logger.debug(`Reused enemy from pool: ${type}`, {
        poolSize: pool.length,
        inUse: this.poolStats[type].inUse
      });
    } else {
      // 池中没有可用对象，动态创建
      const EnemyClass = this.enemyTypes[type];
      if (EnemyClass) {
        try {
          enemy = new EnemyClass(this.scene, x, y);
          enemy._pooled = true;
          enemy._poolType = type;
          enemy._poolId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          enemy.resetForPool = this.createResetMethod(enemy);
          
          this.poolStats[type].created++;
          this.poolStats[type].inUse++;
          this.poolStats[type].growthCount++;
          this.performanceStats.poolMisses++;
          this.performanceStats.totalCreated++;
          
          Logger.debug(`Created new enemy (pool empty): ${type}`, {
            totalCreated: this.poolStats[type].created,
            growthCount: this.poolStats[type].growthCount
          });
        } catch (error) {
          Logger.error(`Failed to create enemy ${type}:`, error);
          return null;
        }
      }
    }
    
    if (enemy) {
      // 添加到活跃敌人列表
      this.enemies.push(enemy);
      
      // 设置碰撞
      this.setupEnemyCollisions(enemy);
      
      // 触发事件
      EventBus.emit('enemy:spawned', { type, enemy, position: { x, y } });
    }
    
    return enemy;
  }
  
  /**
   * 回收敌人到对象池（优化版）
   * @param {Enemy} enemy - 敌人实例
   */
  recycleEnemyToPool(enemy) {
    if (!enemy || !enemy._pooled || !enemy._poolType) {
      Logger.warn('Attempted to recycle non-pooled enemy');
      return false;
    }
    
    const type = enemy._poolType;
    const pool = this.enemyPool[type];
    
    if (!pool) {
      Logger.warn(`No pool found for enemy type: ${type}`);
      return false;
    }
    
    // 检查池大小限制
    const maxSize = this.poolStats[type].maxSize;
    if (pool.length >= maxSize) {
      // 池已满，直接销毁对象
      this.destroyEnemy(enemy);
      Logger.debug(`Pool full, destroyed enemy: ${type}`, {
        poolSize: pool.length,
        maxSize: maxSize
      });
      return true;
    }
    
    try {
      // 从活跃列表中移除
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
      
      // 清理敌人状态
      this.cleanupEnemyForPool(enemy);
      
      // 放回池中
      pool.push(enemy);
      this.poolStats[type].poolSize++;
      this.poolStats[type].inUse--;
      this.poolStats[type].recycled++;
      this.performanceStats.totalRecycled++;
      
      // 触发事件
      EventBus.emit('enemy:recycled', { type, enemy });
      
      Logger.debug(`Recycled enemy to pool: ${type}`, {
        poolSize: pool.length,
        inUse: this.poolStats[type].inUse
      });
      
      return true;
    } catch (error) {
      Logger.error(`Failed to recycle enemy ${type}:`, error);
      return false;
    }
  }
  
  /**
   * 清理敌人状态以便回收
   * @private
   */
  cleanupEnemyForPool(enemy) {
    // 停止所有动画
    if (enemy.sprite && enemy.sprite.anims) {
      enemy.sprite.anims.stop();
    }
    
    // 清理事件监听器
    if (enemy.sprite) {
      enemy.sprite.removeAllListeners();
    }
    
    // 禁用物理体
    if (enemy.sprite && enemy.sprite.body) {
      enemy.sprite.body.enable = false;
      enemy.sprite.body.setVelocity(0, 0);
    }
    
    // 隐藏精灵
    enemy.sprite.setActive(false);
    enemy.sprite.setVisible(false);
    enemy.sprite.setPosition(-2000, -2000);
    
    // 清理碰撞
    this.cleanupEnemyCollisions(enemy);
    
    // 重置状态
    enemy.currentState = enemy.states.IDLE;
    enemy.health = enemy.maxHealth;
  }
  
  /**
   * 创建敌人（兼容旧接口）
   * @param {string} type - 敌人类型
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} config - 配置对象
   * @returns {Enemy|null} 创建的敌人对象
   */
  createEnemy(type, x, y, config = {}) {
    try {
      // 确保对象池已初始化
      if (!this.poolInitialized) {
        this.initializeEnemyPool();
      }
      
      // 检查类型是否有效
      if (!this.enemyTypes[type]) {
        Logger.error(`Enemy type '${type}' not found`);
        return null;
      }
      
      let enemy;
      let fromPool = false;
      
      // 尝试从对象池中获取
      if (this.enemyPool[type].length > 0) {
        enemy = this.enemyPool[type].pop();
        this.resetEnemyFromPool(enemy, x, y);
        fromPool = true;
        this.performanceStats.poolHits++;
        this.poolStats[type].poolSize--;
      } else {
        // 创建新敌人
        const EnemyClass = this.enemyTypes[type];
        enemy = new EnemyClass(this.scene, x, y);
        this.performanceStats.poolMisses++;
        this.poolStats[type].created++;
      }
      
      this.performanceStats.totalCreated++;
      this.poolStats[type].inUse++;
      
      // 应用配置
      this.applyEnemyConfig(enemy, config);
      
      // 添加到敌人列表
      this.enemies.push(enemy);
      
      // 添加到空间网格
      this.addToSpatialGrid(enemy);
      
      // 发送事件
      EventBus.emit('enemy:created', { enemy, type, fromPool });
      
      Logger.debug(`Enemy created: ${type}`, {
        fromPool,
        position: { x, y },
        totalActive: this.enemies.length
      });
      
      return enemy;
      
    } catch (error) {
      Logger.error(`Failed to create enemy: ${type}`, error);
      return null;
    }
  }
  
  /**
   * 从对象池重置敌人
   * @private
   * @param {Enemy} enemy - 敌人对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  resetEnemyFromPool(enemy, x, y) {
    enemy.sprite.setPosition(x, y);
    enemy.sprite.setActive(true);
    enemy.sprite.setVisible(true);
    enemy.sprite.body.enable = true;
    enemy.sprite.alpha = 1;
    
    // 重置敌人状态
    enemy.health = enemy.maxHealth;
    enemy.currentState = enemy.states.IDLE;
    enemy.isCharging = false;
    enemy.isStunned = false;
    
    // 重置物理属性
    enemy.sprite.body.setVelocity(0, 0);
    enemy.sprite.body.setAcceleration(0, 0);
  }
  
  /**
   * 应用敌人配置
   * @private
   * @param {Enemy} enemy - 敌人对象
   * @param {Object} config - 配置对象
   */
  applyEnemyConfig(enemy, config) {
    if (config.patrolPoints) {
      enemy.setPatrolPoints(config.patrolPoints);
    }
    
    if (config.health) {
      enemy.health = config.health;
      enemy.maxHealth = config.health;
    }
    
    if (config.damage) {
      enemy.damage = config.damage;
    }
    
    if (config.speed) {
      enemy.speed = config.speed;
    }
    
    if (config.scale) {
      enemy.sprite.setScale(config.scale);
    }
  }
  
  // 根据EnemyConfig创建敌人
  createEnemyFromData(enemyId, x, y, config = {}) {
    // 检查敌人ID是否有效
    if (!EnemyConfig[enemyId]) {
      console.error(`Enemy ID '${enemyId}' not found in EnemyConfig`);
      return null;
    }
    
    // 获取敌人数据
    const enemyData = EnemyConfig[enemyId];
    
    // 获取敌人类型
    const type = enemyData.id;
    
    // 创建敌人
    const enemy = this.createEnemy(type, x, y, config);
    
    return enemy;
  }
  
  /**
   * 回收敌人（放回对象池）
   * @param {Enemy} enemy - 要回收的敌人对象
   */
  recycleEnemy(enemy) {
    try {
      // 从敌人列表中移除
      const index = this.enemies.indexOf(enemy);
      if (index !== -1) {
        this.enemies.splice(index, 1);
      }
      
      // 从空间网格中移除
      this.removeFromSpatialGrid(enemy);
      
      // 使用优化的类型检查
      const type = this.typeByConstructor.get(enemy.constructor);
      
      if (type) {
        // 检查对象池大小限制
        const maxPoolSize = this.config.objectPool.maxSizes[type] || this.config.objectPool.defaultMaxSize;
        
        if (this.enemyPool[type].length < maxPoolSize) {
          // 重置敌人状态
          this.resetEnemyForPool(enemy);
          
          // 放回对象池
          this.enemyPool[type].push(enemy);
          this.poolStats[type].poolSize++;
          this.poolStats[type].recycled++;
          this.performanceStats.totalRecycled++;
          
          Logger.debug(`Enemy recycled: ${type}`, {
            poolSize: this.enemyPool[type].length,
            maxPoolSize
          });
        } else {
          // 对象池已满，直接销毁
          enemy.sprite.destroy();
          Logger.debug(`Enemy destroyed (pool full): ${type}`);
        }
      } else {
        // 如果找不到类型，直接销毁
        enemy.sprite.destroy();
        Logger.warn('Enemy type not found for recycling', enemy.constructor.name);
      }
      
      // 更新统计信息
      if (type && this.poolStats[type]) {
        this.poolStats[type].inUse--;
      }
      
      // 发送事件
      EventBus.emit('enemy:recycled', { enemy, type });
      
    } catch (error) {
      Logger.error('Failed to recycle enemy', error);
      // 确保敌人被销毁
      if (enemy && enemy.sprite) {
        enemy.sprite.destroy();
      }
    }
  }
  
  /**
   * 重置敌人状态以便回收
   * @private
   * @param {Enemy} enemy - 敌人对象
   */
  resetEnemyForPool(enemy) {
    enemy.sprite.setActive(false);
    enemy.sprite.setVisible(false);
    enemy.sprite.body.enable = false;
    enemy.sprite.setPosition(-1000, -1000); // 移到屏幕外
    
    // 清除所有状态
    enemy.currentState = enemy.states.IDLE;
    enemy.isCharging = false;
    enemy.isStunned = false;
    enemy.health = enemy.maxHealth;
    
    // 清除物理状态
    enemy.sprite.body.setVelocity(0, 0);
    enemy.sprite.body.setAcceleration(0, 0);
    
    // 清除视觉效果
    enemy.sprite.clearTint();
    enemy.sprite.setAlpha(1);
    enemy.sprite.setScale(1);
  }
  
  /**
   * 添加敌人到空间网格
   * @private
   * @param {Enemy} enemy - 敌人对象
   */
  addToSpatialGrid(enemy) {
    if (!this.config.spatialGrid.enabled) return;
    
    const cellX = Math.floor(enemy.sprite.x / this.spatialGrid.cellSize);
    const cellY = Math.floor(enemy.sprite.y / this.spatialGrid.cellSize);
    const cellKey = `${cellX},${cellY}`;
    
    if (!this.spatialGrid.grid.has(cellKey)) {
      this.spatialGrid.grid.set(cellKey, new Set());
    }
    
    this.spatialGrid.grid.get(cellKey).add(enemy);
    enemy._gridCell = cellKey;
  }
  
  /**
   * 从空间网格移除敌人
   * @private
   * @param {Enemy} enemy - 敌人对象
   */
  removeFromSpatialGrid(enemy) {
    if (!this.config.spatialGrid.enabled || !enemy._gridCell) return;
    
    const cell = this.spatialGrid.grid.get(enemy._gridCell);
    if (cell) {
      cell.delete(enemy);
      if (cell.size === 0) {
        this.spatialGrid.grid.delete(enemy._gridCell);
      }
    }
    
    delete enemy._gridCell;
  }
  
  /**
   * 更新敌人在空间网格中的位置
   * @private
   * @param {Enemy} enemy - 敌人对象
   */
  updateSpatialGrid(enemy) {
    if (!this.config.spatialGrid.enabled) return;
    
    const cellX = Math.floor(enemy.sprite.x / this.spatialGrid.cellSize);
    const cellY = Math.floor(enemy.sprite.y / this.spatialGrid.cellSize);
    const newCellKey = `${cellX},${cellY}`;
    
    if (enemy._gridCell !== newCellKey) {
      this.removeFromSpatialGrid(enemy);
      enemy._gridCell = newCellKey;
      
      if (!this.spatialGrid.grid.has(newCellKey)) {
        this.spatialGrid.grid.set(newCellKey, new Set());
      }
      
      this.spatialGrid.grid.get(newCellKey).add(enemy);
    }
  }
  
  /**
   * 获取指定区域内的敌人（使用空间网格优化）
   * @param {number} x - 中心X坐标
   * @param {number} y - 中心Y坐标
   * @param {number} range - 范围
   * @returns {Array<Enemy>} 范围内的敌人列表
   */
  getEnemiesInRangeOptimized(x, y, range) {
    if (!this.config.spatialGrid.enabled) {
      return this.getEnemiesInRange(x, y, range);
    }
    
    const enemies = [];
    const cellSize = this.spatialGrid.cellSize;
    const cellRange = Math.ceil(range / cellSize);
    
    const centerCellX = Math.floor(x / cellSize);
    const centerCellY = Math.floor(y / cellSize);
    
    // 检查周围的网格单元
    for (let dx = -cellRange; dx <= cellRange; dx++) {
      for (let dy = -cellRange; dy <= cellRange; dy++) {
        const cellKey = `${centerCellX + dx},${centerCellY + dy}`;
        const cell = this.spatialGrid.grid.get(cellKey);
        
        if (cell) {
          cell.forEach(enemy => {
            if (enemy.currentState !== enemy.states.DEAD) {
              const distance = Phaser.Math.Distance.Between(
                x, y, enemy.sprite.x, enemy.sprite.y
              );
              if (distance <= range) {
                enemies.push(enemy);
              }
            }
          });
        }
      }
    }
    
    return enemies;
  }
  
  /**
   * 更新所有敌人
   * @param {number} time - 当前时间
   * @param {number} delta - 时间差
   * @param {Player} player - 玩家对象
   */
  update(time, delta, player) {
    try {
      const startTime = performance.now();
      
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        
        // 更新敌人状态
        enemy.update(time, delta, player);
        
        // 更新空间网格位置
        this.updateSpatialGrid(enemy);
        
        // 如果敌人已死亡且动画已完成，回收敌人
        if (enemy.currentState === enemy.states.DEAD && enemy.sprite.alpha === 0) {
          this.recycleEnemy(enemy);
        }
      }
      
      // 性能监控
      const updateTime = performance.now() - startTime;
      if (updateTime > this.config.performance.maxUpdateTime) {
        Logger.warn('EnemySystem update took too long', {
          updateTime,
          enemyCount: this.enemies.length,
          threshold: this.config.performance.maxUpdateTime
        });
      }
      
      // 定期发送性能统计
      if (time % this.config.performance.statsInterval < delta) {
        EventBus.emit('enemySystem:performance', {
          updateTime,
          enemyCount: this.enemies.length,
          poolStats: this.poolStats,
          performanceStats: this.performanceStats
        });
      }
      
    } catch (error) {
      Logger.error('Error in EnemySystem update', error);
    }
  }
  
  // 生成敌人波次
  spawnWave(waveConfig) {
    waveConfig.enemies.forEach(enemyConfig => {
      for (let i = 0; i < enemyConfig.count; i++) {
        // 计算生成位置
        let x, y;
        if (enemyConfig.spawnArea) {
          x = Phaser.Math.Between(
            enemyConfig.spawnArea.x,
            enemyConfig.spawnArea.x + enemyConfig.spawnArea.width
          );
          y = Phaser.Math.Between(
            enemyConfig.spawnArea.y,
            enemyConfig.spawnArea.y + enemyConfig.spawnArea.height
          );
        } else {
          x = enemyConfig.x || 0;
          y = enemyConfig.y || 0;
        }
        
        // 创建敌人
        this.createEnemy(
          enemyConfig.type,
          x,
          y,
          enemyConfig.config || {}
        );
      }
    });
  }
  
  /**
   * 清除所有敌人
   */
  clearAllEnemies() {
    try {
      // 清除活动敌人
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        this.removeFromSpatialGrid(enemy);
        if (enemy.sprite && !enemy.sprite.destroyed) {
          enemy.sprite.destroy();
        }
      }
      
      this.enemies = [];
      
      // 清空对象池
      Object.keys(this.enemyPool).forEach(type => {
        this.enemyPool[type].forEach(enemy => {
          if (enemy.sprite && !enemy.sprite.destroyed) {
            enemy.sprite.destroy();
          }
        });
        this.enemyPool[type] = [];
        this.poolStats[type] = {
          created: 0,
          recycled: 0,
          inUse: 0,
          poolSize: 0
        };
      });
      
      // 清空空间网格
      this.spatialGrid.grid.clear();
      
      // 重置性能统计
      this.performanceStats = {
        poolHits: 0,
        poolMisses: 0,
        totalCreated: 0,
        totalRecycled: 0
      };
      
      Logger.info('All enemies cleared');
      EventBus.emit('enemySystem:cleared');
      
    } catch (error) {
      Logger.error('Error clearing enemies', error);
    }
  }
  
  /**
   * 获取指定范围内的敌人（传统方法，作为备用）
   * @param {number} x - 中心X坐标
   * @param {number} y - 中心Y坐标
   * @param {number} range - 范围
   * @returns {Array<Enemy>} 范围内的敌人列表
   */
  getEnemiesInRange(x, y, range) {
    return this.enemies.filter(enemy => {
      const distance = Phaser.Math.Distance.Between(
        x, y,
        enemy.sprite.x, enemy.sprite.y
      );
      return distance <= range && enemy.currentState !== enemy.states.DEAD;
    });
  }
  
  /**
   * 对指定范围内的敌人造成伤害（使用优化的范围查找）
   * @param {number} x - 中心X坐标
   * @param {number} y - 中心Y坐标
   * @param {number} range - 范围
   * @param {number} damage - 伤害值
   * @param {string} damageType - 伤害类型
   * @returns {number} 受影响的敌人数量
   */
  damageEnemiesInRange(x, y, range, damage, damageType = 'physical') {
    try {
      const affectedEnemies = this.getEnemiesInRangeOptimized(x, y, range);
      
      affectedEnemies.forEach(enemy => {
        enemy.takeDamage(damage, damageType);
      });
      
      // 发送事件
      if (affectedEnemies.length > 0) {
        EventBus.emit('enemies:damaged', {
          position: { x, y },
          range,
          damage,
          damageType,
          count: affectedEnemies.length
        });
      }
      
      return affectedEnemies.length;
      
    } catch (error) {
      Logger.error('Error in damageEnemiesInRange', error);
      return 0;
    }
  }
  
  /**
   * 设置敌人的碰撞和事件监听
   * @param {Object} config - 配置对象
   * @param {Phaser.Tilemaps.TilemapLayer} config.platformLayer - 平台图层
   * @param {Character} config.player - 玩家角色
   * @param {Object} config.gameState - 游戏状态
   */
  setupEnemies(config) {
    const { platformLayer, player, gameState } = config;
    
    // 清除之前的碰撞和事件监听
    this.clearColliders();
    this.clearEventListeners();
    
    // 设置敌人与平台的碰撞
    this.enemies.forEach(enemy => {
      // 添加与平台的碰撞
      const platformCollider = this.scene.physics.add.collider(enemy.sprite, platformLayer);
      this.colliders.push(platformCollider);
      
      // 添加与玩家的碰撞
      const playerCollider = this.scene.physics.add.overlap(
        player.sprite, 
        enemy.sprite, 
        this.handlePlayerEnemyCollision.bind(this, player, enemy), 
        null, 
        this
      );
      this.colliders.push(playerCollider);
      
      // 为野猪类型敌人设置特殊行为
      if (enemy.constructor.name === 'WildBoar') {
        // 监听野猪的冲锋开始事件
        const chargeStartListener = (boar) => {
          if (boar === enemy) {
            this.handleWildBoarChargeStart(boar);
          }
        };
        this.scene.events.on('wildboar-charge-start', chargeStartListener);
        this.eventListeners.push({ event: 'wildboar-charge-start', listener: chargeStartListener });
        
        // 监听野猪的冲锋结束事件
        const chargeStopListener = (boar) => {
          if (boar === enemy) {
            this.handleWildBoarChargeStop(boar);
          }
        };
        this.scene.events.on('wildboar-charge-stop', chargeStopListener);
        this.eventListeners.push({ event: 'wildboar-charge-stop', listener: chargeStopListener });
      }
    });
    
    // 更新任务目标描述
    if (gameState && gameState.activeQuest) {
      gameState.activeQuest.title = '野猪狩猎';
      gameState.activeQuest.description = '消灭铁山村附近的野猪，保护村民安全';
    }
  }
  
  /**
   * 处理玩家与敌人的碰撞
   * @param {Character} player - 玩家角色
   * @param {Enemy} enemy - 敌人对象
   * @param {Phaser.GameObjects.Sprite} enemySprite - 敌人精灵
   */
  handlePlayerEnemyCollision(player, enemy, enemySprite) {
    // 如果玩家正在攻击，则不受伤害
    if (player.isAttacking) return;
    
    // 如果是野猪类型的敌人且正在冲锋，造成额外伤害
    if (enemy.constructor.name === 'WildBoar' && enemy.isCharging) {
      // 冲锋状态下伤害提高50%
      const chargeDamage = Math.floor(enemy.damage * 1.5);
      player.takeDamage(chargeDamage, 'physical', enemy.sprite);
      
      // 冲锋撞击后停止冲锋
      enemy.stopCharge();
    } else {
      // 正常伤害
      player.takeDamage(enemy.damage, 'physical', enemy.sprite);
    }
    
    // 注意：不再调用enemy.attack方法，避免重复伤害处理
    // 伤害已经在上面的代码中处理了
  }
  
  /**
   * 处理玩家攻击命中事件（通过事件系统触发）
   * @param {Object} attackInfo - 攻击信息
   */
  handlePlayerAttackHit(attackInfo) {
    if (!attackInfo || !attackInfo.area) {
      Logger.warn('Invalid attack info received', attackInfo);
      return;
    }
    
    Logger.debug('Processing player attack hit', {
      damage: attackInfo.damage,
      direction: attackInfo.direction,
      timestamp: attackInfo.timestamp
    });
    
    // 检测攻击区域内的敌人
    let hitCount = 0;
    this.enemies.forEach(enemy => {
      // 创建敌人的物理碰撞框矩形
      // 使用物理体的实际世界坐标，而不是精灵坐标加偏移
      const enemyRect = new Phaser.Geom.Rectangle(
        enemy.sprite.body ? enemy.sprite.body.x : enemy.sprite.x,
        enemy.sprite.body ? enemy.sprite.body.y : enemy.sprite.y,
        enemy.sprite.body ? enemy.sprite.body.width : enemy.sprite.width,
        enemy.sprite.body ? enemy.sprite.body.height : enemy.sprite.height
      );
      
      // 检查攻击区域与敌人物理体是否重叠
      if (Phaser.Geom.Rectangle.Overlaps(attackInfo.area, enemyRect)) {
        // 对敌人造成伤害
        this.damageEnemy(enemy, attackInfo.damage);
        hitCount++;
        
        // 播放命中音效
        if (attackInfo.attacker && attackInfo.attacker.audioManager) {
          attackInfo.attacker.audioManager.playCharacterSound(
            attackInfo.attacker.characterType, 
            'attack', 
            'hit'
          );
        }
        
        // 如果是野猪类型的敌人，有概率停止冲锋
        if (enemy.constructor.name === 'WildBoar' && enemy.isCharging) {
          // WildBoar类的takeDamage方法已经处理了这个逻辑
        }
        
        // 发布敌人被攻击事件
        if (window.eventBus) {
          window.eventBus.emit('enemyHit', {
            enemy: enemy,
            attacker: attackInfo.attacker,
            damage: attackInfo.damage,
            timestamp: Date.now()
          });
        }
      }
    });
    
    // 记录攻击统计
    if (hitCount > 0) {
      Logger.debug(`Player attack hit ${hitCount} enemies`);
    }
  }
  
  /**
   * 对敌人造成伤害
   * @param {Enemy} enemy - 敌人对象
   * @param {number} damage - 伤害值
   */
  damageEnemy(enemy, damage) {
    // 使用敌人类的takeDamage方法处理伤害
    const actualDamage = enemy.takeDamage(damage);
    
    // 显示伤害数字
    const damageText = this.scene.add.text(enemy.sprite.x, enemy.sprite.y - 20, Math.floor(actualDamage).toString(), {
      fontSize: '16px',
      fill: '#ff0000'
    });
    
    // 伤害数字动画
    this.scene.tweens.add({
      targets: damageText,
      y: enemy.sprite.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        damageText.destroy();
      }
    });
    
    // 检查敌人是否死亡
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
    
    return actualDamage;
  }
  
  /**
   * 处理敌人死亡
   * @param {Enemy} enemy - 敌人对象
   */
  killEnemy(enemy) {
    // 获取玩家
    const player = this.scene.player;
    if (!player) return;
    
    // 给玩家增加经验
    player.addExp(enemy.exp);
    
    // 更新任务进度
    if (this.scene.gameState && 
        this.scene.gameState.activeQuest && 
        this.scene.gameState.activeQuest.objectives && 
        this.scene.gameState.activeQuest.objectives[0]) {
      this.scene.gameState.activeQuest.objectives[0].current += 1;
    }
    
    // 调用敌人的die方法处理死亡逻辑
    enemy.die();
    
    // 延迟一段时间后回收敌人
    this.scene.time.delayedCall(1000, () => {
      this.recycleEnemy(enemy);
    });
  }
  
  /**
   * 处理野猪冲锋开始事件
   * @param {WildBoar} boar - 野猪对象
   */
  handleWildBoarChargeStart(boar) {
    // 添加冲锋开始的视觉效果
    const chargeEffect = this.scene.add.particles(boar.sprite.x, boar.sprite.y, 'wild_boar_sprite', {
      speed: 100,
      scale: { start: 0.2, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      frequency: 50
    });
    chargeEffect.startFollow(boar.sprite);
    
    // 3秒后自动销毁粒子效果
    this.scene.time.delayedCall(3000, () => {
      chargeEffect.destroy();
    });
    
    // 播放冲锋音效
   this.scene.sound.play('attack_sound', { volume: 0.5 });
  }
  
  /**
   * 处理野猪冲锋结束事件
   * @param {WildBoar} boar - 野猪对象
   */
  handleWildBoarChargeStop(boar) {
    // 添加冲锋结束的视觉效果（尘土飞扬）
    const dustEffect = this.scene.add.particles(boar.sprite.x, boar.sprite.y + 20, 'wild_boar_sprite', {
      speed: 50,
      scale: { start: 0.1, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 500,
      frequency: 20
    });
    
    // 0.5秒后自动销毁粒子效果
    this.scene.time.delayedCall(500, () => {
      dustEffect.destroy();
    });
    
    // 播放冲锋停止音效
  //  this.scene.sound.play('boar_charge', { volume: 0.3 });
  }
  
  /**
   * 处理敌人特殊行为
   * 通用化的特殊行为处理机制，可以处理所有类型敌人的特殊行为
   */
  handleSpecialBehaviors() {
    // 遍历所有敌人
    this.enemies.forEach(enemy => {
      // 根据敌人类型处理不同的特殊行为
      const enemyType = enemy.constructor.name;
      
      // 处理野猪特殊行为
      if (enemyType === 'WildBoar' && enemy.isCharging) {
        this._handleWildBoarChargeBehavior(enemy);
      }
      
      // 处理大型野猪特殊行为
      else if (enemyType === 'LargeBoar' && enemy.isCharging) {
        this._handleLargeBoarChargeBehavior(enemy);
      }
      
      // 处理猪王特殊行为
      else if (enemyType === 'BoarKing') {
        this._handleBoarKingBehavior(enemy);
      }
      
      // 可以在这里添加其他敌人类型的特殊行为处理
    });
  }
  
  /**
   * 处理野猪冲锋撞墙行为
   * @private
   * @param {WildBoar} enemy - 野猪敌人
   */
  _handleWildBoarChargeBehavior(enemy) {
    // 检查野猪是否碰到了墙壁（速度变为0）
    if (enemy.sprite.body.velocity.x === 0 || enemy.sprite.body.velocity.y === 0) {
      // 停止冲锋（stopCharge方法内部已经处理了眩晕状态）
      enemy.stopCharge();
      
      // 播放撞墙音效
    //  this.scene.sound.play('boar_charge', { volume: 0.7 });
      
      // 添加撞墙视觉效果
      const impactEffect = this.scene.add.particles(enemy.sprite.x, enemy.sprite.y, 'wild_boar_sprite', {
        speed: 100,
        scale: { start: 0.3, end: 0 },
        blendMode: 'NORMAL',
        lifespan: 300,
        frequency: 10,
        quantity: 10
      });
      
      // 0.5秒后自动销毁粒子效果
      this.scene.time.delayedCall(500, () => {
        impactEffect.destroy();
      });
    }
  }
  
  /**
   * 处理大型野猪冲锋行为
   * @private
   * @param {LargeBoar} enemy - 大型野猪敌人
   */
  _handleLargeBoarChargeBehavior(enemy) {
    // 检查大型野猪是否碰到了墙壁
    if (enemy.sprite.body.velocity.x === 0 || enemy.sprite.body.velocity.y === 0) {
      // 停止冲锋（stopCharge方法内部已经处理了眩晕状态）
      enemy.stopCharge();
      
      // 播放更强力的撞墙音效
      this.scene.sound.play('boar_charge', { volume: 0.9 });
      
      // 添加更强力的撞墙视觉效果
      const impactEffect = this.scene.add.particles(enemy.sprite.x, enemy.sprite.y, 'wild_boar_sprite', {
        speed: 150,
        scale: { start: 0.4, end: 0 },
        blendMode: 'NORMAL',
        lifespan: 400,
        frequency: 8,
        quantity: 15
      });
      
      // 0.6秒后自动销毁粒子效果
      this.scene.time.delayedCall(600, () => {
        impactEffect.destroy();
      });
    }
  }
  
  /**
   * 处理猪王特殊行为
   * @private
   * @param {BoarKing} enemy - 猪王敌人
   */
  _handleBoarKingBehavior(enemy) {
    // 这里可以添加猪王的特殊行为处理
    // 例如：召唤小野猪、地面践踏等特殊技能的触发条件和效果
  }
  
  /**
   * 清除所有碰撞
   */
  clearColliders() {
    try {
      this.colliders.forEach(collider => {
        if (collider && collider.active && !collider.destroyed) {
          collider.destroy();
        }
      });
      this.colliders = [];
      
      // 清除碰撞组
      Object.keys(this.collisionGroups).forEach(key => {
        this.collisionGroups[key] = null;
      });
      
      Logger.debug('All colliders cleared');
      
    } catch (error) {
      Logger.error('Error clearing colliders', error);
    }
  }
  
  /**
   * 清除所有事件监听器
   */
  clearEventListeners() {
    try {
      // 清除场景事件监听器
      this.eventListeners.forEach(({ event, listener }) => {
        this.scene.events.off(event, listener);
      });
      this.eventListeners = [];
      
      // 清除事件总线监听器
      EventBus.off('config:enemySystem:changed');
      EventBus.off('enemySystem:getStats');
      
      Logger.debug('All event listeners cleared');
      
    } catch (error) {
      Logger.error('Error clearing event listeners', error);
    }
  }
  
  /**
   * 获取活跃敌人数量
   * @returns {number} 活跃敌人数量
   */
  getActiveEnemyCount() {
    return this.enemies.length;
  }

  /**
   * 获取系统统计信息
   * @returns {Object} 统计信息对象
   */
  getStats() {
    return {
      activeEnemies: this.enemies.length,
      poolStats: { ...this.poolStats },
      performanceStats: { ...this.performanceStats },
      spatialGridCells: this.spatialGrid.grid.size,
      colliders: this.colliders.length,
      eventListeners: this.eventListeners.length
    };
  }
  
  /**
   * 清理系统资源
   */
  destroy() {
    try {
      Logger.info('Destroying EnemySystem');
      
      // 清除所有敌人和对象池
      this.clearAllEnemies();
      
      // 清除碰撞检测
      this.clearColliders();
      
      // 清除事件监听器
      this.clearEventListeners();
      
      // 清空引用
      this.scene = null;
      this.config = null;
      this.enemyTypes = null;
      this.typeByConstructor.clear();
      this.spatialGrid.grid.clear();
      
      // 发送销毁事件
      EventBus.emit('enemySystem:destroyed');
      
      Logger.info('EnemySystem destroyed successfully');
      
    } catch (error) {
      Logger.error('Error destroying EnemySystem', error);
    }
  }
}

export default EnemySystem;