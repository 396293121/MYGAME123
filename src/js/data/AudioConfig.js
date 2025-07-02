/**
 * 音效配置文件
 * 管理游戏中所有角色和敌人的音效
 * 
 * 配置参数说明：
 * - key: 音效资源键名
 * - volume: 音量 (0.0-1.0)
 * - rate: 播放速率 (0.5-2.0，1.0为正常速度)
 * - detune: 音调调整 (-1200到1200，单位为音分)
 * - seek: 开始播放位置 (秒)
 * - loop: 是否循环播放
 * - timing.frame: 在动画的第几帧触发音效（从1开始计数）
 * - timing.delay: 延迟播放时间（毫秒）
 * - duration: 强制停止音效的时间（毫秒），到达此时间后会主动停止播放
 * - minInterval: 防止重复播放的最小间隔（毫秒）
 * 
 * 使用示例：
 * // 基础播放
 * audioManager.playCharacterSound('warrior', 'attack', 'swing');
 * 
 * // 帧触发播放
 * audioManager.playFrameBasedSound('warrior', 'attack', 'swing', 3);
 * 
 * // 注册动画音效
 * audioManager.registerAnimationSounds(sprite, 'warrior_attack', 'warrior', 'attack', ['swing', 'hit']);
 * 
 * 注意：使用 scene.sound.add() + sound.play() 而不是 scene.sound.play()，
 * 因为后者在某些情况下返回 boolean 而不是 sound 对象。
 */

const AUDIO_CONFIGS = {
  // 战士角色音效配置
  warrior: {
    // 攻击相关音效
    attack: {
      // 挥剑音效 - 在攻击动画开始时播放
      swing: {
        key: 'warrior_sword_swing',
        volume: 0.6,
        rate: 1.0,              // 播放速率
        detune: 0,              // 音调调整
        timing: {
          // 在攻击动画的第2帧播放（挥剑开始）
          frame: 2,
          // 或者基于时间触发（毫秒）
          delay: 133 // 约第2帧时间 (1000ms / 15fps * 2)
        },
        duration: 548, // 音效时长548ms
        minInterval: 150        // 最小播放间隔
      },
      // 剑命中音效 - 在攻击判定时播放
      hit: {
        key: 'warrior_sword_hit',
        volume: 0.7,
        rate: 1.1,              // 稍快播放
        timing: {
          // 在攻击动画的关键帧播放（第9帧，实际攻击判定帧）
          frame: 9,
          // 或者基于时间触发
          delay: 600 // 约第9帧时间 (1000ms / 15fps * 9)
        },
        duration: 386 // 音效时长386ms
      }
    },
    // 移动相关音效
    movement: {
      jump: {
        key: 'warrior_jump',
        volume: 0.5,
        timing: {
          frame: 1,
          delay: 0
        },
      }
    },
    // 受伤和死亡音效
    damage: {
      hurt: {
        key: 'warrior_hurt',
        volume: 0.6,
        timing: {
          frame: 1,
          delay: 0
        }
      },
      die: {
        key: 'warrior_die',
        volume: 0.7,
        timing: {
          frame: 1,
          delay: 0
        }
      }
    }
  },

  // 法师角色音效配置（预留）
  mage: {
    attack: {
      cast: {
        key: 'mage_spell_cast',
        volume: 0.6,
        timing: {
          frame: 3,
          delay: 200
        }
      },
      hit: {
        key: 'mage_spell_hit',
        volume: 0.7,
        timing: {
          frame: 8,
          delay: 533
        }
      }
    }
  },

  // 射手角色音效配置（预留）
  archer: {
    attack: {
      bowDraw: {
        key: 'archer_bow_draw',
        volume: 0.5,
        timing: {
          frame: 2,
          delay: 133
        }
      },
      arrowRelease: {
        key: 'archer_arrow_release',
        volume: 0.6,
        timing: {
          frame: 6,
          delay: 400
        }
      },
      hit: {
        key: 'archer_arrow_hit',
        volume: 0.7,
        timing: {
          frame: 10,
          delay: 667
        }
      }
    }
  },

  // 野猪敌人音效配置
  wild_boar: {
    // 攻击相关音效
    attack: {
      // 攻击音效 - 在攻击动画开始时播放
      sound: {
        key: 'wild_boar_attack',
        volume: 0.7,
        timing: {
          // 在攻击动画的第3帧播放
          frame: 3,
          delay: 200
        },
        duration: 800 // 预估音效时长
      }
    },
    // 移动相关音效
    movement: {
      // 冲锋音效
      charge: {
        key: 'wild_boar_charge',
        volume: 0.8,
        timing: { frame: 1 },
        duration: 800
      }
    },
    // 受伤和死亡音效
    damage: {
      hurt: {
        key: 'wild_boar_hurt',
        volume: 0.6,
        timing: {
          frame: 1,
          delay: 0
        },
        duration: 600 // 预估音效时长
      },
      die: {
        key: 'wild_boar_die',
        volume: 0.7,
        timing: {
          frame: 1,
          delay: 0
        },
        duration: 1200 // 预估音效时长
      }
    }
  },

  // 全局音效设置
  global: {
    // 音效音量倍数
    volumeMultiplier: 1.0,
    // 是否启用音效
    enabled: true,
    // 音效淡入淡出时间
    fadeTime: 100,
    // 最大同时播放的相同音效数量
    maxConcurrentSounds: 5
  }
};

// 音效管理器类
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.config = AUDIO_CONFIGS;
    this.activeSounds = new Map(); // 跟踪当前播放的音效
    // 防止重复播放的时间记录
    this.lastPlayedTimes = new Map();
  }

  /**
   * 播放角色动作音效
   * @param {string} characterType - 角色类型 (warrior, mage, archer)
   * @param {string} actionType - 动作类型 (attack, movement, damage)
   * @param {string} soundType - 音效类型 (swing, hit, jump, hurt, die)
   * @param {Object} options - 额外选项
   */
  playCharacterSound(characterType, actionType, soundType, options = {}) {
    const soundConfig = this.config[characterType]?.[actionType]?.[soundType];
    if (!soundConfig) {
      console.warn(`音效配置未找到: ${characterType}.${actionType}.${soundType}`);
      return null;
    }

    // 检查音效是否已加载
    if (!this.scene.cache.audio.has(soundConfig.key)) {
      console.warn(`音效文件未加载: ${soundConfig.key}`);
      return null;
    }

    // 应用全局设置和配置参数
    const volume = (soundConfig.volume || 0.5) * this.config.global.volumeMultiplier;
    const playOptions = {
      volume: volume,
      // 应用Phaser官方支持的参数
      rate: soundConfig.rate || 1.0,           // 播放速率
      detune: soundConfig.detune || 0,         // 音调调整 (-1200到1200)
      seek: soundConfig.seek || 0,             // 开始播放位置 (秒)
      loop: soundConfig.loop || false,         // 是否循环播放
      delay: soundConfig.timing?.delay || 0,   // 延迟播放时间 (毫秒)
            duration: soundConfig.duration,

      ...options
    };
    
    // 如果配置了延迟播放，使用delayedCall
    if (soundConfig.timing?.delay > 0 && !options.ignoreDelay) {
      this.scene.time.delayedCall(soundConfig.timing.delay, () => {
        this.playCharacterSound(characterType, actionType, soundType, { ...options, ignoreDelay: true });
      });
      return null;
    }

    // 限制同时播放的相同音效数量
    const activeCount = this.activeSounds.get(soundConfig.key) || 0;
    console.log(`音效 ${soundConfig.key} 当前活跃数量: ${activeCount}, 最大允许: ${this.config.global.maxConcurrentSounds}`);
    
    if (activeCount >= this.config.global.maxConcurrentSounds) {
      console.warn(`音效 ${soundConfig.key} 达到最大并发数量限制 (${this.config.global.maxConcurrentSounds})`);
      return null;
    }
    // 创建音效实例并播放
    const sound = this.scene.sound.add(soundConfig.key, playOptions);
    
    // 检查音效是否成功创建
    if (!sound) {
      console.warn(`音效创建失败: ${soundConfig.key}`);
      return null;
    }
    
    // 播放音效
    const playResult = sound.play();
    if (!playResult) {
      console.warn(`音效播放失败: ${soundConfig.key}`);
      sound.destroy();
      return null;
    }
    
    console.log(`音效 ${soundConfig.key} 播放成功`);
    
    // 跟踪音效播放
    this.activeSounds.set(soundConfig.key, activeCount + 1);
    
    // 创建清理函数
    const cleanupSound = () => {
      const currentCount = this.activeSounds.get(soundConfig.key) || 0;
      if (currentCount <= 1) {
        this.activeSounds.delete(soundConfig.key);
        console.log(`音效 ${soundConfig.key} 计数清零，删除记录`);
      } else {
        this.activeSounds.set(soundConfig.key, currentCount - 1);
        console.log(`音效 ${soundConfig.key} 计数减1，当前: ${currentCount - 1}`);
      }
    };
    
    // 音效结束时清理计数
    if (sound && typeof sound.once === 'function') {
      sound.once('complete', cleanupSound);
      sound.once('stop', cleanupSound);
      sound.once('destroy', cleanupSound);
    }
    console.log(sound,soundConfig.duration,9999)
    // 如果配置了duration，在指定时间后主动停止音频播放
    if (soundConfig.duration && soundConfig.duration > 0) {
      this.scene.time.delayedCall(soundConfig.duration, () => {
        if (sound) {
          console.log(`音效 ${soundConfig.key} 达到设定播放时长 ${soundConfig.duration}ms，主动停止`);
          sound.stop();
        }
      });
    }
    
    // 强制超时清理（防止事件监听失败）- 用于清理计数，不停止播放
    const timeoutDuration = Math.max(soundConfig.duration || 1000, 2000); // 至少2秒后清理
    this.scene.time.delayedCall(timeoutDuration, () => {
      // 检查音效是否还在播放
      if (sound && (sound.isPlaying || sound.isPaused)) {
        console.log(`音效 ${soundConfig.key} 超时但仍在播放，跳过清理`);
        return;
      }
      console.log(`音效 ${soundConfig.key} 超时清理计数`);
      cleanupSound();
    });

    return sound;
  }

  /**
   * 根据动画帧播放音效
   * @param {string} characterType - 角色类型
   * @param {string} actionType - 动作类型
   * @param {string} soundType - 音效类型
   * @param {number} currentFrame - 当前帧数
   * @param {Object} options - 额外选项
   */
  playFrameBasedSound(characterType, actionType, soundType, currentFrame, options = {}) {
    const soundConfig = this.config[characterType]?.[actionType]?.[soundType];
    if (!soundConfig || !soundConfig.timing) return;

    if (soundConfig.timing.frame === currentFrame) {
      // 防止短时间内重复播放同一音效
      const soundKey = `${characterType}_${actionType}_${soundType}`;
      const now = Date.now();
      const lastPlayTime = this.lastPlayedTimes.get(soundKey) || 0;
      const minInterval = soundConfig.minInterval || 100; // 从配置获取最小间隔，默认100ms
      
      if (now - lastPlayTime < minInterval) {
        console.log(`防止重复播放: ${soundKey}, 距离上次播放仅 ${now - lastPlayTime}ms`);
        return;
      }
      this.lastPlayedTimes.set(soundKey, now);
      
      // 忽略延迟，因为帧触发已经是精确时机
      return this.playCharacterSound(characterType, actionType, soundType, { ...options, ignoreDelay: true });
    }
  }

  /**
   * 为动画注册帧事件监听器
   * @param {Phaser.GameObjects.Sprite} sprite - 精灵对象
   * @param {string} animationKey - 动画键名
   * @param {string} characterType - 角色类型
   * @param {string} actionType - 动作类型
   * @param {Array} soundTypes - 要监听的音效类型数组
   */
  registerAnimationSounds(sprite, animationKey, characterType, actionType, soundTypes = []) {
    if (!sprite || !sprite.anims) return;

    // 移除之前的监听器
    sprite.off('animationupdate');
    
    // 添加帧更新监听器
    sprite.on('animationupdate', (animation, frame) => {
      if (animation.key === animationKey) {
        const currentFrame = frame.index + 1; // Phaser帧索引从0开始，配置从1开始
        
        soundTypes.forEach(soundType => {
          this.playFrameBasedSound(characterType, actionType, soundType, currentFrame);
        });
      }
    });
  }

  /**
   * 根据时间延迟播放音效
   * @param {string} characterType - 角色类型
   * @param {string} actionType - 动作类型
   * @param {string} soundType - 音效类型
   */
  playDelayedSound(characterType, actionType, soundType) {
    const soundConfig = this.config[characterType]?.[actionType]?.[soundType];
    if (!soundConfig || !soundConfig.timing) return;

    if (soundConfig.timing.delay > 0) {
      this.scene.time.delayedCall(soundConfig.timing.delay, () => {
        this.playCharacterSound(characterType, actionType, soundType);
      });
    } else {
      this.playCharacterSound(characterType, actionType, soundType);
    }
  }

  /**
   * 停止指定音效
   * @param {string} soundKey - 音效键名
   */
  stopSound(soundKey) {
    const sounds = this.scene.sound.sounds.filter(sound => sound.key === soundKey);
    sounds.forEach(sound => sound.stop());
    this.activeSounds.delete(soundKey);
  }

  /**
   * 设置全局音效音量
   * @param {number} volume - 音量 (0-1)
   */
  setGlobalVolume(volume) {
    this.config.global.volumeMultiplier = Math.max(0, Math.min(1, volume));
  }

  /**
   * 启用/禁用音效
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.config.global.enabled = enabled;
    if (!enabled) {
      // 停止所有当前播放的音效
      this.scene.sound.stopAll();
      this.activeSounds.clear();
    }
  }
}

// 导出配置和管理器
export { AUDIO_CONFIGS, AudioManager };
export default AUDIO_CONFIGS;