from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Client, Invoice
from .serializers import ClientSerializer, InvoiceSerializer


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Client.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Invoice.objects.filter(owner=self.request.user).select_related("client").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
