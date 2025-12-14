"""
博客应用的表单

Django 表单用于处理用户输入、验证数据和渲染 HTML 表单。
本文件演示了 ModelForm 的使用。

参考文档：https://docs.djangoproject.com/en/6.0/topics/forms/
"""

from django import forms
from .models import Post, Comment


class PostForm(forms.ModelForm):
    """
    文章表单
    
    ModelForm 是基于模型自动生成表单的便捷方式。
    它会根据模型字段自动创建相应的表单字段。
    
    参考文档：https://docs.djangoproject.com/en/6.0/topics/forms/modelforms/
    """
    
    class Meta:
        model = Post
        
        fields = [
            'title',
            'slug',
            'category',
            'tags',
            'excerpt',
            'content',
            'featured_image',
            'status',
        ]
        
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入文章标题',
            }),
            
            'slug': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入 URL 别名（如：my-first-post）',
            }),
            
            'category': forms.Select(attrs={
                'class': 'form-control',
            }),
            
            'tags': forms.SelectMultiple(attrs={
                'class': 'form-control',
            }),
            
            'excerpt': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': '请输入文章摘要（可选）',
            }),
            
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 10,
                'placeholder': '请输入文章内容',
            }),
            
            'featured_image': forms.FileInput(attrs={
                'class': 'form-control',
            }),
            
            'status': forms.Select(attrs={
                'class': 'form-control',
            }),
        }
        
        labels = {
            'title': '标题',
            'slug': 'URL 别名',
            'category': '分类',
            'tags': '标签',
            'excerpt': '摘要',
            'content': '内容',
            'featured_image': '特色图片',
            'status': '状态',
        }
        
        help_texts = {
            'slug': '用于生成文章 URL 的简短标签，只能包含字母、数字、下划线或连字符',
            'tags': '按住 Ctrl 或 Cmd 键可以选择多个标签',
        }
    
    def clean_slug(self):
        """
        自定义 slug 字段的验证
        
        clean_<fieldname> 方法用于对特定字段进行额外的验证。
        这个方法会在表单验证时自动调用。
        
        Returns:
            清理后的 slug 值
            
        Raises:
            ValidationError: 如果 slug 验证失败
        """
        slug = self.cleaned_data['slug']
        
        if not slug.replace('-', '').replace('_', '').isalnum():
            raise forms.ValidationError(
                'URL 别名只能包含字母、数字、下划线或连字符'
            )
        
        return slug
    
    def clean(self):
        """
        表单级别的验证
        
        clean() 方法用于进行跨字段的验证。
        这个方法会在所有字段验证完成后调用。
        
        Returns:
            清理后的数据字典
        """
        cleaned_data = super().clean()
        title = cleaned_data.get('title')
        content = cleaned_data.get('content')
        
        if title and content and title.lower() in content.lower():
            pass
        
        return cleaned_data


class CommentForm(forms.ModelForm):
    """
    评论表单
    
    用于用户发表评论。
    """
    
    class Meta:
        model = Comment
        fields = ['content']
        
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': '请输入评论内容...',
            }),
        }
        
        labels = {
            'content': '评论内容',
        }
    
    def clean_content(self):
        """
        验证评论内容
        
        确保评论内容不为空且长度合适。
        """
        content = self.cleaned_data['content']
        
        if len(content) < 5:
            raise forms.ValidationError('评论内容至少需要 5 个字符')
        
        if len(content) > 1000:
            raise forms.ValidationError('评论内容不能超过 1000 个字符')
        
        return content
