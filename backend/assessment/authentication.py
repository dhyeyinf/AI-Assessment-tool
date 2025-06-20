# assessment/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model

User = get_user_model()

class SingleSessionJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, validated_token = result
        jti = validated_token.get('jti')

        if user.active_jti != jti:
            raise InvalidToken("Session invalid. Only one active login allowed.")
        return user, validated_token

