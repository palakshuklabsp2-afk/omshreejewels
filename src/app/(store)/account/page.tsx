import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { getCustomerById, listCustomerOrders } from "@/lib/data";
import { AccountClient } from "./account-client";

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");
  const customer = await getCustomerById(session.customerId);
  if (!customer) redirect("/login");
  const orders = await listCustomerOrders(customer._id);

  return (
    <AccountClient
      customer={{
        name: customer.name || "",
        phone: customer.phone,
        address: customer.address || null,
        addressLocked: Boolean(customer.addressLocked),
      }}
      orders={orders.map((o) => ({
        id: String(o._id),
        orderNumber: o.orderNumber,
        createdAt: new Date(o.createdAt).toISOString(),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        subtotal: o.subtotal,
        remainingCod: o.remainingCod,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        address: o.address || null,
        items: o.items.map((i) => ({ name: i.name || "", qty: i.qty, price: i.price })),
      }))}
    />
  );
}
