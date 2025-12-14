"""
API 应用的视图

提供 RESTful API 视图，返回 JSON 格式的数据。
这是一个简单的 API 实现，用于演示基本概念。

对于更复杂的 API，建议使用 Django REST Framework。

参考文档：https://docs.djangoproject.com/en/6.0/topics/class-based-views/
"""

from django.http import JsonResponse
from django.views import View
from django.views.generic import ListView
from blog.models import Post, Category, Tag


class PostListAPIView(View):
    """
    文章列表 API 视图
    
    GET /api/posts/ - 获取所有已发布的文章列表
    
    返回格式：
    {
        "count": 10,
        "results": [
            {
                "id": 1,
                "title": "文章标题",
                "slug": "article-slug",
                "author": "作者名",
                "category": "分类名",
                "excerpt": "文章摘要",
                "publish": "2024-01-01T12:00:00Z",
                "views": 100
            },
            ...
        ]
    }
    """
    
    def get(self, request):
        """
        处理 GET 请求
        
        Args:
            request: HttpRequest 对象
            
        Returns:
            JsonResponse 对象
        """
        posts = Post.objects.filter(
            status='published'
        ).select_related('author', 'category').values(
            'id',
            'title',
            'slug',
            'author__username',
            'category__name',
            'excerpt',
            'publish',
            'views'
        )[:20]
        
        data = {
            'count': posts.count(),
            'results': list(posts)
        }
        
        return JsonResponse(data, safe=False)


class PostDetailAPIView(View):
    """
    文章详情 API 视图
    
    GET /api/posts/<id>/ - 获取指定文章的详细信息
    
    返回格式：
    {
        "id": 1,
        "title": "文章标题",
        "slug": "article-slug",
        "author": "作者名",
        "category": "分类名",
        "tags": ["标签1", "标签2"],
        "content": "文章内容",
        "excerpt": "文章摘要",
        "publish": "2024-01-01T12:00:00Z",
        "views": 100
    }
    """
    
    def get(self, request, pk):
        """
        处理 GET 请求
        
        Args:
            request: HttpRequest 对象
            pk: 文章的主键 ID
            
        Returns:
            JsonResponse 对象
        """
        try:
            post = Post.objects.select_related(
                'author', 'category'
            ).prefetch_related('tags').get(
                pk=pk,
                status='published'
            )
            
            data = {
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'author': post.author.username,
                'category': post.category.name if post.category else None,
                'tags': [tag.name for tag in post.tags.all()],
                'content': post.content,
                'excerpt': post.excerpt,
                'publish': post.publish.isoformat(),
                'views': post.views,
            }
            
            return JsonResponse(data)
            
        except Post.DoesNotExist:
            return JsonResponse(
                {'error': '文章不存在'},
                status=404
            )


class CategoryListAPIView(View):
    """
    分类列表 API 视图
    
    GET /api/categories/ - 获取所有分类及其文章数量
    """
    
    def get(self, request):
        """
        处理 GET 请求
        """
        categories = Category.objects.all().values(
            'id',
            'name',
            'slug',
            'description'
        )
        
        data = {
            'count': categories.count(),
            'results': list(categories)
        }
        
        return JsonResponse(data, safe=False)


class TagListAPIView(View):
    """
    标签列表 API 视图
    
    GET /api/tags/ - 获取所有标签
    """
    
    def get(self, request):
        """
        处理 GET 请求
        """
        tags = Tag.objects.all().values(
            'id',
            'name',
            'slug'
        )
        
        data = {
            'count': tags.count(),
            'results': list(tags)
        }
        
        return JsonResponse(data, safe=False)
