import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shipping-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})

export class ShippingAddressComponent implements OnChanges {
  @Input('Destinations') destinations: any;
  public destinationContact: any;
  public phoneNumberFormat: string;

  constructor(private _translate: TranslateService) {
    this._translate.get('SHARED.SHIPPING.Address')
    .subscribe((successResponse) => {
      this.phoneNumberFormat = successResponse.phoneNumberFormat;
    }, (errorResponse) => {
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.destinationContact = changes['destinations'].currentValue;
  }
}
