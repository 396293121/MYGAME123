/**
 * 增强动画管理器类
 * 扩展原有动画管理器，支持状态驱动的动画播放和基于关键帧的事件触发
 */
import AnimationManager from './AnimationManager.js';
import ANIMATION_CONFIGS from '../data/AnimationConfig.js';

class EnhancedAnimationManager extends AnimationManager {
  constructor(scene) {
    super(scene);
    
    // 动画状态管理
    this.animationStates = new Map();
    
    // 关键帧事件管理
    this.keyFrameEvents = new Map();
    
    // 跳跃状态细分
    this.jumpStates = {
      RISING: 'rising',
      FALLING: 'falling',
      LANDING: 'landing'
    };
  }

  /**
   * 为指定角色创建增强动画配置
   * @param {string} characterType - 角色类型
   */
  createEnhancedAnimationsForCharacter(characterType) {
    // 先创建基础动画
    super.createAnimationsForCharacter(characterType);
    
    // 创建增强的跳跃动画配置
    this.createJumpStateAnimations(characterType);
    
    // 设置攻击动画的关键帧事件
    this.setupAttackKeyFrames(characterType);
  }

  /**
   * 创建跳跃状态细分动画
   * @param {string} characterType - 角色类型
   */
  createJumpStateAnimations(characterType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.animations.jump || !config.enhancedAnimation?.jump) {
      return;
    }

    const jumpConfig = config.animations.jump;
    const enhancedConfig = config.enhancedAnimation.jump;
    const textureKey = config.textureKey;
    
    // 从配置文件读取跳跃动画的具体帧数分配
    const risingEndFrame = enhancedConfig.frameDistribution.risingEndFrame;
    const fallingStartFrame = enhancedConfig.frameDistribution.fallingStartFrame;
    const fallingEndFrame = enhancedConfig.frameDistribution.fallingEndFrame;
    const holdLastFrame = enhancedConfig.holdLastFrame || false;

    // 创建上升动画
    const risingAnimKey = `${characterType}_jump_rising`;
    if (!this.scene.anims.exists(risingAnimKey)) {
      const risingFrameData = this.scene.anims.generateFrameNames(textureKey, {
        prefix: jumpConfig.frames.prefix,
        start: jumpConfig.frames.start,
        end: jumpConfig.frames.start + risingEndFrame - 1,
        zeroPad: jumpConfig.frames.zeroPad,
        suffix: jumpConfig.frames.suffix
      });

      this.scene.anims.create({
        key: risingAnimKey,
        frames: risingFrameData,
        frameRate: jumpConfig.frameRate * enhancedConfig.frameRateMultiplier.rising,
        repeat: holdLastFrame ? 0 : -1  // 如果设置了holdLastFrame，则不循环
      });
      
      this.createdAnimations.add(risingAnimKey);
    }

    // 创建下落动画
    const fallingAnimKey = `${characterType}_jump_falling`;
    if (!this.scene.anims.exists(fallingAnimKey)) {
      const fallingFrameData = this.scene.anims.generateFrameNames(textureKey, {
        prefix: jumpConfig.frames.prefix,
        start: jumpConfig.frames.start + fallingStartFrame - 1,
        end: jumpConfig.frames.start + fallingEndFrame - 1,
        zeroPad: jumpConfig.frames.zeroPad,
        suffix: jumpConfig.frames.suffix
      });

      this.scene.anims.create({
        key: fallingAnimKey,
        frames: fallingFrameData,
        frameRate: jumpConfig.frameRate * enhancedConfig.frameRateMultiplier.falling,
        repeat: holdLastFrame ? 0 : -1  // 如果设置了holdLastFrame，则不循环，否则循环播放直到着地
      });
      
      this.createdAnimations.add(fallingAnimKey);
    }
  }

  /**
   * 设置攻击动画的关键帧事件
   * @param {string} characterType - 角色类型
   */
  setupAttackKeyFrames(characterType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config) {
      return;
    }

    // 设置普通攻击动画的关键帧
    if (config.animations.attack && config.enhancedAnimation?.attack) {
      const attackConfig = config.animations.attack;
      const enhancedConfig = config.enhancedAnimation.attack;
      const totalFrames = attackConfig.frames.end - attackConfig.frames.start + 1;
      
      // 从配置文件读取关键帧的具体帧数
      const keyFrame = enhancedConfig.keyFrame.frameNumber || 1;
      
      // 存储关键帧信息
      this.keyFrameEvents.set(`${characterType}_attack`, {
        keyFrame: keyFrame,
        totalFrames: totalFrames,
        eventTriggered: false,
        config: enhancedConfig // 存储配置以供后续使用
      });
    }

    // 设置技能动画的关键帧
    const skillAnimations = ['heavy_slash', 'whirlwind', 'battle_cry'];
    skillAnimations.forEach(skillType => {
      if (config.animations[skillType] && config.enhancedAnimation?.[skillType]) {
        const skillConfig = config.animations[skillType];
        const enhancedConfig = config.enhancedAnimation[skillType];
        const totalFrames = skillConfig.frames.end - skillConfig.frames.start + 1;
        
        // 从配置文件读取关键帧的具体帧数
        const keyFrame = enhancedConfig.keyFrame.frameNumber || 1;
        
        // 存储关键帧信息
        this.keyFrameEvents.set(`${characterType}_${skillType}`, {
          keyFrame: keyFrame,
          totalFrames: totalFrames,
          eventTriggered: false,
          config: enhancedConfig // 存储配置以供后续使用
        });
      }
    });
  }

  /**
   * 播放增强动画
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @param {string} originalTextureKey - 原始纹理键
   * @param {Function} onComplete - 动画完成回调
   * @param {Function} onKeyFrame - 关键帧回调（用于攻击判定）
   */
  playEnhancedAnimation(sprite, characterType, animationType, originalTextureKey, onComplete = null, onKeyFrame = null) {
    // 处理跳跃动画的状态细分
    if (animationType === 'jump') {
      return this.playJumpAnimation(sprite, characterType, originalTextureKey, onComplete);
    }
    
    // 处理攻击动画的关键帧事件
    if (animationType === 'attack') {
      return this.playAttackAnimation(sprite, characterType, originalTextureKey, onComplete, onKeyFrame);
    }
    
    // 处理技能动画的关键帧事件（重斩、旋风斩、战吼等技能）
    if (animationType === 'heavy_slash' || animationType === 'whirlwind' || animationType === 'battle_cry') {
      return this.playAttackAnimation(sprite, characterType, originalTextureKey, onComplete, onKeyFrame, animationType);
    }
    
    // 其他动画使用基础播放方法
    return super.playAnimation(sprite, characterType, animationType, originalTextureKey, onComplete);
  }

  /**
   * 播放跳跃动画（根据垂直速度自动切换状态）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   * @param {string} originalTextureKey - 原始纹理键
   * @param {Function} onComplete - 动画完成回调
   */
  playJumpAnimation(sprite, characterType, originalTextureKey, onComplete = null) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.enhancedAnimation?.jump) {
      // 如果没有增强配置，回退到基础跳跃动画
      return super.playAnimation(sprite, characterType, 'jump', originalTextureKey, onComplete);
    }

    const enhancedConfig = config.enhancedAnimation.jump;
    const spriteId = sprite.name || sprite.id || 'default';
    
    // 根据配置文件中的速度阈值判断跳跃状态
    const velocityY = sprite.body ? sprite.body.velocity.y : 0;
    let jumpState;
    
    if (velocityY < enhancedConfig.velocityThresholds.rising) { // 上升阶段
      jumpState = this.jumpStates.RISING;
    } else if (velocityY > enhancedConfig.velocityThresholds.falling) { // 下落阶段
      jumpState = this.jumpStates.FALLING;
    } else { // 接近峰值或着地
      jumpState = this.jumpStates.FALLING;
    }
    
    // 存储当前跳跃状态
    this.animationStates.set(spriteId, {
      type: 'jump',
      state: jumpState,
      characterType: characterType
    });
    
    // 播放对应的跳跃动画
    const animKey = jumpState === this.jumpStates.RISING ? 
      `${characterType}_jump_rising` : `${characterType}_jump_falling`;
    
    if (this.scene.anims.exists(animKey)) {
      sprite.anims.play(animKey, true);
      
      // 如果是上升动画，监听完成事件自动切换到下落动画
      if (jumpState === this.jumpStates.RISING) {
        sprite.once('animationcomplete', () => {
          if (sprite.body && !sprite.body.onFloor()) {
            this.playJumpAnimation(sprite, characterType, originalTextureKey, onComplete);
          }
        });
      } else if (enhancedConfig.holdLastFrame && jumpState === this.jumpStates.FALLING) {
        // 只有下落动画才在最后一帧停留
        sprite.once('animationcomplete', (animation) => {
          if (animation.key === animKey) {
            // 停留在最后一帧
            sprite.anims.pause();
            sprite.setFrame(animation.frames[animation.frames.length - 1].frame);
          }
        });
      }
      
      return true;
    }
    
    // 如果增强动画不存在，回退到基础跳跃动画
    return super.playAnimation(sprite, characterType, 'jump', originalTextureKey, onComplete);
  }

  /**
   * 播放攻击动画（带关键帧事件触发和音效支持）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   * @param {string} originalTextureKey - 原始纹理键
   * @param {Function} onComplete - 动画完成回调
   * @param {Function} onKeyFrame - 关键帧回调
   * @param {string} animationType - 动画类型（默认为'attack'，也可以是技能动画）
   */
  playAttackAnimation(sprite, characterType, originalTextureKey, onComplete = null, onKeyFrame = null, animationType = 'attack') {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.animations[animationType]) {
      return false;
    }
    const animKey = config.animations[animationType].key;
    const keyFrameInfo = this.keyFrameEvents.get(`${characterType}_${animationType}`);
    
    if (!this.scene.anims.exists(animKey)) {
      return false;
    }

    // 重置关键帧事件状态
    if (keyFrameInfo) {
      keyFrameInfo.eventTriggered = false;
    }

    // 播放动画
    sprite.anims.play(animKey, true);
    
    // 监听动画帧更新事件
    const onAnimationUpdate = (animation, frame) => {
      if (animation.key === animKey) {
        const currentFrameIndex = frame.index;
        
        // 触发音效（基于帧数）
        this.triggerFrameBasedAudio(sprite, characterType, currentFrameIndex);
        
        // 检查是否到达关键帧（攻击判定）
        if (keyFrameInfo && !keyFrameInfo.eventTriggered && currentFrameIndex >= keyFrameInfo.keyFrame) {
          keyFrameInfo.eventTriggered = true;
          
          // 触发关键帧事件（攻击判定）
          if (onKeyFrame) {
            onKeyFrame(currentFrameIndex, keyFrameInfo.totalFrames);
          }
        }
      }
    };

    sprite.on('animationupdate', onAnimationUpdate);

    // 监听动画完成事件
    sprite.once('animationcomplete', (animation) => {
      if (animation.key === animKey) {
        sprite.off('animationupdate', onAnimationUpdate);
        
        if (onComplete) {
          onComplete();
        }
      }
    });

    return true;
  }

  /**
   * 触发基于帧的音效
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   * @param {number} currentFrame - 当前帧数
   */
  triggerFrameBasedAudio(sprite, characterType, currentFrame) {
    // 检查sprite是否有audioManager
    const character = sprite.character || sprite.parent;
    if (!character || !character.audioManager) {
      return;
    }

    // 触发挥剑音效（第2帧）
    character.audioManager.playFrameBasedSound(characterType, 'attack', 'swing', currentFrame);
    
    // 注意：命中音效(hit)现在只在实际命中敌人时播放，不再基于帧数触发
  }

  /**
   * 更新跳跃动画状态（在游戏循环中调用）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   */
  updateJumpAnimationState(sprite, characterType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.enhancedAnimation?.jump) {
      return;
    }

    const enhancedConfig = config.enhancedAnimation.jump;
    const spriteId = sprite.name || sprite.id || 'default';
    const currentState = this.animationStates.get(spriteId);
    
    // 只处理跳跃状态
    if (!currentState || currentState.type !== 'jump') {
      return;
    }
    
    // 如果已经着地，清除跳跃状态
    if (sprite.body && sprite.body.onFloor()) {
      this.animationStates.delete(spriteId);
      return;
    }
    
    // 如果设置了holdLastFrame且下落动画已暂停，不进行状态切换
    if (enhancedConfig.holdLastFrame && sprite.anims.isPaused && currentState.state === this.jumpStates.FALLING) {
      return;
    }
    
    const velocityY = sprite.body ? sprite.body.velocity.y : 0;
    let newJumpState;
    
    if (velocityY < enhancedConfig.velocityThresholds.rising) {
      newJumpState = this.jumpStates.RISING;
    } else {
      newJumpState = this.jumpStates.FALLING;
    }
    
    // 如果状态发生变化，切换动画
    if (currentState.state !== newJumpState) {
      currentState.state = newJumpState;
      
      const animKey = newJumpState === this.jumpStates.RISING ? 
        `${characterType}_jump_rising` : `${characterType}_jump_falling`;
      
      if (this.scene.anims.exists(animKey)) {
        sprite.anims.play(animKey, true);
        
        // 如果设置了holdLastFrame且是下落动画，为新动画添加停留逻辑
        if (enhancedConfig.holdLastFrame && newJumpState === this.jumpStates.FALLING) {
          sprite.once('animationcomplete', (animation) => {
            if (animation.key === animKey) {
              sprite.anims.pause();
              sprite.setFrame(animation.frames[animation.frames.length - 1].frame);
            }
          });
        }
      }
    }
  }

  /**
   * 检查是否为增强动画
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @returns {boolean}
   */
  isEnhancedAnimation(characterType, animationType) {
    return animationType === 'jump' || animationType === 'attack';
  }

  /**
   * 获取跳跃状态
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @returns {string|null} 当前跳跃状态
   */
  getJumpState(sprite) {
    const spriteId = sprite.name || sprite.id || 'default';
    const state = this.animationStates.get(spriteId);
    return state && state.type === 'jump' ? state.state : null;
  }

  /**
   * 清理精灵的动画状态
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   */
  clearSpriteState(sprite) {
    const spriteId = sprite.name || sprite.id || 'default';
    this.animationStates.delete(spriteId);
  }

  /**
   * 销毁管理器时清理所有状态
   */
  destroy() {
    this.animationStates.clear();
    this.keyFrameEvents.clear();
    super.destroy();
  }
}

export default EnhancedAnimationManager;