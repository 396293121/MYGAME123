/**
 * 神秘人BOSS类
 * 战士第一章的人型BOSS，具有CHARACTER属性和觉醒功能
 * 血量低于50%时会觉醒并剧情杀玩家
 */
import Enemy from './Enemy.js';

class MysteriousStranger extends Enemy {
  constructor(scene, x, y) {
    // 使用神秘人的默认纹理
    super(scene, x, y, 'mysterious_stranger', 0);
    
    // 设置为BOSS类型
    this.isBoss = true;
    
    // 设置CHARACTER属性
    this.characterClass = 'warrior'; // 战士职业属性
    
    // 基础属性增强
    this.health = 300;
    this.maxHealth = 300;
    this.damage = 20;
    this.attackRange = 70;
    this.detectionRange = 300;
    this.speed = 100;
    this.exp = 200;
    
    // 觉醒相关
    this.awakened = false;
    this.awakeningThreshold = 0.5; // 50%血量触发觉醒
    
    // 战斗属性
    this.stats = {
      physicalAttack: 25,
      magicAttack: 10,
      physicalDefense: 15,
      magicDefense: 10,
      speed: 100
    };
    
    // 抗性
    this.resistances = {
      physical: 0.2, // 物理伤害减免20%
      fire: 0.1,
      ice: 0.1
    };
    
    // 攻击冷却时间
    this.attackCooldown = 2000; // 2秒
    this.specialAttackCooldown = 5000; // 5秒
    this.canSpecialAttack = true;
    
    // 对话内容
    this.dialogues = {
      encounter: "你不该来这里，勇士！",
      awakening: "现在，感受真正的力量吧！",
      victory: "你还太弱小...去寻找真正的力量吧..."
    };
    
    // 设置动画
    if (scene.anims) {
      // 确保动画已经加载
      if (!scene.anims.exists('mysterious_stranger_idle')) {
        scene.anims.create({
          key: 'mysterious_stranger_idle',
          frames: scene.anims.generateFrameNumbers('mysterious_stranger', { start: 0, end: 3 }),
          frameRate: 8,
          repeat: -1
        });
      }
      
      if (!scene.anims.exists('mysterious_stranger_attack')) {
        scene.anims.create({
          key: 'mysterious_stranger_attack',
          frames: scene.anims.generateFrameNumbers('mysterious_stranger', { start: 4, end: 7 }),
          frameRate: 10,
          repeat: 0
        });
      }
      
      if (!scene.anims.exists('mysterious_stranger_special')) {
        scene.anims.create({
          key: 'mysterious_stranger_special',
          frames: scene.anims.generateFrameNumbers('mysterious_stranger', { start: 8, end: 12 }),
          frameRate: 10,
          repeat: 0
        });
      }
      
      if (!scene.anims.exists('mysterious_stranger_awakening')) {
        scene.anims.create({
          key: 'mysterious_stranger_awakening',
          frames: scene.anims.generateFrameNumbers('mysterious_stranger', { start: 13, end: 18 }),
          frameRate: 8,
          repeat: 0
        });
      }
    }
  }
  
  // 重写更新方法
  update(time, delta, player) {
    // 检查是否需要觉醒
    if (!this.awakened && this.health <= this.maxHealth * this.awakeningThreshold) {
      this.awaken();
    }
    
    // 调用父类的update方法
    super.update(time, delta, player);
  }
  
  // 重写攻击方法
  attack(player) {
    // 如果已觉醒，使用增强攻击
    if (this.awakened) {
      this.specialAttack(player);
      return;
    }
    
    // 播放攻击动画
    this.sprite.anims.play('mysterious_stranger_attack', true);
    
    // 计算与玩家的距离
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    // 如果在攻击范围内，对玩家造成伤害
    if (distance <= this.attackRange) {
      player.takeDamage(this.damage, 'physical');
      console.log(`神秘人对玩家造成了${this.damage}点伤害`);
    }
    
    // 随机决定是否使用特殊攻击
    if (this.canSpecialAttack && Math.random() < 0.3) {
      this.specialAttack(player);
    }
  }
  
  // 特殊攻击
  specialAttack(player) {
    if (!this.canSpecialAttack) return;
    
    // 播放特殊攻击动画
    this.sprite.anims.play('mysterious_stranger_special', true);
    
    // 设置特殊攻击冷却
    this.canSpecialAttack = false;
    this.scene.time.delayedCall(this.specialAttackCooldown, () => {
      this.canSpecialAttack = true;
    });
    
    // 计算与玩家的距离
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      player.sprite.x, player.sprite.y
    );
    
    // 如果在特殊攻击范围内，对玩家造成伤害
    if (distance <= this.attackRange * 1.5) {
      const specialDamage = this.awakened ? this.damage * 2 : this.damage * 1.5;
      player.takeDamage(specialDamage, 'physical');
      console.log(`神秘人对玩家造成了${specialDamage}点特殊攻击伤害`);
      
      // 如果已觉醒且玩家生命值低于一定值，触发剧情杀
      if (this.awakened && player.health < player.maxHealth * 0.3) {
        this.defeatPlayer(player);
      }
    }
  }
  
  // 觉醒方法
  awaken() {
    this.awakened = true;
    console.log('神秘人进入觉醒状态！');
    
    // 播放觉醒动画
    this.sprite.anims.play('mysterious_stranger_awakening', true);
    
    // 显示觉醒对话
    if (this.scene.dialogueSystem) {
      this.scene.dialogueSystem.showBossDialogue(this.dialogues.awakening);
    }
    
    // 增强属性
    this.damage *= 1.8;
    this.speed *= 1.5;
    this.attackCooldown = 1500; // 减少攻击冷却时间
    
    // 增强衍生属性
    this.stats.physicalAttack *= 1.8;
    this.stats.magicAttack *= 1.5;
    this.stats.physicalDefense *= 1.3;
    this.stats.magicDefense *= 1.3;
    this.stats.speed *= 1.5;
    
    // 视觉效果
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(500, () => {
      this.sprite.clearTint();
    });
    
    // 震动效果
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(500, 0.01);
    }
  }
  
  // 剧情杀玩家
  defeatPlayer(player) {
    // 停止所有动作
    this.sprite.setVelocity(0);
    player.sprite.setVelocity(0);
    
    // 显示胜利对话
    if (this.scene.dialogueSystem) {
      this.scene.dialogueSystem.showBossDialogue(this.dialogues.victory);
    }
    
    // 执行最终攻击动画
    this.sprite.anims.play('mysterious_stranger_special', true);
    
    // 延迟一段时间后击败玩家
    this.scene.time.delayedCall(2000, () => {
      // 对玩家造成致命伤害
      player.health = 1;
      player.takeDamage(10, 'physical');
      
      // 延迟后切换到失败场景或触发剧情
      this.scene.time.delayedCall(3000, () => {
        // 触发剧情过场或切换到下一个场景
        if (this.scene.game.gameManager) {
          const gameManager = this.scene.game.gameManager;
          
          // 使用游戏标志来标记玩家被神秘人击败的事件
          gameManager.setGameFlag('warrior_ch1_defeated_by_stranger', true);
          
          // 更新任务进度 - 使用正确的目标ID
          if (gameManager.questSystem) {
            // 更新战斗目标进度
            gameManager.questSystem.updateObjective('fight_intruder', 1);
            
            // 设置任务标记，表示玩家已被击败
            gameManager.questSystem.setQuestFlag('warrior_ch1_defeated', true);
          }
          
          // 显示对话提示玩家需要寻找觉醒的力量
          if (gameManager.dialogueSystem) {
            // 创建一个临时NPC对象用于对话
            const npcData = {
              id: 'mysterious_stranger',
              name: '神秘人'
            };
            
            // 开始对话
            gameManager.startDialogue(npcData, 'victory', () => {
              // 对话结束后，切换到下一个任务场景
              gameManager.changeLocation('tribal_village');
            });
          }
        }
      });
    });
  }
  
  // 重写受伤方法
  takeDamage(amount) {
    // 应用抗性
    let reducedAmount = amount;
    if (this.resistances.physical) {
      reducedAmount *= (1 - this.resistances.physical);
    }
    
    // 调用父类的takeDamage方法
    const actualDamage = super.takeDamage(reducedAmount);
    
    // 检查是否需要觉醒
    if (!this.awakened && this.health <= this.maxHealth * this.awakeningThreshold) {
      this.awaken();
    }
    
    return actualDamage;
  }
  
  // 重写死亡方法
  die() {
    // 神秘人不会真正死亡，而是在血量低时触发剧情
    if (this.health <= 0) {
      this.health = 1; // 保持1点血量
      
      // 如果尚未觉醒，强制觉醒
      if (!this.awakened) {
        this.awaken();
      }
      
      // 触发剧情杀玩家
      const player = this.scene.player;
      if (player) {
        this.defeatPlayer(player);
      }
    }
  }

}

export default MysteriousStranger;