"""
API 应用的 URL 配置

定义 RESTful API 的 URL 路由。

参考文档：https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('posts/', views.PostListAPIView.as_view(), name='post_list'),
    
    path('posts/<int:pk>/', views.PostDetailAPIView.as_view(), name='post_detail'),
    
    path('categories/', views.CategoryListAPIView.as_view(), name='category_list'),
    
    path('tags/', views.TagListAPIView.as_view(), name='tag_list'),
]
