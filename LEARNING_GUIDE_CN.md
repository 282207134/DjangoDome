# Django 6.0 学习路线图

本指南帮助你系统地学习 Django 框架，从基础到进阶。

## 📋 学习路线概览

```
第一阶段：Django 基础（1-2周）
├── Python 基础回顾
├── Django 安装和配置
├── 理解 MTV 架构
├── URL 和视图
├── 模板系统
└── 静态文件管理

第二阶段：数据库和模型（2-3周）
├── ORM 基础
├── 模型定义
├── 数据库迁移
├── 查询API
├── 模型关系
└── 查询优化

第三阶段：表单和认证（1-2周）
├── 表单基础
├── ModelForm
├── 表单验证
├── 用户认证
├── 权限管理
└── 自定义用户模型

第四阶段：进阶功能（2-3周）
├── 管理后台定制
├── 信号系统
├── 中间件
├── 缓存
├── 会话和 Cookies
└── 文件上传

第五阶段：测试和部署（1-2周）
├── 单元测试
├── 集成测试
├── 性能优化
├── 安全最佳实践
└── 生产环境部署
```

---

## 第一阶段：Django 基础

### 学习目标
- 理解 Django 的 MTV（Model-Template-View）架构
- 掌握 URL 路由和视图函数
- 学会使用 Django 模板语言
- 了解静态文件的管理

### 学习内容

#### 1.1 Django 安装和项目创建

**理论**：
- Django 的设计哲学
- MTV vs MVC
- Django 项目结构

**实践**：
```bash
# 创建项目
django-admin startproject myproject

# 创建应用
python manage.py startapp myapp

# 运行开发服务器
python manage.py runserver
```

**练习**：
1. 创建一个新的 Django 项目
2. 创建第一个应用
3. 访问默认页面

#### 1.2 URL 和视图

**理论**：
- URL 模式匹配
- 路径转换器（path converters）
- 视图函数 vs 类视图
- HttpRequest 和 HttpResponse

**实践代码**：
```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('hello/<str:name>/', views.hello, name='hello'),
]

# views.py
from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("欢迎来到我的网站！")

def hello(request, name):
    return HttpResponse(f"你好，{name}！")
```

**练习**：
1. 创建多个 URL 路由
2. 编写不同类型的视图函数
3. 使用 URL 参数

#### 1.3 模板系统

**理论**：
- 模板语法
- 变量、标签、过滤器
- 模板继承
- 包含（include）

**实践代码**：
```html
<!-- base.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}我的网站{% endblock %}</title>
</head>
<body>
    {% block content %}{% endblock %}
</body>
</html>

<!-- index.html -->
{% extends 'base.html' %}

{% block title %}首页{% endblock %}

{% block content %}
<h1>欢迎</h1>
<ul>
{% for item in items %}
    <li>{{ item }}</li>
{% empty %}
    <li>暂无数据</li>
{% endfor %}
</ul>
{% endblock %}
```

**练习**：
1. 创建基础模板
2. 使用模板继承
3. 实践各种模板标签和过滤器

#### 1.4 静态文件

**理论**：
- 静态文件配置
- 开发环境 vs 生产环境
- collectstatic 命令

**实践**：
```python
# settings.py
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

```html
{% load static %}
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<img src="{% static 'images/logo.png' %}" alt="Logo">
```

**练习**：
1. 组织静态文件目录
2. 在模板中引用静态文件
3. 运行 collectstatic

### 阶段总结项目
创建一个简单的个人主页，包含：
- 首页
- 关于页面
- 联系页面
- 使用模板继承
- 包含 CSS 样式

---

## 第二阶段：数据库和模型

### 学习目标
- 理解 Django ORM
- 掌握模型定义和字段类型
- 学会数据库迁移
- 掌握查询 API
- 理解模型关系

### 学习内容

#### 2.1 模型基础

**理论**：
- ORM 是什么
- 模型和数据库表的对应关系
- 常用字段类型
- 字段选项

**实践代码**：
```python
# models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = '文章'
        verbose_name_plural = '文章'
    
    def __str__(self):
        return self.title
```

**练习**：
1. 定义多个模型
2. 使用不同的字段类型
3. 设置 Meta 选项

#### 2.2 数据库迁移

**理论**：
- 迁移系统的工作原理
- makemigrations vs migrate
- 迁移文件的结构

**实践**：
```bash
# 创建迁移
python manage.py makemigrations

# 查看 SQL
python manage.py sqlmigrate app_name 0001

# 应用迁移
python manage.py migrate

# 查看迁移状态
python manage.py showmigrations
```

**练习**：
1. 创建初始迁移
2. 修改模型并生成新迁移
3. 回滚迁移

#### 2.3 查询 API

**理论**：
- QuerySet 的特性
- 常用查询方法
- 查询过滤
- 排序和切片

**实践代码**：
```python
# 基本查询
Article.objects.all()                    # 获取所有
Article.objects.get(id=1)                # 获取单个
Article.objects.filter(title__icontains='Django')  # 过滤
Article.objects.exclude(status='draft')  # 排除
Article.objects.count()                  # 计数

# 排序
Article.objects.order_by('-created_at')  # 降序
Article.objects.order_by('title')        # 升序

# 切片
Article.objects.all()[:5]                # 前5个
Article.objects.all()[5:10]              # 第6-10个

# 链式调用
Article.objects.filter(
    status='published'
).order_by('-created_at')[:10]

# 聚合
from django.db.models import Count, Avg
Article.objects.aggregate(Avg('views'))
Article.objects.annotate(comment_count=Count('comments'))
```

**练习**：
1. 实践各种查询方法
2. 使用复杂的查询条件
3. 进行聚合查询

#### 2.4 模型关系

**理论**：
- 一对多（ForeignKey）
- 多对多（ManyToManyField）
- 一对一（OneToOneField）
- related_name 的使用

**实践代码**：
```python
# 一对多
class Category(models.Model):
    name = models.CharField(max_length=100)

class Post(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='posts'
    )

# 多对多
class Tag(models.Model):
    name = models.CharField(max_length=50)

class Article(models.Model):
    tags = models.ManyToManyField(Tag, related_name='articles')

# 一对一
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
```

**练习**：
1. 创建具有各种关系的模型
2. 进行关联查询
3. 使用 related_name

#### 2.5 查询优化

**理论**：
- N+1 查询问题
- select_related 和 prefetch_related
- only 和 defer
- 数据库索引

**实践代码**：
```python
# 不优化（N+1 问题）
posts = Post.objects.all()
for post in posts:
    print(post.author.name)  # 每次都查询数据库

# 使用 select_related（适用于一对多、一对一）
posts = Post.objects.select_related('author', 'category')

# 使用 prefetch_related（适用于多对多、反向外键）
posts = Post.objects.prefetch_related('tags', 'comments')

# 只获取需要的字段
posts = Post.objects.only('title', 'created_at')

# 延迟加载
posts = Post.objects.defer('content')
```

**练习**：
1. 识别 N+1 查询问题
2. 使用 select_related 优化
3. 使用 prefetch_related 优化
4. 添加数据库索引

### 阶段总结项目
创建一个博客系统的数据模型，包含：
- 用户、文章、分类、标签、评论
- 实现各种关系
- 编写查询函数
- 优化查询性能

---

## 第三阶段：表单和认证

### 学习目标
- 掌握 Django 表单系统
- 理解表单验证机制
- 实现用户认证功能
- 学习权限管理

### 学习内容

#### 3.1 表单基础

**理论**：
- Form vs ModelForm
- 字段类型和 Widget
- 表单渲染
- CSRF 保护

**实践代码**：
```python
# forms.py
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if not email.endswith('@example.com'):
            raise forms.ValidationError('请使用公司邮箱')
        return email

# views.py
def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # 处理表单数据
            name = form.cleaned_data['name']
            # ...
            return redirect('success')
    else:
        form = ContactForm()
    return render(request, 'contact.html', {'form': form})
```

**练习**：
1. 创建自定义表单
2. 实现表单验证
3. 处理表单提交

#### 3.2 ModelForm

**理论**：
- ModelForm 的优势
- Meta 类配置
- 自定义验证

**实践代码**：
```python
from django import forms
from .models import Article

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'content', 'category', 'tags']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 10}),
        }
        labels = {
            'title': '文章标题',
        }
    
    def clean_title(self):
        title = self.cleaned_data['title']
        if len(title) < 5:
            raise forms.ValidationError('标题至少需要5个字符')
        return title
```

**练习**：
1. 为模型创建 ModelForm
2. 自定义字段和 Widget
3. 实现复杂验证

#### 3.3 用户认证

**理论**：
- Django 认证系统
- User 模型
- 登录和登出
- 密码管理

**实践代码**：
```python
# views.py
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, '用户名或密码错误')
    return render(request, 'login.html')

@login_required
def profile(request):
    return render(request, 'profile.html')
```

**练习**：
1. 实现用户注册
2. 实现登录/登出
3. 保护需要认证的视图

#### 3.4 权限管理

**理论**：
- Django 权限系统
- 组和权限
- 权限检查
- 自定义权限

**实践代码**：
```python
# models.py
class Article(models.Model):
    # ...
    class Meta:
        permissions = [
            ('can_publish', '可以发布文章'),
        ]

# views.py
from django.contrib.auth.decorators import permission_required

@permission_required('blog.can_publish')
def publish_article(request, pk):
    # ...

# 在模板中检查权限
{% if perms.blog.can_publish %}
    <a href="{% url 'publish' %}">发布</a>
{% endif %}
```

**练习**：
1. 创建自定义权限
2. 使用权限装饰器
3. 在模板中检查权限

### 阶段总结项目
为博客系统添加用户功能：
- 用户注册和登录
- 发布文章表单
- 评论表单
- 权限控制

---

## 第四阶段：进阶功能

### 学习内容

#### 4.1 管理后台

**理论**：
- Django Admin 架构
- ModelAdmin 配置
- 自定义显示
- 批量操作

**实践**：参考 `blog/admin.py` 文件

**练习**：
1. 注册模型到 Admin
2. 自定义列表显示
3. 添加筛选器和搜索
4. 创建自定义操作

#### 4.2 信号

**理论**：
- Django 信号机制
- 内置信号
- 自定义信号
- 信号处理器

**实践**：参考 `users/signals.py` 文件

**练习**：
1. 使用 post_save 信号
2. 使用 pre_delete 信号
3. 创建自定义信号

#### 4.3 中间件

**理论**：
- 中间件的作用
- 中间件顺序
- 编写自定义中间件

**实践代码**：
```python
class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 请求处理之前
        print('请求开始')
        
        response = self.get_response(request)
        
        # 响应返回之前
        print('请求结束')
        
        return response
```

**练习**：
1. 创建日志中间件
2. 创建性能监控中间件
3. 理解中间件顺序

#### 4.4 缓存

**理论**：
- 缓存策略
- 缓存后端
- 视图缓存
- 模板片段缓存

**实践代码**：
```python
from django.views.decorators.cache import cache_page
from django.core.cache import cache

# 视图缓存
@cache_page(60 * 15)  # 缓存15分钟
def my_view(request):
    # ...

# 手动缓存
def get_data():
    data = cache.get('my_data')
    if data is None:
        data = expensive_operation()
        cache.set('my_data', data, 300)
    return data
```

**练习**：
1. 配置缓存后端
2. 使用视图缓存
3. 使用低级缓存 API

### 阶段总结项目
优化博客系统：
- 完善管理后台
- 添加信号处理
- 实现缓存策略
- 性能优化

---

## 第五阶段：测试和部署

### 学习内容

#### 5.1 单元测试

**理论**：
- Django 测试框架
- TestCase 类
- 测试数据库
- 断言方法

**实践代码**：
```python
from django.test import TestCase
from .models import Article

class ArticleModelTest(TestCase):
    def setUp(self):
        Article.objects.create(title='测试文章')
    
    def test_article_creation(self):
        article = Article.objects.get(title='测试文章')
        self.assertEqual(article.title, '测试文章')
    
    def test_article_str(self):
        article = Article.objects.get(title='测试文章')
        self.assertEqual(str(article), '测试文章')
```

**练习**：
1. 编写模型测试
2. 编写视图测试
3. 编写表单测试

#### 5.2 部署

**理论**：
- 生产环境配置
- Web 服务器（Nginx）
- WSGI 服务器（Gunicorn）
- 静态文件服务

**实践**：
参考 `README_CN.md` 中的部署章节

### 最终项目
部署完整的博客系统到生产环境

---

## 学习资源

### 必读
1. Django 6.0 官方文档
2. Django Girls 教程
3. Two Scoops of Django

### 推荐视频
1. Django 入门教程（B站）
2. Django 进阶课程

### 实践项目
1. 博客系统（本项目）
2. 电商网站
3. 社交网络
4. 内容管理系统

---

## 学习建议

1. **循序渐进**：不要跳跃学习，打好基础
2. **动手实践**：理论 + 实践，多写代码
3. **阅读文档**：养成查阅官方文档的习惯
4. **参与社区**：加入 Django 社区，与他人交流
5. **阅读源码**：理解 Django 内部实现
6. **做笔记**：记录学习心得和遇到的问题
7. **持续更新**：跟进 Django 新版本特性

---

## 学习检查清单

### 基础部分
- [ ] 理解 MTV 架构
- [ ] 掌握 URL 配置
- [ ] 掌握视图编写
- [ ] 熟悉模板语言
- [ ] 掌握静态文件管理

### 数据库部分
- [ ] 掌握模型定义
- [ ] 理解迁移系统
- [ ] 掌握查询 API
- [ ] 理解模型关系
- [ ] 会进行查询优化

### 表单部分
- [ ] 掌握 Form 使用
- [ ] 掌握 ModelForm 使用
- [ ] 理解表单验证
- [ ] 掌握用户认证
- [ ] 理解权限系统

### 进阶部分
- [ ] 定制管理后台
- [ ] 使用信号系统
- [ ] 编写中间件
- [ ] 使用缓存
- [ ] 编写测试

### 部署部分
- [ ] 配置生产环境
- [ ] 部署到服务器
- [ ] 配置 Web 服务器
- [ ] 处理静态文件
- [ ] 监控和维护

---

**坚持学习，你一定能掌握 Django！**
