import { Component,
  Input } from '@angular/core';

@Component({
  selector: 'quote-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.css']
})
export class QuoteNegotiationComponent {
  @Input('QuoteId') quoteId: string;

  constructor() { }
}
