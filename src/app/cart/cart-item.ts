import { Product } from './../products/product';
export class CartItem {
  id: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;

  constructor(p: Product) {
    this.id = p.id;
    this.name = p.name;
    this.imageUrl = p.imageUrl;
    this.unitPrice = p.unitPrice;
    this.quantity = 1;
  }
  OrderItemDetails(): string {
    return ("imageUrl"+this.imageUrl+"\nunitPrice: "+this.unitPrice+"\iquantity: "+this.quantity+"\nId: "+this.id+"\nname: "+this.name);
  }
}
