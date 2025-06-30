/**
 * 配置管理器
 * 统一管理游戏中所有系统的配置参数
 */

class ConfigManager {
  constructor() {
    this.configs = {
      // UI配置
      ui: {
        hud: {
          barWidth: 200,
          barHeight: 20,
          barSpacing: 10,
          barPadding: 2,
          skillIconSize: 40,
          skillIconSpacing: 10,
          updateThreshold: 0.01 // 数值变化阈值，低于此值不更新UI
        },
        questTracker: {
          width: 230,
          height: 100,
          margin: 10
        }
      },
      
      // 敌人系统配置
      enemySystem: {
        maxEnemies: 50,
        spawnRate: 1000,
        despawnDistance: 1000,
        
        // 对象池配置
        objectPool: {
          defaultSize: 5,
          defaultMaxSize: 20,
          initialSizes: {
            'wild_boar': 8,
            'large_boar': 0, // 暂时禁用，纹理文件缺失
            'boar_king': 0,  // 暂时禁用，纹理文件缺失
            'dark_mage': 0,  // 暂时禁用，纹理文件缺失
            'mysterious_stranger': 0 // 暂时禁用，纹理文件缺失
          },
          maxSizes: {
            'wild_boar': 25,
            'large_boar': 15,
            'boar_king': 5,
            'dark_mage': 10,
            'mysterious_stranger': 8
          }
        },
        
        // 空间分割网格配置
        spatialGrid: {
          enabled: true,
          cellSize: 128
        },
        
        // 性能监控配置
        performance: {
          maxUpdateTime: 16, // 最大更新时间（毫秒）
          statsInterval: 5000 // 统计信息发送间隔（毫秒）
        },
        
        recycleDelay: 1000,
        chargeStunDuration: {
          wild_boar: 1000,
          large_boar: 1500
        },
        damageMultiplier: {
          charge: 1.5
        }
      },
      
      // 碰撞检测配置
      collision: {
        spatialGridSize: 64, // 空间网格大小
        maxEnemiesPerCell: 10,
        rangeCheckOptimization: true
      },
      
      // 性能配置
      performance: {
        maxParticles: 50,
        particleLifespan: 1000,
        effectCleanupInterval: 5000,
        memoryCheckInterval: 30000
      },
      
      // 输入配置
      input: {
        attackCooldown: 500,
        keyRepeatDelay: 100
      },
      
      // 动画配置
      animation: {
        cacheSize: 100,
        defaultFrameRate: 10,
        specialAnimationOffset: { x: 0, y: -10 }
      },
      
      // 调试配置
      debug: {
        showCollisionBoxes: false,
        showPerformanceStats: false,
        logLevel: 'warn', // 'debug', 'info', 'warn', 'error'
        enableProfiler: false
      }
    };
    
    // 配置变更监听器
    this.listeners = new Map();
  }
  
  /**
   * 获取配置值
   * @param {string} path - 配置路径，如 'ui.hud.barWidth'
   * @param {*} defaultValue - 默认值
   * @returns {*} 配置值
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this.configs;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }
  
  /**
   * 设置配置值
   * @param {string} path - 配置路径
   * @param {*} value - 配置值
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.configs;
    
    // 创建嵌套对象路径
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // 触发变更监听器
    this.notifyListeners(path, value, oldValue);
  }
  
  /**
   * 监听配置变更
   * @param {string} path - 配置路径
   * @param {Function} callback - 回调函数
   */
  listen(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, []);
    }
    this.listeners.get(path).push(callback);
  }
  
  /**
   * 移除配置监听器
   * @param {string} path - 配置路径
   * @param {Function} callback - 回调函数
   */
  unlisten(path, callback) {
    const callbacks = this.listeners.get(path);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  /**
   * 通知配置变更监听器
   * @private
   * @param {string} path - 配置路径
   * @param {*} newValue - 新值
   * @param {*} oldValue - 旧值
   */
  notifyListeners(path, newValue, oldValue) {
    const callbacks = this.listeners.get(path);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error(`配置监听器执行错误 [${path}]:`, error);
        }
      });
    }
  }
  
  /**
   * 批量更新配置
   * @param {Object} updates - 配置更新对象
   */
  batchUpdate(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.set(path, value);
    });
  }
  
  /**
   * 重置配置到默认值
   * @param {string} path - 配置路径，如果不提供则重置所有配置
   */
  reset(path = null) {
    if (path) {
      // 重置特定配置路径
      const defaultValue = this.getDefaultValue(path);
      if (defaultValue !== null) {
        this.set(path, defaultValue);
      }
    } else {
      // 重置所有配置
      this.configs = this.getDefaultConfigs();
    }
  }
  
  /**
   * 获取默认配置值
   * @private
   * @param {string} path - 配置路径
   * @returns {*} 默认值
   */
  getDefaultValue(path) {
    // 这里可以实现从默认配置文件或硬编码默认值中获取
    return this.get(path);
  }
  
  /**
   * 获取默认配置对象
   * @private
   * @returns {Object} 默认配置
   */
  getDefaultConfigs() {
    // 返回初始配置的深拷贝
    return JSON.parse(JSON.stringify(this.configs));
  }
  
  /**
   * 导出配置
   * @returns {Object} 配置对象
   */
  export() {
    return JSON.parse(JSON.stringify(this.configs));
  }
  
  /**
   * 导入配置
   * @param {Object} configs - 配置对象
   */
  import(configs) {
    this.configs = { ...this.configs, ...configs };
  }
  
  /**
   * 验证配置值
   * @param {string} path - 配置路径
   * @param {*} value - 配置值
   * @returns {boolean} 是否有效
   */
  validate(path, value) {
    // 基本类型验证
    const currentValue = this.get(path);
    if (currentValue !== null && typeof value !== typeof currentValue) {
      return false;
    }
    
    // 特定路径的验证规则
    const validationRules = {
      'ui.hud.barWidth': (v) => v > 0 && v <= 500,
      'ui.hud.barHeight': (v) => v > 0 && v <= 100,
      'enemy.poolSize': (v) => typeof v === 'object' && Object.values(v).every(size => size > 0),
      'performance.maxParticles': (v) => v > 0 && v <= 200,
      'debug.logLevel': (v) => ['debug', 'info', 'warn', 'error'].includes(v)
    };
    
    const rule = validationRules[path];
    return rule ? rule(value) : true;
  }
}

// 创建全局配置管理器实例
const configManager = new ConfigManager();

export default configManager;
export { ConfigManager };