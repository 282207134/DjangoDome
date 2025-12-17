/**
 * 生命周期类型定义文件
 * 
 * 本文件包含所有生命周期相关的类型定义，包括：
 * - 生命周期阶段枚举
 * - 生命周期事件接口
 * - 生命周期监听器类型
 * - 生命周期状态管理类型
 */

/**
 * 生命周期阶段枚举
 * 
 * 定义了系统运行的各个阶段：
 * - 初始化 (INITIALIZATION): 系统启动阶段
 * - 准备 (PREPARATION): 资源准备阶段
 * - 验证 (VALIDATION): 数据验证阶段
 * - 执行 (EXECUTION): 业务执行阶段
 * - 监测 (MONITORING): 系统监测阶段
 * - 清理 (CLEANUP): 资源清理阶段
 */
export enum LifecyclePhase {
  /** 初始化阶段：系统启动、环境检测、基础配置 */
  INITIALIZATION = 'INITIALIZATION',
  
  /** 准备阶段：资源准备、依赖注入、数据预加载 */
  PREPARATION = 'PREPARATION',
  
  /** 验证阶段：数据验证、业务规则检查、权限验证 */
  VALIDATION = 'VALIDATION',
  
  /** 执行阶段：业务逻辑执行、请求处理 */
  EXECUTION = 'EXECUTION',
  
  /** 监测阶段：系统监测、性能追踪、告警管理 */
  MONITORING = 'MONITORING',
  
  /** 清理阶段：资源释放、连接关闭、日志归档 */
  CLEANUP = 'CLEANUP',
}

/**
 * 生命周期事件级别
 * 
 * 定义了生命周期事件的优先级和重要性
 */
export enum EventLevel {
  /** 调试级别：用于详细的调试信息 */
  DEBUG = 'DEBUG',
  
  /** 信息级别：一般的运行信息 */
  INFO = 'INFO',
  
  /** 警告级别：可能的问题 */
  WARN = 'WARN',
  
  /** 错误级别：执行过程中发生的错误 */
  ERROR = 'ERROR',
  
  /** 严重级别：系统级严重错误 */
  CRITICAL = 'CRITICAL',
}

/**
 * 生命周期执行结果
 * 
 * 定义了生命周期阶段的执行结果状态
 */
export enum ExecutionResult {
  /** 成功 */
  SUCCESS = 'SUCCESS',
  
  /** 失败 */
  FAILURE = 'FAILURE',
  
  /** 部分成功 */
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  
  /** 跳过 */
  SKIPPED = 'SKIPPED',
}

/**
 * 生命周期事件接口
 * 
 * 表示在生命周期的某个阶段发生的事件
 */
export interface LifecycleEvent {
  /** 事件ID，用于唯一标识一个事件 */
  id: string;
  
  /** 事件所属的生命周期阶段 */
  phase: LifecyclePhase;
  
  /** 事件类型，如 'started', 'completed', 'failed' */
  type: string;
  
  /** 事件名称，用于描述事件 */
  name: string;
  
  /** 事件发生的时间戳 */
  timestamp: number;
  
  /** 事件的详细描述 */
  description: string;
  
  /** 事件级别 */
  level: EventLevel;
  
  /** 事件相关的额外数据 */
  data?: Record<string, unknown>;
  
  /** 事件发生的来源模块 */
  source?: string;
  
  /** 事件的执行时长（毫秒） */
  duration?: number;
}

/**
 * 生命周期听器函数类型
 * 
 * 用于监听特定生命周期阶段的事件
 */
export type LifecycleListener = (event: LifecycleEvent) => void | Promise<void>;

/**
 * 生命周期观察者接口
 * 
 * 用于观察和响应生命周期的各个阶段
 */
export interface LifecycleObserver {
  /** 初始化阶段开始时调用 */
  onInitializationStart?(): void | Promise<void>;
  
  /** 初始化阶段完成时调用 */
  onInitializationComplete?(): void | Promise<void>;
  
  /** 准备阶段开始时调用 */
  onPreparationStart?(): void | Promise<void>;
  
  /** 准备阶段完成时调用 */
  onPreparationComplete?(): void | Promise<void>;
  
  /** 验证阶段开始时调用 */
  onValidationStart?(): void | Promise<void>;
  
  /** 验证阶段完成时调用 */
  onValidationComplete?(): void | Promise<void>;
  
  /** 执行阶段开始时调用 */
  onExecutionStart?(): void | Promise<void>;
  
  /** 执行阶段完成时调用 */
  onExecutionComplete?(): void | Promise<void>;
  
  /** 监测阶段开始时调用 */
  onMonitoringStart?(): void | Promise<void>;
  
  /** 监测阶段完成时调用 */
  onMonitoringComplete?(): void | Promise<void>;
  
  /** 清理阶段开始时调用 */
  onCleanupStart?(): void | Promise<void>;
  
  /** 清理阶段完成时调用 */
  onCleanupComplete?(): void | Promise<void>;
  
  /** 发生错误时调用 */
  onError?(error: Error, phase: LifecyclePhase): void | Promise<void>;
}

/**
 * 生命周期上下文接口
 * 
 * 在生命周期执行过程中传递和维护的上下文信息
 */
export interface LifecycleContext {
  /** 当前执行的生命周期阶段 */
  currentPhase: LifecyclePhase;
  
  /** 上一个执行的生命周期阶段 */
  previousPhase?: LifecyclePhase;
  
  /** 上下文启动时间 */
  startTime: number;
  
  /** 上下文相关的元数据 */
  metadata: Record<string, unknown>;
  
  /** 在上下文中存储的数据 */
  data: Map<string, unknown>;
  
  /** 执行的事件列表 */
  events: LifecycleEvent[];
  
  /** 执行的错误列表 */
  errors: Error[];
  
  /** 获取上下文中存储的值 */
  get(key: string): unknown;
  
  /** 在上下文中存储值 */
  set(key: string, value: unknown): void;
  
  /** 检查键是否存在 */
  has(key: string): boolean;
  
  /** 删除指定的键 */
  delete(key: string): boolean;
  
  /** 清空上下文中的所有数据 */
  clear(): void;
}

/**
 * 生命周期模块接口
 * 
 * 所有生命周期模块都应该实现此接口
 */
export interface LifecycleModule {
  /** 模块名称 */
  name: string;
  
  /** 模块版本 */
  version: string;
  
  /** 模块的生命周期阶段 */
  phase: LifecyclePhase;
  
  /** 模块是否已初始化 */
  isInitialized: boolean;
  
  /** 初始化模块 */
  initialize(context: LifecycleContext): Promise<void>;
  
  /** 执行模块 */
  execute(context: LifecycleContext): Promise<void>;
  
  /** 清理模块 */
  cleanup(context: LifecycleContext): Promise<void>;
  
  /** 获取模块状态 */
  getStatus(): ModuleStatus;
}

/**
 * 模块状态接口
 * 
 * 表示一个模块的当前运行状态
 */
export interface ModuleStatus {
  /** 模块名称 */
  name: string;
  
  /** 模块是否正在运行 */
  isRunning: boolean;
  
  /** 模块的最后执行结果 */
  lastResult: ExecutionResult | string;
  
  /** 模块的最后执行时间 */
  lastExecutionTime?: number;
  
  /** 模块的执行计数 */
  executionCount: number;
  
  /** 模块的最后错误 */
  lastError?: Error;
  
  /** 模块的相关统计数据 */
  stats: Record<string, unknown>;
}

/**
 * 模块状态返回类型（允许返回任何对象）
 */
export type ModuleStatusReturn = ModuleStatus | Record<string, unknown>;

/**
 * 生命周期配置接口
 * 
 * 用于配置生命周期引擎的运行参数
 */
export interface LifecycleConfig {
  /** 是否启用并行执行 */
  enableParallel?: boolean;
  
  /** 每个阶段的超时时间（毫秒） */
  phaseTimeout?: number;
  
  /** 是否记录详细的调试日志 */
  enableDebugLogging?: boolean;
  
  /** 错误发生时是否继续执行 */
  continueOnError?: boolean;
  
  /** 最大重试次数 */
  maxRetries?: number;
  
  /** 重试延迟时间（毫秒） */
  retryDelay?: number;
  
  /** 是否保存执行历史 */
  saveHistory?: boolean;
  
  /** 执行历史保存的最大条数 */
  maxHistorySize?: number;
}

/**
 * 生命周期统计信息接口
 * 
 * 用于存储和报告生命周期的执行统计
 */
export interface LifecycleStats {
  /** 总执行次数 */
  totalExecutions: number;
  
  /** 成功执行次数 */
  successfulExecutions: number;
  
  /** 失败执行次数 */
  failedExecutions: number;
  
  /** 总执行时长（毫秒） */
  totalDuration: number;
  
  /** 平均执行时长（毫秒） */
  averageDuration: number;
  
  /** 最短执行时长（毫秒） */
  minDuration: number;
  
  /** 最长执行时长（毫秒） */
  maxDuration: number;
  
  /** 每个阶段的统计信息 */
  phaseStats: Map<LifecyclePhase, PhaseStatistics>;
}

/**
 * 阶段统计信息接口
 * 
 * 用于存储单个生命周期阶段的执行统计
 */
export interface PhaseStatistics {
  /** 阶段名称 */
  phaseName: LifecyclePhase;
  
  /** 执行次数 */
  executionCount: number;
  
  /** 成功次数 */
  successCount: number;
  
  /** 失败次数 */
  failureCount: number;
  
  /** 总执行时长（毫秒） */
  totalDuration: number;
  
  /** 平均执行时长（毫秒） */
  averageDuration: number;
  
  /** 最后执行时间 */
  lastExecutionTime: number;
}

/**
 * 生命周期钩子选项接口
 * 
 * 用于配置React中使用生命周期钩子的选项
 */
export interface LifecycleHookOptions {
  /** 是否自动启动生命周期 */
  autoStart?: boolean;
  
  /** 启动延迟时间（毫秒） */
  startDelay?: number;
  
  /** 是否自动清理 */
  autoCleanup?: boolean;
  
  /** 在生命周期完成时的回调 */
  onComplete?: (context: LifecycleContext) => void;
  
  /** 在生命周期失败时的回调 */
  onError?: (error: Error, phase: LifecyclePhase) => void;
  
  /** 生命周期监听器 */
  listeners?: LifecycleListener[];
}

/**
 * 生命周期状态枚举
 * 
 * 表示生命周期引擎的当前状态
 */
export enum LifecycleState {
  /** 未初始化状态 */
  UNINITIALIZED = 'UNINITIALIZED',
  
  /** 准备中状态 */
  PREPARING = 'PREPARING',
  
  /** 运行中状态 */
  RUNNING = 'RUNNING',
  
  /** 暂停状态 */
  PAUSED = 'PAUSED',
  
  /** 停止状态 */
  STOPPED = 'STOPPED',
  
  /** 出错状态 */
  ERROR = 'ERROR',
}
