import { FormControl, ValidationErrors } from '@angular/forms';
export class CheckoutValidator {
  static notOnlyWhitespace(control: FormControl) : ValidationErrors {

    if(control.value && control.value.length > 0 && (control.value.trim().length === 0)) {
      return {'notOnlyWhitespace': true}
    }
    return null;
  }
}
