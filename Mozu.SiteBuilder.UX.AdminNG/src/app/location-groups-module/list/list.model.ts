import { MenuItem } from 'primeng/api';

export class LocationGroupListModel {
    startIndex: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
    items: LocationGroupItem[];
    numberOfRows: number;
    selectedLocationGroup: any;
    locationGridContextMenuItem: MenuItem[];
    isLoading: boolean;
  }

  export class LocationGroupItem {
    locationGroupId: string;
    name: string;
  }
