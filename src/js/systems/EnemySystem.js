/**
 * 敌人系统
 * 管理游戏中所有敌人的生成、行为和交互
 */
import Enemy from '../classes/Enemy.js';
import DarkMage from '../classes/enemies/DarkMage.js';
import MysteriousStranger from '../classes/enemies/MysteriousStranger.js';
import BoarKing from '../classes/enemies/BoarKing.js';
import LargeBoar from '../classes/enemies/LargeBoar.js';
import WildBoar from '../classes/enemies/WildBoar.js';
import EnemyData from '../data/EnemyData.js';

class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    
    // 敌人类型映射
    this.enemyTypes = {
      'dark_mage': DarkMage,
      'mysterious_stranger': MysteriousStranger,
      'boar_king': BoarKing,
      'large_boar': LargeBoar,
      'wild_boar': WildBoar
    };
    
    // 敌人池（用于优化性能）
    this.enemyPool = {};
    
    // 初始化敌人池
    Object.keys(this.enemyTypes).forEach(type => {
      this.enemyPool[type] = [];
    });
    
    // 碰撞组
    this.colliders = [];
    
    // 事件监听器
    this.eventListeners = [];
  }
  
  // 创建敌人
  createEnemy(type, x, y, config = {}) {
    // 检查类型是否有效
    if (!this.enemyTypes[type]) {
      console.error(`Enemy type '${type}' not found`);
      return null;
    }
    
    let enemy;
    
    // 尝试从对象池中获取
    if (this.enemyPool[type].length > 0) {
      enemy = this.enemyPool[type].pop();
      enemy.sprite.setPosition(x, y);
      enemy.sprite.setActive(true);
      enemy.sprite.setVisible(true);
      enemy.sprite.body.enable = true;
      
      // 重置敌人状态
      enemy.health = enemy.maxHealth;
      enemy.currentState = enemy.states.IDLE;
    } else {
      // 创建新敌人
      const EnemyClass = this.enemyTypes[type];
      enemy = new EnemyClass(this.scene, x, y);
    }
    
    // 应用配置
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
    
    // 添加到敌人列表
    this.enemies.push(enemy);
    
    return enemy;
  }
  
  // 根据EnemyData创建敌人
  createEnemyFromData(enemyId, x, y, config = {}) {
    // 检查敌人ID是否有效
    if (!EnemyData[enemyId]) {
      console.error(`Enemy ID '${enemyId}' not found in EnemyData`);
      return null;
    }
    
    // 获取敌人数据
    const enemyData = EnemyData[enemyId];
    
    // 获取敌人类型
    const type = enemyData.id;
    
    // 创建敌人
    const enemy = this.createEnemy(type, x, y, config);
    
    return enemy;
  }
  
  // 回收敌人（放回对象池）
  recycleEnemy(enemy) {
    // 从敌人列表中移除
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
    
    // 确定敌人类型
    let type = null;
    for (const [key, EnemyClass] of Object.entries(this.enemyTypes)) {
      if (enemy instanceof EnemyClass) {
        type = key;
        break;
      }
    }
    
    if (type) {
      // 重置敌人状态
      enemy.sprite.setActive(false);
      enemy.sprite.setVisible(false);
      enemy.sprite.body.enable = false;
      
      // 放回对象池
      this.enemyPool[type].push(enemy);
    } else {
      // 如果找不到类型，直接销毁
      enemy.sprite.destroy();
    }
  }
  
  // 更新所有敌人
  update(time, delta, player) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // 更新敌人状态
      enemy.update(time, delta, player);
      
      // 如果敌人已死亡且动画已完成，回收敌人
      if (enemy.currentState === enemy.states.DEAD && enemy.sprite.alpha === 0) {
        this.recycleEnemy(enemy);
      }
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
  
  // 清除所有敌人
  clearAllEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.sprite.destroy();
    }
    
    this.enemies = [];
    
    // 清空对象池
    Object.keys(this.enemyPool).forEach(type => {
      this.enemyPool[type].forEach(enemy => {
        enemy.sprite.destroy();
      });
      this.enemyPool[type] = [];
    });
  }
  
  // 获取指定范围内的敌人
  getEnemiesInRange(x, y, range) {
    return this.enemies.filter(enemy => {
      const distance = Phaser.Math.Distance.Between(
        x, y,
        enemy.sprite.x, enemy.sprite.y
      );
      return distance <= range && enemy.currentState !== enemy.states.DEAD;
    });
  }
  
  // 对指定范围内的敌人造成伤害
  damageEnemiesInRange(x, y, range, damage, damageType = 'physical') {
    const affectedEnemies = this.getEnemiesInRange(x, y, range);
    
    affectedEnemies.forEach(enemy => {
      enemy.takeDamage(damage, damageType);
    });
    
    return affectedEnemies.length;
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
    
    // 如果敌人有attack方法，调用它
    if (typeof enemy.attack === 'function') {
      enemy.attack(player);
    }
  }
  
  /**
   * 处理玩家攻击
   * @param {Object} attackInfo - 攻击信息
   * @param {Character} player - 玩家角色
   */
  handlePlayerAttack(attackInfo, player) {
    // 检测攻击区域内的敌人
    this.enemies.forEach(enemy => {
      if (Phaser.Geom.Rectangle.ContainsPoint(
        attackInfo.area,
        new Phaser.Geom.Point(enemy.sprite.x, enemy.sprite.y)
      )) {
        // 对敌人造成伤害
        this.damageEnemy(enemy, attackInfo.damage);
        
        // 如果是野猪类型的敌人，有概率停止冲锋
        if (enemy.constructor.name === 'WildBoar' && enemy.isCharging) {
          // WildBoar类的takeDamage方法已经处理了这个逻辑
        }
      }
    });
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
    const chargeEffect = this.scene.add.particles('wild_boar_sprite', {
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
    const dustEffect = this.scene.add.particles('wild_boar_sprite', {
      speed: 50,
      scale: { start: 0.1, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 500,
      frequency: 20
    });
    dustEffect.setPosition(boar.sprite.x, boar.sprite.y + 20);
    
    // 0.5秒后自动销毁粒子效果
    this.scene.time.delayedCall(500, () => {
      dustEffect.destroy();
    });
    
    // 播放冲锋停止音效
    this.scene.sound.play('boar_charge', { volume: 0.3 });
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
      // 停止冲锋
      enemy.stopCharge();
      
      // 野猪撞墙后短暂眩晕
      enemy.stun(1000); // 眩晕1秒
      
      // 播放撞墙音效
      this.scene.sound.play('boar_charge', { volume: 0.7 });
      
      // 添加撞墙视觉效果
      const impactEffect = this.scene.add.particles('wild_boar_sprite', {
        speed: 100,
        scale: { start: 0.3, end: 0 },
        blendMode: 'NORMAL',
        lifespan: 300,
        frequency: 10,
        quantity: 10
      });
      impactEffect.setPosition(enemy.sprite.x, enemy.sprite.y);
      
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
      // 停止冲锋
      enemy.stopCharge();
      
      // 大型野猪撞墙后眩晕时间更长
      enemy.stun(1500); // 眩晕1.5秒
      
      // 播放更强力的撞墙音效
      this.scene.sound.play('boar_charge', { volume: 0.9 });
      
      // 添加更强力的撞墙视觉效果
      const impactEffect = this.scene.add.particles('large_boar_sprite', {
        speed: 150,
        scale: { start: 0.4, end: 0 },
        blendMode: 'NORMAL',
        lifespan: 400,
        frequency: 8,
        quantity: 15
      });
      impactEffect.setPosition(enemy.sprite.x, enemy.sprite.y);
      
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
    this.colliders.forEach(collider => {
      if (collider && collider.active) {
        collider.destroy();
      }
    });
    this.colliders = [];
  }
  
  /**
   * 清除所有事件监听器
   */
  clearEventListeners() {
    this.eventListeners.forEach(({ event, listener }) => {
      this.scene.events.off(event, listener);
    });
    this.eventListeners = [];
  }
  
  /**
   * 清理系统资源
   */
  destroy() {
    this.clearAllEnemies();
    this.clearColliders();
    this.clearEventListeners();
  }
}

export default EnemySystem;