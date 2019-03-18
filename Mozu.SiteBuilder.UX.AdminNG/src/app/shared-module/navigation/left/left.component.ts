import { 
    Component, 
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef
 } from '@angular/core';

import {MenuItem} from 'primeng/api';

@Component({
  selector: 'navigation-left',
  changeDetection : ChangeDetectionStrategy.OnPush,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class NavigationLeftComponent implements OnInit {
  items: MenuItem[];
  
  systemItems: MenuItem[];
    constructor(
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

  ngOnInit() {
    this.items = [
                    {
                        items: [
                            {label: 'Price Lists'},
                        ]
                    },
                    {
                    label: 'Marketing',
                    items: [
                        {label: 'Discounts'},
                        {label: 'Coupon Sets'},
                        {label: 'Product Ranking'},
                        {label: 'Search Synonyms'}
                    ]
                },
                {
                    label: 'Site Builder',
                    items: [
                        {label: 'Editor'},
                        {label: 'Themes'},
                        {label: 'Redirects'},
                        {label: 'Files'}
                    ]
                }, {
                label: 'Marketing',
                items: [
                    {label: 'Discounts'},
                    {label: 'Coupon Sets'},
                    {label: 'Product Ranking'},
                    {label: 'Search Synonyms'}
                ]
                },
                {
                    label: 'Site Builder',
                    items: [
                        {label: 'Editor'},
                        {label: 'Themes'},
                        {label: 'Redirects'},
                        {label: 'Files'}
                    ]
                },{
                label: 'Marketing',
                items: [
                    {label: 'Discounts'},
                    {label: 'Coupon Sets'},
                    {label: 'Product Ranking'},
                    {label: 'Search Synonyms'}
                ]
                },
                {
                label: 'Site Builder',
                items: [
                    {label: 'Editor'},
                    {label: 'Themes'},
                    {label: 'Redirects'},
                    {label: 'Files'}
                ]
                }
                ];

                this.systemItems = [
                    {
                    items: [
                        {label: 'Price Lists'},
                    ]
                },
                {
                    label: 'Site Builder',
                    items: [
                        {label: 'Editor'},
                        {label: 'Themes'},
                        {label: 'Redirects'},
                        {label: 'Files'}
                    ]
                },
                {
                    label: 'Marketing',
                    items: [
                        {label: 'Discounts'},
                        {label: 'Coupon Sets'},
                        {label: 'Product Ranking'},
                        {label: 'Search Synonyms'}
                    ]
                },
                {
                    label: 'Site Builder',
                    items: [
                        {label: 'Editor'},
                        {label: 'Themes'},
                        {label: 'Redirects'},
                        {label: 'Files'}
                    ]
                }
        ];

        this._changeDetectorRef.detectChanges();

  }

    visibleSidebar1;

}
