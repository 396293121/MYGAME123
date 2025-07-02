/**
 * 测试场景
 * 用于测试游戏的基本功能，包括地图、HUD UI、角色移动、怪物和游戏内菜单
 */

import Warrior from '../classes/Warrior.js';
import GameHudUI from '../ui/GameHudUI.js';
import UIManager from '../systems/UIManager.js';
import PauseMenuUI from '../ui/PauseMenuUI.js';
import EnemySystem from '../systems/EnemySystem.js';
import InputManager from '../systems/InputManager.js';
import DIContainer from '../systems/DIContainer.js';
import EventBus from '../systems/EventBus.js';
import Logger from '../systems/Logger.js';
// EnemyAnimationManager已整合到EnemyAnimationController中
// import EnemyAnimationManager from '../systems/EnemyAnimationManager.js';
import EnemyAnimationController from '../systems/EnemyAnimationController.js';

class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestScene' });
    this.player = null;
    this.enemySystem = null;
    this.uiManager = null;
    this.inputManager = null;
    // this.enemyAnimationManager = null; // 已整合到EnemyAnimationController
    
    // 依赖注入容器
    this.container = null;
    this.eventBus = null;
    this.logger = null;
  }
  
  /**
   * 初始化场景
   */
  init() {
    // 获取依赖注入容器
    this.container = DIContainer.getInstance();
    this.eventBus = this.container.get('EventBus');
    this.logger = this.container.get('Logger');
    
    this.logger.info('TestScene initializing...');
    
    // 设置事件监听
    this.setupEventListeners();
  }
  
  /**
   * 设置事件监听
   */
  setupEventListeners() {
    // 监听敌人事件
    this.eventBus.on('enemy-charge-start', this.onEnemyChargeStart.bind(this));
    this.eventBus.on('enemy-charge-stop', this.onEnemyChargeStop.bind(this));
    this.eventBus.on('enemy-death', this.onEnemyDeath.bind(this));
    this.eventBus.on('enemy-state-change', this.onEnemyStateChange.bind(this));
  }

  preload() {
    // 加载测试场景资源
    this.load.image('tileset', 'assets/maps/tilesets/tileset.png');
    this.load.tilemapTiledJSON('test_map', 'assets/maps/test_map2.json');
    
    // 加载地图中使用的瓦片集图像 - 嵌入瓦片集模式下，图像路径在地图JSON中已定义
    this.load.image('grass', 'assets/maps/tilesets/grass.png');
    this.load.image('stone_background', 'assets/maps/tilesets/stone_background.png');
    this.load.image('tree_background', 'assets/maps/tilesets/tree_background.png');
    this.load.image('stone', 'assets/maps/tilesets/stone.png');
    
    // 加载角色精灵图 - JSON格式
    // 加载新的统一战士精灵图（213x144尺寸）- 多文件打包
    this.load.multiatlas('warrior_sprite2', 'assets/images/characters/warrior/sprite/warrior_sprite2.json', 'assets/images/characters/warrior/sprite');
    // 加载敌人精灵图
    // 加载敌人精灵图 - 野猪JSON格式精灵图
    this.load.multiatlas('wild_boar_sprite', 'assets/images/enemies/wild_boar/wild_boar_sprite.json', 'assets/images/enemies/wild_boar');
    
    // 加载音效
    this.load.audio('game_music', 'assets/audio/game_music.wav');
    this.load.audio('jump_sound', 'assets/audio/jump_sound.mp3');
    this.load.audio('attack_sound', 'assets/audio/warrior_attack.mp3');
    this.load.audio('boar_charge', 'assets/audio/boar_charge.mp3');
    
    // 加载战士专用音效
    this.load.audio('warrior_sword_swing', 'assets/audio/sword_swing.wav');       // 挥剑音效
    this.load.audio('warrior_sword_hit', 'assets/audio/sword_hit.wav');           // 命中音效
    this.load.audio('warrior_jump', 'assets/audio/jump_sound.mp3');               // 跳跃音效（复用现有）
    
    // 加载野猪专用音效
    this.load.audio('wild_boar_attack', 'assets/audio/wild_boar_attack.wav');     // 野猪攻击音效
    this.load.audio('wild_boar_charge', 'assets/audio/wild_boar_charge.wav');     // 野猪冲锋音效
    this.load.audio('wild_boar_hurt', 'assets/audio/wild_boar_hurt.wav');         // 野猪受伤音效
    this.load.audio('wild_boar_die', 'assets/audio/wild_boar_die.wav');           // 野猪死亡音效
    // 加载UI按钮纹理
this.load.image('continue_button', 'assets/images/ui/buttons/continue_2.png');
this.load.image('save_button', 'assets/images/ui/buttons/save_2.png');
this.load.image('load_button', 'assets/images/ui/buttons/load_2.png');
this.load.image('options_button', 'assets/images/ui/buttons/options_2.png');
this.load.image('exit_button', 'assets/images/ui/buttons/exit_2.png');

// 加载技能和物品图标
// this.load.spritesheet('skill_effects', 'assets/images/ui/skills/skill_effects.png', {
//   frameWidth: 32,
//   frameHeight: 32
// });
this.load.spritesheet('items', 'assets/images/items/items_spritesheet.png', {
  frameWidth: 24,
  frameHeight: 24
});
  }

  create() {
    // 初始化音频
    this.initializeAudio();
    
    // 初始化敌人动画管理器
    // this.enemyAnimationManager = new EnemyAnimationManager(this); // 已整合到EnemyAnimationController
    // 预加载常用敌人动画
    EnemyAnimationController.preloadAnimations(this, ['wild_boar', 'large_boar']);
    
    // 创建地图
    this.createMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 初始化敌人系统并传递场景引用
    this.enemySystem = new EnemySystem(this);
    
    // 初始化敌人对象池（确保纹理已加载）
    this.enemySystem.initializeEnemyPool();
    
    // 创建敌人
    this.createEnemies();
    
    // 创建UI
    this.createUI();
    
    // 创建控制键
    this.createControls();
    
    // 创建调试UI
    this.createDebugUI();
    
    // 设置相机跟随玩家
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true, 0.5, 0.5);
    
    // 设置物理世界边界，防止角色掉落到地图外
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    console.log(this.cameras);
    // 使用GameManager播放背景音乐
    if (this.game.gameManager) {
      this.game.gameManager.playSceneBgMusic(this, {
        key: 'game_music',
        volume: 0.3
      });
    }
    
    // 设置场景关闭时停止音乐的事件监听
    this.events.on('shutdown', () => {
      // 场景关闭时停止音乐（由GameManager统一管理）
      if (this.game.gameManager) {
        this.game.gameManager.stopBgMusic();
      }
    });
    
    // 设置当前任务（使用GameManager管理游戏状态）
    this.game.gameManager.setActiveQuest({
      title: '测试任务',
      description: '这是一个测试任务',
      objectives: [
        {
          description: '击败野猪',
          current: 0,
          target: 3
        }
      ]
    });
  }

  createMap() {
    // 创建地图
    this.map = this.make.tilemap({ key: 'test_map' });
    
    // 加载所有瓦片集 - 嵌入瓦片集模式
    const tilesets = [];
    this.map.tilesets.forEach((tileset) => {
      // 获取瓦片集名称 - 嵌入瓦片集模式下直接使用名称
      const name = tileset.name;
      // 尝试加载瓦片集图像
      try {
        
        // 使用瓦片集名称作为键名
        if (!this.textures.exists(name)) {
          console.warn(`瓦片集图像 ${name} 未预加载，请确保在preload中加载所有瓦片集图像`);
        }
        const tilesetImage = this.map.addTilesetImage(name);
        if (tilesetImage) {
          tilesets.push(tilesetImage);
        }
      } catch (error) {
        console.error(`加载瓦片集 ${name} 失败:`, error);
      }
    });
    
    // 如果没有成功加载任何瓦片集，尝试使用默认瓦片集
    if (tilesets.length === 0) {
      const defaultTileset = this.map.addTilesetImage('tileset', 'tileset');
      if (defaultTileset) {
        tilesets.push(defaultTileset);
      } else {
        console.error('无法加载任何瓦片集，地图将无法正确显示');
        return;
      }
    }
    
    // 按照正确的渲染顺序创建图层
    // 1. 首先创建背景层（最底层）
    // 2. 然后创建平台层（中间层）
    // 3. 对象层会在后面自动处理
    
    let platformLayerFound = false;
    let backgroundLayerFound = false;
    
    // 定义图层渲染顺序和深度（只包含实际存在的图层）
    const layerOrder = [
      { name: 'background', depth: -100, isBackground: true },
      { name: 'Platforms', depth: 0, isPlatform: true }
    ];
    
    // 按照预定义顺序创建图层
    layerOrder.forEach(orderItem => {
      const layerData = this.map.layers.find(layer => 
        layer.name.toLowerCase() === orderItem.name.toLowerCase()
      );
      
      if (layerData) {
        try {
          const layer = this.map.createLayer(layerData.name, tilesets, 0, 0);
          
          // 设置图层深度
          layer.setDepth(orderItem.depth);
          
          if (orderItem.isBackground) {
            this.backgroundLayer = layer;
            backgroundLayerFound = true;
            console.log(`创建背景层: ${layerData.name}，深度: ${orderItem.depth}`);
          } else if (orderItem.isPlatform) {
            this.platformLayer = layer;
            platformLayerFound = true;
            
            // 设置碰撞 - 尝试使用瓦片属性设置碰撞，如果失败则使用特定瓦片索引
            try {
              this.platformLayer.setCollisionByProperty({ collides: true });
              console.log(`创建平台层: ${layerData.name}，使用瓦片属性设置碰撞`);
            } catch (error) {
              // 如果设置碰撞属性失败，使用瓦片索引设置碰撞
              console.warn(`使用瓦片属性设置碰撞失败，改用瓦片索引设置碰撞: ${error.message}`);
              this.platformLayer.setCollision([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // 设置多个瓦片索引的碰撞
            }
          }
        } catch (error) {
          console.error(`创建图层 ${layerData.name} 失败:`, error);
        }
      }
    });
    
    // 创建其他未在预定义顺序中的图层
    this.map.layers.forEach(layerData => {
      // 跳过已经创建的图层
      const alreadyCreated = layerOrder.some(orderItem => 
        layerData.name.toLowerCase() === orderItem.name.toLowerCase()
      );
      
      if (!alreadyCreated && layerData.type === 'tilelayer') {
        try {
          const layer = this.map.createLayer(layerData.name, tilesets, 0, 0);
          console.log(`创建其他图层: ${layerData.name}`);
        } catch (error) {
          console.error(`创建图层 ${layerData.name} 失败:`, error);
        }
      }
    });
    
    // 如果没有找到背景层，记录警告
    if (!backgroundLayerFound) {
      console.warn('未找到背景层，背景装饰元素可能无法正确显示');
    }
    
    // 如果没有找到平台图层，使用第一个瓦片图层作为平台图层
    if (!platformLayerFound && this.map.layers.length > 0) {
      const firstTileLayer = this.map.layers.find(layer => layer.type === 'tilelayer');
      if (firstTileLayer) {
        this.platformLayer = this.map.getLayer(firstTileLayer.name).tilemapLayer;
        
        // 设置碰撞
        try {
          this.platformLayer.setCollisionByProperty({ collides: true });
          console.warn(`未找到平台图层，使用 ${firstTileLayer.name} 作为平台图层，并使用瓦片属性设置碰撞`);
        } catch (error) {
          console.warn(`使用瓦片属性设置碰撞失败，改用瓦片索引设置碰撞: ${error.message}`);
          this.platformLayer.setCollision([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        }
      }
    }
    
    // 输出图层信息用于调试
    console.log('地图图层创建完成:');
    console.log('- 背景层:', this.backgroundLayer ? '已创建' : '未找到');
    console.log('- 平台层:', this.platformLayer ? '已创建' : '未找到');
    console.log('- 总图层数:', this.map.layers.length);
  }

  createPlayer() {
    // 默认出生点
    let spawnPoint = { x: 100, y: 100 };
    
    // 尝试从地图中读取玩家生成点
    const entitiesLayer = this.map.getObjectLayer('entities');
    if (entitiesLayer && entitiesLayer.objects) {
      // 查找名称为player或类型为spawn_point的对象
      const playerSpawn = entitiesLayer.objects.find(obj => 
        obj.name === 'player' || obj.type === 'spawn_point'
      );
      
      if (playerSpawn) {
        console.log('找到玩家生成点对象:', playerSpawn);
                const spawnX = playerSpawn.x + (playerSpawn.width || 0)/2;
        const spawnY = playerSpawn.y +(playerSpawn.height || 0)/2 ;
        // 验证坐标是否有效
          spawnPoint = { x: spawnX, y: spawnY };
      }
    }
    
    console.log('最终使用的生成点:', spawnPoint);
    
    // 创建玩家角色（默认使用战士）
    this.player = new Warrior(this, spawnPoint.x, spawnPoint.y);
    
    // 验证玩家精灵位置
    console.log('玩家精灵创建后的位置:', this.player.sprite.x, this.player.sprite.y);
    
    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player.sprite, this.platformLayer);
  }

  createEnemies() {
    // 默认敌人配置
    const defaultWaveConfig = {
      enemies: [
        {
          type: 'wild_boar',
          count: 3,
          spawnArea: {
            x: 200,
            y: 100,
            width: 400,
            height: 50
          },
          config: {
            patrolPoints: [
              { x: 200, y: 100 },
              { x: 400, y: 100 },
              { x: 600, y: 100 }
            ]
          }
        }
      ]
    };
    
    // 尝试从地图中读取敌人生成点
    const entitiesLayer = this.map.getObjectLayer('entities');
    if (entitiesLayer && entitiesLayer.objects) {
      // 查找类型为enemy的对象
      const enemySpawns = entitiesLayer.objects.filter(obj => obj.type === 'enemy');
      
      if (enemySpawns && enemySpawns.length > 0) {
        // 使用地图中定义的敌人生成点
        const mapWaveConfig = {
          enemies: []
        };
        enemySpawns.forEach(spawn => {
          // 获取敌人类型，默认为wild_boar
          const enemyType = spawn.properties?.find(prop => prop.name === 'enemyType')?.value || 'wild_boar';
          // 获取敌人数量，默认为1
          const count = spawn.properties?.find(prop => prop.name === 'count')?.value || 1;
          
          // 创建敌人配置
          const enemyConfig = {
            type: enemyType,
            count: count,
            x: spawn.x,
            y: spawn.y,
            config: {}
          };
          
          // 如果有巡逻点属性，添加巡逻点
          const patrolRadius = spawn.properties?.find(prop => prop.name === 'patrolRadius')?.value;
          if (patrolRadius) {
            enemyConfig.config.patrolPoints = [
              { x: spawn.x - patrolRadius, y: spawn.y },
              { x: spawn.x + patrolRadius, y: spawn.y }
            ];
          }
          
          mapWaveConfig.enemies.push(enemyConfig);
        });
        
        // 使用地图中的敌人配置
        console.log('使用地图中的敌人生成点:', mapWaveConfig);
        this.enemySystem.spawnWave(mapWaveConfig);
      } else {
        // 使用默认配置
        console.log('未找到地图中的敌人生成点，使用默认配置');
        this.enemySystem.spawnWave(defaultWaveConfig);
      }
    } else {
      // 使用默认配置
      console.log('未找到entities图层，使用默认配置');
      this.enemySystem.spawnWave(defaultWaveConfig);
    }
    
    // 设置敌人的碰撞和事件监听
    this.enemySystem.setupEnemies({
      platformLayer: this.platformLayer,
      player: this.player,
      gameState: this.game.gameManager.gameState
    });
  }

  createUI() {
    // 初始化UI管理器
    this.uiManager = new UIManager(this);
    
    // 创建并注册游戏HUD UI
    const gameHudUI = new GameHudUI(this);
    gameHudUI.init();
    
    // 创建并注册暂停菜单UI
    const pauseMenuUI = new PauseMenuUI(this);
    pauseMenuUI.init();
    
    // 注册UI到管理器
    this.uiManager.register('gameHudUI', gameHudUI);
    this.uiManager.register('pauseMenuUI', pauseMenuUI);
    
    // 显示游戏HUD UI
    this.uiManager.show('gameHudUI');
  }

  createControls() {
    // 创建并初始化输入管理器
    this.inputManager = new InputManager(this);
    this.inputManager.init();
  }

  update(time, delta) {
    if (!this.player) return;
    
    // 更新玩家角色（使用InputManager的cursors）
    this.player.update(this.inputManager.cursors);
    
    // 更新输入管理器
    this.inputManager.update();
    
    // 更新敌人系统
    this.enemySystem.update(time, delta, this.player);
    
    // 处理所有敌人的特殊行为
    this.enemySystem.handleSpecialBehaviors();
    

    
    // 更新HUD UI
    const gameHudUI = this.uiManager.getUI('gameHudUI');
    if (gameHudUI) {
      gameHudUI.update({
        player: this.player,
        gameState: this.game.gameManager.gameState
      });
    }
    
    // 更新调试信息
    this.updateDebugInfo();
  }
  


  // 技能功能已移除

  // 玩家与敌人碰撞的处理已移至EnemySystem类中的handlePlayerEnemyCollision方法
  // playerAttack方法已移至InputManager类中的update方法

  // togglePauseMenu方法已移至InputManager类中
  
  // 野猪特殊行为处理已移至EnemySystem类中的handleWildBoarBehavior方法
  
  initializeAudio() {
    // 初始化所有音频对象
    console.log('Initializing audio...');
    
    // 检查音频缓存并初始化
    const audioKeys = ['game_music', 'jump_sound', 'attack_sound', 'boar_charge', 'warrior_sword_swing', 'warrior_sword_hit'];
    
    audioKeys.forEach(key => {
      if (this.cache.audio.has(key)) {
        this.sound.add(key);
        console.log(`Audio '${key}' initialized successfully`);
      } else {
        console.warn(`Audio '${key}' not found in cache`);
      }
    });
    
    // 输出当前场景中的音频数量
    console.log(`Total sounds in scene: ${this.sound.sounds.length}`);
  }
  

  
  /**
   * 创建调试UI
   */
  createDebugUI() {
    // 创建调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(1000);
  }
  

  

  
  /**
   * 敌人冲锋开始事件处理
   */
  onEnemyChargeStart(data) {
    this.logger.info(`Enemy ${data.type} started charging at target`);
    
    // 可以添加视觉效果，如屏幕震动
    this.cameras.main.shake(100, 0.01);
  }
  
  /**
   * 敌人冲锋停止事件处理
   */
  onEnemyChargeStop(data) {
    this.logger.info(`Enemy ${data.type} stopped charging`);
  }
  
  /**
   * 敌人死亡事件处理
   */
  onEnemyDeath(data) {
    this.logger.info(`Enemy ${data.type} died at (${data.position.x}, ${data.position.y})`);
    
    // 更新任务进度
    if (this.game.gameManager && data.type === 'wild_boar') {
      const currentQuest = this.game.gameManager.gameState.currentQuest;
      if (currentQuest && currentQuest.objectives[0]) {
        currentQuest.objectives[0].current = Math.min(
          currentQuest.objectives[0].current + 1,
          currentQuest.objectives[0].target
        );
      }
    }
  }
  
  /**
   * 敌人状态变化事件处理
   */
  onEnemyStateChange(data) {
    this.logger.debug(`Enemy state changed: ${data.oldState} -> ${data.newState}`);
  }
  
  /**
   * 更新调试信息
   */
  updateDebugInfo() {
    if (!this.debugText) return;
    
    const debugInfo = [
      `Player Health: ${this.player ? this.player.health : 'N/A'}`,
      `Active Enemies: ${this.enemySystem ? this.enemySystem.getActiveEnemyCount() : 0}`
    ];
    
    this.debugText.setText(debugInfo.join('\n'));
  }
  
  /**
   * 场景销毁时的清理
   */
  destroy() {
    // 清理事件监听
    if (this.eventBus) {
      this.eventBus.off('enemy-charge-start', this.onEnemyChargeStart);
      this.eventBus.off('enemy-charge-stop', this.onEnemyChargeStop);
      this.eventBus.off('enemy-death', this.onEnemyDeath);
      this.eventBus.off('enemy-state-change', this.onEnemyStateChange);
    }
    
    this.logger.info('TestScene destroyed');
    
    super.destroy();
  }
}

export default TestScene;