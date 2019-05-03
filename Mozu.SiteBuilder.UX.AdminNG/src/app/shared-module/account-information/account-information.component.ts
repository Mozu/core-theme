import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.css']
})
export class AccountInformationComponent implements OnInit {
  @Input('QuoteId') quoteId: string;
  
  constructor() { }

  ngOnInit() {
  }

}
