/**
 * 生命周期引擎核心文件
 * 
 * 这是整个生命周期系统的核心，负责：
 * - 管理生命周期的各个阶段
 * - 协调各个阶段的执行流程
 * - 处理错误和异常
 * - 收集和报告执行统计
 * - 维护生命周期上下文
 */

import {
  LifecyclePhase,
  LifecycleEvent,
  EventLevel,
  LifecycleListener,
  LifecycleObserver,
  LifecycleContext,
  LifecycleModule,
  ExecutionResult,
  LifecycleConfig,
  LifecycleStats,
  PhaseStatistics,
  LifecycleState,
} from '../types/lifecycle';

/**
 * 生命周期引擎类
 * 
 * 这是一个管理系统生命周期的核心引擎。它负责按照定义的顺序
 * 执行各个生命周期阶段，并处理错误、监听事件等功能。
 * 
 * 使用示例：
 * ```typescript
 * const engine = new LifecycleEngine();
 * await engine.initialize();
 * await engine.start();
 * ```
 */
export class LifecycleEngine {
  /** 引擎名称 */
  private name: string = '生命周期引擎';

  /** 当前引擎状态 */
  private state: LifecycleState = LifecycleState.UNINITIALIZED;

  /** 当前执行阶段 */
  private currentPhase?: LifecyclePhase;

  /** 已注册的生命周期模块 */
  private modules: Map<LifecyclePhase, LifecycleModule[]> = new Map();

  /** 已注册的生命周期监听器 */
  private listeners: Set<LifecycleListener> = new Set();

  /** 已注册的生命周期观察者 */
  private observers: Set<LifecycleObserver> = new Set();

  /** 生命周期执行事件历史 */
  private eventHistory: LifecycleEvent[] = [];

  /** 生命周期执行统计 */
  private stats: LifecycleStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalDuration: 0,
    averageDuration: 0,
    minDuration: Infinity,
    maxDuration: 0,
    phaseStats: new Map(),
  };

  /** 生命周期配置 */
  private config: Required<LifecycleConfig>;

  /** 生命周期上下文 */
  private context?: LifecycleContext;

  /** 事件计数器，用于生成唯一的事件ID */
  private eventCounter: number = 0;

  /**
   * 初始化生命周期引擎
   * 
   * @param config - 可选的生命周期配置
   */
  constructor(config?: LifecycleConfig) {
    this.config = {
      enableParallel: false,
      phaseTimeout: 30000, // 30秒
      enableDebugLogging: false,
      continueOnError: false,
      maxRetries: 3,
      retryDelay: 1000,
      saveHistory: true,
      maxHistorySize: 1000,
      ...config,
    };

    this.initializePhaseStats();
    this.logEvent({
      phase: LifecyclePhase.INITIALIZATION,
      type: 'engine_created',
      name: '生命周期引擎已创建',
      level: EventLevel.INFO,
      description: `${this.name}已初始化并准备使用`,
    });
  }

  /**
   * 初始化各阶段的统计数据
   * 
   * @private
   */
  private initializePhaseStats(): void {
    const phases = Object.values(LifecyclePhase);
    for (const phase of phases) {
      this.stats.phaseStats.set(phase, {
        phaseName: phase,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        lastExecutionTime: 0,
      });
    }
  }

  /**
   * 创建或获取生命周期上下文
   * 
   * @returns 生命周期上下文
   * @private
   */
  private getContext(): LifecycleContext {
    if (!this.context) {
      this.context = this.createContext();
    }
    return this.context;
  }

  /**
   * 创建新的生命周期上下文
   * 
   * @returns 新创建的生命周期上下文
   * @private
   */
  private createContext(): LifecycleContext {
    const dataMap = new Map<string, unknown>();
    const eventList: LifecycleEvent[] = [];
    const errorList: Error[] = [];

    return {
      currentPhase: this.currentPhase || LifecyclePhase.INITIALIZATION,
      previousPhase: undefined,
      startTime: Date.now(),
      metadata: {
        engineName: this.name,
        engineVersion: '1.0.0',
      },
      data: dataMap,
      events: eventList,
      errors: errorList,
      get: (key: string) => dataMap.get(key),
      set: (key: string, value: unknown) => dataMap.set(key, value),
      has: (key: string) => dataMap.has(key),
      delete: (key: string) => dataMap.delete(key),
      clear: () => dataMap.clear(),
    };
  }

  /**
   * 记录事件
   * 
   * @param event - 要记录的事件
   * @private
   */
  private logEvent(event: Partial<LifecycleEvent>): void {
    const fullEvent: LifecycleEvent = {
      id: `event_${++this.eventCounter}`,
      phase: event.phase || this.currentPhase || LifecyclePhase.INITIALIZATION,
      type: event.type || 'unknown',
      name: event.name || '未命名事件',
      timestamp: event.timestamp || Date.now(),
      description: event.description || '',
      level: event.level || EventLevel.INFO,
      data: event.data,
      source: event.source || this.name,
      duration: event.duration,
    };

    // 保存到历史记录
    if (this.config.saveHistory) {
      this.eventHistory.push(fullEvent);
      
      // 限制历史记录大小
      if (this.eventHistory.length > this.config.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    // 保存到上下文
    if (this.context) {
      this.context.events.push(fullEvent);
    }

    // 触发监听器
    this.notifyListeners(fullEvent);

    // 根据日志级别输出
    this.outputLog(fullEvent);
  }

  /**
   * 触发所有监听器
   * 
   * @param event - 生命周期事件
   * @private
   */
  private async notifyListeners(event: LifecycleEvent): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const listener of this.listeners) {
      const result = listener(event);
      if (result instanceof Promise) {
        promises.push(result);
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * 输出日志信息
   * 
   * @param event - 生命周期事件
   * @private
   */
  private outputLog(event: LifecycleEvent): void {
    if (this.config.enableDebugLogging || event.level !== EventLevel.DEBUG) {
      const timestamp = new Date(event.timestamp).toISOString();
      const logMessage = `[${timestamp}] [${event.level}] [${event.phase}] ${event.name}: ${event.description}`;
      
      switch (event.level) {
        case EventLevel.DEBUG:
          console.debug(logMessage, event.data);
          break;
        case EventLevel.INFO:
          console.info(logMessage, event.data);
          break;
        case EventLevel.WARN:
          console.warn(logMessage, event.data);
          break;
        case EventLevel.ERROR:
        case EventLevel.CRITICAL:
          console.error(logMessage, event.data);
          break;
      }
    }
  }

  /**
   * 注册生命周期模块
   * 
   * 在执行前需要注册所有的生命周期模块。模块会按照注册顺序执行。
   * 
   * @param phase - 模块所属的生命周期阶段
   * @param module - 要注册的模块
   * @throws 如果模块为空或不符合接口
   */
  public registerModule(phase: LifecyclePhase, module: LifecycleModule): void {
    if (!module || typeof module.initialize !== 'function') {
      throw new Error('无效的生命周期模块');
    }

    if (!this.modules.has(phase)) {
      this.modules.set(phase, []);
    }

    this.modules.get(phase)!.push(module);

    this.logEvent({
      phase,
      type: 'module_registered',
      name: `模块 "${module.name}" 已注册`,
      level: EventLevel.INFO,
      description: `模块 "${module.name}" (v${module.version}) 已注册到 ${phase} 阶段`,
      data: { moduleName: module.name, moduleVersion: module.version },
    });
  }

  /**
   * 注册事件监听器
   * 
   * 监听器会在每个事件发生时被调用，可以执行自定义的处理逻辑。
   * 
   * @param listener - 监听器函数
   */
  public addEventListener(listener: LifecycleListener): void {
    this.listeners.add(listener);
    this.logEvent({
      phase: this.currentPhase || LifecyclePhase.INITIALIZATION,
      type: 'listener_added',
      name: '事件监听器已添加',
      level: EventLevel.DEBUG,
      description: '一个新的事件监听器已被注册',
    });
  }

  /**
   * 移除事件监听器
   * 
   * @param listener - 要移除的监听器函数
   * @returns 是否成功移除
   */
  public removeEventListener(listener: LifecycleListener): boolean {
    return this.listeners.delete(listener);
  }

  /**
   * 注册生命周期观察者
   * 
   * 观察者可以监听生命周期的各个阶段的开始和完成事件。
   * 
   * @param observer - 观察者对象
   */
  public addObserver(observer: LifecycleObserver): void {
    this.observers.add(observer);
    this.logEvent({
      phase: this.currentPhase || LifecyclePhase.INITIALIZATION,
      type: 'observer_added',
      name: '生命周期观察者已添加',
      level: EventLevel.DEBUG,
      description: '一个新的生命周期观察者已被注册',
    });
  }

  /**
   * 移除生命周期观察者
   * 
   * @param observer - 要移除的观察者对象
   * @returns 是否成功移除
   */
  public removeObserver(observer: LifecycleObserver): boolean {
    return this.observers.delete(observer);
  }

  /**
   * 初始化引擎
   * 
   * 初始化生命周期引擎，准备执行第一个阶段。
   */
  public async initialize(): Promise<void> {
    if (this.state !== LifecycleState.UNINITIALIZED) {
      throw new Error('引擎已初始化，无法重复初始化');
    }

    try {
      this.state = LifecycleState.PREPARING;
      this.context = this.createContext();

      this.logEvent({
        phase: LifecyclePhase.INITIALIZATION,
        type: 'initialization_start',
        name: '生命周期引擎初始化开始',
        level: EventLevel.INFO,
        description: '生命周期引擎正在初始化',
      });

      // 通知观察者初始化开始
      await this.notifyObservers('onInitializationStart');

      // 执行所有注册的模块
      await this.executePhaseModules(LifecyclePhase.INITIALIZATION);

      // 通知观察者初始化完成
      await this.notifyObservers('onInitializationComplete');

      this.state = LifecycleState.STOPPED;

      this.logEvent({
        phase: LifecyclePhase.INITIALIZATION,
        type: 'initialization_complete',
        name: '生命周期引擎初始化完成',
        level: EventLevel.INFO,
        description: '生命周期引擎已初始化完成，准备启动',
      });
    } catch (error) {
      this.state = LifecycleState.ERROR;
      this.handlePhaseError(error, LifecyclePhase.INITIALIZATION);
      throw error;
    }
  }

  /**
   * 启动生命周期引擎
   * 
   * 按照定义的顺序执行所有生命周期阶段：
   * 1. 初始化
   * 2. 准备
   * 3. 验证
   * 4. 执行
   * 5. 监测
   * 6. 清理
   */
  public async start(): Promise<void> {
    if (this.state === LifecycleState.UNINITIALIZED) {
      await this.initialize();
    }

    if (this.state !== LifecycleState.STOPPED && this.state !== LifecycleState.PAUSED) {
      throw new Error('引擎状态不正确，无法启动');
    }

    try {
      this.state = LifecycleState.RUNNING;

      this.logEvent({
        phase: LifecyclePhase.INITIALIZATION,
        type: 'lifecycle_start',
        name: '完整生命周期执行开始',
        level: EventLevel.INFO,
        description: '生命周期引擎开始执行完整的生命周期流程',
      });

      const startTime = Date.now();

      // 按顺序执行各个阶段
      const phases = [
        LifecyclePhase.PREPARATION,
        LifecyclePhase.VALIDATION,
        LifecyclePhase.EXECUTION,
        LifecyclePhase.MONITORING,
        LifecyclePhase.CLEANUP,
      ];

      for (const phase of phases) {
        await this.executePhase(phase);
      }

      const duration = Date.now() - startTime;
      this.stats.totalExecutions++;
      this.stats.successfulExecutions++;
      this.stats.totalDuration += duration;
      this.stats.averageDuration = this.stats.totalDuration / this.stats.totalExecutions;
      this.stats.minDuration = Math.min(this.stats.minDuration, duration);
      this.stats.maxDuration = Math.max(this.stats.maxDuration, duration);

      this.state = LifecycleState.STOPPED;

      this.logEvent({
        phase: LifecyclePhase.CLEANUP,
        type: 'lifecycle_complete',
        name: '完整生命周期执行完成',
        level: EventLevel.INFO,
        description: `生命周期引擎已完成所有阶段，总耗时 ${duration}ms`,
        duration,
      });
    } catch (error) {
      this.state = LifecycleState.ERROR;
      this.stats.totalExecutions++;
      this.stats.failedExecutions++;
      this.handleLifecycleError(error);
      throw error;
    }
  }

  /**
   * 执行单个生命周期阶段
   * 
   * @param phase - 要执行的生命周期阶段
   * @private
   */
  private async executePhase(phase: LifecyclePhase): Promise<void> {
    this.currentPhase = phase;
    const context = this.getContext();
    context.previousPhase = context.currentPhase;
    context.currentPhase = phase;

    const startTime = Date.now();
    let result = ExecutionResult.SUCCESS;

    try {
      // 通知观察者阶段开始
      const onStartMethod = `on${this.getPhaseMethodName(phase)}Start`;
      if (onStartMethod in this.observers.values()) {
        await this.notifyObserversByMethod(onStartMethod);
      }

      this.logEvent({
        phase,
        type: 'phase_start',
        name: `${phase} 阶段开始`,
        level: EventLevel.INFO,
        description: `生命周期的 ${phase} 阶段正在执行`,
      });

      // 执行该阶段的所有模块
      await this.executePhaseModules(phase);

      // 通知观察者阶段完成
      const onCompleteMethod = `on${this.getPhaseMethodName(phase)}Complete`;
      if (onCompleteMethod in this.observers.values()) {
        await this.notifyObserversByMethod(onCompleteMethod);
      }

      this.logEvent({
        phase,
        type: 'phase_complete',
        name: `${phase} 阶段完成`,
        level: EventLevel.INFO,
        description: `生命周期的 ${phase} 阶段已成功完成`,
      });
    } catch (error) {
      result = ExecutionResult.FAILURE;
      this.handlePhaseError(error, phase);

      if (!this.config.continueOnError) {
        throw error;
      }
    } finally {
      // 更新统计信息
      const duration = Date.now() - startTime;
      const phaseStats = this.stats.phaseStats.get(phase)!;
      phaseStats.executionCount++;
      phaseStats.totalDuration += duration;
      phaseStats.averageDuration = phaseStats.totalDuration / phaseStats.executionCount;
      phaseStats.lastExecutionTime = Date.now();

      if (result === ExecutionResult.SUCCESS) {
        phaseStats.successCount++;
      } else {
        phaseStats.failureCount++;
      }
    }
  }

  /**
   * 执行特定阶段的所有模块
   * 
   * @param phase - 生命周期阶段
   * @private
   */
  private async executePhaseModules(phase: LifecyclePhase): Promise<void> {
    const modules = this.modules.get(phase) || [];
    const context = this.getContext();

    // eslint-disable-next-line @next/next/no-assign-module-variable
    for (const module of modules) {
      await this.executeModule(module, context);
    }
  }

  /**
   * 执行单个模块
   * 
   * @param module - 要执行的模块
   * @param context - 生命周期上下文
   * @private
   */
  private async executeModule(module: LifecycleModule, context: LifecycleContext): Promise<void> {
    const phase = module.phase;
    let retries = 0;

    while (retries <= this.config.maxRetries) {
      try {
        const startTime = Date.now();

        this.logEvent({
          phase,
          type: 'module_execute_start',
          name: `模块 "${module.name}" 执行开始`,
          level: EventLevel.DEBUG,
          description: `模块 "${module.name}" (v${module.version}) 开始执行`,
        });

        // 执行超时控制
        const executePromise = module.execute(context);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`模块 "${module.name}" 执行超时`)), this.config.phaseTimeout)
        );

        await Promise.race([executePromise, timeoutPromise]);

        const duration = Date.now() - startTime;

        this.logEvent({
          phase,
          type: 'module_execute_complete',
          name: `模块 "${module.name}" 执行完成`,
          level: EventLevel.DEBUG,
          description: `模块 "${module.name}" 已成功执行，耗时 ${duration}ms`,
          duration,
        });

        break; // 成功执行，退出重试循环
      } catch (error) {
        retries++;

        if (retries > this.config.maxRetries) {
          this.logEvent({
            phase,
            type: 'module_execute_failed',
            name: `模块 "${module.name}" 执行失败`,
            level: EventLevel.ERROR,
            description: `模块 "${module.name}" 在重试 ${this.config.maxRetries} 次后仍然失败`,
            data: { error: String(error), retries },
          });
          throw error;
        } else {
          this.logEvent({
            phase,
            type: 'module_execute_retry',
            name: `模块 "${module.name}" 执行失败，准备重试`,
            level: EventLevel.WARN,
            description: `模块 "${module.name}" 执行失败，${this.config.retryDelay}ms 后进行第 ${retries} 次重试`,
            data: { error: String(error), retries, nextRetryIn: this.config.retryDelay },
          });

          // 等待重试延迟
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }
  }

  /**
   * 处理阶段错误
   * 
   * @param error - 错误对象
   * @param phase - 发生错误的阶段
   * @private
   */
  private handlePhaseError(error: unknown, phase: LifecyclePhase): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    if (this.context) {
      this.context.errors.push(errorObj);
    }

    this.logEvent({
      phase,
      type: 'phase_error',
      name: `${phase} 阶段发生错误`,
      level: EventLevel.ERROR,
      description: `生命周期的 ${phase} 阶段发生错误: ${errorObj.message}`,
      data: { error: errorObj.message, stack: errorObj.stack },
    });

    // 通知观察者错误
    this.notifyObserversError(errorObj, phase);
  }

  /**
   * 处理生命周期错误
   * 
   * @param error - 错误对象
   * @private
   */
  private handleLifecycleError(error: unknown): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    this.logEvent({
      phase: this.currentPhase || LifecyclePhase.INITIALIZATION,
      type: 'lifecycle_error',
      name: '生命周期执行过程中发生错误',
      level: EventLevel.CRITICAL,
      description: `生命周期执行失败: ${errorObj.message}`,
      data: { error: errorObj.message, stack: errorObj.stack },
    });
  }

  /**
   * 通知观察者特定方法
   * 
   * @param methodName - 观察者方法名称
   * @private
   */
  private async notifyObserversByMethod(methodName: string): Promise<void> {
    const promises: Promise<void>[] = [];

    // eslint-disable-next-line @next/next/no-assign-module-variable
    for (const observer of this.observers) {
      const method = (observer as Record<string, unknown>)[methodName];
      if (typeof method === 'function') {
        const result = (method as () => void | Promise<void>).call(observer);
        if (result instanceof Promise) {
          promises.push(result);
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * 通知观察者错误
   * 
   * @param error - 错误对象
   * @param phase - 发生错误的阶段
   * @private
   */
  private async notifyObserversError(error: Error, phase: LifecyclePhase): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const observer of this.observers) {
      if (typeof observer.onError === 'function') {
        const result = observer.onError(error, phase);
        if (result instanceof Promise) {
          promises.push(result);
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * 通知所有观察者
   * 
   * @param methodName - 方法名称
   * @private
   */
  private async notifyObservers(methodName: string): Promise<void> {
    await this.notifyObserversByMethod(methodName);
  }

  /**
   * 根据阶段获取方法名称
   * 
   * @param phase - 生命周期阶段
   * @returns 对应的方法名称
   * @private
   */
  private getPhaseMethodName(phase: LifecyclePhase): string {
    const phaseNames: Record<LifecyclePhase, string> = {
      [LifecyclePhase.INITIALIZATION]: 'Initialization',
      [LifecyclePhase.PREPARATION]: 'Preparation',
      [LifecyclePhase.VALIDATION]: 'Validation',
      [LifecyclePhase.EXECUTION]: 'Execution',
      [LifecyclePhase.MONITORING]: 'Monitoring',
      [LifecyclePhase.CLEANUP]: 'Cleanup',
    };
    return phaseNames[phase];
  }

  /**
   * 获取引擎当前状态
   * 
   * @returns 引擎状态
   */
  public getState(): LifecycleState {
    return this.state;
  }

  /**
   * 获取当前执行的生命周期阶段
   * 
   * @returns 当前阶段
   */
  public getCurrentPhase(): LifecyclePhase | undefined {
    return this.currentPhase;
  }

  /**
   * 获取执行统计信息
   * 
   * @returns 统计信息
   */
  public getStats(): LifecycleStats {
    return { ...this.stats };
  }

  /**
   * 获取事件历史
   * 
   * @param limit - 要返回的最大事件数
   * @returns 事件列表
   */
  public getEventHistory(limit?: number): LifecycleEvent[] {
    if (limit === undefined) {
      return [...this.eventHistory];
    }
    return this.eventHistory.slice(-limit);
  }

  /**
   * 暂停生命周期执行
   */
  public pause(): void {
    if (this.state === LifecycleState.RUNNING) {
      this.state = LifecycleState.PAUSED;
      this.logEvent({
        phase: this.currentPhase || LifecyclePhase.INITIALIZATION,
        type: 'lifecycle_paused',
        name: '生命周期执行已暂停',
        level: EventLevel.INFO,
        description: '生命周期引擎已暂停执行',
      });
    }
  }

  /**
   * 继续生命周期执行
   */
  public resume(): void {
    if (this.state === LifecycleState.PAUSED) {
      this.state = LifecycleState.RUNNING;
      this.logEvent({
        phase: this.currentPhase || LifecyclePhase.INITIALIZATION,
        type: 'lifecycle_resumed',
        name: '生命周期执行已继续',
        level: EventLevel.INFO,
        description: '生命周期引擎已继续执行',
      });
    }
  }

  /**
   * 停止生命周期执行
   */
  public stop(): void {
    if (this.state !== LifecycleState.STOPPED) {
      this.state = LifecycleState.STOPPED;
      this.logEvent({
        phase: this.currentPhase || LifecyclePhase.INITIALIZATION,
        type: 'lifecycle_stopped',
        name: '生命周期执行已停止',
        level: EventLevel.INFO,
        description: '生命周期引擎已停止',
      });
    }
  }
}
