
import { ANIMATION_CONFIGS } from '../data/AnimationConfig.js';
import EnhancedAnimationManager from '../systems/EnhancedAnimationManager.js';
import { AudioManager } from '../data/AudioConfig.js';

/**
 * 角色基类
 * 所有职业角色的基础类
 */
class Character {
  constructor(scene, x, y, texture, frame) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture, frame);
    
    // 基础属性
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100;
    this.maxHealth = 100;
    this.health = 100;
    this.mana = 50;
    this.maxMana = 50;
    
    // 核心属性
    this.attributes = {
      strength: 5,     // 力量，影响物理攻击
      agility: 5,      // 敏捷，影响移动速度和闪避
      vitality: 5,     // 体力，影响生命值
      intelligence: 5  // 智力，影响魔法攻击和魔法值
    };
    
    // 衍生属性
    this.stats = {
      physicalAttack: 10,   // 物理攻击力
      magicAttack: 5,       // 魔法攻击力
      physicalDefense: 5,   // 物理防御力
      magicDefense: 5,      // 魔法防御力
      speed: 100,           // 移动速度
      jumpForce: 800        // 跳跃力
    };
    
    // 技能和升级
    this.skillPoints = 0;
    this.unlockedSkills = [];
    
    // 攻击冷却系统
    this.canAttack = true;
    this.attackCooldown = 500; // 攻击冷却时间（毫秒）
    
    // 设置物理属性
    this.sprite.setCollideWorldBounds(true);
    
    // 动画状态
    this.state = 'idle';
    
    // 保存原始纹理键，用于特殊动画完成后恢复
    this.originalTextureKey = texture;
    
    // 确定角色类型
    this.characterType = this.determineCharacterType(texture);
    
    // 初始化动画管理器
    this.animationManager = new EnhancedAnimationManager(this.scene, this.sprite, this.characterType);
    
    // 初始化音效管理器
    this.audioManager = new AudioManager(this.scene);
    
    // 在sprite上添加character引用，供动画管理器访问
    this.sprite.character = this;
    
    // 应用标准化配置（尺寸和锚点）
    this.animationManager.applyStandardSize(this.sprite, this.characterType);
    
    // 设置物理体大小以匹配角色尺寸
    this.setupPhysicsBody();
    
    // 创建角色动画
    this.createAnimations();
  }
  
  // 更新角色状态
  update(cursors) {
    if (!cursors) return;
    
    // 处理移动
    this.handleMovement(cursors);
    
    // 处理跳跃
    this.handleJump(cursors);
    
    // 更新跳跃动画状态
    this.updateJumpAnimationState();
  }
  
  /**
   * 更新跳跃动画状态
   * 在游戏循环中调用，根据垂直速度自动切换跳跃动画
   */
  updateJumpAnimationState() {
    if (this.animationManager && !this.sprite.body.onFloor()) {
      this.animationManager.updateJumpAnimationState(this.sprite, this.characterType);
    }
  }
  
  // 处理角色移动
  handleMovement(cursors) {
    // 基于敏捷属性计算实际移动速度
    const moveSpeed = this.stats.speed;
    
    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-moveSpeed);
      // 只有在非攻击状态下才改变方向
      if (this.state !== 'attack') {
        this.sprite.flipX = true;
      }else{
        console.log(11111)
      }
      
      // 如果角色在地面上且不在攻击状态，播放移动动画
      if (this.sprite.body.onFloor() && this.state !== 'attack' && this.state !== 'hurt' && this.state !== 'die') {
        this.playAnimation('move');
      }
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(moveSpeed);
      // 只有在非攻击状态下才改变方向
      if (this.state !== 'attack') {
        this.sprite.flipX = false;
      }
      
      // 如果角色在地面上且不在攻击状态，播放移动动画
      if (this.sprite.body.onFloor() && this.state !== 'attack' && this.state !== 'hurt' && this.state !== 'die') {
        this.playAnimation('move');
      }
    } else {
      this.sprite.setVelocityX(0);
      
      // 如果角色在地面上且不在特殊状态，播放站立动画
      if (this.sprite.body.onFloor() && this.state !== 'attack' && this.state !== 'hurt' && this.state !== 'die') {
        this.playAnimation('idle');
      }
    }

  }
  
  // 处理角色跳跃
  handleJump(cursors) {
    if (cursors.up.isDown && this.sprite.body.onFloor()) {
      this.sprite.setVelocityY(-this.stats.jumpForce);
      // 播放跳跃音效
      this.audioManager.playCharacterSound(this.characterType, 'movement', 'jump');
      
      // 播放跳跃动画
      this.playAnimation('jump');
    }
    
    // 如果角色在空中（不在地面上），播放跳跃动画
    if (!this.sprite.body.onFloor() && this.state !== 'jump' && this.state !== 'attack' && this.state !== 'hurt' && this.state !== 'die') {
      this.playAnimation('jump');
    }
  }
  
  // 经验值和升级
  addExp(amount) {
    this.experience += amount;
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    this.skillPoints += 3;
    
    // 每级增加基础属性
    this.attributes.strength += 1;
    this.attributes.agility += 1;
    this.attributes.vitality += 1;
    this.attributes.intelligence += 1;
    
    // 更新衍生属性
    this.updateStats();
    
    // 恢复生命值和魔法值
    this.health = this.maxHealth;
    this.mana = this.maxMana;
  }
  
  // 更新衍生属性
  updateStats() {
    // 基础更新逻辑，子类可以重写此方法
    this.stats.physicalAttack = 5 + (this.attributes.strength * 2);
    this.stats.magicAttack = 5 + (this.attributes.intelligence * 2);
    this.stats.physicalDefense = 5 + (this.attributes.vitality);
    this.stats.magicDefense = 5 + (this.attributes.intelligence);
    this.stats.speed = 100 + (this.attributes.agility * 5);
    
    // 更新最大生命值和魔法值
    this.maxHealth = 100 + (this.attributes.vitality * 10);
    this.maxMana = 50 + (this.attributes.intelligence * 5);
  }
  
  // 技能解锁
  unlockSkill(skillId) {
    if (this.skillPoints > 0 && !this.unlockedSkills.includes(skillId)) {
      this.unlockedSkills.push(skillId);
      this.skillPoints--;
      return true;
    }
    return false;
  }
  
  // 基础攻击方法
  attack() {
    // 如果在冷却中，不能攻击
    if (!this.canAttack) return null;
    
    // 设置攻击状态，锁定角色方向
    this.state = 'attack';
    
    // 基础攻击逻辑，子类可以重写
    console.log(`${this.constructor.name} performs a basic attack`);
    
    // 播放挥剑音效（攻击开始时）
    this.audioManager.playDelayedSound(this.characterType, 'attack', 'swing');
    
    // 播放攻击动画，并设置关键帧回调
    this.playAnimation('attack', (frameIndex, totalFrames) => {
      this.executeAttackHit();
      // 攻击动画结束后重置状态
      if (frameIndex === totalFrames - 1) {
        this.state = 'idle';
      }
    });
    
    // 开始攻击冷却
    this.startAttackCooldown();
    
    // 返回攻击启动信息（不包含具体攻击数据）
    return {
      initiated: true,
      attacker: this
    };
  }
  
  /**
   * 执行攻击命中判定（在关键帧触发）
   * 实时计算攻击方向
   */
  executeAttackHit() {
    // 从配置文件中读取攻击范围参数
    const config = ANIMATION_CONFIGS[this.characterType];
    const enhancedConfig = config?.enhancedAnimation?.attack;
    
    // 如果没有增强配置，使用默认值
    const attackWidth = enhancedConfig?.hitbox?.width || 74;
    const attackHeight = enhancedConfig?.hitbox?.height || 100;
    const offsetX = enhancedConfig?.hitbox?.offsetX || 0;
    const offsetY = enhancedConfig?.hitbox?.offsetY || -15;
    
    // 实时计算攻击方向
    const direction = this.sprite.flipX ? -1 : 1;

    const attackArea = new Phaser.Geom.Rectangle(
      this.sprite.x + (direction > 0 ? offsetX : -attackWidth), // 向左攻击时，从角色位置减去攻击宽度
      this.sprite.y - attackHeight + offsetY, // 调整Y坐标，使攻击框更好地对齐角色中心
      attackWidth, // 攻击宽度
      attackHeight
    );
    // 通过全局事件总线发布攻击命中事件
    if (window.eventBus) {
      window.eventBus.emit('playerAttackHit', {
        attacker: this,
        damage: this.stats.physicalAttack,
        area: attackArea,
        direction: direction,
        timestamp: Date.now()
      });
    }
    
    // 可选：显示攻击范围调试信息
    if (this.scene.physics && this.scene.physics.world.drawDebug) {
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0xff0000);
      graphics.strokeRectShape(attackArea);
      
      // 短暂显示后销毁
      this.scene.time.delayedCall(200, () => {
        graphics.destroy();
      });
    }
  }
  
  // 开始攻击冷却
  startAttackCooldown() {
    this.canAttack = false;
    this.scene.time.delayedCall(this.attackCooldown, () => {
      this.canAttack = true;
    });
  }
  
  // 受伤方法
  takeDamage(amount, damageType = 'physical', attacker = null) {
    // 如果角色处于无敌状态，则不受伤害
    if (this.isInvulnerable) return 0;
    
    let actualDamage = amount;
    
    // 根据伤害类型应用不同的防御
    if (damageType === 'physical') {
      actualDamage = Math.max(1, amount - this.stats.physicalDefense);
    } else if (damageType === 'magic') {
      actualDamage = Math.max(1, amount - this.stats.magicDefense);
    }
    
    this.health -= actualDamage;
    
    // 显示伤害数字
    if (this.scene) {
      const damageText = this.scene.add.text(this.sprite.x, this.sprite.y - 20, Math.floor(actualDamage).toString(), {
        fontSize: '16px',
        fill: '#ff0000'
      });
      
      this.scene.tweens.add({
        targets: damageText,
        y: this.sprite.y - 50,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          damageText.destroy();
        }
      });
    }
    
    // 受伤闪烁效果
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
    
    // 播放受伤动画和音效
    this.playAnimation('hurt');
    
    // 监听动画完成事件，完成后恢复到站立状态
    this.sprite.once('animationcomplete', (animation) => {
      if (animation.key.includes('_hurt')) {
        // 受伤动画完成后，如果角色在地面上，恢复到站立状态
        if (this.sprite.body.onFloor()) {
          this.playAnimation('idle');
        } else {
          // 如果在空中，恢复到跳跃状态
          this.playAnimation('jump');
        }
      }
    });
    
    // 击退效果
    if (attacker) {
      const knockbackDirection = this.sprite.x < attacker.x ? -1 : 1;
      // 只进行水平击退，不影响垂直速度
      this.sprite.setVelocityX(knockbackDirection * 200);
      
      // 短暂无敌时间
      this.isInvulnerable = true;
      this.sprite.alpha = 0.5;
      
      this.scene.time.delayedCall(1000, () => {
        this.isInvulnerable = false;
        this.sprite.alpha = 1;
      });
    }
    
    // 确保生命值不会低于0
    if (this.health < 0) {
      this.health = 0;
      this.die();
    }
    
    return actualDamage;
  }
  
  // 死亡方法（子类可重写）
  die() {
    console.log(`${this.constructor.name} has died`);
    // 基础死亡逻辑
    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.7);
    this.isDead = true;
    
    // 播放死亡动画和音效
    this.playAnimation('die');
    
    // 播放死亡音效
    if (this.scene && this.scene.sound) {
      this.scene.sound.play(`${this.characterType}_die`, { volume: 0.7 });
    }
    
    // 禁用物理碰撞
    if (this.sprite.body) {
      this.sprite.body.enable = false;
    }
    
    // 监听动画完成事件
    this.sprite.once('animationcomplete', (animation) => {
      if (animation.key.includes('_die')) {
        // 死亡动画完成后，保持最后一帧
        this.sprite.anims.pause(this.sprite.anims.currentAnim.frames[this.sprite.anims.currentAnim.frames.length - 1]);
      }
    });
    
    // 2秒后移除精灵
    this.scene.time.delayedCall(2000, () => {
      this.sprite.destroy();
    });
  }
  
  // 使用技能
  useSkill(skillId) {
    // 检查技能是否已解锁
    if (!this.unlockedSkills.includes(skillId)) {
      console.log(`Skill ${skillId} not unlocked`);
      return false;
    }
    
    // 获取技能信息
    const skill = Skills[skillId];
    if (!skill) {
      console.log(`Skill ${skillId} not found`);
      return false;
    }
    
    // 检查魔法值是否足够
    if (this.mana < skill.manaCost) {
      console.log('Not enough mana');
      return false;
    }
    
    // 使用魔法值
    this.mana -= skill.manaCost;
    
    // 执行技能效果（这里只是一个占位符，实际效果应该在子类中实现）
    console.log(`Using skill: ${skill.name}`);
    
    return true;
  }
  /**
   * 确定角色类型
   * @param {string} textureKey - 纹理键名
   * @returns {string} 角色类型
   */
  determineCharacterType(textureKey) {
    // 从纹理键名中提取角色类型
    if (textureKey.includes('warrior')) return 'warrior';
    if (textureKey.includes('mage')) return 'mage';
    if (textureKey.includes('archer')) return 'archer';
    
    // 默认返回纹理键名
    return textureKey;
  }

  /**
   * 创建角色动画
   * 使用增强动画管理器为角色创建各种状态的动画
   */
  createAnimations() {
    this.animationManager.createEnhancedAnimationsForCharacter(this.characterType);
  }

    
  /**
   * 播放指定动画
   * @param {string} animationKey - 动画键名后缀，如'idle', 'move', 'attack'等
   * @param {Function} onKeyFrame - 关键帧回调（用于攻击判定）
   */
  playAnimation(animationKey, onKeyFrame = null) {
    // 使用增强动画管理器播放动画
    const success = this.animationManager.playEnhancedAnimation(
      this.sprite,
      this.characterType,
      animationKey,
      this.originalTextureKey,
      () => this.onAnimationComplete(animationKey),
      onKeyFrame
    );
    
    if (success) {
      this.state = animationKey;
    }
  }
  
  /**
   * 动画完成回调
   * @param {string} animationKey - 完成的动画键名
   */
  onAnimationComplete(animationKey) {
    // 根据角色当前状态恢复相应动画
    if (this.sprite.body.onFloor()) {
      // 检查是否还在移动
      if (Math.abs(this.sprite.body.velocity.x) > 0) {
        this.playAnimation('move');
      } else {
        this.playAnimation('idle');
      }
    } else {
      this.playAnimation('jump');
    }
  }
    
  /**
   * 检查动画是否存在
   * @param {string} animationKey - 动画键名
   * @returns {boolean} 动画是否存在
   */
  hasAnimation(animationKey) {
    return this.animationManager.hasAnimation(this.characterType, animationKey);
  }
  
  /**
   * 检查是否为特殊动画
   * @param {string} animationKey - 动画键名
   * @returns {boolean} 是否为特殊动画
   */
  isSpecialAnimation(animationKey) {
    return this.animationManager.isSpecialAnimation(this.characterType, animationKey);
  }
  
  /**
   * 销毁角色时清理动画管理器
   */
  destroy() {
    if (this.animationManager) {
      // 清理精灵的动画状态
      this.animationManager.clearSpriteState(this.sprite);
      this.animationManager.destroy();
    }
    
    if (this.sprite) {
      this.sprite.destroy();
    }
  }

  /**
   * 设置物理体大小和位置
   * 使用配置化的物理体参数，确保碰撞框与实际角色尺寸匹配
   * 简化版本：角色左右对称，不需要复杂的翻转处理
   */
  setupPhysicsBody() {
    if (this.sprite && this.sprite.body) {
      // 从动画配置中获取物理体配置
      const config = this.animationManager.getCharacterConfig(this.characterType);
      
      if (config && config.physicsBody) {
        const physicsConfig = config.physicsBody;
        
        // 设置物理体大小为实际角色尺寸
        this.sprite.body.setSize(physicsConfig.width, physicsConfig.height);
        
        // 设置物理体偏移
        // 正确的偏移计算：从精灵左边缘开始，向右偏移到物理体应该的位置
        // spriteWidth/2: 从精灵中心到右边缘的距离（因为锚点在中心）
        // physicsConfig.width/2: 物理体宽度的一半，用于居中对齐
        const spriteWidth = config.standardSize.width;
        const offsetX = physicsConfig.offsetX + (spriteWidth / 2) - (physicsConfig.width / 2);
        // Y轴偏移：从精灵底部向上偏移到角色底部
        const offsetY = physicsConfig.height - physicsConfig.offsetY;
        
        this.sprite.body.setOffset(offsetX, offsetY);
      } else {
        // 如果没有物理体配置，使用默认值
        console.warn(`No physics body config found for character type: ${this.characterType}`);
        this.sprite.body.setSize(41, 94);
        this.sprite.body.setOffset(-20.5, -144);
      }
    }
  }


}


export default Character;