/**
 * 日志和错误处理系统
 * 提供统一的日志记录、错误处理和调试功能
 */

import configManager from './ConfigManager.js';
import eventBus from './EventBus.js';

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogSize = 1000;
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    
    this.currentLevel = this.logLevels.WARN;
    this.enableConsole = true;
    this.enableStorage = false;
    this.enableRemote = false;
    
    // 性能监控
    this.performanceMarks = new Map();
    this.performanceMetrics = [];
    
    // 错误统计
    this.errorStats = {
      total: 0,
      byType: {},
      bySource: {},
      recent: []
    };
    
    this.init();
  }
  
  /**
   * 初始化日志系统
   */
  init() {
    // 从配置管理器获取日志级别
    const logLevel = configManager.get('debug.logLevel', 'warn');
    this.setLevel(logLevel);
    
    // 监听配置变更
    configManager.listen('debug.logLevel', (newLevel) => {
      this.setLevel(newLevel);
    });
    
    // 捕获全局错误
    this.setupGlobalErrorHandling();
    
    // 监听事件总线错误
    eventBus.on('listener-error', (data) => {
      this.error('EventBus监听器错误', data.error, {
        event: data.event,
        listener: data.listener.id
      });
    });
  }
  
  /**
   * 设置日志级别
   * @param {string} level - 日志级别
   */
  setLevel(level) {
    const levelMap = {
      'debug': this.logLevels.DEBUG,
      'info': this.logLevels.INFO,
      'warn': this.logLevels.WARN,
      'error': this.logLevels.ERROR
    };
    
    this.currentLevel = levelMap[level.toLowerCase()] ?? this.logLevels.WARN;
  }
  
  /**
   * 调试日志
   * @param {string} message - 消息
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   */
  debug(message, data = null, context = {}) {
    this.log('DEBUG', message, data, context);
  }
  
  /**
   * 信息日志
   * @param {string} message - 消息
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   */
  info(message, data = null, context = {}) {
    this.log('INFO', message, data, context);
  }
  
  /**
   * 警告日志
   * @param {string} message - 消息
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   */
  warn(message, data = null, context = {}) {
    this.log('WARN', message, data, context);
  }
  
  /**
   * 错误日志
   * @param {string} message - 消息
   * @param {Error|*} error - 错误对象
   * @param {Object} context - 上下文
   */
  error(message, error = null, context = {}) {
    this.log('ERROR', message, error, context);
    this.updateErrorStats(message, error, context);
    
    // 发布错误事件
    eventBus.emit('system-error', {
      message,
      error,
      context,
      timestamp: Date.now()
    });
  }
  
  /**
   * 记录日志
   * @private
   * @param {string} level - 日志级别
   * @param {string} message - 消息
   * @param {*} data - 数据
   * @param {Object} context - 上下文
   */
  log(level, message, data = null, context = {}) {
    const levelValue = this.logLevels[level];
    if (levelValue < this.currentLevel) {
      return;
    }
    
    const logEntry = {
      level,
      message,
      data,
      context,
      timestamp: Date.now(),
      stack: level === 'ERROR' ? this.getStackTrace() : null
    };
    
    // 添加到日志数组
    this.logs.push(logEntry);
    
    // 限制日志大小
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
    
    // 输出到控制台
    if (this.enableConsole) {
      this.outputToConsole(logEntry);
    }
    
    // 存储到本地存储
    if (this.enableStorage) {
      this.saveToStorage(logEntry);
    }
    
    // 发送到远程服务器
    if (this.enableRemote) {
      this.sendToRemote(logEntry);
    }
  }
  
  /**
   * 输出到控制台
   * @private
   * @param {Object} logEntry - 日志条目
   */
  outputToConsole(logEntry) {
    const { level, message, data, context, timestamp } = logEntry;
    const time = new Date(timestamp).toLocaleTimeString();
    const prefix = `[${time}] [${level}]`;
    
    const consoleMethod = {
      'DEBUG': 'log',
      'INFO': 'info',
      'WARN': 'warn',
      'ERROR': 'error'
    }[level] || 'log';
    
    if (data || Object.keys(context).length > 0) {
      console[consoleMethod](prefix, message, { data, context });
    } else {
      console[consoleMethod](prefix, message);
    }
  }
  
  /**
   * 获取堆栈跟踪
   * @private
   * @returns {string} 堆栈跟踪
   */
  getStackTrace() {
    try {
      throw new Error();
    } catch (e) {
      return e.stack;
    }
  }
  
  /**
   * 更新错误统计
   * @private
   * @param {string} message - 错误消息
   * @param {Error|*} error - 错误对象
   * @param {Object} context - 上下文
   */
  updateErrorStats(message, error, context) {
    this.errorStats.total++;
    
    // 按类型统计
    const errorType = error?.constructor?.name || 'Unknown';
    this.errorStats.byType[errorType] = (this.errorStats.byType[errorType] || 0) + 1;
    
    // 按来源统计
    const source = context.source || 'Unknown';
    this.errorStats.bySource[source] = (this.errorStats.bySource[source] || 0) + 1;
    
    // 最近错误
    this.errorStats.recent.push({
      message,
      error: error?.message || String(error),
      context,
      timestamp: Date.now()
    });
    
    // 限制最近错误数量
    if (this.errorStats.recent.length > 50) {
      this.errorStats.recent.shift();
    }
  }
  
  /**
   * 设置全局错误处理
   * @private
   */
  setupGlobalErrorHandling() {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.error('未处理的Promise拒绝', event.reason, {
        source: 'unhandledrejection',
        promise: event.promise
      });
    });
    
    // 捕获全局JavaScript错误
    window.addEventListener('error', (event) => {
      this.error('全局JavaScript错误', event.error, {
        source: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }
  
  /**
   * 开始性能标记
   * @param {string} name - 标记名称
   */
  startPerformanceMark(name) {
    this.performanceMarks.set(name, performance.now());
  }
  
  /**
   * 结束性能标记
   * @param {string} name - 标记名称
   * @returns {number} 耗时（毫秒）
   */
  endPerformanceMark(name) {
    const startTime = this.performanceMarks.get(name);
    if (startTime === undefined) {
      this.warn(`性能标记不存在: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.performanceMarks.delete(name);
    
    // 记录性能指标
    this.performanceMetrics.push({
      name,
      duration,
      timestamp: Date.now()
    });
    
    // 限制性能指标数量
    if (this.performanceMetrics.length > 500) {
      this.performanceMetrics.shift();
    }
    
    this.debug(`性能标记 [${name}]: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  /**
   * 获取日志
   * @param {Object} options - 选项
   * @returns {Array} 日志数组
   */
  getLogs(options = {}) {
    const { level, limit = 100, since } = options;
    let logs = this.logs;
    
    // 按级别过滤
    if (level) {
      const levelValue = this.logLevels[level.toUpperCase()];
      logs = logs.filter(log => this.logLevels[log.level] >= levelValue);
    }
    
    // 按时间过滤
    if (since) {
      logs = logs.filter(log => log.timestamp >= since);
    }
    
    // 限制数量
    return logs.slice(-limit);
  }
  
  /**
   * 获取错误统计
   * @returns {Object} 错误统计
   */
  getErrorStats() {
    return { ...this.errorStats };
  }
  
  /**
   * 获取性能指标
   * @param {string} name - 指标名称
   * @returns {Array} 性能指标数组
   */
  getPerformanceMetrics(name = null) {
    if (name) {
      return this.performanceMetrics.filter(metric => metric.name === name);
    }
    return [...this.performanceMetrics];
  }
  
  /**
   * 清除日志
   * @param {Object} options - 选项
   */
  clearLogs(options = {}) {
    const { level, before } = options;
    
    if (level || before) {
      // 有条件清除
      this.logs = this.logs.filter(log => {
        if (level && this.logLevels[log.level] >= this.logLevels[level.toUpperCase()]) {
          return false;
        }
        if (before && log.timestamp < before) {
          return false;
        }
        return true;
      });
    } else {
      // 清除所有
      this.logs = [];
    }
  }
  
  /**
   * 保存到本地存储
   * @private
   * @param {Object} logEntry - 日志条目
   */
  saveToStorage(logEntry) {
    try {
      const key = `game_logs_${new Date().toDateString()}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(logEntry);
      
      // 限制存储大小
      if (existing.length > 500) {
        existing.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('保存日志到本地存储失败:', error);
    }
  }
  
  /**
   * 发送到远程服务器
   * @private
   * @param {Object} logEntry - 日志条目
   */
  sendToRemote(logEntry) {
    // 这里可以实现发送日志到远程服务器的逻辑
    // 例如使用fetch API发送到日志收集服务
  }
  
  /**
   * 销毁日志系统
   */
  destroy() {
    this.logs = [];
    this.performanceMarks.clear();
    this.performanceMetrics = [];
    this.errorStats = {
      total: 0,
      byType: {},
      bySource: {},
      recent: []
    };
  }
}

// 创建全局日志实例
const logger = new Logger();

export default logger;
export { Logger };