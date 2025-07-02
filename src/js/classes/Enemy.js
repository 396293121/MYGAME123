/**
 * 敌人基类
 * 所有敌人类型的基础类
 */
import { EnemyConfigManager, TIMING_CONFIG, PHYSICS_CONFIG } from '../data/EnemyConfig.js';

class Enemy {
  constructor(scene, x, y, texture, frame) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture, frame);
    
    // 基础属性（使用配置文件中的默认值）
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 10;
    this.attackRange = 50;
    this.detectionRange = 200;
    this.speed = 50;
    this.exp = 20; // 击败后给予的经验值
    
    // 获取通用配置
    this.timingConfig = EnemyConfigManager.getGlobalTimingConfig();
    this.physicsConfig = EnemyConfigManager.getGlobalPhysicsConfig();
    
    // AI状态
    this.states = {
      IDLE: 'idle',
      PATROL: 'patrol',
      CHASE: 'chase',
      ATTACK: 'attack',
      STUNNED: 'stunned',
      DIE: 'dead'
    };
    this.currentState = this.states.IDLE;
    
    // 巡逻相关
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.patrolWaitTime = this.timingConfig.PATROL_WAIT_TIME;
    this.lastPatrolWait = 0;
    
    // 攻击相关
    this.canAttack = true;
    this.attackCooldown = this.timingConfig.BASE_ATTACK_COOLDOWN;
    
    // 卡住检测相关属性
    this.lastPosition = null;
    this.lastPositionUpdateTime = 0;
    this.stuckAccumulatedTime = 0;
    
    // 物理属性设置
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(this.physicsConfig.BOUNCE);
    this.sprite.setImmovable(false);
    
  }
  
  // 更新敌人状态
  update(time, delta, player) {
    if (this.currentState === this.states.DEAD) return;
    
    // 如果玩家对象存在，计算距离并更新AI行为
    if (player && player.sprite) {
      // 使用优化的距离计算（平方距离）
      const distance = this.calculateOptimizedDistance(player);
      
      // 根据距离和状态更新AI行为
      this.updateState(distance, player);
    }
    // 执行当前状态对应的行为
    switch (this.currentState) {
      case this.states.IDLE:
        this.idleBehavior(time);
        break;
      case this.states.PATROL:
        this.patrolBehavior(time);
        break;
      case this.states.CHASE:
        this.chaseBehavior(player);
        break;
      case this.states.ATTACK:
        this.attackBehavior(player);
        break;
      case this.states.STUNNED:
        // 眩晕状态下不执行任何行为
        break;
    }
  }
  
  // 更新敌人状态
  updateState(distance, player) {
    // 如果处于眩晕状态，不更新状态
    if (this.currentState === this.states.STUNNED) return;
    
    // 根据与玩家的距离决定状态（使用平方距离比较）
    const attackRangeSquared = this.attackRange * this.attackRange;
    const detectionRangeSquared = this.detectionRange * this.detectionRange;
    
    if (distance <= attackRangeSquared) {
      this.currentState = this.states.ATTACK;
    } else if (distance <= detectionRangeSquared) {
      this.currentState = this.states.CHASE;
    } else if (this.patrolPoints.length > 0) {
      this.currentState = this.states.PATROL;
    } else {
      this.currentState = this.states.IDLE;
    }
  }
  
  // 闲置行为
  idleBehavior(time) {
    // 检查sprite和body是否存在且启用
    if (!this.sprite || !this.sprite.body || !this.sprite.body.enable) {
      return;
    }
    
    // 闲置状态下，敌人停止移动
    this.sprite.setVelocity(0);
    
    // 随机决定是否开始巡逻
    if (this.patrolPoints.length > 0 && Math.random() < this.timingConfig.PATROL_RANDOM_CHANCE) {
      this.currentState = this.states.PATROL;
    }
  }
  
  // 巡逻行为
  patrolBehavior(time) {
    // 检查sprite和body是否存在且启用
    if (!this.sprite || !this.sprite.body || !this.sprite.body.enable) {
      return;
    }
    
    // 如果没有巡逻点，返回闲置状态
    if (this.patrolPoints.length === 0) {
      this.currentState = this.states.IDLE;
      return;
    }
    
    const currentPoint = this.patrolPoints[this.currentPatrolIndex];
    
    // 直接计算到巡逻点的距离
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      currentPoint.x, currentPoint.y
    );
    
    // 如果到达巡逻点
    if (distance < this.physicsConfig.DISTANCE_THRESHOLD) {
      // 如果刚到达，记录等待开始时间
      if (this.lastPatrolWait === 0) {
        this.lastPatrolWait = time;
        this.sprite.setVelocity(0);
      }
      
      // 在巡逻点等待一段时间
      if (time - this.lastPatrolWait >= this.patrolWaitTime) {
        // 等待结束，移动到下一个巡逻点
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        this.lastPatrolWait = 0;
      }
    } else {
      // 移动到当前巡逻点（只在水平方向移动，保持重力效果）
      const deltaX = currentPoint.x - this.sprite.x;
      
      // 只设置水平速度，让重力处理垂直方向
      if (Math.abs(deltaX) > this.physicsConfig.MOVEMENT_THRESHOLD) {
        const direction = deltaX > 0 ? 1 : -1;
        this.sprite.setVelocityX(direction * this.speed);
      } else {
        this.sprite.setVelocityX(0);
      }
      
      // 设置朝向
      this.sprite.flipX = this.sprite.body.velocity.x < 0;
    }
    
    // 卡住检测逻辑
    const stuckConfig = EnemyConfigManager.getStuckDetectionConfig();
    
    if (!this.lastPosition) {
      this.lastPosition = { x: this.sprite.x, y: this.sprite.y };
      this.lastPositionUpdateTime = time;
      this.stuckAccumulatedTime = 0;
    } else {
      // 检查是否到了位置更新间隔
      if (time - this.lastPositionUpdateTime > stuckConfig.CHECK_INTERVAL) {
        // 计算在这个间隔内的移动距离
        const moveDistance = Phaser.Math.Distance.Between(
          this.lastPosition.x, this.lastPosition.y,
          this.sprite.x, this.sprite.y
        );
        
        console.log(`Movement check: distance=${moveDistance}, threshold=${stuckConfig.MIN_MOVEMENT_DISTANCE}`);
        
        // 检查是否移动距离太小（可能卡住）
        if (moveDistance < stuckConfig.MIN_MOVEMENT_DISTANCE) {
          // 增加卡住计数时间
          this.stuckAccumulatedTime += (time - this.lastPositionUpdateTime);
          console.log(`Potential stuck detected, accumulated time: ${this.stuckAccumulatedTime}`);
          
          // 检查是否达到卡住阈值
          if (this.stuckAccumulatedTime >= stuckConfig.STUCK_TIME_THRESHOLD) {
            console.log(`Enemy stuck confirmed! Total stuck time: ${this.stuckAccumulatedTime}, handling...`);
            
            // 处理卡住情况
            if (this.patrolPoints.length > 1) {
              // 移除当前无法到达的巡逻点
              console.log(`Removing unreachable patrol point at index ${this.currentPatrolIndex}`);
              this.patrolPoints.splice(this.currentPatrolIndex, 1);
              
              // 调整当前巡逻索引
              if (this.currentPatrolIndex >= this.patrolPoints.length) {
                this.currentPatrolIndex = 0;
              }
              
              console.log(`Remaining patrol points: ${this.patrolPoints.length}`);
            } else if (this.patrolPoints.length === 1) {
              // 如果只剩一个巡逻点，根据当前朝向设置相反方向的巡逻点
              console.log('Only one patrol point left, creating patrol point in opposite direction');
              
              // 获取当前速度方向，如果没有速度则使用默认方向
              let directionX = this.sprite.body.velocity.x;
              
              // 如果当前没有移动，使用sprite的朝向或默认向左
              if (Math.abs(directionX) < 5) {
                // 检查sprite是否有flipX属性来判断朝向
                if (this.sprite.flipX !== undefined) {
                  directionX = this.sprite.flipX ? -1 : 1;
                } else {
                  directionX = -1; // 默认向左
                }
              }
              
              // 设置相反方向的巡逻点，距离为80-120像素
              const oppositeDirection = directionX > 0 ? -1 : 1;
              const patrolDistance = 80 + Math.random() * 40; // 80-120像素
              
              this.patrolPoints[0] = {
                x: this.sprite.x + oppositeDirection * patrolDistance,
                y: this.sprite.y // 保持Y轴不变，避免垂直移动
              };
              
              console.log(`New patrol point set in opposite direction: (${this.patrolPoints[0].x}, ${this.patrolPoints[0].y}), direction: ${oppositeDirection > 0 ? 'right' : 'left'}`);
            }
            
            // 检查是否所有巡逻点都被移除
            if (this.patrolPoints.length === 0) {
              console.log('All patrol points removed, triggering patrol setup...');
              
              // 尝试调用setupPatrolPoints方法重新生成巡逻点
              if (typeof this.setupPatrolPoints === 'function') {
                console.log('Calling setupPatrolPoints to regenerate patrol points');
                this.setupPatrolPoints(this.sprite.x, this.sprite.y);
              } else {
                // 如果没有setupPatrolPoints方法，根据当前朝向设置相反方向的巡逻点
                console.log('No setupPatrolPoints method, creating patrol point in opposite direction');
                
                // 获取当前速度方向，如果没有速度则使用默认方向
                let directionX = this.sprite.body.velocity.x;
                
                // 如果当前没有移动，使用sprite的朝向或默认向左
                if (Math.abs(directionX) < 5) {
                  // 检查sprite是否有flipX属性来判断朝向
                  if (this.sprite.flipX !== undefined) {
                    directionX = this.sprite.flipX ? -1 : 1;
                  } else {
                    directionX = -1; // 默认向左
                  }
                }
                
                // 设置相反方向的巡逻点，距离为80-120像素
                const oppositeDirection = directionX > 0 ? -1 : 1;
                const patrolDistance = 80 + Math.random() * 40; // 80-120像素
                
                this.patrolPoints = [{
                  x: this.sprite.x + oppositeDirection * patrolDistance,
                  y: this.sprite.y // 保持Y轴不变，避免垂直移动
                }];
                this.currentPatrolIndex = 0;
                
                console.log(`New patrol point set in opposite direction: (${this.patrolPoints[0].x}, ${this.patrolPoints[0].y}), direction: ${oppositeDirection > 0 ? 'right' : 'left'}`);
              }
            }
            
            // 重置卡住检测
            this.stuckAccumulatedTime = 0;
            this.lastPatrolWait = time;
            return;
          }
        } else {
          // 移动正常，重置卡住累计时间
          this.stuckAccumulatedTime = 0;
        }
        
        // 更新位置检查点和时间
        this.lastPosition = { x: this.sprite.x, y: this.sprite.y };
        this.lastPositionUpdateTime = time;
      }
    }
  }
  
  // 追逐行为
  chaseBehavior(player) {
    // 检查sprite和body是否存在且启用
    if (!this.sprite || !this.sprite.body || !this.sprite.body.enable) {
      return;
    }
    
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 计算朝向玩家的角度
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    // 向玩家移动
    this.sprite.setVelocityX(Math.cos(angle) * this.speed);
    this.sprite.setVelocityY(Math.sin(angle) * this.speed);
    
    // 设置朝向
    this.sprite.flipX = this.sprite.body.velocity.x < 0;
  }
  
  // 攻击行为
  attackBehavior(player) {
    // 检查sprite和body是否存在且启用
    if (!this.sprite || !this.sprite.body || !this.sprite.body.enable) {
      return;
    }
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 如果可以攻击
    if (this.canAttack) {
      // 执行攻击
      this.attack(player);
      
      // 设置攻击冷却
      this.canAttack = false;
      this.scene.time.delayedCall(this.attackCooldown, () => {
        this.canAttack = true;
      });
    }
  }
  
  // 攻击方法
  attack(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    console.log(`${this.constructor.name} attacks player`);
    
    // 使用优化的距离计算
    const distanceSquared = this.calculateOptimizedDistance(player);
    const attackRangeSquared = this.attackRange * this.attackRange;
    
    // 如果在攻击范围内，对玩家造成伤害
    if (distanceSquared <= attackRangeSquared) {
      player.takeDamage(this.damage);
    }
  }
  
  // 受伤方法
  takeDamage(amount) {
    this.health -= amount;
    
    // 受伤闪烁效果
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(this.timingConfig.HURT_FLASH_DURATION, () => {
      this.sprite.clearTint();
    });
    
    // 检查是否死亡
    if (this.health <= 0) {
      this.die();
    }
    
    return amount;
  }
  
  // 死亡方法
  die() {
    this.currentState = this.states.DIE;
    
    // 播放死亡动画
    this.sprite.setVelocity(0);
    this.sprite.setTint(0x666666);
    
    // 禁用物理碰撞
    this.sprite.body.enable = false;
    
    // 通知GameManager敌人死亡，增加觉醒值
    if (this.scene.game.gameManager) {
      this.scene.game.gameManager.handleEnemyDeath(this);
    }
    
    // 淡出效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: this.timingConfig.DEATH_FADE_DURATION,
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }
  
  // 设置巡逻点
  setPatrolPoints(points) {
    this.patrolPoints = points;
    this.currentPatrolIndex = 0;
  }
  
  // 眩晕方法
  stun(duration) {
    // 设置眩晕状态
    this.currentState = this.states.STUNNED;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 眩晕效果
    this.sprite.setTint(0xffff00);
    
    // 设置眩晕结束计时器
    this.scene.time.delayedCall(duration, () => {
      // 眩晕结束后设置为IDLE状态，让下次update重新评估状态
      this.currentState = this.states.IDLE;
      this.sprite.clearTint();
    });
  }

  /**
   * 计算优化的距离（平方距离，避免开方运算）
   * @param {Object} player - 玩家对象
   * @returns {number} 平方距离
   */
  calculateOptimizedDistance(player) {
    if (!player || !player.sprite || !this.sprite) {
      return Infinity;
    }

    // 简单的中心点平方距离计算，性能最优
    const dx = this.sprite.x - player.sprite.x;
    const dy = this.sprite.y - player.sprite.y;
    return dx * dx + dy * dy;
  }

  /**
   * 计算基于碰撞框的距离（保留原方法用于精确计算）
   * 参考玩家攻击系统的碰撞检测方式
   * @param {Object} player - 玩家对象
   * @returns {number} 碰撞框边缘之间的最短距离
   */
  calculateCollisionDistance(player) {
    if (!player || !player.sprite || !this.sprite) {
      return Infinity;
    }

    // 获取敌人和玩家的碰撞框
    const enemyBody = this.sprite.body;
    const playerBody = player.sprite.body;
    
    if (!enemyBody || !playerBody) {
      // 如果没有物理体，回退到中心点距离
      return Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
    }

    // 计算碰撞框的边界
    const enemyBounds = {
      left: enemyBody.x,
      right: enemyBody.x + enemyBody.width,
      top: enemyBody.y,
      bottom: enemyBody.y + enemyBody.height
    };
    
    const playerBounds = {
      left: playerBody.x,
      right: playerBody.x + playerBody.width,
      top: playerBody.y,
      bottom: playerBody.y + playerBody.height
    };

    // 检查是否重叠
    const isOverlapping = (
      enemyBounds.left < playerBounds.right &&
      enemyBounds.right > playerBounds.left &&
      enemyBounds.top < playerBounds.bottom &&
      enemyBounds.bottom > playerBounds.top
    );

    if (isOverlapping) {
      return 0; // 碰撞框重叠，距离为0
    }

    // 计算最短距离
    let minDistance = Infinity;

    // 水平距离
    if (enemyBounds.right < playerBounds.left) {
      // 敌人在玩家左边
      const horizontalDistance = playerBounds.left - enemyBounds.right;
      const verticalOverlap = Math.max(0, Math.min(enemyBounds.bottom, playerBounds.bottom) - Math.max(enemyBounds.top, playerBounds.top));
      if (verticalOverlap > 0) {
        minDistance = Math.min(minDistance, horizontalDistance);
      }
    } else if (playerBounds.right < enemyBounds.left) {
      // 敌人在玩家右边
      const horizontalDistance = enemyBounds.left - playerBounds.right;
      const verticalOverlap = Math.max(0, Math.min(enemyBounds.bottom, playerBounds.bottom) - Math.max(enemyBounds.top, playerBounds.top));
      if (verticalOverlap > 0) {
        minDistance = Math.min(minDistance, horizontalDistance);
      }
    }

    // 垂直距离
    if (enemyBounds.bottom < playerBounds.top) {
      // 敌人在玩家上方
      const verticalDistance = playerBounds.top - enemyBounds.bottom;
      const horizontalOverlap = Math.max(0, Math.min(enemyBounds.right, playerBounds.right) - Math.max(enemyBounds.left, playerBounds.left));
      if (horizontalOverlap > 0) {
        minDistance = Math.min(minDistance, verticalDistance);
      }
    } else if (playerBounds.bottom < enemyBounds.top) {
      // 敌人在玩家下方
      const verticalDistance = enemyBounds.top - playerBounds.bottom;
      const horizontalOverlap = Math.max(0, Math.min(enemyBounds.right, playerBounds.right) - Math.max(enemyBounds.left, playerBounds.left));
      if (horizontalOverlap > 0) {
        minDistance = Math.min(minDistance, verticalDistance);
      }
    }

    // 如果没有水平或垂直对齐，计算对角距离
    if (minDistance === Infinity) {
      // 计算四个角之间的最短距离
      const corners = [
        { x: enemyBounds.left, y: enemyBounds.top },
        { x: enemyBounds.right, y: enemyBounds.top },
        { x: enemyBounds.left, y: enemyBounds.bottom },
        { x: enemyBounds.right, y: enemyBounds.bottom }
      ];
      
      const playerCorners = [
        { x: playerBounds.left, y: playerBounds.top },
        { x: playerBounds.right, y: playerBounds.top },
        { x: playerBounds.left, y: playerBounds.bottom },
        { x: playerBounds.right, y: playerBounds.bottom }
      ];
      
      for (const enemyCorner of corners) {
        for (const playerCorner of playerCorners) {
          const distance = Phaser.Math.Distance.Between(
            enemyCorner.x, enemyCorner.y,
            playerCorner.x, playerCorner.y
          );
          minDistance = Math.min(minDistance, distance);
        }
      }
    }

    return minDistance;
  }

  // 销毁敌人
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}

export default Enemy;