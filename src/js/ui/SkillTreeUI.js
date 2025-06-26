/**
 * 技能树界面UI
 * 显示和管理角色的技能树，包括技能点分配、技能解锁和技能升级等功能
 */

import BaseUI from './BaseUI.js';

class SkillTreeUI extends BaseUI {
  /**
   * 构造函数
   * @param {Phaser.Scene} scene - UI所属的场景
   */
  constructor(scene) {
    super(scene, 'overlay');
    
    // 技能树数据
    this.skillTreeData = null;
    
    // 技能节点精灵组
    this.skillNodes = [];
    
    // 技能连线组
    this.skillConnections = [];
    
    // 当前选中的技能节点
    this.selectedNode = null;
  }

  /**
   * 初始化UI
   */
  init() {
    super.init();
    
    // 创建背景
    this.createBackground();
    
    // 创建标题
    this.createTitle();
    
    // 创建技能点信息
    this.createSkillPointsInfo();
    
    // 创建技能树
    this.createSkillTree();
    
    // 创建技能详情面板
    this.createSkillDetailsPanel();
    
    // 创建关闭按钮
    this.createCloseButton();
    
    return this;
  }

  /**
   * 创建标题
   */
  createTitle() {
    // 添加技能树标题
    const title = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.height * 0.1,
      '技能树',
      {
        fontSize: '32px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5);
    
    this.addElement('title', title);
  }

  /**
   * 创建技能点信息
   */
  createSkillPointsInfo() {
    const player = this.scene.player;
    if (!player) return;
    
    // 创建技能点文本
    const skillPointsText = this.scene.add.text(
      this.scene.cameras.main.width * 0.8,
      this.scene.cameras.main.height * 0.1,
      `可用技能点: ${player.skillPoints || 0}`,
      {
        fontSize: '20px',
        fill: '#ffff00'
      }
    );
    skillPointsText.setOrigin(0.5);
    
    this.addElement('skillPointsText', skillPointsText);
  }

  /**
   * 创建技能树
   */
  createSkillTree() {
    const player = this.scene.player;
    if (!player) return;
    
    // 获取玩家职业
    const playerClass = player.playerClass || 'warrior';
    
    // 加载对应职业的技能树数据
    this.loadSkillTreeData(playerClass);
  }

  /**
   * 加载技能树数据
   * @param {string} playerClass - 玩家职业
   */
  loadSkillTreeData(playerClass) {
    // 这里应该从游戏管理器或配置文件中加载技能树数据
    // 为了演示，这里使用硬编码的数据
    
    // 战士技能树示例数据
    const warriorSkillTree = {
      nodes: [
        {
          id: 'basic_slash',
          name: '基础劈砍',
          description: '对敌人造成100%武器伤害',
          icon: 'skill_slash',
          level: 1,
          maxLevel: 1,
          unlocked: true,
          position: { x: 400, y: 250 },
          connections: ['heavy_slash']
        },
        {
          id: 'heavy_slash',
          name: '重劈',
          description: '对敌人造成150%武器伤害',
          icon: 'skill_heavy_slash',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 500, y: 250 },
          connections: ['whirlwind', 'shield_bash']
        },
        {
          id: 'whirlwind',
          name: '旋风斩',
          description: '对周围敌人造成120%武器伤害',
          icon: 'skill_whirlwind',
          level: 0,
          maxLevel: 5,
          unlocked: false,
          position: { x: 600, y: 200 },
          connections: ['berserk']
        },
        {
          id: 'shield_bash',
          name: '盾击',
          description: '用盾牌击晕敌人，造成80%武器伤害并眩晕2秒',
          icon: 'skill_shield_bash',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 600, y: 300 },
          connections: ['shield_wall']
        },
        {
          id: 'berserk',
          name: '狂暴',
          description: '增加30%攻击速度和20%移动速度，持续10秒',
          icon: 'skill_berserk',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 700, y: 200 },
          connections: []
        },
        {
          id: 'shield_wall',
          name: '盾墙',
          description: '减少50%受到的伤害，持续5秒',
          icon: 'skill_shield_wall',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 700, y: 300 },
          connections: []
        }
      ]
    };
    
    // 法师技能树示例数据
    const mageSkillTree = {
      nodes: [
        {
          id: 'fire_bolt',
          name: '火球术',
          description: '发射一个火球，造成100%法术伤害',
          icon: 'skill_fire_bolt',
          level: 1,
          maxLevel: 1,
          unlocked: true,
          position: { x: 400, y: 250 },
          connections: ['fireball']
        },
        {
          id: 'fireball',
          name: '烈焰球',
          description: '发射一个爆炸的火球，造成150%法术伤害',
          icon: 'skill_fireball',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 500, y: 250 },
          connections: ['meteor', 'frost_nova']
        },
        {
          id: 'meteor',
          name: '陨石术',
          description: '召唤一个陨石砸向目标区域，造成200%法术伤害',
          icon: 'skill_meteor',
          level: 0,
          maxLevel: 5,
          unlocked: false,
          position: { x: 600, y: 200 },
          connections: ['inferno']
        },
        {
          id: 'frost_nova',
          name: '冰霜新星',
          description: '冻结周围敌人，造成80%法术伤害并减速50%',
          icon: 'skill_frost_nova',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 600, y: 300 },
          connections: ['ice_barrier']
        },
        {
          id: 'inferno',
          name: '地狱火',
          description: '召唤持续燃烧的地狱火，每秒造成50%法术伤害',
          icon: 'skill_inferno',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 700, y: 200 },
          connections: []
        },
        {
          id: 'ice_barrier',
          name: '冰盾',
          description: '创造一个吸收伤害的冰盾，持续10秒',
          icon: 'skill_ice_barrier',
          level: 0,
          maxLevel: 3,
          unlocked: false,
          position: { x: 700, y: 300 },
          connections: []
        }
      ]
    };
    
    // 根据职业选择技能树数据
    switch (playerClass.toLowerCase()) {
      case 'warrior':
        this.skillTreeData = warriorSkillTree;
        break;
      case 'mage':
        this.skillTreeData = mageSkillTree;
        break;
      default:
        this.skillTreeData = warriorSkillTree; // 默认使用战士技能树
    }
    
    // 渲染技能树
    this.renderSkillTree();
  }

  /**
   * 渲染技能树
   */
  renderSkillTree() {
    if (!this.skillTreeData) return;
    
    // 清除之前的技能节点和连线
    this.clearSkillTree();
    
    // 创建技能树容器
    const treeContainer = this.scene.add.container(
      this.scene.cameras.main.centerX - 350,
      this.scene.cameras.main.centerY - 100
    );
    this.addElement('treeContainer', treeContainer);
    
    // 先绘制连线
    this.drawSkillConnections();
    
    // 再绘制节点
    this.drawSkillNodes();
  }

  /**
   * 清除技能树
   */
  clearSkillTree() {
    // 清除技能节点
    this.skillNodes.forEach(node => {
      if (node) node.destroy();
    });
    this.skillNodes = [];
    
    // 清除技能连线
    this.skillConnections.forEach(line => {
      if (line) line.destroy();
    });
    this.skillConnections = [];
  }

  /**
   * 绘制技能连线
   */
  drawSkillConnections() {
    const nodes = this.skillTreeData.nodes;
    
    // 绘制每个节点的连线
    nodes.forEach(node => {
      if (node.connections && node.connections.length > 0) {
        node.connections.forEach(targetId => {
          // 查找目标节点
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode) {
            // 创建连线
            const line = this.scene.add.graphics();
            
            // 设置线条样式
            const isUnlocked = node.unlocked && node.level > 0;
            const lineColor = isUnlocked ? 0x00ff00 : 0x888888;
            const lineAlpha = isUnlocked ? 1 : 0.6;
            
            line.lineStyle(2, lineColor, lineAlpha);
            
            // 绘制线条
            line.beginPath();
            line.moveTo(node.position.x, node.position.y);
            line.lineTo(targetNode.position.x, targetNode.position.y);
            line.closePath();
            line.strokePath();
            
            // 将线条添加到容器
            const treeContainer = this.getElement('treeContainer');
            if (treeContainer) {
              treeContainer.add(line);
            }
            
            // 保存线条引用
            this.skillConnections.push(line);
          }
        });
      }
    });
  }

  /**
   * 绘制技能节点
   */
  drawSkillNodes() {
    const nodes = this.skillTreeData.nodes;
    const player = this.scene.player;
    
    // 绘制每个技能节点
    nodes.forEach(node => {
      // 创建节点背景
      const nodeBg = this.scene.add.circle(
        node.position.x,
        node.position.y,
        30,
        node.unlocked ? 0x444444 : 0x222222
      );
      
      // 设置边框
      const borderColor = this.getNodeBorderColor(node);
      nodeBg.setStrokeStyle(3, borderColor);
      
      // 创建技能图标
      const nodeIcon = this.scene.add.sprite(
        node.position.x,
        node.position.y,
        'skill_icons',
        this.getSkillIconFrame(node.icon)
      );
      nodeIcon.setScale(0.8);
      
      // 如果技能未解锁，添加灰色滤镜
      if (!node.unlocked) {
        nodeIcon.setTint(0x888888);
      }
      
      // 创建技能等级文本
      const levelText = this.scene.add.text(
        node.position.x + 20,
        node.position.y + 20,
        `${node.level}/${node.maxLevel}`,
        {
          fontSize: '12px',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { left: 3, right: 3, top: 2, bottom: 2 }
        }
      );
      levelText.setOrigin(0.5);
      
      // 将节点添加到容器
      const treeContainer = this.getElement('treeContainer');
      if (treeContainer) {
        treeContainer.add(nodeBg);
        treeContainer.add(nodeIcon);
        treeContainer.add(levelText);
      }
      
      // 保存节点引用
      this.skillNodes.push({ nodeBg, nodeIcon, levelText, data: node });
      
      // 添加交互
      nodeBg.setInteractive({ useHandCursor: true });
      
      // 点击事件
      nodeBg.on('pointerdown', () => {
        this.selectSkillNode(node);
      });
      
      // 悬停事件
      nodeBg.on('pointerover', () => {
        nodeBg.setStrokeStyle(4, 0xffffff);
      });
      
      nodeBg.on('pointerout', () => {
        nodeBg.setStrokeStyle(3, borderColor);
      });
    });
  }

  /**
   * 获取技能图标帧
   * @param {string} iconKey - 图标键名
   * @returns {number} 图标帧索引
   */
  getSkillIconFrame(iconKey) {
    // 这里应该根据实际的精灵图集配置返回正确的帧索引
    // 为了演示，这里使用简单的映射
    const iconMap = {
      'skill_slash': 0,
      'skill_heavy_slash': 1,
      'skill_whirlwind': 2,
      'skill_shield_bash': 3,
      'skill_berserk': 4,
      'skill_shield_wall': 5,
      'skill_fire_bolt': 6,
      'skill_fireball': 7,
      'skill_meteor': 8,
      'skill_frost_nova': 9,
      'skill_inferno': 10,
      'skill_ice_barrier': 11
    };
    
    return iconMap[iconKey] || 0;
  }

  /**
   * 获取节点边框颜色
   * @param {Object} node - 技能节点数据
   * @returns {number} 颜色代码
   */
  getNodeBorderColor(node) {
    if (!node.unlocked) {
      return 0x555555; // 未解锁
    }
    
    if (node.level === 0) {
      return 0xffff00; // 已解锁但未学习
    }
    
    if (node.level === node.maxLevel) {
      return 0xff9900; // 已满级
    }
    
    return 0x00ff00; // 已学习但未满级
  }

  /**
   * 选择技能节点
   * @param {Object} node - 技能节点数据
   */
  selectSkillNode(node) {
    // 更新选中的节点
    this.selectedNode = node;
    
    // 更新技能详情面板
    this.updateSkillDetailsPanel();
  }

  /**
   * 创建技能详情面板
   */
  createSkillDetailsPanel() {
    // 创建详情面板背景
    const detailsPanelBg = this.scene.add.rectangle(
      this.scene.cameras.main.width * 0.8,
      this.scene.cameras.main.centerY,
      300,
      400,
      0x222222,
      0.9
    );
    detailsPanelBg.setStrokeStyle(2, 0xffffff);
    this.addElement('detailsPanelBg', detailsPanelBg);
    
    // 创建技能名称文本
    const skillNameText = this.scene.add.text(
      this.scene.cameras.main.width * 0.8,
      this.scene.cameras.main.centerY - 160,
      '选择一个技能',
      {
        fontSize: '24px',
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    );
    skillNameText.setOrigin(0.5);
    this.addElement('skillNameText', skillNameText);
    
    // 创建技能图标
    const skillIcon = this.scene.add.sprite(
      this.scene.cameras.main.width * 0.8,
      this.scene.cameras.main.centerY - 100,
      'skill_icons',
      0
    );
    skillIcon.setScale(2);
    skillIcon.setVisible(false); // 初始隐藏
    this.addElement('skillIcon', skillIcon);
    
    // 创建技能等级文本
    const skillLevelText = this.scene.add.text(
      this.scene.cameras.main.width * 0.8,
      this.scene.cameras.main.centerY - 40,
      '等级: 0/0',
      {
        fontSize: '18px',
        fill: '#ffffff'
      }
    );
    skillLevelText.setOrigin(0.5);
    this.addElement('skillLevelText', skillLevelText);
    
    // 创建技能描述文本
    const skillDescText = this.scene.add.text(
      this.scene.cameras.main.width * 0.8 - 130,
      this.scene.cameras.main.centerY,
      '选择一个技能查看详情',
      {
        fontSize: '16px',
        fill: '#cccccc',
        wordWrap: { width: 260 }
      }
    );
    this.addElement('skillDescText', skillDescText);
    
    // 创建学习按钮
    const learnButton = this.scene.add.text(
      this.scene.cameras.main.width * 0.8,
      this.scene.cameras.main.centerY + 150,
      '学习技能',
      {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#005500',
        padding: { left: 15, right: 15, top: 10, bottom: 10 }
      }
    );
    learnButton.setOrigin(0.5);
    learnButton.setInteractive({ useHandCursor: true });
    learnButton.setVisible(false); // 初始隐藏
    
    // 添加鼠标悬停效果
    learnButton.on('pointerover', () => {
      learnButton.setStyle({ backgroundColor: '#007700' });
    });
    
    learnButton.on('pointerout', () => {
      learnButton.setStyle({ backgroundColor: '#005500' });
    });
    
    // 添加点击事件
    learnButton.on('pointerdown', () => {
      this.learnSkill();
    });
    
    this.addElement('learnButton', learnButton);
  }

  /**
   * 更新技能详情面板
   */
  updateSkillDetailsPanel() {
    const node = this.selectedNode;
    const player = this.scene.player;
    
    if (!node || !player) return;
    
    // 更新技能名称
    const skillNameText = this.getElement('skillNameText');
    if (skillNameText) {
      skillNameText.setText(node.name);
    }
    
    // 更新技能图标
    const skillIcon = this.getElement('skillIcon');
    if (skillIcon) {
      skillIcon.setFrame(this.getSkillIconFrame(node.icon));
      skillIcon.setVisible(true);
      
      // 如果技能未解锁，添加灰色滤镜
      if (!node.unlocked) {
        skillIcon.setTint(0x888888);
      } else {
        skillIcon.clearTint();
      }
    }
    
    // 更新技能等级
    const skillLevelText = this.getElement('skillLevelText');
    if (skillLevelText) {
      skillLevelText.setText(`等级: ${node.level}/${node.maxLevel}`);
    }
    
    // 更新技能描述
    const skillDescText = this.getElement('skillDescText');
    if (skillDescText) {
      let descText = node.description;
      
      // 如果技能未解锁，添加解锁条件
      if (!node.unlocked) {
        descText += '\n\n需要先学习前置技能。';
      }
      
      // 如果技能已满级，添加提示
      if (node.level >= node.maxLevel) {
        descText += '\n\n此技能已达到最高等级。';
      }
      
      skillDescText.setText(descText);
    }
    
    // 更新学习按钮
    const learnButton = this.getElement('learnButton');
    if (learnButton) {
      // 检查是否可以学习
      const canLearn = this.canLearnSkill(node, player);
      
      learnButton.setVisible(canLearn);
      
      if (canLearn) {
        learnButton.setText('学习技能');
        learnButton.setStyle({
          backgroundColor: '#005500',
          fill: '#ffffff'
        });
      }
    }
  }

  /**
   * 检查是否可以学习技能
   * @param {Object} node - 技能节点数据
   * @param {Object} player - 玩家对象
   * @returns {boolean} 是否可以学习
   */
  canLearnSkill(node, player) {
    // 如果技能已满级，不能再学习
    if (node.level >= node.maxLevel) {
      return false;
    }
    
    // 如果技能未解锁，不能学习
    if (!node.unlocked) {
      return false;
    }
    
    // 如果没有足够的技能点，不能学习
    if ((player.skillPoints || 0) <= 0) {
      return false;
    }
    
    return true;
  }

  /**
   * 学习技能
   */
  learnSkill() {
    const node = this.selectedNode;
    const player = this.scene.player;
    
    if (!node || !player || !this.canLearnSkill(node, player)) return;
    
    // 扣除技能点
    player.skillPoints = (player.skillPoints || 0) - 1;
    
    // 增加技能等级
    node.level += 1;
    
    // 如果是第一次学习该技能，解锁连接的技能
    if (node.level === 1 && node.connections) {
      node.connections.forEach(targetId => {
        const targetNode = this.skillTreeData.nodes.find(n => n.id === targetId);
        if (targetNode) {
          targetNode.unlocked = true;
        }
      });
    }
    
    // 更新技能树显示
    this.renderSkillTree();
    
    // 更新技能点信息
    this.updateSkillPointsInfo();
    
    // 更新技能详情面板
    this.updateSkillDetailsPanel();
    
    // 播放技能学习音效
    this.scene.sound.play('skill_learn', { volume: 0.5 });
  }

  /**
   * 更新技能点信息
   */
  updateSkillPointsInfo() {
    const player = this.scene.player;
    if (!player) return;
    
    // 更新技能点文本
    const skillPointsText = this.getElement('skillPointsText');
    if (skillPointsText) {
      skillPointsText.setText(`可用技能点: ${player.skillPoints || 0}`);
    }
  }

  /**
   * 创建关闭按钮
   */
  createCloseButton() {
    // 创建关闭按钮
    const closeButton = this.scene.add.text(
      this.scene.cameras.main.width * 0.95,
      this.scene.cameras.main.height * 0.1,
      'X',
      {
        fontSize: '32px',
        fill: '#ffffff'
      }
    );
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });
    
    // 添加鼠标悬停效果
    closeButton.on('pointerover', () => {
      closeButton.setStyle({ fill: '#ff0000' });
    });
    
    closeButton.on('pointerout', () => {
      closeButton.setStyle({ fill: '#ffffff' });
    });
    
    // 添加点击事件
    closeButton.on('pointerdown', () => {
      this.hide();
    });
    
    this.addElement('closeButton', closeButton);
  }

  /**
   * 显示UI
   * @param {Object} data - 显示时传递的数据
   */
  show(data = {}) {
    super.show(data);
    
    // 重新加载技能树数据
    const player = this.scene.player;
    if (player) {
      const playerClass = player.playerClass || 'warrior';
      this.loadSkillTreeData(playerClass);
    }
    
    // 更新技能点信息
    this.updateSkillPointsInfo();
    
    return this;
  }
}

export default SkillTreeUI;