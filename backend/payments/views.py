import json
import logging

from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from invoices.models import Invoice
from .models import Payment
from .paystack import generate_reference, initialize_transaction, verify_transaction, verify_webhook_signature
from .serializers import InitializePaymentSerializer, PaymentSerializer

logger = logging.getLogger(__name__)


class InitializePaymentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = InitializePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invoice_id = serializer.validated_data["invoice_id"]
        callback_url = serializer.validated_data.get("callback_url", "")

        try:
            invoice = Invoice.objects.get(id=invoice_id, owner=request.user)
        except Invoice.DoesNotExist:
            return Response({"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(invoice, "payment") and invoice.payment.status == Payment.Status.SUCCESS:
            return Response({"detail": "Invoice is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        reference = generate_reference()

        try:
            data = initialize_transaction(
                email=request.user.email,
                amount_naira=float(invoice.amount),
                reference=reference,
                callback_url=callback_url,
            )
        except Exception as exc:
            logger.exception("Paystack initialize failed: %s", exc)
            return Response({"detail": "Payment gateway error. Please try again."}, status=status.HTTP_502_BAD_GATEWAY)

        if not data.get("status"):
            return Response({"detail": data.get("message", "Initialization failed.")}, status=status.HTTP_400_BAD_REQUEST)

        paystack_data = data["data"]

        Payment.objects.update_or_create(
            invoice=invoice,
            defaults={
                "paystack_reference": reference,
                "paystack_access_code": paystack_data.get("access_code", ""),
                "amount": invoice.amount,
                "status": Payment.Status.PENDING,
                "paid_at": None,
            },
        )

        return Response(
            {
                "authorization_url": paystack_data["authorization_url"],
                "access_code": paystack_data.get("access_code", ""),
                "reference": reference,
            },
            status=status.HTTP_200_OK,
        )


class VerifyPaymentView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, reference):
        try:
            payment = Payment.objects.select_related("invoice").get(
                paystack_reference=reference,
                invoice__owner=request.user,
            )
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            data = verify_transaction(reference)
        except Exception as exc:
            logger.exception("Paystack verify failed: %s", exc)
            return Response({"detail": "Payment gateway error. Please try again."}, status=status.HTTP_502_BAD_GATEWAY)

        if not data.get("status"):
            return Response({"detail": data.get("message", "Verification failed.")}, status=status.HTTP_400_BAD_REQUEST)

        tx = data["data"]
        if tx["status"] == "success":
            payment.status = Payment.Status.SUCCESS
            payment.paid_at = timezone.now()
            payment.save(update_fields=["status", "paid_at"])

            invoice = payment.invoice
            invoice.status = Invoice.Status.PAID
            invoice.save(update_fields=["status"])

        return Response(PaymentSerializer(payment).data)


class WebhookView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        signature = request.headers.get("x-paystack-signature", "")
        if not verify_webhook_signature(request.body, signature):
            logger.warning("Invalid Paystack webhook signature received.")
            return Response(status=status.HTTP_200_OK)  # always 200

        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(status=status.HTTP_200_OK)

        event = payload.get("event")
        if event == "charge.success":
            tx_data = payload.get("data", {})
            reference = tx_data.get("reference")
            if reference:
                try:
                    payment = Payment.objects.select_related("invoice").get(paystack_reference=reference)
                    if payment.status != Payment.Status.SUCCESS:
                        payment.status = Payment.Status.SUCCESS
                        payment.paid_at = timezone.now()
                        payment.save(update_fields=["status", "paid_at"])

                        invoice = payment.invoice
                        invoice.status = Invoice.Status.PAID
                        invoice.save(update_fields=["status"])
                        logger.info("Webhook: invoice %s marked as paid via reference %s", invoice.id, reference)
                except Payment.DoesNotExist:
                    logger.warning("Webhook: payment with reference %s not found.", reference)

        return Response(status=status.HTTP_200_OK)
