export class TopLocationGroupsModel {
    isEditMode: boolean;
    isConfigTabVisible: boolean;
    locationGroupName: string;
    locationGroupId: string;
    locationGroupCode: string;
    locationGroupURL: string;
    locationGroupSelectedSiteId: string;
    locationGroupSiteIds: any[];
    isShowLocationGroupTabActive : boolean;
    isShowLocationGroupList : boolean;
}

export class TopLocationGroupConfigModel {
    locationGroupName: string;
    locationGroupCode: string;
    locationGroupId: string;
    locationGroupSiteIds: any[];
}
