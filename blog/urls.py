"""
博客应用的 URL 配置

URL 配置定义了 URL 模式与视图函数/类之间的映射关系。
Django 使用正则表达式或路径转换器来匹配 URL。

参考文档：https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.index, name='index'),
    
    path('posts/', views.PostListView.as_view(), name='post_list'),
    
    path(
        'post/<int:year>/<int:month>/<int:day>/<slug:slug>/',
        views.PostDetailView.as_view(),
        name='post_detail'
    ),
    
    path('post/create/', views.PostCreateView.as_view(), name='post_create'),
    
    path('post/<int:pk>/edit/', views.PostUpdateView.as_view(), name='post_update'),
    
    path('post/<int:pk>/delete/', views.PostDeleteView.as_view(), name='post_delete'),
    
    path('category/<slug:slug>/', views.CategoryDetailView.as_view(), name='category_detail'),
    
    path('tag/<slug:slug>/', views.TagDetailView.as_view(), name='tag_detail'),
    
    path('search/', views.search, name='search'),
    
    path('comment/add/<int:post_id>/', views.add_comment, name='add_comment'),
    
    path('comment/delete/<int:comment_id>/', views.delete_comment, name='delete_comment'),
    
    path('api/posts/', views.api_post_list, name='api_post_list'),
]
