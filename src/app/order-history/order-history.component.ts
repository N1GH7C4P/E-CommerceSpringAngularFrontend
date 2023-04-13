import { Component } from '@angular/core';
import { OrderHistory } from './order-history';
import { OrderHistoryService } from './order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {

  orderHisoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;

  constructor(private orderHistoryService: OrderHistoryService){}

  ngOnInit() {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    const email = JSON.parse(this.storage.getItem('userEmail')!);
    this.orderHistoryService.getOrderHistory(email).subscribe(
      data => {
        this.orderHisoryList = data._embedded.orders;
      }
    )
  }
}
