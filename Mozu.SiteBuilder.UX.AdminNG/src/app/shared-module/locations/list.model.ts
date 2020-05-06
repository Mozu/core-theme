export class  LocationsListModel {
    code: string;
    name: string;
}

export class LocationListGridModel {
    physicalLocationName: string;
    virtualLocations: LocationsListModel[];
    cols: any[];
    totalRecords: number;
    isLoading: boolean;
    inmemoryData: LocationsListModel[];
    selectedLocations: LocationsListModel[];
    stateName: string;
}
