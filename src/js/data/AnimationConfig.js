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
          end: 14,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 15,
        repeat: 0
      },
      jump: {
        key: 'warrior_jump',
        frames: {
          type: 'frameNames',
          prefix: '战士跳跃_frame_',
          start: 1,
          end: 10,
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
          prefix: '战士站立_frame_',
          start: 1,
          end: 2,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 8,
        repeat: 0
      },
      die: {
        key: 'warrior_die',
        frames: {
          type: 'frameNames',
          prefix: '战士站立_frame_',
          start: 1,
          end: 4,
          zeroPad: 6,
          suffix: '.png'
        },
        frameRate: 8,
        repeat: 0
      }
    }
  },

  mage: {
    textureKey: 'mage',
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

export default ANIMATION_CONFIGS;