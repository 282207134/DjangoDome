/**
 * 缓存初始化器模块
 * 
 * 负责在系统初始化时初始化缓存系统，包括：
 * - 建立缓存连接
 * - 预加载热点数据
 * - 配置缓存策略
 * - 设置过期时间
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LifecyclePhase, LifecycleModule, LifecycleContext, ExecutionResult } from '../types/lifecycle';

/**
 * 缓存统计信息接口
 */
export interface CacheStatistics {
  /** 缓存命中次数 */
  hits: number;

  /** 缓存未命中次数 */
  misses: number;

  /** 缓存中的项目数 */
  itemCount: number;

  /** 缓存大小（字节） */
  size: number;

  /** 最后更新时间 */
  lastUpdateTime: number;

  /** 命中率 */
  hitRate: number;
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存键 */
  key: string;

  /** 缓存值 */
  value: T;

  /** 创建时间 */
  createdAt: number;

  /** 过期时间 */
  expiresAt: number;

  /** 访问计数 */
  accessCount: number;

  /** 最后访问时间 */
  lastAccessTime: number;
}

/**
 * 缓存初始化器类
 * 
 * 这个模块负责在系统初始化阶段初始化缓存系统。
 * 支持内存缓存、Redis缓存等多种缓存类型。
 * 
 * 使用示例：
 * ```typescript
 * const initializer = new CacheInitializer();
 * await initializer.execute(context);
 * initializer.set('key', 'value', 3600);
 * const value = initializer.get('key');
 * ```
 */
export class CacheInitializer implements LifecycleModule {
  /** 模块名称 */
  public readonly name: string = '缓存初始化器';

  /** 模块版本 */
  public readonly version: string = '1.0.0';

  /** 模块所属的生命周期阶段 */
  public readonly phase: LifecyclePhase = LifecyclePhase.INITIALIZATION;

  /** 模块是否已初始化 */
  public isInitialized: boolean = false;

  /** 缓存存储 */
  private cache: Map<string, CacheItem> = new Map();

  /** 缓存统计信息 */
  private stats: CacheStatistics = {
    hits: 0,
    misses: 0,
    itemCount: 0,
    size: 0,
    lastUpdateTime: Date.now(),
    hitRate: 0,
  };

  /** 缓存类型 */
  private cacheType: 'memory' | 'redis' | 'memcached' = 'memory';

  /** 默认过期时间（秒） */
  private defaultExpiration: number = 3600;

  /** 最大缓存项数 */
  private maxCacheSize: number = 10000;

  /** 是否启用缓存 */
  private enabled: boolean = true;

  /** 清理任务ID */
  private cleanupTaskId?: NodeJS.Timeout;

  /**
   * 初始化缓存初始化器
   * 
   * @param context - 生命周期上下文
   */
  public async initialize(context: LifecycleContext): Promise<void> {
    try {
      context.set('缓存初始化器初始化', Date.now());
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`缓存初始化器初始化失败: ${error}`);
    }
  }

  /**
   * 执行缓存初始化
   * 
   * @param context - 生命周期上下文
   */
  public async execute(context: LifecycleContext): Promise<void> {
    try {
      // 获取缓存配置
      const cacheConfig = context.get('应用程序配置')?.cache;

      if (!cacheConfig) {
        throw new Error('无法获取缓存配置');
      }

      // 设置缓存参数
      this.enabled = cacheConfig.enabled;
      this.cacheType = cacheConfig.type || 'memory';
      this.defaultExpiration = cacheConfig.defaultExpiration || 3600;

      if (!this.enabled) {
        return;
      }

      // 初始化缓存连接
      await this.initializeCache();

      // 启动清理任务
      this.startCleanupTask();

      // 预加载热点数据
      await this.preloadHotData();

      // 保存到上下文
      context.set('缓存初始化器', this);
      context.set('缓存统计', this.stats);
    } catch (error) {
      throw new Error(`缓存初始化执行失败: ${error}`);
    }
  }

  /**
   * 清理资源
   * 
   * @param context - 生命周期上下文
   */
  public async cleanup(context: LifecycleContext): Promise<void> {
    this.stopCleanupTask();
    this.cache.clear();
    this.isInitialized = false;
  }

  /**
   * 初始化缓存
   * 
   * @private
   */
  private async initializeCache(): Promise<void> {
    switch (this.cacheType) {
      case 'memory':
        // 内存缓存无需特殊初始化
        this.cache.clear();
        break;

      case 'redis':
        // 模拟Redis连接
        await new Promise(resolve => setTimeout(resolve, 100));
        break;

      case 'memcached':
        // 模拟Memcached连接
        await new Promise(resolve => setTimeout(resolve, 100));
        break;

      default:
        throw new Error(`不支持的缓存类型: ${this.cacheType}`);
    }
  }

  /**
   * 启动清理任务
   * 
   * 定期清理过期的缓存项
   * 
   * @private
   */
  private startCleanupTask(): void {
    // 每分钟执行一次清理任务
    this.cleanupTaskId = setInterval(() => {
      this.removeExpiredItems();
    }, 60000);
  }

  /**
   * 停止清理任务
   * 
   * @private
   */
  private stopCleanupTask(): void {
    if (this.cleanupTaskId) {
      clearInterval(this.cleanupTaskId);
      this.cleanupTaskId = undefined;
    }
  }

  /**
   * 预加载热点数据
   * 
   * @private
   */
  private async preloadHotData(): Promise<void> {
    // 预加载一些常用的数据
    const hotDataKeys = [
      'system:config',
      'system:version',
      'system:status',
    ];

    for (const key of hotDataKeys) {
      this.set(key, { loaded: true, timestamp: Date.now() }, this.defaultExpiration);
    }
  }

  /**
   * 从缓存获取值
   * 
   * @param key - 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 undefined
   */
  public get<T = any>(key: string): T | undefined {
    if (!this.enabled) {
      return undefined;
    }

    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // 检查是否过期
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccessTime = Date.now();

    this.stats.hits++;
    this.updateHitRate();

    return item.value as T;
  }

  /**
   * 设置缓存值
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param expirationSeconds - 过期时间（秒）
   */
  public set<T = any>(key: string, value: T, expirationSeconds?: number): void {
    if (!this.enabled) {
      return;
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.maxCacheSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiration = expirationSeconds !== undefined ? expirationSeconds : this.defaultExpiration;
    const expiresAt = Date.now() + (expiration * 1000);

    const item: CacheItem = {
      key,
      value,
      createdAt: Date.now(),
      expiresAt,
      accessCount: 0,
      lastAccessTime: Date.now(),
    };

    this.cache.set(key, item);
    this.stats.itemCount = this.cache.size;
    this.stats.lastUpdateTime = Date.now();
  }

  /**
   * 删除缓存项
   * 
   * @param key - 缓存键
   * @returns 是否删除成功
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.itemCount = this.cache.size;
      this.stats.lastUpdateTime = Date.now();
    }
    return deleted;
  }

  /**
   * 清空所有缓存
   */
  public clear(): void {
    this.cache.clear();
    this.stats.itemCount = 0;
    this.stats.lastUpdateTime = Date.now();
  }

  /**
   * 检查缓存键是否存在
   * 
   * @param key - 缓存键
   * @returns 是否存在且未过期
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // 检查是否过期
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存中的所有键
   * 
   * @returns 缓存键数组
   */
  public getKeys(): string[] {
    const now = Date.now();
    const keys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt > now) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * 删除过期项
   * 
   * @returns 删除的项数
   * @private
   */
  private removeExpiredItems(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.stats.itemCount = this.cache.size;
      this.stats.lastUpdateTime = Date.now();
    }

    return removedCount;
  }

  /**
   * 驱逐LRU（最近最少使用）项
   * 
   * @private
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruTime = Date.now();

    // 找到最久未使用的项
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessTime < lruTime) {
        lruTime = item.lastAccessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.itemCount = this.cache.size;
      this.stats.lastUpdateTime = Date.now();
    }
  }

  /**
   * 更新命中率
   * 
   * @private
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 获取缓存统计信息
   * 
   * @returns 缓存统计
   */
  public getStatistics(): CacheStatistics {
    return { ...this.stats };
  }

  /**
   * 获取缓存项详情
   * 
   * @param key - 缓存键
   * @returns 缓存项详情
   */
  public getItemInfo(key: string): CacheItem | undefined {
    return this.cache.get(key);
  }

  /**
   * 获取所有缓存项信息
   * 
   * @returns 缓存项数组
   */
  public getAllItems(): CacheItem[] {
    return Array.from(this.cache.values());
  }

  /**
   * 获取缓存状态
   */
  public getStatus() {
    return {
      name: this.name,
      isRunning: this.enabled,
      lastResult: ExecutionResult.SUCCESS,
      executionCount: 1,
      stats: {
        enabled: this.enabled,
        type: this.cacheType,
        itemCount: this.stats.itemCount,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: this.stats.hitRate,
      },
    };
  }
}
