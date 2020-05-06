import * as _ from 'lodash';

export class AdvancedFilterModel {
    searchField: any;
    splittedValues: any;
    lastKey: string;
    isIconToggled = false;
    isExpirationToValid = false;
    filterModel: FilterModel;

    get populateSearchField(): string {
        const filterChildModelPrototype = Object.getPrototypeOf(this.filterModel);
        // tslint:disable-next-line: no-use-before-declare
        const propertyNames = _.concat(Object.getOwnPropertyNames(FilterModel.prototype), Object.getOwnPropertyNames(filterChildModelPrototype));

        const getters = propertyNames.filter((name) => {
            let result = Object.getOwnPropertyDescriptor(filterChildModelPrototype, name);
            if (!result) {
                // tslint:disable-next-line: no-use-before-declare
                result = Object.getOwnPropertyDescriptor(FilterModel.prototype, name);
            }
            return !!result.get;
        });

        _.forEach(getters, property => { this.searchField ? this.searchField += this.filterModel[property] : this.searchField = this.filterModel[property] });
        return this.searchField;
    }
}

export abstract class FilterModel {
    keyword = '';
    get getSearchBarkeyword(): string {
        return this.keyword ? this.keyword + ' ' : '';
    }
    public abstract resetFilterValue(): void;
}
