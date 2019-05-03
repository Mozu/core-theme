import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'quote-information',
  templateUrl: './quote-information.component.html',
  styleUrls: ['./quote-information.component.css']
})
export class QuoteInformationComponent implements OnInit {
  @Input('QuoteId') quoteId: string;

  constructor() { }

  ngOnInit() {
    
  }

}
