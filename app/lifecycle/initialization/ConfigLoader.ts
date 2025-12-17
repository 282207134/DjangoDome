/**
 * 配置加载器模块
 * 
 * 负责在系统初始化时加载和验证配置，包括：
 * - 读取配置文件
 * - 解析环境变量
 * - 合并配置源
 * - 验证配置有效性
 * - 提供配置访问接口
 */

import { LifecyclePhase, LifecycleModule, LifecycleContext, ExecutionResult } from '../types/lifecycle';

/**
 * 应用程序配置接口
 * 
 * 定义应用程序的各项配置
 */
export interface ApplicationConfig {
  /** 应用名称 */
  appName: string;

  /** 应用版本 */
  appVersion: string;

  /** 运行环境 */
  environment: 'development' | 'testing' | 'production';

  /** API配置 */
  api: {
    /** API基础URL */
    baseUrl: string;
    /** API超时时间（毫秒） */
    timeout: number;
    /** 是否启用API日志 */
    enableLogging: boolean;
    /** API重试次数 */
    retryCount: number;
  };

  /** 数据库配置 */
  database: {
    /** 数据库主机 */
    host: string;
    /** 数据库端口 */
    port: number;
    /** 数据库用户名 */
    username: string;
    /** 数据库密码 */
    password: string;
    /** 数据库名称 */
    database: string;
    /** 连接池大小 */
    poolSize: number;
    /** 连接超时（毫秒） */
    connectionTimeout: number;
  };

  /** 缓存配置 */
  cache: {
    /** 是否启用缓存 */
    enabled: boolean;
    /** 缓存类型 */
    type: 'memory' | 'redis' | 'memcached';
    /** 缓存主机 */
    host: string;
    /** 缓存端口 */
    port: number;
    /** 默认过期时间（秒） */
    defaultExpiration: number;
  };

  /** 日志配置 */
  logging: {
    /** 日志级别 */
    level: 'debug' | 'info' | 'warn' | 'error';
    /** 是否输出到控制台 */
    console: boolean;
    /** 是否保存到文件 */
    file: boolean;
    /** 日志文件路径 */
    filePath: string;
    /** 日志最大文件大小（字节） */
    maxFileSize: number;
  };

  /** 安全配置 */
  security: {
    /** JWT密钥 */
    jwtSecret: string;
    /** JWT过期时间（秒） */
    jwtExpiration: number;
    /** 是否启用HTTPS */
    enableHttps: boolean;
    /** 是否启用CORS */
    enableCors: boolean;
  };

  /** 其他自定义配置 */
  [key: string]: unknown;
}

/**
 * 配置加载器类
 * 
 * 这个模块负责在系统初始化阶段加载和管理配置。
 * 它支持从多个源加载配置，包括配置文件和环境变量。
 * 
 * 使用示例：
 * ```typescript
 * const loader = new ConfigLoader();
 * await loader.execute(context);
 * const config = loader.getConfig();
 * ```
 */
export class ConfigLoader implements LifecycleModule {
  /** 模块名称 */
  public readonly name: string = '配置加载器';

  /** 模块版本 */
  public readonly version: string = '1.0.0';

  /** 模块所属的生命周期阶段 */
  public readonly phase: LifecyclePhase = LifecyclePhase.INITIALIZATION;

  /** 模块是否已初始化 */
  public isInitialized: boolean = false;

  /** 加载的配置 */
  private config: ApplicationConfig;

  /** 配置来源追踪 */
  private configSources: Map<string, string> = new Map();

  /**
   * 构造函数
   * 
   * 初始化默认配置
   */
  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取默认配置
   * 
   * @returns 默认配置对象
   * @private
   */
  private getDefaultConfig(): ApplicationConfig {
    return {
      appName: '生命周期项目管理系统',
      appVersion: '1.0.0',
      environment: 'development',
      api: {
        baseUrl: 'http://localhost:3000/api',
        timeout: 30000,
        enableLogging: true,
        retryCount: 3,
      },
      database: {
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'password',
        database: 'lifecycle_db',
        poolSize: 10,
        connectionTimeout: 10000,
      },
      cache: {
        enabled: true,
        type: 'memory',
        host: 'localhost',
        port: 6379,
        defaultExpiration: 3600,
      },
      logging: {
        level: 'info',
        console: true,
        file: true,
        filePath: './logs/app.log',
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
      security: {
        jwtSecret: 'your-secret-key-change-in-production',
        jwtExpiration: 86400, // 24小时
        enableHttps: false,
        enableCors: true,
      },
    };
  }

  /**
   * 初始化配置加载器
   * 
   * @param _context - 生命周期上下文
   */
  public async initialize(_context: LifecycleContext): Promise<void> {
    try {
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`配置加载器初始化失败: ${error}`);
    }
  }

  /**
   * 执行配置加载
   * 
   * 这个方法会从多个源加载配置并进行验证。
   * 加载顺序：
   * 1. 默认配置
   * 2. 配置文件（如果存在）
   * 3. 环境变量
   * 
   * @param context - 生命周期上下文
   */
  public async execute(_context: LifecycleContext): Promise<void> {
    try {
      // 步骤1：加载默认配置（已在构造函数中完成）

      // 步骤2：从环境变量覆盖配置
      this.loadFromEnvironment();

      // 步骤3：验证配置
      this.validateConfig();

      // 步骤4：保存到上下文
      context.set('应用程序配置', this.config);

      // 步骤5：记录加载的配置来源
      context.set('配置来源', Object.fromEntries(this.configSources));
    } catch (error) {
      throw new Error(`配置加载执行失败: ${error}`);
    }
  }

  /**
   * 清理资源
   * 
   * @param context - 生命周期上下文
   */
  public async cleanup(context: LifecycleContext): Promise<void> {
    this.isInitialized = false;
  }

  /**
   * 从环境变量加载配置
   * 
   * 环境变量格式：APP_<配置路径>=值
   * 例如：APP_API_TIMEOUT=5000
   * 
   * @private
   */
  private loadFromEnvironment(): void {
    if (typeof process === 'undefined' || !(process as NodeJS.Process).env) {
      return;
    }

    // 环境类型
    if ((process as NodeJS.Process).env.NODE_ENV) {
      const nodeEnv = (process as NodeJS.Process).env.NODE_ENV;
      this.config.environment = nodeEnv as 'development' | 'testing' | 'production';
      this.configSources.set('environment', 'process.env.NODE_ENV');
    }

    // API配置
    if (process.env.API_BASE_URL) {
      this.config.api.baseUrl = process.env.API_BASE_URL;
      this.configSources.set('api.baseUrl', 'process.env.API_BASE_URL');
    }
    if (process.env.API_TIMEOUT) {
      this.config.api.timeout = parseInt(process.env.API_TIMEOUT, 10);
      this.configSources.set('api.timeout', 'process.env.API_TIMEOUT');
    }

    // 数据库配置
    if (process.env.DB_HOST) {
      this.config.database.host = process.env.DB_HOST;
      this.configSources.set('database.host', 'process.env.DB_HOST');
    }
    if (process.env.DB_PORT) {
      this.config.database.port = parseInt(process.env.DB_PORT, 10);
      this.configSources.set('database.port', 'process.env.DB_PORT');
    }
    if (process.env.DB_USER) {
      this.config.database.username = process.env.DB_USER;
      this.configSources.set('database.username', 'process.env.DB_USER');
    }
    if (process.env.DB_PASSWORD) {
      this.config.database.password = process.env.DB_PASSWORD;
      this.configSources.set('database.password', 'process.env.DB_PASSWORD');
    }
    if (process.env.DB_NAME) {
      this.config.database.database = process.env.DB_NAME;
      this.configSources.set('database.database', 'process.env.DB_NAME');
    }

    // 缓存配置
    if (process.env.CACHE_ENABLED) {
      this.config.cache.enabled = process.env.CACHE_ENABLED === 'true';
      this.configSources.set('cache.enabled', 'process.env.CACHE_ENABLED');
    }
    if (process.env.CACHE_TYPE) {
      this.config.cache.type = process.env.CACHE_TYPE as 'memory' | 'redis' | 'memcached';
      this.configSources.set('cache.type', 'process.env.CACHE_TYPE');
    }

    // 日志配置
    if (process.env.LOG_LEVEL) {
      this.config.logging.level = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error';
      this.configSources.set('logging.level', 'process.env.LOG_LEVEL');
    }

    // 安全配置
    if (process.env.JWT_SECRET) {
      this.config.security.jwtSecret = process.env.JWT_SECRET;
      this.configSources.set('security.jwtSecret', 'process.env.JWT_SECRET');
    }
  }

  /**
   * 验证配置有效性
   * 
   * @throws 如果配置无效
   * @private
   */
  private validateConfig(): void {
    const errors: string[] = [];

    // 验证必要字段
    if (!this.config.appName) {
      errors.push('应用名称不能为空');
    }

    if (!this.config.appVersion) {
      errors.push('应用版本不能为空');
    }

    // 验证API配置
    if (!this.config.api.baseUrl) {
      errors.push('API基础URL不能为空');
    }

    if (this.config.api.timeout <= 0) {
      errors.push('API超时时间必须大于0');
    }

    // 验证数据库配置
    if (!this.config.database.host) {
      errors.push('数据库主机不能为空');
    }

    if (this.config.database.port <= 0 || this.config.database.port > 65535) {
      errors.push('数据库端口必须在0-65535之间');
    }

    if (!this.config.database.database) {
      errors.push('数据库名称不能为空');
    }

    // 验证缓存配置
    if (!['memory', 'redis', 'memcached'].includes(this.config.cache.type)) {
      errors.push('缓存类型必须是 memory、redis 或 memcached');
    }

    // 验证日志配置
    if (!['debug', 'info', 'warn', 'error'].includes(this.config.logging.level)) {
      errors.push('日志级别必须是 debug、info、warn 或 error');
    }

    // 验证安全配置
    if (this.config.security.enableHttps && this.config.security.jwtSecret.length < 16) {
      errors.push('启用HTTPS时，JWT密钥长度必须至少16个字符');
    }

    if (errors.length > 0) {
      throw new Error(`配置验证失败:\n${errors.join('\n')}`);
    }
  }

  /**
   * 获取配置
   * 
   * @returns 完整的应用程序配置
   */
  public getConfig(): ApplicationConfig {
    return { ...this.config };
  }

  /**
   * 获取指定路径的配置值
   * 
   * 使用点符号访问嵌套配置，例如：api.timeout
   * 
   * @param path - 配置路径
   * @returns 配置值，如果路径不存在则返回 undefined
   */
  public getConfigValue(path: string): unknown {
    const keys = path.split('.');
    let current: unknown = this.config;

    for (const key of keys) {
      if (typeof current !== 'object' || current === null || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * 设置配置值
   * 
   * @param path - 配置路径
   * @param value - 配置值
   */
  public setConfigValue(path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current: Record<string, unknown> = this.config;

    for (const key of keys) {
      if (typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
    this.configSources.set(path, 'manual');
  }

  /**
   * 获取配置来源
   * 
   * @returns 配置来源信息
   */
  public getConfigSources(): Record<string, string> {
    return Object.fromEntries(this.configSources);
  }

  /**
   * 获取模块状态
   * 
   * @returns 模块状态
   */
  public getStatus() {
    return {
      name: this.name,
      isRunning: false,
      lastResult: ExecutionResult.SUCCESS,
      executionCount: 1,
      stats: {
        configKeysLoaded: Object.keys(this.config).length,
        sourcesUsed: this.configSources.size,
        environment: this.config.environment,
      },
    };
  }
}
