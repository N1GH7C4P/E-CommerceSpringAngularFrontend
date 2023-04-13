import { CartService } from './../../cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../product';
import { ProductService } from './../product.service';
import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/cart/cart-item';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  private currentCategoryId: number = 1;
  private previousCategoryId: number = 1;
  private searchMode: boolean = false;

  pageNumber: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;
  previousKeyword!: string | null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
  }

  listProducts() {
      this.searchMode = this.route.snapshot.paramMap.has('keyword');

      if (this.searchMode)
        this.handleSearchProducts();
      else
        this.handleListProducts();
  }

  handleSearchProducts() {
    const keyword: string = this.route.snapshot.paramMap.get('keyword');

    if (this.previousKeyword != keyword) {
      this.pageNumber = 1;
    }

    this.previousKeyword = keyword;

    this.productService.searchProductsPaginate(this.pageNumber - 1, this.pageSize, keyword).subscribe(
     this.processResult()
    )
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products
      this.pageNumber = data.page.number + 1,
      this.pageSize = data.page.size,
      this.totalElements = data.page.totalElements
    };
  }

  handleListProducts() {

    const hasCategoryId:boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId)
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!
    else
      this.currentCategoryId = 1;
    if (this.previousCategoryId != this.currentCategoryId) {
      this.pageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    this.productService.getProductListPaginate(
      this.pageNumber - 1,
      this.pageSize,
      this.currentCategoryId).subscribe(this.processResult());
  }

  updatePageSize(size: string) {
    this.pageSize = +size;
    this.pageNumber = 1;
  }

  onAddToCart(product: Product) {

    const cartItem: CartItem = new CartItem(product);

    this.cartService.addToCart(cartItem);
  }
}
