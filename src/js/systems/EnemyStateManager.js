/**
 * 敌人状态管理器
 * 统一管理所有敌人的状态转换和行为逻辑，消除代码重复
 */
import Logger from './Logger.js';

class EnemyStateManager {
  constructor() {
    this.logger = Logger;
    
    // 状态缓存优化 - 缓存状态转换结果
    this.stateTransitionCache = new Map();
    this.behaviorCache = new Map();
    
    // 性能统计
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalQueries: 0
    };
  }

  /**
   * 通用状态更新逻辑
   * @param {Enemy} enemy - 敌人实例
   * @param {number} distance - 与玩家的距离
   * @param {Object} player - 玩家对象
   */
  updateEnemyState(enemy, distance, player) {
    // 如果处于不可中断状态，直接返回
    if (this.isUninterruptibleState(enemy.currentState)) {
      return;
    }

    // 生成缓存键
    const cacheKey = this.generateStateCacheKey(enemy, distance);
    this.cacheStats.totalQueries++;

    // 检查缓存
    if (this.stateTransitionCache.has(cacheKey)) {
      const cachedState = this.stateTransitionCache.get(cacheKey);
      this.cacheStats.hits++;
      
      if (cachedState !== enemy.currentState) {
        this.transitionToState(enemy, cachedState);
      }
      return;
    }

    // 计算目标状态
    const targetState = this.calculateTargetState(enemy, distance, player);
    this.cacheStats.misses++;
    
    // 缓存结果
    this.stateTransitionCache.set(cacheKey, targetState);
    
    // 执行状态转换
    if (targetState !== enemy.currentState) {
      this.transitionToState(enemy, targetState);
    }
  }

  /**
   * 检查是否为不可中断状态
   * @param {string} state - 当前状态
   * @returns {boolean}
   */
  isUninterruptibleState(state) {
    const uninterruptibleStates = ['stunned', 'hurt', 'die', 'dead', 'charge'];
    return uninterruptibleStates.includes(state.toLowerCase());
  }

  /**
   * 生成状态缓存键
   * @param {Enemy} enemy - 敌人实例
   * @param {number} distance - 距离
   * @returns {string}
   */
  generateStateCacheKey(enemy, distance) {
    const distanceRange = Math.floor(distance / 50) * 50; // 按50像素分组
    return `${enemy.enemyType || 'unknown'}_${enemy.currentState}_${distanceRange}_${enemy.canAttack ? 1 : 0}`;
  }

  /**
   * 计算目标状态
   * @param {Enemy} enemy - 敌人实例
   * @param {number} distance - 与玩家的距离
   * @param {Object} player - 玩家对象
   * @returns {string}
   */
  calculateTargetState(enemy, distance, player) {
    // 攻击状态判断
    if (distance <= enemy.attackRange && enemy.canAttack) {
      return enemy.states.ATTACK;
    }
    
    // 追击状态判断
    if (distance <= enemy.detectionRange) {
      return enemy.states.CHASE;
    }
    
    // 巡逻状态判断
    if (enemy.patrolPoints && enemy.patrolPoints.length > 0) {
      return enemy.states.PATROL;
    }
    
    // 默认闲置状态
    return enemy.states.IDLE;
  }

  /**
   * 执行状态转换
   * @param {Enemy} enemy - 敌人实例
   * @param {string} targetState - 目标状态
   */
  transitionToState(enemy, targetState) {
    if (enemy.setStateWithTransition) {
      enemy.setStateWithTransition(targetState);
    } else if (enemy.setState) {
      enemy.setState(targetState);
    } else {
      enemy.currentState = targetState;
    }
  }

  /**
   * 通用行为执行逻辑
   * @param {Enemy} enemy - 敌人实例
   * @param {number} time - 当前时间
   * @param {Object} player - 玩家对象
   */
  executeBehavior(enemy, time, player) {
    const behaviorKey = `${enemy.enemyType || 'unknown'}_${enemy.currentState}`;
    
    // 检查行为缓存
    if (this.behaviorCache.has(behaviorKey)) {
      const cachedBehavior = this.behaviorCache.get(behaviorKey);
      cachedBehavior.call(enemy, time, player);
      return;
    }
console.log(enemy.currentState)
    // 执行对应行为并缓存
    let behavior;
    switch (enemy.currentState) {
      case enemy.states.IDLE:
        behavior = enemy.idleBehavior || this.defaultIdleBehavior;
        break;
      case enemy.states.PATROL:
        behavior = enemy.patrolBehavior || this.defaultPatrolBehavior;
        break;
      case enemy.states.CHASE:
        behavior = enemy.chaseBehavior || this.defaultChaseBehavior;
        break;
      case enemy.states.ATTACK:
        behavior = enemy.attackBehavior || this.defaultAttackBehavior;
        break;
      default:
        behavior = this.defaultIdleBehavior;
    }

    this.behaviorCache.set(behaviorKey, behavior);
    behavior.call(enemy, time, player);
  }

  /**
   * 默认闲置行为
   */
  defaultIdleBehavior(time) {
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
    }
  }

  /**
   * 默认巡逻行为
   */
  defaultPatrolBehavior(time) {
    if (!this.patrolPoints || this.patrolPoints.length === 0) {
      this.defaultIdleBehavior.call(this, time);
      return;
    }

    const currentTarget = this.patrolPoints[this.currentPatrolIndex];
    if (!currentTarget) return;

    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      currentTarget.x, currentTarget.y
    );

    if (distance < 10) {
      // 到达巡逻点，等待或移动到下一个点
      if (time - this.lastPatrolWait > this.patrolWaitTime) {
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        this.lastPatrolWait = time;
      }
      this.sprite.body.setVelocity(0, 0);
    } else {
      // 移动到巡逻点
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        currentTarget.x, currentTarget.y
      );
      
      const velocityX = Math.cos(angle) * this.speed;
      const velocityY = Math.sin(angle) * this.speed;
      
      this.sprite.body.setVelocity(velocityX, velocityY);
      this.sprite.setFlipX(velocityX < 0);
    }
  }

  /**
   * 默认追击行为
   */
  defaultChaseBehavior(player) {
    if (!player || !player.sprite || !this.sprite || !this.sprite.body) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    const chaseSpeed = this.chaseSpeed || this.speed;
    const velocityX = Math.cos(angle) * chaseSpeed;
    const velocityY = Math.sin(angle) * chaseSpeed;
    
    this.sprite.body.setVelocity(velocityX, velocityY);
    this.sprite.setFlipX(velocityX < 0);
  }

  /**
   * 默认攻击行为
   */
  defaultAttackBehavior(player) {
    if (!this.canAttack) return;
    
    // 停止移动
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
    }
    
    // 面向玩家
    if (player && player.sprite) {
      this.sprite.setFlipX(player.sprite.x < this.sprite.x);
    }
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.stateTransitionCache.clear();
    this.behaviorCache.clear();
    this.cacheStats = { hits: 0, misses: 0, totalQueries: 0 };
  }

  /**
   * 获取缓存统计信息
   * @returns {Object}
   */
  getCacheStats() {
    const hitRate = this.cacheStats.totalQueries > 0 
      ? (this.cacheStats.hits / this.cacheStats.totalQueries * 100).toFixed(2)
      : 0;
    
    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      cacheSize: this.stateTransitionCache.size + this.behaviorCache.size
    };
  }

  /**
   * 定期清理过期缓存
   */
  cleanupCache() {
    // 如果缓存过大，清理一半
    const maxCacheSize = 1000;
    if (this.stateTransitionCache.size > maxCacheSize) {
      const entries = Array.from(this.stateTransitionCache.entries());
      const keepCount = Math.floor(maxCacheSize / 2);
      this.stateTransitionCache.clear();
      
      // 保留最近的一半
      entries.slice(-keepCount).forEach(([key, value]) => {
        this.stateTransitionCache.set(key, value);
      });
    }
    
    if (this.behaviorCache.size > maxCacheSize) {
      const entries = Array.from(this.behaviorCache.entries());
      const keepCount = Math.floor(maxCacheSize / 2);
      this.behaviorCache.clear();
      
      entries.slice(-keepCount).forEach(([key, value]) => {
        this.behaviorCache.set(key, value);
      });
    }
  }
}

// 创建单例实例
const enemyStateManager = new EnemyStateManager();

export default enemyStateManager;