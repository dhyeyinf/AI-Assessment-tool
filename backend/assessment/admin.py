from django.contrib import admin
from .models import Question

from django.contrib.auth import get_user_model

User = get_user_model()

admin.site.register(Question)

admin.site.register(User)
