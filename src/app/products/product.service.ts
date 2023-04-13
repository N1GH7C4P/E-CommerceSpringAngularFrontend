import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Product } from './product';
import { ProductCategory } from './product-category/product-category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  private baseUrl = environment.luv2shopApiUrl
  private shoppingCartProducts: Product[] = [];

  constructor(private httpClient: HttpClient) { }


  getProductList(categoryId: number): Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/products/search/findByCategoryId?id=${categoryId}`

    return this.getProducts(searchUrl);
  }

  getProductListPaginate(
    page: number,
    pageSize: number,
    categoryId: number
  ): Observable<GetResponseProducts> {

    const searchUrl = `${this.baseUrl}/products/search/findByCategoryId?id=${categoryId}&page=${page}&size=${pageSize}`

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {

    const searchUrl = `${this.baseUrl}/product-category`

    return this.httpClient.get<GetResponseProductCategories>(searchUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(keyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/products/search/findByNameContaining?name=${keyword}`;

    return this.getProducts(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  searchProductsPaginate(
    page: number,
    pageSize: number,
    keyword: string
  ): Observable<GetResponseProducts> {

    const searchUrl = `${this.baseUrl}/products/search/findByNameContaining?name=${keyword}&page=${page}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProduct(id: number): Observable<Product> {
    const searchUrl = `${this.baseUrl}/products/${id}`
    return this.httpClient.get<Product>(searchUrl)
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
