/**
 * 大型野猪敌人类
 * 体型更大、更加凶猛的野猪，通常是野猪群的领袖
 */
import Enemy from '../Enemy.js';
import EnemyConfig from '../../data/EnemyConfig.js';

class LargeBoar extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, EnemyConfig.LARGE_BOAR.sprite, 0);
    
    // 从EnemyConfig获取大型野猪特有属性
    this.health = EnemyConfig.LARGE_BOAR.stats.health;
    this.maxHealth = EnemyConfig.LARGE_BOAR.stats.health;
    this.damage = EnemyConfig.LARGE_BOAR.stats.attack;
    this.defense = EnemyConfig.LARGE_BOAR.stats.defense;
    this.speed = EnemyConfig.LARGE_BOAR.stats.speed;
    this.exp = EnemyConfig.LARGE_BOAR.stats.exp;
    
    // 从EnemyConfig设置检测和攻击范围
    this.detectionRange = EnemyConfig.LARGE_BOAR.detectionRadius || 200;
    this.attackRange = EnemyConfig.LARGE_BOAR.attackRange || 60;
    
    // 从EnemyConfig获取冲锋相关属性
    this.chargeSpeed = EnemyConfig.LARGE_BOAR.chargeSpeed;
    this.chargeCooldown = EnemyConfig.LARGE_BOAR.chargeCooldown * 1000; // 转换为毫秒
    this.canCharge = true;
    this.isCharging = false;
    this.chargeDistance = 250; // 冲锋距离
    
    // 从EnemyConfig获取践踏技能相关属性
    this.stompRadius = EnemyConfig.LARGE_BOAR.stompRadius;
    this.stompDamage = this.damage * 1.25; // 践踏伤害为基础伤害的1.25倍
    this.stompCooldown = EnemyConfig.LARGE_BOAR.stompCooldown * 1000; // 转换为毫秒
    this.canStomp = true;
    
    // 设置物理属性
    this.sprite.setBounce(0.1);
    this.sprite.setScale(1.3); // 大型野猪体型更大
    
    // 设置动画
    if (!scene.anims.exists(EnemyConfig.LARGE_BOAR.animations.idle)) {
      scene.anims.create({
        key: EnemyConfig.LARGE_BOAR.animations.idle,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.LARGE_BOAR.sprite, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyConfig.LARGE_BOAR.animations.move,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.LARGE_BOAR.sprite, { start: 2, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyConfig.LARGE_BOAR.animations.attack,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.LARGE_BOAR.sprite, { start: 6, end: 8 }),
        frameRate: 10,
        repeat: 0
      });
      
      scene.anims.create({
        key: 'large_boar_charge',
        frames: scene.anims.generateFrameNumbers(EnemyConfig.LARGE_BOAR.sprite, { start: 9, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyConfig.LARGE_BOAR.animations.special,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.LARGE_BOAR.sprite, { start: 12, end: 15 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // 播放默认动画
    this.sprite.anims.play(EnemyConfig.LARGE_BOAR.animations.idle, true);
    
    // 设置行为模式
    this.behavior = EnemyConfig.LARGE_BOAR.behavior; // 从EnemyConfig获取行为模式
    this.detectionRange = EnemyConfig.LARGE_BOAR.detectionRadius;
    this.aggroRadius = EnemyConfig.LARGE_BOAR.aggroRadius;
  }
  
  // 重写更新方法，添加大型野猪特有的行为
  update(time, delta, player) {
    super.update(time, delta, player);
    
    // 更新动画
    if (this.currentState === this.states.IDLE) {
      this.sprite.anims.play(EnemyConfig.LARGE_BOAR.animations.idle, true);
    } else if (this.currentState === this.states.PATROL || this.currentState === this.states.CHASE) {
      if (!this.isCharging && !this.isStomping) {
        this.sprite.anims.play(EnemyConfig.LARGE_BOAR.animations.move, true);
      }
    }
    
    // 大型野猪特有的冲锋行为
    if (this.currentState === this.states.CHASE && this.canCharge && !this.isCharging && !this.isStomping) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      if (distance < this.chargeDistance && distance > this.attackRange) {
        this.charge(player);
      }
    }
    
    // 大型野猪特有的践踏行为
    if (this.currentState === this.states.ATTACK && this.canStomp && !this.isStomping && !this.isCharging) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      if (distance <= this.stompRadius && Math.random() < 0.3) {
        this.groundStomp(player);
      }
    }
    
    // 如果正在冲锋，检查是否需要停止
    if (this.isCharging) {
      this.chargeTime -= delta;
      if (this.chargeTime <= 0) {
        this.stopCharge();
      }
    }
  }
  
  // 大型野猪的冲锋行为
  charge(player) {
    // 计算朝向玩家的角度
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    // 设置冲锋速度
    this.sprite.setVelocityX(Math.cos(angle) * this.chargeSpeed);
    this.sprite.setVelocityY(Math.sin(angle) * this.chargeSpeed);
    
    // 播放冲锋动画
    this.sprite.anims.play('large_boar_charge', true);
    
    // 播放冲锋音效
    this.scene.sound.play(EnemyConfig.LARGE_BOAR.soundEffects.attack);
    
    // 设置冲锋状态
    this.isCharging = true;
    this.chargeTime = 1500; // 冲锋持续时间（毫秒）
    
    // 设置冲锋冷却
    this.canCharge = false;
    this.scene.time.delayedCall(this.chargeCooldown, () => {
      this.canCharge = true;
    });
  }
  
  // 停止冲锋
  stopCharge() {
    this.isCharging = false;
  }
  
  // 大型野猪的践踏技能
  groundStomp(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 播放践踏动画
    this.sprite.anims.play(EnemyConfig.LARGE_BOAR.animations.special, true);
    
    // 播放践踏音效
    this.scene.sound.play(EnemyConfig.LARGE_BOAR.soundEffects.special);
    
    // 设置践踏状态
    this.isStomping = true;
    
    // 创建践踏效果
    const stompEffect = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      this.stompRadius,
      0xff0000,
      0.3
    );
    
    // 践踏效果动画
    this.scene.tweens.add({
      targets: stompEffect,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        stompEffect.destroy();
      }
    });
    
    // 对范围内的玩家造成伤害
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    if (distance <= this.stompRadius) {
      player.takeDamage(this.stompDamage);
      
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      player.sprite.setVelocityX(Math.cos(angle) * 200);
      player.sprite.setVelocityY(Math.sin(angle) * 200);
      
      // 尝试眩晕玩家
      if (player.stun && Math.random() < 0.5) {
        player.stun(1000);
      }
    }
    
    // 践踏结束后恢复状态
    this.scene.time.delayedCall(800, () => {
      this.isStomping = false;
    });
    
    // 设置践踏冷却
    this.canStomp = false;
    this.scene.time.delayedCall(this.stompCooldown, () => {
      this.canStomp = true;
    });
  }
  
  // 重写攻击方法
  attack(player) {
    // 如果正在践踏或冲锋，不执行普通攻击
    if (this.isStomping || this.isCharging) return;
    
    // 播放攻击动画
    this.sprite.anims.play(EnemyConfig.LARGE_BOAR.animations.attack, true);
    
    // 如果与玩家接触，造成伤害
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    if (distance <= this.attackRange) {
      player.takeDamage(this.damage);
      
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      player.sprite.setVelocityX(Math.cos(angle) * 180);
      player.sprite.setVelocityY(Math.sin(angle) * 180);
    }
  }
  
  // 重写受伤方法
  takeDamage(amount) {
    const actualDamage = super.takeDamage(amount);
    
    // 大型野猪受伤时可能会停止冲锋，但不进入眩晕状态
    if (this.isCharging && Math.random() < 0.2) {
      this.isCharging = false;
      this.sprite.setVelocity(0);
    }
    
    // 大型野猪在低生命值时更容易使用践踏技能
    if (this.health < this.maxHealth * 0.3) {
      this.stompCooldown = 10000; // 降低践踏冷却时间
    }
    
    return actualDamage;
  }
  
  // 重写死亡方法
  die() {
    // 大型野猪死亡时的特殊效果
    this.scene.sound.play(EnemyConfig.LARGE_BOAR.soundEffects.die);
    
    // 地面震动效果
    this.scene.cameras.main.shake(500, 0.01);
    
    // 调用父类的死亡方法
    super.die();
  }
}

export default LargeBoar;