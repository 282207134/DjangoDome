"""
用户应用的视图函数

处理用户认证相关的请求，包括注册、登录、个人资料管理等。

参考文档：https://docs.djangoproject.com/en/6.0/topics/auth/default/
"""

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib import messages
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm


def register(request):
    """
    用户注册视图
    
    处理用户注册表单的显示和提交。
    注册成功后自动登录用户并重定向到首页。
    
    Args:
        request: HttpRequest 对象
        
    Returns:
        HttpResponse 对象
    """
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            username = form.cleaned_data.get('username')
            messages.success(
                request,
                f'账号 {username} 创建成功！你现在可以登录了。'
            )
            
            login(request, user)
            
            return redirect('blog:index')
    else:
        form = UserRegisterForm()
    
    return render(request, 'users/register.html', {'form': form})


@login_required
def profile(request):
    """
    用户个人资料视图
    
    显示当前登录用户的个人资料。
    @login_required 装饰器确保只有登录用户才能访问。
    
    Args:
        request: HttpRequest 对象
        
    Returns:
        HttpResponse 对象
    """
    context = {
        'title': '个人资料',
        'user': request.user,
    }
    
    return render(request, 'users/profile.html', context)


@login_required
def profile_edit(request):
    """
    编辑个人资料视图
    
    允许用户更新个人信息和头像。
    使用两个表单：一个用于更新用户基本信息，一个用于更新用户资料。
    
    Args:
        request: HttpRequest 对象
        
    Returns:
        HttpResponse 对象
    """
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(
            request.POST,
            request.FILES,
            instance=request.user.profile
        )
        
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            
            messages.success(request, '你的个人资料已更新！')
            
            return redirect('users:profile')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)
    
    context = {
        'title': '编辑个人资料',
        'u_form': u_form,
        'p_form': p_form,
    }
    
    return render(request, 'users/profile_edit.html', context)
