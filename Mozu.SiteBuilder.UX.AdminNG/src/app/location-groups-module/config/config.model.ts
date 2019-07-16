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
    LCUPSInternationalShippingTypes: any[];
    LCUPSCanadaShippingTypes: any[];
    LCFedExShippingType: any[];
    subscriptions: any[];
}



    export interface CarrierModel {
        carrierType: string;
        isEnabled: boolean;
    }

    export interface UnitedStatesUpsSettingsModel {
        shippingMethods: string[];
        returnLabelShippingMethod: string;
        standardDefault: string;
        express1DayDefault: string;
        express2DayDefault: string;
        express3DayDefault: string;
    }

    export interface InternationalUpsSettingsModel {
        internationalUsReturnLabelShippingMethod: string;
        shippingMethods: string[];
        returnLabelShippingMethod: string;
        standardDefault: string;
        express1DayDefault: string;
        express2DayDefault: string;
        express3DayDefault: string;
    }

    export interface CanadaUpsSettingsModel {
        shippingMethods: string[];
        standardDefault: string;
        express1DayDefault: string;
        express2DayDefault: string;
        express3DayDefault: string;
        returnLabelShippingMethod: string;
    }

    export interface ShippingSettingsForUpsModel {
        unitedStatesUpsSettings: UnitedStatesUpsSettingsModel;
        internationalUpsSettings: InternationalUpsSettingsModel;
        canadaUpsSettings: CanadaUpsSettingsModel;
    }

    export interface ShippingSettingsForFedEx {
        shippingMethods: string[];
        returnLabelShippingMethod: string;
        standardDefault: string;
        express1DayDefault: string;
        express2DayDefault: string;
        express3DayDefault: string;
        enableSmartPost: boolean;
    }

    export interface ShippingSettingsForUsps {
        shippingMethods: string[];
        returnLabelShippingMethod: string;
        standardDefault: string;
        express1DayDefault: string;
        express2DayDefault: string;
        express3DayDefault: string;
    }

    export interface CanadaPostSettings {
        outboundUsername: string;
        outboundPassword: string;
        outboundCustomerNumber: string;
        outboundLocale: string;
        outboundContractID: string;
        carsPickupNotify: boolean;
        preferredPickupTime: string;
        closingTime: string;
    }

    export interface AuditInfoModel {
        updateDate: Date;
        createDate: Date;
        updateBy: string;
        createBy: string;
    }

    export interface BoxType {
        name: string;
        height: number;
        width: number;
        length: number;
    }

    export interface LocationGroupConfigurationModel {
        tenantId: number;
        siteId: number;
        locationGroupId: number;
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
        shippingSettingsForUps: ShippingSettingsForUpsModel;
        shippingSettingsForFedEx: ShippingSettingsForFedEx;
        shippingSettingsForUsps: ShippingSettingsForUsps;
        canadaPostSettings: CanadaPostSettings;
        boxTypes: BoxType[];
        attributes: any[];
        auditInfo: AuditInfoModel;
    }
