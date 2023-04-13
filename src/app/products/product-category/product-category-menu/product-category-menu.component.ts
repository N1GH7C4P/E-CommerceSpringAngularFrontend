import { ProductService } from './../../product.service';
import { Component, OnInit } from '@angular/core';
import { ProductCategory } from '../product-category';

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css']
})
export class ProductCategoryMenuComponent implements OnInit{

    productCategories: ProductCategory[] = [];

    constructor(private productService: ProductService) {}

    ngOnInit(): void {
      this.listProductCaegories()
    }

    listProductCaegories() {
      this.productService.getProductCategories().subscribe(
        data => {
          this.productCategories = data;
        }
      )
    }
}
