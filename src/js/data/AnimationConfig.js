/**
 * 动画配置文件
 * 定义所有角色的动画配置信息
 */

const ANIMATION_CONFIGS = {
  warrior: {
    textureKey: 'warrior_sprite2', // 使用新的精灵图
    // 统一尺寸配置 - 更新为新的画布尺寸
    standardSize: {
      width: 213,
      height: 144
    },
    // 锚点配置 - 角色在中心底部，脚底中心为(0.5, 1.0)
    anchorPoint: {
      x: 0.5,
      y: 1.0  // 底部对齐
    },
    // 物理体配置 - 简化配置，角色左右对称
    physicsBody: {
      width: 41,   // 实际角色宽度
      height: 94,  // 实际角色高度
      offsetX: 0,  // X轴偏移为0，因为角色已在中心位置且左右对称
      offsetY: 50  // Y轴偏移（从画布底部向上50像素到角色底部）
    },
    // 增强动画系统配置
    enhancedAnimation: {
      // 跳跃动画配置
      jump: {
        velocityThresholds: {
          rising: -50,    // 上升状态的速度阈值
          falling: 50     // 下落状态的速度阈值
        },
        frameDistribution: {
          risingEndFrame: 10,      // 上升动画结束帧（具体帧数）
          fallingStartFrame: 11,   // 下落动画开始帧（具体帧数）
          fallingEndFrame: 14     // 下落动画结束帧（具体帧数）
        },
        frameRateMultiplier: {
          rising: 1.0,    // 上升动画帧率倍数
          falling: 0.8    // 下落动画帧率倍数（稍慢）
        },
        holdLastFrame: true     // 是否在最后一帧停留而不循环
      },
      // 攻击动画配置
      attack: {
        keyFrame: {
          frameNumber: 7        // 关键帧的具体帧数（对应实际第6帧）
        },
        //剑伸出剑尖X坐标：180 角色中心106
        hitbox: {
          width: 74,           // 攻击宽度（像素）
          height: 100,         // 攻击高度（像素）
          offsetX: 0,          // X轴偏移（剑伸出的距离）
          offsetY: -15         // Y轴偏移（攻击框向上的偏移）
        }
      },
      // 重斩技能动画配置
      heavy_slash: {
        keyFrame: {
          frameNumber: 15       // 重斩关键帧（30帧动画的50%处）
        }
      },
      // 旋风斩技能动画配置
      whirlwind: {
        keyFrame: {
          frameNumber: 14       // 旋风斩关键帧（28帧动画的50%处）
        }
      },
      // 战吼技能动画配置
      battle_cry: {
        keyFrame: {
          frameNumber: 14       // 战吼关键帧（27帧动画的50%处）
        }
      }
    },
    animations: {
      idle: {
        key: 'warrior_idle',
        frames: {
          type: 'frameNames',
          prefix: '战士站立_frame_',
          start: 1,
          end: 20,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 5,
        repeat: -1
      },
      move: {
        key: 'warrior_move',
        frames: {
          type: 'frameNames',
          prefix: '战士行走_frame_',
          start: 1,
          end: 20,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 10,
        repeat: -1
      },
      attack: {
        key: 'warrior_attack',
        frames: {
          type: 'frameNames',
          prefix: '战士攻击_frame_',
          start: 1,
          end: 10,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 15,
        repeat: 0
      },
      heavy_slash: {
        key: 'warrior_heavy_slash',
        frames: {
          type: 'frameNames',
          prefix: '战士重斩_frame_',
          start: 1,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 20,
        repeat: 0
      },
      whirlwind: {
        key: 'warrior_whirlwind',
        frames: {
          type: 'frameNames',
          prefix: '战士旋风斩_frame_',
          start: 1,
          end: 28,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 16,
        repeat: 0
      },
      battle_cry: {
        key: 'warrior_battle_cry',
        frames: {
          type: 'frameNames',
          prefix: '战士战吼_frame_',
          start: 1,
          end: 27,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 12,
        repeat: 0
      },
      jump: {
        key: 'warrior_jump',
        frames: {
          type: 'frameNames',
          prefix: '战士跳跃_frame_',
          start: 1,
          end: 17,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 8,
        repeat: 0
      },
      hurt: {
        key: 'warrior_hurt',
        frames: {
          type: 'frameNames',
          prefix: '战士受伤_frame_',
          start: 1,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 12,
        repeat: 0
      },
      die: {
        key: 'warrior_die',
        frames: {
          type: 'frameNames',
          prefix: '战士死亡_frame_',
          start: 1,
          end: 30,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 10,
        repeat: 0
      }
    }
  },

  mage: {
    textureKey: 'mage',
    // 标准尺寸配置
    standardSize: {
      width: 64,
      height: 64
    },
    // 锚点配置
    anchorPoint: {
      x: 0.5,
      y: 1.0
    },
    // 物理体配置
    physicsBody: {
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 16
    },
    // 增强动画系统配置
    enhancedAnimation: {
      // 跳跃动画配置
      jump: {
        velocityThresholds: {
          rising: -40,    // 上升状态的速度阈值
          falling: 40     // 下落状态的速度阈值
        },
        frameDistribution: {
          risingEndFrame: 1,      // 上升动画结束帧（具体帧数）
          fallingStartFrame: 2,   // 下落动画开始帧（具体帧数）
          fallingEndFrame: 3      // 下落动画结束帧（具体帧数）
        },
        frameRateMultiplier: {
          rising: 1.0,    // 上升动画帧率倍数
          falling: 0.8    // 下落动画帧率倍数
        },
        holdLastFrame: true     // 是否在最后一帧停留而不循环
      },
      // 攻击动画配置
      attack: {
        keyFrame: {
          frameNumber: 2        // 关键帧的具体帧数（法师攻击释放更早）
        },
        hitbox: {
          width: 150,           // 攻击宽度（法师攻击范围更大）
          height: 80,           // 攻击高度
          offsetX: 40,          // X轴偏移
          offsetY: 80           // Y轴偏移
        }
      }
    },
    animations: {
      idle: {
        key: 'mage_idle',
        frames: {
          type: 'frameNumbers',
          start: 0,
          end: 3
        },
        frameRate: 5,
        repeat: -1
      },
      move: {
        key: 'mage_move',
        frames: {
          type: 'frameNumbers',
          start: 4,
          end: 9
        },
        frameRate: 10,
        repeat: -1
      },
      jump: {
        key: 'mage_jump',
        frames: {
          type: 'frameNumbers',
          start: 10,
          end: 12
        },
        frameRate: 5,
        repeat: 0
      },
      attack: {
        key: 'mage_attack',
        frames: {
          type: 'frameNumbers',
          start: 13,
          end: 16
        },
        frameRate: 12,
        repeat: 0
      },
      cast: {
        key: 'mage_cast',
        frames: {
          type: 'frameNumbers',
          start: 17,
          end: 20
        },
        frameRate: 10,
        repeat: 0
      },
      hurt: {
        key: 'mage_hurt',
        frames: {
          type: 'frameNumbers',
          start: 21,
          end: 22
        },
        frameRate: 8,
        repeat: 0
      },
      die: {
        key: 'mage_die',
        frames: {
          type: 'frameNumbers',
          start: 23,
          end: 26
        },
        frameRate: 8,
        repeat: 0
      }
    }
  },

  archer: {
    textureKey: 'archer',
    animations: {
      idle: {
        key: 'archer_idle',
        frames: {
          type: 'frameNumbers',
          start: 0,
          end: 3
        },
        frameRate: 5,
        repeat: -1
      },
      move: {
        key: 'archer_move',
        frames: {
          type: 'frameNumbers',
          start: 4,
          end: 9
        },
        frameRate: 10,
        repeat: -1
      },
      jump: {
        key: 'archer_jump',
        frames: {
          type: 'frameNumbers',
          start: 10,
          end: 12
        },
        frameRate: 5,
        repeat: 0
      },
      attack: {
        key: 'archer_attack',
        frames: {
          type: 'frameNumbers',
          start: 13,
          end: 16
        },
        frameRate: 12,
        repeat: 0
      },
      aim: {
        key: 'archer_aim',
        frames: {
          type: 'frameNumbers',
          start: 17,
          end: 19
        },
        frameRate: 8,
        repeat: 0
      },
      hurt: {
        key: 'archer_hurt',
        frames: {
          type: 'frameNumbers',
          start: 20,
          end: 21
        },
        frameRate: 8,
        repeat: 0
      },
      die: {
        key: 'archer_die',
        frames: {
          type: 'frameNumbers',
          start: 22,
          end: 25
        },
        frameRate: 8,
        repeat: 0
      }
    }
  }
};

export { ANIMATION_CONFIGS };
export default ANIMATION_CONFIGS;