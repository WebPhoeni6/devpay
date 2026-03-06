from django.urls import path
from .views import InitializePaymentView, VerifyPaymentView, WebhookView

urlpatterns = [
    path("initialize/", InitializePaymentView.as_view(), name="payment-initialize"),
    path("verify/<str:reference>/", VerifyPaymentView.as_view(), name="payment-verify"),
    path("webhook/", WebhookView.as_view(), name="payment-webhook"),
]
