"""
用户应用配置

AppConfig 类用于配置应用的元数据和行为。

参考文档：https://docs.djangoproject.com/en/6.0/ref/applications/
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    用户应用配置类
    
    定义应用的名称和其他配置项。
    """
    
    name = 'users'
    
    default_auto_field = 'django.db.models.BigAutoField'
    
    verbose_name = '用户管理'
    
    def ready(self):
        """
        应用就绪时的回调函数
        
        在应用加载完成后自动调用，用于注册信号处理器。
        这是注册信号的推荐位置。
        """
        import users.signals
