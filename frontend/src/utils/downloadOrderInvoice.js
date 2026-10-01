const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export async function downloadOrderInvoice(order, token) {
  const response = await fetch(`${API_URL}/orders/${encodeURIComponent(order.id)}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(response.status === 403 ? 'You cannot access this invoice.' : 'Unable to download invoice.');
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `PawMart-invoice-${order.orderNumber || order.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}