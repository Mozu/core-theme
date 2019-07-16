import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggerService, TostrService, ErrorCode, HttpError, ErroNotificationType } from '@core';
import { SharedDataService } from '@global';
import { LocationGroupConfigModel, LocationGroupConfigurationModel, CarrierModel,
         UnitedStatesUpsSettingsModel, InternationalUpsSettingsModel, CanadaUpsSettingsModel,
         ShippingSettingsForFedEx, ShippingSettingsForUsps, CanadaPostSettings } from './config.model';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Constants } from '@shared';
import { LocationGroupConfigService } from './config.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { CreateLocationGroupService } from '../create';
import { LocationGroupModel, SiteModel } from '../create/location.group.model';

@Component({
    selector: 'app-locationgroup-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.css'],
    providers: [LocationGroupConfigService, CreateLocationGroupService]
})
export class LocationGroupConfigComponent implements OnInit, OnDestroy {

    public model: LocationGroupConfigModel;
    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private fb: FormBuilder,
        private configService: LocationGroupConfigService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private _tostrService: TostrService,
        private createService: CreateLocationGroupService
    ) { }

    ngOnInit() {
        this.model = new LocationGroupConfigModel();
        this.model.subscriptions = [];
        this.model.sitesLst = [];
        this.model.LCCustomerPickupActions = Constants.LCCustomerPickupActions;
        this.model.LCCustomerPickupReminders = Constants.LCCustomerPickupReminders;
        this.model.LCCarriers = Constants.LCCarriers;
        this.model.LCDefaultCarrier = Constants.LCDefaultCarrier;
        this.model.LCPrintReturnLabel = Constants.LCPrintReturnLabel;
        this.model.LCDefaultPrinterType = Constants.LCDefaultPrinterType;
        this.model.LCUPSUSShippingTypes = Constants.LCUPSUSShippingTypes;
        this.model.LCUPSInternationalShippingTypes = Constants.LCUPSInternationalShippingTypes;
        this.model.LCUPSCanadaShippingTypes = Constants.LCUPSCanadaShippingTypes;
        this.model.LCFedExShippingType = Constants.LCFedExShippingType;

        this.model.locationGroupConfigForm = this.fb.group({
            customerFailedToPickupAfterAction: ['', []],
            customerFailedToPickupDeadline: ['', []],
            sendCustomerPickupReminder: ['', []],
            carriers: new FormArray([]),
            defaultCarrier: ['', []],
            printReturnLabel: ['', []],
            defaultPrinterType: ['', []],
            boxItems: this.fb.array([]),

            upsUsShippingTypes: new FormArray([]),
            upsUSStandardDefault:  ['', []],
            upsUSExpress1DayDefault:  ['', []],
            upsUSExpress2DayDefault:  ['', []],
            upsUSExpress3DayDefault:  ['', []],
            upsUSReturnLabelShippingTypes: ['', []],

            upsInternationalShippingTypes: new FormArray([]),
            upsInternationalStandardDefault: ['', []],
            upsInternationalExpress1DayDefault: ['', []],
            upsInternationalExpress2DayDefault: ['', []],
            upsInternationalExpress3DayDefault: ['', []],
            upsInternationalReturnLabelShippingTypes: ['', []],
            upsInternationalUSReturnLabelShippingTypes: ['', []],

            upsCanadaShippingTypes: new FormArray([]),
            upsCanadaStandardDefault: ['', []],
            upsCanadaExpress1DayDefault: ['', []],
            upsCanadaExpress2DayDefault: ['', []],
            upsCanadaExpress3DayDefault: ['', []],
            upsCanadaReturnLabelShippingTypes: ['', []],

            outboundUsername:  ['', []],
            outboundPassword:  ['', []],
            outboundCustomerNumber:  ['', []],
            outboundLocale:  ['', []],
            outboundContractID:  ['', []],
            carsPickupNotify:  ['', []],
            preferredPickupTime:  ['', []],
            closingTime:  ['', []],

            uspsShippingTypes: new FormArray([]),
            uspsStandardDefault:  ['', []],
            uspsExpress1DayDefault:  ['', []],
            uspsExpress2DayDefault:  ['', []],
            uspsExpress3DayDefault:  ['', []],
            uspsReturnLabelShippingTypes:  ['', []],

            enableSmartPost: ['', []],
            fedExShippingTypes: new FormArray([]),
            fedexStandardDefault: ['', []],
            fedexExpress1Default: ['', []],
            fedexExpress2Default: ['', []],
            fedexExpress3Default: ['', []],
            fedExReturnLabelShippingTypes: ['', []]
        });

        this.addCarriersCheckboxes();
        this.addUPSUSShippingTypesCheckboxes();
        this.addUPSInternationalShippingTypesCheckboxes();
        this.addUPSCanadaShippingTypesCheckboxes();
        this.addFedExShippingTypesCheckboxes();
        this.addUSPSShippingTypesCheckboxes();

        const locationGroupId  = this.activeRoute.snapshot.paramMap.get('id');

        this.createService.getLocationGroup(locationGroupId).subscribe(
            (response) => this.getLocationGroupSuccess(response),
            (response) => this.getLocationGroupError(response.error.message)
        );

        const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
        this.model.subscriptions.push(
            this.activeRoute.params.subscribe(routeParams => {
                this.fetchLocationGroupConfig(locationGroupId, siteId);
            })
        );
    }

    ngOnDestroy(): void {
        this.model.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    private getLocationGroupSuccess(result) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupSuccess' + JSON.stringify(result));
        if (result && result.items) {
            const lgModel: LocationGroupModel =   <LocationGroupModel>result.items;
            this.fetchSitesData(lgModel.siteIds);
        }
    }

    private getLocationGroupError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupError');
        throw new HttpError(ErrorCode.GetLocationGroupDetailFailed, ErroNotificationType.Toaster);
    }

    private addCarriersCheckboxes() {
        this.model.LCCarriers.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.carriers as FormArray).push(control);
        });
    }

    private addUPSUSShippingTypesCheckboxes() {
        this.model.LCUPSUSShippingTypes.map((o, i) => {
            const control = new FormControl(); // if first item set to true, else false
            (this.model.locationGroupConfigForm.controls.upsUsShippingTypes as FormArray).push(control);
        });
    }

    private addUPSInternationalShippingTypesCheckboxes() {
        this.model.LCUPSInternationalShippingTypes.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.upsInternationalShippingTypes as FormArray).push(control);
        });
    }

    private addUPSCanadaShippingTypesCheckboxes() {
        this.model.LCUPSCanadaShippingTypes.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.upsCanadaShippingTypes as FormArray).push(control);
        });
    }

    private addFedExShippingTypesCheckboxes() {
        this.model.LCFedExShippingType.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.fedExShippingTypes as FormArray).push(control);
        });
    }


    addBoxItem(): void {
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).push(this.createBoxItem());
    }

    removeBoxItem(rowIndex) {
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).removeAt(rowIndex);
    }

    siteListChanged() {
        const locationGroupId  = this.activeRoute.snapshot.paramMap.get('id');
        this.router.navigate([Constants.uiRoutes.locationGroupConfig + '/' + locationGroupId
                            + '/' + this.model.selectedSite.id]);
    }

    private createBoxItem(): FormGroup {
        return this.fb.group({
          name: '',
          length: '',
          width: '',
          height: ''
        });
    }

    public fetchSitesData = (siteIds: any[]) => {
        this._loggerService.info('LocationGroupConfigComponent : fetchSitesData');
        this.model.sitesLst = [];
        if (this._sharedData._sharedData.items.ctTenant.sites) {
            const sites: SiteModel[] = this._sharedData._sharedData.items.ctTenant.sites;
            if (siteIds && siteIds.length > 0) {
                for (let cnt = 0; cnt < siteIds.length; cnt++) {
                    const siteObj: SiteModel = _.find(sites, {'id': _.parseInt(siteIds[cnt])});
                    if (siteObj) {
                        this.model.sitesLst.push(siteObj);
                    }
                }
            }
        }
        const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
        this.model.selectedSite = _.find(this.model.sitesLst, { 'id': _.parseInt(siteId)});
    }

    public fetchLocationGroupConfig = (locationGroupId, siteId) => {
        this._loggerService.info('LocationGroupConfigComponent : fetchLocationGroupConfig');
        this.configService.getLocationGroupConfig(locationGroupId, siteId).subscribe(response =>
            this.getLocationGroupConfigSuccess(response),
            (response) => this.getLocationGroupConfigError(response.error.message));
    }

    private getLocationGroupConfigSuccess(result) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigSuccess' + JSON.stringify(result));
        const lgConfigModel: LocationGroupConfigurationModel =   <LocationGroupConfigurationModel>result;
        this.resetLocationGroupConfigForm();
        this.updateLocationGroupConfigForm(lgConfigModel);
    }

    private getLocationGroupConfigError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigError');
        this._tostrService.showError(errmsg);
    }

    private resetLocationGroupConfigForm(): void {
        this.model.locationGroupConfigForm.reset();
        this.model.locationGroupConfigForm.controls.boxItems = new FormArray([]);
    }

    private updateLocationGroupConfigForm(lgConfigModel: LocationGroupConfigurationModel): void {

        // create box Types controllers before assign the value
        if (lgConfigModel && lgConfigModel.boxTypes && lgConfigModel.boxTypes.length > 0) {
            lgConfigModel.boxTypes.map(function(value, index) {
                this.addBoxItem();
            }, this);
        }

        let unitedStatesUpsSettings: UnitedStatesUpsSettingsModel;
        if ( lgConfigModel && lgConfigModel.shippingSettingsForUps && lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings) {
            unitedStatesUpsSettings = lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings;
        }

        let internationalUpsSettings: InternationalUpsSettingsModel;
        if ( lgConfigModel && lgConfigModel.shippingSettingsForUps && lgConfigModel.shippingSettingsForUps.internationalUpsSettings) {
            internationalUpsSettings = lgConfigModel.shippingSettingsForUps.internationalUpsSettings;
        }

        let canadaUpsSettings: CanadaUpsSettingsModel;
        if ( lgConfigModel && lgConfigModel.shippingSettingsForUps && lgConfigModel.shippingSettingsForUps.canadaUpsSettings) {
            canadaUpsSettings = lgConfigModel.shippingSettingsForUps.canadaUpsSettings;
        }

        let shippingSettingsForFedEx: ShippingSettingsForFedEx;
        if ( lgConfigModel && lgConfigModel.shippingSettingsForFedEx ) {
            shippingSettingsForFedEx = lgConfigModel.shippingSettingsForFedEx;
        }

        let shippingSettingsForUsps: ShippingSettingsForUsps;
        if ( lgConfigModel && lgConfigModel.shippingSettingsForUsps ) {
            shippingSettingsForUsps = lgConfigModel.shippingSettingsForUsps;
        }

        let canadaPostSettings: CanadaPostSettings;
        if ( lgConfigModel && lgConfigModel.canadaPostSettings ) {
            canadaPostSettings = lgConfigModel.canadaPostSettings;
        }


        if (lgConfigModel) {
            this.model.locationGroupConfigForm.patchValue({
                // ISPU
                customerFailedToPickupAfterAction: lgConfigModel.customerFailedToPickupAfterAction,
                customerFailedToPickupDeadline: lgConfigModel.customerFailedToPickupDeadline,
                sendCustomerPickupReminder: lgConfigModel.sendCustomerPickupReminder,
                // Shipping
                carriers: this.getSelectedCarriers(lgConfigModel.carriers),
                defaultCarrier: lgConfigModel.defaultCarrier,
                printReturnLabel: lgConfigModel.printReturnLabel,
                defaultPrinterType: lgConfigModel.defaultPrinterType,
                // Box Types
                boxItems: lgConfigModel.boxTypes,
                // UPS Settings
                // UPS US Shipping Types
                upsUsShippingTypes: this.getSelectedUpsUsShippingTypes(unitedStatesUpsSettings),
                upsUSStandardDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.standardDefault : null,
                upsUSExpress1DayDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.express1DayDefault : null,
                upsUSExpress2DayDefault:  unitedStatesUpsSettings ? unitedStatesUpsSettings.express2DayDefault : null,
                upsUSExpress3DayDefault:  unitedStatesUpsSettings ? unitedStatesUpsSettings.express3DayDefault : null,
                upsUSReturnLabelShippingTypes: unitedStatesUpsSettings ? unitedStatesUpsSettings.returnLabelShippingMethod : null,
                // UPS International Shipping Types
                upsInternationalShippingTypes: this.getSelectedUpsInternationalShippingTypes(internationalUpsSettings),
                upsInternationalStandardDefault: internationalUpsSettings ? internationalUpsSettings.standardDefault : null,
                upsInternationalExpress1DayDefault: internationalUpsSettings ? internationalUpsSettings.express1DayDefault : null,
                upsInternationalExpress2DayDefault: internationalUpsSettings ? internationalUpsSettings.express2DayDefault : null,
                upsInternationalExpress3DayDefault: internationalUpsSettings ? internationalUpsSettings.express3DayDefault : null,
                upsInternationalReturnLabelShippingTypes: internationalUpsSettings ?
                                                                internationalUpsSettings.returnLabelShippingMethod : null,
                upsInternationalUSReturnLabelShippingTypes: internationalUpsSettings ?
                                                                internationalUpsSettings.internationalUsReturnLabelShippingMethod : null,
                // UPS Canada Shipping Types
                upsCanadaShippingTypes: this.getSelectedUpsCanadaShippingTypes(canadaUpsSettings),
                upsCanadaStandardDefault: canadaUpsSettings ? canadaUpsSettings.standardDefault : null,
                upsCanadaExpress1DayDefault: canadaUpsSettings ? canadaUpsSettings.express1DayDefault : null,
                upsCanadaExpress2DayDefault: canadaUpsSettings ? canadaUpsSettings.express2DayDefault : null,
                upsCanadaExpress3DayDefault: canadaUpsSettings ? canadaUpsSettings.express3DayDefault : null,
                upsCanadaReturnLabelShippingTypes: canadaUpsSettings ? canadaUpsSettings.returnLabelShippingMethod : null,
                // FedEx Settings
                enableSmartPost: shippingSettingsForFedEx ? shippingSettingsForFedEx.enableSmartPost : false,
                fedExShippingTypes: this.getSelectedFedExShippingTypes(shippingSettingsForFedEx),
                fedexStandardDefault: shippingSettingsForFedEx ? shippingSettingsForFedEx.standardDefault : null,
                fedexExpress1Default: shippingSettingsForFedEx ? shippingSettingsForFedEx.express1DayDefault : null,
                fedexExpress2Default: shippingSettingsForFedEx ? shippingSettingsForFedEx.express2DayDefault : null,
                fedexExpress3Default: shippingSettingsForFedEx ? shippingSettingsForFedEx.express3DayDefault : null,
                fedExReturnLabelShippingTypes: shippingSettingsForFedEx ? shippingSettingsForFedEx.returnLabelShippingMethod : null,
                // USPS Settings
                uspsShippingTypes: this.getSelectedUspsShippingTypes(shippingSettingsForUsps),
                uspsStandardDefault:  shippingSettingsForUsps ? shippingSettingsForUsps.standardDefault : null,
                uspsExpress1DayDefault:  shippingSettingsForUsps ? shippingSettingsForUsps.express1DayDefault : null,
                uspsExpress2DayDefault:  shippingSettingsForUsps ? shippingSettingsForUsps.express2DayDefault : null,
                uspsExpress3DayDefault:  shippingSettingsForUsps ? shippingSettingsForUsps.express3DayDefault : null,
                uspsReturnLabelShippingTypes:  shippingSettingsForUsps ? shippingSettingsForUsps.returnLabelShippingMethod : null,
                // Canada Post Settings
                outboundUsername:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                outboundPassword:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                outboundCustomerNumber:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                outboundLocale:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                outboundContractID:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                carsPickupNotify:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                preferredPickupTime:  canadaPostSettings ? canadaPostSettings.outboundUsername : null,
                closingTime:  canadaPostSettings ? canadaPostSettings.outboundUsername : null

            });
        }
    }

    private getSelectedUspsShippingTypes(shippingSettingsForUsps: ShippingSettingsForUsps) {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForUsps) {
            const shippingMethods = shippingSettingsForUsps.shippingMethods;
            this.model.LCUSPSShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected !== -1) {
                shippingTypeLst.push(true);
            } else {
                shippingTypeLst.push(false);
            }
         });
        }
        return shippingTypeLst;
    }

    private getSelectedFedExShippingTypes(shippingSettingsForFedEx: ShippingSettingsForFedEx) {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForFedEx) {
            const shippingMethods = shippingSettingsForFedEx.shippingMethods;
            this.model.LCFedExShippingType.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected !== -1) {
                shippingTypeLst.push(true);
            } else {
                shippingTypeLst.push(false);
            }
         });
        }
        return shippingTypeLst;
    }

    private getSelectedUpsCanadaShippingTypes(canadaUpsSettings: CanadaUpsSettingsModel) {
        const shippingTypeLst: boolean[] = [];
        if (canadaUpsSettings) {
            const shippingMethods = canadaUpsSettings.shippingMethods;
            this.model.LCUPSCanadaShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected !== -1) {
                shippingTypeLst.push(true);
            } else {
                shippingTypeLst.push(false);
            }
         });
        }
        return shippingTypeLst;
    }

    private getSelectedUpsUsShippingTypes( unitedStatesUpsSettingsModel: UnitedStatesUpsSettingsModel) {
        const shippingTypeLst: boolean[] = [];
        if (unitedStatesUpsSettingsModel) {
            const shippingMethods = unitedStatesUpsSettingsModel.shippingMethods;
            this.model.LCUPSUSShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected !== -1) {
                shippingTypeLst.push(true);
            } else {
                shippingTypeLst.push(false);
            }
         });
        }
        return shippingTypeLst;
    }

    private getSelectedUpsInternationalShippingTypes( internationalUpsSettings: InternationalUpsSettingsModel) {
        const shippingTypeLst: boolean[] = [];
        if (internationalUpsSettings) {
            const shippingMethods = internationalUpsSettings.shippingMethods;
            this.model.LCUPSInternationalShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected !== -1) {
                shippingTypeLst.push(true);
            } else {
                shippingTypeLst.push(false);
            }
         });
        }
        return shippingTypeLst;
    }

    private getSelectedCarriers( carriers: CarrierModel[]): boolean[] {
        const carriersLst: boolean[] = [];
        this.model.LCCarriers.map((o, i) => {
           const carrierObj =  _.find(carriers, { 'carrierType': o.CarrierType});
           if (carrierObj) {
                carriersLst.push(true);
           } else {
                carriersLst.push(false);
           }
        });
        return carriersLst;
    }

    private addUSPSShippingTypesCheckboxes() {
        this.model.LCUSPSShippingTypes.map((o, i) => {
            const control = new FormControl(); // if first item set to true, else false
            (this.model.locationGroupConfigForm.controls.uspsShippingTypes as FormArray).push(control);
        });
    }
}
