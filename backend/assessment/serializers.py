from rest_framework import serializers
from .models import Question, TestAuthorization

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class TestAuthorizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestAuthorization
        fields = '__all__'