from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    nick_name = models.CharField(max_length=20, unique=True)
    class EmployeeLevel(models.TextChoices):
        INTERN = "Intern"
        JUNIOR = "Junior"
        SENIOR = "Senior"

    employee_level = models.CharField(
        max_length=6,
        choices=EmployeeLevel,
        default=EmployeeLevel.INTERN
    )

    def is_old(self):
        return self.employee_level in {self.EmployeeLevel.SENIOR}

    def __str__(self):
        return self.nick_name

class Tag(models.Model):
    tag_content = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.tag_content

class Post(models.Model):
    post_author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')
    post_title = models.CharField(max_length=200)
    post_content = models.TextField()
    post_tag = models.ManyToManyField(Tag, related_name='posts', blank=True)

    def __str__(self):
        return self.post_title

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    comment_author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    comment_content = models.TextField()

    def __str__(self):
        return self.comment_content
