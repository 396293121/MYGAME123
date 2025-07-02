/**
 * 野猪敌人类 - 增强版
 * 铁山村附近常见的野猪，性情暴躁
 * 使用与角色系统一致的动画和状态管理架构
 */
import Enemy from '../Enemy.js';
import { EnemyConfigManager } from '../../data/EnemyConfig.js';
import EnemyStateManager from '../../systems/EnemyStateManager.js';
import EnemyAnimationController from '../../systems/EnemyAnimationController.js';
import EventBus from '../../systems/EventBus.js';
import Logger from '../../systems/Logger.js';
import { AudioManager } from '../../data/AudioConfig.js';

class WildBoar extends Enemy {
  constructor(scene, x, y) {
    // 获取野猪数据
    const data = EnemyConfigManager.getEnemyData('wild_boar');
    
    super(scene, x, y, data.sprite, 0);
    
    this.enemyType = 'wild_boar';
    
    // 设置精灵锚点（必须在物理体设置之前）
    
    // 从EnemyConfig设置基础属性
    this.health = data.stats.health;
    this.maxHealth = data.stats.health;
    this.damage = data.stats.attack;
    this.defense = data.stats.defense;
    this.speed = data.stats.speed;
    this.exp = data.stats.exp;
    
    // 从统一配置获取行为参数
    const behaviorConfig = data.behavior;
    this.detectionRange = behaviorConfig.detectionRadius;
    this.aggroRadius = behaviorConfig.aggroRadius;
    this.attackRange = behaviorConfig.attackRange;
    this.patrolRadius = behaviorConfig.patrolRadius;
    this.chaseSpeed = behaviorConfig.chaseSpeed;
    this.chargeSpeed = behaviorConfig.chargeSpeed;
    this.attackCooldown = behaviorConfig.attackCooldown;
    this.chargeTriggerDistance = behaviorConfig.chargeTriggerDistance;
    this.chargeMinDistance = behaviorConfig.chargeMinDistance;
    this.returnToPatrolDelay = behaviorConfig.returnToPatrolDelay;
    
    // 冲锋相关属性
    const chargeConfig = data.enhancedAnimation.charge;
    this.chargeDuration = chargeConfig.duration;
    this.chargeCooldownTime = chargeConfig.cooldown;
    this.chargeStunDuration = chargeConfig.stunDuration;
    
    this.canCharge = true;
    this.isCharging = false;
    this.chargeTime = 0;
    this.lastAttackTime = 0
    
    // 状态机
    const stateMachineConfig = EnemyAnimationController.getStateMachineConfig(this.enemyType);
    if (stateMachineConfig) {
      this.states = stateMachineConfig.states;
    }
    
    // 设置物理属性
    const physicsConfig = EnemyConfigManager.getPhysicsConfig();
    this.sprite.setBounce(physicsConfig.BOUNCE);
    
    // 创建动画
    this.createAnimations();
    
    // 设置物理体
    EnemyAnimationController.setupPhysicsBody(this.sprite, this.enemyType);
    
    // 播放默认动画
    this.playAnimation('idle');
    
    // 初始化音效管理器
    this.audioManager = new AudioManager(scene);
    this.initializeAudio();
    
    // 设置巡逻点（在出生点周围）
    this.setupPatrolPoints(x, y);
    
    Logger.debug(`WildBoar created at (${x}, ${y})`);
  }
  
  /**
   * 创建动画
   */
  createAnimations() {
    EnemyAnimationController.createAnimationsForEnemy(this.scene, this.enemyType);
  }
  
  /**
   * 设置巡逻点
   * @param {number} centerX - 中心X坐标
   * @param {number} centerY - 中心Y坐标
   */
  setupPatrolPoints(centerX, centerY) {
    const patrolRadius = this.patrolRadius; // 使用配置的巡逻半径
    
    this.patrolPoints = [];
    
    // 设置水平巡逻点，保持相同的Y坐标以避免垂直移动
    this.patrolPoints.push({ x: centerX, y: centerY }); // 起始点
    this.patrolPoints.push({ x: centerX - patrolRadius, y: centerY }); // 左侧
    this.patrolPoints.push({ x: centerX + patrolRadius, y: centerY }); // 右侧
    this.patrolPoints.push({ x: centerX, y: centerY }); // 回到中心
    
    // 从第一个巡逻点（当前位置）开始
    this.currentPatrolIndex = 0;
    
    // 设置初始等待时间，让野猪先在原地停留
    this.lastPatrolWait = 0; // 使用0初始化，与Phaser的time参数保持一致
  }
  
  /**
   * 播放动画（使用优化的动画控制器）
   * @param {string} animationKey - 动画键名
   * @param {Function} onComplete - 完成回调
   * @param {Function} onKeyFrame - 关键帧回调
   */
  playAnimation(animationKey, onComplete = null, onKeyFrame = null) {
    // 检查sprite是否存在
    if (!this.sprite) {
      return false;
    }
    
    return EnemyAnimationController.playAnimation(
      this.sprite,
      this.enemyType,
      animationKey,
      onComplete,
      onKeyFrame
    );
  }
  
  /**
   * 播放状态动画（新增方法）
   * @param {string} state - 状态名
   * @param {Object} options - 播放选项
   */
  playStateAnimation(state, options = {}) {
    if (!this.sprite) {
      return false;
    }
    
    return EnemyAnimationController.playStateAnimation(
      this.sprite,
      this.enemyType,
      state,
      options
    );
  }
  
  /**
   * 初始化音效
   */
  initializeAudio() {
    const config = EnemyAnimationController.getConfig(this.enemyType);
    if (config && config.soundEffects) {
      this.soundEffects = config.soundEffects;
    }
  }
  
  /**
   * 播放音效 - 使用AudioManager统一管理
   * @param {string} soundKey - 音效键名 (attack, charge, hurt, die)
   * @param {Object} options - 播放选项
   */
  playSound(soundKey, options = {}) {
    if (!this.audioManager) return;
    
    // 映射音效键名到AudioConfig中的配置
    const soundMapping = {
      'attack': { actionType: 'attack', soundType: 'sound' },
      'charge': { actionType: 'movement', soundType: 'charge' },
      'hurt': { actionType: 'damage', soundType: 'hurt' },
      'die': { actionType: 'damage', soundType: 'die' }
    };
    
    const mapping = soundMapping[soundKey];
    if (mapping) {
      this.audioManager.playCharacterSound(
        'wild_boar',
        mapping.actionType,
        mapping.soundType,
        options
      );
    } else {
      // 回退到原有的音效播放方式
      if (this.soundEffects && this.soundEffects[soundKey]) {
        const soundName = this.soundEffects[soundKey];
        if (this.scene.sound && this.scene.cache.audio.has(soundName)) {
          this.scene.sound.play(soundName, { volume: 0.7, ...options });
        }
      }
    }
  }
  
  /**
   * 更新方法 - 重写父类方法
   */
  update(time, delta, player) {
    // 如果已经死亡，不执行任何更新逻辑
    if (this.currentState === this.states.DIE ) {
      return;
    }
    
    // 手动调用父类的update逻辑，但不调用super.update避免状态被直接修改
    if (player && player.sprite) {
      // 使用基于碰撞框的距离计算
      const distance = this.calculateCollisionDistance(player);
      
      // 使用自定义的状态更新逻辑
      this.updateState(distance, player);
    }
    
    // 执行当前状态对应的行为
    this.executeBehavior(time, player);
    
    // 更新动画状态
    this.updateAnimationState();
    
    // 处理冲锋逻辑
    this.updateChargeLogic(time, delta, player);
    
    // 处理攻击冷却
    this.updateAttackCooldown(time);
  }
  
  /**
   * 重写状态更新逻辑（使用状态管理器）
   */
  updateState(distance, player) {
    // 使用统一的状态管理器
    EnemyStateManager.updateEnemyState(this, distance, player);
  }
  
  /**
   * 带状态转换验证的状态设置方法
   */
  /**
   * 优化的状态转换方法 - 使用转换映射表简化逻辑
   * @param {string} targetState - 目标状态
   */
  setStateWithTransition(targetState) {
    // 检查是否可以直接转换
    if (EnemyAnimationController.isValidStateTransition(this.enemyType, this.currentState, targetState)) {
      this.setState(targetState);
      return;
    }
    
    // 获取配置
    const timingConfig = EnemyConfigManager.getTimingConfig();
    const transitionDelay = timingConfig.STATE_TRANSITION_DELAY;
    
    // 状态转换映射表 - 定义特殊转换路径
    const stateTransitionMap = {
      // 格式: 'currentState_targetState': { intermediateState, finalState }
      [`${this.states.CHASE}_${this.states.PATROL}`]: { via: this.states.IDLE, final: this.states.PATROL },
      [`${this.states.ATTACK}_${this.states.STUNNED}`]: { via: this.states.IDLE, final: this.states.STUNNED },
      [`${this.states.IDLE}_${this.states.ATTACK}`]: { via: this.states.CHASE, final: this.states.ATTACK },
      [`${this.states.PATROL}_${this.states.ATTACK}`]: { via: this.states.CHASE, final: this.states.ATTACK }
    };
    
    // 查找转换路径
    const transitionKey = `${this.currentState}_${targetState}`;
    const transitionPath = stateTransitionMap[transitionKey];
    
    if (transitionPath) {
      // 使用映射表中定义的转换路径
      this.setState(transitionPath.via);
      this.scene.time.delayedCall(transitionDelay, () => {
        if (this.currentState === transitionPath.via) {
          this.setState(transitionPath.final);
        }
      });
    } else {
      // 默认转换路径：通过IDLE状态
      this.setState(this.states.IDLE);
      this.scene.time.delayedCall(transitionDelay, () => {
        if (this.currentState === this.states.IDLE) {
          this.setState(targetState);
        }
      });
    }
  }
  
  /**
   * 执行当前状态对应的行为（统一使用状态管理器）
   */
  executeBehavior(time, player) {
    // 处理野猪特有的状态
    if (this.currentState === this.states.CHARGE) {
      this.chargeBehavior(player);
      return;
    }
    
    if (this.currentState === this.states.HURT || 
        this.currentState === this.states.STUNNED || 
        this.currentState === this.states.DIE) {
      // 这些状态不执行任何行为
      return;
    }
    
    // 统一使用状态管理器处理所有标准行为
    EnemyStateManager.executeBehavior(this, time, player);
  }
  
  /**
   * 追击行为（野猪特有实现）
   */
  chaseBehavior(time, player) {
    if (!player || !player.sprite || !this.sprite || !this.sprite.body) {
      return;
    }
    
    // 计算方向
    const direction = player.sprite.x > this.sprite.x ? 1 : -1;
    
    // 只设置X轴速度，保持重力对Y轴的影响
    this.sprite.body.setVelocityX(direction * this.speed);
    
    // 设置精灵朝向（向左时翻转，向右时不翻转）
    this.sprite.setFlipX(direction < 0);
  }
  
  /**
   * 闲置行为（野猪特有实现）
   */
  idleBehavior(time) {
    // 停止水平移动，保持重力对Y轴的影响
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocityX(0);
    }
  }
  
  /**
   * 冲锋行为
   */
  chargeBehavior(player) {
    if (!player || !player.sprite) return;
    
    // 冲锋状态下保持当前速度，不需要重新计算
    // 速度已经在startCharge中设置好了
    
    // 确保精灵朝向正确
    const direction = this.sprite.body.velocity.x > 0 ? 1 : -1;
    this.sprite.setFlipX(direction < 0);
  }
  
  /**
   * 攻击行为
   */
  attackBehavior(time, player) {
    if (!player || !player.sprite) return;
    
    // 停止水平移动，保持重力对Y轴的影响
    this.sprite.body.setVelocityX(0);
    
    // 如果可以攻击
    if (this.canAttack) {
      this.attack(player);
      
      // 设置攻击冷却
      this.canAttack = false;
      this.scene.time.delayedCall(this.attackCooldown, () => {
        this.canAttack = true;
      });
    }
  }
  
  /**
   * 更新动画状态
   */
  updateAnimationState() {
  
    // 检查sprite和anims是否存在
    if (!this.sprite || !this.sprite.anims) {
      return;
    }
    const currentAnim = this.sprite.anims.currentAnim;
    const currentKey = currentAnim ? currentAnim.key : null;
    
    // 检查是否真的在移动（基于速度）
    const isMoving = this.sprite.body && (Math.abs(this.sprite.body.velocity.x) > 5 || Math.abs(this.sprite.body.velocity.y) > 5);
    
    // 根据当前状态播放相应动画
    switch (this.currentState) {
      case this.states.IDLE:
        if (!currentKey || !currentKey.includes('idle')) {
          this.playAnimation('idle');
        }
        break;
        
      case this.states.PATROL:
        // 巡逻状态下，根据实际移动情况播放动画
        if (isMoving) {
          if (!currentKey || !currentKey.includes('move')) {
            this.playAnimation('move');
          }
        } else {
          // 在巡逻点等待时播放闲置动画
          if (!currentKey || !currentKey.includes('idle')) {
            this.playAnimation('idle');
          }
        }
        break;
        
      case this.states.CHASE:
        if (!currentKey || !currentKey.includes('move')) {
          this.playAnimation('move');
        }
        break;
        
      case this.states.CHARGE:
        if (!currentKey || !currentKey.includes('charge')) {
          this.playAnimation('charge');
        }
        break;
        
      case this.states.ATTACK:
        if (!currentKey || !currentKey.includes('attack')) {
          this.playAnimation('attack', () => {
            // 攻击动画完成后切换到追击状态
            // 攻击冷却由canAttack机制统一管理
            if (this.health > 0 && this.currentState !== this.states.DIE) {
              if (this.target) {
                this.setState(this.states.CHASE);
              } else {
                this.setState(this.states.IDLE);
              }
            }
          });
        }
        break;
        
      case this.states.HURT:
        if (!currentKey || !currentKey.includes('hurt')) {
          this.playAnimation('hurt', () => {
            // 受伤动画完成后恢复之前的状态（如果还活着）
            if (this.health > 0 && this.currentState !== this.states.DIE) {
              if (this.target) {
                this.setState(this.states.CHASE);
              } else {
                this.setState(this.states.IDLE);
              }
            }
          });
        }
        break;
        
      case this.states.STUNNED:
        if (!currentKey || !currentKey.includes('stunned')) {
          this.playAnimation('stunned');
        }
        break;
        
      case this.states.DIE:
        // 死亡状态下不在这里播放动画，由die()方法统一处理
        // 避免重复播放死亡动画
        break;
    }
  }
  
  /**
   * 更新冲锋逻辑
   */
  updateChargeLogic(time, delta, player) {
    // 检查是否可以发起冲锋
    if (this.currentState === this.states.CHASE && 
        this.canCharge && 
        !this.isCharging && 
        this.canAttack && 
        player && 
        player.sprite) {
      
      const distance = this.calculateCollisionDistance(player);
      
      // 修复：当碰撞框重叠时（距离为0），直接进入攻击状态
      if (distance === 0) {
        // 碰撞框重叠，使用统一的攻击行为
        this.setState(this.states.ATTACK);
        this.attackBehavior(time, player);
      } else if (distance > 0 && distance < this.chargeMinDistance) {
        // 距离太近无法冲锋，使用统一的攻击行为
        this.setState(this.states.ATTACK);
        this.attackBehavior(time, player);
      } else if (distance <= this.chargeTriggerDistance && distance >= this.chargeMinDistance) {
        // 在合适的距离范围内发起冲锋
        this.startCharge(player);
      }
    }
    
    // 更新冲锋状态
    if (this.isCharging) {
      this.chargeTime -= delta;
      if (this.chargeTime <= 0) {
        this.stopCharge();
      }
    }
  }
  
  /**
   * 更新攻击冷却
   */
  updateAttackCooldown(time) {
    // 攻击冷却逻辑已经在attackBehavior中通过delayedCall处理
    // 这里可以添加其他冷却相关的逻辑
  }
  
  /**
   * 开始冲锋
   */
  startCharge(player) {
    if (!player || !player.sprite) return;
    
    Logger.debug('WildBoar starting charge');
    
    // 计算朝向玩家的角度
    
    // 设置精灵朝向（冲锋时也要正确设置方向）
    const direction = player.sprite.x > this.sprite.x ? 1 : -1;
    this.sprite.setFlipX(direction < 0);
    // 设置冲锋速度\
    console.log(direction,this.chargeSpeed,999)
    this.sprite.setVelocityX( direction * this.chargeSpeed);
    
    // 设置冲锋状态
    this.isCharging = true;
    this.chargeTime = this.chargeDuration;
    this.setState(this.states.CHARGE);
    
    // 设置冲锋冷却
    this.canCharge = false;
    this.scene.time.delayedCall(this.chargeCooldownTime, () => {
      this.canCharge = true;
    });
    
    // 播放冲锋音效
    this.playSound('charge');
    
    // 触发事件
    EventBus.emit('enemy-charge-start', {
      enemy: this,
      target: player,
      type: 'wild_boar'
    });
  }
  
  /**
   * 停止冲锋
   */
  stopCharge() {
    if (!this.isCharging) return;
    
    Logger.debug('WildBoar stopping charge');
    
    this.isCharging = false;
    
    // 停止水平移动，保持重力对Y轴的影响
    this.sprite.body.setVelocityX(0);
    
    // 冲锋结束后短暂眩晕（如果还活着）
    if (this.health > 0 && this.currentState !== this.states.DIE) {
      this.setState(this.states.STUNNED);
      
      this.scene.time.delayedCall(this.chargeStunDuration, () => {
        if (this.health > 0 && this.currentState === this.states.STUNNED) {
          if (this.target) {
            this.setState(this.states.CHASE);
          } else {
            this.setState(this.states.IDLE);
          }
        }
      });
    }
    
    // 触发事件
    EventBus.emit('enemy-charge-stop', {
      enemy: this,
      type: 'wild_boar'
    });
  }
  
  /**
   * 攻击方法 - 重写父类方法
   */
  attack(player) {
    if (!player) return;
    
    Logger.debug('WildBoar attacking');
    
    // 设置攻击状态，动画由updateAnimationState统一处理
    this.setState(this.states.ATTACK);
    
    // 在攻击动画的关键帧执行攻击判定
    const timingConfig = EnemyConfigManager.getTimingConfig();
    this.scene.time.delayedCall(timingConfig.ATTACK_HIT_DELAY, () => {
      this.executeAttackHit(player);
    });
    
    // 播放攻击音效
    this.playSound('attack');
  }
  
  /**
   * 执行攻击命中判定
   */
  executeAttackHit(player) {
    const attackConfig = EnemyAnimationController.getEnhancedConfig(this.enemyType, 'attack');
    if (!attackConfig) return;
    
    const { hitbox, knockback } = attackConfig;
    
    // 计算攻击方向
    const direction = this.sprite.flipX ? -1 : 1;
    // 创建攻击区域
    const attackArea = new Phaser.Geom.Rectangle(
      this.sprite.x + (direction > 0 ? hitbox.offsetX : -hitbox.width - hitbox.offsetX),
      this.sprite.y + hitbox.offsetY,
      hitbox.width,
      hitbox.height
    );
      if (this.scene.physics && this.scene.physics.world.drawDebug) {
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0xff0000);
      graphics.strokeRectShape(attackArea);
      
      // 短暂显示后销毁
      const timingConfig = EnemyConfigManager.getTimingConfig();
      this.scene.time.delayedCall(timingConfig.DEBUG_DISPLAY_DURATION, () => {
        graphics.destroy();
      });
    }
    // 检查玩家碰撞框是否与攻击区域重叠
    if (player && player.sprite && player.sprite.body) {
      const playerBounds = new Phaser.Geom.Rectangle(
        player.sprite.body.x,
        player.sprite.body.y,
        player.sprite.body.width,
        player.sprite.body.height
      );
      
      if (Phaser.Geom.Rectangle.Overlaps(attackArea, playerBounds)) {
      
      // 造成伤害
      player.takeDamage(this.damage, 'physical', this.sprite);
      
      // 击退效果
      if (knockback) {
        const angle = Phaser.Math.Angle.Between(
          this.sprite.x, this.sprite.y,
          player.sprite.x, player.sprite.y
        );
        
        player.sprite.setVelocityX(Math.cos(angle) * knockback.force);
        player.sprite.setVelocityY(Math.sin(angle) * knockback.force);
      }
      
      Logger.debug(`WildBoar hit player for ${this.damage} damage`);
      }
    }
    
    // 调试显示攻击范围
    if (this.scene.physics && this.scene.physics.world.drawDebug) {
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0xff0000);
      graphics.strokeRectShape(attackArea);
      
      const timingConfig = EnemyConfigManager.getTimingConfig();
      this.scene.time.delayedCall(timingConfig.DEBUG_DISPLAY_DURATION, () => {
        graphics.destroy();
      });
    }
  }
  
  /**
   * 受伤方法 - 重写父类方法
   */
  takeDamage(amount, damageType = 'physical', attacker = null) {
    // 手动处理伤害计算，避免父类自动调用die()
    this.health -= amount;
    const actualDamage = amount;
    
    // 受伤闪烁效果
    const timingConfig = EnemyConfigManager.getTimingConfig();
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(timingConfig.HURT_FLASH_DURATION, () => {
      this.sprite.clearTint();
    });
    
    // 检查是否死亡
    if (this.health <= 0) {
      // 如果即将死亡，不播放受伤音效，避免与死亡音效重叠
      this.die();
    } else {
      // 只有在不会死亡时才播放受伤音效
      this.playSound('hurt');
      
      // 野猪受伤时可能会停止冲锋，但不进入眩晕状态
      // 降低冲锋中断概率，避免过早停止冲锋
      if (this.isCharging && Math.random() < 0.1) {
        this.isCharging = false;
        // 停止水平移动，保持重力对Y轴的影响
        this.sprite.body.setVelocityX(0);
        
        // 触发冲锋停止事件
        EventBus.emit('enemy-charge-stop', {
          enemy: this,
          type: 'wild_boar',
          reason: 'interrupted_by_damage'
        });
      }
      
      // 设置受伤状态
      this.setState(this.states.HURT);
      
      // 设置受伤状态持续时间
      const timingConfig = EnemyConfigManager.getTimingConfig();
      this.scene.time.delayedCall(timingConfig.HURT_RECOVERY_DURATION, () => {
        if (this.currentState === this.states.HURT && this.health > 0) {
          // 恢复到闲置状态，让updateState重新判断应该进入什么状态
          this.setState(this.states.IDLE);
        }
      });
    }
    
    return actualDamage;
  }
  
  /**
   * 死亡方法 - 重写父类方法
   */
  die() {
    Logger.debug('WildBoar dying');
    
    // 播放死亡音效
    this.playSound('die');
    
    // 设置死亡状态
    this.setState(this.states.DIE);
    
    // 停止水平移动，保持重力对Y轴的影响
    this.sprite.body.setVelocityX(0);
    
    // 播放死亡动画
    this.playAnimation('die', () => {
      // 死亡动画完成后的处理
      this.sprite.setTint(0x666666);
      this.sprite.setAlpha(0.7);
      
      // 禁用物理碰撞
      if (this.sprite.body) {
        this.sprite.body.enable = false;
      }
      
      // 淡出效果
      const timingConfig = EnemyConfigManager.getTimingConfig();
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: timingConfig.DEATH_FADE_DURATION,
        onComplete: () => {
          // 从对象池回收或销毁
          this.destroy();
        }
      });
    });
    
    // 触发死亡事件
    EventBus.emit('enemy-death', {
      enemy: this,
      type: 'wild_boar',
      position: { x: this.sprite.x, y: this.sprite.y },
      exp: this.exp
    });
    
    // 等待死亡动画播放完成后再执行父类死亡逻辑
    const timingConfig = EnemyConfigManager.getTimingConfig();
    this.scene.time.delayedCall(timingConfig.DEATH_ANIMATION_DURATION, () => {
      // 调用父类死亡方法
      super.die();
    });
  }
  
  /**
   * 设置状态
   */
  setState(newState) {
    // 如果新状态与当前状态相同，直接返回
    if (this.currentState === newState) {
      return;
    }
    
    // 检查状态转换是否有效
    if (EnemyAnimationController.isValidStateTransition(this.enemyType, this.currentState, newState)) {
      const oldState = this.currentState;
      this.currentState = newState;
      
      Logger.debug(`WildBoar state changed: ${oldState} -> ${newState}`);
      
      // 触发状态变化事件
      EventBus.emit('enemy-state-change', {
        enemy: this,
        oldState: oldState,
        newState: newState
      });
    } else {
      Logger.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
    }
  }
  
  /**
   * 重置对象池对象（新增方法）
   */
  resetForPool() {
    // 调用父类重置方法
    if (super.resetForPool) {
      super.resetForPool();
    }
    
    // 重置野猪特有属性
    this.chargeSpeed = this.originalChargeSpeed || 200;
    this.chargeDuration = 1000;
    this.chargeStartTime = 0;
    this.isCharging = false;
    this.canAttack = true;
    this.lastAttackTime = 0;
    
    // 重置巡逻点
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    
    // 停止所有音效
    this.stopAllSounds();
    
    // 清理动画
    EnemyAnimationController.stopAnimation(this.sprite, this.enemyType);
  }
  
  /**
   * 销毁方法
   */
  destroy() {
    // 停止所有音效
    this.stopAllSounds();
    
    // 清理动画
    EnemyAnimationController.stopAnimation(this.sprite, this.enemyType);
    
    // 调用父类销毁方法
    super.destroy();
    
    Logger.debug('WildBoar destroyed');
  }
}

export default WildBoar;