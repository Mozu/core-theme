import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'quote-information',
  templateUrl: './quote-information.component.html',
  styleUrls: ['./quote-information.component.css']
})
export class QuoteInformationComponent implements OnInit {
  @Input('QuoteId') quoteId: string;
  @Input('QuoteItem') quoteItem: any;
  value: Date;

  constructor() { }

  ngOnInit() {
    this.value = new Date();
  }

}
