from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def index(request):
    return JsonResponse({"message": "DevPay API is running."})


urlpatterns = [
    path("", index),
    path("admin/", admin.site.urls),
    # OpenAPI schema + docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # App routes
    path("api/auth/", include("users.urls")),
    path("api/", include("invoices.urls")),
    path("api/payments/", include("payments.urls")),
]
