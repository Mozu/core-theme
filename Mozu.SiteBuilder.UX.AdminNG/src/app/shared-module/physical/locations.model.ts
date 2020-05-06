import { TreeNode } from 'primeng/api';

export class PhysicalLocationsModel {
    physicalLocations: TreeNode[];
    selectedPhysicalLocNode: TreeNode;
    isLoading: boolean;
    cols: any[];
    formMode: string;
    subscriptions = [];
    selectedLoctions = [];
    selectedLoctionsDetailsArr = [];
}
