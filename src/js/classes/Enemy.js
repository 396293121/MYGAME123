/**
 * 敌人基类
 * 所有敌人类型的基础类
 */
class Enemy {
  constructor(scene, x, y, texture, frame) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture, frame);
    
    // 基础属性
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 10;
    this.attackRange = 50;
    this.detectionRange = 200;
    this.speed = 50;
    this.exp = 20; // 击败后给予的经验值
    
    // AI状态
    this.states = {
      IDLE: 'idle',
      PATROL: 'patrol',
      CHASE: 'chase',
      ATTACK: 'attack',
      STUNNED: 'stunned',
      DEAD: 'dead'
    };
    this.currentState = this.states.IDLE;
    
    // 巡逻相关
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.patrolWaitTime = 2000; // 巡逻点等待时间（毫秒）
    this.lastPatrolWait = 0;
    
    // 攻击相关
    this.canAttack = true;
    this.attackCooldown = 1500; // 攻击冷却时间（毫秒）
    
    // 物理属性设置
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.1);
    this.sprite.setImmovable(false);
    
  }
  
  // 更新敌人状态
  update(time, delta, player) {
    if (this.currentState === this.states.DEAD) return;
    
    // 如果玩家对象存在，计算距离并更新AI行为
    if (player && player.sprite) {
      // 计算与玩家的距离
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
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
    
    // 根据与玩家的距离决定状态
    if (distance <= this.attackRange) {
      this.currentState = this.states.ATTACK;
    } else if (distance <= this.detectionRange) {
      this.currentState = this.states.CHASE;
    } else if (this.patrolPoints.length > 0) {
      this.currentState = this.states.PATROL;
    } else {
      this.currentState = this.states.IDLE;
    }
  }
  
  // 闲置行为
  idleBehavior(time) {
    // 闲置状态下，敌人停止移动
    this.sprite.setVelocity(0);
    
    // 随机决定是否开始巡逻
    if (this.patrolPoints.length > 0 && Math.random() < 0.005) {
      this.currentState = this.states.PATROL;
    }
  }
  
  // 巡逻行为
  patrolBehavior(time) {
    // 如果没有巡逻点，返回闲置状态
    if (this.patrolPoints.length === 0) {
      this.currentState = this.states.IDLE;
      return;
    }
    
    const currentPoint = this.patrolPoints[this.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      currentPoint.x, currentPoint.y
    );
    
    // 如果到达巡逻点
    if (distance < 10) {
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
      // 移动到当前巡逻点
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        currentPoint.x, currentPoint.y
      );
      
      this.sprite.setVelocityX(Math.cos(angle) * this.speed);
      this.sprite.setVelocityY(Math.sin(angle) * this.speed);
      
      // 设置朝向
      this.sprite.flipX = this.sprite.body.velocity.x < 0;
    }
  }
  
  // 追逐行为
  chaseBehavior(player) {
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
    
    // 计算与玩家的距离
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    // 如果在攻击范围内，对玩家造成伤害
    if (distance <= this.attackRange) {
      player.takeDamage(this.damage);
    }
  }
  
  // 受伤方法
  takeDamage(amount) {
    this.health -= amount;
    
    // 受伤闪烁效果
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
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
    this.currentState = this.states.DEAD;
    
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
      duration: 1000,
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
}

export default Enemy;