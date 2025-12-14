"""
Django 6.0 学习项目配置文件

这是 Django 项目的核心配置文件，包含了所有重要的设置和配置项。
本文件详细注释了每个配置项的作用和用途，帮助学习者理解 Django 的配置机制。

更多信息请查看：
https://docs.djangoproject.com/en/6.0/topics/settings/
https://docs.djangoproject.com/en/6.0/ref/settings/
"""

from pathlib import Path
import os

# ==================== 路径配置 ====================
# BASE_DIR 是项目的根目录路径
# 使用 Path 对象来处理文件路径，这是 Python 3.4+ 推荐的方式
# __file__ 表示当前文件（settings.py）的路径
# .resolve() 将路径解析为绝对路径
# .parent.parent 获取父目录的父目录，即项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent


# ==================== 安全配置 ====================
# 安全警告：SECRET_KEY 在生产环境中必须保密！
# SECRET_KEY 用于加密签名，保护 cookies、sessions 等敏感数据
# 生产环境应该从环境变量或配置文件中读取，而不是直接写在代码中
SECRET_KEY = 'django-insecure-g=usqjc^(v824wbi4)j4o(%@+v_fb@719+p4o3@^@(rnjq^qru'

# 安全警告：DEBUG 模式在生产环境中必须设置为 False！
# DEBUG = True 时，Django 会显示详细的错误页面，包含敏感信息
# 开发环境：DEBUG = True，方便调试
# 生产环境：DEBUG = False，避免信息泄露
DEBUG = True

# ALLOWED_HOSTS 定义允许访问的主机名列表
# DEBUG = False 时必须设置，用于防止 HTTP Host header 攻击
# 开发环境可以留空，生产环境应该设置为实际的域名
# 示例：ALLOWED_HOSTS = ['example.com', 'www.example.com', '192.168.1.100']
ALLOWED_HOSTS = []


# ==================== 应用配置 ====================
# INSTALLED_APPS 列出了项目中所有激活的应用
# Django 的功能都是通过应用（app）来组织的
INSTALLED_APPS = [
    # Django 内置的管理后台，提供强大的数据管理界面
    'django.contrib.admin',
    
    # 身份验证系统，处理用户、组和权限
    'django.contrib.auth',
    
    # 内容类型框架，用于跟踪项目中的所有模型
    'django.contrib.contenttypes',
    
    # 会话框架，用于存储和管理用户会话数据
    'django.contrib.sessions',
    
    # 消息框架，用于在请求之间传递一次性通知消息
    'django.contrib.messages',
    
    # 静态文件管理，处理 CSS、JavaScript、图片等静态资源
    'django.contrib.staticfiles',
    
    # ==================== 自定义应用 ====================
    # 博客应用 - 演示 Django 的模型、视图、模板等核心功能
    'blog.apps.BlogConfig',
    
    # 用户应用 - 演示自定义用户认证和权限管理
    'users.apps.UsersConfig',
    
    # API 应用 - 演示 RESTful API 的构建
    'api.apps.ApiConfig',
]

# ==================== 中间件配置 ====================
# MIDDLEWARE 定义了请求/响应处理的中间件列表
# 中间件按照列表顺序依次处理请求（从上到下）
# 处理响应时则按相反顺序（从下到上）
MIDDLEWARE = [
    # 安全中间件 - 提供多种安全增强功能
    # 如 HTTPS 重定向、安全 cookies 等
    'django.middleware.security.SecurityMiddleware',
    
    # 会话中间件 - 启用会话支持
    # 必须在 AuthenticationMiddleware 之前
    'django.contrib.sessions.middleware.SessionMiddleware',
    
    # 通用中间件 - 提供一些便利功能
    # 如 URL 规范化、添加 Content-Length 头等
    'django.middleware.common.CommonMiddleware',
    
    # CSRF 保护中间件 - 防止跨站请求伪造攻击
    # 所有 POST 表单都需要包含 CSRF token
    'django.middleware.csrf.CsrfViewMiddleware',
    
    # 认证中间件 - 将用户信息添加到每个请求中
    # 通过 request.user 访问当前用户
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    
    # 消息中间件 - 支持基于 cookie 和会话的消息传递
    'django.contrib.messages.middleware.MessageMiddleware',
    
    # 点击劫持保护中间件 - 设置 X-Frame-Options 头
    # 防止网站被嵌入到 iframe 中
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==================== URL 配置 ====================
# ROOT_URLCONF 指定项目的根 URL 配置模块
# Django 会从这个模块开始解析 URL
ROOT_URLCONF = 'django_learning_project.urls'

# ==================== 模板配置 ====================
# TEMPLATES 配置模板引擎和相关设置
TEMPLATES = [
    {
        # 使用 Django 自带的模板引擎（DTL - Django Template Language）
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        
        # DIRS 定义模板文件的搜索目录
        # 设置项目级别的模板目录，可以覆盖应用级别的模板
        'DIRS': [BASE_DIR / 'templates'],
        
        # APP_DIRS = True 表示在每个 INSTALLED_APPS 中查找 templates 子目录
        'APP_DIRS': True,
        
        # OPTIONS 包含传递给模板引擎的额外选项
        'OPTIONS': {
            # context_processors 定义了自动添加到模板上下文的变量
            'context_processors': [
                # 添加 request 对象到模板上下文
                'django.template.context_processors.debug',
                
                # 添加 request 对象到模板上下文
                'django.template.context_processors.request',
                
                # 添加认证相关变量（user, perms）到模板上下文
                'django.contrib.auth.context_processors.auth',
                
                # 添加消息框架相关变量到模板上下文
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ==================== WSGI/ASGI 配置 ====================
# WSGI_APPLICATION 指定 WSGI 应用对象的路径
# WSGI (Web Server Gateway Interface) 是 Python Web 应用的标准接口
WSGI_APPLICATION = 'django_learning_project.wsgi.application'

# ASGI_APPLICATION 指定 ASGI 应用对象的路径（用于异步功能）
# Django 6.0 完全支持 ASGI，可以处理异步视图、WebSocket 等
# ASGI_APPLICATION = 'django_learning_project.asgi.application'


# ==================== 数据库配置 ====================
# DATABASES 配置数据库连接
# Django 支持多种数据库：SQLite, PostgreSQL, MySQL, Oracle 等
# 参考：https://docs.djangoproject.com/en/6.0/ref/settings/#databases
DATABASES = {
    # 'default' 是默认数据库配置
    'default': {
        # 使用 SQLite 数据库引擎（适合开发和小型项目）
        # SQLite 是一个轻量级的文件数据库，无需安装数据库服务器
        'ENGINE': 'django.db.backends.sqlite3',
        
        # 数据库文件路径
        'NAME': BASE_DIR / 'db.sqlite3',
    }
    
    # PostgreSQL 配置示例（生产环境推荐）：
    # 'default': {
    #     'ENGINE': 'django.db.backends.postgresql',
    #     'NAME': 'mydatabase',          # 数据库名称
    #     'USER': 'mydatabaseuser',      # 数据库用户名
    #     'PASSWORD': 'mypassword',      # 数据库密码
    #     'HOST': '127.0.0.1',           # 数据库主机
    #     'PORT': '5432',                # 数据库端口
    # }
    
    # MySQL 配置示例：
    # 'default': {
    #     'ENGINE': 'django.db.backends.mysql',
    #     'NAME': 'mydatabase',
    #     'USER': 'mydatabaseuser',
    #     'PASSWORD': 'mypassword',
    #     'HOST': '127.0.0.1',
    #     'PORT': '3306',
    #     'OPTIONS': {
    #         'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    #     }
    # }
}


# ==================== 密码验证 ====================
# AUTH_PASSWORD_VALIDATORS 配置密码验证器
# 用于确保用户设置的密码足够安全
# 参考：https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        # 用户属性相似度验证器
        # 检查密码是否与用户属性（如用户名、邮箱）过于相似
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        # 最小长度验证器
        # 确保密码至少包含一定数量的字符（默认 8 个）
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,  # 可以自定义最小长度
        }
    },
    {
        # 常见密码验证器
        # 检查密码是否在常见密码列表中（如 "password", "123456"）
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        # 纯数字密码验证器
        # 防止密码全部由数字组成
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==================== 国际化和本地化 ====================
# 参考：https://docs.djangoproject.com/en/6.0/topics/i18n/

# LANGUAGE_CODE 设置语言代码
# 'zh-hans' 表示简体中文，'en-us' 表示美式英语
LANGUAGE_CODE = 'zh-hans'

# TIME_ZONE 设置时区
# 'Asia/Shanghai' 表示中国上海时区（东八区）
# 'UTC' 表示协调世界时
TIME_ZONE = 'Asia/Shanghai'

# USE_I18N (Internationalization) 启用国际化支持
# True 表示启用 Django 的翻译系统
USE_I18N = True

# USE_TZ (Time Zone) 启用时区支持
# True 表示在数据库中存储 UTC 时间，在模板中显示本地时间
USE_TZ = True


# ==================== 静态文件配置 ====================
# 参考：https://docs.djangoproject.com/en/6.0/howto/static-files/

# STATIC_URL 定义静态文件的 URL 前缀
# 在模板中使用 {% static 'path/to/file' %} 时会自动加上这个前缀
STATIC_URL = '/static/'

# STATICFILES_DIRS 定义额外的静态文件目录
# 用于存放项目级别的静态文件（不属于任何特定应用）
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# STATIC_ROOT 定义收集静态文件的目标目录
# 运行 collectstatic 命令时，所有静态文件会被复制到这个目录
# 生产环境中，Web 服务器（如 Nginx）会直接从这个目录提供静态文件
STATIC_ROOT = BASE_DIR / 'staticfiles'


# ==================== 媒体文件配置 ====================
# 媒体文件是用户上传的文件（如头像、图片、文档等）

# MEDIA_URL 定义媒体文件的 URL 前缀
MEDIA_URL = '/media/'

# MEDIA_ROOT 定义媒体文件的存储目录
MEDIA_ROOT = BASE_DIR / 'media'


# ==================== 默认主键字段类型 ====================
# DEFAULT_AUTO_FIELD 指定模型的默认主键字段类型
# 'BigAutoField' 使用 64 位整数作为主键，可以存储更大的 ID 值
# Django 6.0 的默认设置
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==================== 认证配置 ====================
# 自定义用户模型（如果使用 users 应用的自定义用户模型）
# AUTH_USER_MODEL = 'users.CustomUser'

# 登录后的重定向 URL
LOGIN_REDIRECT_URL = '/'

# 退出登录后的重定向 URL
LOGOUT_REDIRECT_URL = '/'

# 登录页面的 URL
LOGIN_URL = '/users/login/'


# ==================== 缓存配置 ====================
# 参考：https://docs.djangoproject.com/en/6.0/topics/cache/
# 开发环境使用本地内存缓存
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# 生产环境推荐使用 Redis 或 Memcached：
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.redis.RedisCache',
#         'LOCATION': 'redis://127.0.0.1:6379/1',
#     }
# }


# ==================== 会话配置 ====================
# SESSION_ENGINE 定义会话存储引擎
# 默认使用数据库存储会话，也可以使用缓存或文件系统
# SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# 会话 cookie 的有效期（秒）
SESSION_COOKIE_AGE = 1209600  # 2周

# 关闭浏览器时是否删除会话 cookie
SESSION_EXPIRE_AT_BROWSER_CLOSE = False


# ==================== 日志配置 ====================
# 参考：https://docs.djangoproject.com/en/6.0/topics/logging/
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}


# ==================== 邮件配置 ====================
# 参考：https://docs.djangoproject.com/en/6.0/topics/email/
# 开发环境可以使用控制台邮件后端（邮件会打印到控制台）
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 生产环境配置示例（使用 SMTP）：
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'your-email@gmail.com'
# EMAIL_HOST_PASSWORD = 'your-password'
# DEFAULT_FROM_EMAIL = 'your-email@gmail.com'


# ==================== 安全设置（生产环境）====================
# 以下设置在生产环境中应该启用，以提高安全性

# 确保 cookie 只能通过 HTTPS 传输
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# HSTS (HTTP Strict Transport Security) 设置
# SECURE_HSTS_SECONDS = 31536000  # 1年
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# 防止浏览器猜测内容类型
# SECURE_CONTENT_TYPE_NOSNIFF = True

# 启用浏览器的 XSS 过滤器
# SECURE_BROWSER_XSS_FILTER = True

# X-Frame-Options 设置
# X_FRAME_OPTIONS = 'DENY'
