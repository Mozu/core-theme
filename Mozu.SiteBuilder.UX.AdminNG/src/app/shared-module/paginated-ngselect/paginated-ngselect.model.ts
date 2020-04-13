export class ngSelectPaginatorModel {
    selectedValue: any;
    pageConfig: PagingConfiguration;
    
}

export interface PagingConfiguration {
    startIndex: number;
    pageSize: number;
    query: string;
    isMultiSelect: boolean;
    placeholder: string;
    totalRecordCount: number;
    id: string;

}

export interface Item {
    label: string;
    data: string;

}