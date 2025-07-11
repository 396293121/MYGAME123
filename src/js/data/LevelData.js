/**
 * 关卡数据
 * 定义游戏中的所有关卡和地点信息
 */

const LevelData = {
  // 关卡配置数据
  levels: [
    // 战士第一章关卡
    { 
      id: 1,
      key: 'warrior_village', 
      map: 'assets/maps/warrior_village.json', 
      name: '战士部落',
      difficulty: 'easy',
      enemies: [],
      backgroundMusic: 'village_music',
      description: '战士部落是一个以勇猛著称的部落聚居地，由部落酋长领导。这里的战士以强健的体魄和精湛的武艺闻名。',
      requiredLevel: 1,
      locationId: 'warrior_village',
      safeZone: true,
      rewards: {
        experience: 50,
        gold: 0,
        items: []
      }
    },
    { 
      id: 2,
      key: 'boar_forest', 
      map: 'assets/maps/boar_forest.json', 
      name: '野猪森林',
      difficulty: 'easy',
      enemies: ['wild_boar', 'large_boar'],
      backgroundMusic: 'forest_battle_music',
      description: '战士部落南部的茂密森林，现在被野猪群占据。深处有一个野猪王的巢穴。',
      requiredLevel: 1,
      locationId: 'boar_forest',
      safeZone: false,
      rewards: {
        experience: 80,
        gold: 30,
        items: ['health_potion_small']
      }
    },
    { 
      id: 3,
      key: 'boar_king_den', 
      map: 'assets/maps/boar_king_den.json', 
      name: '猪王巢穴',
      difficulty: 'medium',
      enemies: ['wild_boar', 'large_boar', 'boar_king'],
      backgroundMusic: 'boss_battle_music',
      description: '野猪王的领地，这里遍布野猪的痕迹，空气中弥漫着野兽的气息。',
      requiredLevel: 2,
      locationId: 'boar_king_den',
      safeZone: false,
      rewards: {
        experience: 150,
        gold: 100,
        items: ['health_potion_medium', 'strength_potion']
      }
    },
    { 
      id: 4,
      key: 'ancient_altar', 
      map: 'assets/maps/ancient_altar.json', 
      name: '古老祭坛',
      difficulty: 'medium',
      enemies: ['mysterious_stranger'],
      backgroundMusic: 'mystical_battle_music',
      description: '战士部落西边的一处古老祭坛，据说是古代文明留下的遗迹。最近有神秘人在此活动。',
      requiredLevel: 3,
      locationId: 'ancient_altar',
      safeZone: false,
      rewards: {
        experience: 200,
        gold: 150,
        items: ['mysterious_emblem']
      }
    },
    { 
      id: 5,
      key: 'eastern_village', 
      map: 'assets/maps/eastern_village.json', 
      name: '东方村庄',
      difficulty: 'easy',
      enemies: [],
      backgroundMusic: 'village_music',
      description: '位于远东的村庄，这里有一位村长，他知道关于觉醒力量的传说。',
      requiredLevel: 5,
      locationId: 'eastern_village',
      safeZone: true,
      rewards: {
        experience: 100,
        gold: 0,
        items: []
      }
    },
    { 
      id: 6,
      key: 'ancient_temple', 
      map: 'assets/maps/ancient_temple.json', 
      name: '古老神殿',
      difficulty: 'medium',
      enemies: ['skeleton', 'ghost'],
      backgroundMusic: 'temple_music',
      description: '东方村庄外的一座古老神殿，据说里面藏有关于觉醒力量的线索。',
      requiredLevel: 5,
      locationId: 'ancient_temple',
      safeZone: false,
      rewards: {
        experience: 150,
        gold: 100,
        items: ['ancient_scroll']
      }
    },
    { 
      id: 7,
      key: 'sage_tower', 
      map: 'assets/maps/sage_tower.json', 
      name: '贤者塔楼',
      difficulty: 'easy',
      enemies: [],
      backgroundMusic: 'mystical_music',
      description: '山顶上的塔楼，住着一位精通古老知识的贤者，他可以帮助解读关于觉醒力量的古老卷轴。',
      requiredLevel: 6,
      locationId: 'sage_tower',
      safeZone: true,
      rewards: {
        experience: 120,
        gold: 0,
        items: []
      }
    },
    { 
      id: 8,
      key: 'crystal_cave', 
      map: 'assets/maps/crystal_cave.json', 
      name: '水晶洞穴',
      difficulty: 'hard',
      enemies: ['elemental_guardian'],
      backgroundMusic: 'cave_music',
      description: '贤者塔楼附近的洞穴，里面生长着觉醒仪式所需的元素水晶。',
      requiredLevel: 6,
      locationId: 'crystal_cave',
      safeZone: false,
      rewards: {
        experience: 180,
        gold: 120,
        items: ['elemental_crystal']
      }
    },
    { 
      id: 9,
      key: 'royal_city', 
      map: 'assets/maps/royal_city.json', 
      name: '王城',
      difficulty: 'easy',
      enemies: [],
      backgroundMusic: 'city_music',
      description: '王国的首都，这里有皇家骑士团，他们正在调查黑暗势力的活动。',
      requiredLevel: 8,
      locationId: 'royal_city',
      safeZone: true,
      rewards: {
        experience: 150,
        gold: 200,
        items: []
      }
    },
    { 
      id: 10,
      key: 'border_outpost', 
      map: 'assets/maps/border_outpost.json', 
      name: '边境前哨站',
      difficulty: 'medium',
      enemies: ['bandit', 'dark_cultist'],
      backgroundMusic: 'tension_music',
      description: '王国东部边境的前哨站，这里的指挥官掌握着关于暗影教团活动的情报。',
      requiredLevel: 8,
      locationId: 'border_outpost',
      safeZone: false,
      rewards: {
        experience: 200,
        gold: 150,
        items: ['military_badge']
      }
    },
    { 
      id: 11,
      key: 'dark_ritual_site', 
      map: 'assets/maps/dark_ritual_site.json', 
      name: '黑暗仪式场所',
      difficulty: 'hard',
      enemies: ['dark_cultist', 'shadow_beast', 'dark_mage'],
      backgroundMusic: 'dark_ritual_music',
      description: '边境地区的一处隐蔽场所，暗影教团在此进行邪恶的仪式，试图唤醒某种黑暗力量。',
      requiredLevel: 10,
      locationId: 'dark_ritual_site',
      safeZone: false,
      rewards: {
        experience: 300,
        gold: 250,
        items: ['shadow_essence', 'dark_tome']
      }
    },
    { 
      id: 12,
      key: 'warrior_dojo', 
      map: 'assets/maps/warrior_dojo.json', 
      name: '武术道场',
      difficulty: 'medium',
      enemies: ['training_dummy'],
      backgroundMusic: 'training_music',
      description: '由武术大师经营的道场，这里可以接受战士的特殊试炼，解锁更强大的觉醒能力。',
      requiredLevel: 12,
      locationId: 'warrior_dojo',
      safeZone: true,
      rewards: {
        experience: 250,
        gold: 0,
        items: []
      }
    },
    { 
      id: 13,
      key: 'magic_academy', 
      map: 'assets/maps/magic_academy.json', 
      name: '魔法学院',
      difficulty: 'medium',
      enemies: [],
      backgroundMusic: 'magical_music',
      description: '由大法师领导的魔法学院，法师可以在这里接受特殊试炼，解锁更强大的觉醒能力。',
      requiredLevel: 12,
      locationId: 'magic_academy',
      safeZone: true,
      rewards: {
        experience: 250,
        gold: 0,
        items: []
      }
    },
    { 
      id: 14,
      key: 'ancient_forest', 
      map: 'assets/maps/ancient_forest.json', 
      name: '远古森林',
      difficulty: 'medium',
      enemies: ['wolf', 'forest_spirit'],
      backgroundMusic: 'forest_music',
      description: '一片神秘的远古森林，猎人大师在此居住，弓箭手可以在这里接受特殊试炼，解锁更强大的觉醒能力。',
      requiredLevel: 12,
      locationId: 'ancient_forest',
      safeZone: false,
      rewards: {
        experience: 250,
        gold: 100,
        items: ['rare_herb']
      }
    },
    { 
      id: 15,
      key: 'haunted_mine', 
      map: 'assets/maps/haunted_mine.json', 
      name: '闹鬼矿井',
      difficulty: 'hard',
      enemies: ['thief', 'bandit'],
      backgroundMusic: 'spooky_music',
      description: '村庄西边的矿井，据说闹鬼，实际上是盗贼在捣鬼，想独占矿井中的宝石。',
      requiredLevel: 7,
      locationId: 'haunted_mine',
      safeZone: false,
      rewards: {
        experience: 220,
        gold: 180,
        items: ['gem_shard', 'miner_pickaxe']
      }
    },
    { 
      id: 16,
      key: 'forgotten_ruins', 
      map: 'assets/maps/forgotten_ruins.json', 
      name: '被遗忘的遗迹',
      difficulty: 'very_hard',
      enemies: ['ancient_guardian', 'stone_golem'],
      backgroundMusic: 'ancient_ruins_music',
      description: '一处古老文明的遗迹，据说隐藏着强大的神器"先知之眼"，但有古老的守护者保护着它。',
      requiredLevel: 15,
      locationId: 'forgotten_ruins',
      safeZone: false,
      rewards: {
        experience: 400,
        gold: 300,
        items: ['prophets_eye']
      }
    }
  ],
  
  // 位置数据
  locations: {
    'warrior_village': {
      name: '战士部落',
      description: '战士部落是一个以勇猛著称的部落聚居地，由部落酋长领导。这里的战士以强健的体魄和精湛的武艺闻名。',
      discoveryExp: 100,
      connections: [
        { locationId: 'boar_forest', condition: null },
        { locationId: 'ancient_altar', condition: 'quest_warrior_ch1_hunting_completed' },
        { locationId: 'eastern_village', condition: 'quest_warrior_ch1_departure_started' }
      ]
    },
    'boar_forest': {
      name: '野猪森林',
      description: '战士部落南部的茂密森林，现在被野猪群占据。',
      discoveryExp: 80,
      connections: [
        { locationId: 'warrior_village', condition: null },
        { locationId: 'boar_king_den', condition: 'kill_wild_boars_5' }
      ]
    },
    'boar_king_den': {
      name: '猪王巢穴',
      description: '野猪王的领地，这里遍布野猪的痕迹，空气中弥漫着野兽的气息。',
      discoveryExp: 120,
      connections: [
        { locationId: 'boar_forest', condition: null }
      ]
    },
    'ancient_altar': {
      name: '古老祭坛',
      description: '战士部落西边的一处古老祭坛，据说是古代文明留下的遗迹。',
      discoveryExp: 150,
      connections: [
        { locationId: 'warrior_village', condition: null }
      ]
    },
    'eastern_village': {
      name: '东方村庄',
      description: '位于远东的村庄，这里有一位村长，他知道关于觉醒力量的传说。',
      discoveryExp: 200,
      connections: [
        { locationId: 'warrior_village', condition: 'quest_warrior_ch1_departure_completed' },
        { locationId: 'ancient_temple', condition: 'quest_main_start_started' },
        { locationId: 'sage_tower', condition: 'quest_main_start_completed' }
      ]
    },
    'ancient_temple': {
      name: '古老神殿',
      description: '东方村庄外的一座古老神殿，据说里面藏有关于觉醒力量的线索。',
      discoveryExp: 180,
      connections: [
        { locationId: 'eastern_village', condition: null }
      ]
    },
    'sage_tower': {
      name: '贤者塔楼',
      description: '山顶上的塔楼，住着一位精通古老知识的贤者，他可以帮助解读关于觉醒力量的古老卷轴。',
      discoveryExp: 220,
      connections: [
        { locationId: 'eastern_village', condition: null },
        { locationId: 'crystal_cave', condition: 'quest_main_power_awakening_started' },
        { locationId: 'royal_city', condition: 'quest_main_power_awakening_completed' }
      ]
    },
    'crystal_cave': {
      name: '水晶洞穴',
      description: '贤者塔楼附近的洞穴，里面生长着觉醒仪式所需的元素水晶。',
      discoveryExp: 200,
      connections: [
        { locationId: 'sage_tower', condition: null }
      ]
    },
    'royal_city': {
      name: '王城',
      description: '王国的首都，这里有皇家骑士团，他们正在调查黑暗势力的活动。',
      discoveryExp: 250,
      connections: [
        { locationId: 'sage_tower', condition: null },
        { locationId: 'border_outpost', condition: 'quest_main_dark_forces_started' },
        { locationId: 'warrior_dojo', condition: 'class_warrior' },
        { locationId: 'magic_academy', condition: 'class_mage' },
        { locationId: 'ancient_forest', condition: 'class_archer' },
        { locationId: 'haunted_mine', condition: null },
        { locationId: 'forgotten_ruins', condition: 'quest_side_ancient_artifact_started' }
      ]
    },
    'border_outpost': {
      name: '边境前哨站',
      description: '王国东部边境的前哨站，这里的指挥官掌握着关于暗影教团活动的情报。',
      discoveryExp: 230,
      connections: [
        { locationId: 'royal_city', condition: null },
        { locationId: 'dark_ritual_site', condition: 'quest_main_dark_forces_progressed' }
      ]
    },
    'dark_ritual_site': {
      name: '黑暗仪式场所',
      description: '边境地区的一处隐蔽场所，暗影教团在此进行邪恶的仪式，试图唤醒某种黑暗力量。',
      discoveryExp: 300,
      connections: [
        { locationId: 'border_outpost', condition: null }
      ]
    },
    'warrior_dojo': {
      name: '武术道场',
      description: '由武术大师经营的道场，这里可以接受战士的特殊试炼，解锁更强大的觉醒能力。',
      discoveryExp: 270,
      connections: [
        { locationId: 'royal_city', condition: null }
      ]
    },
    'magic_academy': {
      name: '魔法学院',
      description: '由大法师领导的魔法学院，法师可以在这里接受特殊试炼，解锁更强大的觉醒能力。',
      discoveryExp: 270,
      connections: [
        { locationId: 'royal_city', condition: null }
      ]
    },
    'ancient_forest': {
      name: '远古森林',
      description: '一片神秘的远古森林，猎人大师在此居住，弓箭手可以在这里接受特殊试炼，解锁更强大的觉醒能力。',
      discoveryExp: 270,
      connections: [
        { locationId: 'royal_city', condition: null }
      ]
    },
    'haunted_mine': {
      name: '闹鬼矿井',
      description: '村庄西边的矿井，据说闹鬼，实际上是盗贼在捣鬼，想独占矿井中的宝石。',
      discoveryExp: 210,
      connections: [
        { locationId: 'royal_city', condition: null }
      ]
    },
    'forgotten_ruins': {
      name: '被遗忘的遗迹',
      description: '一处古老文明的遗迹，据说隐藏着强大的神器"先知之眼"，但有古老的守护者保护着它。',
      discoveryExp: 350,
      connections: [
        { locationId: 'royal_city', condition: null }
      ]
    }
  }
};

export default LevelData;