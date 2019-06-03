import { LocationsListModel } from '@shared/locations';

export class SelectedLocationModel {
    cols: any[];
    selectedLocations: LocationsListModel[];
    virtualLocations: LocationsListModel[];
    totalRecords: number;
}