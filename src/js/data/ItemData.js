/**
 * 物品数据库
 * 存储游戏中所有可用的消耗品、材料和任务物品数据
 */

const ItemData = {
  // 消耗品
  consumables: {
    HEALTH_POTION_SMALL: {
      id: 'health_potion_small',
      name: '小型生命药水',
      description: '恢复少量生命值。',
      type: 'consumable',
      rarity: 'common',
      icon: 'health_potion_small_icon',
      stackable: true,
      maxStack: 10,
      value: 5,
      usable: true,
      effects: [
        {
          type: 'heal',
          value: 20,
          duration: 0
        }
      ]
    },
    
    HEALTH_POTION_MEDIUM: {
      id: 'health_potion_medium',
      name: '中型生命药水',
      description: '恢复中等生命值。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'health_potion_medium_icon',
      stackable: true,
      maxStack: 10,
      value: 15,
      usable: true,
      effects: [
        {
          type: 'heal',
          value: 50,
          duration: 0
        }
      ]
    },
    
    HEALTH_POTION_LARGE: {
      id: 'health_potion_large',
      name: '大型生命药水',
      description: '恢复大量生命值。',
      type: 'consumable',
      rarity: 'rare',
      icon: 'health_potion_large_icon',
      stackable: true,
      maxStack: 10,
      value: 30,
      usable: true,
      effects: [
        {
          type: 'heal',
          value: 100,
          duration: 0
        }
      ]
    },
    
    MANA_POTION_SMALL: {
      id: 'mana_potion_small',
      name: '小型魔法药水',
      description: '恢复少量魔法值。',
      type: 'consumable',
      rarity: 'common',
      icon: 'mana_potion_small_icon',
      stackable: true,
      maxStack: 10,
      value: 5,
      usable: true,
      effects: [
        {
          type: 'mana',
          value: 15,
          duration: 0
        }
      ]
    },
    
    MANA_POTION_MEDIUM: {
      id: 'mana_potion_medium',
      name: '中型魔法药水',
      description: '恢复中等魔法值。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'mana_potion_medium_icon',
      stackable: true,
      maxStack: 10,
      value: 15,
      usable: true,
      effects: [
        {
          type: 'mana',
          value: 40,
          duration: 0
        }
      ]
    },
    
    MANA_POTION_LARGE: {
      id: 'mana_potion_large',
      name: '大型魔法药水',
      description: '恢复大量魔法值。',
      type: 'consumable',
      rarity: 'rare',
      icon: 'mana_potion_large_icon',
      stackable: true,
      maxStack: 10,
      value: 30,
      usable: true,
      effects: [
        {
          type: 'mana',
          value: 80,
          duration: 0
        }
      ]
    },
    
    STRENGTH_POTION: {
      id: 'strength_potion',
      name: '力量药水',
      description: '暂时增加力量。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'strength_potion_icon',
      stackable: true,
      maxStack: 5,
      value: 20,
      usable: true,
      effects: [
        {
          type: 'buff',
          stat: 'strength',
          value: 5,
          duration: 60 // 60秒
        }
      ]
    },
    
    INTELLIGENCE_POTION: {
      id: 'intelligence_potion',
      name: '智力药水',
      description: '暂时增加智力。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'intelligence_potion_icon',
      stackable: true,
      maxStack: 5,
      value: 20,
      usable: true,
      effects: [
        {
          type: 'buff',
          stat: 'intelligence',
          value: 5,
          duration: 60 // 60秒
        }
      ]
    },
    
    AGILITY_POTION: {
      id: 'agility_potion',
      name: '敏捷药水',
      description: '暂时增加敏捷。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'agility_potion_icon',
      stackable: true,
      maxStack: 5,
      value: 20,
      usable: true,
      effects: [
        {
          type: 'buff',
          stat: 'agility',
          value: 5,
          duration: 60 // 60秒
        }
      ]
    },
    
    ANTIDOTE: {
      id: 'antidote',
      name: '解毒剂',
      description: '解除中毒状态。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'antidote_icon',
      stackable: true,
      maxStack: 5,
      value: 15,
      usable: true,
      effects: [
        {
          type: 'cure',
          status: 'poison'
        }
      ]
    },
    
    FIRE_BOMB: {
      id: 'fire_bomb',
      name: '火焰炸弹',
      description: '对目标区域造成火焰伤害。',
      type: 'consumable',
      rarity: 'uncommon',
      icon: 'fire_bomb_icon',
      stackable: true,
      maxStack: 5,
      value: 25,
      usable: true,
      effects: [
        {
          type: 'damage',
          damageType: 'fire',
          value: 30,
          areaOfEffect: true,
          radius: 3
        }
      ]
    }
  },
  
  // 材料
  materials: {
    HERB_COMMON: {
      id: 'herb_common',
      name: '普通草药',
      description: '常见的草药，可用于制作基础药水。',
      type: 'material',
      rarity: 'common',
      icon: 'herb_common_icon',
      stackable: true,
      maxStack: 20,
      value: 2
    },
    
    HERB_RARE: {
      id: 'herb_rare',
      name: '稀有草药',
      description: '罕见的草药，可用于制作高级药水。',
      type: 'material',
      rarity: 'rare',
      icon: 'herb_rare_icon',
      stackable: true,
      maxStack: 20,
      value: 10
    },
    
    IRON_ORE: {
      id: 'iron_ore',
      name: '铁矿石',
      description: '常见的矿石，可用于锻造武器和防具。',
      type: 'material',
      rarity: 'common',
      icon: 'iron_ore_icon',
      stackable: true,
      maxStack: 20,
      value: 3
    },
    
    SILVER_ORE: {
      id: 'silver_ore',
      name: '银矿石',
      description: '较为稀有的矿石，可用于锻造高级武器和防具。',
      type: 'material',
      rarity: 'uncommon',
      icon: 'silver_ore_icon',
      stackable: true,
      maxStack: 20,
      value: 8
    },
    
    GOLD_ORE: {
      id: 'gold_ore',
      name: '金矿石',
      description: '稀有的矿石，可用于锻造高级武器和防具。',
      type: 'material',
      rarity: 'rare',
      icon: 'gold_ore_icon',
      stackable: true,
      maxStack: 20,
      value: 15
    },
    
    LEATHER: {
      id: 'leather',
      name: '皮革',
      description: '动物皮革，可用于制作轻型防具。',
      type: 'material',
      rarity: 'common',
      icon: 'leather_icon',
      stackable: true,
      maxStack: 20,
      value: 2
    },
    
    CLOTH: {
      id: 'cloth',
      name: '布料',
      description: '普通布料，可用于制作法师长袍。',
      type: 'material',
      rarity: 'common',
      icon: 'cloth_icon',
      stackable: true,
      maxStack: 20,
      value: 2
    },
    
    MAGIC_CRYSTAL: {
      id: 'magic_crystal',
      name: '魔法水晶',
      description: '蕴含魔法能量的水晶，可用于制作法杖和魔法装备。',
      type: 'material',
      rarity: 'uncommon',
      icon: 'magic_crystal_icon',
      stackable: true,
      maxStack: 10,
      value: 12
    },
    
    MONSTER_FANG: {
      id: 'monster_fang',
      name: '怪物獠牙',
      description: '从强大怪物身上获取的獠牙，可用于制作特殊装备。',
      type: 'material',
      rarity: 'uncommon',
      icon: 'monster_fang_icon',
      stackable: true,
      maxStack: 10,
      value: 8
    },
    
    DRAGON_SCALE: {
      id: 'dragon_scale',
      name: '龙鳞',
      description: '极其稀有的龙鳞，可用于制作顶级装备。',
      type: 'material',
      rarity: 'epic',
      icon: 'dragon_scale_icon',
      stackable: true,
      maxStack: 5,
      value: 50
    }
  },
  
  // 任务物品
  questItems: {
    ANCIENT_SCROLL: {
      id: 'ancient_scroll',
      name: '古老卷轴',
      description: '一卷写满古老文字的卷轴，似乎记载着重要的信息。',
      type: 'quest',
      rarity: 'uncommon',
      icon: 'ancient_scroll_icon',
      stackable: false,
      value: 0, // 任务物品无法出售
      questId: 'ancient_knowledge'
    },
    
    MAYOR_LETTER: {
      id: 'mayor_letter',
      name: '市长的信',
      description: '市长写给边境守卫的介绍信。',
      type: 'quest',
      rarity: 'common',
      icon: 'letter_icon',
      stackable: false,
      value: 0,
      questId: 'border_pass'
    },
    
    MAGIC_KEY: {
      id: 'magic_key',
      name: '魔法钥匙',
      description: '一把闪烁着蓝光的钥匙，似乎可以打开某个魔法封印。',
      type: 'quest',
      rarity: 'rare',
      icon: 'magic_key_icon',
      stackable: false,
      value: 0,
      questId: 'sealed_dungeon'
    },
    
    HERO_EMBLEM: {
      id: 'hero_emblem',
      name: '英雄徽章',
      description: '证明持有者身份的徽章，可以进入英雄大厅。',
      type: 'quest',
      rarity: 'rare',
      icon: 'hero_emblem_icon',
      stackable: false,
      value: 0,
      questId: 'hero_recognition'
    }
  },
  
  // 精血材料（用于觉醒系统升级）
  bloodEssence: {
    BLOOD_ESSENCE_MINOR: {
      id: 'blood_essence_minor',
      name: '微量精血',
      description: '从精英怪物身上提取的少量精血，可用于觉醒系统的基础升级。',
      type: 'material',
      rarity: 'uncommon',
      icon: 'blood_essence_minor_icon',
      stackable: true,
      maxStack: 99,
      value: 50,
      usable: false
    },
    
    BLOOD_ESSENCE_MEDIUM: {
      id: 'blood_essence_medium',
      name: '中量精血',
      description: 'BOSS身上提取的精血，蕴含强大的力量，可用于觉醒系统的高级升级。',
      type: 'material',
      rarity: 'rare',
      icon: 'blood_essence_medium_icon',
      stackable: true,
      maxStack: 99,
      value: 200,
      usable: false
    },
    
    BLOOD_ESSENCE_MAJOR: {
      id: 'blood_essence_major',
      name: '大量精血',
      description: '人型BOSS身上提取的精华精血，蕴含极其强大的力量，可用于觉醒系统的终极升级。',
      type: 'material',
      rarity: 'epic',
      icon: 'blood_essence_major_icon',
      stackable: true,
      maxStack: 99,
      value: 500,
      usable: false
    }
  }
};

export default ItemData;