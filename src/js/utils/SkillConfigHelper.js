/**
 * 技能配置助手工具
 * 提供通用的技能配置获取和处理方法
 */

import { getCharacterConfig } from '../data/CharacterConfig.js';

class SkillConfigHelper {
  /**
   * 获取角色的技能键位映射
   * @param {string} characterType - 角色类型
   * @returns {Object} 技能键位映射对象
   */
  static getSkillKeyMappings(characterType) {
    const config = getCharacterConfig(characterType);
    return config?.skillKeyMappings || {};
  }

  /**
   * 获取角色的技能动画列表
   * @param {string} characterType - 角色类型
   * @returns {Array} 技能动画列表
   */
  static getSkillAnimations(characterType) {
    const config = getCharacterConfig(characterType);
    return config?.skillAnimations || [];
  }

  /**
   * 获取角色的技能配置
   * @param {string} characterType - 角色类型
   * @returns {Object} 技能配置对象
   */
  static getClassSkills(characterType) {
    const config = getCharacterConfig(characterType);
    return config?.classSkills || {};
  }

  /**
   * 检查指定动画是否为技能动画
   * @param {string} characterType - 角色类型
   * @param {string} animationKey - 动画键名
   * @returns {boolean} 是否为技能动画
   */
  static isSkillAnimation(characterType, animationKey) {
    const skillAnimations = this.getSkillAnimations(characterType);
    return skillAnimations.includes(animationKey);
  }

  /**
   * 根据键位获取技能信息
   * @param {string} characterType - 角色类型
   * @param {string} keyCode - 键位代码（如'Q', 'W', 'E'）
   * @returns {Object|null} 技能信息对象
   */
  static getSkillByKey(characterType, keyCode) {
    const keyMappings = this.getSkillKeyMappings(characterType);
    return keyMappings[keyCode] || null;
  }

  /**
   * 获取所有可用的技能键位
   * @param {string} characterType - 角色类型
   * @returns {Array} 键位数组
   */
  static getAvailableSkillKeys(characterType) {
    const keyMappings = this.getSkillKeyMappings(characterType);
    return Object.keys(keyMappings);
  }

  /**
   * 验证角色配置的完整性
   * @param {string} characterType - 角色类型
   * @returns {Object} 验证结果
   */
  static validateCharacterConfig(characterType) {
    const config = getCharacterConfig(characterType);
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!config) {
      result.valid = false;
      result.errors.push(`角色配置不存在: ${characterType}`);
      return result;
    }

    // 检查技能键位映射
    if (!config.skillKeyMappings || Object.keys(config.skillKeyMappings).length === 0) {
      result.warnings.push('缺少技能键位映射配置');
    }

    // 检查技能动画列表
    if (!config.skillAnimations || config.skillAnimations.length === 0) {
      result.warnings.push('缺少技能动画列表配置');
    }

    // 检查技能配置
    if (!config.classSkills || Object.keys(config.classSkills).length === 0) {
      result.warnings.push('缺少职业技能配置');
    }

    // 检查键位映射与动画列表的一致性
    if (config.skillKeyMappings && config.skillAnimations) {
      const mappingSkills = Object.values(config.skillKeyMappings).map(skill => skill.skillId);
      const missingAnimations = mappingSkills.filter(skillId => !config.skillAnimations.includes(skillId));
      
      if (missingAnimations.length > 0) {
        result.warnings.push(`以下技能缺少动画配置: ${missingAnimations.join(', ')}`);
      }
    }

    return result;
  }
}

export default SkillConfigHelper;