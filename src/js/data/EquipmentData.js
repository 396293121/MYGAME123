/**
 * 装备数据库
 * 存储游戏中所有可用的装备数据
 */

const EquipmentData = {
  // 武器
  weapons: {
    // 战士武器
    WOODEN_SWORD: {
      id: 'wooden_sword',
      name: '木剑',
      description: '一把简单的木剑，适合初学者使用。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'common',
      icon: 'wooden_sword_icon',
      stats: {
        strength: 1,
        physicalAttack: 5
      },
      durability: 50,
      level: 1,
      requiredLevel: 1,
      value: 10,
      classRestrictions: ['warrior']
    },
    
    IRON_SWORD: {
      id: 'iron_sword',
      name: '铁剑',
      description: '一把坚固的铁剑，提供不错的攻击力。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'uncommon',
      icon: 'iron_sword_icon',
      stats: {
        strength: 2,
        physicalAttack: 10
      },
      durability: 100,
      level: 5,
      requiredLevel: 5,
      value: 50,
      classRestrictions: ['warrior']
    },
    
    STEEL_SWORD: {
      id: 'steel_sword',
      name: '钢剑',
      description: '精心打造的钢剑，锋利无比。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      icon: 'steel_sword_icon',
      stats: {
        strength: 3,
        physicalAttack: 15,
        speed: 5
      },
      durability: 150,
      level: 10,
      requiredLevel: 10,
      value: 200,
      classRestrictions: ['warrior']
    },
    
    // 法师武器
    APPRENTICE_STAFF: {
      id: 'apprentice_staff',
      name: '学徒法杖',
      description: '一根简单的木质法杖，适合初学者使用。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'common',
      icon: 'apprentice_staff_icon',
      stats: {
        intelligence: 1,
        magicAttack: 5
      },
      durability: 40,
      level: 1,
      requiredLevel: 1,
      value: 10,
      classRestrictions: ['mage']
    },
    
    FIRE_STAFF: {
      id: 'fire_staff',
      name: '火焰法杖',
      description: '杖头镶嵌着火焰宝石，可以增强火系法术。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'uncommon',
      icon: 'fire_staff_icon',
      stats: {
        intelligence: 2,
        magicAttack: 10
      },
      specialEffects: [
        {
          name: 'Fire Affinity',
          type: 'elementalBoost',
          element: 'fire',
          value: 0.2 // 20%伤害提升
        }
      ],
      durability: 80,
      level: 5,
      requiredLevel: 5,
      value: 50,
      classRestrictions: ['mage']
    },
    
    ARCANE_STAFF: {
      id: 'arcane_staff',
      name: '奥术法杖',
      description: '蕴含强大奥术能量的法杖，可以显著提升魔法攻击力。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      icon: 'arcane_staff_icon',
      stats: {
        intelligence: 3,
        magicAttack: 15,
        mana: 20
      },
      specialEffects: [
        {
          name: 'Mana Regeneration',
          type: 'regen',
          stat: 'mana',
          value: 1 // 每秒恢复1点魔法值
        }
      ],
      durability: 120,
      level: 10,
      requiredLevel: 10,
      value: 200,
      classRestrictions: ['mage']
    },
    
    // 射手武器
    HUNTING_BOW: {
      id: 'hunting_bow',
      name: '狩猎弓',
      description: '一把简单的木弓，适合初学者使用。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'common',
      icon: 'hunting_bow_icon',
      stats: {
        agility: 1,
        physicalAttack: 4,
        speed: 5
      },
      durability: 45,
      level: 1,
      requiredLevel: 1,
      value: 10,
      classRestrictions: ['archer']
    },
    
    COMPOSITE_BOW: {
      id: 'composite_bow',
      name: '复合弓',
      description: '由多种材料制成的弓，提供更好的射程和伤害。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'uncommon',
      icon: 'composite_bow_icon',
      stats: {
        agility: 2,
        physicalAttack: 8,
        speed: 10
      },
      durability: 90,
      level: 5,
      requiredLevel: 5,
      value: 50,
      classRestrictions: ['archer']
    },
    
    LONGBOW: {
      id: 'longbow',
      name: '长弓',
      description: '一把强力的长弓，可以射出穿透力极强的箭矢。',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      icon: 'longbow_icon',
      stats: {
        agility: 3,
        physicalAttack: 12,
        speed: 15
      },
      specialEffects: [
        {
          name: 'Piercing Shot',
          type: 'addSkill',
          skillId: 'piercing_shot'
        }
      ],
      durability: 130,
      level: 10,
      requiredLevel: 10,
      value: 200,
      classRestrictions: ['archer']
    }
  },
  
  // 防具
  armors: {
    // 通用防具
    LEATHER_ARMOR: {
      id: 'leather_armor',
      name: '皮甲',
      description: '由动物皮革制成的轻便护甲。',
      type: 'armor',
      slot: 'armor',
      rarity: 'common',
      icon: 'leather_armor_icon',
      stats: {
        vitality: 1,
        physicalDefense: 5
      },
      durability: 60,
      level: 1,
      requiredLevel: 1,
      value: 15
    },
    
    // 战士防具
    IRON_PLATE: {
      id: 'iron_plate',
      name: '铁甲',
      description: '由铁片制成的重型护甲，提供出色的物理防御。',
      type: 'armor',
      slot: 'armor',
      rarity: 'uncommon',
      icon: 'iron_plate_icon',
      stats: {
        vitality: 2,
        physicalDefense: 15,
        magicDefense: -5 // 金属导魔，魔法防御降低
      },
      durability: 120,
      level: 5,
      requiredLevel: 5,
      value: 60,
      classRestrictions: ['warrior']
    },
    
    // 法师防具
    MAGE_ROBE: {
      id: 'mage_robe',
      name: '法师长袍',
      description: '由特殊材料制成的长袍，可以增强魔法能力。',
      type: 'armor',
      slot: 'armor',
      rarity: 'uncommon',
      icon: 'mage_robe_icon',
      stats: {
        intelligence: 2,
        magicDefense: 10,
        physicalDefense: 3,
        mana: 15
      },
      durability: 70,
      level: 5,
      requiredLevel: 5,
      value: 60,
      classRestrictions: ['mage']
    },
    
    // 射手防具
    RANGER_VEST: {
      id: 'ranger_vest',
      name: '游侠背心',
      description: '轻便而灵活的皮革背心，不会影响移动速度。',
      type: 'armor',
      slot: 'armor',
      rarity: 'uncommon',
      icon: 'ranger_vest_icon',
      stats: {
        agility: 2,
        physicalDefense: 8,
        speed: 10
      },
      durability: 90,
      level: 5,
      requiredLevel: 5,
      value: 60,
      classRestrictions: ['archer']
    }
  },
  
  // 头盔
  helmets: {
    LEATHER_CAP: {
      id: 'leather_cap',
      name: '皮帽',
      description: '简单的皮革帽子，提供基本的头部保护。',
      type: 'armor',
      slot: 'helmet',
      rarity: 'common',
      icon: 'leather_cap_icon',
      stats: {
        physicalDefense: 3
      },
      durability: 50,
      level: 1,
      requiredLevel: 1,
      value: 10
    },
    
    IRON_HELMET: {
      id: 'iron_helmet',
      name: '铁盔',
      description: '坚固的铁制头盔，提供出色的头部保护。',
      type: 'armor',
      slot: 'helmet',
      rarity: 'uncommon',
      icon: 'iron_helmet_icon',
      stats: {
        vitality: 1,
        physicalDefense: 8
      },
      durability: 100,
      level: 5,
      requiredLevel: 5,
      value: 40,
      classRestrictions: ['warrior']
    },
    
    WIZARD_HAT: {
      id: 'wizard_hat',
      name: '巫师帽',
      description: '传统的尖顶巫师帽，增强魔法能力。',
      type: 'armor',
      slot: 'helmet',
      rarity: 'uncommon',
      icon: 'wizard_hat_icon',
      stats: {
        intelligence: 2,
        magicDefense: 5
      },
      durability: 60,
      level: 5,
      requiredLevel: 5,
      value: 40,
      classRestrictions: ['mage']
    },
    
    RANGER_HOOD: {
      id: 'ranger_hood',
      name: '游侠兜帽',
      description: '轻便的兜帽，提供良好的视野。',
      type: 'armor',
      slot: 'helmet',
      rarity: 'uncommon',
      icon: 'ranger_hood_icon',
      stats: {
        agility: 1,
        physicalDefense: 4,
        speed: 5
      },
      durability: 80,
      level: 5,
      requiredLevel: 5,
      value: 40,
      classRestrictions: ['archer']
    }
  },
  
  // 饰品
  accessories: {
    HEALTH_AMULET: {
      id: 'health_amulet',
      name: '生命护符',
      description: '增加佩戴者的最大生命值。',
      type: 'accessory',
      slot: 'accessory',
      rarity: 'uncommon',
      icon: 'health_amulet_icon',
      stats: {
        vitality: 2,
        health: 20
      },
      level: 1,
      requiredLevel: 1,
      value: 30
    },
    
    MANA_RING: {
      id: 'mana_ring',
      name: '魔力戒指',
      description: '增加佩戴者的最大魔法值。',
      type: 'accessory',
      slot: 'accessory',
      rarity: 'uncommon',
      icon: 'mana_ring_icon',
      stats: {
        intelligence: 1,
        mana: 15
      },
      level: 1,
      requiredLevel: 1,
      value: 30
    },
    
    SPEED_BOOTS: {
      id: 'speed_boots',
      name: '疾行靴',
      description: '增加佩戴者的移动速度。',
      type: 'accessory',
      slot: 'accessory',
      rarity: 'uncommon',
      icon: 'speed_boots_icon',
      stats: {
        agility: 1,
        speed: 15
      },
      level: 1,
      requiredLevel: 1,
      value: 30
    },
    
    STRENGTH_BRACERS: {
      id: 'strength_bracers',
      name: '力量护腕',
      description: '增加佩戴者的力量。',
      type: 'accessory',
      slot: 'accessory',
      rarity: 'uncommon',
      icon: 'strength_bracers_icon',
      stats: {
        strength: 2,
        physicalAttack: 5
      },
      level: 1,
      requiredLevel: 1,
      value: 30
    }
  }
};

export default EquipmentData;