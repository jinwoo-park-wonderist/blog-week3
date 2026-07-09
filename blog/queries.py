from django.shortcuts import get_object_or_404
from blog.models import Post, Comment, Tag


def get_post(post_id=None):
    qs = Post.objects.select_related("post_author").prefetch_related("post_tag")

    if post_id is None:
        return qs.order_by("-id")
    return get_object_or_404(qs, pk=post_id)

def get_posts_by_tag(tag_id):
    return Post.objects.select_related("post_author").prefetch_related("post_tag").filter(post_tag=tag_id).order_by("-id")

def get_comments_by_post(post_id):
    return Comment.objects.filter(post=post_id).select_related("comment_author").order_by("id")

def get_tag(tag_id):
    return get_object_or_404(Tag, pk=tag_id)