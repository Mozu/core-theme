import { TreeNode } from 'primeng/api';
import { LocationsListModel } from '@shared';

export class  LocationGroupModel {
    locationGroupId: any;
    siteIds:any[];
    name: string;
    locationCodes : any[];
}

export class LocationGroupCreateModel {
    physicalLocation: TreeNode;
    selectedLocations: LocationsListModel[];
}