from rest_framework import serializers
from blog.models import CustomUser, Post, Comment, Tag


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'nick_name', 'employee_level']
        read_only_fields = ['id', 'username', 'nick_name', 'employee_level']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'tag_content']


class CommentSerializer(serializers.ModelSerializer):
    comment_author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'post', 'comment_author', 'comment_content']
        read_only_fields = ['id', 'comment_author']


class PostSerializer(serializers.ModelSerializer):
    post_author = UserSerializer(read_only=True)
    post_tag = TagSerializer(many=True, read_only=True)
    post_tag_ids = serializers.PrimaryKeyRelatedField(
        source='post_tag', queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )
    class Meta:
        model = Post
        fields = ['id', 'post_author', 'post_title', 'post_content', 'post_tag', 'post_tag_ids']
        read_only_fields = ['id', 'post_author']