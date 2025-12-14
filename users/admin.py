"""
用户应用的管理后台配置

配置用户资料模型在管理后台的显示。

参考文档：https://docs.djangoproject.com/en/6.0/ref/contrib/admin/
"""

from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    用户资料管理界面配置
    """
    
    list_display = ['user', 'location', 'website', 'created_at']
    
    search_fields = ['user__username', 'user__email', 'bio', 'location']
    
    list_filter = ['created_at', 'location']
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('用户信息', {
            'fields': ('user',)
        }),
        ('个人资料', {
            'fields': ('bio', 'avatar', 'location', 'website', 'birth_date')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
