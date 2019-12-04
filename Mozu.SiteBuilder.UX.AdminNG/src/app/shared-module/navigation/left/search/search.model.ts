export enum SearchedItemType {
    orders = 'orders',
    order = 'order',
    customers = 'customers',
    customer = 'customer',
    products = 'products',
    none = 'none'
}

export class SearchedItem {
    item: any;
    type: SearchedItemType;
    isHeader: boolean;
}
export class SearchResults {
    success: boolean;
    total: number;
    items: Array<SearchedItem> = [];
}

export class NavigationSearchModel {
    searchResult: SearchResults;
    sites: any[];
    customerURL: string;
    productURL: string;
    ordersURL: string;
}
