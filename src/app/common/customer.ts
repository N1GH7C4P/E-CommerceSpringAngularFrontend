export class Customer {
  firstName: string;
  lastName: string;
  email: string;

  customerDetails(): string {
    return ("firstName: "+this.firstName+"\nlastName: "+this.lastName+"\nemail: "+this.email);
  }
}


