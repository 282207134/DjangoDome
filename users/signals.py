"""
用户应用的信号处理器

Django 信号允许在特定事件发生时执行代码。
本文件演示了如何使用信号自动创建和保存用户资料。

参考文档：https://docs.djangoproject.com/en/6.0/topics/signals/
"""

from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """
    创建用户资料信号处理器
    
    当新用户被创建时，自动创建对应的用户资料。
    这个函数会在 User 模型保存后自动调用。
    
    Args:
        sender: 发送信号的模型类（User）
        instance: 被保存的模型实例（用户对象）
        created: 布尔值，表示是否是新创建的对象
        **kwargs: 其他关键字参数
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    """
    保存用户资料信号处理器
    
    当用户被保存时，同时保存其资料。
    确保用户和资料始终保持同步。
    
    Args:
        sender: 发送信号的模型类（User）
        instance: 被保存的模型实例（用户对象）
        **kwargs: 其他关键字参数
    """
    instance.profile.save()
