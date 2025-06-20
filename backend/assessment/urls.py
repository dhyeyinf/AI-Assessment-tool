from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssessmentViewSet, TestAuthorizationViewset

router = DefaultRouter()
router.register(r'assessment', AssessmentViewSet, basename='assessment')
router.register(r"user-detail", TestAuthorizationViewset, basename='test-authorization')


urlpatterns = [
    path('', include(router.urls)),
]
