import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggerService, TostrService, ErrorCode, HttpError, ErroNotificationType, ToastrCode, SpinnerService } from '@core';
import { SharedDataService, NotificationService } from '@global';
import { LocationGroupConfigModel, LocationGroupConfigurationModel, CarrierModel,
         UnitedStatesUpsSettingsModel, InternationalUpsSettingsModel, CanadaUpsSettingsModel,
         ShippingSettingsForFedEx, ShippingSettingsForUsps, CanadaPostSettings, ShippingSettingsForUpsModel } from './config.model';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Constants, ConfirmationDialogService, ConfirmationDialogNotificationCode, ConfirmationDialogNotificationType, NotificationLGActions } from '@shared';
import { LocationGroupConfigService } from './config.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { CreateLocationGroupService } from '../create';
import { LocationGroupModel, SiteModel } from '../create/location.group.model';
import { ProgressButtonService } from '@shared/progress-button/progress-button.service';

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
        private createService: CreateLocationGroupService,
        private _spinner: SpinnerService,
        private _progressButtonService: ProgressButtonService,
        private _confirmationDialogService: ConfirmationDialogService,
        private _notificationService: NotificationService
    ) { }

    ngOnInit() {

        this._spinner.start();

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
            boxItems: new FormArray([]),

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

        this.model.subscriptions.push(
            this.activeRoute.params.subscribe(routeParams => {
                const locgroupId  = this.activeRoute.snapshot.paramMap.get('id');
                const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
                this.fetchLocationGroupConfig(locgroupId, siteId);
            })
        );

        this.model.subscriptions.push(
            this._notificationService.LGCUnSavedChangesConfirmation.subscribe((action: any) => {
              if (action.code === ConfirmationDialogNotificationCode.LGCUnSavedChanges) {
                    if ( action.buttonType === NotificationLGActions.ConfirmationDialogPrimaryBtnAct ) {
                        this.navigateToSiteConfig();
                    }
                    if ( action.buttonType === NotificationLGActions.ConfirmationDialogSecondaryBtnAct) {
                        // revert selected site
                        const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
                        this.model.selectedSite = _.find(this.model.sitesLst, { 'id': _.parseInt(siteId)});
                    }
              }
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
        this.markLocationGroupConfigFormDirty();
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).removeAt(rowIndex);
    }

    markLocationGroupConfigFormDirty() {
        this.model.locationGroupConfigForm.markAsDirty();
    }

    siteListChanged() {

        if (this.model.locationGroupConfigForm.pristine) {
            this.navigateToSiteConfig();
        } else {
            this.showUnsavedChangesConfirmationDialog();
        }
    }

    private getCarrierSettings() {
        this._loggerService.info('LocationGroupConfigComponent : getCarrierSettings');
        this.configService.getCarrierSettings().subscribe(response =>
            this.getCarrierSettingsSuccess(response),
            (response) => this.getCarrierSettingsError(response.error.message));
    }

    private getCarrierSettingsSuccess(result) {
        this._loggerService.info('LocationGroupConfigComponent : getCarrierSettingsSuccess' + JSON.stringify(result));
        if ( result && result.items ) {

        }
    }

    private getCarrierSettingsError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getCarrierSettingsError');
        this._spinner.stop();
        this._tostrService.showError(errmsg);
    }


    private getAllCarrierRatesWithConfiguredInfo() {
        this._loggerService.info('LocationGroupConfigComponent : getAllCarrierRatesWithConfiguredInfo');
        this.configService.getAllCarrierRatesWithConfiguredInfo().subscribe(response =>
            this.getCarrierSettingsSuccess(response),
            (response) => this.getCarrierSettingsError(response.error.message));
    }

    private getAllCarrierRatesWithConfiguredInfoSuccess( result ) {
        this._loggerService.info('LocationGroupConfigComponent : getAllCarrierRatesWithConfiguredInfoSuccess' + JSON.stringify(result));
        if ( result && result.items ) {

        }
    }

    private getAllCarrierRatesWithConfiguredInfoError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getAllCarrierRatesWithConfiguredInfoError');
        this._spinner.stop();
        this._tostrService.showError(errmsg);
    }

    private navigateToSiteConfig() {
        const locationGroupId  = this.activeRoute.snapshot.paramMap.get('id');
        this.router.navigate([Constants.uiRoutes.locationGroupConfig + '/' + locationGroupId
                            + '/' + this.model.selectedSite.id]);
    }

    private showUnsavedChangesConfirmationDialog() {
        this._confirmationDialogService.openConfirmationDialog(ConfirmationDialogNotificationCode.LGCUnSavedChanges,
        ConfirmationDialogNotificationType.Confirmation);
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
        this._spinner.start();
        this.configService.getLocationGroupConfig(locationGroupId, siteId).subscribe(response =>
            this.getLocationGroupConfigSuccess(response),
            (response) => this.getLocationGroupConfigError(response.error.message));
    }

    private getLocationGroupConfigSuccess(result) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigSuccess' + JSON.stringify(result));
        // get carrier settings details.
        this.getCarrierSettings();
        // get carrier rates with configure info details.
        this.getAllCarrierRatesWithConfiguredInfo();

        if ( result && result.items ) {
            const lgConfigModel: LocationGroupConfigurationModel =   <LocationGroupConfigurationModel>result.items;
            this.resetLocationGroupConfigForm();
            this.updateLocationGroupConfigForm(lgConfigModel);
        }
    }

    private getLocationGroupConfigError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigError');
        this._spinner.stop();
        this._tostrService.showError(errmsg);
    }

    private resetLocationGroupConfigForm(): void {
        this.model.locationGroupConfigForm.reset();
        this.model.locationGroupConfigForm.controls.boxItems = new FormArray([]);
    }

    private updateLocationGroupConfigForm(lgConfigModel: LocationGroupConfigurationModel): void {

        this.model.lgConfigModel = lgConfigModel;

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
                carriers: this.setSelectedCarriers(lgConfigModel.carriers),
                defaultCarrier: lgConfigModel.defaultCarrier,
                printReturnLabel: lgConfigModel.printReturnLabel,
                defaultPrinterType: lgConfigModel.defaultPrinterType,
                // Box Types
                boxItems: lgConfigModel.boxTypes,
                // UPS Settings
                // UPS US Shipping Types
                upsUsShippingTypes: this.setSelectedUpsUsShippingTypes(unitedStatesUpsSettings),
                upsUSStandardDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.standardDefault : null,
                upsUSExpress1DayDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.express1DayDefault : null,
                upsUSExpress2DayDefault:  unitedStatesUpsSettings ? unitedStatesUpsSettings.express2DayDefault : null,
                upsUSExpress3DayDefault:  unitedStatesUpsSettings ? unitedStatesUpsSettings.express3DayDefault : null,
                upsUSReturnLabelShippingTypes: unitedStatesUpsSettings ? unitedStatesUpsSettings.returnLabelShippingMethod : null,
                // UPS International Shipping Types
                upsInternationalShippingTypes: this.setSelectedUpsInternationalShippingTypes(internationalUpsSettings),
                upsInternationalStandardDefault: internationalUpsSettings ? internationalUpsSettings.standardDefault : null,
                upsInternationalExpress1DayDefault: internationalUpsSettings ? internationalUpsSettings.express1DayDefault : null,
                upsInternationalExpress2DayDefault: internationalUpsSettings ? internationalUpsSettings.express2DayDefault : null,
                upsInternationalExpress3DayDefault: internationalUpsSettings ? internationalUpsSettings.express3DayDefault : null,
                upsInternationalReturnLabelShippingTypes: internationalUpsSettings ?
                                                                internationalUpsSettings.returnLabelShippingMethod : null,
                upsInternationalUSReturnLabelShippingTypes: internationalUpsSettings ?
                                                                internationalUpsSettings.internationalUsReturnLabelShippingMethod : null,
                // UPS Canada Shipping Types
                upsCanadaShippingTypes: this.setSelectedUpsCanadaShippingTypes(canadaUpsSettings),
                upsCanadaStandardDefault: canadaUpsSettings ? canadaUpsSettings.standardDefault : null,
                upsCanadaExpress1DayDefault: canadaUpsSettings ? canadaUpsSettings.express1DayDefault : null,
                upsCanadaExpress2DayDefault: canadaUpsSettings ? canadaUpsSettings.express2DayDefault : null,
                upsCanadaExpress3DayDefault: canadaUpsSettings ? canadaUpsSettings.express3DayDefault : null,
                upsCanadaReturnLabelShippingTypes: canadaUpsSettings ? canadaUpsSettings.returnLabelShippingMethod : null,
                // FedEx Settings
                enableSmartPost: shippingSettingsForFedEx ? shippingSettingsForFedEx.enableSmartPost : false,
                fedExShippingTypes: this.setSelectedFedExShippingTypes(shippingSettingsForFedEx),
                fedexStandardDefault: shippingSettingsForFedEx ? shippingSettingsForFedEx.standardDefault : null,
                fedexExpress1Default: shippingSettingsForFedEx ? shippingSettingsForFedEx.express1DayDefault : null,
                fedexExpress2Default: shippingSettingsForFedEx ? shippingSettingsForFedEx.express2DayDefault : null,
                fedexExpress3Default: shippingSettingsForFedEx ? shippingSettingsForFedEx.express3DayDefault : null,
                fedExReturnLabelShippingTypes: shippingSettingsForFedEx ? shippingSettingsForFedEx.returnLabelShippingMethod : null,
                // USPS Settings
                uspsShippingTypes: this.setSelectedUspsShippingTypes(shippingSettingsForUsps),
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
        this._spinner.stop();
    }

    private setSelectedUspsShippingTypes(shippingSettingsForUsps: ShippingSettingsForUsps): boolean[]  {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForUsps) {
            const shippingMethods = shippingSettingsForUsps.shippingMethods;
            this.model.LCUSPSShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected === -1) {
                shippingTypeLst.push(false);
            } else {
                shippingTypeLst.push(true);
            }
         });
        }
        return shippingTypeLst;
    }

    private setSelectedFedExShippingTypes(shippingSettingsForFedEx: ShippingSettingsForFedEx): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForFedEx) {
            const shippingMethods = shippingSettingsForFedEx.shippingMethods;
            this.model.LCFedExShippingType.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected === -1) {
                shippingTypeLst.push(false);
            } else {
                shippingTypeLst.push(true);
            }
         });
        }
        return shippingTypeLst;
    }

    private setSelectedUpsCanadaShippingTypes(canadaUpsSettings: CanadaUpsSettingsModel): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (canadaUpsSettings) {
            const shippingMethods = canadaUpsSettings.shippingMethods;
            this.model.LCUPSCanadaShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected === -1) {
                shippingTypeLst.push(false);
            } else {
                shippingTypeLst.push(true);
            }
         });
        }
        return shippingTypeLst;
    }

    private setSelectedUpsUsShippingTypes( unitedStatesUpsSettingsModel: UnitedStatesUpsSettingsModel): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (unitedStatesUpsSettingsModel) {
            const shippingMethods = unitedStatesUpsSettingsModel.shippingMethods;
            this.model.LCUPSUSShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected === -1) {
                shippingTypeLst.push(false);
            } else {
                shippingTypeLst.push(true);
            }
         });
        }
        return shippingTypeLst;
    }

    private setSelectedUpsInternationalShippingTypes( internationalUpsSettings: InternationalUpsSettingsModel): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (internationalUpsSettings) {
            const shippingMethods = internationalUpsSettings.shippingMethods;
            this.model.LCUPSInternationalShippingTypes.map((o, i) => {
            const isShippingTypeSelected =  _.indexOf(shippingMethods, o.data);
            if (isShippingTypeSelected === -1) {
                shippingTypeLst.push(false);
            } else {
                shippingTypeLst.push(true);
            }
         });
        }
        return shippingTypeLst;
    }

    private setSelectedCarriers( carriers: CarrierModel[]): boolean[] {
        const carriersUpr: CarrierModel[] = [];
        carriers.map((v) => {
            const carrierObj: CarrierModel = {} as CarrierModel;
            carrierObj.carrierType = v.carrierType.toUpperCase();
            carrierObj.isEnabled = v.isEnabled;
            carriersUpr.push(carrierObj);
        });
        const carriersLst: boolean[] = [];
        this.model.LCCarriers.map((o, i) => {
           const carrierObj =  _.find(carriersUpr, { 'carrierType': (<string>o.CarrierType).toUpperCase()});
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

    saveLocationConfig() {

        this._spinner.start();
        this._progressButtonService.start();
        const lgConfigModel: LocationGroupConfigurationModel = {} as LocationGroupConfigurationModel;
        const lgconfigForm = this.model.locationGroupConfigForm;

        lgConfigModel.tenantId = this.model.lgConfigModel.tenantId;
        lgConfigModel.siteId = this.model.lgConfigModel.siteId;
        lgConfigModel.locationGroupId = this.model.lgConfigModel.locationGroupId;
        // ISPU
        lgConfigModel.customerFailedToPickupAfterAction = lgconfigForm.get(['customerFailedToPickupAfterAction']).value;
        lgConfigModel.customerFailedToPickupDeadline = lgconfigForm.get(['customerFailedToPickupDeadline']).value;
        lgConfigModel.sendCustomerPickupReminder = lgconfigForm.get(['sendCustomerPickupReminder']).value;
        // Shipping
        lgConfigModel.carriers = this.getSelectedCarriers(lgconfigForm.get(['carriers']).value);
        lgConfigModel.defaultCarrier = lgconfigForm.get(['defaultCarrier']).value;
        lgConfigModel.printReturnLabel = lgconfigForm.get(['printReturnLabel']).value;
        lgConfigModel.defaultPrinterType = lgconfigForm.get(['defaultPrinterType']).value;
        // Box Types
        lgConfigModel.boxTypes = lgconfigForm.get(['boxItems']).value;
        // UPS Settings

        lgConfigModel.shippingSettingsForUps = {} as ShippingSettingsForUpsModel;
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings = {} as UnitedStatesUpsSettingsModel;
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings = {} as InternationalUpsSettingsModel;
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings = {} as CanadaUpsSettingsModel;

        // UPS US Shipping Types
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings.shippingMethods = this.getSelectedUpsUsShippingTypes(lgconfigForm.get(['upsUsShippingTypes']).value);
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings.returnLabelShippingMethod = lgconfigForm.get(['upsUSReturnLabelShippingTypes']).value;
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings.standardDefault = lgconfigForm.get(['upsUSStandardDefault']).value;
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings.express1DayDefault = lgconfigForm.get(['upsUSExpress1DayDefault']).value;
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings.express2DayDefault = lgconfigForm.get(['upsUSExpress2DayDefault']).value;
        lgConfigModel.shippingSettingsForUps.unitedStatesUpsSettings.express3DayDefault = lgconfigForm.get(['upsUSExpress3DayDefault']).value;
        // UPS International Shipping Types
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.shippingMethods = this.getSelectedUpsInternationalShippingTypes(lgconfigForm.get(['upsInternationalShippingTypes']).value);
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.returnLabelShippingMethod = lgconfigForm.get(['upsInternationalReturnLabelShippingTypes']).value;
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.internationalUsReturnLabelShippingMethod = lgconfigForm.get(['upsInternationalUSReturnLabelShippingTypes']).value;
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.standardDefault = lgconfigForm.get(['upsInternationalStandardDefault']).value;
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.express1DayDefault = lgconfigForm.get(['upsInternationalExpress1DayDefault']).value;
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.express2DayDefault = lgconfigForm.get(['upsInternationalExpress2DayDefault']).value;
        lgConfigModel.shippingSettingsForUps.internationalUpsSettings.express3DayDefault = lgconfigForm.get(['upsInternationalExpress3DayDefault']).value;
        // UPS Canada Shipping Types
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings.shippingMethods = this.getSelectedUpsCanadaShippingTypes(lgconfigForm.get(['upsCanadaShippingTypes']).value);
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings.returnLabelShippingMethod = lgconfigForm.get(['upsCanadaReturnLabelShippingTypes']).value;
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings.standardDefault = lgconfigForm.get(['upsCanadaStandardDefault']).value;
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings.express1DayDefault = lgconfigForm.get(['upsCanadaExpress1DayDefault']).value;
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings.express2DayDefault = lgconfigForm.get(['upsCanadaExpress2DayDefault']).value;
        lgConfigModel.shippingSettingsForUps.canadaUpsSettings.express3DayDefault = lgconfigForm.get(['upsCanadaExpress3DayDefault']).value;
        // FedEx Settings
        lgConfigModel.shippingSettingsForFedEx = {} as ShippingSettingsForFedEx;
        lgConfigModel.shippingSettingsForFedEx.shippingMethods = this.getSelectedFedExShippingTypes(lgconfigForm.get(['fedExShippingTypes']).value);
        lgConfigModel.shippingSettingsForFedEx.enableSmartPost = lgconfigForm.get(['enableSmartPost']).value;
        lgConfigModel.shippingSettingsForFedEx.returnLabelShippingMethod = lgconfigForm.get(['fedExReturnLabelShippingTypes']).value;
        lgConfigModel.shippingSettingsForFedEx.standardDefault = lgconfigForm.get(['fedexStandardDefault']).value;
        lgConfigModel.shippingSettingsForFedEx.express1DayDefault = lgconfigForm.get(['fedexExpress1Default']).value;
        lgConfigModel.shippingSettingsForFedEx.express2DayDefault = lgconfigForm.get(['fedexExpress2Default']).value;
        lgConfigModel.shippingSettingsForFedEx.express3DayDefault = lgconfigForm.get(['fedexExpress3Default']).value;
        // USPS Settings
        lgConfigModel.shippingSettingsForUsps = {} as ShippingSettingsForUsps;
        lgConfigModel.shippingSettingsForUsps.shippingMethods = this.getSelectedUspsShippingTypes(lgconfigForm.get(['uspsShippingTypes']).value);
        lgConfigModel.shippingSettingsForUsps.standardDefault = lgconfigForm.get(['uspsStandardDefault']).value;
        lgConfigModel.shippingSettingsForUsps.returnLabelShippingMethod = lgconfigForm.get(['uspsReturnLabelShippingTypes']).value;
        lgConfigModel.shippingSettingsForUsps.express1DayDefault = lgconfigForm.get(['uspsExpress1DayDefault']).value;
        lgConfigModel.shippingSettingsForUsps.express2DayDefault = lgconfigForm.get(['uspsExpress2DayDefault']).value;
        lgConfigModel.shippingSettingsForUsps.express3DayDefault = lgconfigForm.get(['uspsExpress3DayDefault']).value;
        // Canada Post Settings
        lgConfigModel.canadaPostSettings = {} as CanadaPostSettings;
        lgConfigModel.canadaPostSettings.outboundUsername = lgconfigForm.get(['outboundUsername']).value;
        lgConfigModel.canadaPostSettings.outboundPassword = lgconfigForm.get(['outboundPassword']).value;
        lgConfigModel.canadaPostSettings.outboundCustomerNumber = lgconfigForm.get(['outboundCustomerNumber']).value;
        lgConfigModel.canadaPostSettings.outboundLocale = lgconfigForm.get(['outboundLocale']).value;
        lgConfigModel.canadaPostSettings.outboundContractID = lgconfigForm.get(['outboundContractID']).value;
        lgConfigModel.canadaPostSettings.carsPickupNotify = lgconfigForm.get(['carsPickupNotify']).value;
        lgConfigModel.canadaPostSettings.preferredPickupTime = lgconfigForm.get(['preferredPickupTime']).value;
        lgConfigModel.canadaPostSettings.closingTime = lgconfigForm.get(['closingTime']).value;
        // Audit Info
        lgConfigModel.auditInfo = this.model.lgConfigModel.auditInfo;

        this.updateLocationGroupConfig(lgConfigModel);
    }

    private updateLocationGroupConfig(lgcModel: LocationGroupConfigurationModel) {
        this._loggerService.info('LocationGroupConfigComponent : updateLocationGroupConfig');

        this.configService.updateLocationGroupConfig(lgcModel).subscribe(response =>
            this.updateLocationGroupConfigSuccess(response),
            (response) => this.updateLocationGroupConfigError(response.error.message));
    }

    updateLocationGroupConfigError(message: any): void {
        this._spinner.stop();
        this._progressButtonService.stop();
        this._loggerService.info('LocationGroupConfigComponent : updateLocationGroupConfigError');
        this._tostrService.showError(message);
    }

    private updateLocationGroupConfigSuccess(result: any): void {
        this._loggerService.info('LocationGroupConfigComponent : updateLocationGroupConfigSuccess' + JSON.stringify(result));
        this._spinner.stop();
        this._progressButtonService.stop();
        this.model.locationGroupConfigForm.markAsPristine();
        this._tostrService.showSuccess(ToastrCode.LGCSavedSuccessfully);
    }

    private getSelectedCarriers( carriers: boolean[]): CarrierModel[] {
        const carriersLst: CarrierModel[] = [];
        this.model.LCCarriers.map((value, index) => {
           if (carriers[index]) {
                const carrierObj: CarrierModel = {} as CarrierModel;
                carrierObj.carrierType = value.CarrierType;
                carrierObj.isEnabled = true;
                carriersLst.push(carrierObj);
           }
        });
        return carriersLst;
    }

    private getSelectedUpsUsShippingTypes(shippingSettingsForUsps: boolean[]): string[] {
        const shippingTypeLst: string[] = [];
        if (shippingSettingsForUsps) {
            this.model.LCUPSUSShippingTypes.map((value, index) => {
            if (shippingSettingsForUsps[index]) {
                shippingTypeLst.push(value.data);
            }
         });
        }
        return shippingTypeLst;
    }

    private getSelectedUpsInternationalShippingTypes( internationalUpsSettings: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (internationalUpsSettings) {
            shippingTypeLst = internationalUpsSettings.map((v, i) => v ? this.model.LCUPSInternationalShippingTypes[i].data : null)
            .filter(v => v !== null);
        }
        return shippingTypeLst;
    }

    private getSelectedUpsCanadaShippingTypes(canadaUpsSettings: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (canadaUpsSettings) {
            shippingTypeLst = canadaUpsSettings.map((v, i) => v ? this.model.LCUPSCanadaShippingTypes[i].data : null)
            .filter(v => v !== null);
        }
        return shippingTypeLst;
    }

    private getSelectedFedExShippingTypes(shippingSettingsForFedEx: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (shippingSettingsForFedEx) {
            shippingTypeLst = shippingSettingsForFedEx.map((v, i) => v ? this.model.LCFedExShippingType[i].data : null)
            .filter(v => v !== null);
        }
        return shippingTypeLst;
    }

    private getSelectedUspsShippingTypes(shippingSettingsForUsps: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (shippingSettingsForUsps) {
            shippingTypeLst = shippingSettingsForUsps.map((v, i) => v ? this.model.LCUSPSShippingTypes[i].data : null)
            .filter(v => v !== null);
        }
        return shippingTypeLst;
    }
}
