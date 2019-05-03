import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'quotes-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class QuotesEditComponent implements OnInit {
  quoteId: string;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.quoteId = this.route.snapshot.paramMap.get("quoteId");
  }

}
