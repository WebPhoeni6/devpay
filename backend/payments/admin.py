from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("paystack_reference", "invoice", "amount", "status", "paid_at", "created_at")
    list_filter = ("status", "created_at", "paid_at")
    search_fields = ("paystack_reference", "invoice__title", "invoice__owner__email")
    ordering = ("-created_at",)
    readonly_fields = ("id", "paystack_reference", "paystack_access_code", "amount", "created_at", "paid_at")
    raw_id_fields = ("invoice",)

    fieldsets = (
        ("Payment Info", {"fields": ("id", "invoice", "amount", "status")}),
        ("Paystack", {"fields": ("paystack_reference", "paystack_access_code")}),
        ("Timestamps", {"fields": ("paid_at", "created_at")}),
    )

    def has_add_permission(self, request):
        # Payments are created programmatically via the API, not manually
        return False
