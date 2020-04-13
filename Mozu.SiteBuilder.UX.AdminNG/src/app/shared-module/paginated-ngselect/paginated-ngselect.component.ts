import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { LoggerService } from '@core';
import * as _ from 'lodash';
import { ngSelectPaginatorModel, PagingConfiguration, Item } from '../paginated-ngselect/paginated-ngselect.model';


@Component({
    selector: 'paginated-ngselect',
    templateUrl: './paginated-ngselect.component.html',
    providers: []
})
export class PaginatedNgSelectComponent implements OnInit, OnChanges {
    @Output() ngSelectPaginatorPageIndexChanged = new EventEmitter<PagingConfiguration>();
    @Output() ngSelectPaginatorSelectionChanged = new EventEmitter<Item>();
    @Input() items: Item[];
    @Input() selectedValue: Item;
    @Input() pageConfig:  PagingConfiguration;
    public model : ngSelectPaginatorModel   

    constructor(private _loggerService: LoggerService) {
        
    }

    ngOnInit() {
        this.model = new ngSelectPaginatorModel();
    }

    ngOnChanges(changes: SimpleChanges) {
        this._loggerService.info('PaginatedNgSelectComponent : ngOnChanges');
        if (changes.selectedValue && changes.selectedValue.currentValue && changes.items && changes.items.currentValue) {
            const result = changes.items.currentValue.filter(a => a.data == changes.selectedValue.currentValue.data);
            if (result.length === 0) {
                changes.items.currentValue.push({
                    data: changes.selectedValue.currentValue.data,
                    label: changes.selectedValue.currentValue.label
                }) 
            }
            this.model.selectedValue = changes.selectedValue.currentValue.data;
        }
    }

    onSearch(event) {
        this.debounceSearch(event)
    }
    pageIndexChanged(event) {
        this.ngSelectOnChangeEvents(event)
    }

    selectedValueChanged(event) {
        this.ngSelectOnChangeEvents(event)
    }

    private debounceSearch = _.debounce((param) => this.ngSelectOnChangeEvents(param), 1000)

    private ngSelectOnChangeEvents(event) {
        this.model.pageConfig = {} as PagingConfiguration;

        if (event && event.hasOwnProperty('first') && event.hasOwnProperty('rows')) {
            this.model.pageConfig.startIndex = event.first;
            this.model.pageConfig.pageSize = event.rows;
            this.model.pageConfig.query = this.pageConfig.query;
        } else {
            this.model.pageConfig.startIndex = this.pageConfig.startIndex;
            this.model.pageConfig.pageSize = this.pageConfig.pageSize;
            if (event && event.hasOwnProperty('term'))
                this.model.pageConfig.query = event.term;
            else {
                this.model.pageConfig.query = this.pageConfig.query;
                this.ngSelectPaginatorSelectionChanged.emit(event)
            }
        }
        this.ngSelectPaginatorPageIndexChanged.emit(this.model.pageConfig);
    }

}


