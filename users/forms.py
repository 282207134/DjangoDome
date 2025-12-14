"""
用户应用的表单

定义用户注册、登录和资料更新的表单。

参考文档：https://docs.djangoproject.com/en/6.0/topics/forms/
"""

from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile


class UserRegisterForm(UserCreationForm):
    """
    用户注册表单
    
    继承自 Django 内置的 UserCreationForm，添加了额外的字段。
    UserCreationForm 自动处理密码的加密和验证。
    
    参考文档：https://docs.djangoproject.com/en/6.0/topics/auth/default/#django.contrib.auth.forms.UserCreationForm
    """
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': '请输入邮箱地址',
        }),
        label='邮箱'
    )
    
    class Meta:
        model = User
        
        fields = ['username', 'email', 'password1', 'password2']
        
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入用户名',
            }),
        }
        
        labels = {
            'username': '用户名',
            'password1': '密码',
            'password2': '确认密码',
        }
    
    def __init__(self, *args, **kwargs):
        """
        自定义表单初始化
        
        在初始化时为密码字段添加 CSS 类和占位符。
        """
        super().__init__(*args, **kwargs)
        
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '请输入密码',
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '请再次输入密码',
        })
        
        self.fields['password1'].label = '密码'
        self.fields['password2'].label = '确认密码'
    
    def clean_email(self):
        """
        验证邮箱是否已被注册
        
        Returns:
            清理后的邮箱地址
            
        Raises:
            ValidationError: 如果邮箱已被注册
        """
        email = self.cleaned_data.get('email')
        
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('该邮箱已被注册')
        
        return email


class UserUpdateForm(forms.ModelForm):
    """
    用户信息更新表单
    
    允许用户更新用户名和邮箱。
    """
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
        }),
        label='邮箱'
    )
    
    class Meta:
        model = User
        
        fields = ['username', 'email', 'first_name', 'last_name']
        
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
            }),
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
            }),
        }
        
        labels = {
            'username': '用户名',
            'email': '邮箱',
            'first_name': '名字',
            'last_name': '姓氏',
        }


class ProfileUpdateForm(forms.ModelForm):
    """
    用户资料更新表单
    
    允许用户更新个人资料，包括头像、简介等。
    """
    
    class Meta:
        model = Profile
        
        fields = ['bio', 'avatar', 'location', 'website', 'birth_date']
        
        widgets = {
            'bio': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': '简短介绍一下自己...',
            }),
            'avatar': forms.FileInput(attrs={
                'class': 'form-control',
            }),
            'location': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '你的所在地',
            }),
            'website': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://example.com',
            }),
            'birth_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date',
            }),
        }
        
        labels = {
            'bio': '个人简介',
            'avatar': '头像',
            'location': '所在地',
            'website': '个人网站',
            'birth_date': '出生日期',
        }
