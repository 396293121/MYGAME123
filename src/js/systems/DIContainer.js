import {EventBus} from './EventBus.js';
import {Logger} from './Logger.js';
import ConfigManager from './ConfigManager.js';

/**
 * 依赖注入容器
 * 用于管理和提供系统级服务的单例实例
 */
class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }
  
  /**
   * 获取容器实例（单例模式）
   */
  static getInstance() {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
      DIContainer.instance.initializeDefaultServices();
    }
    return DIContainer.instance;
  }
  
  /**
   * 初始化默认服务
   */
  initializeDefaultServices() {
    // 注册EventBus
    this.registerSingleton('EventBus', () => {
      return EventBus.getInstance ? EventBus.getInstance() : new EventBus();
    });
    
    // 注册Logger
    this.registerSingleton('Logger', () => {
      return Logger.getInstance ? Logger.getInstance() : new Logger();
    });
    
    // 注册ConfigManager
    this.registerSingleton('ConfigManager', () => {
      return ConfigManager.getInstance ? ConfigManager.getInstance() : new ConfigManager();
    });
  }
  
  /**
   * 注册服务
   * @param {string} name - 服务名称
   * @param {Function} factory - 工厂函数
   */
  register(name, factory) {
    this.services.set(name, factory);
  }
  
  /**
   * 注册单例服务
   * @param {string} name - 服务名称
   * @param {Function} factory - 工厂函数
   */
  registerSingleton(name, factory) {
    this.services.set(name, factory);
    this.singletons.set(name, null);
  }
  
  /**
   * 获取服务实例
   * @param {string} name - 服务名称
   * @returns {*} 服务实例
   */
  get(name) {
    // 检查是否为单例服务
    if (this.singletons.has(name)) {
      let instance = this.singletons.get(name);
      if (!instance) {
        const factory = this.services.get(name);
        if (factory) {
          instance = factory();
          this.singletons.set(name, instance);
        }
      }
      return instance;
    }
    
    // 普通服务，每次创建新实例
    const factory = this.services.get(name);
    if (factory) {
      return factory();
    }
    
    throw new Error(`Service '${name}' not found in container`);
  }
  
  /**
   * 检查服务是否已注册
   * @param {string} name - 服务名称
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }
  
  /**
   * 移除服务
   * @param {string} name - 服务名称
   */
  remove(name) {
    this.services.delete(name);
    this.singletons.delete(name);
  }
  
  /**
   * 清空所有服务
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
  }
  
  /**
   * 获取所有已注册的服务名称
   * @returns {string[]} 服务名称数组
   */
  getServiceNames() {
    return Array.from(this.services.keys());
  }
}

// 静态实例
DIContainer.instance = null;

export default DIContainer;