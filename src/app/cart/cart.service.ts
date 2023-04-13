import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart-item';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  totalQuantity: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  storage: Storage = localStorage;

  constructor() {
    let data = JSON.parse(this.storage.getItem('cartItems'));
    if (data != null) {
      this.cartItems = data;
      this.computeCartTotals();
    }
  }

  computeCartTotals() {
    let totalPrice: number = 0;
    let totalQuantity: number = 0;

    for (let currentItem of this.cartItems) {
      totalPrice += currentItem.unitPrice * currentItem.quantity;
      totalQuantity += currentItem.quantity;
    }
    this.totalPrice.next(totalPrice);
    this.totalQuantity.next(totalQuantity);
    this.logCartData(totalPrice, totalQuantity)
    this.persistCartItems();
  }

  addToCart(item: CartItem) {
    let existingCartItem: CartItem = null;

    if (this.cartItems.length > 0) {
      this.cartItems.forEach((temp) => {
        if (temp.id === item.id) {
          existingCartItem = temp;
          return;
        }
      })
      if (!existingCartItem || existingCartItem === undefined) {
        this.cartItems.push(item);
      }
      else {
        existingCartItem.quantity++;
      }
    }
    else
      this.cartItems.push(item);
    this.computeCartTotals();
  }

  logCartData(totalPrice, totalQuantity) {
    this.cartItems.forEach((item) => {
      console.log(item.name + " ($"+item.unitPrice+") * "+item.quantity+" = "+item.quantity * item.unitPrice);
    })
    console.log("total price: "+totalPrice)
    console.log("total quantity: "+totalQuantity)
  }

  decrementQuantity(item: CartItem) {

    console.log(item.name)
    item.quantity--;

    if (item.quantity === 0) {
      this.remove(item);
    }
    else
      this.computeCartTotals();
  }

  remove(item: CartItem) {

    let existingCartItemIndex: number = -1;

    existingCartItemIndex = this.cartItems.findIndex(tempItem => item.id === tempItem.id);
    if (existingCartItemIndex  > -1) {
        this.cartItems.splice(existingCartItemIndex, 1);
        this.computeCartTotals();
      }
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
}
