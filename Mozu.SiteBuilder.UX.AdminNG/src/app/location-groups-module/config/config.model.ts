import { SiteModel } from '../create/location.group.model';
import { FormGroup } from '@angular/forms';

export class LocationGroupConfigModel {

    sitesLst: SiteModel[];
    selectedSite: SiteModel;
    locationGroupConfigForm: FormGroup;
    LCCustomerPickupActions: any[];
    LCCustomerPickupReminders: any[];
    LCCarriers: any[];
    LCDefaultCarrier: any[];
    LCPrintReturnLabel: any[];
    LCDefaultPrinterType: any[];
    LCUPSUSShippingTypes: any[];
    LCUSPSShippingTypes: any[];
    LCUPSInternationalShippingTypes: any[];
    LCUPSCanadaShippingTypes: any[];
    LCFedExShippingType: any[];
    LCCanadaPostShippingType: any[];
    subscriptions: any[];
    lgConfigModel: LocationGroupConfigurationModel;
    packageSettingUnitTypes: any[];
    carrierAccountModel: CarrierAccountModel;
    uspsCarrierAccountList: SelectedCarrierAccountModel[];
    uspsAccountTotalCount: number
    selectedUSPSCarrier: SelectedCarrierAccountModel;
    uspsCarrierAccount: any;
    uspsCarrierAccountPagination: PagniatedNgSelectPageConfiguration;
}



export interface CarrierModel {
    carrierType: string;
    isEnabled: boolean;
    shippingMethodMappings: ShippingMethodMappings;
}

export interface ShippingMethodMappings {
    shippingMethods: string[];
    returnLabelShippingMethod: string;
    standardDefault: string;
    express1DayDefault: string;
    express2DayDefault: string;
    express3DayDefault: string;
    enableSmartPost: boolean;
}

export interface AuditInfoModel {
    updateDate: Date;
    createDate: Date;
    updateBy: string;
    createBy: string;
}

export interface BoxType {
    name: string;
    height: string;
    width: string;
    length: string;
}

export interface LocationGroupConfigurationModel {
    tenantId: number;
    siteId: number;
    locationGroupId: number;
    locationGroupCode: string;
    customerFailedToPickupAfterAction: string;
    customerFailedToPickupDeadline: number;
    sendCustomerPickupReminder: number;
    enableForSTH: boolean;
    enableForISPU: boolean;
    enableAdvancedOptionForPickWaveCreation: boolean;
    maximumNumberOfOrdersInPickWave: number;
    defaultNumberOfOrdersInPickWave: number;
    pickWavePrintFormat: string;
    closePickWavePermissions: string[];
    wmsEnabled: boolean;
    enableScanningOfUpcForShipToHome: boolean;
    allowReturns: boolean;
    returnRefundReduction: boolean;
    defaultReturnRefundReductionAmount: number;
    maximumReturnRefundReductionAmount: number;
    defaultCarrier: string;
    defaultPrinterType: string;
    carriers: CarrierModel[];
    printReturnLabel: boolean;
    boxTypes: BoxType[];
    attributes: any[];
    auditInfo: AuditInfoModel;
    autoPackingListPopup: boolean;
    blockPartialStock: boolean;
    defaultMaxNumberOfShipmentsInPickWave: number;
    displayProductImagesInPickWaveDetails: boolean;
    enablePnpForSTH: boolean;
    enablePnpForBOPIS: boolean;
    blockPartialCancel: boolean;
    packageSettings: PackageSettings;
    bpmConfigurations: BPMConfiguration[];
}


export interface Settings {
    aesitn: string;
    apipassword?: any;
    apiusername: string;
    appid: string;
    licensekey: string;
    shippernumber: string;
    accountnumber: string;
    meternumber: string;
    pickuptype: string;
}

export interface CarrierSettingsModel {
    id: string;
    settings: Settings;
    isConfigured: boolean;
    enabled: boolean;
    enabledForReturns: boolean;
    areCredentialsSet: boolean;
}

export interface CarrierShippingType {
    code: string;
    name: string;
    isProvider: boolean;
    rateProvider: string;
    isActive: boolean;
    isInternational: boolean;
    sequence: number;
    isConfigured: boolean;
}

export interface PackageSettings {
    unitType: string;
}

export interface BPMConfiguration {
    shipmentType: string;
    workflowContainerId: string;
    workflowProcessId: string;
}

export interface CarrierAccountModel {
    carrierId: string,
    locationGroupCode: string,
    siteId: number,
    credentialSet: CarrierAccountSetModel
}

export interface CarrierAccountSetModel {
    carrierId: string,
    code: string,
    name: string,
    values: any
}

export interface PagniatedNgSelectPageConfiguration {
    startIndex: number;
    pageSize: number;
    query: string;
    isMultiSelect: boolean;
    placeholder: string;
    totalRecordCount: number;
    id: string;
}

export interface SelectedCarrierAccountModel {
    label: string;
    data: string;
}
