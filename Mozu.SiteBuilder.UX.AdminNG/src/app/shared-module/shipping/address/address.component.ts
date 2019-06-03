import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'shipping-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})

export class ShippingAddressComponent implements OnChanges {
  @Input('Destinations') destinations: any;
  public destinationContact: any;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.destinationContact = changes["destinations"].currentValue;    
  }
}
