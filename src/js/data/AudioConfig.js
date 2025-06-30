/**
 * 音效配置文件
 * 定义所有角色和游戏元素的音效配置信息
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
        timing: {
          // 在攻击动画的第2帧播放（挥剑开始）
          frame: 2,
          // 或者基于时间触发（毫秒）
          delay: 133 // 约第2帧时间 (1000ms / 15fps * 2)
        },
        duration: 548 // 音效时长548ms
      },
      // 剑命中音效 - 在攻击判定时播放
      hit: {
        key: 'warrior_sword_hit',
        volume: 0.7,
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
        }
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

  // 全局音效设置
  global: {
    // 音效音量倍数
    volumeMultiplier: 1.0,
    // 是否启用音效
    enabled: true,
    // 音效淡入淡出时间
    fadeTime: 100,
    // 最大同时播放的相同音效数量
    maxConcurrentSounds: 3
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

    // 应用全局设置
    const volume = (soundConfig.volume || 0.5) * this.config.global.volumeMultiplier;
    const playOptions = {
      volume: volume,
      ...options
    };

    // 限制同时播放的相同音效数量
    const activeCount = this.activeSounds.get(soundConfig.key) || 0;
    console.log(`音效 ${soundConfig.key} 当前活跃数量: ${activeCount}, 最大允许: ${this.config.global.maxConcurrentSounds}`);
    
    if (activeCount >= this.config.global.maxConcurrentSounds) {
      console.warn(`音效 ${soundConfig.key} 达到最大并发数量限制 (${this.config.global.maxConcurrentSounds})`);
      return null;
    }

    // 播放音效
    const sound = this.scene.sound.play(soundConfig.key, playOptions);
    
    // 检查音效是否成功播放
    if (!sound) {
      console.warn(`音效播放失败: ${soundConfig.key}`);
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
    
    // 强制超时清理（防止事件监听失败）
    const timeoutDuration = Math.min(soundConfig.duration || 1000, 2000); // 最长2秒
    this.scene.time.delayedCall(timeoutDuration, () => {
      // 检查音效是否还在播放
      if (sound && (sound.isPlaying || sound.isPaused)) {
        console.log(`音效 ${soundConfig.key} 超时但仍在播放，跳过清理`);
        return;
      }
      console.log(`音效 ${soundConfig.key} 超时清理`);
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
   */
  playFrameBasedSound(characterType, actionType, soundType, currentFrame) {
    const soundConfig = this.config[characterType]?.[actionType]?.[soundType];
    if (!soundConfig || !soundConfig.timing) return;

    if (soundConfig.timing.frame === currentFrame) {
      // 防止短时间内重复播放同一音效
      const soundKey = `${characterType}_${actionType}_${soundType}`;
      const now = Date.now();
      const lastPlayTime = this.lastPlayedTimes.get(soundKey) || 0;
      const minInterval = 100; // 最小间隔100ms
      
      if (now - lastPlayTime < minInterval) {
        console.log(`防止重复播放: ${soundKey}, 距离上次播放仅 ${now - lastPlayTime}ms`);
        return;
      }
      this.lastPlayedTimes.set(soundKey, now);
      
      this.playCharacterSound(characterType, actionType, soundType);
    }
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