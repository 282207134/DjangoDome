"""
博客应用的数据模型

这个文件定义了博客系统的数据模型，包括分类、标签、文章和评论。
模型是 Django ORM 的核心，用于定义数据库表结构和数据关系。

参考文档：https://docs.djangoproject.com/en/6.0/topics/db/models/
"""

from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone


class Category(models.Model):
    """
    文章分类模型
    
    用于对博客文章进行分类管理，每篇文章可以属于一个分类。
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='分类名称',
        help_text='分类的名称，必须唯一'
    )
    
    slug = models.SlugField(
        max_length=100,
        unique=True,
        verbose_name='URL别名',
        help_text='用于 URL 的简短标签，只能包含字母、数字、下划线或连字符'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='分类描述',
        help_text='分类的详细描述（可选）'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    
    class Meta:
        verbose_name = '分类'
        verbose_name_plural = '分类'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('blog:category_detail', kwargs={'slug': self.slug})


class Tag(models.Model):
    """
    文章标签模型
    
    用于给文章打标签，一篇文章可以有多个标签，一个标签可以对应多篇文章。
    这是多对多关系的典型示例。
    """
    
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='标签名称'
    )
    
    slug = models.SlugField(
        max_length=50,
        unique=True,
        verbose_name='URL别名'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    
    class Meta:
        verbose_name = '标签'
        verbose_name_plural = '标签'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('blog:tag_detail', kwargs={'slug': self.slug})


class Post(models.Model):
    """
    博客文章模型
    
    这是博客系统的核心模型，包含了文章的所有信息。
    演示了 Django 中各种字段类型和关系类型的使用。
    """
    
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
    ]
    
    title = models.CharField(
        max_length=200,
        verbose_name='文章标题',
        help_text='文章的标题，最多 200 个字符'
    )
    
    slug = models.SlugField(
        max_length=200,
        unique_for_date='publish',
        verbose_name='URL别名',
        help_text='用于生成文章的 URL'
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blog_posts',
        verbose_name='作者',
        help_text='文章的作者（外键关联到 User 模型）'
    )
    
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts',
        verbose_name='分类',
        help_text='文章所属的分类（可选）'
    )
    
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name='posts',
        verbose_name='标签',
        help_text='文章的标签（多对多关系）'
    )
    
    excerpt = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='摘要',
        help_text='文章的简短摘要（可选）'
    )
    
    content = models.TextField(
        verbose_name='正文内容',
        help_text='文章的正文内容'
    )
    
    featured_image = models.ImageField(
        upload_to='blog/images/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name='特色图片',
        help_text='文章的特色图片（可选）'
    )
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='状态',
        help_text='文章的发布状态'
    )
    
    views = models.PositiveIntegerField(
        default=0,
        verbose_name='浏览次数',
        help_text='文章的浏览次数'
    )
    
    publish = models.DateTimeField(
        default=timezone.now,
        verbose_name='发布时间',
        help_text='文章的发布时间'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )
    
    class Meta:
        verbose_name = '文章'
        verbose_name_plural = '文章'
        ordering = ['-publish']
        indexes = [
            models.Index(fields=['-publish']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('blog:post_detail', kwargs={
            'year': self.publish.year,
            'month': self.publish.month,
            'day': self.publish.day,
            'slug': self.slug
        })
    
    def increase_views(self):
        self.views += 1
        self.save(update_fields=['views'])


class Comment(models.Model):
    """
    评论模型
    
    用于存储文章的评论，支持多级评论（回复功能）。
    """
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='所属文章',
        help_text='评论所属的文章'
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blog_comments',
        verbose_name='评论者',
        help_text='发表评论的用户'
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name='父评论',
        help_text='如果是回复，则指向被回复的评论'
    )
    
    content = models.TextField(
        verbose_name='评论内容',
        help_text='评论的文本内容'
    )
    
    is_approved = models.BooleanField(
        default=True,
        verbose_name='是否通过审核',
        help_text='管理员可以审核评论'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )
    
    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]
    
    def __str__(self):
        return f'{self.author.username} 在 {self.post.title} 的评论'
