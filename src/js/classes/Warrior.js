/**
 * 战士职业类
 * 高攻高物防但低速较低魔防，使用近战攻击，武器类型为剑
 */
import Character from './Character.js';
import { getCharacterConfig } from '../data/CharacterConfig.js';
import ANIMATION_CONFIGS from '../data/AnimationConfig.js';

class Warrior extends Character {
  constructor(scene, x, y) {
    // 使用战士的默认纹理
    super(scene, x, y, 'warrior', 0);
    
    // 从配置文件获取战士配置
    const config = getCharacterConfig('warrior');
    if (!config) {
      console.error('Warrior config not found, using default values');
      return;
    }
    
    // 使用配置文件中的属性
    this.attributes = { ...config.attributes };
    
    // 更新衍生属性
    this.updateStats();
    
    // 使用配置文件中的职业特性
    this.weaponType = config.weaponType;
    this.attackRange = config.attackRange;
    
    // 使用配置文件中的技能
    this.classSkills = { ...config.classSkills };
    
    // 初始化技能冷却状态
    this.skillCooldowns = {};
    Object.keys(this.classSkills).forEach(skillKey => {
      this.skillCooldowns[skillKey] = 0;
    });
    
    console.log('Warrior created with enhanced combat abilities');
  }
  
  // 重写更新衍生属性方法，强化战士的物理攻击和防御
  updateStats() {
    super.updateStats();
    
    // 战士的物理攻击和防御加成更高
    this.stats.physicalAttack += this.attributes.strength * 0.5;
    this.stats.physicalDefense += this.attributes.vitality * 0.5;
    
    // 战士的魔法防御较低
    this.stats.magicDefense -= 2;
    
    // 战士的速度较慢
    this.stats.speed -= 10;
  }
  
  // 重写攻击方法
  attack() {
    console.log('Warrior performs a sword slash!');
    
    // 调用父类的攻击方法，指定为单体攻击
    const attackInfo = super.attack('single');
    
    // 战士的攻击伤害略高
    if (attackInfo) {
      attackInfo.damage = this.stats.physicalAttack * 1.1;
    }
    
    // 这里可以添加战士特有的攻击动画和效果
    // 例如，创建一个剑光效果
    if (this.scene) {
      const direction = this.sprite.flipX ? -1 : 1;
      // 如果有剑光效果的精灵图，可以在这里添加
      // const effect = this.scene.add.sprite(
      //   this.sprite.x + (direction * 30),
      //   this.sprite.y,
      //   'sword_effect',
      //   0
      // );
      // effect.setFlipX(direction < 0);
      // 
      // // 播放攻击动画并在结束后销毁
      // this.scene.time.delayedCall(300, () => {
      //   effect.destroy();
      // });
    }
    
    return attackInfo;
  }
  
  // 设置攻击冷却
  startAttackCooldown() {
    this.canAttack = false;
    // 使用配置文件中的攻击冷却时间，默认500ms
    const cooldownTime = this.attackCooldown || 500;
    this.scene.time.delayedCall(cooldownTime, () => {
      this.canAttack = true;
    });
  }
  
  // 战士特有技能 - 重斩
  heavySlash() {
    // 检查是否在地面上
    if (!this.sprite.body.onFloor()) {
      console.log('Cannot use Heavy Slash in the air');
      return false;
    }
    
    if (!this.useSkill('heavy_slash')) {
      return false;
    }
    
    console.log('Warrior performs Heavy Slash!');
    
    // 从配置文件获取关键帧信息
    const keyFrameNumber = ANIMATION_CONFIGS?.warrior?.enhancedAnimation?.heavy_slash?.keyFrame?.frameNumber || 
                          Math.floor(30 * 0.5); // 默认值：30帧的50%
    
    // 播放重斩动画
    this.playAnimation('heavy_slash', (frameIndex, totalFrames) => {
      // 在配置的关键帧处触发攻击判定
      if (frameIndex >= keyFrameNumber) {
        this.performAttack(this.classSkills.HEAVY_SLASH.damage);
      }
    });
    
    return true;
  }
  
  // 战士特有技能 - 旋风斩
  whirlwind() {
    // 检查是否在地面上
    if (!this.sprite.body.onFloor()) {
      console.log('Cannot use Whirlwind in the air');
      return false;
    }
    
    if (!this.useSkill('whirlwind')) {
      return false;
    }
    
    console.log('Warrior performs Whirlwind!');
    
    // 从配置文件获取关键帧信息
    const keyFrameNumber = ANIMATION_CONFIGS?.warrior?.enhancedAnimation?.whirlwind?.keyFrame?.frameNumber || 
                          Math.floor(28 * 0.5); // 默认值：28帧的50%
    
    // 播放旋风斩动画
    this.playAnimation('whirlwind', (frameIndex, totalFrames) => {
      // 在配置的关键帧处触发攻击判定
      if (frameIndex >= keyFrameNumber) {
        // 获取旋风斩攻击范围
        const whirlwindRange = this.classSkills.WHIRLWIND.attackArea;
        this.performAreaAttack(this.classSkills.WHIRLWIND.damage, whirlwindRange);
      }
    });
    
    return true;
  }
  
  // 战士特有技能 - 战吼
  battleCry() {
    // 检查是否在地面上
    if (!this.sprite.body.onFloor()) {
      console.log('Cannot use Battle Cry in the air');
      return false;
    }
    
    if (!this.useSkill('battle_cry')) {
      return false;
    }
    
    console.log('Warrior performs Battle Cry!');
    
    // 从配置文件获取关键帧信息
    const keyFrameNumber = ANIMATION_CONFIGS?.warrior?.enhancedAnimation?.battle_cry?.keyFrame?.frameNumber || 
                          Math.floor(27 * 0.5); // 默认值：27帧的50%
    
    // 播放战吼动画
    this.playAnimation('battle_cry', (frameIndex, totalFrames) => {
      // 在配置的关键帧处触发效果
      if (frameIndex >= keyFrameNumber) {
        this.applyBattleCryEffect();
      }
    });
    
    return true;
  }

    /**
     * 应用战吼效果
     */
    applyBattleCryEffect() {
        // 从配置文件获取战吼效果参数
        const battleCryConfig = this.classSkills.BATTLE_CRY;
        const buffMultiplier = battleCryConfig.buffMultiplier || 1.2;
        const duration = battleCryConfig.duration || 10000;
        
        // 提高攻击力
        const originalAttack = this.stats.physicalAttack;
        this.stats.physicalAttack *= buffMultiplier;
        
        console.log(`Battle Cry effect applied! Attack increased by ${(buffMultiplier - 1) * 100}%`);
        
        // 持续时间后恢复
        setTimeout(() => {
            this.stats.physicalAttack = originalAttack;
            console.log('Battle Cry effect ended');
        }, duration);
        
        // 震慑周围敌人（可选效果）
        const stunRange = battleCryConfig.stunRange || { width: 200, height: 100, offsetX: -100, offsetY: -50 };
        const stunDuration = battleCryConfig.stunDuration || 2000;
        
        const battleCryRange = {
            x: this.sprite.x + stunRange.offsetX,
            y: this.sprite.y + stunRange.offsetY,
            width: stunRange.width,
            height: stunRange.height
        };
        
        // 发送战吼事件给敌人系统
        window.eventBus.emit('playerBattleCry', {
            attacker: this,
            area: battleCryRange,
            effect: 'stun',
            duration: stunDuration
        });
    }
}

export default Warrior;