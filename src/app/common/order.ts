export class Order {
  totalQuantity: number;
  totalPrice: number;
  OrderDetails(): string {
    return ("totalQuantity: "+this.totalQuantity+"\ntotalPrice: "+this.totalPrice);
  }
}
