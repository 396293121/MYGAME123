/**
 * 简化的任务系统
 * 管理游戏中的单线任务流程
 */

class QuestSystem {
  constructor() {
    // 任务数据库
    this.quests = {};
    
    // 当前活跃任务（同一时间只有一个）
    this.currentQuest = null;
    
    // 已完成任务列表
    this.completedQuests = [];
    
    // 当前任务进度
    this.currentQuestProgress = null;
    
    // 任务阶段标记
    this.questFlags = {};
  }
  
  /**
   * 初始化任务系统
   * @param {Object} questData - 任务数据
   */
  init(questData) {
    this.quests = questData || {};
    console.log('任务系统初始化完成');
  }
  
  /**
   * 获取任务信息
   * @param {string} questId - 任务ID
   * @returns {Object} 任务信息
   */
  getQuest(questId) {
    return this.quests[questId];
  }
  
  /**
   * 开始一个任务
   * @param {string} questId - 任务ID
   * @returns {boolean} - 是否成功开始任务
   */
  startQuest(questId) {
    // 检查是否已有当前任务
    if (this.currentQuest) {
      console.log(`已有活跃任务，无法开始新任务 ${questId}`);
      return false;
    }
    
    // 检查任务是否存在
    const quest = this.getQuest(questId);
    if (!quest) {
      console.error(`任务 ${questId} 不存在`);
      return false;
    }
    
    // 检查任务是否已完成
    if (this.isQuestCompleted(questId)) {
      console.log(`任务 ${questId} 已完成`);
      return false;
    }
    
    // 检查前置任务
    if (quest.prerequisites && quest.prerequisites.length > 0) {
      for (const prereqId of quest.prerequisites) {
        if (!this.isQuestCompleted(prereqId)) {
          console.log(`前置任务 ${prereqId} 未完成，无法开始任务 ${questId}`);
          return false;
        }
      }
    }
    
    // 设置当前任务
    this.currentQuest = questId;
    
    // 初始化任务进度
    this.currentQuestProgress = {
      objectives: {}
    };
    
    // 初始化每个目标的进度
    if (quest.objectives) {
      for (const objective of quest.objectives) {
        this.currentQuestProgress.objectives[objective.id] = {
          current: 0,
          required: objective.count || 1,
          completed: false
        };
      }
    }
    
    console.log(`任务 ${questId} 已开始`);
    return true;
  }
  
  /**
   * 更新当前任务目标进度
   * @param {string} objectiveId - 目标ID
   * @param {number} amount - 增加的进度量
   * @returns {boolean} - 目标是否完成
   */
  updateObjective(objectiveId, amount = 1) {
    // 检查是否有当前任务
    if (!this.currentQuest) {
      console.log(`没有活跃任务，无法更新目标`);
      return false;
    }
    
    // 检查任务进度是否已初始化
    if (!this.currentQuestProgress || !this.currentQuestProgress.objectives[objectiveId]) {
      console.error(`当前任务的目标 ${objectiveId} 未初始化`);
      return false;
    }
    
    const objective = this.currentQuestProgress.objectives[objectiveId];
    
    // 如果目标已完成，则不再更新
    if (objective.completed) {
      return true;
    }
    
    // 更新进度
    objective.current += amount;
    
    // 检查是否达到目标
    if (objective.current >= objective.required) {
      objective.completed = true;
      console.log(`当前任务的目标 ${objectiveId} 已完成`);
      
      // 检查任务是否可以完成
      this.checkQuestCompletion();
      return true;
    }
    
    return false;
  }
  
  /**
   * 检查当前任务是否可以完成
   * @returns {boolean} - 任务是否完成
   */
  checkQuestCompletion() {
    // 检查是否有当前任务
    if (!this.currentQuest) {
      return false;
    }
    
    const quest = this.getQuest(this.currentQuest);
    if (!quest) {
      return false;
    }
    
    // 如果没有目标，则任务无法完成
    if (!quest.objectives || quest.objectives.length === 0) {
      return false;
    }
    
    // 检查所有目标是否都已完成
    const allObjectivesCompleted = quest.objectives.every(objective => {
      return this.currentQuestProgress.objectives[objective.id].completed;
    });
    
    if (allObjectivesCompleted) {
      console.log(`当前任务 ${this.currentQuest} 的所有目标已完成，可以提交任务`);
    }
    
    return allObjectivesCompleted;
  }
  
  /**
   * 完成当前任务
   * @returns {object|null} - 任务奖励，如果任务无法完成则返回null
   */
  completeQuest() {
    // 检查是否有当前任务
    if (!this.currentQuest) {
      console.log(`没有活跃任务，无法完成`);
      return null;
    }
    
    // 检查任务是否已完成所有目标
    if (!this.checkQuestCompletion()) {
      console.log(`当前任务尚未完成所有目标`);
      return null;
    }
    
    const quest = this.getQuest(this.currentQuest);
    const questId = this.currentQuest;
    
    // 添加到已完成任务列表
    this.completedQuests.push(questId);
    
    // 清除当前任务和进度
    this.currentQuest = null;
    this.currentQuestProgress = null;
    
    console.log(`任务 ${questId} 已完成`);
    
    // 返回任务奖励
    return quest.rewards || null;
  }
  
  /**
   * 检查任务是否活跃
   * @param {string} questId - 任务ID
   * @returns {boolean} - 任务是否活跃
   */
  isQuestActive(questId) {
    return this.currentQuest === questId;
  }
  
  /**
   * 检查任务是否已完成
   * @param {string} questId - 任务ID
   * @returns {boolean} - 任务是否已完成
   */
  isQuestCompleted(questId) {
    return this.completedQuests.includes(questId);
  }
  
  /**
   * 获取当前任务进度
   * @returns {object|null} - 任务进度数据
   */
  getQuestProgress() {
    return this.currentQuestProgress || null;
  }
  
  /**
   * 获取当前活跃任务
   * @returns {Object|null} 当前活跃任务
   */
  getActiveQuest() {
    if (!this.currentQuest) return null;
    
    return {
      id: this.currentQuest,
      ...this.getQuest(this.currentQuest),
      progress: this.currentQuestProgress
    };
  }

  /**
   * 获取所有已完成任务
   * @returns {Array} 已完成任务列表
   */
  getCompletedQuests() {
    return this.completedQuests.map(questId => ({
      id: questId,
      ...this.getQuest(questId)
    }));
  }

  /**
   * 获取已完成任务ID列表
   * @returns {Array} 已完成任务ID列表
   */
  getCompletedQuestIds() {
    return [...this.completedQuests];
  }

  /**
   * 获取目标进度
   * @param {string} objectiveId - 目标ID
   * @returns {number} 目标进度
   */
  getObjectiveProgress(objectiveId) {
    if (!this.currentQuestProgress || !this.currentQuestProgress.objectives || !this.currentQuestProgress.objectives[objectiveId]) {
      return 0;
    }
    return this.currentQuestProgress.objectives[objectiveId].progress;
  }
  
  /**
   * 获取当前活跃任务的数据
   * @returns {array} - 活跃任务数据列表
   */
  getActiveQuestData() {
    if (!this.currentQuest) {
      return [];
    }
    
    const quest = this.getQuest(this.currentQuest);
    if (!quest) {
      return [];
    }
    
    const questData = {
      id: this.currentQuest,
      title: quest.title,
      description: quest.description,
      objectives: quest.objectives.map(obj => {
        const progress = this.currentQuestProgress && this.currentQuestProgress.objectives[obj.id] || 
                        { current: 0, required: obj.count || 1, completed: false };
        return {
          id: obj.id,
          description: obj.description,
          current: progress.current,
          required: progress.required,
          completed: progress.completed
        };
      })
    };
    
    return [questData];
  }
  
  /**
   * 设置已完成任务列表
   * @param {array} quests - 已完成任务ID列表
   */
  setCompletedQuests(quests) {
    this.completedQuests = [...quests];
  }
  
  /**
   * 设置当前活跃任务和进度
   * @param {object} questData - 任务数据
   */
  setActiveQuests(questData) {
    if (!questData || Object.keys(questData).length === 0) {
      this.currentQuest = null;
      this.currentQuestProgress = null;
      return;
    }
    
    // 在简化的系统中，只取第一个任务作为当前任务
    const questId = Object.keys(questData)[0];
    this.currentQuest = questId;
    this.currentQuestProgress = questData[questId];
  }
  
  /**
   * 设置任务标记
   * @param {string} flag - 标记名称
   * @param {any} value - 标记值
   */
  setQuestFlag(flag, value) {
    this.questFlags[flag] = value;
  }
  
  /**
   * 获取任务标记
   * @param {string} flag - 标记名称
   * @param {any} defaultValue - 默认值
   * @returns {any} 标记值
   */
  getQuestFlag(flag, defaultValue = null) {
    return this.questFlags[flag] !== undefined ? this.questFlags[flag] : defaultValue;
  }
  
  /**
   * 获取当前任务的目标进度
   * @param {string} objectiveId - 目标ID
   * @returns {object|null} - 目标进度数据
   */
  getObjectiveProgress(objectiveId) {
    if (!this.currentQuest || !this.currentQuestProgress || !this.currentQuestProgress.objectives) {
      return null;
    }
    
    return this.currentQuestProgress.objectives[objectiveId] || null;
  }
}

export default QuestSystem;