export class Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;

  addressDetails() {
    return("street: "+this.street+"\ncity: "+this.city+"\nstate: "+this.state+"\ncountry: "+this.country+"\nzipCode: "+this.zipCode);
  }
}
