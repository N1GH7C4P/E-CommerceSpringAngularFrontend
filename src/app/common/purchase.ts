import { Address } from "./address";
import { Customer } from "./customer";
import { Order } from "./order";
import { OrderItem } from "./order-item";

export class Purchase {
  customer: Customer;
  shippingAddress: Address;
  billingAddress: Address;
  order: Order;
  orderItems: OrderItem[];

  PurchaseDetails(): string {
    let purchaseDetails: string =
      ("customer: \n"+this.customer.customerDetails()
      +"\nshippingAddress:\n"+this.shippingAddress.addressDetails()
      +"\nbillingAddress:\n"+this.billingAddress.addressDetails()
      +"\nOrder:\n"+this.order.OrderDetails()
      +"\nOrderItems:");

    this.orderItems.forEach((item) => {
      purchaseDetails += "\n";
      purchaseDetails += item.OrderItemDetails();
    })
    purchaseDetails += "\n";

    return purchaseDetails;
  }
}
