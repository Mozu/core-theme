import { TreeNode } from 'primeng/api';
import { LocationsListModel } from '@shared';
import { FormGroup } from '@angular/forms';

export class  LocationGroupModel {
    locationGroupId: any;
    locationGroupCode: string;
    siteIds: any[];
    name: string;
    locationCodes: any[];
}

export class LocationGroupCreateModel {
    selectedPhysicalLocation: TreeNode;
    selectedLocations: LocationsListModel[];
    sitesLst: SiteModel[];
    menuPosition: number;
    isSticky: boolean;
    isSaving: boolean;
    locationGroupId: string;
    locationGroupCode: string;
    formMode: string;
    subscriptions: any[];
    locationGroupForm: FormGroup;
}

export class SiteModel {
    tenantId: number;
    id: number;
    name: string;
    isDeleted: boolean;
    masterCatalogId: number;
    catalogId:       number;
    isMozuRendered:  boolean;
    defaultLocaleCode: string;
    defaultCurrencyCode: string;
}
