/**
 * UI调试工具
 * 提供UI元素拖拽、坐标显示等调试功能
 * 可以在任何场景中启用
 */

class UIDebugTool {
  /**
   * 构造函数
   * @param {Phaser.Game} game - 游戏实例
   */
  constructor(game) {
    this.game = game;
    this.active = false;
    this.debugGraphics = {}; // 存储每个场景的调试图形
    this.debugTexts = {}; // 存储每个场景的调试文本
    this.draggedElements = {}; // 存储被拖拽的元素信息
    this.selectedElement = null; // 当前选中的元素
    
    // 性能优化相关
    this.lastUpdateTime = 0; // 上次更新时间
    this.lastPointerUpdateTime = 0; // 上次指针更新时间
    this.lastDrawTime = 0; // 上次绘制时间
    this.updateThrottleInterval = 16; // 更新节流间隔（约60fps）
    this.pointerThrottleInterval = 50; // 指针更新节流间隔
    this.drawThrottleInterval = 100; // 绘制节流间隔
    this.pendingRedraw = false; // 是否有待处理的重绘请求
    this.changedElements = new Set(); // 存储已更改的元素，用于选择性重绘
    
    // 调试面板样式
    this.panelStyle = {
      x: 10,
      y: 10,
      width: 200,
      height: 100,
      backgroundColor: 0x000000,
      alpha: 0.7,
      textColor: '#00ff00',
      fontSize: '14px'
    };
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化调试工具
   */
  init() {
    // 添加全局键盘事件监听器
    this.setupKeyboardListeners();
    
    // 监听场景创建事件
    this.game.events.on('scene-create', this.onSceneCreate, this);
    
    // 将调试工具添加到游戏实例中，使其可以在所有场景中访问
    this.game.debugTool = this;
    
    console.log('UI调试工具已初始化，按D键开启/关闭调试模式');
  }
  
  /**
   * 设置键盘事件监听器
   */
  setupKeyboardListeners() {
    // 使用window对象添加全局键盘事件
    window.addEventListener('keydown', (event) => {
      // D键：切换调试模式
      if (event.key === 'd' || event.key === 'D') {
        this.toggleDebugMode();
      }
      
      // R键：重置所有拖拽的元素到原始位置
      if (event.key === 'r' || event.key === 'R') {
        this.resetDraggedElements();
      }
      
      // P键：打印当前选中元素的位置信息
      if (event.key === 'p' || event.key === 'P') {
        this.printSelectedElementInfo();
      }
    });
  }
  
  /**
   * 场景创建事件处理
   * @param {Phaser.Scene} scene - 新创建的场景
   */
  onSceneCreate(scene) {
    // 检查场景是否有效
    if (!scene || !scene.scene || !scene.scene.key) {
      console.warn('无法初始化场景调试功能：无效的场景对象');
      return;
    }
    
    // 为新场景初始化调试功能
    this.initSceneDebug(scene);
  }
  
  /**
   * 为场景初始化调试功能
   * @param {Phaser.Scene} scene - 场景实例
   */
  initSceneDebug(scene) {
    // 检查场景是否有效
    if (!scene || !scene.scene || !scene.scene.key) {
      console.warn('无法初始化场景调试功能：无效的场景对象');
      return;
    }
    
    // 检查场景是否有add方法
    if (!scene.add || typeof scene.add.graphics !== 'function') {
      console.warn(`无法为场景 ${scene.scene.key} 创建调试图形：scene.add.graphics方法不可用`);
      return;
    }
    
    // 创建调试图形对象
    try {
      this.debugGraphics[scene.scene.key] = scene.add.graphics();
    } catch (error) {
      console.warn(`为场景 ${scene.scene.key} 创建调试图形时出错：`, error);
      return;
    }
    
    // 创建调试信息文本
    this.createDebugText(scene);
    
    // 如果调试模式已激活，则显示调试元素
    if (this.active) {
      this.showDebugForScene(scene);
    } else {
      // 隐藏调试元素
      this.hideDebugForScene(scene);
    }
  }
  
  /**
   * 创建调试信息文本
   * @param {Phaser.Scene} scene - 场景实例
   */
  createDebugText(scene) {
    // 检查场景是否有效
    if (!scene || !scene.scene || !scene.scene.key) {
      console.warn('无法创建调试文本：无效的场景对象');
      return;
    }
    
    // 检查场景是否有必要的方法
    if (!scene.add || typeof scene.add.rectangle !== 'function' || typeof scene.add.text !== 'function') {
      console.warn(`无法为场景 ${scene.scene.key} 创建调试文本：必要的方法不可用`);
      return;
    }
    
    let panel, text;
    
    try {
      // 创建调试面板背景
      panel = scene.add.rectangle(
        this.panelStyle.x,
        this.panelStyle.y,
        this.panelStyle.width,
        this.panelStyle.height,
        this.panelStyle.backgroundColor,
        this.panelStyle.alpha
      ).setOrigin(0);
      
      // 创建调试文本
      text = scene.add.text(
        this.panelStyle.x + 10,
        this.panelStyle.y + 10,
        '调试模式: 关闭\n按D键开启/关闭\n按R键重置位置\n按P键打印信息',
        { fontSize: this.panelStyle.fontSize, fill: this.panelStyle.textColor }
      );
      
      // 存储调试文本和面板
      this.debugTexts[scene.scene.key] = {
        panel: panel,
        text: text
      };
      
      // 设置最高显示层级
      if (typeof panel.setDepth === 'function') panel.setDepth(1000);
      if (typeof text.setDepth === 'function') text.setDepth(1001);
      
      // 初始隐藏
      if (typeof panel.setVisible === 'function') panel.setVisible(false);
      if (typeof text.setVisible === 'function') text.setVisible(false);
    } catch (error) {
      console.warn(`为场景 ${scene.scene.key} 创建调试文本时出错：`, error);
      // 清理已创建的资源
      if (panel && typeof panel.destroy === 'function') panel.destroy();
      if (text && typeof text.destroy === 'function') text.destroy();
    }
  }
  
  /**
   * 切换调试模式
   */
  toggleDebugMode() {
    this.active = !this.active;
    this.isDebug = this.active; // 同步更新 isDebug 标志
    
    // 检查game对象是否有效
    if (!this.game || !this.game.scene) {
      console.warn('无法切换调试模式：无效的game对象');
      return;
    }
    
    try {
      // 获取所有活动场景
      let activeScenes = [];
      
      if (Array.isArray(this.game.scene.scenes)) {
        activeScenes = this.game.scene.scenes.filter(scene => {
          return scene && scene.sys && scene.sys.settings && scene.sys.settings.active;
        });
      } else {
        console.warn('无法获取活动场景：game.scene.scenes不是数组');
      }
      
      // 为每个活动场景更新调试状态
      activeScenes.forEach(scene => {
        if (this.active) {
          this.showDebugForScene(scene);
        } else {
          this.hideDebugForScene(scene);
        }
      });
      
      console.log(`调试模式: ${this.active ? '开启' : '关闭'}`);
    } catch (error) {
      console.warn('切换调试模式时出错：', error);
    }
  }
  
  /**
   * 为场景显示调试信息
   * @param {Phaser.Scene} scene - 场景实例
   */
  showDebugForScene(scene) {
    // 检查场景是否有效
    if (!scene || !scene.scene || !scene.scene.key) {
      console.warn('无法显示调试信息：无效的场景对象');
      return;
    }
    
    const sceneKey = scene.scene.key;
    
    // 显示调试文本和面板
    if (this.debugTexts[sceneKey]) {
      const debugText = this.debugTexts[sceneKey];
      if (debugText.panel && typeof debugText.panel.setVisible === 'function') {
        debugText.panel.setVisible(true);
      }
      
      if (debugText.text) {
        if (typeof debugText.text.setVisible === 'function') {
          debugText.text.setVisible(true);
        }
        
        if (typeof debugText.text.setText === 'function') {
          debugText.text.setText(
            `调试模式: 开启\n场景: ${sceneKey}\n按R键重置位置\n按P键打印信息`
          );
        }
      }
    }
    
    // 绘制所有UI元素的边界
    this.drawElementBounds(scene);
    
    // 启用拖拽功能
    this.enableDragForUIElements(scene);
    
    // 添加指针移动事件以更新调试信息
    if (scene.input && typeof scene.input.on === 'function') {
      scene.input.on('pointermove', this.updatePointerInfo, this);
    }
  }
  
  /**
   * 为场景隐藏调试信息
   * @param {Phaser.Scene} scene - 场景实例
   */
  hideDebugForScene(scene) {
    // 检查场景是否有效
    if (!scene || !scene.scene || !scene.scene.key) {
      console.warn('无法隐藏调试信息：无效的场景对象');
      return;
    }
    
    const sceneKey = scene.scene.key;
    
    // 隐藏调试文本和面板
    if (this.debugTexts[sceneKey]) {
      const debugText = this.debugTexts[sceneKey];
      if (debugText.panel && typeof debugText.panel.setVisible === 'function') {
        debugText.panel.setVisible(false);
      }
      
      if (debugText.text && typeof debugText.text.setVisible === 'function') {
        debugText.text.setVisible(false);
      }
    }
    
    // 清除调试图形
    if (this.debugGraphics[sceneKey] && typeof this.debugGraphics[sceneKey].clear === 'function') {
      this.debugGraphics[sceneKey].clear();
    }
    
    // 禁用拖拽功能
    this.disableDragForUIElements(scene);
    
    // 移除指针移动事件
    if (scene.input && typeof scene.input.off === 'function') {
      scene.input.off('pointermove', this.updatePointerInfo, this);
    }
  }
  
  /**
   * 绘制场景中UI元素的边界
   * @param {Phaser.Scene} scene - 场景实例
   * @param {Phaser.GameObjects.GameObject} [specificElement] - 特定要重绘的元素，如果未提供则重绘所有元素
   */
  drawElementBounds(scene) {
    // 使用节流控制绘制频率
    const currentTime = Date.now();
    if (currentTime - this.lastDrawTime < this.drawThrottleInterval) {
      // 如果距离上次绘制时间太短，标记为待重绘并返回
      this.pendingRedraw = true;
      return;
    }
    
    this.lastDrawTime = currentTime;
    this.pendingRedraw = false;
    
    const sceneKey = scene.scene.key;
    const graphics = this.debugGraphics[sceneKey];
    
    if (!graphics) return;
    
    // 清除之前的图形
    graphics.clear();
    
    // 设置图形样式
    graphics.lineStyle(2, 0xff0000);
    
    // 获取需要绘制的元素列表
    const elementsToProcess = this.changedElements.size > 0 && this.changedElements.size < 10 ?
      scene.children.list[0].list.filter(child => this.changedElements.has(child)) :
      scene.children.list[0].list;
    
    // 如果使用了选择性重绘，则在完成后清空变更集合
    if (this.changedElements.size > 0 && this.changedElements.size < 10) {
      this.changedElements.clear();
    }
    
    // 遍历场景中的游戏对象
    elementsToProcess.forEach(child => {
      // 只处理可见的游戏对象，排除Graphics类型（避免绘制自身）
      if (child.visible && child.type !== 'Graphics' && 
          child !== graphics && 
          child !== this.debugTexts[sceneKey]?.panel && 
          child !== this.debugTexts[sceneKey]?.text) {
        
        // 检查元素是否有必要的属性
        if (typeof child.x !== 'number' || 
            typeof child.y !== 'number' || 
            typeof child.displayWidth !== 'number' || 
            typeof child.displayHeight !== 'number') {
          // 跳过此元素
          return;
        }
        
        // 确保originX和originY存在，如果不存在则使用默认值0.5
        const originX = (typeof child.originX === 'number') ? child.originX : 0.5;
        const originY = (typeof child.originY === 'number') ? child.originY : 0.5;
        
        // 绘制边界框
        graphics.strokeRect(
          child.x - (originX * child.displayWidth),
          child.y - (originY * child.displayHeight),
          child.displayWidth,
          child.displayHeight
        );
        
        // 绘制中心点
        graphics.fillStyle(0x00ff00);
        graphics.fillCircle(child.x, child.y, 4);
        
        // 添加元素名称标签（如果有）
        const elementName = child.name || child.type;
        if (elementName) {
          // 检查是否已经有此元素的标签
          const existingLabel = scene.children.list[0].list.find(obj => 
            obj.type === 'Text' && 
            obj.debugLabel && 
            obj.debugElementId === child.id
          );
          
          if (!existingLabel) {
            const label = scene.add.text(
              child.x,
              child.y - child.displayHeight / 2 - 15,
              elementName,
              { fontSize: '12px', fill: '#ffff00', backgroundColor: '#000000' }
            ).setOrigin(0.5, 0.5);
            
            // 标记为调试标签
            label.debugLabel = true;
            label.debugElementId = child.id;
            label.setDepth(999);
          } else {
            // 更新现有标签的位置
            existingLabel.setPosition(
              child.x,
              child.y - child.displayHeight / 2 - 15
            );
          }
        }
      }
    });
    
    // 设置图形深度，确保在所有元素之上
    graphics.setDepth(998);
  }
  
  /**
   * 为场景中的UI元素启用拖拽功能
   * @param {Phaser.Scene} scene - 场景实例
   */
  enableDragForUIElements(scene) {
    // 检查场景是否有效
    if (!scene || !scene.children || !Array.isArray(scene.children.list[0].list)) {
      console.warn('无法启用拖拽功能：无效的场景对象或场景没有子元素列表');
      return;
    }
    
    try {
      // 使用事件委托模式，减少事件监听器数量
      // 为场景添加全局拖拽事件处理
      if (scene.input && typeof scene.input.on === 'function') {
        // 移除之前可能存在的事件监听器，避免重复
        scene.input.off('dragstart', this._handleDragStart, this);
        scene.input.off('drag', this._handleDrag, this);
        scene.input.off('dragend', this._handleDragEnd, this);
        
        // 添加全局拖拽事件监听器
        scene.input.on('dragstart', this._handleDragStart, this);
        scene.input.on('drag', this._handleDrag, this);
        scene.input.on('dragend', this._handleDragEnd, this);
      }
      
      // 遍历场景中的所有游戏对象
      scene.children.list[0].list.forEach(child => {
        // 确保child是有效对象
        if (!child) {
          return;
        }
        
        // 只处理可见的游戏对象，排除Graphics和Text类型
        if (child.visible && 
            child.type !== 'Graphics' && 
            child !== this.debugGraphics[scene.scene.key] && 
            child !== this.debugTexts[scene.scene.key]?.panel && 
            child !== this.debugTexts[scene.scene.key]?.text && 
            !child.debugLabel) {
          
          // 使元素可交互
          if (child.setInteractive && typeof child.setInteractive === 'function') {
            // 保存原始位置
            if (!child.originalPosition && typeof child.x === 'number' && typeof child.y === 'number') {
              child.originalPosition = { x: child.x, y: child.y };
            }
            
            // 设置交互区域
            try {
              child.setInteractive();
              
              // 确保scene.input存在，并且元素的input属性已正确初始化
              if (scene.input && typeof scene.input.setDraggable === 'function') {
                // 确保元素的input属性已初始化
                if (child.input) {
                  // 使元素可拖拽
                  scene.input.setDraggable(child);
                  
                  // 如果元素有pointerup事件监听器，临时保存并移除它
                  if (child.listeners && child.listeners('pointerup') && child.listeners('pointerup').length > 0) {
                    // // 保存原始的pointerup事件监听器
                    // child._originalPointerUpListeners = [...child.listeners('pointerup')];
                    
                    // // 移除所有pointerup监听器
                    // child.removeAllListeners('pointerup');
                    
                    // // 标记为调试模式下的按钮
                    child._isButtonInDebugMode = true;
                    
                    console.log(`已禁用按钮 "${child.name || child.type || '未命名按钮'}" 的点击事件`);                    
                  }
                } else {
                  console.warn(`无法设置元素可拖拽: 元素的input属性为null (${child.name || child.type || '未命名元素'})`);
                }
              }
            } catch (error) {
              console.warn(`为元素设置交互区域时出错: ${error.message}`);
            }
          }
        }
      });
    } catch (error) {
      console.warn(`启用场景拖拽功能时出错: ${error.message}`);
    }
  }
  
  /**
   * 处理拖拽开始事件（事件委托）
   * @private
   * @param {Phaser.Input.Pointer} pointer - 指针对象
   * @param {Phaser.GameObjects.GameObject} gameObject - 被拖拽的游戏对象
   */
  _handleDragStart(pointer, gameObject) {
    // 阻止事件冒泡
    if (pointer && pointer.event && typeof pointer.event.stopPropagation === 'function') {
      pointer.event.stopPropagation();
    }
    
    // 标记当前元素正在被拖拽
    if (gameObject) {
      gameObject.isBeingDragged = true;
    }
    
    // 检查参数有效性
    if (!gameObject) {
      console.warn('拖拽开始事件处理失败: gameObject为null');
      return;
    }
    
    try {
      this.selectedElement = gameObject;
      
      // 高亮选中的元素
      if (gameObject.scene) {
        this.highlightElement(gameObject.scene, gameObject);
      }
    } catch (error) {
      console.warn(`处理拖拽开始事件时出错: ${error.message}`);
    }
  }
  
  /**
   * 处理拖拽事件（事件委托 + 节流）
   * @private
   * @param {Phaser.Input.Pointer} pointer - 指针对象
   * @param {Phaser.GameObjects.GameObject} gameObject - 被拖拽的游戏对象
   * @param {number} dragX - 拖拽X坐标
   * @param {number} dragY - 拖拽Y坐标
   */
  _handleDrag(pointer, gameObject, dragX, dragY) {
    // 阻止事件冒泡
    if (pointer && pointer.event && typeof pointer.event.stopPropagation === 'function') {
      pointer.event.stopPropagation();
    }
    
    // 标记当前元素正在被拖拽
    if (gameObject) {
      gameObject.isBeingDragged = true;
    }
    
    // 检查参数有效性
    if (!gameObject) {
      console.warn('拖拽事件处理失败: gameObject为null');
      return;
    }
    
    // 检查坐标是否为有效数字
    if (typeof dragX !== 'number' || typeof dragY !== 'number' || isNaN(dragX) || isNaN(dragY)) {
      console.warn(`拖拽事件处理失败: 无效的坐标值 (${dragX}, ${dragY})`);
      return;
    }
    
    try {
      // 使用节流技术优化性能
      const currentTime = Date.now();
      if (currentTime - this.lastUpdateTime < this.updateThrottleInterval) {
        // 如果距离上次更新时间太短，只更新位置但不重绘
        gameObject.x = dragX;
        gameObject.y = dragY;
        return;
      }
      
      this.lastUpdateTime = currentTime;
      
      // 更新位置
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 将此元素添加到已更改元素集合中，用于选择性重绘
      if (this.changedElements instanceof Set) {
        this.changedElements.add(gameObject);
      } else {
        // 如果changedElements不是Set，重新初始化它
        this.changedElements = new Set([gameObject]);
      }
      
      // 更新调试信息
      if (gameObject.scene) {
        this.updateSelectedElementInfo(gameObject.scene, gameObject);
        
        // 如果有待处理的重绘请求或已更改元素较少，则重新绘制边界
        if (this.pendingRedraw || this.changedElements.size <= 3) {
          this.drawElementBounds(gameObject.scene);
        }
      }
    } catch (error) {
      console.warn(`处理拖拽事件时出错: ${error.message}`);
    }
  }
  
  /**
   * 处理拖拽结束事件（事件委托）
   * @private
   * @param {Phaser.Input.Pointer} pointer - 指针对象
   * @param {Phaser.GameObjects.GameObject} gameObject - 被拖拽的游戏对象
   */
  _handleDragEnd(pointer, gameObject) {
    // 清除拖拽状态标记
    if (gameObject) {
      gameObject.isBeingDragged = false;
      
      // 在调试模式下，我们不需要阻止 pointerup 事件
      // 因为按钮会在自己的 pointerup 处理中检查 _isButtonInDebugMode 标志
    }
    
    // 检查参数有效性
    if (!gameObject) {
      console.warn('拖拽结束事件处理失败: gameObject为null');
      return;
    }
    
    try {
      // 确保draggedElements存在
      if (!this.draggedElements) {
        this.draggedElements = {};
      }
      
      // 确保gameObject.id和originalPosition存在
      const elementId = gameObject.id || `element_${Math.random().toString(36).substr(2, 9)}`;
      
      // 确保坐标值是有效的数字
      let originalX = 0;
      let originalY = 0;
      
      if (gameObject.originalPosition && 
          typeof gameObject.originalPosition.x === 'number' && 
          typeof gameObject.originalPosition.y === 'number' && 
          !isNaN(gameObject.originalPosition.x) && 
          !isNaN(gameObject.originalPosition.y)) {
        originalX = gameObject.originalPosition.x;
        originalY = gameObject.originalPosition.y;
      } else if (typeof gameObject.x === 'number' && 
                typeof gameObject.y === 'number' && 
                !isNaN(gameObject.x) && 
                !isNaN(gameObject.y)) {
        originalX = gameObject.x;
        originalY = gameObject.y;
      }
      
      // 确保当前坐标是有效的数字
      const currentX = typeof gameObject.x === 'number' && !isNaN(gameObject.x) ? gameObject.x : 0;
      const currentY = typeof gameObject.y === 'number' && !isNaN(gameObject.y) ? gameObject.y : 0;
      
      // 获取元素名称，确保有一个有效的字符串
      let elementName = '未命名元素';
      try {
        elementName = (gameObject.name || gameObject.type || '未命名元素').toString();
      } catch (e) {
        // 如果toString()失败，使用默认名称
      }
      
      // 存储拖拽后的位置
      this.draggedElements[elementId] = {
        element: gameObject,
        scene: gameObject.scene && gameObject.scene.scene ? gameObject.scene.scene.key : 'unknown',
        originalX: originalX,
        originalY: originalY,
        currentX: currentX,
        currentY: currentY,
        name: elementName
      };
      
      // 输出位置变化信息
      console.log(`元素 "${elementName}" 位置已更新:`);
      console.log(`  原始位置: (${Math.round(originalX)}, ${Math.round(originalY)})`);
      console.log(`  当前位置: (${Math.round(currentX)}, ${Math.round(currentY)})`);
      console.log(`  相对移动: x += ${Math.round(currentX - originalX)}, y += ${Math.round(currentY - originalY)}`);
      
      // 拖拽结束后强制重绘一次
      if (gameObject.scene) {
        // 确保changedElements是一个Set
        if (!(this.changedElements instanceof Set)) {
          this.changedElements = new Set();
        }
        
        // 添加到已更改元素集合
        this.changedElements.add(gameObject);
        
        // 强制立即重绘
        this.pendingRedraw = true;
        this.lastDrawTime = 0; // 重置上次绘制时间，确保立即重绘
        
        this.drawElementBounds(gameObject.scene);
      }
    } catch (error) {
      console.warn(`处理拖拽结束事件时出错: ${error.message}`);
    }
  }
  
  /**
   * 为场景中的UI元素禁用拖拽功能
   * @param {Phaser.Scene} scene - 场景实例
   */
  disableDragForUIElements(scene) {
    // 检查场景是否有效
    if (!scene || !scene.children || !Array.isArray(scene.children.list[0].list)) {
      console.warn('无法禁用拖拽功能：无效的场景对象或场景没有子元素列表');
      return;
    }
    
    try {
      // 遍历场景中的所有游戏对象
      scene.children.list[0].list.forEach(child => {
        // 确保child是有效对象
        if (!child) {
          return;
        }
        
        try {
          // 移除拖拽功能
          if (child.input && child.input.draggable) {
            // 确保元素支持disableInteractive方法
            if (typeof child.disableInteractive === 'function') {
              child.disableInteractive();
            }
            
            // 确保元素支持off方法
            if (typeof child.off === 'function') {
              child.off('dragstart');
              child.off('drag');
              child.off('dragend');
              
              // 如果是调试模式下的按钮，恢复交互功能并清除标记
              if (child._isButtonInDebugMode) {
                // 重新启用交互功能
                if (typeof child.setInteractive === 'function') {
                  child.setInteractive();
                }
                
                // 清除调试模式标记
                delete child._isButtonInDebugMode;
                
                console.log(`已恢复按钮 "${child.name || child.type || '未命名按钮'}" 的点击事件`);
              }
            }
          }
          
          // 移除调试标签
          if (child.debugLabel) {
            child.destroy();
          }
        } catch (error) {
          console.warn(`禁用元素拖拽功能时出错: ${error.message}`);
        }
      });
    } catch (error) {
      console.warn(`禁用场景拖拽功能时出错: ${error.message}`);
    }
  }
  
  /**
   * 高亮显示选中的元素
   * @param {Phaser.Scene} scene - 场景实例
   * @param {Phaser.GameObjects.GameObject} element - 要高亮的元素
   */
  highlightElement(scene, element) {
    const sceneKey = scene.scene.key;
    const graphics = this.debugGraphics[sceneKey];
    
    if (!graphics || !element) return;
    
    // 重新绘制所有边界
    this.drawElementBounds(scene);
    
    // 检查元素是否有必要的属性
    if (typeof element.x !== 'number' || 
        typeof element.y !== 'number' || 
        typeof element.displayWidth !== 'number' || 
        typeof element.displayHeight !== 'number') {
      console.warn('无法高亮元素：元素缺少必要的位置或尺寸属性');
      return;
    }
    
    // 确保originX和originY存在，如果不存在则使用默认值0.5
    const originX = (typeof element.originX === 'number') ? element.originX : 0.5;
    const originY = (typeof element.originY === 'number') ? element.originY : 0.5;
    
    // 为选中元素绘制特殊高亮边界
    graphics.lineStyle(3, 0x00ffff);
    graphics.strokeRect(
      element.x - (originX * element.displayWidth),
      element.y - (originY * element.displayHeight),
      element.displayWidth,
      element.displayHeight
    );
  }
  
  /**
   * 更新指针信息
   * @param {Phaser.Input.Pointer} pointer - 指针对象
   */
  updatePointerInfo(pointer) {
    // 检查指针对象是否有效
    if (!pointer || typeof pointer.x !== 'number' || typeof pointer.y !== 'number') {
      console.warn('无法更新指针信息：无效的指针对象');
      return;
    }
    
    // 使用节流技术优化性能
    const currentTime = Date.now();
    if (currentTime - this.lastPointerUpdateTime < this.pointerThrottleInterval) {
      return;
    }
    this.lastPointerUpdateTime = currentTime;
    
    // 检查game对象是否有效
    if (!this.game || !this.game.scene || !Array.isArray(this.game.scene.scenes)) {
      console.warn('无法更新指针信息：无效的game对象');
      return;
    }
    
    try {
      // 获取当前活动场景
      const activeScene = this.game.scene.scenes.find(scene => 
        scene && scene.sys && scene.sys.settings && 
        scene.sys.settings.active && 
        scene.sys.settings.visible
      );
      
      if (!activeScene || !activeScene.scene || !activeScene.scene.key) return;
      
      const sceneKey = activeScene.scene.key;
      
      // 更新调试文本
      if (this.debugTexts[sceneKey]) {
        const debugText = this.debugTexts[sceneKey];
        if (debugText.text && typeof debugText.text.setText === 'function') {
          debugText.text.setText(
            `调试模式: 开启\n` +
            `场景: ${sceneKey}\n` +
            `指针: X=${Math.round(pointer.x)}, Y=${Math.round(pointer.y)}\n` +
            `按R键重置位置\n按P键打印信息`
          );
        }
      }
    } catch (error) {
      console.warn('更新指针信息时出错：', error);
    }
  }
  
  /**
   * 更新选中元素的信息
   * @param {Phaser.Scene} scene - 场景实例
   * @param {Phaser.GameObjects.GameObject} element - 选中的元素
   */
  updateSelectedElementInfo(scene, element) {
    // 检查参数是否有效
    if (!scene || !element) {
      console.warn('无法更新选中元素信息：无效的场景或元素');
      return;
    }
    
    // 确保scene.scene和scene.scene.key存在
    if (!scene.scene || !scene.scene.key) {
      console.warn('无法更新选中元素信息：场景缺少必要的属性');
      return;
    }
    
    const sceneKey = scene.scene.key;
    
    try {
      // 使用节流技术优化性能
      const currentTime = Date.now();
      if (currentTime - this.lastUpdateTime < this.updateThrottleInterval) {
        return;
      }
      this.lastUpdateTime = currentTime;
      
      // 更新调试文本
      if (this.debugTexts[sceneKey] && this.debugTexts[sceneKey].text) {
        // 检查元素是否有必要的属性
        const hasPosition = typeof element.x === 'number' && typeof element.y === 'number' && !isNaN(element.x) && !isNaN(element.y);
        const hasSize = typeof element.displayWidth === 'number' && typeof element.displayHeight === 'number' && !isNaN(element.displayWidth) && !isNaN(element.displayHeight);
        
        // 获取元素名称，确保有一个有效的字符串
        let elementName = '未命名元素';
        try {
          elementName = (element.name || element.type || '未命名元素').toString();
        } catch (e) {
          // 如果toString()失败，使用默认名称
        }
        
        let infoText = `调试模式: 开启\n场景: ${sceneKey}\n选中: ${elementName}\n`;
        
        // 添加位置信息（如果可用）
        if (hasPosition) {
          infoText += `位置: X=${Math.round(element.x)}, Y=${Math.round(element.y)}\n`;
        } else {
          infoText += `位置: 不可用\n`;
        }
        
        // 添加尺寸信息（如果可用）
        if (hasSize) {
          infoText += `尺寸: W=${Math.round(element.displayWidth)}, H=${Math.round(element.displayHeight)}\n`;
        } else {
          infoText += `尺寸: 不可用\n`;
        }
        
        infoText += `按R键重置位置\n按P键打印信息`;
        
        // 确保setText方法存在
        if (typeof this.debugTexts[sceneKey].text.setText === 'function') {
          this.debugTexts[sceneKey].text.setText(infoText);
        }
        
        // 确保changedElements是一个Set
        if (!(this.changedElements instanceof Set)) {
          this.changedElements = new Set();
        }
        
        // 将此元素添加到已更改元素集合中，用于选择性重绘
        this.changedElements.add(element);
      }
    } catch (error) {
      console.warn(`更新选中元素信息时出错: ${error.message}`);
    }
  }
  
  /**
   * 重置所有被拖拽的元素到原始位置
   */
  resetDraggedElements() {
    // 检查draggedElements对象是否有效
    if (!this.draggedElements || typeof this.draggedElements !== 'object') {
      console.warn('无法重置拖拽元素：draggedElements对象无效');
      return;
    }
    
    try {
      // 清空已更改元素集合，准备添加重置的元素
      this.changedElements = new Set();
      
      // 遍历所有被拖拽的元素
      Object.values(this.draggedElements).forEach(info => {
        // 检查元素是否仍然存在且具有必要的属性
        if (info && info.element && !info.element.destroyed && 
            typeof info.originalX === 'number' && 
            typeof info.originalY === 'number') {
          // 重置位置
          info.element.x = info.originalX;
          info.element.y = info.originalY;
          
          const name = info.name || '未命名元素';
          console.log(`元素 "${name}" 已重置到原始位置: (${Math.round(info.originalX)}, ${Math.round(info.originalY)})`);
          
          // 将重置的元素添加到已更改元素集合中
          this.changedElements.add(info.element);
        }
      });
      
      // 强制立即重绘已更改的元素边界
      this.pendingRedraw = true;
      this.lastDrawTime = 0; // 重置上次绘制时间，确保立即重绘
      
      // 检查game对象是否有效
      if (!this.game || !this.game.scene || !Array.isArray(this.game.scene.scenes)) {
        console.warn('无法获取活动场景：无效的game对象');
        return;
      }
      
      // 获取当前活动场景
      const activeScene = this.game.scene.scenes.find(scene => 
        scene && scene.sys && scene.sys.settings && 
        scene.sys.settings.active && 
        scene.sys.settings.visible
      );
      
      if (activeScene && activeScene.scene && activeScene.scene.key) {
        // 重新绘制边界
        this.drawElementBounds(activeScene);
      }
    } catch (error) {
      console.error('重置拖拽元素时出错：', error);
    }
  }
  
  /**
   * 打印选中元素的详细信息
   */
  printSelectedElementInfo() {
    try {
      // 获取当前活动场景
      const activeScene = this.game.scene.scenes.find(scene => 
        scene && scene.sys && scene.sys.settings && 
        scene.sys.settings.active && 
        scene.sys.settings.visible
      );
      
      if (!activeScene || !activeScene.scene || !activeScene.scene.key) {
        console.warn('无法打印元素信息：找不到活动场景');
        return;
      }
      
      // 获取当前选中的元素
      const selectedElement = this.selectedElement;
      
      if (!selectedElement) {
        console.warn('无法打印元素信息：没有选中的元素');
        return;
      }
      
      // 获取元素的基本信息
      const name = selectedElement.name || '未命名元素';
      const x = Math.round(selectedElement.x);
      const y = Math.round(selectedElement.y);
      const width = Math.round(selectedElement.displayWidth || 0);
      const height = Math.round(selectedElement.displayHeight || 0);
      const originX = selectedElement.originX || 0;
      const originY = selectedElement.originY || 0;
      const sceneKey = activeScene.scene.key;
      const type = selectedElement.type || 
                  (selectedElement.texture ? 'image' : 
                   (selectedElement.text !== undefined ? 'text' : 'container'));
      const textureKey = selectedElement.texture?.key || 'texture';
      
      // 打印元素信息
      console.group('%c选中元素信息', 'font-weight: bold; font-size: 14px; color: #4CAF50;');
      console.log(`名称: ${name}`);
      console.log(`场景: ${sceneKey}`);
      console.log(`位置: X=${x}, Y=${y}`);
      console.log(`尺寸: 宽=${width}, 高=${height}`);
      console.log(`原点: X=${originX}, Y=${originY}`);
      console.log(`类型: ${type}`);
      
      // 打印代码示例
      console.group('%c代码示例', 'font-weight: bold; font-size: 14px; color: #2196F3;');
      
      // 根据元素类型生成不同的代码示例
      let codeExample = `// 创建元素\nconst ${name.replace(/\s+/g, '')} = this.add.${type}(${x}, ${y}`;
      
      if (type === 'text') {
        const text = selectedElement.text || '';
        const fontSize = selectedElement.style?.fontSize || 16;
        const fontColor = selectedElement.style?.color || '#ffffff';
        codeExample += `, '${text}', { fontSize: ${fontSize}, color: '${fontColor}' });`;
      } else if (type === 'image' || type === 'sprite') {
        codeExample += `, '${textureKey}');\n\n// 设置尺寸\n${name.replace(/\s+/g, '')}.setDisplaySize(${width}, ${height});`;
      } else {
        codeExample += `);\n\n// 设置尺寸\n${name.replace(/\s+/g, '')}.setSize(${width}, ${height});`;
      }
      
      console.log(codeExample);
      console.groupEnd(); // 代码示例组结束
      console.groupEnd(); // 选中元素信息组结束
      
      // 不触发重绘，因为这只是打印信息，不需要更新UI
    } catch (error) {
      console.error('打印元素信息时出错：', error);
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    try {
      // 移除全局事件监听器
      this.game.events.off('scene-create', this.onSceneCreate, this);
      
      // 获取所有活动场景
      const activeScenes = this.game.scene.scenes.filter(scene => scene.sys.settings.active);
      
      // 为每个活动场景清理调试资源
      activeScenes.forEach(scene => {
        this.hideDebugForScene(scene);
        
        // 禁用拖拽功能
        this.disableDragForUIElements(scene);
        
        // 销毁调试图形对象
        const sceneKey = scene.scene.key;
        if (this.debugGraphics[sceneKey]) {
          this.debugGraphics[sceneKey].destroy();
          delete this.debugGraphics[sceneKey];
        }
        
        // 销毁调试文本
        if (this.debugTexts[sceneKey]) {
          if (this.debugTexts[sceneKey].panel) {
            this.debugTexts[sceneKey].panel.destroy();
          }
          if (this.debugTexts[sceneKey].text) {
            this.debugTexts[sceneKey].text.destroy();
          }
          delete this.debugTexts[sceneKey];
        }
      });
      
      // 清空所有引用
      this.debugTexts = {};
      this.debugGraphics = {};
      this.draggedElements = {};
      this.selectedElement = null;
      this.changedElements = new Set();
      this.pendingRedraw = false;
      
      console.log('UI调试工具已清理完成');
    } catch (error) {
      console.error('清理UI调试工具时出错：', error);
    }
  }
}

export default UIDebugTool;