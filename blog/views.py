from rest_framework import viewsets, permissions
from blog import queries
from blog.models import Comment, Tag
from blog.serializers import PostSerializer, CommentSerializer, TagSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    def get_queryset(self):
        tag_id = self.request.query_params.get('tag')
        if tag_id:
            return queries.get_posts_by_tag(tag_id)
        return queries.get_post()

    def perform_create(self, serializer):
        serializer.save(post_author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    def get_queryset(self):
        post_id = self.request.query_params.get('post')
        if post_id:
            return queries.get_comments_by_post(post_id)
        return Comment.objects.select_related('comment_author').order_by('id')

    def perform_create(self, serializer):
        serializer.save(comment_author=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    queryset = Tag.objects.all()