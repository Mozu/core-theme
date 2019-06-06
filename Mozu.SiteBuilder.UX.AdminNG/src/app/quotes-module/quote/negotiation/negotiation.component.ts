import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'quote-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.css']
})
export class QuoteNegotiationComponent implements OnInit {
  @Input('QuoteId') quoteId: string;
  
  constructor() { }

  ngOnInit() {
  }
}
