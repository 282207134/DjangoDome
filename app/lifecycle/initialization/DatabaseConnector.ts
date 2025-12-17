/**
 * 数据库连接器模块
 * 
 * 负责在系统初始化时建立数据库连接，包括：
 * - 创建数据库连接
 * - 执行数据库迁移
 * - 验证连接状态
 * - 管理连接池
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LifecyclePhase, LifecycleModule, LifecycleContext, ExecutionResult } from '../types/lifecycle';

/**
 * 数据库连接信息接口
 */
export interface DatabaseConnection {
  /** 连接ID */
  id: string;

  /** 数据库主机 */
  host: string;

  /** 数据库端口 */
  port: number;

  /** 数据库名称 */
  database: string;

  /** 连接状态 */
  isConnected: boolean;

  /** 连接建立时间 */
  connectedAt?: number;

  /** 最后查询时间 */
  lastQueryTime?: number;
}

/**
 * 数据库池信息接口
 */
export interface DatabasePoolInfo {
  /** 池大小 */
  poolSize: number;

  /** 活跃连接数 */
  activeConnections: number;

  /** 空闲连接数 */
  idleConnections: number;

  /** 等待队列长度 */
  waitingQueueLength: number;

  /** 创建的总连接数 */
  totalConnectionsCreated: number;

  /** 错误连接数 */
  failedConnections: number;
}

/**
 * 数据库连接器类
 * 
 * 这个模块负责在系统初始化阶段建立和管理数据库连接。
 * 支持连接池管理、自动重连、连接验证等功能。
 * 
 * 使用示例：
 * ```typescript
 * const connector = new DatabaseConnector();
 * await connector.execute(context);
 * await connector.query('SELECT * FROM users');
 * ```
 */
export class DatabaseConnector implements LifecycleModule {
  /** 模块名称 */
  public readonly name: string = '数据库连接器';

  /** 模块版本 */
  public readonly version: string = '1.0.0';

  /** 模块所属的生命周期阶段 */
  public readonly phase: LifecyclePhase = LifecyclePhase.INITIALIZATION;

  /** 模块是否已初始化 */
  public isInitialized: boolean = false;

  /** 数据库连接 */
  private connection?: DatabaseConnection;

  /** 连接池信息 */
  private poolInfo: DatabasePoolInfo = {
    poolSize: 10,
    activeConnections: 0,
    idleConnections: 10,
    waitingQueueLength: 0,
    totalConnectionsCreated: 1,
    failedConnections: 0,
  };

  /** 连接重试次数 */
  private maxRetries: number = 3;

  /** 重试延迟（毫秒） */
  private retryDelay: number = 1000;

  /** 查询执行历史 */
  private queryHistory: Array<{ query: string; duration: number; timestamp: number }> = [];

  /**
   * 初始化数据库连接器
   * 
   * @param _context - 生命周期上下文
   */
  public async initialize(_context: LifecycleContext): Promise<void> {
    try {
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`数据库连接器初始化失败: ${error}`);
    }
  }

  /**
   * 执行数据库连接
   * 
   * 这个方法会：
   * 1. 建立数据库连接
   * 2. 验证连接状态
   * 3. 初始化连接池
   * 4. 执行迁移脚本
   * 
   * @param context - 生命周期上下文
   */
  public async execute(context: LifecycleContext): Promise<void> {
    try {
      // 从配置中获取数据库信息
      const dbConfig = (context.get('应用程序配置') as unknown & { database?: unknown })?.database;

      if (!dbConfig) {
        throw new Error('无法获取数据库配置');
      }

      // 步骤1：建立连接
      await this.establishConnection(dbConfig);

      // 步骤2：验证连接
      await this.verifyConnection();

      // 步骤3：初始化连接池
      this.initializeConnectionPool(dbConfig.poolSize);

      // 步骤4：执行迁移（如果需要）
      await this.runMigrations();

      // 保存到上下文
      context.set('数据库连接', this.connection);
      context.set('数据库池信息', this.poolInfo);
    } catch (error) {
      throw new Error(`数据库连接执行失败: ${error}`);
    }
  }

  /**
   * 清理资源
   * 
   * @param _context - 生命周期上下文
   */
  public async cleanup(_context: LifecycleContext): Promise<void> {
    await this.closeConnection();
    this.isInitialized = false;
  }

  /**
   * 建立数据库连接
   * 
   * 支持自动重试
   * 
   * @param config - 数据库配置
   * @private
   */
  private async establishConnection(config: any): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // 模拟连接建立过程
        await new Promise(resolve => setTimeout(resolve, 100));

        this.connection = {
          id: `db_${Date.now()}`,
          host: config.host,
          port: config.port,
          database: config.database,
          isConnected: true,
          connectedAt: Date.now(),
        };

        return; // 连接成功，退出
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw new Error(`无法建立数据库连接（重试${this.maxRetries}次后失败）: ${lastError?.message}`);
  }

  /**
   * 验证数据库连接
   * 
   * @private
   */
  private async verifyConnection(): Promise<void> {
    if (!this.connection?.isConnected) {
      throw new Error('数据库连接未建立');
    }

    try {
      // 执行测试查询
      await this.query('SELECT 1 as test');
      this.connection.lastQueryTime = Date.now();
    } catch (error) {
      throw new Error(`数据库连接验证失败: ${error}`);
    }
  }

  /**
   * 初始化连接池
   * 
   * @param poolSize - 连接池大小
   * @private
   */
  private initializeConnectionPool(poolSize: number): void {
    this.poolInfo.poolSize = poolSize;
    this.poolInfo.idleConnections = poolSize;
    this.poolInfo.activeConnections = 0;
  }

  /**
   * 执行数据库迁移
   * 
   * @private
   */
  private async runMigrations(): Promise<void> {
    // 这里应该执行实际的迁移脚本
    // 目前只是模拟
    const migrations = [
      '初始化用户表',
      '初始化项目表',
      '初始化任务表',
      '创建索引',
    ];

    for (const migration of migrations) {
      try {
        // 模拟迁移执行
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        // 迁移失败不应该中止连接
        console.warn(`迁移 "${migration}" 失败: ${error}`);
      }
    }
  }

  /**
   * 执行数据库查询
   * 
   * @param sql - SQL查询语句
   * @param _params - 查询参数
   * @returns 查询结果
   */
  public async query(sql: string, _params?: unknown[]): Promise<unknown> {
    if (!this.connection?.isConnected) {
      throw new Error('数据库连接不可用');
    }

    const startTime = Date.now();

    try {
      // 减少活跃连接，增加使用的连接
      this.poolInfo.idleConnections--;
      this.poolInfo.activeConnections++;

      // 模拟查询执行
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

      const duration = Date.now() - startTime;
      this.connection.lastQueryTime = Date.now();

      // 记录到历史
      this.queryHistory.push({
        query: sql,
        duration,
        timestamp: Date.now(),
      });

      return { success: true, rows: [] };
    } finally {
      // 恢复连接池状态
      this.poolInfo.idleConnections++;
      this.poolInfo.activeConnections--;
    }
  }

  /**
   * 执行事务
   * 
   * @param callback - 事务回调函数
   */
  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      // 开启事务
      await this.query('BEGIN');

      // 执行回调
      const result = await callback();

      // 提交事务
      await this.query('COMMIT');

      return result;
    } catch (error) {
      // 回滚事务
      await this.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  public async closeConnection(): Promise<void> {
    if (this.connection?.isConnected) {
      this.connection.isConnected = false;
      this.connection = undefined;
    }
  }

  /**
   * 获取连接状态
   * 
   * @returns 是否已连接
   */
  public isConnected(): boolean {
    return this.connection?.isConnected ?? false;
  }

  /**
   * 获取连接信息
   * 
   * @returns 数据库连接信息
   */
  public getConnectionInfo(): DatabaseConnection | undefined {
    return this.connection;
  }

  /**
   * 获取连接池信息
   * 
   * @returns 连接池信息
   */
  public getPoolInfo(): DatabasePoolInfo {
    return { ...this.poolInfo };
  }

  /**
   * 获取查询历史
   * 
   * @param limit - 返回的最大记录数
   * @returns 查询历史
   */
  public getQueryHistory(limit: number = 10) {
    return this.queryHistory.slice(-limit);
  }

  /**
   * 获取数据库统计信息
   * 
   * @returns 统计信息
   */
  public getStatistics() {
    const history = this.queryHistory;
    const totalQueries = history.length;
    const avgDuration = totalQueries > 0
      ? history.reduce((sum, h) => sum + h.duration, 0) / totalQueries
      : 0;

    const maxDuration = totalQueries > 0
      ? Math.max(...history.map(h => h.duration))
      : 0;

    const minDuration = totalQueries > 0
      ? Math.min(...history.map(h => h.duration))
      : 0;

    return {
      totalQueries,
      avgDuration,
      maxDuration,
      minDuration,
      failedConnections: this.poolInfo.failedConnections,
    };
  }

  /**
   * 获取模块状态
   * 
   * @returns 模块状态
   */
  public getStatus() {
    return {
      name: this.name,
      isRunning: this.connection?.isConnected ?? false,
      lastResult: ExecutionResult.SUCCESS,
      executionCount: 1,
      stats: {
        isConnected: this.connection?.isConnected ?? false,
        host: this.connection?.host,
        database: this.connection?.database,
        poolSize: this.poolInfo.poolSize,
        activeConnections: this.poolInfo.activeConnections,
      },
    };
  }
}
