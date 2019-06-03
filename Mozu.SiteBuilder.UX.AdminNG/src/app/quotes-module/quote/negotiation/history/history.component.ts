import { Component, OnInit } from '@angular/core';
import { Logs } from 'selenium-webdriver';

@Component({
  selector: 'quote-negotiaition-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class QuoteNegotiationHistoryComponent implements OnInit {
  historyLog = [];

  constructor() { }

  ngOnInit() {
    this.historyLog.push({"Date": Date.now(), "Event": "Pending Quote", "User": "KiboAdmin"});
    this.historyLog.push({"Date": Date.now(), "Event": "Submit Quote", "User": "KiboAdmin"});
    this.historyLog.push({"Date": Date.now(), "Event": "Accept Quote", "User": "KiboAdmin"});
    this.historyLog.push({"Date": Date.now(), "Event": "Submit Quote", "User": "KiboAdmin"});
  }

}
