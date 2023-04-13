import { CartService } from './../cart.service';
import { CartItem } from 'src/app/cart/cart-item';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
      this.listCartDetails();
      console.log("len: "+this.cartItems.length)
  }

  listCartDetails(): void {
    this.cartItems = this.cartService.cartItems;
    this.cartService.totalPrice.subscribe((p) => this.totalPrice = p)
    this.cartService.totalQuantity.subscribe((q) => this.totalQuantity = q)
    this.cartService.computeCartTotals();
  }

  onIncrementQuantity(item: CartItem) {
    this.cartService.addToCart(item);
  }

  onDecrementQuantity(item: CartItem) {
    this.cartService.decrementQuantity(item);
  }

  onRemove(item: CartItem) {
    this.cartService.remove(item);
  }
}

