/**
 * 黑暗法师敌人类
 * 精通黑魔法的法师，可以施放多种强大的法术
 */
import Enemy from '../Enemy.js';
import EnemyData from '../../data/EnemyData.js';

class DarkMage extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, EnemyData.DARK_MAGE.sprite, 0);
    
    // 从EnemyData获取黑暗法师特有属性
    this.health = EnemyData.DARK_MAGE.stats.health;
    this.maxHealth = EnemyData.DARK_MAGE.stats.health;
    this.damage = EnemyData.DARK_MAGE.stats.attack;
    this.defense = EnemyData.DARK_MAGE.stats.defense;
    this.magicAttack = EnemyData.DARK_MAGE.stats.magicAttack;
    this.magicDefense = EnemyData.DARK_MAGE.stats.magicDefense;
    this.speed = EnemyData.DARK_MAGE.stats.speed;
    this.exp = EnemyData.DARK_MAGE.stats.exp;
    
    // 从EnemyData获取技能相关属性
    this.attackRange = EnemyData.DARK_MAGE.attackRange; // 远程攻击范围
    this.shadowBoltDamage = this.magicAttack * 0.8; // 暗影箭伤害为魔法攻击的80%
    this.shadowBoltCooldown = 3000; // 暗影箭冷却时间（毫秒）
    this.canCastShadowBolt = true;
    
    this.teleportCooldown = 10000; // 传送冷却时间（毫秒）
    this.canTeleport = true;
    this.teleportThreshold = EnemyData.DARK_MAGE.teleportThreshold; // 生命值低于阈值时更容易传送
    
    this.summonCooldown = EnemyData.DARK_MAGE.summonCooldown * 1000; // 转换为毫秒
    this.canSummon = true;
    this.maxSummons = EnemyData.DARK_MAGE.maxSummons; // 最大召唤数量
    this.currentSummons = 0;
    
    this.darkShieldCooldown = 15000; // 黑暗护盾冷却时间（毫秒）
    this.canCastShield = true;
    this.shieldActive = false;
    
    // 设置物理属性
    this.sprite.setBounce(0);
    
    // 设置动画
    if (!scene.anims.exists(EnemyData.DARK_MAGE.animations.idle)) {
      scene.anims.create({
        key: EnemyData.DARK_MAGE.animations.idle,
        frames: scene.anims.generateFrameNumbers(EnemyData.DARK_MAGE.sprite, { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyData.DARK_MAGE.animations.move,
        frames: scene.anims.generateFrameNumbers(EnemyData.DARK_MAGE.sprite, { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyData.DARK_MAGE.animations.attack,
        frames: scene.anims.generateFrameNumbers(EnemyData.DARK_MAGE.sprite, { start: 8, end: 11 }),
        frameRate: 10,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyData.DARK_MAGE.animations.special,
        frames: scene.anims.generateFrameNumbers(EnemyData.DARK_MAGE.sprite, { start: 12, end: 16 }),
        frameRate: 8,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyData.DARK_MAGE.animations.teleport,
        frames: scene.anims.generateFrameNumbers(EnemyData.DARK_MAGE.sprite, { start: 17, end: 20 }),
        frameRate: 12,
        repeat: 0
      });
      
      scene.anims.create({
        key: 'dark_mage_shield',
        frames: scene.anims.generateFrameNumbers(EnemyData.DARK_MAGE.sprite, { start: 21, end: 24 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // 播放默认动画
    this.sprite.anims.play(EnemyData.DARK_MAGE.animations.idle, true);
    
    // 设置行为模式
    this.behavior = EnemyData.DARK_MAGE.behavior; // 从EnemyData获取行为模式
    this.detectionRange = EnemyData.DARK_MAGE.detectionRadius;
    this.aggroRadius = EnemyData.DARK_MAGE.aggroRadius;
  }
  
  // 重写更新方法，添加黑暗法师特有的行为
  update(time, delta, player) {
    super.update(time, delta, player);
    
    // 更新动画
    if (this.currentState === this.states.IDLE) {
      this.sprite.anims.play(EnemyData.DARK_MAGE.animations.idle, true);
    } else if (this.currentState === this.states.PATROL || this.currentState === this.states.CHASE) {
      if (!this.isCasting && !this.isTeleporting) {
        this.sprite.anims.play(EnemyData.DARK_MAGE.animations.move, true);
      }
    }
    
    // 黑暗法师特有的行为逻辑
    if (this.currentState === this.states.CHASE || this.currentState === this.states.ATTACK) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.x, player.y
      );
      
      // 如果生命值低，考虑使用护盾或传送
      if (this.health < this.maxHealth * 0.5) {
        if (this.canCastShield && !this.shieldActive) {
          this.castDarkShield();
        } else if (this.canTeleport && this.health < this.maxHealth * this.teleportThreshold && distance < 150) {
          this.teleport(player);
        }
      }
      
      // 在攻击范围内使用暗影箭
      if (distance <= this.attackRange && this.canCastShadowBolt) {
        this.castShadowBolt(player);
      }
      
      // 考虑召唤随从
      if (this.canSummon && this.currentSummons < this.maxSummons && Math.random() < 0.005) {
        this.summonMinion();
      }
    }
  }
  
  // 施放暗影箭
  castShadowBolt(player) {
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置施法状态
    this.isCasting = true;
    
    // 播放施法动画
    this.sprite.anims.play(EnemyData.DARK_MAGE.animations.attack, true);
    
    // 播放施法音效
    this.scene.sound.play(EnemyData.DARK_MAGE.sounds.attack);
    
    // 创建暗影箭投射物
    this.scene.time.delayedCall(400, () => {
      // 计算朝向玩家的角度
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.x, player.y
      );
      
      // 创建暗影箭精灵
      const shadowBolt = this.scene.physics.add.sprite(
        this.sprite.x,
        this.sprite.y,
        'shadow_bolt'
      );
      
      // 设置暗影箭属性
      shadowBolt.setVelocity(
        Math.cos(angle) * 300,
        Math.sin(angle) * 300
      );
      
      // 设置暗影箭旋转
      shadowBolt.rotation = angle;
      
      // 添加暗影箭动画
      shadowBolt.anims.play('shadow_bolt_anim');
      
      // 添加暗影箭与玩家的碰撞检测
      this.scene.physics.add.overlap(shadowBolt, player.sprite, () => {
        player.takeDamage(this.shadowBoltDamage);
        shadowBolt.destroy();
      });
      
      // 暗影箭生命周期
      this.scene.time.delayedCall(2000, () => {
        if (shadowBolt.active) {
          shadowBolt.destroy();
        }
      });
    });
    
    // 施法结束后恢复状态
    this.scene.time.delayedCall(600, () => {
      this.isCasting = false;
    });
    
    // 设置暗影箭冷却
    this.canCastShadowBolt = false;
    this.scene.time.delayedCall(this.shadowBoltCooldown, () => {
      this.canCastShadowBolt = true;
    });
  }
  
  // 传送技能
  teleport(player) {
    // 设置传送状态
    this.isTeleporting = true;
    
    // 播放传送动画
    this.sprite.anims.play(EnemyData.DARK_MAGE.animations.teleport, true);
    
    // 播放传送音效
    this.scene.sound.play(EnemyData.DARK_MAGE.sounds.teleport);
    
    // 创建传送效果
    const teleportEffect = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'teleport_effect'
    );
    teleportEffect.anims.play('teleport_effect_anim');
    teleportEffect.on('animationcomplete', () => {
      teleportEffect.destroy();
    });
    
    // 淡出效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 300
    });
    
    // 计算传送位置
    this.scene.time.delayedCall(300, () => {
      // 获取远离玩家的方向
      const angle = Phaser.Math.Angle.Between(
        player.x, player.y,
        this.sprite.x, this.sprite.y
      );
      
      // 计算新位置（远离玩家）
      const distance = Phaser.Math.Between(200, 300);
      const newX = this.sprite.x + Math.cos(angle) * distance;
      const newY = this.sprite.y + Math.sin(angle) * distance;
      
      // 确保新位置在游戏区域内
      const boundedX = Phaser.Math.Clamp(newX, 50, this.scene.physics.world.bounds.width - 50);
      const boundedY = Phaser.Math.Clamp(newY, 50, this.scene.physics.world.bounds.height - 50);
      
      // 传送到新位置
      this.sprite.x = boundedX;
      this.sprite.y = boundedY;
      
      // 创建到达效果
      const arrivalEffect = this.scene.add.sprite(
        this.sprite.x,
        this.sprite.y,
        'teleport_effect'
      );
      arrivalEffect.anims.play('teleport_effect_anim');
      arrivalEffect.on('animationcomplete', () => {
        arrivalEffect.destroy();
      });
      
      // 淡入效果
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 1,
        duration: 300
      });
    });
    
    // 传送结束后恢复状态
    this.scene.time.delayedCall(800, () => {
      this.isTeleporting = false;
    });
    
    // 设置传送冷却
    this.canTeleport = false;
    this.scene.time.delayedCall(this.teleportCooldown, () => {
      this.canTeleport = true;
    });
  }
  
  // 召唤随从
  summonMinion() {
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置召唤状态
    this.isSummoning = true;
    
    // 播放召唤动画
    this.sprite.anims.play(EnemyData.DARK_MAGE.animations.special, true);
    
    // 播放召唤音效
    this.scene.sound.play(EnemyData.DARK_MAGE.sounds.special);
    
    // 创建召唤效果
    const summonEffect = this.scene.add.sprite(
      this.sprite.x + Phaser.Math.Between(-50, 50),
      this.sprite.y + Phaser.Math.Between(-50, 50),
      'summon_effect'
    );
    summonEffect.anims.play('summon_effect_anim');
    summonEffect.on('animationcomplete', () => {
      summonEffect.destroy();
    });
    
    // 召唤骷髅随从
    this.scene.time.delayedCall(800, () => {
      // 这里应该创建一个骷髅敌人，但由于我们还没有实现Skeleton类，所以只是增加计数
      this.currentSummons++;
      
      // 如果有骷髅类，可以这样创建
      // const skeleton = new Skeleton(
      //   this.scene,
      //   this.sprite.x + Phaser.Math.Between(-50, 50),
      //   this.sprite.y + Phaser.Math.Between(-50, 50)
      // );
      // 
      // // 将骷髅添加到敌人管理系统
      // if (this.scene.enemySystem) {
      //   this.scene.enemySystem.addEnemy(skeleton);
      // }
    });
    
    // 召唤结束后恢复状态
    this.scene.time.delayedCall(1000, () => {
      this.isSummoning = false;
    });
    
    // 设置召唤冷却
    this.canSummon = false;
    this.scene.time.delayedCall(this.summonCooldown, () => {
      this.canSummon = true;
    });
  }
  
  // 施放黑暗护盾
  castDarkShield() {
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置施法状态
    this.isCasting = true;
    
    // 播放护盾动画
    this.sprite.anims.play('dark_mage_shield', true);
    
    // 播放护盾音效
    this.scene.sound.play(EnemyData.DARK_MAGE.sounds.shield);
    
    // 创建护盾效果
    const shieldEffect = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'shield_effect'
    );
    shieldEffect.setScale(1.5);
    shieldEffect.setAlpha(0.7);
    shieldEffect.anims.play('shield_effect_anim');
    
    // 激活护盾
    this.shieldActive = true;
    
    // 护盾持续时间
    this.scene.time.delayedCall(8000, () => {
      this.shieldActive = false;
      
      // 护盾消失效果
      this.scene.tweens.add({
        targets: shieldEffect,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          shieldEffect.destroy();
        }
      });
    });
    
    // 施法结束后恢复状态
    this.scene.time.delayedCall(800, () => {
      this.isCasting = false;
    });
    
    // 设置护盾冷却
    this.canCastShield = false;
    this.scene.time.delayedCall(this.darkShieldCooldown, () => {
      this.canCastShield = true;
    });
  }
  
  // 重写攻击方法
  attack(player) {
    // 如果正在施法或传送，不执行攻击
    if (this.isCasting || this.isTeleporting || this.isSummoning) return;
    
    // 黑暗法师优先使用暗影箭
    if (this.canCastShadowBolt) {
      this.castShadowBolt(player);
    } else {
      // 如果暗影箭在冷却中，尝试拉开距离
      const angle = Phaser.Math.Angle.Between(
        player.x, player.y,
        this.sprite.x, this.sprite.y
      );
      
      this.sprite.setVelocityX(Math.cos(angle) * this.speed * 0.7);
      this.sprite.setVelocityY(Math.sin(angle) * this.speed * 0.7);
    }
  }
  
  // 重写受伤方法
  takeDamage(amount) {
    // 如果护盾激活，减少伤害
    let actualDamage = amount;
    if (this.shieldActive) {
      actualDamage *= 0.5; // 护盾减免50%伤害
    }
    
    // 调用父类的受伤方法
    actualDamage = super.takeDamage(actualDamage);
    
    // 黑暗法师在低生命值时更容易传送
    if (this.health < this.maxHealth * this.teleportThreshold && this.canTeleport && Math.random() < 0.3) {
      this.teleport(this.scene.player);
    }
    
    return actualDamage;
  }
  
  // 重写死亡方法
  die() {
    // 黑暗法师死亡时的特殊效果
    this.scene.sound.play(EnemyData.DARK_MAGE.sounds.die);
    
    // 黑暗能量爆发效果
    const explosionEffect = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'dark_explosion'
    );
    explosionEffect.setScale(2);
    explosionEffect.anims.play('dark_explosion_anim');
    explosionEffect.on('animationcomplete', () => {
      explosionEffect.destroy();
    });
    
    // 调用父类的死亡方法
    super.die();
  }
}

export default DarkMage;