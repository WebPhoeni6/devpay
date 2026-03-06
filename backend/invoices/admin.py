from django.contrib import admin
from .models import Client, Invoice


class InvoiceInline(admin.TabularInline):
    model = Invoice
    extra = 0
    fields = ("title", "amount", "status", "due_date", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "owner", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "owner__email")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at")
    raw_id_fields = ("owner",)
    inlines = (InvoiceInline,)

    fieldsets = (
        ("Client Info", {"fields": ("id", "name", "email", "phone")}),
        ("Ownership", {"fields": ("owner",)}),
        ("Timestamps", {"fields": ("created_at",)}),
    )


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "owner", "amount", "status", "due_date", "created_at")
    list_filter = ("status", "due_date", "created_at")
    search_fields = ("title", "client__name", "owner__email")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")
    raw_id_fields = ("owner", "client")
    list_editable = ("status",)

    fieldsets = (
        ("Invoice Info", {"fields": ("id", "title", "description", "amount", "status", "due_date")}),
        ("Relations", {"fields": ("owner", "client")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
