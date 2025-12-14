"""
用户应用的数据模型

扩展 Django 内置的 User 模型，添加额外的用户资料字段。

参考文档：
https://docs.djangoproject.com/en/6.0/topics/auth/customizing/
https://docs.djangoproject.com/en/6.0/topics/db/models/
"""

from django.db import models
from django.contrib.auth.models import User
from PIL import Image


class Profile(models.Model):
    """
    用户资料模型
    
    与 User 模型是一对一关系，用于存储额外的用户信息。
    这是扩展用户模型的推荐方式之一。
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name='用户',
        help_text='关联的用户账号'
    )
    
    bio = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='个人简介',
        help_text='简短的个人介绍'
    )
    
    avatar = models.ImageField(
        upload_to='avatars/',
        default='avatars/default.jpg',
        verbose_name='头像',
        help_text='用户头像图片'
    )
    
    location = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='所在地',
        help_text='用户所在城市或地区'
    )
    
    website = models.URLField(
        max_length=200,
        blank=True,
        verbose_name='个人网站',
        help_text='用户的个人网站或博客链接'
    )
    
    birth_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='出生日期'
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
        verbose_name = '用户资料'
        verbose_name_plural = '用户资料'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} 的资料'
    
    def save(self, *args, **kwargs):
        """
        重写 save 方法来处理头像图片
        
        在保存时自动调整头像图片的大小，避免上传过大的图片。
        这个方法演示了如何在模型保存时执行额外的逻辑。
        
        Args:
            *args: 位置参数
            **kwargs: 关键字参数
        """
        super().save(*args, **kwargs)
        
        if self.avatar:
            # 检查文件是否存在，避免在默认头像文件不存在时出错
            import os
            if os.path.exists(self.avatar.path):
                try:
                    img = Image.open(self.avatar.path)
                    
                    if img.height > 300 or img.width > 300:
                        output_size = (300, 300)
                        img.thumbnail(output_size)
                        img.save(self.avatar.path)
                except Exception as e:
                    # 如果图片处理失败，记录错误但不阻止保存
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f'处理头像图片时出错: {e}')
