"""
Django 学习项目的 URL 配置

这是项目的根 URL 配置文件，所有 URL 路由都从这里开始。
Django 会按照 urlpatterns 列表的顺序匹配 URL。

URL 配置的三种主要方式：
1. 函数视图：直接映射到视图函数
2. 类视图：映射到类视图（需要调用 as_view() 方法）
3. 包含其他 URLconf：使用 include() 函数包含应用的 URL 配置

参考文档：https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Django 6.0 学习项目管理后台'
admin.site.site_title = 'Django 学习项目'
admin.site.index_title = '欢迎使用 Django 6.0 学习项目'

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('', include('blog.urls', namespace='blog')),
    
    path('users/', include('users.urls', namespace='users')),
    
    path('api/', include('api.urls', namespace='api')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
