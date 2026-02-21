// Chennai pincodes: 600001 – 600130 (approximate)
const CHENNAI_PINCODE_START = 600001;
const CHENNAI_PINCODE_END   = 600130;

export function getDeliveryZone(pincode: string): "self_delivery" | "courier" {
  const code = parseInt(pincode, 10);
  if (code >= CHENNAI_PINCODE_START && code <= CHENNAI_PINCODE_END) {
    return "self_delivery";
  }
  return "courier";
}

export function getShippingCharge(zone: "self_delivery" | "courier"): number {
  return zone === "self_delivery" ? 40 : 100;
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  const clean = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
}
