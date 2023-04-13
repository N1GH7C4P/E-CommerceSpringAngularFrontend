import { CartService } from './../../cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './../product.service';
import { Product } from './../product';
import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/cart/cart-item';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit{
  product!: Product;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.handleProductDetails();
    })
  }
  handleProductDetails() {
    const id: number = +this.route.snapshot.paramMap.get('id');
    this.productService.getProduct(id).subscribe(
      data => {
        this.product = data;
      }
    )
  }
  onAddToCart() {

    const cartItem: CartItem = new CartItem(this.product);

    this.cartService.addToCart(cartItem);
  }
}
