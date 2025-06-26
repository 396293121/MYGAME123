# RPG游戏项目

## 新增功能：NPC对话系统、任务系统和觉醒系统

### NPC对话系统

对话系统允许玩家与游戏中的NPC进行交互，获取任务、推进剧情和获得游戏提示。

**主要功能：**
- 支持多段对话内容
- 支持对话选项和分支
- 与任务系统集成
- 根据游戏进度显示不同对话内容

### 任务系统

任务系统管理游戏中的各种任务，包括主线任务、支线任务和隐藏任务。

**主要功能：**
- 任务追踪和进度管理
- 多种任务目标类型（收集、击杀、探索等）
- 任务奖励（经验、物品、金币等）
- 任务前置条件和后续任务

### 觉醒系统

觉醒系统为角色提供特殊能力，可以通过完成特定任务或达成特定条件解锁。

**主要功能：**
- 职业特定的觉醒能力
- 被动和主动觉醒效果
- 条件检查和解锁机制
- 觉醒能力管理和激活

## 测试场景

新增了一个NPC测试场景，可以用来测试NPC对话、任务系统和觉醒功能。

**操作说明：**
- 方向键：移动角色
- E键：与NPC交互
- Q键：打开/关闭任务列表
- R键：打开/关闭觉醒能力界面

## 如何启动测试场景

1. 启动游戏
2. 在主菜单中选择「开始游戏」
3. 选择角色后，游戏将自动加载GameScene
4. 要进入测试场景，可以在控制台执行：`game.scene.start('NPCTestScene')`

## 数据文件

- `DialogueData.js`：包含所有NPC的对话内容
- `QuestData.js`：包含所有任务的定义
- `AwakeningData.js`：包含所有觉醒能力的定义

## 系统集成

所有新系统已集成到GameManager中，可以通过以下方式访问：

```javascript
// 对话系统
gameManager.startDialogue(npc, dialogueKey, onEndCallback);

// 任务系统
gameManager.startQuest(questId);
gameManager.updateQuestObjective(questId, objectiveId, amount);
gameManager.completeQuest(questId);

// 觉醒系统
gameManager.unlockAwakening(awakeningId);
gameManager.activateAwakening(awakeningId);
gameManager.deactivateAwakening(awakeningId);
```