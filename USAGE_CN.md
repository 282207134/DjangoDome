# Django 6.0 学习项目使用指南

## 目录

1. [快速开始](#快速开始)
2. [管理后台使用](#管理后台使用)
3. [博客功能](#博客功能)
4. [用户功能](#用户功能)
5. [API 接口](#api-接口)
6. [数据库操作](#数据库操作)
7. [模板开发](#模板开发)
8. [常见操作](#常见操作)

---

## 快速开始

### 1. 创建超级用户

```bash
python manage.py createsuperuser
```

按提示输入：
- 用户名（例如：admin）
- 邮箱（例如：admin@example.com）
- 密码（至少 8 位）

### 2. 启动开发服务器

```bash
python manage.py runserver
```

访问地址：
- 前端：http://127.0.0.1:8000/
- 管理后台：http://127.0.0.1:8000/admin/

---

## 管理后台使用

### 登录管理后台

1. 访问 http://127.0.0.1:8000/admin/
2. 使用超级用户账号登录

### 管理分类

1. 点击左侧菜单的"分类"
2. 点击"增加分类"按钮
3. 填写分类信息：
   - **分类名称**：例如"技术博客"
   - **URL别名**：例如"tech"（自动从名称生成）
   - **分类描述**：可选，描述这个分类的用途
4. 点击"保存"

**示例数据**：
```
名称: 技术博客
别名: tech
描述: 关于编程和技术的文章

名称: 生活随笔
别名: life
描述: 生活感悟和日常记录
```

### 管理标签

1. 点击左侧菜单的"标签"
2. 点击"增加标签"
3. 填写标签信息（与分类类似）

**示例数据**：
```
Django, Python, Web开发, 数据库, 前端, 后端
```

### 创建文章

1. 点击左侧菜单的"文章"
2. 点击"增加文章"
3. 填写文章信息：
   - **标题**：文章标题
   - **URL别名**：自动生成，可手动修改
   - **作者**：选择作者（当前登录用户）
   - **分类**：选择一个分类
   - **标签**：可选择多个标签（按住 Ctrl/Cmd）
   - **摘要**：文章简介
   - **正文内容**：完整的文章内容
   - **特色图片**：可选，上传文章配图
   - **状态**：选择"草稿"或"已发布"
   - **发布时间**：文章的发布日期和时间
4. 点击"保存"

**快捷操作**：
- 在文章列表页面，可以使用筛选器快速查找
- 可以批量操作：选中多篇文章，选择"发布选中的文章"

### 管理评论

1. 点击左侧菜单的"评论"
2. 查看所有评论
3. 可以：
   - 批准或取消批准评论
   - 删除不当评论
   - 查看评论所属文章

---

## 博客功能

### 浏览文章列表

访问 http://127.0.0.1:8000/posts/

功能：
- 查看所有已发布的文章
- 分页显示（每页 10 篇）
- 显示文章标题、作者、分类、发布时间

### 查看文章详情

点击文章标题，进入详情页面。

URL 格式：`/post/年/月/日/slug/`
例如：http://127.0.0.1:8000/post/2024/12/14/my-first-post/

功能：
- 查看完整文章内容
- 查看评论
- 发表评论（需要登录）
- 回复评论
- 浏览次数统计

### 按分类浏览

URL 格式：`/category/分类别名/`
例如：http://127.0.0.1:8000/category/tech/

### 按标签浏览

URL 格式：`/tag/标签别名/`
例如：http://127.0.0.1:8000/tag/django/

### 搜索文章

访问 http://127.0.0.1:8000/search/?q=关键词

搜索范围：文章标题、内容、摘要

### 发表评论

1. 登录账号
2. 打开文章详情页
3. 在评论框输入内容
4. 点击"发表评论"

**回复评论**：
- 点击评论下方的"回复"按钮
- 输入回复内容

### 创建和编辑文章（前台）

**创建文章**：
1. 登录账号
2. 访问 http://127.0.0.1:8000/post/create/
3. 填写表单
4. 点击"发布"

**编辑文章**：
- 在文章详情页点击"编辑"按钮
- 只有文章作者或管理员可以编辑

**删除文章**：
- 在文章详情页点击"删除"按钮
- 确认删除

---

## 用户功能

### 用户注册

1. 访问 http://127.0.0.1:8000/users/register/
2. 填写注册表单：
   - 用户名
   - 邮箱
   - 密码
   - 确认密码
3. 点击"注册"
4. 自动登录并跳转到首页

### 用户登录

1. 访问 http://127.0.0.1:8000/users/login/
2. 输入用户名和密码
3. 点击"登录"

### 查看个人资料

访问 http://127.0.0.1:8000/users/profile/

显示：
- 用户名
- 邮箱
- 头像
- 个人简介
- 所在地
- 个人网站
- 注册时间

### 编辑个人资料

1. 访问 http://127.0.0.1:8000/users/profile/edit/
2. 更新信息：
   - 基本信息（用户名、邮箱、姓名）
   - 个人资料（简介、头像、所在地、网站、生日）
3. 点击"保存"

**头像上传**：
- 支持常见图片格式（JPG, PNG, GIF）
- 自动缩放为 300x300 像素

### 修改密码

1. 访问 http://127.0.0.1:8000/users/password-change/
2. 输入：
   - 旧密码
   - 新密码
   - 确认新密码
3. 点击"修改密码"

### 密码重置（忘记密码）

1. 访问 http://127.0.0.1:8000/users/password-reset/
2. 输入注册邮箱
3. 查收邮件（开发环境会打印到控制台）
4. 点击邮件中的链接
5. 设置新密码

### 退出登录

访问 http://127.0.0.1:8000/users/logout/ 或点击"退出"链接

---

## API 接口

所有 API 返回 JSON 格式数据。

### 获取文章列表

**请求**：
```
GET /api/posts/
```

**响应**：
```json
{
    "count": 10,
    "results": [
        {
            "id": 1,
            "title": "我的第一篇文章",
            "slug": "my-first-post",
            "author__username": "admin",
            "category__name": "技术博客",
            "excerpt": "这是文章摘要...",
            "publish": "2024-12-14T10:00:00Z",
            "views": 42
        }
    ]
}
```

### 获取文章详情

**请求**：
```
GET /api/posts/1/
```

**响应**：
```json
{
    "id": 1,
    "title": "我的第一篇文章",
    "slug": "my-first-post",
    "author": "admin",
    "category": "技术博客",
    "tags": ["Django", "Python"],
    "content": "完整的文章内容...",
    "excerpt": "文章摘要...",
    "publish": "2024-12-14T10:00:00",
    "views": 42
}
```

### 获取分类列表

**请求**：
```
GET /api/categories/
```

### 获取标签列表

**请求**：
```
GET /api/tags/
```

**测试 API**：
```bash
# 使用 curl
curl http://127.0.0.1:8000/api/posts/

# 或在浏览器中直接访问
```

---

## 数据库操作

### 使用 Django Shell

```bash
python manage.py shell
```

**导入模型**：
```python
from blog.models import Post, Category, Tag, Comment
from django.contrib.auth.models import User
```

**查询所有文章**：
```python
posts = Post.objects.all()
for post in posts:
    print(post.title)
```

**创建分类**：
```python
category = Category.objects.create(
    name='技术博客',
    slug='tech',
    description='关于技术的文章'
)
```

**创建文章**：
```python
user = User.objects.get(username='admin')
category = Category.objects.get(slug='tech')

post = Post.objects.create(
    title='Django 学习笔记',
    slug='django-notes',
    author=user,
    category=category,
    content='这是一篇关于 Django 的文章...',
    excerpt='Django 学习笔记摘要',
    status='published'
)
```

**查询过滤**：
```python
# 获取已发布的文章
published_posts = Post.objects.filter(status='published')

# 获取特定作者的文章
admin_posts = Post.objects.filter(author__username='admin')

# 获取包含特定关键词的文章
search_posts = Post.objects.filter(title__icontains='Django')

# 获取最新的 5 篇文章
latest_posts = Post.objects.order_by('-publish')[:5]
```

**关联查询**：
```python
# 获取文章及其分类
post = Post.objects.select_related('category').get(id=1)
print(post.category.name)

# 获取文章及其所有标签
post = Post.objects.prefetch_related('tags').get(id=1)
for tag in post.tags.all():
    print(tag.name)

# 获取文章的所有评论
comments = post.comments.all()
```

**更新记录**：
```python
post = Post.objects.get(id=1)
post.title = '新标题'
post.save()

# 或批量更新
Post.objects.filter(status='draft').update(status='published')
```

**删除记录**：
```python
post = Post.objects.get(id=1)
post.delete()

# 或批量删除
Post.objects.filter(status='draft').delete()
```

**聚合查询**：
```python
from django.db.models import Count, Avg

# 统计文章数量
post_count = Post.objects.count()

# 按分类统计文章数量
categories = Category.objects.annotate(post_count=Count('posts'))
for cat in categories:
    print(f'{cat.name}: {cat.post_count}篇文章')

# 计算平均浏览次数
avg_views = Post.objects.aggregate(Avg('views'))
```

---

## 模板开发

### 模板位置

- 项目级模板：`templates/`
- 应用级模板：`blog/templates/blog/`

### 基础模板结构

**base.html**（基础模板）：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}Django 学习项目{% endblock %}</title>
    {% load static %}
    <link rel="stylesheet" href="{% static 'css/style.css' %}">
</head>
<body>
    <nav>
        <!-- 导航栏 -->
    </nav>
    
    <main>
        {% block content %}
        {% endblock %}
    </main>
    
    <footer>
        <!-- 页脚 -->
    </footer>
</body>
</html>
```

**继承基础模板**：
```html
{% extends 'base.html' %}

{% block title %}文章列表{% endblock %}

{% block content %}
<h1>文章列表</h1>
{% for post in posts %}
    <article>
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
        <a href="{{ post.get_absolute_url }}">阅读更多</a>
    </article>
{% endfor %}
{% endblock %}
```

### 模板标签

**循环**：
```html
{% for post in posts %}
    <div>{{ post.title }}</div>
{% empty %}
    <p>没有文章</p>
{% endfor %}
```

**条件**：
```html
{% if user.is_authenticated %}
    <p>欢迎，{{ user.username }}！</p>
{% else %}
    <p>请登录</p>
{% endif %}
```

**包含其他模板**：
```html
{% include 'partials/header.html' %}
```

**静态文件**：
```html
{% load static %}
<img src="{% static 'images/logo.png' %}" alt="Logo">
```

**URL 反向解析**：
```html
<a href="{% url 'blog:post_list' %}">文章列表</a>
<a href="{% url 'blog:post_detail' post.id %}">文章详情</a>
```

---

## 常见操作

### 创建新应用

```bash
python manage.py startapp app_name
```

然后：
1. 在 `settings.py` 的 `INSTALLED_APPS` 中添加应用
2. 创建模型、视图、URL
3. 运行迁移

### 重置数据库

```bash
# 删除数据库文件
rm db.sqlite3

# 删除迁移文件（除了 __init__.py）
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# 重新创建数据库
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 导出数据

```bash
# 导出所有数据
python manage.py dumpdata > data.json

# 导出特定应用的数据
python manage.py dumpdata blog > blog_data.json

# 导出特定模型的数据
python manage.py dumpdata blog.Post > posts.json
```

### 导入数据

```bash
python manage.py loaddata data.json
```

### 查看项目统计

```bash
# 查看所有 URL
python manage.py show_urls

# 查看数据库表
python manage.py inspectdb

# 查看迁移状态
python manage.py showmigrations
```

### 性能优化

**使用 select_related（一对一、多对一）**：
```python
posts = Post.objects.select_related('author', 'category')
```

**使用 prefetch_related（多对多、反向外键）**：
```python
posts = Post.objects.prefetch_related('tags', 'comments')
```

**数据库索引**：
在模型的 Meta 类中添加：
```python
class Meta:
    indexes = [
        models.Index(fields=['publish']),
        models.Index(fields=['status', 'publish']),
    ]
```

**查询缓存**：
```python
from django.core.cache import cache

def get_hot_posts():
    posts = cache.get('hot_posts')
    if posts is None:
        posts = Post.objects.filter(views__gt=100)[:10]
        cache.set('hot_posts', posts, 300)  # 缓存 5 分钟
    return posts
```

---

## 下一步学习

1. **添加富文本编辑器**：集成 CKEditor 或 TinyMCE
2. **实现文章点赞功能**
3. **添加文章标签云**
4. **实现文章归档（按月份）**
5. **添加用户关注功能**
6. **实现全文搜索**（使用 Elasticsearch）
7. **添加邮件通知**
8. **实现 RESTful API**（使用 Django REST Framework）
9. **添加单元测试**
10. **部署到生产环境**

---

## 获取帮助

- Django 官方文档：https://docs.djangoproject.com/
- Stack Overflow：搜索 Django 相关问题
- Django 社区：https://forum.djangoproject.com/

**祝学习顺利！**
