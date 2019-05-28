export enum SearchedItemType {
    orders = <any>'orders',
    customers = <any>'customers',
    products = <any>'products',
    none = <any>'none'
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

export class HeaderModel {
    tenantName: string;
    loggedInUserName: string;
    loggedInUserInitials: string;
    showSearchInput: boolean;
    searchResult: SearchResults;
    selectedSearchedtem: SearchedItem;
    sites: any[];
    customerURL: string;
    productURL: string;
    ordersURL: string;
}
