/**
 * 首页组件
 * 
 * 展示生命周期项目管理系统的概览和功能介绍
 */

'use client';

import { useState } from 'react';

export default function Home() {
  const [lifecyclePhases] = useState([
    {
      title: '初始化阶段',
      description: '系统启动、环境检测、基础配置',
      modules: ['环境检测器', '配置加载器', '数据库连接器', '缓存初始化器'],
      icon: '⚙️',
    },
    {
      title: '准备阶段',
      description: '资源准备、依赖注入、数据预加载',
      modules: ['资源管理器', '依赖注入容器', '数据预加载器', '插件加载器'],
      icon: '📦',
    },
    {
      title: '验证阶段',
      description: '数据验证、业务规则检查、权限验证',
      modules: ['数据验证器', '业务规则检查', '权限验证器', '完整性检查'],
      icon: '✓',
    },
    {
      title: '执行阶段',
      description: '业务逻辑执行、请求处理、事务管理',
      modules: ['请求处理器', '业务引擎', '事务管理器', '性能监测'],
      icon: '▶️',
    },
    {
      title: '监测阶段',
      description: '系统监测、性能追踪、告警管理',
      modules: ['性能监测器', '日志收集器', '告警管理器', '指标收集器'],
      icon: '📊',
    },
    {
      title: '清理阶段',
      description: '资源释放、连接关闭、日志归档',
      modules: ['资源释放器', '缓存清理', '连接关闭', '日志归档'],
      icon: '🧹',
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* 头部 */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🚀 生命周期项目管理系统
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            一个以生命周期驱动的现代化项目管理系统，具有详细的中文文档和清晰的模块结构
          </p>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 系统概览 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            系统架构
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            该系统采用<strong>生命周期驱动</strong>的架构设计，将整个项目的运行过程分为六个独立的生命周期阶段，
            每个阶段都有清晰的职责和完整的功能模块。
          </p>

          {/* 生命周期流程图 */}
          <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {[
                { name: '初始化', icon: '⚙️' },
                { name: '准备', icon: '📦' },
                { name: '验证', icon: '✓' },
                { name: '执行', icon: '▶️' },
                { name: '监测', icon: '📊' },
                { name: '清理', icon: '🧹' },
              ].map((phase, idx) => (
                <div key={idx} className="flex items-center flex-shrink-0">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{phase.icon}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {phase.name}
                    </div>
                  </div>
                  {idx < 5 && (
                    <div className="mx-3 text-gray-400">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 生命周期详情卡片 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            生命周期阶段详解
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lifecyclePhases.map((phase, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* 卡片头部 */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="text-3xl mb-2">{phase.icon}</div>
                  <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                </div>

                {/* 卡片内容 */}
                <div className="p-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {phase.description}
                  </p>

                  {/* 模块列表 */}
                  <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      包含模块：
                    </p>
                    <ul className="space-y-1">
                      {phase.modules.map((module, mIdx) => (
                        <li key={mIdx} className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-blue-500 mr-2">•</span>
                          {module}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 文件结构 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            项目文件结构
          </h2>
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg p-6">
            <pre className="text-sm overflow-x-auto text-gray-800 dark:text-gray-200">
              {`app/lifecycle/
├── README.md                    # 完整文档
├── types/                       # 类型定义
│   └── lifecycle.ts             # 生命周期类型
├── core/                        # 核心引擎
│   └── LifecycleEngine.ts       # 生命周期引擎
├── initialization/              # 初始化阶段
│   ├── EnvironmentDetector.ts   # 环境检测
│   ├── ConfigLoader.ts          # 配置加载
│   ├── DatabaseConnector.ts     # 数据库连接
│   └── CacheInitializer.ts      # 缓存初始化
├── preparation/                 # 准备阶段
├── execution/                   # 执行阶段
├── validation/                  # 验证阶段
├── cleanup/                     # 清理阶段
├── monitoring/                  # 监测阶段
└── hooks/                       # React钩子`}
            </pre>
          </div>
        </section>

        {/* 特性 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            系统特性
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: '完全中文化',
                description: '所有代码注释、文档和日志都使用中文',
              },
              {
                title: '模块化设计',
                description: '清晰的模块划分，易于扩展和维护',
              },
              {
                title: '详细的生命周期',
                description: '六个完整的生命周期阶段，覆盖系统全生命周期',
              },
              {
                title: '完善的监控',
                description: '完整的事件记录、统计和日志功能',
              },
              {
                title: '错误处理',
                description: '自动重试、错误恢复、详细错误信息',
              },
              {
                title: '性能优化',
                description: '连接池、缓存管理、资源优化',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-blue-50 dark:bg-slate-600 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 快速开始 */}
        <section className="mt-12 bg-indigo-50 dark:bg-slate-600 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            快速开始
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            导入生命周期引擎并开始使用：
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded p-4 text-sm overflow-x-auto">
            {`import { LifecycleEngine } from './lifecycle/core/LifecycleEngine';
import { EnvironmentDetector } from './lifecycle/initialization/EnvironmentDetector';

const engine = new LifecycleEngine();
engine.registerModule(LifecyclePhase.INITIALIZATION, new EnvironmentDetector());

await engine.start();`}
          </pre>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 dark:bg-black text-white mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>生命周期项目管理系统 v1.0.0</p>
          <p className="text-gray-400 mt-2">
            一个展示现代化项目架构的完整示例项目
          </p>
        </div>
      </footer>
    </div>
  );
}
