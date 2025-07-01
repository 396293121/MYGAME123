/**
 * 动画管理器类
 * 负责统一管理角色动画的创建、播放和特殊动画处理
 */
import ANIMATION_CONFIGS from '../data/AnimationConfig.js';

class AnimationManager {
  constructor(scene) {
    this.scene = scene;
    this.createdAnimations = new Set(); // 记录已创建的动画
  }

  /**
   * 为指定角色类型创建所有动画
   * @param {string} characterType - 角色类型 (warrior, mage, archer)
   */
  createAnimationsForCharacter(characterType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config) {
      console.warn(`未找到角色类型 ${characterType} 的动画配置`);
      return;
    }

    Object.entries(config.animations).forEach(([animationType, animConfig]) => {
      this.createSingleAnimation(characterType, animationType, animConfig);
    });
  }

  /**
   * 创建单个动画
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @param {Object} animConfig - 动画配置
   */
  createSingleAnimation(characterType, animationType, animConfig) {
    const animKey = animConfig.key;
    
    // 如果动画已存在，跳过创建
    if (this.scene.anims.exists(animKey) || this.createdAnimations.has(animKey)) {
      return;
    }

    const textureKey = animConfig.textureKey || ANIMATION_CONFIGS[characterType].textureKey;
    let frames;

    // 根据帧类型生成帧数据
    if (animConfig.frames.type === 'frameNames') {
      frames = this.scene.anims.generateFrameNames(textureKey, {
        prefix: animConfig.frames.prefix,
        start: animConfig.frames.start,
        end: animConfig.frames.end,
        zeroPad: animConfig.frames.zeroPad,
        suffix: animConfig.frames.suffix
      });
    } else if (animConfig.frames.type === 'frameNumbers') {
      frames = this.scene.anims.generateFrameNumbers(textureKey, {
        start: animConfig.frames.start,
        end: animConfig.frames.end
      });
    }

    // 创建动画
    this.scene.anims.create({
      key: animKey,
      frames: frames,
      frameRate: animConfig.frameRate,
      repeat: animConfig.repeat
    });

    this.createdAnimations.add(animKey);
  }

  /**
   * 播放角色动画
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @param {string} originalTextureKey - 原始纹理键
   * @param {Function} onComplete - 动画完成回调
   */
  playAnimation(sprite, characterType, animationType, originalTextureKey, onComplete = null) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.animations[animationType]) {
      console.warn(`未找到角色 ${characterType} 的动画 ${animationType}`);
      return false;
    }

    const animConfig = config.animations[animationType];
    const animKey = animConfig.key;

    // 检查动画是否存在
    if (!this.scene.anims.exists(animKey)) {
      console.warn(`动画 ${animKey} 不存在`);
      return false;
    }

    // 保存当前位置
    const currentX = sprite.x;
    const currentY = sprite.y;

    // 播放动画
    sprite.anims.play(animKey, true);
    
    // 确保位置不变
    sprite.setPosition(currentX, currentY);

    // 处理特殊动画
    if (animConfig.isSpecial) {
      this.handleSpecialAnimation(sprite, animKey, currentX, currentY, originalTextureKey, onComplete);
    } else if (onComplete) {
      // 普通动画完成回调
      sprite.once('animationcomplete', (animation) => {
        if (animation.key === animKey) {
          onComplete();
        }
      });
    }

    return true;
  }

  /**
   * 处理特殊动画的位置调整和事件监听
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} animationKey - 动画键名
   * @param {number} originalX - 原始X坐标
   * @param {number} originalY - 原始Y坐标
   * @param {string} originalTextureKey - 原始纹理键
   * @param {Function} onComplete - 完成回调
   */
  handleSpecialAnimation(sprite, animationKey, originalX, originalY, originalTextureKey, onComplete) {
    // 监听动画帧变化事件，确保每帧位置正确
    const onAnimationUpdate = (animation, frame) => {
      if (animation.key === animationKey) {
        sprite.setPosition(originalX, originalY);
      }
    };

    sprite.on('animationupdate', onAnimationUpdate);

    // 特殊动画完成后清理事件监听
    sprite.once('animationcomplete', (animation) => {
      if (animation.key === animationKey) {
        sprite.off('animationupdate', onAnimationUpdate);
        
        // 确保最终位置正确
        sprite.setPosition(originalX, originalY);
        
        // 恢复原始纹理
        if (this.scene.textures.exists(originalTextureKey)) {
          sprite.setTexture(originalTextureKey);
        }
        
        // 执行完成回调
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * 检查动画是否存在
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @returns {boolean} 动画是否存在
   */
  hasAnimation(characterType, animationType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.animations[animationType]) {
      return false;
    }
    
    const animKey = config.animations[animationType].key;
    return this.scene.anims.exists(animKey);
  }

  /**
   * 获取动画配置
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @returns {Object|null} 动画配置对象
   */
  getAnimationConfig(characterType, animationType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (!config || !config.animations[animationType]) {
      return null;
    }
    
    return config.animations[animationType];
  }

  /**
   * 获取角色完整配置
   * @param {string} characterType - 角色类型
   * @returns {Object|null} 角色配置对象
   */
  getCharacterConfig(characterType) {
    return ANIMATION_CONFIGS[characterType] || null;
  }

  /**
   * 检查是否为特殊动画
   * @param {string} characterType - 角色类型
   * @param {string} animationType - 动画类型
   * @returns {boolean} 是否为特殊动画
   */
  isSpecialAnimation(characterType, animationType) {
    const config = this.getAnimationConfig(characterType, animationType);
    return config ? !!config.isSpecial : false;
  }

  /**
   * 应用标准尺寸设置
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} characterType - 角色类型
   */
  applyStandardSize(sprite, characterType) {
    const config = ANIMATION_CONFIGS[characterType];
    if (config) {
      // 只设置锚点，不强制改变显示尺寸
      // 因为新的精灵图已经是标准尺寸144x144，无需缩放
      if (config.anchorPoint) {
        sprite.setOrigin(config.anchorPoint.x, config.anchorPoint.y);
      }
    }
  }

  /**
   * 创建标准化精灵
   * @param {number} x - X坐标
   * @param {number} y - Y坐标 
   * @param {string} characterType - 角色类型
   * @param {string} textureKey - 纹理键
   */
  createStandardizedSprite(x, y, characterType, textureKey) {
    const sprite = this.scene.add.sprite(x, y, textureKey);
    this.applyStandardSize(sprite, characterType);
    return sprite;
  }

  /**
   * 清理已创建的动画记录（用于场景重置）
   */
  clearCreatedAnimations() {
    this.createdAnimations.clear();
  }

  /**
   * 销毁动画管理器
   */
  destroy() {
    this.clearCreatedAnimations();
    this.scene = null;
  }
}

export default AnimationManager;