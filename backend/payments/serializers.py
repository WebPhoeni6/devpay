from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id", "invoice", "paystack_reference", "amount",
            "status", "paid_at", "created_at",
        )
        read_only_fields = fields


class InitializePaymentSerializer(serializers.Serializer):
    invoice_id = serializers.UUIDField()
    callback_url = serializers.URLField(required=False, default="")
