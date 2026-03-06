from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ClientViewSet, InvoiceViewSet

router = DefaultRouter()
router.register("clients", ClientViewSet, basename="client")
router.register("invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
]
