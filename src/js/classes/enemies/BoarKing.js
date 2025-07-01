/**
 * 猪王敌人类
 * 野猪森林的霸主，体型巨大，拥有锋利的獠牙和坚硬的皮肤
 */
import Enemy from '../Enemy.js';
import WildBoar from './WildBoar.js';
import EnemyConfig from '../../data/EnemyConfig.js';

class BoarKing extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, EnemyConfig.BOAR_KING.sprite, 0);
    
    // 从EnemyConfig获取猪王特有属性
    this.health = EnemyConfig.BOAR_KING.stats.health;
    this.maxHealth = EnemyConfig.BOAR_KING.stats.health;
    this.damage = EnemyConfig.BOAR_KING.stats.attack;
    this.defense = EnemyConfig.BOAR_KING.stats.defense;
    this.speed = EnemyConfig.BOAR_KING.stats.speed;
    this.exp = EnemyConfig.BOAR_KING.stats.exp;
    
    // 从EnemyConfig获取技能相关属性
    this.chargeSpeed = EnemyConfig.BOAR_KING.chargeSpeed;
    this.chargeDamage = EnemyConfig.BOAR_KING.chargeDamage;
    this.chargeCooldown = EnemyConfig.BOAR_KING.chargeCooldown * 1000; // 转换为毫秒
    this.canCharge = true;
    this.isCharging = false;
    
    this.quakeRadius = EnemyConfig.BOAR_KING.quakeRadius;
    this.quakeDamage = EnemyConfig.BOAR_KING.quakeDamage;
    this.quakeCooldown = EnemyConfig.BOAR_KING.quakeCooldown * 1000; // 转换为毫秒
    this.canQuake = true;
    
    this.summonType = EnemyConfig.BOAR_KING.summonType;
    this.summonCount = EnemyConfig.BOAR_KING.summonCount;
    this.summonCooldown = EnemyConfig.BOAR_KING.summonCooldown * 1000; // 转换为毫秒
    this.canSummon = true;
    
    // 从EnemyConfig获取阶段性行为属性
    this.phase = 1;
    this.phaseThreshold = EnemyConfig.BOAR_KING.phases[0].threshold; // 阶段转换阈值
    this.enrageThreshold = EnemyConfig.BOAR_KING.enrageThreshold; // 狂暴阈值
    this.isEnraged = false;
    
    // 从EnemyConfig获取抗性
    this.resistances = EnemyConfig.BOAR_KING.resistances;
    
    // 设置物理属性
    this.sprite.setBounce(0.1);
    this.sprite.setScale(1.8); // 猪王体型更大
    
    // 设置动画
    if (!scene.anims.exists(EnemyConfig.BOAR_KING.animations.idle)) {
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.idle,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.move,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 2, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.attack,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 6, end: 9 }),
        frameRate: 10,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.fierceCharge,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 10, end: 13 }),
        frameRate: 12,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.tuskSlash,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 14, end: 17 }),
        frameRate: 12,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.groundQuake,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 18, end: 22 }),
        frameRate: 10,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.summon,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 23, end: 26 }),
        frameRate: 8,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyConfig.BOAR_KING.animations.enrage,
        frames: scene.anims.generateFrameNumbers(EnemyConfig.BOAR_KING.sprite, { start: 27, end: 30 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // 播放默认动画
    this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.idle, true);
    
    // 设置行为模式
    this.behavior = EnemyConfig.BOAR_KING.behavior; // 从EnemyConfig获取行为模式
    this.detectionRange = EnemyConfig.BOAR_KING.detectionRadius;
    this.aggroRadius = EnemyConfig.BOAR_KING.aggroRadius;
    
    // 播放Boss音乐
    if (scene.game.gameManager && !scene.game.gameManager.isBossMusicPlaying) {
      scene.game.gameManager.playBossMusic(EnemyConfig.BOAR_KING.music);
    }
  }
  
  // 重写更新方法，添加猪王特有的行为
  update(time, delta, player) {
    super.update(time, delta, player);
    
    // 检查阶段转换
    this.checkPhaseTransition();
    
    // 更新动画
    if (!this.isCharging && !this.isQuaking && !this.isSummoning && !this.isSlashing) {
      if (this.currentState === this.states.IDLE) {
        this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.idle, true);
      } else if (this.currentState === this.states.PATROL || this.currentState === this.states.CHASE) {
        this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.move, true);
      }
    }
    
    // 猪王特有的技能选择逻辑
    if (this.currentState === this.states.CHASE || this.currentState === this.states.ATTACK) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      // 根据距离和冷却选择技能
      if (distance > this.attackRange && distance < 300 && this.canCharge && !this.isCharging) {
        this.fierceCharge(player);
      } else if (distance <= this.attackRange && this.canSlash && !this.isSlashing) {
        this.tuskSlash(player);
      } else if (distance <= this.quakeRadius && this.canQuake && !this.isQuaking && this.phase >= 2) {
        this.groundQuake(player);
      } else if (this.canSummon && !this.isSummoning && this.phase >= 2 && Math.random() < 0.01) {
        this.summonBoars();
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
  
  // 检查阶段转换
  checkPhaseTransition() {
    const healthPercentage = this.health / this.maxHealth;
    
    // 第二阶段
    if (healthPercentage <= this.phaseThreshold && this.phase === 1) {
      this.enterPhaseTwo();
    }
    
    // 狂暴状态
    if (healthPercentage <= this.enrageThreshold && !this.isEnraged) {
      this.enterEnragedState();
    }
  }
  
  // 进入第二阶段
  enterPhaseTwo() {
    this.phase = 2;
    
    // 播放过渡动画和音效
    this.sprite.setTint(0xff9900);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
    
    this.scene.sound.play('boar_king_enrage_sound');
    
    // 立即召唤野猪
    this.summonBoars();
    
    // 提高某些属性
    this.damage += 3;
    this.speed += 10;
    
    // 降低技能冷却
    this.quakeCooldown = 15000;
    this.chargeCooldown = 8000;
  }
  
  // 进入狂暴状态
  enterEnragedState() {
    this.isEnraged = true;
    
    // 播放狂暴动画
    this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.enrage, true);
    
    // 播放狂暴音效
    this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.enrage);
    
    // 相机震动效果
    this.scene.cameras.main.shake(1000, 0.02);
    
    // 应用狂暴状态加成
    this.damage *= 1.5;
    this.speed *= 1.3;
    this.defense *= 0.8;
    
    // 狂暴状态视觉效果
    this.sprite.setTint(0xff0000);
    
    // 降低所有技能冷却
    this.quakeCooldown = 10000;
    this.chargeCooldown = 5000;
    this.summonCooldown = 15000;
  }
  
  // 猪王的猛烈冲锋
  fierceCharge(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 计算朝向玩家的角度
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    // 设置冲锋速度
    this.sprite.setVelocityX(Math.cos(angle) * this.chargeSpeed);
    this.sprite.setVelocityY(Math.sin(angle) * this.chargeSpeed);
    
    // 播放冲锋动画
    this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.fierceCharge, true);
    
    // 播放冲锋音效
    this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.fierceCharge);
    
    // 设置冲锋状态
    this.isCharging = true;
    this.chargeTime = 2000; // 冲锋持续时间（毫秒）
    
    // 设置冲锋冷却
    this.canCharge = false;
    this.scene.time.delayedCall(this.chargeCooldown, () => {
      this.canCharge = true;
    });
    
    // 冲锋过程中检测碰撞
    this.chargeCollisionCheck = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.isCharging) {
          const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
          );
          
          if (distance <= this.attackRange * 1.5) {
            player.takeDamage(this.chargeDamage);
            
            // 强力击退效果
            const angle = Phaser.Math.Angle.Between(
              this.sprite.x, this.sprite.y,
              player.sprite.x, player.sprite.y
            );
            
            player.sprite.setVelocityX(Math.cos(angle) * 300);
            player.sprite.setVelocityY(Math.sin(angle) * 300);
            
            // 停止冲锋
            this.stopCharge();
          }
        }
      },
      repeat: 20
    });
  }
  
  // 停止冲锋
  stopCharge() {
    this.isCharging = false;
    if (this.chargeCollisionCheck) {
      this.chargeCollisionCheck.remove();
    }
  }
  
  // 獠牙斩击
  tuskSlash(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置斩击状态
    this.isSlashing = true;
    
    // 播放斩击动画
    this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.tuskSlash, true);
    
    // 播放斩击音效
    this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.tuskSlash);
    
    // 创建斩击效果
    const slashEffect = this.scene.add.sprite(
      this.sprite.x + (this.sprite.flipX ? -50 : 50),
      this.sprite.y,
      'slash_effect'
    );
    slashEffect.setScale(2);
    slashEffect.anims.play('slash_effect_anim');
    slashEffect.on('animationcomplete', () => {
      slashEffect.destroy();
    });
    
    // 对玩家造成伤害
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    if (distance <= this.attackRange * 1.5) {
      player.takeDamage(this.damage * 1.2);
      
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      player.sprite.setVelocityX(Math.cos(angle) * 200);
      player.sprite.setVelocityY(Math.sin(angle) * 200);
    }
    
    // 斩击结束后恢复状态
    this.scene.time.delayedCall(800, () => {
      this.isSlashing = false;
    });
    
    // 设置斩击冷却
    this.canSlash = false;
    this.scene.time.delayedCall(3000, () => {
      this.canSlash = true;
    });
  }
  
  // 地震技能
  groundQuake(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置地震状态
    this.isQuaking = true;
    
    // 播放地震动画
    this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.groundQuake, true);
    
    // 播放地震音效
    this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.groundQuake);
    
    // 相机震动效果
    this.scene.cameras.main.shake(1000, 0.03);
    
    // 创建地震效果
    const quakeEffect = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      this.quakeRadius,
      0xff6600,
      0.4
    );
    
    // 地震效果动画
    this.scene.tweens.add({
      targets: quakeEffect,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => {
        quakeEffect.destroy();
      }
    });
    
    // 对范围内的玩家造成伤害
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    if (distance <= this.quakeRadius) {
      player.takeDamage(this.quakeDamage);
      
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      player.sprite.setVelocityX(Math.cos(angle) * 250);
      player.sprite.setVelocityY(Math.sin(angle) * 250);
      
      // 尝试眩晕玩家
      if (player.stun) {
        player.stun(1500);
      }
    }
    
    // 地震结束后恢复状态
    this.scene.time.delayedCall(1000, () => {
      this.isQuaking = false;
    });
    
    // 设置地震冷却
    this.canQuake = false;
    this.scene.time.delayedCall(this.quakeCooldown, () => {
      this.canQuake = true;
    });
  }
  
  // 召唤野猪
  summonBoars() {
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置召唤状态
    this.isSummoning = true;
    
    // 播放召唤动画
    this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.summon, true);
    
    // 播放召唤音效
    this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.summon);
    
    // 创建召唤效果
    const summonEffect = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'summon_effect'
    );
    summonEffect.setScale(2);
    summonEffect.setAlpha(0.7);
    summonEffect.anims.play('summon_effect_anim');
    summonEffect.on('animationcomplete', () => {
      summonEffect.destroy();
    });
    
    // 召唤野猪
    this.scene.time.delayedCall(800, () => {
      for (let i = 0; i < this.summonCount; i++) {
        const offsetX = Phaser.Math.Between(-100, 100);
        const offsetY = Phaser.Math.Between(-100, 100);
        
        const boar = new WildBoar(
          this.scene,
          this.sprite.x + offsetX,
          this.sprite.y + offsetY
        );
        
        // 将野猪添加到敌人管理系统
        if (this.scene.enemySystem) {
          this.scene.enemySystem.addEnemy(boar);
        }
        
        // 召唤效果
        boar.sprite.setAlpha(0);
        this.scene.tweens.add({
          targets: boar.sprite,
          alpha: 1,
          duration: 500
        });
      }
    });
    
    // 召唤结束后恢复状态
    this.scene.time.delayedCall(1200, () => {
      this.isSummoning = false;
    });
    
    // 设置召唤冷却
    this.canSummon = false;
    this.scene.time.delayedCall(this.summonCooldown, () => {
      this.canSummon = true;
    });
  }
  
  // 重写攻击方法
  attack(player) {
    // 如果正在使用技能，不执行普通攻击
    if (this.isCharging || this.isQuaking || this.isSummoning || this.isSlashing) return;
    
    // 随机选择攻击方式
    const attackChoice = Math.random();
    
    if (attackChoice < 0.3 && this.canSlash) {
      this.tuskSlash(player);
    } else {
      // 普通攻击
      this.sprite.anims.play(EnemyConfig.BOAR_KING.animations.attack, true);
      
      // 播放攻击音效
      this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.attack);
      
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
  }
  
  // 重写受伤方法
  takeDamage(amount) {
    // 应用抗性
    let actualDamage = amount;
    if (this.resistances.physical) {
      actualDamage *= (1 - this.resistances.physical);
    }
    
    // 调用父类的受伤方法
    actualDamage = super.takeDamage(actualDamage);
    
    // 检查阶段转换
    this.checkPhaseTransition();
    
    // 猪王受伤时可能会停止当前技能
    if (this.isCharging && Math.random() < 0.1) {
      this.stopCharge();
    }
    
    // 猪王在低生命值时更具攻击性
    if (this.health < this.maxHealth * 0.5 && !this.isEnraged) {
      this.speed += 5;
    }
    
    return actualDamage;
  }
  
  // 重写死亡方法
  die() {
    // 猪王死亡时的特殊效果
    this.scene.sound.play(EnemyConfig.BOAR_KING.soundEffects.die);
    
    // 强烈的地面震动效果
    this.scene.cameras.main.shake(2000, 0.04);
    
    // 死亡爆炸效果
    for (let i = 0; i < 20; i++) {
      const particle = this.scene.add.sprite(
        this.sprite.x + Phaser.Math.Between(-50, 50),
        this.sprite.y + Phaser.Math.Between(-50, 50),
        'explosion_particle'
      );
      
      particle.setScale(Phaser.Math.FloatBetween(0.5, 1.5));
      
      // 粒子飞散效果
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-150, 150),
        y: particle.y + Phaser.Math.Between(-150, 150),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(800, 1500),
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // 停止Boss音乐
    if (this.scene.game.gameManager) {
      this.scene.game.gameManager.stopBossMusic();
    }
    
    // 调用父类的死亡方法
    super.die();
    
    // 通知游戏管理器Boss已被击败
    if (this.scene.game.gameManager) {
      this.scene.game.gameManager.handleBossDefeated('boar_king');
    }
  }
}

export default BoarKing;