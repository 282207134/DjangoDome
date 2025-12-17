/**
 * 生命周期系统主导出文件
 * 
 * 此文件导出所有主要的生命周期相关的类和类型。
 * 便于在应用程序中导入和使用生命周期系统。
 */

// 导出类型定义
export * from './types/lifecycle';

// 导出核心引擎
export { LifecycleEngine } from './core/LifecycleEngine';

// 导出初始化阶段的模块
export { EnvironmentDetector } from './initialization/EnvironmentDetector';
export type { EnvironmentInfo } from './initialization/EnvironmentDetector';

export { ConfigLoader } from './initialization/ConfigLoader';
export type { ApplicationConfig } from './initialization/ConfigLoader';

export { DatabaseConnector } from './initialization/DatabaseConnector';
export type { DatabaseConnection, DatabasePoolInfo } from './initialization/DatabaseConnector';

export { CacheInitializer } from './initialization/CacheInitializer';
export type { CacheStatistics, CacheItem } from './initialization/CacheInitializer';

// 导出示例
export * as examples from './examples/BasicUsageExample';
