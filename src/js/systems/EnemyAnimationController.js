/**
 * 敌人动画控制器
 * 统一管理敌人动画播放逻辑，消除重复的动画创建和播放代码
 */
import Logger from './Logger.js';
import EnemyConfig from '../data/EnemyConfig.js';

class EnemyAnimationController {
  constructor() {
    this.logger = Logger;
    
    // 动画缓存优化
    this.animationCache = new Map();
    this.createdAnimations = new Set();
    
    // 精灵状态缓存
    this.spriteStates = new WeakMap();
    
    // 性能统计
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      animationsCreated: 0,
      animationsPlayed: 0
    };
  }

  /**
   * 为指定敌人类型创建所有动画
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} enemyType - 敌人类型
   * @returns {boolean} 是否成功创建
   */
  createAnimationsForEnemy(scene, enemyType) {
    const cacheKey = `animations_${enemyType}`;
    
    // 检查缓存
    if (this.animationCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return true;
    }

    const config = EnemyConfig[enemyType.toUpperCase()];
    if (!config) {
      this.logger.warn(`Animation config not found for enemy type: ${enemyType}`);
      return false;
    }

    try {
      const createdAnims = [];
      
      // 创建所有动画
      Object.entries(config.animations).forEach(([animKey, animConfig]) => {
        const fullKey = `${enemyType}_${animKey}`;
        
        // 检查动画是否已存在
        if (scene.anims.exists(fullKey)) {
          createdAnims.push(fullKey);
          return;
        }

        // 创建动画配置
        const animationConfig = {
          key: fullKey,
          frameRate: animConfig.frameRate,
          repeat: animConfig.repeat
        };

        // 根据帧类型设置帧数据
        if (animConfig.frames.type === 'frameNumbers') {
          animationConfig.frames = scene.anims.generateFrameNumbers(
            config.textureKey,
            {
              start: animConfig.frames.start,
              end: animConfig.frames.end
            }
          );
        } else if (animConfig.frames.type === 'frameNames') {
          animationConfig.frames = scene.anims.generateFrameNames(
            config.textureKey,
            {
              prefix: animConfig.frames.prefix,
              start: animConfig.frames.start,
              end: animConfig.frames.end,
              zeroPad: animConfig.frames.zeroPad || 0,
              suffix: animConfig.frames.suffix || ''
            }
          );
        }

        // 创建动画
        scene.anims.create(animationConfig);
        this.createdAnimations.add(fullKey);
        createdAnims.push(fullKey);
        this.stats.animationsCreated++;
        
        this.logger.debug(`Created animation: ${fullKey}`);
      });

      // 缓存创建的动画列表
      this.animationCache.set(cacheKey, createdAnims);
      this.stats.cacheMisses++;
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to create animations for ${enemyType}:`, error);
      return false;
    }
  }

  /**
   * 播放敌人动画（优化版）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} enemyType - 敌人类型
   * @param {string} animationKey - 动画键名
   * @param {Function} onComplete - 动画完成回调
   * @param {Function} onKeyFrame - 关键帧回调
   * @returns {boolean} 是否成功播放
   */
  playAnimation(sprite, enemyType, animationKey, onComplete = null, onKeyFrame = null) {
    const fullKey = `${enemyType}_${animationKey}`;
    
    // 检查当前是否已在播放相同动画
    const currentState = this.spriteStates.get(sprite);
    if (currentState && currentState.currentAnimation === fullKey && sprite.anims.isPlaying) {
      return true; // 避免重复播放相同动画
    }
    
    if (!sprite.scene.anims.exists(fullKey)) {
      this.logger.warn(`Animation not found: ${fullKey}`);
      return false;
    }

    try {
      // 获取配置
      const config = EnemyConfig[enemyType.toUpperCase()];
      const animConfig = config?.animations[animationKey];
      
      // 清除之前的事件监听器
      sprite.off('animationcomplete');
      sprite.off('animationupdate');

      // 设置动画完成回调
      if (onComplete) {
        sprite.once('animationcomplete', (animation) => {
          if (animation.key === fullKey) {
            onComplete(animationKey);
          }
        });
      }

      // 设置关键帧回调
      if (onKeyFrame && config?.enhancedAnimation?.[animationKey]?.keyFrame) {
        const keyFrameNumber = config.enhancedAnimation[animationKey].keyFrame.frameNumber;
        
        sprite.on('animationupdate', (animation, frame) => {
          if (animation.key === fullKey && frame.index === keyFrameNumber) {
            onKeyFrame(frame.index, animation.frames.length);
          }
        });
      }

      // 播放动画
      sprite.anims.play(fullKey, true);
      
      // 更新精灵状态
      this.spriteStates.set(sprite, {
        currentAnimation: fullKey,
        enemyType: enemyType,
        animationKey: animationKey,
        timestamp: Date.now()
      });

      this.stats.animationsPlayed++;
      return true;
    } catch (error) {
      this.logger.error(`Failed to play animation ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * 智能动画播放 - 根据状态自动选择合适的动画
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} enemyType - 敌人类型
   * @param {string} state - 敌人状态
   * @param {Object} options - 播放选项
   */
  playStateAnimation(sprite, enemyType, state, options = {}) {
    const stateAnimationMap = {
      'idle': 'idle',
      'patrol': 'move',
      'chase': 'move',
      'attack': 'attack',
      'charge': 'charge',
      'hurt': 'hurt',
      'stunned': 'stunned',
      'die': 'die',
      'dead': 'die'
    };

    const animationKey = stateAnimationMap[state.toLowerCase()] || 'idle';
    return this.playAnimation(sprite, enemyType, animationKey, options.onComplete, options.onKeyFrame);
  }

  /**
   * 停止动画并清理
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   */
  stopAnimation(sprite) {
    if (sprite && sprite.anims) {
      sprite.anims.stop();
      sprite.off('animationcomplete');
      sprite.off('animationupdate');
      this.spriteStates.delete(sprite);
    }
  }

  /**
   * 检查动画是否存在
   * @param {string} enemyType - 敌人类型
   * @param {string} animationKey - 动画键名
   * @returns {boolean}
   */
  hasAnimation(enemyType, animationKey) {
    const fullKey = `${enemyType}_${animationKey}`;
    return this.createdAnimations.has(fullKey);
  }

  /**
   * 获取敌人配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object|null}
   */
  getConfig(enemyType) {
    return EnemyConfig[enemyType.toUpperCase()] || null;
  }

  /**
   * 获取动画配置
   * @param {string} enemyType - 敌人类型
   * @param {string} animationKey - 动画键名
   * @returns {Object|null}
   */
  getAnimationConfig(enemyType, animationKey) {
    const config = this.getConfig(enemyType);
    return config?.animations[animationKey] || null;
  }

  /**
   * 获取增强动画配置
   * @param {string} enemyType - 敌人类型
   * @param {string} animationKey - 动画键名
   * @returns {Object|null}
   */
  getEnhancedConfig(enemyType, animationKey) {
    const config = this.getConfig(enemyType);
    return config?.enhancedAnimation?.[animationKey] || null;
  }

  /**
   * 获取行为配置
   * @param {string} enemyType - 敌人类型
   * @returns {Object|null}
   */
  getBehaviorConfig(enemyType) {
    const config = this.getConfig(enemyType);
    return config?.behavior || null;
  }

  /**
   * 检查状态转换是否有效
   * @param {string} enemyType - 敌人类型
   * @param {string} fromState - 源状态
   * @param {string} toState - 目标状态
   * @returns {boolean}
   */
  isValidStateTransition(enemyType, fromState, toState) {
    const config = this.getConfig(enemyType);
    if (!config || !config.stateTransitions) {
      return true; // 如果没有配置，允许所有转换
    }

    const validTransitions = config.stateTransitions[fromState];
    return validTransitions ? validTransitions.includes(toState) : false;
  }

  /**
   * 批量清理精灵状态
   * @param {Array} sprites - 精灵数组
   */
  cleanupSprites(sprites) {
    sprites.forEach(sprite => {
      if (this.spriteStates.has(sprite)) {
        this.stopAnimation(sprite);
      }
    });
  }

  /**
   * 获取性能统计
   * @returns {Object}
   */
  getStats() {
    const cacheHitRate = this.stats.cacheHits + this.stats.cacheMisses > 0
      ? (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      cacheHitRate: `${cacheHitRate}%`,
      cacheSize: this.animationCache.size,
      createdAnimationsCount: this.createdAnimations.size,
      activeSpriteStates: this.spriteStates.size || 0
    };
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.animationCache.clear();
    this.spriteStates = new WeakMap();
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      animationsCreated: 0,
      animationsPlayed: 0
    };
  }

  /**
   * 预加载常用动画
   * @param {Phaser.Scene} scene - 场景对象
   * @param {Array} enemyTypes - 敌人类型数组
   */
  preloadAnimations(scene, enemyTypes) {
    enemyTypes.forEach(enemyType => {
      this.createAnimationsForEnemy(scene, enemyType);
    });
    
    this.logger.info(`Preloaded animations for ${enemyTypes.length} enemy types`);
  }

  /**
   * 获取状态机配置（从EnemyAnimationManager整合）
   * @param {string} enemyType - 敌人类型
   * @returns {Object|null} 状态机配置
   */
  getStateMachineConfig(enemyType) {
    const config = this.getConfig(enemyType);
    return config?.stateMachine || null;
  }

  /**
   * 设置精灵的物理体（从EnemyAnimationManager整合）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} enemyType - 敌人类型
   */
  setupPhysicsBody(sprite, enemyType) {
    if (sprite && sprite.body) {
      // 从动画配置中获取物理体配置
      const config = this.getConfig(enemyType);
      
      if (config && config.physicsBody) {
        const physicsConfig = config.physicsBody;
        
        // 设置物理体大小
        sprite.body.setSize(physicsConfig.width, physicsConfig.height);
        
        // 设置物理体偏移
        // 根据锚点和精灵尺寸计算正确的偏移
        const spriteWidth = config.standardSize?.width || sprite.width;
        const spriteHeight = config.standardSize?.height || sprite.height;
        const anchorPoint = config.anchorPoint || { x: 0.5, y: 0.5 };
        
        let offsetX = physicsConfig.offsetX;
        let offsetY = physicsConfig.offsetY;
        
        // 根据锚点调整X轴偏移
        if (anchorPoint.x === 0.5) {
          // 锚点在中心，需要从中心计算偏移
          offsetX = physicsConfig.offsetX + (spriteWidth / 2) - (physicsConfig.width / 2);
        } else if (anchorPoint.x === 0.0) {
          // 锚点在左边，直接使用配置的偏移
          offsetX = physicsConfig.offsetX;
        } else if (anchorPoint.x === 1.0) {
          // 锚点在右边，从右边计算偏移
          offsetX = physicsConfig.offsetX + spriteWidth - physicsConfig.width;
        }
        
        // 根据锚点调整Y轴偏移
        if (anchorPoint.y === 1.0) {
          // 锚点在底部，从底部向上计算偏移
          offsetY = spriteHeight - physicsConfig.height - physicsConfig.offsetY;
        } else if (anchorPoint.y === 0.5) {
          // 锚点在中心，从中心计算偏移
          offsetY = physicsConfig.offsetY + (spriteHeight / 2) - (physicsConfig.height / 2);
        } else if (anchorPoint.y === 0.0) {
          // 锚点在顶部，直接使用配置的偏移
          offsetY = physicsConfig.offsetY;
        }
        
        sprite.body.setOffset(offsetX, offsetY);
        
        // 添加调试信息（可选）
        if (window.DEBUG_PHYSICS) {
          console.log(`Physics setup for ${enemyType}:`, {
            spriteSize: { width: spriteWidth, height: spriteHeight },
            physicsSize: { width: physicsConfig.width, height: physicsConfig.height },
            anchorPoint: anchorPoint,
            finalOffset: { x: offsetX, y: offsetY }
          });
        }
      } else {
        // 如果没有物理体配置，使用默认值
        console.warn(`No physics body config found for enemy type: ${enemyType}`);
        sprite.body.setSize(50, 50);
        sprite.body.setOffset(0, 0);
      }
    }
  }

  /**
   * 清理精灵状态（从EnemyAnimationManager整合）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   */
  clearSpriteState(sprite) {
    if (sprite) {
      sprite.off('animationcomplete');
      sprite.off('animationupdate');
      this.spriteStates.delete(sprite);
    }
  }

  /**
   * 获取精灵当前状态（从EnemyAnimationManager整合）
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @returns {Object|null} 精灵状态
   */
  getSpriteState(sprite) {
    return this.spriteStates.get(sprite) || null;
  }

  /**
   * 兼容旧接口：为指定敌人类型创建所有动画（无场景参数版本）
   * @param {string} enemyType - 敌人类型
   * @deprecated 推荐使用带场景参数的版本
   */
  createAnimationsForEnemyLegacy(enemyType) {
    // 需要场景对象，从当前活动场景获取
    const scene = this.getCurrentScene();
    if (scene) {
      return this.createAnimationsForEnemy(scene, enemyType);
    }
    this.logger.warn('No active scene found for createAnimationsForEnemyLegacy');
    return false;
  }

  /**
   * 获取当前活动场景（辅助方法）
   * @returns {Phaser.Scene|null}
   */
  getCurrentScene() {
    // 尝试从全局游戏实例获取当前场景
    if (typeof window !== 'undefined' && window.game && window.game.scene) {
      const scenes = window.game.scene.getScenes(true);
      return scenes.length > 0 ? scenes[0] : null;
    }
    return null;
  }

  /**
   * 销毁动画控制器（从EnemyAnimationManager整合）
   */
  destroy() {
    // 清理所有精灵状态
    this.spriteStates = new WeakMap();
    this.createdAnimations.clear();
    this.clearCache();
  }
}

// 创建单例实例
const enemyAnimationController = new EnemyAnimationController();

export default enemyAnimationController;