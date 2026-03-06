import { useState } from "react";
import { X, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import Badge from "./Badge";
import Button from "./Button";
import usePaymentStore from "../stores/paymentStore";
import useInvoiceStore from "../stores/invoiceStore";

function shortId(id) {
  if (!id) return "";
  return "#" + String(id).replace(/-/g, "").slice(0, 5).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount || 0);
}

export default function InvoiceDetailPanel({ invoice, onClose }) {
  const { initializePayment, verifyPayment, loading } = usePaymentStore();
  const { fetchInvoices } = useInvoiceStore();
  const [paymentLink, setPaymentLink] = useState("");
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const isPaid = invoice.status?.toLowerCase() === "paid";

  const handleGenerateLink = async () => {
    const data = await initializePayment(invoice.id);
    if (data) {
      setPaymentLink(data.authorization_url);
      setReference(data.reference);
      toast.success("Payment link generated");
    } else {
      toast.error("Failed to generate payment link");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!reference) return;
    const data = await verifyPayment(reference);
    if (data) {
      toast.success("Payment verified!");
      fetchInvoices();
    } else {
      toast.error("Payment not confirmed yet");
    }
  };

  const client = invoice.client_detail || {};

  return (
    <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-full fixed right-0 top-0 z-20 shadow-xl overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#1A1A2E]">
          Invoice {shortId(invoice.id)}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Start Date</p>
            <p className="text-sm font-medium text-[#1A1A2E]">
              {formatDate(invoice.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Due Date</p>
            <p className="text-sm font-medium text-[#1A1A2E]">
              {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Status</p>
          <Badge status={invoice.status} />
        </div>

        {/* Client */}
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Client</p>
          <p className="text-sm font-medium text-[#1A1A2E]">
            {client.name || "—"}
          </p>
          <p className="text-xs text-[#6B7280]">{client.email || ""}</p>
        </div>

        {/* Bill details */}
        <div className="bg-[#F5F6FA] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Bill Name</span>
            <span className="font-medium text-[#1A1A2E]">
              {invoice.title || "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Type</span>
            <span className="font-medium text-[#1A1A2E]">One-Time</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Amount</span>
            <span className="font-semibold text-[#1A1A2E]">
              {formatAmount(invoice.amount)}
            </span>
          </div>
        </div>

        {/* Note */}
        {invoice.description && (
          <div>
            <p className="text-xs text-[#6B7280] mb-1">Note</p>
            <p className="text-sm text-[#1A1A2E]">{invoice.description}</p>
          </div>
        )}

        {/* Payment */}
        <div className="pt-2 border-t border-gray-100">
          {isPaid ? (
            <div className="flex items-center gap-2">
              <Badge status="paid" />
              {invoice.paid_at && (
                <span className="text-xs text-[#6B7280]">
                  {formatDate(invoice.paid_at)}
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full justify-center"
              >
                Generate Payment Link
              </Button>

              {paymentLink && (
                <>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={paymentLink}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 truncate"
                    />
                    <button
                      onClick={handleCopy}
                      className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 text-gray-500"
                    >
                      {copied ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full justify-center flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Verify Payment
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
