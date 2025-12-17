/**
 * 基础使用示例
 * 
 * 这个文件展示了如何使用生命周期引擎和各个模块。
 * 该示例包含了完整的初始化、执行和清理过程。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LifecycleEngine } from '../core/LifecycleEngine';
import { LifecyclePhase, EventLevel } from '../types/lifecycle';
import { EnvironmentDetector } from '../initialization/EnvironmentDetector';
import { ConfigLoader } from '../initialization/ConfigLoader';
import { DatabaseConnector } from '../initialization/DatabaseConnector';
import { CacheInitializer } from '../initialization/CacheInitializer';

/**
 * 初始化生命周期引擎的示例函数
 * 
 * 这个函数演示了：
 * 1. 创建引擎实例
 * 2. 注册各个模块
 * 3. 添加事件监听
 * 4. 启动生命周期
 */
export async function basicUsageExample(): Promise<void> {
  console.log('=== 生命周期引擎基础使用示例 ===\n');

  // 步骤1: 创建生命周期引擎
  console.log('步骤1: 创建生命周期引擎');
  const engine = new LifecycleEngine({
    enableDebugLogging: true,
    phaseTimeout: 30000,
    continueOnError: false,
    maxRetries: 3,
  });
  console.log('✓ 引擎创建成功\n');

  // 步骤2: 注册初始化阶段的模块
  console.log('步骤2: 注册初始化阶段的模块');
  engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());
  engine.registerModule(LifecyclePhase.INITIALIZATION, new ConfigLoader());
  engine.registerModule(LifecyclePhase.INITIALIZATION, new DatabaseConnector());
  engine.registerModule(LifecyclePhase.INITIALIZATION, new CacheInitializer());
  console.log('✓ 所有模块注册成功\n');

  // 步骤3: 添加事件监听
  console.log('步骤3: 添加事件监听器');
  engine.addEventListener((event) => {
    // 只记录重要的事件
    if (event.level === EventLevel.INFO || event.level === EventLevel.ERROR) {
      console.log(`📢 事件: ${event.name} (${event.phase})`);
    }
  });
  console.log('✓ 事件监听器添加成功\n');

  // 步骤4: 启动生命周期
  console.log('步骤4: 启动生命周期引擎\n');
  try {
    await engine.initialize();
    console.log('\n初始化阶段完成！\n');

    // 获取统计信息
    const stats = engine.getStats();
    console.log('生命周期统计信息:');
    console.log(`  总执行次数: ${stats.totalExecutions}`);
    console.log(`  成功执行: ${stats.successfulExecutions}`);
    console.log(`  失败执行: ${stats.failedExecutions}`);
    console.log(`  总耗时: ${stats.totalDuration}ms`);
    console.log(`  平均耗时: ${stats.averageDuration.toFixed(2)}ms\n`);

    // 获取事件历史
    const events = engine.getEventHistory(5);
    console.log('最近事件:');
    events.forEach((event) => {
      console.log(`  - [${event.level}] ${event.name}`);
    });
  } catch (error) {
    console.error('生命周期执行失败:', error);
  }
}

/**
 * 高级使用示例
 * 
 * 演示如何：
 * - 创建自定义模块
 * - 使用生命周期观察者
 * - 访问上下文数据
 */
export async function advancedUsageExample(): Promise<void> {
  console.log('\n=== 生命周期引擎高级使用示例 ===\n');

  const engine = new LifecycleEngine({
    enableDebugLogging: true,
  });

  // 创建自定义观察者
  const observer = {
    async onInitializationStart() {
      console.log('👀 观察者: 初始化开始了');
    },
    async onInitializationComplete() {
      console.log('👀 观察者: 初始化完成了');
    },
    async onError(error: Error, phase: any) {
      console.error(`👀 观察者: ${phase}阶段发生错误:`, error.message);
    },
  };

  // 注册观察者
  engine.addObserver(observer);

  // 注册模块
  const configLoader = new ConfigLoader();
  engine.registerModule(LifecyclePhase.INITIALIZATION, configLoader);

  try {
    // 初始化并执行
    await engine.initialize();

    // 访问配置
    const config = configLoader.getConfig();
    console.log('\n从ConfigLoader获取的配置:');
    console.log(`  应用名称: ${config.appName}`);
    console.log(`  环境: ${config.environment}`);
    console.log(`  API URL: ${config.api.baseUrl}`);
    console.log(`  数据库: ${config.database.host}:${config.database.port}/${config.database.database}`);
  } catch (error) {
    console.error('执行失败:', error);
  }
}

/**
 * 缓存使用示例
 * 
 * 演示如何使用缓存系统
 */
export async function cacheUsageExample(): Promise<void> {
  console.log('\n=== 缓存系统使用示例 ===\n');

  const cacheInitializer = new CacheInitializer();
  const context = {
    currentPhase: LifecyclePhase.INITIALIZATION,
    startTime: Date.now(),
    metadata: {},
    data: new Map(),
    events: [],
    errors: [],
    get: (key: string) => new Map().get(key),
    set: (key: string, value: any) => {},
    has: (key: string) => false,
    delete: (key: string) => false,
    clear: () => {},
  };

  // 手动设置缓存配置
  context.set = (key: string, value: any) => {
    if (key === '应用程序配置') {
      // 模拟配置
      (value as any).cache = {
        enabled: true,
        type: 'memory',
        host: 'localhost',
        port: 6379,
        defaultExpiration: 3600,
      };
    }
  };

  await cacheInitializer.initialize(context);
  await cacheInitializer.execute(context);

  // 使用缓存
  console.log('写入缓存项...');
  cacheInitializer.set('user:123', { id: 123, name: '张三', email: 'zhangsan@example.com' }, 3600);
  cacheInitializer.set('user:456', { id: 456, name: '李四', email: 'lisi@example.com' }, 3600);
  cacheInitializer.set('config:app', { version: '1.0.0', debug: false }, 86400);

  console.log('✓ 已写入3个缓存项\n');

  // 读取缓存
  console.log('读取缓存项...');
  const user123 = cacheInitializer.get('user:123');
  console.log('user:123:', user123);

  const appConfig = cacheInitializer.get('config:app');
  console.log('config:app:', appConfig);

  // 获取缓存统计
  console.log('\n缓存统计信息:');
  const stats = cacheInitializer.getStatistics();
  console.log(`  命中: ${stats.hits}`);
  console.log(`  未命中: ${stats.misses}`);
  console.log(`  项目数: ${stats.itemCount}`);
  console.log(`  命中率: ${(stats.hitRate * 100).toFixed(2)}%`);

  // 获取所有缓存键
  console.log('\n缓存中的所有键:');
  const keys = cacheInitializer.getKeys();
  keys.forEach((key) => console.log(`  - ${key}`));

  // 清理
  await cacheInitializer.cleanup(context);
}

/**
 * 数据库连接示例
 * 
 * 演示如何使用数据库连接器
 */
export async function databaseUsageExample(): Promise<void> {
  console.log('\n=== 数据库连接示例 ===\n');

  const connector = new DatabaseConnector();
  const context = {
    currentPhase: LifecyclePhase.INITIALIZATION,
    startTime: Date.now(),
    metadata: {},
    data: new Map(),
    events: [],
    errors: [],
    get: (key: string) => {
      if (key === '应用程序配置') {
        return {
          database: {
            host: 'localhost',
            port: 5432,
            username: 'admin',
            password: 'password',
            database: 'lifecycle_db',
            poolSize: 10,
            connectionTimeout: 10000,
          },
        };
      }
      return undefined;
    },
    set: (key: string, value: any) => {},
    has: (key: string) => false,
    delete: (key: string) => false,
    clear: () => {},
  };

  await connector.initialize(context);
  await connector.execute(context);

  console.log('数据库连接信息:');
  const connInfo = connector.getConnectionInfo();
  if (connInfo) {
    console.log(`  主机: ${connInfo.host}`);
    console.log(`  端口: ${connInfo.port}`);
    console.log(`  数据库: ${connInfo.database}`);
    console.log(`  连接状态: ${connInfo.isConnected ? '已连接' : '未连接'}`);
  }

  console.log('\n执行查询...');
  try {
    const result = await connector.query('SELECT * FROM users LIMIT 10');
    console.log(`✓ 查询成功: ${(result as any).success}`);
  } catch (error) {
    console.error('✗ 查询失败:', error);
  }

  console.log('\n连接池信息:');
  const poolInfo = connector.getPoolInfo();
  console.log(`  池大小: ${poolInfo.poolSize}`);
  console.log(`  活跃连接: ${poolInfo.activeConnections}`);
  console.log(`  空闲连接: ${poolInfo.idleConnections}`);

  console.log('\n查询历史:');
  const history = connector.getQueryHistory(3);
  history.forEach((h) => console.log(`  - ${h.query} (${h.duration}ms)`));

  await connector.cleanup(context);
}

// 导出所有示例
export const examples = {
  basicUsage: basicUsageExample,
  advancedUsage: advancedUsageExample,
  cacheUsage: cacheUsageExample,
  databaseUsage: databaseUsageExample,
};
