import { PaymentInfo } from './../common/payment-info';
import { Customer } from './../common/customer';
import { OrderItem } from './../common/order-item';
import { CheckoutService } from './checkout.service';
import { CheckoutValidator } from './checkout.validator';
import { State } from './State';
import { Country } from './Country';
import { CheckoutFormService } from './checkoutForm.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { Router } from '@angular/router';
import { Order } from '../common/order';
import { Purchase } from '../common/purchase';
import { Address } from '../common/address';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[];
  creditCardMonths: number[];
  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] = [];
  storage: Storage = sessionStorage;

  stripe = Stripe(environment.stripePublishableKey);
  PaymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  isDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private CheckoutFormService: CheckoutFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}


  private createStandardFormControl() {
    return new FormControl('',
    [
      Validators.required,
      Validators.minLength(2),
      CheckoutValidator.notOnlyWhitespace
    ])
  }

  ngOnInit() {

    this.setupStripePaymentForm();

    this.reviewCartDetails();
    const email = JSON.parse(this.storage.getItem('userEmail'));
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName:  this.createStandardFormControl(),
        lastName: this.createStandardFormControl(),
        email: new FormControl(email,
          [
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*$')
        ])
      }),
      shippingAddress: this.formBuilder.group({
        street: this.createStandardFormControl(),
        city: this.createStandardFormControl(),
        state: new FormControl('', [ Validators.required ]),
        country: new FormControl('', [ Validators.required ]),
        zipCode: this.createStandardFormControl()
      }),
      billingAddress: this.formBuilder.group({
        street: this.createStandardFormControl(),
        city: this.createStandardFormControl(),
        state: new FormControl('', [ Validators.required ]),
        country: new FormControl('', [ Validators.required ]),
        zipCode: this.createStandardFormControl()
      }),
      creditCard: this.formBuilder.group({

      })
    })

    this.CheckoutFormService.getCountries().subscribe(
      data => { this.countries = data; }
    )
  }

  setupStripePaymentForm() {
    var elements = this.stripe.elements();
    this.cardElement = elements.create('card', {hidePostalCode: true} );
    this.cardElement.mount('#card-element');
    this.cardElement.on('change', (event: any) => {
      this.displayError = document.getElementById('card-errors');
      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });
  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(data => {
      this.totalQuantity = data;
    })
    this.cartService.totalPrice.subscribe(data => {
      this.totalPrice = data;
    })
  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    let purchase = new Purchase();
    let customer: Customer = new Customer();
    customer.firstName = this.checkoutFormGroup.controls['customer'].value.firstName;
    customer.lastName = this.checkoutFormGroup.controls['customer'].value.lastName;
    customer.email = this.checkoutFormGroup.controls['customer'].value.email;
    purchase.customer = customer;
    console.log(purchase.customer.customerDetails());

    purchase.shippingAddress = new Address();
    purchase.shippingAddress.city = this.checkoutFormGroup.controls['shippingAddress'].value.city;
    purchase.shippingAddress.zipCode = this.checkoutFormGroup.controls['shippingAddress'].value.zipCode;
    purchase.shippingAddress.street = this.checkoutFormGroup.controls['shippingAddress'].value.street;
    purchase.shippingAddress.state = this.checkoutFormGroup.controls['shippingAddress'].value.state;
    purchase.shippingAddress.country = this.checkoutFormGroup.controls['shippingAddress'].value.country;

    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: State = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = new Address();
    purchase.billingAddress.city = this.checkoutFormGroup.controls['billingAddress'].value.city;
    purchase.billingAddress.zipCode = this.checkoutFormGroup.controls['billingAddress'].value.zipCode;
    purchase.billingAddress.street = this.checkoutFormGroup.controls['billingAddress'].value.street;
    purchase.billingAddress.state = this.checkoutFormGroup.controls['billingAddress'].value.state;
    purchase.billingAddress.country = this.checkoutFormGroup.controls['billingAddress'].value.country;

    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: State = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    const cartItems = this.cartService.cartItems;

    let orderItems: OrderItem[] = cartItems.map((item) => new OrderItem(item));

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.PaymentInfo.amount = Math.round(this.totalPrice * 100);
    this.PaymentInfo.currency = "USD";
    this.PaymentInfo.receiptEmail = purchase.customer.email;
    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.PaymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingCountry.value.code
                  }
                }
              }
            }, { handleActions: false }
          ).then((result: any) => {
            if (result.error) {
              alert(`there was an error: ${result.error.message}`);
              this.isDisabled = false;
            }
            else {
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (response: any) => {
                  alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: (err: any) => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                }
              })
            }
          });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }
  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products");
  }

  OnCopyShippingAddressToBillingAddress($event) {
    console.log($event);
    if($event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value)
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset()
      this.billingStates = [];
    }
    this.billingStates = this.shippingStates;

  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear)
      startMonth = new Date().getMonth() + 1;
    else
      startMonth = 1;
    this.CheckoutFormService.getCreditCardMonths(startMonth).subscribe(
      data => { this.creditCardMonths = data; }
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    this.CheckoutFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingStates = data
        }
        else if (formGroupName === 'billingAddress')
          this.billingStates = data;
        else
          console.log("No such Form Group!");
        formGroup.get('state').setValue(data[0]);
      }
    )
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardExpirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth'); }
  get creditCardExpirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear'); }

}

