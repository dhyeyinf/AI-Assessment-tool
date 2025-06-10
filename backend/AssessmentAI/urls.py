from django.contrib import admin
from django.urls import path, include
from assessment.views import LogoutView
#from assessment.views import DeleteUserView
from assessment.views import (
    SingleSessionTokenObtainPairView,
    SingleSessionTokenRefreshView,
    #DeleteUserView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('assessment.urls')),
    path('api/token/', SingleSessionTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', SingleSessionTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='token_logout'),
    #path('api/delete-user/', DeleteUserView.as_view(), name='delete_user'),

]
