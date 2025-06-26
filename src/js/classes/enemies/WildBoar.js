/**
 * 野猪敌人类
 * 铁山村附近常见的野猪，性情暴躁
 */
import Enemy from '../Enemy.js';
import EnemyData from '../../data/EnemyData.js';

class WildBoar extends Enemy {
  constructor(scene, x, y) {
    // 获取野猪数据
    const data = EnemyData.WILD_BOAR;
    
    super(scene, x, y, data.sprite, 0);
    
    // 从EnemyData设置基础属性
    this.health = data.stats.health;
    this.maxHealth = data.stats.health;
    this.damage = data.stats.attack;
    this.defense = data.stats.defense;
    this.speed = data.stats.speed;
    this.exp = data.stats.exp;
    
    // 从EnemyData设置冲锋相关属性
    this.chargeSpeed = data.chargeSpeed;
    this.chargeCooldown = data.chargeCooldown * 1000; // 转换为毫秒
    this.canCharge = true;
    this.isCharging = false;
    this.chargeDistance = 200; // 冲锋距离
    
    // 设置物理属性
    this.sprite.setBounce(0.1);
    
    // 设置动画
    if (!scene.anims.exists(data.animations.idle)) {
      scene.anims.create({
        key: data.animations.idle,
        frames: scene.anims.generateFrameNumbers(data.sprite, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
      
      scene.anims.create({
        key: data.animations.move,
        frames: scene.anims.generateFrameNumbers(data.sprite, { start: 2, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
      
      scene.anims.create({
        key: data.animations.attack,
        frames: scene.anims.generateFrameNumbers(data.sprite, { start: 6, end: 8 }),
        frameRate: 10,
        repeat: 0
      });
      
      scene.anims.create({
        key: 'wild_boar_charge',
        frames: scene.anims.generateFrameNumbers(data.sprite, { start: 9, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
    }
    
    // 播放默认动画
    this.sprite.anims.play(data.animations.idle, true);
    
    // 设置行为模式
    this.behavior = data.behavior;
    this.detectionRange = data.detectionRadius;
    this.aggroRadius = data.aggroRadius;
  }
  
  // 重写更新方法，添加野猪特有的行为
  update(time, delta, player) {
    super.update(time, delta, player);
    
    // 获取动画数据
    const data = EnemyData.WILD_BOAR;
    
    // 更新动画
    if (this.currentState === this.states.IDLE) {
      this.sprite.anims.play(data.animations.idle, true);
    } else if (this.currentState === this.states.PATROL || this.currentState === this.states.CHASE) {
      if (!this.isCharging) {
        this.sprite.anims.play(data.animations.move, true);
      }
    }
    
    // 野猪特有的冲锋行为
    if (this.currentState === this.states.CHASE && this.canCharge && !this.isCharging) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.x, player.y
      );
      
      if (distance < this.chargeDistance && distance > this.attackRange) {
        this.charge(player);
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
  
  // 野猪的冲锋行为
  charge(player) {
    // 计算朝向玩家的角度
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      player.x, player.y
    );
    
    // 设置冲锋速度
    this.sprite.setVelocityX(Math.cos(angle) * this.chargeSpeed);
    this.sprite.setVelocityY(Math.sin(angle) * this.chargeSpeed);
    
    // 播放冲锋动画
    this.sprite.anims.play('wild_boar_charge', true);
    
    // 设置冲锋状态
    this.isCharging = true;
    this.chargeTime = 1000; // 冲锋持续时间（毫秒）
    
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
  
  // 重写攻击方法
  attack(player) {
    // 播放攻击动画
    this.sprite.anims.play(EnemyData.WILD_BOAR.animations.attack, true);
    
    // 如果与玩家接触，造成伤害
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.x, player.y
    );
    
    if (distance <= this.attackRange) {
      player.takeDamage(this.damage);
      
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.x, player.y
      );
      
      player.sprite.setVelocityX(Math.cos(angle) * 150);
      player.sprite.setVelocityY(Math.sin(angle) * 150);
    }
  }
  
  // 重写受伤方法
  takeDamage(amount) {
    const actualDamage = super.takeDamage(amount);
    
    // 野猪受伤时可能会停止冲锋
    if (this.isCharging && Math.random() < 0.3) {
      this.stopCharge();
    }
    
    return actualDamage;
  }
  
  // 重写死亡方法
  die() {
    // 野猪死亡时的特殊效果
    this.scene.sound.play(EnemyData.WILD_BOAR.soundEffects.die);
    
    // 调用父类的死亡方法
    super.die();
  }
}

export default WildBoar;