import { CartItem } from './../cart/cart-item';
export class OrderItem {
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  productId: string;

  constructor(cartItem: CartItem) {
    this.imageUrl = cartItem.imageUrl;
    this.quantity = cartItem.quantity;
    this.unitPrice = cartItem.unitPrice;
    this.productId = cartItem.id;
  }
  OrderItemDetails(): string {
    return ("imageUrl"+this.imageUrl+"\nunitPrice: "+this.unitPrice+"\nquantity: "+this.quantity+"\nproductId: "+this.productId);
  }
}
