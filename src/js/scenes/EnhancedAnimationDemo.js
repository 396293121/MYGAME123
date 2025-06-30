/**
 * 增强动画演示场景
 * 展示跳跃状态细分和基于关键帧的攻击判定功能
 */
import Character from '../classes/Character.js';

class EnhancedAnimationDemo extends Phaser.Scene {
  constructor() {
    super({ key: 'EnhancedAnimationDemo' });
  }

  preload() {
    // 加载角色精灵图
    this.load.atlas('warrior_sprite2', 
      '/assets/images/warrior_sprite2.png', 
      '/assets/images/warrior_sprite2.json'
    );
    
    // 加载音效（可选）
    this.load.audio('jump_sound', '/assets/audio/jump.wav');
    this.load.audio('attack_sound', '/assets/audio/attack.wav');
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 1200, 600);
    
    // 创建地面
    this.createGround();
    
    // 创建角色
    this.createCharacter();
    
    // 设置控制
    this.setupControls();
    
    // 设置攻击事件监听
    this.setupAttackEvents();
    
    // 创建UI信息
    this.createUI();
    
    // 设置调试信息
    this.setupDebugInfo();
  }

  createGround() {
    // 创建多个平台用于测试跳跃
    const platforms = this.physics.add.staticGroup();
    
    // 主地面
    const ground = this.add.rectangle(600, 580, 1200, 40, 0x00ff00);
    this.physics.add.existing(ground, true);
    platforms.add(ground);
    
    // 跳跃平台
    const platform1 = this.add.rectangle(300, 450, 200, 20, 0x00aa00);
    this.physics.add.existing(platform1, true);
    platforms.add(platform1);
    
    const platform2 = this.add.rectangle(700, 350, 200, 20, 0x00aa00);
    this.physics.add.existing(platform2, true);
    platforms.add(platform2);
    
    const platform3 = this.add.rectangle(500, 250, 200, 20, 0x00aa00);
    this.physics.add.existing(platform3, true);
    platforms.add(platform3);
    
    this.platforms = platforms;
  }

  createCharacter() {
    // 创建战士角色
    this.warrior = new Character(this, 100, 500, 'warrior_sprite2');
    
    // 设置角色与平台的碰撞
    this.physics.add.collider(this.warrior.sprite, this.platforms);
    
    // 设置摄像机跟随
    this.cameras.main.startFollow(this.warrior.sprite);
    this.cameras.main.setBounds(0, 0, 1200, 600);
  }

  setupControls() {
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加额外的控制键
    this.keys = this.input.keyboard.addKeys({
      'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
      'attack': Phaser.Input.Keyboard.KeyCodes.X,
      'debug': Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 攻击键事件
    this.keys.attack.on('down', () => {
      this.warrior.attack();
    });
    
    // 调试键事件
    this.keys.debug.on('down', () => {
      this.toggleDebug();
    });
  }

  setupAttackEvents() {
    // 监听角色攻击命中事件
    this.events.on('characterAttackHit', (attackData) => {
      console.log('攻击命中！', attackData);
      
      // 在这里可以添加敌人检测逻辑
      this.handleAttackHit(attackData);
    });
  }

  handleAttackHit(attackData) {
    // 创建攻击特效
    this.createAttackEffect(attackData.area);
    
    // 更新攻击计数
    this.attackCount++;
    this.updateUI();
  }

  createAttackEffect(attackArea) {
    // 创建攻击范围可视化效果
    const effect = this.add.graphics();
    effect.fillStyle(0xff0000, 0.3);
    effect.fillRectShape(attackArea);
    effect.lineStyle(2, 0xff0000, 1);
    effect.strokeRectShape(attackArea);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: effect,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  createUI() {
    // 初始化计数器
    this.jumpCount = 0;
    this.attackCount = 0;
    
    // 创建UI文本
    this.uiText = this.add.text(16, 16, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);
    
    // 创建控制说明
    this.controlsText = this.add.text(16, this.cameras.main.height - 120, 
      '控制说明:\n方向键: 移动\n上箭头: 跳跃\nX键: 攻击\nD键: 切换调试模式', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);
    
    this.updateUI();
  }

  setupDebugInfo() {
    this.debugMode = false;
    this.debugText = this.add.text(this.cameras.main.width - 16, 16, '', {
      fontSize: '12px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0);
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    
    if (this.debugMode) {
      // 开启物理调试
      this.physics.world.createDebugGraphic();
    } else {
      // 关闭物理调试
      if (this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.destroy();
        this.physics.world.debugGraphic = null;
      }
    }
  }

  update() {
    // 更新角色
    this.warrior.update(this.cursors);
    
    // 检测跳跃状态变化
    this.checkJumpStateChange();
    
    // 更新调试信息
    if (this.debugMode) {
      this.updateDebugInfo();
    } else {
      this.debugText.setText('');
    }
  }

  checkJumpStateChange() {
    const currentJumpState = this.warrior.animationManager.getJumpState(this.warrior.sprite);
    
    if (currentJumpState !== this.lastJumpState) {
      this.lastJumpState = currentJumpState;
      
      if (currentJumpState) {
        console.log(`跳跃状态变化: ${currentJumpState}`);
        
        // 计数跳跃次数
        if (currentJumpState === 'rising') {
          this.jumpCount++;
          this.updateUI();
        }
      }
    }
  }

  updateUI() {
    const warrior = this.warrior;
    const jumpState = warrior.animationManager.getJumpState(warrior.sprite) || '地面';
    const isOnFloor = warrior.sprite.body.onFloor();
    const velocityY = Math.round(warrior.sprite.body.velocity.y);
    
    this.uiText.setText([
      `角色状态: ${warrior.state}`,
      `跳跃状态: ${jumpState}`,
      `是否着地: ${isOnFloor ? '是' : '否'}`,
      `垂直速度: ${velocityY}`,
      `跳跃次数: ${this.jumpCount}`,
      `攻击次数: ${this.attackCount}`
    ]);
  }

  updateDebugInfo() {
    const warrior = this.warrior;
    const sprite = warrior.sprite;
    
    this.debugText.setText([
      `位置: (${Math.round(sprite.x)}, ${Math.round(sprite.y)})`,
      `速度: (${Math.round(sprite.body.velocity.x)}, ${Math.round(sprite.body.velocity.y)})`,
      `当前动画: ${sprite.anims.currentAnim ? sprite.anims.currentAnim.key : 'none'}`,
      `动画帧: ${sprite.anims.currentFrame ? sprite.anims.currentFrame.index : 'none'}`,
      `物理体: ${sprite.body.width}x${sprite.body.height}`,
      `偏移: (${sprite.body.offset.x}, ${sprite.body.offset.y})`
    ]);
  }
}

export default EnhancedAnimationDemo;