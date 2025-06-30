/**
 * 神秘人敌人类
 * 一个身着黑衣、戴着墨镜的神秘人，似乎拥有强大的力量
 */
import Enemy from '../Enemy.js';
import EnemyData from '../../data/EnemyData.js';

class MysteriousStranger extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, EnemyData.MYSTERIOUS_STRANGER.sprite, 0);
    
    // 神秘人特有属性
    this.health = EnemyData.MYSTERIOUS_STRANGER.stats.health;
    this.maxHealth = EnemyData.MYSTERIOUS_STRANGER.stats.health;
    this.damage = EnemyData.MYSTERIOUS_STRANGER.stats.damage;
    this.defense = EnemyData.MYSTERIOUS_STRANGER.stats.defense;
    this.magicAttack = EnemyData.MYSTERIOUS_STRANGER.stats.magicAttack;
    this.magicDefense = EnemyData.MYSTERIOUS_STRANGER.stats.magicDefense;
    this.speed = EnemyData.MYSTERIOUS_STRANGER.stats.speed;
    this.exp = EnemyData.MYSTERIOUS_STRANGER.stats.exp;
    
    // 职业属性
    this.characterClass = EnemyData.MYSTERIOUS_STRANGER.class;
    this.awakened = true;
    
    // 技能相关
    this.heavyStrikeDamage = EnemyData.MYSTERIOUS_STRANGER.heavyStrikeDamage;
    this.heavyStrikeCooldown = EnemyData.MYSTERIOUS_STRANGER.heavyStrikeCooldown * 1000; // 转换为毫秒
    this.canHeavyStrike = true;
    
    this.shadowSlashDamage = EnemyData.MYSTERIOUS_STRANGER.shadowSlashDamage;
    this.shadowSlashRange = EnemyData.MYSTERIOUS_STRANGER.shadowSlashRange;
    this.shadowSlashCooldown = EnemyData.MYSTERIOUS_STRANGER.shadowSlashCooldown * 1000; // 转换为毫秒
    this.canShadowSlash = true;
    
    this.battleCryRadius = EnemyData.MYSTERIOUS_STRANGER.battleCryRadius;
    this.battleCryCooldown = EnemyData.MYSTERIOUS_STRANGER.battleCryCooldown * 1000; // 转换为毫秒
    this.canBattleCry = true;
    
    // 阶段性行为
    this.phase = 1;
    this.phaseThreshold = EnemyData.MYSTERIOUS_STRANGER.phaseThreshold; // 生命值阈值进入第二阶段
    this.isAwakened = false;
    
    // 抗性
    this.resistances = EnemyData.MYSTERIOUS_STRANGER.resistances;
    
    // 设置物理属性
    this.sprite.setBounce(0.1);
    
    // 设置动画
    if (!scene.anims.exists(EnemyData.MYSTERIOUS_STRANGER.animations.idle)) {
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.idle,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.move,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 4, end: 9 }),
        frameRate: 10,
        repeat: -1
      });
      
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.attack,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 10, end: 14 }),
        frameRate: 12,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.heavyStrike,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 15, end: 20 }),
        frameRate: 10,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.shadowSlash,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 21, end: 26 }),
        frameRate: 12,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.battleCry,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 27, end: 30 }),
        frameRate: 8,
        repeat: 0
      });
      
      scene.anims.create({
        key: EnemyData.MYSTERIOUS_STRANGER.animations.awakening,
        frames: scene.anims.generateFrameNumbers(EnemyData.MYSTERIOUS_STRANGER.sprite, { start: 31, end: 36 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    // 播放默认动画
    this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.idle, true);
    
    // 设置行为模式
    this.behavior = EnemyData.MYSTERIOUS_STRANGER.behavior; // 从EnemyData获取行为模式
    this.detectionRange = EnemyData.MYSTERIOUS_STRANGER.detectionRadius;
    this.aggroRadius = EnemyData.MYSTERIOUS_STRANGER.aggroRadius;
    this.attackRange = EnemyData.MYSTERIOUS_STRANGER.attackRange; // 近战攻击范围
    
    // 剧情对话
    this.dialogues = {
      encounter: "你不该来这里，勇士！",
      awakening: "现在，感受真正的力量吧！",
      victory: "你还太弱小...去寻找真正的力量吧..."
    };
    
    // 播放Boss音乐
    if (scene.game.gameManager && !scene.game.gameManager.isBossMusicPlaying) {
      scene.game.gameManager.playBossMusic(EnemyData.MYSTERIOUS_STRANGER.bossMusic);
    }
    
    // 初始对话
    this.showDialogue(this.dialogues.encounter);
  }
  
  // 显示对话
  showDialogue(text) {
    if (this.scene.game.gameManager) {
      this.scene.game.gameManager.showBossDialogue(text, 'mysterious_stranger');
    }
  }
  
  // 重写更新方法，添加神秘人特有的行为
  update(time, delta, player) {
    super.update(time, delta, player);
    
    // 检查阶段转换
    this.checkPhaseTransition();
    
    // 更新动画
    if (!this.isUsingSkill()) {
      if (this.currentState === this.states.IDLE) {
        this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.idle, true);
      } else if (this.currentState === this.states.PATROL || this.currentState === this.states.CHASE) {
        this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.move, true);
      }
    }
    
    // 神秘人特有的技能选择逻辑
    if (this.currentState === this.states.CHASE || this.currentState === this.states.ATTACK) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      // 根据距离和冷却选择技能
      if (distance <= this.attackRange) {
        // 近战范围内
        if (this.canHeavyStrike && Math.random() < 0.2) {
          this.heavyStrike(player);
        }
      } else if (distance <= this.shadowSlashRange) {
        // 暗影斩范围内
        if (this.canShadowSlash && Math.random() < 0.3) {
          this.shadowSlash(player);
        }
      }
      
      // 考虑使用战吼
      if (this.canBattleCry && distance <= this.battleCryRadius && Math.random() < 0.1) {
        this.battleCry(player);
      }
    }
  }
  
  // 检查是否正在使用技能
  isUsingSkill() {
    return this.isHeavyStriking || this.isShadowSlashing || this.isBattleCrying || this.isAwakening;
  }
  
  // 检查阶段转换
  checkPhaseTransition() {
    const healthPercentage = this.health / this.maxHealth;
    
    // 第二阶段 - 觉醒
    if (healthPercentage <= this.phaseThreshold && this.phase === 1 && !this.isAwakened) {
      this.awaken();
    }
  }
  
  // 觉醒能力
  awaken() {
    // 设置阶段
    this.phase = 2;
    this.isAwakened = true;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置觉醒状态
    this.isAwakening = true;
    
    // 播放觉醒动画
    this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.awakening, true);
    
    // 播放觉醒音效
    this.scene.sound.play(EnemyData.MYSTERIOUS_STRANGER.sounds.awakening);
    
    // 显示觉醒对话
    this.showDialogue(this.dialogues.awakening);
    
    // 相机震动效果
    this.scene.cameras.main.shake(1000, 0.02);
    
    // 创建觉醒效果
    const awakeningEffect = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'awakening_effect'
    );
    awakeningEffect.setScale(2);
    awakeningEffect.setAlpha(0.8);
    awakeningEffect.anims.play('awakening_effect_anim');
    awakeningEffect.on('animationcomplete', () => {
      awakeningEffect.destroy();
    });
    
    // 觉醒结束后提升属性
    this.scene.time.delayedCall(1500, () => {
      // 提升属性
      this.damage *= 1.5;
      this.speed *= 1.2;
      this.defense *= 1.3;
      
      // 降低技能冷却
      this.heavyStrikeCooldown = 6000;
      this.shadowSlashCooldown = 8000;
      this.battleCryCooldown = 10000;
      
      // 恢复一些生命值
      this.health = Math.min(this.maxHealth * 0.6, this.health + this.maxHealth * 0.1);
      
      // 觉醒视觉效果
      this.sprite.setTint(0x9900ff);
      
      // 结束觉醒状态
      this.isAwakening = false;
    });
  }
  
  // 重击技能
  heavyStrike(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置重击状态
    this.isHeavyStriking = true;
    
    // 播放重击动画
    this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.heavyStrike, true);
    
    // 播放重击音效
    this.scene.sound.play(EnemyData.MYSTERIOUS_STRANGER.sounds.heavyStrike);
    
    // 对玩家造成伤害
    this.scene.time.delayedCall(500, () => {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      if (distance <= this.attackRange * 1.2) {
        player.takeDamage(this.heavyStrikeDamage);
        
        // 强力击退效果
        const angle = Phaser.Math.Angle.Between(
          this.sprite.x, this.sprite.y,
          player.sprite.x, player.sprite.y
        );
        
        player.sprite.setVelocityX(Math.cos(angle) * 300);
        player.sprite.setVelocityY(Math.sin(angle) * 300);
        
        // 尝试眩晕玩家
        if (player.stun) {
          player.stun(1000);
        }
      }
    });
    
    // 重击结束后恢复状态
    this.scene.time.delayedCall(800, () => {
      this.isHeavyStriking = false;
    });
    
    // 设置重击冷却
    this.canHeavyStrike = false;
    this.scene.time.delayedCall(this.heavyStrikeCooldown, () => {
      this.canHeavyStrike = true;
    });
  }
  
  // 暗影斩技能
  shadowSlash(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置暗影斩状态
    this.isShadowSlashing = true;
    
    // 播放暗影斩动画
    this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.shadowSlash, true);
    
    // 播放暗影斩音效
    this.scene.sound.play(EnemyData.MYSTERIOUS_STRANGER.sounds.shadowSlash);
    
    // 创建暗影斩效果
    this.scene.time.delayedCall(300, () => {
      // 计算朝向玩家的角度
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        player.sprite.x, player.sprite.y
      );
      
      // 创建暗影斩效果
      const slashEffect = this.scene.add.sprite(
        this.sprite.x + Math.cos(angle) * 50,
        this.sprite.y + Math.sin(angle) * 50,
        'shadow_slash_effect'
      );
      slashEffect.setScale(1.5);
      slashEffect.rotation = angle;
      slashEffect.anims.play('shadow_slash_effect_anim');
      slashEffect.on('animationcomplete', () => {
        slashEffect.destroy();
      });
      
      // 快速移动到玩家位置
      this.scene.tweens.add({
        targets: this.sprite,
        x: player.sprite.x - Math.cos(angle) * 50,
        y: player.sprite.y - Math.sin(angle) * 50,
        duration: 200,
        onComplete: () => {
          // 对玩家造成伤害
          player.takeDamage(this.shadowSlashDamage);
          
          // 击退效果
          player.sprite.setVelocityX(Math.cos(angle) * 200);
          player.sprite.setVelocityY(Math.sin(angle) * 200);
        }
      });
    });
    
    // 暗影斩结束后恢复状态
    this.scene.time.delayedCall(800, () => {
      this.isShadowSlashing = false;
    });
    
    // 设置暗影斩冷却
    this.canShadowSlash = false;
    this.scene.time.delayedCall(this.shadowSlashCooldown, () => {
      this.canShadowSlash = true;
    });
  }
  
  // 战吼技能
  battleCry(player) {
    // 检查玩家对象是否存在
    if (!player || !player.sprite) return;
    
    // 停止移动
    this.sprite.setVelocity(0);
    
    // 设置战吼状态
    this.isBattleCrying = true;
    
    // 播放战吼动画
    this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.battleCry, true);
    
    // 播放战吼音效
    this.scene.sound.play(EnemyData.MYSTERIOUS_STRANGER.sounds.battleCry);
    
    // 创建战吼效果
    const cryEffect = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      this.battleCryRadius,
      0xffaa00,
      0.3
    );
    
    // 战吼效果动画
    this.scene.tweens.add({
      targets: cryEffect,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        cryEffect.destroy();
      }
    });
    
    // 相机震动效果
    this.scene.cameras.main.shake(500, 0.01);
    
    // 临时提升自身属性
    this.damage *= 1.2;
    this.speed *= 1.2;
    
    // 属性提升持续时间
    this.scene.time.delayedCall(5000, () => {
      this.damage /= 1.2;
      this.speed /= 1.2;
    });
    
    // 对范围内的玩家造成效果
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    if (distance <= this.battleCryRadius) {
      // 尝试恐惧玩家（如果玩家有此机制）
      if (player.applyFear) {
        player.applyFear(2000);
      }
      
      // 降低玩家属性（如果玩家有此机制）
      if (player.applyDebuff) {
        player.applyDebuff('attack', 0.8, 5000); // 降低20%攻击力，持续5秒
      }
    }
    
    // 战吼结束后恢复状态
    this.scene.time.delayedCall(600, () => {
      this.isBattleCrying = false;
    });
    
    // 设置战吼冷却
    this.canBattleCry = false;
    this.scene.time.delayedCall(this.battleCryCooldown, () => {
      this.canBattleCry = true;
    });
  }
  
  // 重写攻击方法
  attack(player) {
    // 如果正在使用技能，不执行普通攻击
    if (this.isUsingSkill()) return;
    
    // 播放攻击动画
    this.sprite.anims.play(EnemyData.MYSTERIOUS_STRANGER.animations.attack, true);
    
    // 播放攻击音效
    this.scene.sound.play(EnemyData.MYSTERIOUS_STRANGER.sounds.attack);
    
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
      
      player.sprite.setVelocityX(Math.cos(angle) * 150);
      player.sprite.setVelocityY(Math.sin(angle) * 150);
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
    
    return actualDamage;
  }
  
  // 重写死亡方法
  die() {
    // 神秘人死亡时的特殊效果
    this.scene.sound.play(EnemyData.MYSTERIOUS_STRANGER.sounds.die);
    
    // 显示胜利对话
    this.showDialogue(this.dialogues.victory);
    
    // 相机震动效果
    this.scene.cameras.main.shake(1000, 0.02);
    
    // 死亡特效
    const deathEffect = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'mysterious_death_effect'
    );
    deathEffect.setScale(2);
    deathEffect.anims.play('mysterious_death_effect_anim');
    deathEffect.on('animationcomplete', () => {
      deathEffect.destroy();
    });
    
    // 停止Boss音乐
    if (this.scene.game.gameManager) {
      this.scene.game.gameManager.stopBossMusic();
    }
    
    // 调用父类的死亡方法
    super.die();
    
    // 通知游戏管理器Boss已被击败
    if (this.scene.game.gameManager) {
      this.scene.game.gameManager.handleBossDefeated('mysterious_stranger');
    }
  }
}

export default MysteriousStranger;