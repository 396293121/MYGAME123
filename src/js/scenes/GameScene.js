/**
 * 游戏主场景
 * 包含游戏的核心逻辑
 */

import Warrior from '../classes/Warrior.js';
import Mage from '../classes/Mage.js';
import Archer from '../classes/Archer.js';
import SkillSystem from '../systems/SkillSystem.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.enemies = null;
    this.skillSystem = null;
    this.levelData = null; // 当前关卡数据
  }
  
  /**
   * 初始化场景数据
   * @param {Object} data - 场景初始化数据
   */
  init(data) {
    // 获取关卡数据，如果没有提供则使用关卡管理器中的当前关卡
    this.levelData = data?.levelData || this.game.gameManager.levelManager.getCurrentLevel();
    console.log(`加载关卡: ${this.levelData.name}`);
  }

  preload() {
    // 加载游戏资源
    this.load.image('tileset', 'assets/images/tilesets/tileset.png');
    this.load.tilemapTiledJSON('map', this.levelData.map);
    
    // 加载角色精灵图
    this.load.spritesheet('warrior', 'assets/images/characters/warrior_spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('mage', 'assets/images/characters/mage_spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('archer', 'assets/images/characters/archer_spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // 加载敌人精灵图
    this.load.spritesheet('slime', 'assets/images/enemies/slime_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // 加载技能效果
    this.load.spritesheet('skill_effects', 'assets/images/ui/effects/skill_effects.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // 加载物品图标
    this.load.spritesheet('items', 'assets/images/items/icons/items_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // 加载音效
    this.load.audio('game_music', 'assets/audio/game_music.mp3');
    this.load.audio('jump_sound', 'assets/audio/jump.mp3');
    this.load.audio('attack_sound', 'assets/audio/attack.mp3');
    this.load.audio('hit_sound', 'assets/audio/hit.mp3');
  }

  create() {
    // 创建技能系统
    this.skillSystem = new SkillSystem();
    
    // 创建地图
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tileset');
    
    // 创建图层
    const backgroundLayer = map.createLayer('Background', tileset, 0, 0);
    const platformLayer = map.createLayer('Platforms', tileset, 0, 0);
    
    // 设置当前关卡名称
    this.gameManager.gameState.currentLocation = this.levelData.name;
    
    // 设置碰撞
    platformLayer.setCollisionByProperty({ collides: true });
    
    // 获取选择的角色类型
    const selectedCharacter = this.registry.get('selectedCharacter') || 'warrior';
    
    // 创建玩家角色
    const spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn');
    
    switch (selectedCharacter) {
      case 'warrior':
        this.player = new Warrior(this, spawnPoint.x, spawnPoint.y);
        break;
      case 'mage':
        this.player = new Mage(this, spawnPoint.x, spawnPoint.y);
        break;
      case 'archer':
        this.player = new Archer(this, spawnPoint.x, spawnPoint.y);
        break;
      default:
        this.player = new Warrior(this, spawnPoint.x, spawnPoint.y);
    }
    
    // 添加物理
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    
    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, platformLayer);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 从地图中获取敌人位置并创建敌人
    const enemyPoints = map.filterObjects('Objects', obj => obj.name === 'Enemy');
    enemyPoints.forEach(point => {
      const enemy = this.enemies.create(point.x, point.y, 'slime');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.2);
      enemy.health = 30;
      
      // 简单的敌人AI
      this.tweens.add({
        targets: enemy,
        x: point.x + 100,
        ease: 'Linear',
        duration: 2000,
        yoyo: true,
        repeat: -1
      });
    });
    
    // 设置敌人与平台的碰撞
    this.physics.add.collider(this.enemies, platformLayer);
    
    // 设置玩家与敌人的碰撞
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
    
    // 创建关卡传送门
    this.createLevelPortals(map);
    
    // 设置相机跟随玩家
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
    
    // 创建控制键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加技能按键
    this.skillKeys = {
      skill1: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      skill2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      skill3: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      skill4: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };
    
    
    // 播放背景音乐
    this.sound.play('game_music', { loop: true, volume: 0.3 });
  }
  
  // 初始化游戏系统
  initSystems() {
    // 获取游戏管理器
    this.gameManager = this.game.gameManager;
    
    // 初始化技能系统
    this.skillSystem = this.gameManager.skillSystem;
    
    // 初始化敌人系统
    this.enemySystem = this.gameManager.enemySystem;
    
    // 初始化物品系统
    this.itemSystem = this.gameManager.itemSystem;
    
    // 初始化库存系统
    this.inventorySystem = this.gameManager.inventorySystem;
    
    // 初始化存档系统
    this.saveSystem = this.gameManager.saveSystem;
    
    // 设置当前场景
    this.gameManager.setCurrentScene(this);
  }
  
  // 创建控制键
  createControls() {
    // 移动键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 攻击键
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 技能键
    this.skillKeys = {
      skill1: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      skill2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      skill3: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      skill4: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };
    
    // 物品和存档键
    this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    
    // 添加物品和存档键的事件监听
    this.inventoryKey.on('down', () => {
      this.toggleInventory();
    });
    
    this.saveKey.on('down', () => {
      this.saveGame();
    });
  }
  
  update() {
    if (!this.player) return;
    
    // 处理玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
    }
    
    // 处理跳跃
    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-330);
      this.sound.play('jump_sound', { volume: 0.5 });
    }
    
    // 处理攻击
    if (this.cursors.space.isDown && this.player.canAttack) {
      this.playerAttack();
    }
    
    // 处理技能
    this.handleSkills();
    
    // 更新游戏管理器
    this.gameManager.update(this.time.now);
  }
  
  
 
  
  // 处理玩家攻击
  playerAttack() {
    this.player.canAttack = false;
    this.sound.play('attack_sound', { volume: 0.5 });
    
    // 获取攻击结果
    const attackResult = this.player.attack();
    
    // 创建攻击效果
    let attackRange = 50; // 默认攻击范围
    
    if (this.player.attackRange === 'ranged') {
      // 远程攻击效果
      attackRange = 200;
      
      // 创建投射物
      const projectile = this.physics.add.sprite(
        this.player.x,
        this.player.y,
        'skill_effects'
      );
      
      // 根据角色类型设置不同的投射物外观
      if (this.player instanceof Mage) {
        projectile.setFrame(1); // 火球
      } else if (this.player instanceof Archer) {
        projectile.setFrame(2); // 箭
      }
      
      // 设置投射物方向和速度
      const direction = this.player.flipX ? -1 : 1;
      projectile.setVelocityX(direction * 300);
      
      // 设置投射物碰撞
      this.physics.add.overlap(projectile, this.enemies, (proj, enemy) => {
        this.damageEnemy(enemy, attackResult.damage);
        proj.destroy();
      });
      
      // 3秒后销毁投射物
      this.time.delayedCall(3000, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    } else {
      // 近战攻击效果
      const direction = this.player.flipX ? -1 : 1;
      const attackArea = new Phaser.Geom.Rectangle(
        this.player.x + (direction * 30),
        this.player.y,
        attackRange,
        60
      );
      
      // 检测攻击区域内的敌人
      this.enemies.getChildren().forEach(enemy => {
        if (Phaser.Geom.Rectangle.ContainsPoint(
          attackArea,
          new Phaser.Geom.Point(enemy.x, enemy.y)
        )) {
          this.damageEnemy(enemy, attackResult.damage);
        }
      });
      
      // 显示攻击效果
      const effect = this.add.sprite(
        this.player.x + (direction * 30),
        this.player.y,
        'skill_effects',
        0
      );
      effect.setFlipX(direction < 0);
      
      // 播放攻击动画并在结束后销毁
      this.time.delayedCall(300, () => {
        effect.destroy();
      });
    }
    
    // 攻击冷却
    this.time.delayedCall(500, () => {
      this.player.canAttack = true;
    });
  }
  
  // 处理技能
  handleSkills() {
    // 获取角色职业对应的技能ID
    let skillIds = [];
    
    if (this.player instanceof Warrior) {
      skillIds = ['heavy_slash', 'shield_bash', 'battle_cry', 'whirlwind'];
    } else if (this.player instanceof Mage) {
      skillIds = ['fireball', 'ice_spike', 'arcane_explosion', 'teleport'];
    } else if (this.player instanceof Archer) {
      skillIds = ['quick_shot', 'piercing_arrow', 'rain_of_arrows', 'eagle_eye'];
    }
    
    // 检查技能按键
    const keys = Object.values(this.skillKeys);
    for (let i = 0; i < keys.length; i++) {
      if (Phaser.Input.Keyboard.JustDown(keys[i]) && skillIds[i]) {
        this.useSkill(skillIds[i]);
      }
    }
  }
  
  // 使用技能
  useSkill(skillId) {
    // 使用技能系统处理技能使用
    const skillResult = this.skillSystem.useSkill(this.player, skillId);
    
    if (skillResult) {
      console.log(`使用技能: ${skillId}`);
      
      // 根据技能ID执行不同效果
      switch (skillId) {
        // 战士技能
        case 'heavy_slash':
          this.executeHeavySlash();
          break;
        case 'shield_bash':
          this.executeShieldBash();
          break;
        case 'battle_cry':
          this.executeBattleCry();
          break;
        case 'whirlwind':
          this.executeWhirlwind();
          break;
          
        // 法师技能
        case 'fireball':
          this.executeFireball();
          break;
        case 'ice_spike':
          this.executeIceSpike();
          break;
        case 'arcane_explosion':
          this.executeArcaneExplosion();
          break;
        case 'teleport':
          this.executeTeleport();
          break;
          
        // 射手技能
        case 'quick_shot':
          this.executeQuickShot();
          break;
        case 'piercing_arrow':
          this.executePiercingArrow();
          break;
        case 'rain_of_arrows':
          this.executeRainOfArrows();
          break;
        case 'eagle_eye':
          this.executeEagleEye();
          break;
      }
    }
  }
  
  // 技能效果实现（示例）
  executeHeavySlash() {
    const direction = this.player.flipX ? -1 : 1;
    const attackArea = new Phaser.Geom.Rectangle(
      this.player.x + (direction * 40),
      this.player.y,
      80,
      80
    );
    
    // 检测攻击区域内的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (Phaser.Geom.Rectangle.ContainsPoint(
        attackArea,
        new Phaser.Geom.Point(enemy.x, enemy.y)
      )) {
        this.damageEnemy(enemy, this.player.stats.physicalAttack * 1.5);
      }
    });
    
    // 显示技能效果
    const effect = this.add.sprite(
      this.player.x + (direction * 40),
      this.player.y,
      'skill_effects',
      3
    );
    effect.setFlipX(direction < 0);
    effect.setScale(1.5);
    
    // 播放技能动画并在结束后销毁
    this.time.delayedCall(500, () => {
      effect.destroy();
    });
  }
  
  // 其他技能效果实现（略）
  // 这里应该实现所有技能的效果，但为了简化，只实现了一个示例
  
  // 处理玩家与敌人的碰撞
  handlePlayerEnemyCollision(player, enemy) {
    // 如果玩家正在攻击，则不受伤害
    if (player.isAttacking) return;
    
    // 玩家受到伤害
    player.takeDamage(5);
    
    // 击退效果
    const knockbackDirection = player.x < enemy.x ? -1 : 1;
    player.setVelocity(knockbackDirection * 200, -200);
    
    // 短暂无敌时间
    player.isInvulnerable = true;
    player.alpha = 0.5;
    
    this.time.delayedCall(1000, () => {
      player.isInvulnerable = false;
      player.alpha = 1;
    });
  }
  
  /**
   * 创建关卡传送门
   * @param {Phaser.Tilemaps.Tilemap} map - 当前地图
   */
  createLevelPortals(map) {
    // 从地图对象层获取传送门位置
    const portalPoints = map.filterObjects('Objects', obj => obj.name === 'Portal' || obj.name === 'LevelExit');
    
    if (portalPoints && portalPoints.length > 0) {
      // 创建传送门组
      this.portals = this.physics.add.group();
      
      portalPoints.forEach(point => {
        // 创建传送门精灵
        const portal = this.portals.create(point.x, point.y, 'skill_effects', 4);
        portal.setScale(0.8);
        portal.setAlpha(0.8);
        portal.setDepth(5);
        portal.targetLevel = point.properties?.find(p => p.name === 'targetLevel')?.value || 'next';
        
        // 添加发光效果
        this.tweens.add({
          targets: portal,
          alpha: { from: 0.6, to: 1 },
          scale: { from: 0.7, to: 0.9 },
          duration: 1500,
          yoyo: true,
          repeat: -1
        });
      });
      
      // 设置玩家与传送门的交互
      this.physics.add.overlap(this.player, this.portals, this.handlePortalCollision, null, this);
    }
  }
  
  /**
   * 处理玩家与传送门的碰撞
   * @param {Player} player - 玩家对象
   * @param {Phaser.GameObjects.Sprite} portal - 传送门对象
   */
  handlePortalCollision(player, portal) {
    // 防止重复触发
    if (this.isChangingLevel) return;
    
    this.isChangingLevel = true;
    
    // 显示传送效果
    const portalEffect = this.add.sprite(player.x, player.y, 'skill_effects', 5);
    portalEffect.setScale(1.5);
    portalEffect.setAlpha(0.7);
    
    // 播放传送动画
    this.tweens.add({
      targets: [player, portalEffect],
      alpha: 0,
      scale: 0.5,
      duration: 1000,
      onComplete: () => {
        portalEffect.destroy();
        
        // 切换到目标关卡
        this.gameManager.changeLevel(portal.targetLevel);
      }
    });
  }
  
  // 对敌人造成伤害
  damageEnemy(enemy, damage) {
    enemy.health -= damage;
    
    // 显示伤害数字
    const damageText = this.add.text(enemy.x, enemy.y - 20, Math.floor(damage).toString(), {
      fontSize: '16px',
      fill: '#ff0000'
    });
    
    // 伤害数字动画
    this.tweens.add({
      targets: damageText,
      y: enemy.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        damageText.destroy();
      }
    });
    
    // 敌人受伤闪烁
    enemy.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      enemy.clearTint();
    });
    
    // 检查敌人是否死亡
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }
  
  // 处理敌人死亡
  killEnemy(enemy) {
    // 播放死亡动画
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      y: enemy.y - 20,
      duration: 300,
      onComplete: () => {
        // 给玩家增加经验
        const expValue = enemy.experienceValue || 20;
        this.player.gainExperience(expValue);
        
        // 掉落物品
        this.dropLoot(enemy);
        
        // 回收敌人到对象池
        if (this.enemySystem && enemy.enemyType) {
          this.enemySystem.recycleEnemy(enemy);
        } else {
          // 兼容旧的敌人对象
          enemy.destroy();
        }
      }
    });
  }
  
  // 掉落物品
  dropLoot(enemy) {
    // 根据敌人类型和随机概率掉落物品
    const dropChance = Math.random();
    
    // 检查是否为精英怪或BOSS，掉落精血
    if (enemy.type === 'elite' || enemy.type === 'boss' || enemy.isBoss) {
      let bloodEssenceId;
      let bloodEssenceChance = Math.random();
      
      if (enemy.type === 'boss' || enemy.isBoss) {
        // BOSS掉落中量或大量精血
        if (bloodEssenceChance > 0.7) {
          bloodEssenceId = 'BLOOD_ESSENCE_MAJOR'; // 30%几率掉落大量精血
        } else {
          bloodEssenceId = 'BLOOD_ESSENCE_MEDIUM'; // 70%几率掉落中量精血
        }
      } else if (enemy.type === 'elite') {
        // 精英怪掉落微量或中量精血
        if (bloodEssenceChance > 0.8) {
          bloodEssenceId = 'BLOOD_ESSENCE_MEDIUM'; // 20%几率掉落中量精血
        } else {
          bloodEssenceId = 'BLOOD_ESSENCE_MINOR'; // 80%几率掉落微量精血
        }
      }
      
      if (bloodEssenceId) {
        // 创建精血物品
        this.createItemDrop(enemy.x, enemy.y, 'material', bloodEssenceId);
      }
    }
    
    if (dropChance > 0.7) {
      // 创建物品
      let itemType;
      let itemId;
      
      if (dropChance > 0.95) {
        // 装备掉落 (5%)
        itemType = 'equipment';
        const equipmentTypes = ['weapon', 'armor', 'accessory'];
        const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        const equipments = Object.keys(this.gameManager.itemSystem.equipmentData).filter(id => 
          this.gameManager.itemSystem.equipmentData[id].type === equipmentType
        );
        itemId = equipments[Math.floor(Math.random() * equipments.length)];
      } else if (dropChance > 0.8) {
        // 消耗品掉落 (15%)
        itemType = 'consumable';
        const consumables = Object.keys(this.gameManager.itemSystem.itemData).filter(id => 
          this.gameManager.itemSystem.itemData[id].type === 'consumable'
        );
        itemId = consumables[Math.floor(Math.random() * consumables.length)];
      } else {
        // 材料掉落 (10%)
        itemType = 'material';
        const materials = Object.keys(this.gameManager.itemSystem.itemData).filter(id => 
          this.gameManager.itemSystem.itemData[id].type === 'material'
        );
        itemId = materials[Math.floor(Math.random() * materials.length)];
      }
      
      // 创建物品掉落
      this.createItemDrop(enemy.x, enemy.y, itemType, itemId);
    }
  }
  
  /**
   * 创建物品掉落
   * @param {number} x - 掉落位置x坐标
   * @param {number} y - 掉落位置y坐标
   * @param {string} itemType - 物品类型
   * @param {string} itemId - 物品ID
   */
  createItemDrop(x, y, itemType, itemId) {
    // 创建物品精灵
    const item = this.physics.add.sprite(x, y, itemType === 'equipment' ? 'equipment' : 'items');
    
    // 设置物品图标
    if (itemType === 'equipment') {
      item.setFrame(this.gameManager.itemSystem.equipmentData[itemId].iconIndex);
    } else {
      // 对于材料和消耗品，从itemData获取图标
      const itemData = this.gameManager.itemSystem.itemData[itemId];
      if (itemData && itemData.iconIndex !== undefined) {
        item.setFrame(itemData.iconIndex);
      } else {
        // 如果没有找到图标索引，使用默认图标
        item.setFrame(0);
      }
    }
    
    item.setScale(1.5);
    item.itemId = itemId;
    item.itemType = itemType;
    
    // 添加物理属性
    item.setCollideWorldBounds(true);
    item.setBounce(0.2);
    item.setVelocity((Math.random() - 0.5) * 100, -100);
    
    // 添加与玩家的碰撞
    this.physics.add.overlap(this.player, item, this.collectItem, null, this);
    
    // 添加与地面的碰撞
    this.physics.add.collider(item, this.groundLayer);
    
    // 物品闪烁效果
    this.tweens.add({
      targets: item,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 500
    });
    
    // 物品自动消失
    this.time.delayedCall(10000, () => {
      if (item.active) {
        item.destroy();
      }
    });
    
    return item;
    }
      // 收集物品
  collectItem(player, item) {
    // 播放拾取音效
    this.sound.play('item_pickup', { volume: 0.5 });
    
    // 添加到库存
    if (item.itemType === 'equipment') {
      this.inventorySystem.addEquipment(item.itemId);
    } else {
      this.inventorySystem.addItem(item.itemId);
    }
    
    // 显示拾取信息
    const itemName = item.itemType === 'equipment' ? 
      this.gameManager.itemSystem.equipmentData[item.itemId].name : 
      this.gameManager.itemSystem.itemData[item.itemId].name;
    
    const pickupText = this.add.text(player.x, player.y - 40, `获得 ${itemName}`, {
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // 文本动画
    this.tweens.add({
      targets: pickupText,
      y: player.y - 80,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        pickupText.destroy();
      }
    });
    
    // 销毁物品精灵
    item.destroy();
  }
  
  // 加载存档数据
  loadSaveDataIfExists() {
    // 检查是否有存档数据
    const hasSaveData = this.saveSystem.hasSaveData();
    
    if (hasSaveData) {
      // 加载存档数据
      const saveData = this.saveSystem.loadGame();
      
      if (saveData && saveData.playerData) {
        // 设置玩家位置
        if (saveData.playerData.position) {
          this.player.x = saveData.playerData.position.x;
          this.player.y = saveData.playerData.position.y;
        }
        
        // 设置玩家属性
        if (saveData.playerData.stats) {
          this.player.stats = saveData.playerData.stats;
        }
        
        // 设置玩家等级和经验
        if (saveData.playerData.level) {
          this.player.level = saveData.playerData.level;
          this.player.experience = saveData.playerData.experience || 0;
          this.player.updateLevelText();
        }
        
      }
    }
  }
  
  // 保存游戏
  saveGame() {
    // 收集玩家数据
    const playerData = {
      position: {
        x: this.player.x,
        y: this.player.y
      },
      stats: this.player.stats,
      level: this.player.level,
      experience: this.player.experience,
      class: this.player.constructor.name.toLowerCase()
    };
    
    // 保存游戏
    this.saveSystem.saveGame({
      playerData: playerData,
      timestamp: Date.now(),
      mapName: 'main_map',
      playTime: this.gameManager.getPlayTime()
    });
    
    // 显示保存成功消息
    const saveText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, '游戏已保存', {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);
    
    // 文本动画
    this.tweens.add({
      targets: saveText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        saveText.destroy();
      }
    });
  }
  }
  

export default GameScene;