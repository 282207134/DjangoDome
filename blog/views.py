"""
博客应用的视图函数

视图是 Django MTV 架构中的核心组件，负责处理请求并返回响应。
本文件演示了各种类型的视图：函数视图、类视图、通用视图等。

参考文档：https://docs.djangoproject.com/en/6.0/topics/http/views/
"""

from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.paginator import Paginator
from django.db.models import Q, Count
from django.urls import reverse_lazy
from django.contrib import messages
from django.http import JsonResponse

from .models import Post, Category, Tag, Comment
from .forms import PostForm, CommentForm


def index(request):
    """
    首页视图（函数视图示例）
    
    这是最基本的函数视图，接收 request 对象并返回 response。
    函数视图简单直观，适合处理简单的请求。
    
    Args:
        request: HttpRequest 对象，包含请求的所有信息
        
    Returns:
        HttpResponse 对象，包含渲染后的 HTML
    """
    posts = Post.objects.filter(status='published').select_related('author', 'category')[:5]
    
    context = {
        'posts': posts,
        'title': '首页',
    }
    
    return render(request, 'blog/index.html', context)


class PostListView(ListView):
    """
    文章列表视图（类视图示例）
    
    使用 Django 的通用视图 ListView 来显示文章列表。
    类视图提供了更好的代码复用性和可扩展性。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/class-based-views/generic-display/#listview
    """
    
    model = Post
    template_name = 'blog/post_list.html'
    context_object_name = 'posts'
    paginate_by = 10
    
    def get_queryset(self):
        """
        重写 get_queryset 方法来自定义查询集
        
        这个方法返回要在列表中显示的对象集合。
        我们只显示已发布的文章，并使用 select_related 优化查询。
        """
        queryset = Post.objects.filter(
            status='published'
        ).select_related(
            'author', 'category'
        ).prefetch_related(
            'tags'
        ).order_by('-publish')
        
        return queryset
    
    def get_context_data(self, **kwargs):
        """
        重写 get_context_data 方法来添加额外的上下文数据
        
        这个方法返回传递给模板的上下文字典。
        我们可以在这里添加额外的数据。
        """
        context = super().get_context_data(**kwargs)
        context['title'] = '文章列表'
        context['categories'] = Category.objects.annotate(
            post_count=Count('posts')
        )
        context['tags'] = Tag.objects.annotate(
            post_count=Count('posts')
        )
        return context


class PostDetailView(DetailView):
    """
    文章详情视图
    
    使用 Django 的通用视图 DetailView 来显示单篇文章的详细信息。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/class-based-views/generic-display/#detailview
    """
    
    model = Post
    template_name = 'blog/post_detail.html'
    context_object_name = 'post'
    
    def get_queryset(self):
        """
        只返回已发布的文章
        """
        return Post.objects.filter(status='published')
    
    def get_object(self, queryset=None):
        """
        重写 get_object 方法来根据 URL 参数获取文章
        
        这个方法返回要显示的单个对象。
        我们根据 year, month, day, slug 来获取文章。
        """
        obj = get_object_or_404(
            Post,
            publish__year=self.kwargs['year'],
            publish__month=self.kwargs['month'],
            publish__day=self.kwargs['day'],
            slug=self.kwargs['slug'],
            status='published'
        )
        
        obj.increase_views()
        
        return obj
    
    def get_context_data(self, **kwargs):
        """
        添加评论表单和评论列表到上下文
        """
        context = super().get_context_data(**kwargs)
        context['comment_form'] = CommentForm()
        context['comments'] = self.object.comments.filter(
            is_approved=True,
            parent=None
        ).select_related('author', 'post')
        return context


class PostCreateView(LoginRequiredMixin, CreateView):
    """
    创建文章视图
    
    使用 Django 的通用视图 CreateView 来创建新文章。
    LoginRequiredMixin 确保只有登录用户才能访问这个视图。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/class-based-views/generic-editing/#createview
    """
    
    model = Post
    form_class = PostForm
    template_name = 'blog/post_form.html'
    
    def form_valid(self, form):
        """
        表单验证成功后的处理
        
        在保存表单之前，我们需要设置文章的作者为当前登录用户。
        """
        form.instance.author = self.request.user
        
        messages.success(self.request, '文章创建成功！')
        
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = '创建文章'
        return context


class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """
    更新文章视图
    
    使用 Django 的通用视图 UpdateView 来编辑文章。
    UserPassesTestMixin 确保只有文章作者才能编辑。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/class-based-views/generic-editing/#updateview
    """
    
    model = Post
    form_class = PostForm
    template_name = 'blog/post_form.html'
    
    def test_func(self):
        """
        测试当前用户是否有权限编辑这篇文章
        
        只有文章作者或管理员可以编辑文章。
        """
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff
    
    def form_valid(self, form):
        messages.success(self.request, '文章更新成功！')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = '编辑文章'
        return context


class PostDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    """
    删除文章视图
    
    使用 Django 的通用视图 DeleteView 来删除文章。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/class-based-views/generic-editing/#deleteview
    """
    
    model = Post
    template_name = 'blog/post_confirm_delete.html'
    success_url = reverse_lazy('blog:post_list')
    
    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, '文章删除成功！')
        return super().delete(request, *args, **kwargs)


class CategoryDetailView(ListView):
    """
    分类文章列表视图
    
    显示特定分类下的所有文章。
    继承自 ListView，因为我们需要显示多个对象。
    """
    
    model = Post
    template_name = 'blog/category_detail.html'
    context_object_name = 'posts'
    paginate_by = 10
    
    def get_queryset(self):
        """
        获取指定分类的所有已发布文章
        """
        self.category = get_object_or_404(Category, slug=self.kwargs['slug'])
        return Post.objects.filter(
            category=self.category,
            status='published'
        ).select_related('author', 'category')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['category'] = self.category
        context['title'] = f'分类：{self.category.name}'
        return context


class TagDetailView(ListView):
    """
    标签文章列表视图
    
    显示带有特定标签的所有文章。
    """
    
    model = Post
    template_name = 'blog/tag_detail.html'
    context_object_name = 'posts'
    paginate_by = 10
    
    def get_queryset(self):
        """
        获取带有指定标签的所有已发布文章
        """
        self.tag = get_object_or_404(Tag, slug=self.kwargs['slug'])
        return Post.objects.filter(
            tags=self.tag,
            status='published'
        ).select_related('author', 'category')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['tag'] = self.tag
        context['title'] = f'标签：{self.tag.name}'
        return context


def search(request):
    """
    搜索视图
    
    演示如何使用 Q 对象进行复杂查询。
    Q 对象可以使用 & (AND) 和 | (OR) 进行组合。
    
    参考文档：https://docs.djangoproject.com/en/6.0/topics/db/queries/#complex-lookups-with-q-objects
    """
    query = request.GET.get('q', '')
    posts = []
    
    if query:
        posts = Post.objects.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(excerpt__icontains=query),
            status='published'
        ).select_related('author', 'category').distinct()
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'posts': page_obj,
        'query': query,
        'title': f'搜索结果：{query}',
    }
    
    return render(request, 'blog/search.html', context)


@login_required
def add_comment(request, post_id):
    """
    添加评论视图
    
    这是一个处理 POST 请求的视图。
    @login_required 装饰器确保只有登录用户才能评论。
    
    参考文档：https://docs.djangoproject.com/en/6.0/topics/auth/default/#the-login-required-decorator
    """
    post = get_object_or_404(Post, id=post_id, status='published')
    
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.author = request.user
            
            parent_id = request.POST.get('parent_id')
            if parent_id:
                parent_comment = get_object_or_404(Comment, id=parent_id)
                comment.parent = parent_comment
            
            comment.save()
            messages.success(request, '评论发表成功！')
            
            return redirect(post.get_absolute_url())
    
    return redirect(post.get_absolute_url())


@login_required
def delete_comment(request, comment_id):
    """
    删除评论视图
    
    只有评论作者或管理员可以删除评论。
    """
    comment = get_object_or_404(Comment, id=comment_id)
    post = comment.post
    
    if request.user == comment.author or request.user.is_staff:
        comment.delete()
        messages.success(request, '评论删除成功！')
    else:
        messages.error(request, '你没有权限删除这条评论！')
    
    return redirect(post.get_absolute_url())


def api_post_list(request):
    """
    API 视图示例 - 返回 JSON 格式的文章列表
    
    演示如何创建简单的 API 端点。
    对于更复杂的 API，建议使用 Django REST Framework。
    
    参考文档：https://docs.djangoproject.com/en/6.0/ref/request-response/#jsonresponse-objects
    """
    posts = Post.objects.filter(status='published').values(
        'id', 'title', 'slug', 'excerpt', 'publish', 'author__username'
    )[:10]
    
    data = {
        'count': posts.count(),
        'results': list(posts)
    }
    
    return JsonResponse(data, safe=False)
