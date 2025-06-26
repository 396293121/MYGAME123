/**
 * 敌人系统
 * 管理游戏中所有敌人的生成和行为
 */
import Enemy from '../classes/Enemy.js';
import DarkMage from '../classes/enemies/DarkMage.js';
import MysteriousStranger from '../classes/enemies/MysteriousStranger.js';
import BoarKing from '../classes/enemies/BoarKing.js';
import LargeBoar from '../classes/enemies/LargeBoar.js';
import WildBoar from '../classes/enemies/WildBoar.js';
import EnemyData from '../data/EnemyData.js';

class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    
    // 敌人类型映射
    this.enemyTypes = {
      'dark_mage': DarkMage,
      'mysterious_stranger': MysteriousStranger,
      'boar_king': BoarKing,
      'large_boar': LargeBoar,
      'wild_boar': WildBoar
    };
    
    // 敌人池（用于优化性能）
    this.enemyPool = {};
    
    // 初始化敌人池
    Object.keys(this.enemyTypes).forEach(type => {
      this.enemyPool[type] = [];
    });
  }
  
  // 创建敌人
  createEnemy(type, x, y, config = {}) {
    // 检查类型是否有效
    if (!this.enemyTypes[type]) {
      console.error(`Enemy type '${type}' not found`);
      return null;
    }
    
    let enemy;
    
    // 尝试从对象池中获取
    if (this.enemyPool[type].length > 0) {
      enemy = this.enemyPool[type].pop();
      enemy.sprite.setPosition(x, y);
      enemy.sprite.setActive(true);
      enemy.sprite.setVisible(true);
      enemy.sprite.body.enable = true;
      
      // 重置敌人状态
      enemy.health = enemy.maxHealth;
      enemy.currentState = enemy.states.IDLE;
    } else {
      // 创建新敌人
      const EnemyClass = this.enemyTypes[type];
      enemy = new EnemyClass(this.scene, x, y);
    }
    
    // 应用配置
    if (config.patrolPoints) {
      enemy.setPatrolPoints(config.patrolPoints);
    }
    
    if (config.health) {
      enemy.health = config.health;
      enemy.maxHealth = config.health;
    }
    
    if (config.damage) {
      enemy.damage = config.damage;
    }
    
    if (config.speed) {
      enemy.speed = config.speed;
    }
    
    // 添加到敌人列表
    this.enemies.push(enemy);
    
    return enemy;
  }
  
  // 根据EnemyData创建敌人
  createEnemyFromData(enemyId, x, y, config = {}) {
    // 检查敌人ID是否有效
    if (!EnemyData[enemyId]) {
      console.error(`Enemy ID '${enemyId}' not found in EnemyData`);
      return null;
    }
    
    // 获取敌人数据
    const enemyData = EnemyData[enemyId];
    
    // 获取敌人类型
    const type = enemyData.id;
    
    // 创建敌人
    const enemy = this.createEnemy(type, x, y, config);
    
    return enemy;
  }
  
  // 回收敌人（放回对象池）
  recycleEnemy(enemy) {
    // 从敌人列表中移除
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
    
    // 确定敌人类型
    let type = null;
    for (const [key, EnemyClass] of Object.entries(this.enemyTypes)) {
      if (enemy instanceof EnemyClass) {
        type = key;
        break;
      }
    }
    
    if (type) {
      // 重置敌人状态
      enemy.sprite.setActive(false);
      enemy.sprite.setVisible(false);
      enemy.sprite.body.enable = false;
      
      // 放回对象池
      this.enemyPool[type].push(enemy);
    } else {
      // 如果找不到类型，直接销毁
      enemy.sprite.destroy();
    }
  }
  
  // 更新所有敌人
  update(time, delta, player) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // 更新敌人状态
      enemy.update(time, delta, player);
      
      // 如果敌人已死亡且动画已完成，回收敌人
      if (enemy.currentState === enemy.states.DEAD && enemy.sprite.alpha === 0) {
        this.recycleEnemy(enemy);
      }
    }
  }
  
  // 生成敌人波次
  spawnWave(waveConfig) {
    waveConfig.enemies.forEach(enemyConfig => {
      for (let i = 0; i < enemyConfig.count; i++) {
        // 计算生成位置
        let x, y;
        if (enemyConfig.spawnArea) {
          x = Phaser.Math.Between(
            enemyConfig.spawnArea.x,
            enemyConfig.spawnArea.x + enemyConfig.spawnArea.width
          );
          y = Phaser.Math.Between(
            enemyConfig.spawnArea.y,
            enemyConfig.spawnArea.y + enemyConfig.spawnArea.height
          );
        } else {
          x = enemyConfig.x || 0;
          y = enemyConfig.y || 0;
        }
        
        // 创建敌人
        this.createEnemy(
          enemyConfig.type,
          x,
          y,
          enemyConfig.config || {}
        );
      }
    });
  }
  
  // 清除所有敌人
  clearAllEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.sprite.destroy();
    }
    
    this.enemies = [];
    
    // 清空对象池
    Object.keys(this.enemyPool).forEach(type => {
      this.enemyPool[type].forEach(enemy => {
        enemy.sprite.destroy();
      });
      this.enemyPool[type] = [];
    });
  }
  
  // 获取指定范围内的敌人
  getEnemiesInRange(x, y, range) {
    return this.enemies.filter(enemy => {
      const distance = Phaser.Math.Distance.Between(
        x, y,
        enemy.sprite.x, enemy.sprite.y
      );
      return distance <= range && enemy.currentState !== enemy.states.DEAD;
    });
  }
  
  // 对指定范围内的敌人造成伤害
  damageEnemiesInRange(x, y, range, damage, damageType = 'physical') {
    const affectedEnemies = this.getEnemiesInRange(x, y, range);
    
    affectedEnemies.forEach(enemy => {
      enemy.takeDamage(damage, damageType);
    });
    
    return affectedEnemies.length;
  }
}

export default EnemySystem;