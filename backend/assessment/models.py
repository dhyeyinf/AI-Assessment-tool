from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    active_jti = models.CharField(max_length=255, blank=True, null=True)

# Create your models here.
class Question(models.Model):
    question = models.TextField()
    function_name = models.CharField(max_length=100)
    test_cases = models.JSONField()
    role = models.CharField(max_length=50)  
    language = models.CharField(max_length=20, default='python')  

    def __str__(self):
        return f"{self.role}"


class TestAuthorization(models.Model):
    email = models.EmailField(unique=True)
    access_code = models.CharField(max_length=16, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.access_code}"
