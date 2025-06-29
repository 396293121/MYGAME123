/**
 * 游戏入口文件
 * 初始化Phaser游戏引擎、游戏管理器并加载所有场景
 */

import Phaser from 'phaser';
import GameManager from './GameManager.js';
import UIDebugTool from './systems/UIDebugTool.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import GameScene from './scenes/GameScene.js';
import TestScene from './scenes/TestScene.js';

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: true
    }
  },
  scene: [
    MainMenuScene,
    CharacterSelectScene,
    TestScene,
    GameScene
  ]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 创建并初始化游戏管理器
const gameManager = new GameManager(game).init();

// 将游戏管理器添加到游戏实例中，使其可以在所有场景中访问
game.gameManager = gameManager;

// 创建并初始化UI调试工具
const uiDebugTool = new UIDebugTool(game);

// 将UI调试工具添加到游戏实例中，使其可以在所有场景中访问
game.uiDebugTool = uiDebugTool;

// 场景切换事件监听
game.events.on('changedata-scene', (scene) => {
  gameManager.setCurrentScene(scene);
});

// 监听场景启动事件
game.events.on('scene-init', (scene) => {
  // 将游戏管理器传递给场景
  scene.gameManager = gameManager;
  
  // 如果是游戏场景，设置玩家引用
  if (scene.key === 'GameScene' && scene.player) {
    gameManager.setPlayer(scene.player);
  }
});

// 监听游戏关闭事件
window.addEventListener('beforeunload', () => {
  // 清理游戏管理器资源
  gameManager.cleanup();
  
  // 清理UI调试工具资源
  if (game.uiDebugTool) {
    game.uiDebugTool.cleanup();
  }
});

// 导出游戏实例和游戏管理器，以便在其他模块中使用
export { game, gameManager };