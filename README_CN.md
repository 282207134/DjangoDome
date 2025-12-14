# Django 6.0 学习项目

这是一个完整的 Django 6.0 学习项目，包含了详细的中文注释和文档，帮助你快速学习和掌握 Django 框架。

## 📚 项目简介

本项目基于 Django 6.0 官方文档（https://docs.djangoproject.com/en/6.0/）构建，涵盖了 Django 框架的核心功能：

- **博客系统**：完整的博客功能，包括文章管理、分类、标签、评论等
- **用户系统**：用户注册、登录、个人资料管理
- **API 接口**：RESTful API 示例
- **管理后台**：Django Admin 的深度定制
- **表单处理**：各种表单的使用和验证
- **数据库操作**：ORM 查询、关系处理等

## 🎯 学习目标

通过本项目，你将学习到：

1. **Django 基础**
   - MTV 架构模式
   - URL 路由配置
   - 视图函数和类视图
   - 模板系统
   - 静态文件管理

2. **模型和数据库**
   - ORM 基础
   - 模型字段类型
   - 模型关系（一对多、多对多、一对一）
   - 查询优化
   - 数据库迁移

3. **表单处理**
   - ModelForm 的使用
   - 表单验证
   - 文件上传处理

4. **用户认证**
   - Django 内置认证系统
   - 用户注册和登录
   - 权限控制
   - 密码管理

5. **管理后台**
   - ModelAdmin 配置
   - 自定义列表显示
   - 批量操作
   - 内联编辑

6. **高级特性**
   - 信号（Signals）
   - 中间件
   - 缓存
   - 日志系统

## 🚀 快速开始

### 环境要求

- Python 3.12+
- Django 6.0
- Pillow（用于图片处理）

### 安装步骤

1. **克隆项目**（如果从 Git 仓库）
   ```bash
   git clone <repository-url>
   cd django_learning_project
   ```

2. **创建虚拟环境**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或
   venv\Scripts\activate  # Windows
   ```

3. **安装依赖**
   ```bash
   pip install django pillow
   ```

4. **运行数据库迁移**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **创建超级用户**
   ```bash
   python manage.py createsuperuser
   ```
   按提示输入用户名、邮箱和密码。

6. **创建必要的目录**
   ```bash
   mkdir -p static media media/avatars templates
   ```

7. **运行开发服务器**
   ```bash
   python manage.py runserver
   ```

8. **访问项目**
   - 前端：http://127.0.0.1:8000/
   - 管理后台：http://127.0.0.1:8000/admin/

## 📁 项目结构

```
django_learning_project/
├── django_learning_project/    # 项目配置目录
│   ├── __init__.py
│   ├── settings.py            # 项目设置（详细中文注释）
│   ├── urls.py                # 根 URL 配置
│   ├── wsgi.py                # WSGI 配置
│   └── asgi.py                # ASGI 配置
│
├── blog/                       # 博客应用
│   ├── migrations/            # 数据库迁移文件
│   ├── __init__.py
│   ├── admin.py               # 管理后台配置
│   ├── apps.py                # 应用配置
│   ├── models.py              # 数据模型
│   ├── views.py               # 视图函数
│   ├── forms.py               # 表单定义
│   ├── urls.py                # URL 路由
│   └── tests.py               # 测试文件
│
├── users/                      # 用户应用
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py              # 用户资料模型
│   ├── views.py               # 认证视图
│   ├── forms.py               # 用户表单
│   ├── urls.py
│   ├── signals.py             # 信号处理器
│   └── tests.py
│
├── api/                        # API 应用
│   ├── __init__.py
│   ├── views.py               # API 视图
│   └── urls.py
│
├── templates/                  # 模板文件
│   ├── base.html              # 基础模板
│   ├── blog/                  # 博客模板
│   └── users/                 # 用户模板
│
├── static/                     # 静态文件
│   ├── css/
│   ├── js/
│   └── images/
│
├── media/                      # 用户上传的文件
│   ├── avatars/               # 用户头像
│   └── blog/                  # 博客图片
│
├── manage.py                   # Django 管理脚本
├── requirements.txt            # 依赖列表
└── README_CN.md               # 本文件
```

## 📖 核心功能说明

### 1. 博客系统 (blog)

**模型**：
- `Category`：文章分类
- `Tag`：文章标签
- `Post`：博客文章（包含标题、内容、作者、分类、标签等）
- `Comment`：文章评论（支持多级回复）

**功能**：
- 文章的增删改查
- 分类和标签管理
- 文章搜索
- 评论功能
- 浏览统计

**关键文件**：
- `models.py`：数据模型定义，演示了各种字段类型和关系
- `views.py`：视图函数，演示了函数视图和类视图
- `forms.py`：表单定义，包含表单验证
- `admin.py`：管理后台配置，展示了 Admin 的强大功能

### 2. 用户系统 (users)

**模型**：
- `Profile`：用户资料（一对一扩展 User 模型）

**功能**：
- 用户注册
- 用户登录/登出
- 个人资料管理
- 头像上传和自动缩放
- 密码修改和重置

**关键文件**：
- `models.py`：用户资料模型
- `forms.py`：注册和资料编辑表单
- `signals.py`：自动创建用户资料的信号处理器
- `views.py`：认证相关视图

### 3. API 接口 (api)

**功能**：
- 获取文章列表
- 获取文章详情
- 获取分类列表
- 获取标签列表

**说明**：
这是一个简单的 JSON API 实现。对于生产环境，建议使用 Django REST Framework。

## 🎓 学习路线

### 第一步：理解项目结构
1. 阅读 `settings.py`，了解 Django 的核心配置
2. 查看 `urls.py`，理解 URL 路由机制
3. 浏览各个应用的目录结构

### 第二步：学习数据模型
1. 阅读 `blog/models.py`，学习模型定义
2. 理解不同的字段类型和选项
3. 学习模型之间的关系（ForeignKey, ManyToMany, OneToOne）
4. 运行 `python manage.py makemigrations` 和 `migrate` 了解迁移

### 第三步：掌握视图和 URL
1. 学习 `blog/views.py` 中的函数视图和类视图
2. 理解 `blog/urls.py` 中的 URL 模式
3. 尝试添加新的视图和 URL

### 第四步：使用表单
1. 阅读 `blog/forms.py` 和 `users/forms.py`
2. 了解 ModelForm 的使用
3. 学习表单验证和自定义验证方法

### 第五步：定制管理后台
1. 登录管理后台 http://127.0.0.1:8000/admin/
2. 阅读 `blog/admin.py`，学习 ModelAdmin 的配置
3. 尝试自定义列表显示、筛选器和操作

### 第六步：实践练习
1. 添加新的模型字段
2. 创建新的视图和模板
3. 实现新的功能（如点赞、收藏等）
4. 编写测试用例

## 🔧 常用命令

### 数据库相关
```bash
# 创建迁移文件
python manage.py makemigrations

# 查看迁移 SQL
python manage.py sqlmigrate blog 0001

# 执行迁移
python manage.py migrate

# 打开数据库 shell
python manage.py dbshell
```

### 开发相关
```bash
# 运行开发服务器
python manage.py runserver

# 运行服务器并指定端口
python manage.py runserver 8080

# 创建超级用户
python manage.py createsuperuser

# 打开 Python shell
python manage.py shell
```

### 静态文件
```bash
# 收集静态文件
python manage.py collectstatic

# 清理静态文件
python manage.py collectstatic --clear
```

### 应用管理
```bash
# 创建新应用
python manage.py startapp app_name

# 查看已安装的应用
python manage.py showmigrations
```

## 📝 代码规范

本项目遵循以下代码规范：

1. **命名规范**
   - 类名使用 PascalCase（大驼峰）
   - 函数和变量使用 snake_case（下划线）
   - 常量使用 UPPER_CASE（全大写）

2. **注释规范**
   - 所有模块、类、函数都有详细的文档字符串
   - 关键代码段有行内注释
   - 注释使用中文，便于理解

3. **代码组织**
   - 每个文件都有清晰的模块说明
   - 相关功能组织在一起
   - 适当使用空行分隔逻辑块

## 🔍 调试技巧

### 1. 使用 Django Debug Toolbar
```bash
pip install django-debug-toolbar
```

在 `settings.py` 中配置后，可以查看 SQL 查询、模板渲染等信息。

### 2. 使用 print() 和 logging
```python
import logging
logger = logging.getLogger(__name__)
logger.info('调试信息')
```

### 3. 使用 Django Shell
```bash
python manage.py shell
```

在 shell 中测试模型和查询：
```python
from blog.models import Post
posts = Post.objects.all()
print(posts)
```

### 4. 查看 SQL 查询
```python
from django.db import connection
print(connection.queries)
```

## 🌐 部署建议

### 开发环境
- DEBUG = True
- 使用 SQLite 数据库
- 使用 Django 开发服务器

### 生产环境
- DEBUG = False
- 使用 PostgreSQL 或 MySQL
- 使用 Gunicorn + Nginx
- 配置 HTTPS
- 设置适当的 ALLOWED_HOSTS
- 使用环境变量管理敏感信息
- 配置缓存（Redis/Memcached）
- 设置日志记录

## 📚 学习资源

### 官方文档
- Django 6.0 文档：https://docs.djangoproject.com/en/6.0/
- Django 中文文档：https://docs.djangoproject.com/zh-hans/6.0/

### 推荐教程
- Django Girls Tutorial
- Django for Beginners
- Two Scoops of Django

### 相关项目
- Django REST Framework（API 开发）
- Django Channels（WebSocket 支持）
- Celery（异步任务）

## 🐛 问题排查

### 常见问题

**1. 迁移错误**
```bash
# 删除迁移文件并重新创建
rm -rf */migrations/
python manage.py makemigrations
python manage.py migrate
```

**2. 静态文件无法加载**
- 检查 STATIC_URL 和 STATICFILES_DIRS 配置
- 确保在模板中使用 `{% load static %}`
- 运行 `collectstatic` 命令

**3. 模板找不到**
- 检查 TEMPLATES 中的 DIRS 配置
- 确保模板文件路径正确
- 检查应用是否在 INSTALLED_APPS 中

**4. 图片上传失败**
- 检查 MEDIA_URL 和 MEDIA_ROOT 配置
- 确保目录有写入权限
- 检查表单中是否使用 `enctype="multipart/form-data"`

## 🤝 贡献

欢迎提交问题和改进建议！

## 📄 许可证

本项目仅用于学习目的，代码可自由使用和修改。

## 📞 联系方式

如有问题，欢迎通过以下方式联系：
- 提交 Issue
- 发送邮件

---

**祝学习愉快！Happy Coding! 🎉**
