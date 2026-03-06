"""
Management command to seed the database with realistic demo data.

Usage:
    python manage.py seed
    python manage.py seed --email admin@devpay.com --password secret123
    python manage.py seed --flush   # wipe existing seed data first
"""
import random
import secrets
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

User = get_user_model()

CLIENTS = [
    {"name": "Starlink Ventures",    "email": "billing@starlink.io",      "phone": "08031234501"},
    {"name": "Acme Corp",            "email": "accounts@acmecorp.com",     "phone": "08031234502"},
    {"name": "BluePeak Studios",     "email": "finance@bluepeak.studio",   "phone": "08031234503"},
    {"name": "Nova Tech Ltd",        "email": "pay@novatech.ng",           "phone": "08031234504"},
    {"name": "Greenfield Agency",    "email": "hello@greenfield.co",       "phone": "08031234505"},
    {"name": "Orion Digital",        "email": "billing@oriondigital.ng",   "phone": "08031234506"},
    {"name": "Crescent Media",       "email": "accounts@crescentmedia.io", "phone": "08031234507"},
    {"name": "Apex Solutions",       "email": "finance@apexsolutions.com", "phone": "08031234508"},
    {"name": "Zephyr Labs",          "email": "billing@zephyrlabs.dev",    "phone": "08031234509"},
    {"name": "Ironclad Consulting",  "email": "pay@ironclad.consulting",   "phone": "08031234510"},
]

INVOICE_ITEMS = [
    ("Website Redesign",          "Full redesign of company website including UI/UX and development."),
    ("Logo & Brand Identity",     "Design of logo, colour palette, and brand style guide."),
    ("Mobile App Development",    "Cross-platform mobile application for iOS and Android."),
    ("SEO Audit & Optimisation",  "Comprehensive SEO audit with on-page and off-page recommendations."),
    ("Social Media Campaign",     "3-month social media content and ad campaign management."),
    ("Backend API Development",   "REST API development with authentication and third-party integrations."),
    ("UI/UX Consultation",        "Two-week UX research and wireframing engagement."),
    ("E-commerce Integration",    "Paystack and inventory integration for existing web store."),
    ("Cloud Infrastructure Setup","AWS setup including EC2, RDS, S3, and CI/CD pipeline."),
    ("Dashboard Development",     "Admin dashboard with analytics, charts, and role-based access."),
    ("Email Template Design",     "Set of 6 transactional email templates with responsive HTML."),
    ("Data Migration",            "Migration of legacy MySQL database to PostgreSQL with validation."),
    ("Content Management System", "Custom CMS build on top of existing Django backend."),
    ("Performance Optimisation",  "Profiling and optimisation of slow API endpoints and queries."),
    ("Security Audit",            "Full penetration test and vulnerability assessment report."),
]

AMOUNTS = [
    Decimal("45000.00"),
    Decimal("120000.00"),
    Decimal("250000.00"),
    Decimal("75000.00"),
    Decimal("180000.00"),
    Decimal("320000.00"),
    Decimal("60000.00"),
    Decimal("95000.00"),
    Decimal("400000.00"),
    Decimal("150000.00"),
    Decimal("210000.00"),
    Decimal("35000.00"),
    Decimal("500000.00"),
    Decimal("88000.00"),
    Decimal("275000.00"),
]


class Command(BaseCommand):
    help = "Seed the database with demo clients, invoices, and payments."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            default="demo@devpay.com",
            help="Email for the demo user (default: demo@devpay.com)",
        )
        parser.add_argument(
            "--password",
            default="Demo1234!",
            help="Password for the demo user (default: Demo1234!)",
        )
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing clients, invoices, and payments before seeding",
        )

    def handle(self, *args, **options):
        from invoices.models import Client, Invoice
        from payments.models import Payment

        if options["flush"]:
            self.stdout.write("Flushing existing seed data...")
            Payment.objects.all().delete()
            Invoice.objects.all().delete()
            Client.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing data deleted."))

        # --- Demo user ---
        email = options["email"]
        password = options["password"]
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"full_name": "Demo User", "is_active": True},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo user: {email} / {password}"))
        else:
            self.stdout.write(f"Demo user already exists: {email}")

        # --- Clients ---
        clients = []
        for data in CLIENTS:
            client, created = Client.objects.get_or_create(
                owner=user,
                email=data["email"],
                defaults={"name": data["name"], "phone": data["phone"]},
            )
            clients.append(client)
            if created:
                self.stdout.write(f"  + Client: {client.name}")

        self.stdout.write(self.style.SUCCESS(f"Clients ready: {len(clients)}"))

        # --- Invoices ---
        now = timezone.now()
        statuses_weighted = (
            ["paid"] * 10
            + ["sent"] * 6
            + ["draft"] * 4
            + ["overdue"] * 4
        )

        invoice_items = list(zip(
            [item[0] for item in INVOICE_ITEMS],
            [item[1] for item in INVOICE_ITEMS],
            AMOUNTS,
        ))
        random.shuffle(invoice_items)

        invoices_created = 0
        for i, (title, description, amount) in enumerate(invoice_items):
            client = clients[i % len(clients)]
            status = random.choice(statuses_weighted)
            days_ago = random.randint(1, 60)
            created_at_offset = now - timedelta(days=days_ago)
            due_date = (created_at_offset + timedelta(days=random.choice([14, 21, 30]))).date()

            invoice = Invoice.objects.create(
                owner=user,
                client=client,
                title=title,
                description=description,
                amount=amount,
                status=status,
                due_date=due_date,
            )
            # backdate created_at
            Invoice.objects.filter(pk=invoice.pk).update(created_at=created_at_offset)
            invoices_created += 1

            # --- Payment record for paid/sent invoices ---
            if status == "paid":
                paid_at = created_at_offset + timedelta(days=random.randint(1, 10))
                Payment.objects.create(
                    invoice=invoice,
                    paystack_reference=secrets.token_hex(16),
                    paystack_access_code=secrets.token_hex(12),
                    amount=amount,
                    status=Payment.Status.SUCCESS,
                    paid_at=paid_at,
                )
            elif status == "sent":
                Payment.objects.create(
                    invoice=invoice,
                    paystack_reference=secrets.token_hex(16),
                    paystack_access_code=secrets.token_hex(12),
                    amount=amount,
                    status=Payment.Status.PENDING,
                )

        self.stdout.write(self.style.SUCCESS(f"Invoices created: {invoices_created}"))

        # Summary
        paid_count = Invoice.objects.filter(owner=user, status="paid").count()
        total_paid = sum(
            inv.amount for inv in Invoice.objects.filter(owner=user, status="paid")
        )
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=== Seed complete ==="))
        self.stdout.write(f"  User:     {email}")
        self.stdout.write(f"  Password: {password}")
        self.stdout.write(f"  Clients:  {len(clients)}")
        self.stdout.write(f"  Invoices: {invoices_created}")
        self.stdout.write(f"  Paid:     {paid_count} invoices (total ₦{total_paid:,.2f})")
        self.stdout.write("")
        self.stdout.write("  Login at: http://localhost:8000/admin/")
        self.stdout.write("  API docs: http://localhost:8000/api/docs/")
