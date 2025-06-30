/**
 * 事件总线系统
 * 提供全局事件发布订阅机制，解耦系统间的直接依赖
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.debugMode = false;
  }
  
  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文对象
   * @returns {Function} 取消订阅函数
   */
  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const listener = { callback, context, id: this.generateId() };
    this.listeners.get(event).push(listener);
    
    if (this.debugMode) {
      console.log(`[EventBus] 订阅事件: ${event}`, { listenerId: listener.id, context });
    }
    
    // 返回取消订阅函数
    return () => this.off(event, callback, context);
  }
  
  /**
   * 订阅事件（仅触发一次）
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文对象
   * @returns {Function} 取消订阅函数
   */
  once(event, callback, context = null) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, []);
    }
    
    const listener = { callback, context, id: this.generateId() };
    this.onceListeners.get(event).push(listener);
    
    if (this.debugMode) {
      console.log(`[EventBus] 订阅一次性事件: ${event}`, { listenerId: listener.id, context });
    }
    
    // 返回取消订阅函数
    return () => this.offOnce(event, callback, context);
  }
  
  /**
   * 取消订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文对象
   */
  off(event, callback, context = null) {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    
    const index = listeners.findIndex(listener => 
      listener.callback === callback && listener.context === context
    );
    
    if (index !== -1) {
      const removed = listeners.splice(index, 1)[0];
      if (this.debugMode) {
        console.log(`[EventBus] 取消订阅事件: ${event}`, { listenerId: removed.id });
      }
    }
    
    // 如果没有监听器了，删除事件
    if (listeners.length === 0) {
      this.listeners.delete(event);
    }
  }
  
  /**
   * 取消订阅一次性事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文对象
   */
  offOnce(event, callback, context = null) {
    const listeners = this.onceListeners.get(event);
    if (!listeners) return;
    
    const index = listeners.findIndex(listener => 
      listener.callback === callback && listener.context === context
    );
    
    if (index !== -1) {
      const removed = listeners.splice(index, 1)[0];
      if (this.debugMode) {
        console.log(`[EventBus] 取消订阅一次性事件: ${event}`, { listenerId: removed.id });
      }
    }
    
    // 如果没有监听器了，删除事件
    if (listeners.length === 0) {
      this.onceListeners.delete(event);
    }
  }
  
  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {Object} options - 发布选项
   */
  emit(event, data = null, options = {}) {
    const { async = false, delay = 0 } = options;
    
    if (this.debugMode) {
      console.log(`[EventBus] 发布事件: ${event}`, { data, options });
    }
    
    // 记录事件历史
    this.recordEvent(event, data);
    
    const executeEmit = () => {
      // 处理普通监听器
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.slice().forEach(listener => {
          this.executeListener(listener, event, data);
        });
      }
      
      // 处理一次性监听器
      const onceListeners = this.onceListeners.get(event);
      if (onceListeners) {
        onceListeners.slice().forEach(listener => {
          this.executeListener(listener, event, data);
        });
        // 清空一次性监听器
        this.onceListeners.delete(event);
      }
    };
    
    if (async) {
      if (delay > 0) {
        setTimeout(executeEmit, delay);
      } else {
        Promise.resolve().then(executeEmit);
      }
    } else {
      if (delay > 0) {
        setTimeout(executeEmit, delay);
      } else {
        executeEmit();
      }
    }
  }
  
  /**
   * 执行监听器
   * @private
   * @param {Object} listener - 监听器对象
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  executeListener(listener, event, data) {
    try {
      if (listener.context) {
        listener.callback.call(listener.context, data, event);
      } else {
        listener.callback(data, event);
      }
    } catch (error) {
      console.error(`[EventBus] 事件监听器执行错误 [${event}]:`, error);
      // 发布错误事件
      this.emit('listener-error', { event, error, listener }, { async: true });
    }
  }
  
  /**
   * 记录事件历史
   * @private
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  recordEvent(event, data) {
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now()
    });
    
    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  /**
   * 生成唯一ID
   * @private
   * @returns {string} 唯一ID
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * 获取事件监听器数量
   * @param {string} event - 事件名称
   * @returns {number} 监听器数量
   */
  getListenerCount(event) {
    const normalCount = this.listeners.get(event)?.length || 0;
    const onceCount = this.onceListeners.get(event)?.length || 0;
    return normalCount + onceCount;
  }
  
  /**
   * 获取所有事件名称
   * @returns {Array<string>} 事件名称数组
   */
  getEventNames() {
    const normalEvents = Array.from(this.listeners.keys());
    const onceEvents = Array.from(this.onceListeners.keys());
    return [...new Set([...normalEvents, ...onceEvents])];
  }
  
  /**
   * 清除所有监听器
   * @param {string} event - 事件名称，如果不提供则清除所有事件
   */
  clear(event = null) {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
      if (this.debugMode) {
        console.log(`[EventBus] 清除事件监听器: ${event}`);
      }
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
      if (this.debugMode) {
        console.log('[EventBus] 清除所有事件监听器');
      }
    }
  }
  
  /**
   * 获取事件历史
   * @param {string} event - 事件名称，如果不提供则返回所有历史
   * @param {number} limit - 限制数量
   * @returns {Array} 事件历史数组
   */
  getEventHistory(event = null, limit = 50) {
    let history = this.eventHistory;
    
    if (event) {
      history = history.filter(record => record.event === event);
    }
    
    return history.slice(-limit);
  }
  
  /**
   * 设置调试模式
   * @param {boolean} enabled - 是否启用调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    if (enabled) {
      console.log('[EventBus] 调试模式已启用');
    }
  }
  
  /**
   * 创建命名空间事件总线
   * @param {string} namespace - 命名空间
   * @returns {Object} 命名空间事件总线
   */
  namespace(namespace) {
    return {
      on: (event, callback, context) => this.on(`${namespace}:${event}`, callback, context),
      once: (event, callback, context) => this.once(`${namespace}:${event}`, callback, context),
      off: (event, callback, context) => this.off(`${namespace}:${event}`, callback, context),
      emit: (event, data, options) => this.emit(`${namespace}:${event}`, data, options),
      clear: (event) => this.clear(event ? `${namespace}:${event}` : null)
    };
  }
  
  /**
   * 销毁事件总线
   */
  destroy() {
    this.clear();
    this.eventHistory = [];
    if (this.debugMode) {
      console.log('[EventBus] 事件总线已销毁');
    }
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus();

export default eventBus;
export { EventBus };