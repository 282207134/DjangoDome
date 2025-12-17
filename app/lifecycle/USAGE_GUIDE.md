# 生命周期系统使用指南

本文档提供了生命周期引擎的详细使用说明和最佳实践。

## 目录

1. [快速开始](#快速开始)
2. [核心概念](#核心概念)
3. [API参考](#api参考)
4. [常见场景](#常见场景)
5. [最佳实践](#最佳实践)
6. [故障排除](#故障排除)

## 快速开始

### 最简单的使用方式

```typescript
import { LifecycleEngine } from './lifecycle/core/LifecycleEngine';
import { EnvironmentDetector } from './lifecycle/initialization/EnvironmentDetector';
import { LifecyclePhase } from './lifecycle/types/lifecycle';

// 创建引擎
const engine = new LifecycleEngine();

// 注册模块
engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());

// 启动
await engine.start();
```

### 完整的初始化过程

```typescript
import { LifecycleEngine } from './lifecycle/core/LifecycleEngine';
import { LifecyclePhase } from './lifecycle/types/lifecycle';
import { 
  EnvironmentDetector, 
  ConfigLoader, 
  DatabaseConnector, 
  CacheInitializer 
} from './lifecycle/initialization';

const engine = new LifecycleEngine({
  enableDebugLogging: true,
  phaseTimeout: 30000,
  maxRetries: 3,
});

// 注册初始化阶段的所有模块
engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());
engine.registerModule(LifecyclePhase.INITIALIZATION, new ConfigLoader());
engine.registerModule(LifecyclePhase.INITIALIZATION, new DatabaseConnector());
engine.registerModule(LifecyclePhase.INITIALIZATION, new CacheInitializer());

// 启动引擎
await engine.start();

// 获取统计信息
const stats = engine.getStats();
console.log('执行统计:', stats);
```

## 核心概念

### 生命周期阶段

系统运行包含六个主要阶段：

#### 1. 初始化阶段 (INITIALIZATION)

**目标**: 准备系统运行环境

**包含操作**:
- 环境检测：检查运行环境和系统依赖
- 配置加载：加载应用配置
- 数据库连接：建立数据库连接
- 缓存初始化：初始化缓存系统

**示例**:
```typescript
import { EnvironmentDetector } from './lifecycle/initialization/EnvironmentDetector';

const detector = new EnvironmentDetector();
await detector.initialize(context);
await detector.execute(context);

// 获取环境信息
const envInfo = detector.getEnvironmentInfo();
console.log('环境类型:', envInfo?.environmentType);
console.log('Node版本:', envInfo?.nodeVersion);
```

#### 2. 准备阶段 (PREPARATION)

**目标**: 准备必要的资源和依赖

**包含操作**:
- 资源管理：分配系统资源
- 依赖注入：设置依赖关系
- 数据预加载：加载热点数据
- 插件加载：加载扩展插件

#### 3. 验证阶段 (VALIDATION)

**目标**: 验证系统和数据完整性

**包含操作**:
- 数据验证：验证输入数据
- 业务规则检查：检查业务规则
- 权限验证：验证用户权限
- 完整性检查：检查数据完整性

#### 4. 执行阶段 (EXECUTION)

**目标**: 执行业务逻辑

**包含操作**:
- 请求处理：处理用户请求
- 业务执行：执行业务逻辑
- 事务管理：管理数据库事务
- 性能监测：记录性能指标

#### 5. 监测阶段 (MONITORING)

**目标**: 监测系统运行状态

**包含操作**:
- 性能监测：收集性能数据
- 日志收集：收集运行日志
- 告警管理：生成告警
- 指标收集：收集业务指标

#### 6. 清理阶段 (CLEANUP)

**目标**: 释放资源和清理环境

**包含操作**:
- 资源释放：释放分配的资源
- 缓存清理：清理缓存数据
- 连接关闭：关闭各类连接
- 日志归档：归档运行日志

### 事件系统

事件是生命周期系统的重要组成部分，用于记录系统运行过程。

**事件级别**:
- `DEBUG`: 调试信息
- `INFO`: 一般信息
- `WARN`: 警告信息
- `ERROR`: 错误信息
- `CRITICAL`: 严重错误

**监听事件**:
```typescript
engine.addEventListener((event) => {
  console.log(`[${event.level}] ${event.name}: ${event.description}`);
});
```

### 上下文 (Context)

上下文用于在生命周期的各个阶段之间传递数据。

**使用方式**:
```typescript
// 在某个模块中设置数据
context.set('用户信息', { id: 1, name: '张三' });

// 在另一个模块中获取数据
const userInfo = context.get('用户信息');

// 检查键是否存在
if (context.has('用户信息')) {
  // ...
}

// 删除数据
context.delete('用户信息');

// 清空所有数据
context.clear();
```

## API参考

### LifecycleEngine

#### 构造函数

```typescript
new LifecycleEngine(config?: LifecycleConfig)
```

**配置选项**:
```typescript
interface LifecycleConfig {
  enableParallel?: boolean;        // 是否启用并行执行
  phaseTimeout?: number;           // 阶段超时时间（毫秒）
  enableDebugLogging?: boolean;    // 是否启用调试日志
  continueOnError?: boolean;       // 错误时是否继续
  maxRetries?: number;             // 最大重试次数
  retryDelay?: number;             // 重试延迟（毫秒）
  saveHistory?: boolean;           // 是否保存历史
  maxHistorySize?: number;         // 历史最大条数
}
```

#### 主要方法

##### initialize()

初始化引擎，执行初始化阶段。

```typescript
await engine.initialize();
```

##### start()

启动完整的生命周期执行。

```typescript
await engine.start();
```

##### registerModule(phase, module)

注册一个模块到指定阶段。

```typescript
engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());
```

##### addEventListener(listener)

注册事件监听器。

```typescript
engine.addEventListener((event) => {
  // 处理事件
});
```

##### addObserver(observer)

注册生命周期观察者。

```typescript
engine.addObserver({
  onInitializationStart() { /* ... */ },
  onInitializationComplete() { /* ... */ },
  onError(error, phase) { /* ... */ },
});
```

##### getStats()

获取执行统计信息。

```typescript
const stats = engine.getStats();
console.log(stats.totalExecutions);
console.log(stats.averageDuration);
```

##### getEventHistory(limit?)

获取事件历史。

```typescript
const events = engine.getEventHistory(10);
```

##### pause() / resume() / stop()

控制引擎运行。

```typescript
engine.pause();  // 暂停
engine.resume(); // 继续
engine.stop();   // 停止
```

### 初始化模块

#### EnvironmentDetector

检测运行环境。

```typescript
const detector = new EnvironmentDetector();
await detector.execute(context);

// 获取环境信息
const envInfo = detector.getEnvironmentInfo();
console.log(envInfo?.environmentType); // 'development' | 'testing' | 'production'

// 检查环境
console.log(detector.isProduction()); // 是否为生产环境
console.log(detector.isDevelopment()); // 是否为开发环境
```

#### ConfigLoader

加载和管理配置。

```typescript
const loader = new ConfigLoader();
await loader.execute(context);

// 获取配置
const config = loader.getConfig();

// 获取指定配置值
const apiUrl = loader.getConfigValue('api.baseUrl');

// 设置配置值
loader.setConfigValue('api.timeout', 5000);

// 获取配置来源
const sources = loader.getConfigSources();
```

#### DatabaseConnector

管理数据库连接。

```typescript
const connector = new DatabaseConnector();
await connector.execute(context);

// 执行查询
const result = await connector.query('SELECT * FROM users');

// 执行事务
const transactionResult = await connector.transaction(async () => {
  // 事务内的操作
  return someResult;
});

// 获取连接池信息
const poolInfo = connector.getPoolInfo();

// 获取查询历史
const history = connector.getQueryHistory(10);

// 获取统计信息
const stats = connector.getStatistics();
```

#### CacheInitializer

管理缓存系统。

```typescript
const cache = new CacheInitializer();
await cache.execute(context);

// 设置缓存
cache.set('key', 'value', 3600); // 过期时间：秒

// 获取缓存
const value = cache.get('key');

// 检查键是否存在
if (cache.has('key')) {
  // ...
}

// 删除缓存
cache.delete('key');

// 清空缓存
cache.clear();

// 获取所有键
const keys = cache.getKeys();

// 获取缓存统计
const stats = cache.getStatistics();
```

## 常见场景

### 场景1: 只初始化，不运行业务

```typescript
const engine = new LifecycleEngine();
engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());
engine.registerModule(LifecyclePhase.INITIALIZATION, new ConfigLoader());

// 只执行初始化
await engine.initialize();

// 获取初始化结果
const configLoader = ...; // 获取注册的ConfigLoader实例
const config = configLoader.getConfig();
```

### 场景2: 监听所有系统事件

```typescript
const events: LifecycleEvent[] = [];

engine.addEventListener((event) => {
  events.push(event);
  console.log(`[${event.timestamp}] ${event.name}`);
});

await engine.start();

// 分析事件
console.log(`总事件数: ${events.length}`);
console.log(`错误事件: ${events.filter(e => e.level === EventLevel.ERROR).length}`);
```

### 场景3: 在执行过程中访问初始化的资源

```typescript
class MyExecutionModule implements LifecycleModule {
  async execute(context: LifecycleContext) {
    // 获取初始化阶段设置的配置
    const config = context.get('应用程序配置');
    
    // 获取初始化阶段建立的数据库连接
    const dbConnection = context.get('数据库连接');
    
    // 获取初始化阶段初始化的缓存
    const cache = context.get('缓存初始化器');
    
    // 使用这些资源执行业务逻辑
  }
}
```

### 场景4: 自定义错误处理

```typescript
const engine = new LifecycleEngine({
  continueOnError: true,  // 错误时继续执行
  maxRetries: 5,          // 最多重试5次
});

engine.addObserver({
  async onError(error, phase) {
    console.error(`${phase}阶段发生错误:`, error.message);
    // 发送告警
    // 记录日志
    // 执行恢复操作
  }
});
```

## 最佳实践

### 1. 正确的初始化顺序

```typescript
// ✓ 好的做法：按照逻辑顺序初始化
engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());   // 第1步：检测环境
engine.registerModule(LifecyclePhase.INITIALIZATION, new ConfigLoader());          // 第2步：加载配置
engine.registerModule(LifecyclePhase.INITIALIZATION, new DatabaseConnector());     // 第3步：连接数据库
engine.registerModule(LifecyclePhase.INITIALIZATION, new CacheInitializer());      // 第4步：初始化缓存

// ✗ 不好的做法：乱序初始化
engine.registerModule(LifecyclePhase.INITIALIZATION, new DatabaseConnector());  // 错误：还没加载配置
engine.registerModule(LifecyclePhase.INITIALIZATION, new ConfigLoader());
```

### 2. 使用观察者监听关键事件

```typescript
engine.addObserver({
  async onInitializationStart() {
    console.log('系统初始化开始');
  },
  async onInitializationComplete() {
    console.log('系统初始化完成');
    // 可以在这里进行初始化后的检查
  },
  async onError(error, phase) {
    console.error(`${phase}失败:`, error);
    // 记录错误日志
    // 发送告警通知
    // 执行恢复流程
  }
});
```

### 3. 利用上下文共享资源

```typescript
// 在初始化模块中设置资源
class MyInitModule implements LifecycleModule {
  async execute(context: LifecycleContext) {
    const db = await connectDatabase();
    context.set('database', db);  // 设置数据库连接
  }
}

// 在其他模块中使用资源
class MyExecModule implements LifecycleModule {
  async execute(context: LifecycleContext) {
    const db = context.get('database');  // 获取数据库连接
    const result = await db.query('SELECT * FROM users');
  }
}
```

### 4. 适当配置超时和重试

```typescript
const engine = new LifecycleEngine({
  phaseTimeout: 30000,     // 30秒超时
  maxRetries: 3,           // 最多重试3次
  retryDelay: 1000,        // 重试间隔1秒
  continueOnError: false,  // 错误时停止（确保数据一致性）
});
```

### 5. 启用日志用于调试

```typescript
const engine = new LifecycleEngine({
  enableDebugLogging: true,  // 启用调试日志
  saveHistory: true,         // 保存事件历史
  maxHistorySize: 1000,      // 最多保存1000条事件
});

// 获取历史用于分析
const events = engine.getEventHistory();
const errors = events.filter(e => e.level === EventLevel.ERROR);
console.log(`检测到${errors.length}个错误`);
```

## 故障排除

### 问题1: 初始化超时

**症状**: 看到 `模块执行超时` 的错误

**解决方案**:
```typescript
// 增加超时时间
const engine = new LifecycleEngine({
  phaseTimeout: 60000  // 改为60秒
});
```

### 问题2: 数据库连接失败

**症状**: 看到 `无法建立数据库连接` 的错误

**解决方案**:
```typescript
// 检查数据库配置
const config = loader.getConfig();
console.log(config.database);  // 验证配置正确

// 检查重试设置
const engine = new LifecycleEngine({
  maxRetries: 5,      // 增加重试次数
  retryDelay: 2000    // 增加重试延迟
});
```

### 问题3: 缓存未工作

**症状**: 从缓存获取的值总是 `undefined`

**解决方案**:
```typescript
// 检查缓存是否启用
const config = loader.getConfig();
console.log(config.cache.enabled);  // 应该为 true

// 检查缓存是否有数据
const keys = cache.getKeys();
console.log('缓存键:', keys);

// 检查键是否过期
const item = cache.getItemInfo('your-key');
console.log('过期时间:', new Date(item.expiresAt));
```

### 问题4: 高内存使用

**症状**: 系统内存不断增长

**解决方案**:
```typescript
// 缩小缓存大小或减少历史保存
const engine = new LifecycleEngine({
  maxHistorySize: 100,  // 减少历史记录
  saveHistory: false,   // 禁用历史保存
});

// 清理缓存
cache.clear();

// 定期检查和清理资源
setInterval(() => {
  const stats = cache.getStatistics();
  console.log(`缓存中有${stats.itemCount}项`);
}, 60000);
```

## 总结

生命周期系统提供了一个清晰、结构化的方式来管理应用程序的运行过程。通过正确使用各个生命周期阶段和模块，可以构建更加健壮和可维护的应用程序。

记住关键要点：
- 遵循初始化顺序
- 使用观察者监听关键事件
- 利用上下文共享资源
- 合理配置超时和重试
- 启用日志用于调试
