from rest_framework import serializers
from .models import Client, Invoice


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ("id", "name", "email", "phone", "created_at")
        read_only_fields = ("id", "created_at")


class InvoiceSerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source="client", read_only=True)

    class Meta:
        model = Invoice
        fields = (
            "id", "client", "client_detail", "title", "description",
            "amount", "status", "due_date", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_client(self, value):
        request = self.context["request"]
        if value.owner != request.user:
            raise serializers.ValidationError("Client does not belong to you.")
        return value
