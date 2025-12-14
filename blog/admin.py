"""
博客应用的管理后台配置

Django Admin 是 Django 最强大的特性之一，提供了自动生成的管理界面。
通过自定义 ModelAdmin 类，可以灵活地定制管理界面的显示和行为。

参考文档：https://docs.djangoproject.com/en/6.0/ref/contrib/admin/
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Tag, Post, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    分类模型的管理界面配置
    
    @admin.register 装饰器用于注册模型到管理后台。
    这是推荐的注册方式，比 admin.site.register() 更简洁。
    """
    
    list_display = ['name', 'slug', 'post_count', 'created_at']
    
    prepopulated_fields = {'slug': ('name',)}
    
    search_fields = ['name', 'description']
    
    list_per_page = 20
    
    date_hierarchy = 'created_at'
    
    def post_count(self, obj):
        """
        自定义列 - 显示分类下的文章数量
        
        Args:
            obj: 当前行的模型实例
            
        Returns:
            文章数量
        """
        return obj.posts.count()
    
    post_count.short_description = '文章数量'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """
    标签模型的管理界面配置
    """
    
    list_display = ['name', 'slug', 'post_count', 'created_at']
    
    prepopulated_fields = {'slug': ('name',)}
    
    search_fields = ['name']
    
    list_per_page = 20
    
    def post_count(self, obj):
        return obj.posts.count()
    
    post_count.short_description = '文章数量'


class CommentInline(admin.TabularInline):
    """
    内联评论编辑器
    
    TabularInline 允许在文章编辑页面直接编辑相关的评论。
    这对于一对多关系非常有用。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/contrib/admin/#inlinemodeladmin-objects
    """
    
    model = Comment
    
    extra = 0
    
    fields = ['author', 'content', 'is_approved', 'created_at']
    
    readonly_fields = ['created_at']
    
    can_delete = True


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    文章模型的管理界面配置
    
    这是一个功能完整的管理界面示例，展示了 Django Admin 的各种强大功能。
    """
    
    list_display = [
        'title',
        'author',
        'category',
        'status_badge',
        'views',
        'publish',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'category',
        'tags',
        'publish',
        'created_at',
    ]
    
    search_fields = ['title', 'content', 'excerpt']
    
    prepopulated_fields = {'slug': ('title',)}
    
    filter_horizontal = ['tags']
    
    date_hierarchy = 'publish'
    
    ordering = ['-publish', '-created_at']
    
    list_per_page = 20
    
    readonly_fields = ['views', 'created_at', 'updated_at']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'slug', 'author')
        }),
        ('分类和标签', {
            'fields': ('category', 'tags')
        }),
        ('内容', {
            'fields': ('excerpt', 'content', 'featured_image')
        }),
        ('发布设置', {
            'fields': ('status', 'publish')
        }),
        ('统计信息', {
            'fields': ('views', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    inlines = [CommentInline]
    
    actions = ['make_published', 'make_draft']
    
    def status_badge(self, obj):
        """
        自定义列 - 显示状态徽章
        
        使用 format_html 可以安全地在管理界面中显示 HTML 内容。
        
        Args:
            obj: 文章实例
            
        Returns:
            HTML 格式的状态徽章
        """
        if obj.status == 'published':
            color = 'green'
            text = '已发布'
        else:
            color = 'orange'
            text = '草稿'
        
        return format_html(
            '<span style="background-color: {}; color: white; '
            'padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            text
        )
    
    status_badge.short_description = '状态'
    
    def make_published(self, request, queryset):
        """
        批量操作 - 发布文章
        
        自定义批量操作可以对选中的多个对象执行相同的操作。
        
        Args:
            request: HttpRequest 对象
            queryset: 选中的对象查询集
        """
        updated = queryset.update(status='published')
        self.message_user(
            request,
            f'成功发布了 {updated} 篇文章。'
        )
    
    make_published.short_description = '发布选中的文章'
    
    def make_draft(self, request, queryset):
        """
        批量操作 - 设为草稿
        """
        updated = queryset.update(status='draft')
        self.message_user(
            request,
            f'成功将 {updated} 篇文章设为草稿。'
        )
    
    make_draft.short_description = '将选中的文章设为草稿'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    评论模型的管理界面配置
    """
    
    list_display = [
        'short_content',
        'author',
        'post',
        'is_approved',
        'created_at',
    ]
    
    list_filter = ['is_approved', 'created_at']
    
    search_fields = ['content', 'author__username', 'post__title']
    
    date_hierarchy = 'created_at'
    
    readonly_fields = ['created_at', 'updated_at']
    
    list_per_page = 20
    
    actions = ['approve_comments', 'disapprove_comments']
    
    def short_content(self, obj):
        """
        自定义列 - 显示评论内容的简短版本
        
        Args:
            obj: 评论实例
            
        Returns:
            评论内容的前 50 个字符
        """
        if len(obj.content) > 50:
            return obj.content[:50] + '...'
        return obj.content
    
    short_content.short_description = '评论内容'
    
    def approve_comments(self, request, queryset):
        """
        批量操作 - 批准评论
        """
        updated = queryset.update(is_approved=True)
        self.message_user(
            request,
            f'成功批准了 {updated} 条评论。'
        )
    
    approve_comments.short_description = '批准选中的评论'
    
    def disapprove_comments(self, request, queryset):
        """
        批量操作 - 取消批准评论
        """
        updated = queryset.update(is_approved=False)
        self.message_user(
            request,
            f'成功取消批准了 {updated} 条评论。'
        )
    
    disapprove_comments.short_description = '取消批准选中的评论'
