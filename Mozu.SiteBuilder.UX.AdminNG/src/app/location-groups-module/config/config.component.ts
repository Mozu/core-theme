import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggerService, TostrService, ErrorCode, HttpError, ErroNotificationType, ToastrCode, SpinnerService, IRequestOptions } from '@core';
import { SharedDataService, NotificationService } from '@global';
import {
    LocationGroupConfigModel,
    LocationGroupConfigurationModel,
    CarrierModel,
    CarrierSettingsModel,
    CarrierShippingType,
    ShippingMethodMappings,
    PackageSettings,
    BPMConfiguration,
    CarrierAccountModel,
    CarrierAccountSetModel,
    SelectedCarrierAccountModel,
    WorkflowProcessModel
} from './config.model';
import { FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Constants, ConfirmationDialogService, ConfirmationDialogNotificationCode, ConfirmationDialogNotificationType, NotificationLGActions } from '@shared';
import { LocationGroupConfigService } from './config.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { CreateLocationGroupService } from '../create';
import { LocationGroupModel, SiteModel } from '../create/location.group.model';
import { ProgressButtonService } from '@shared/progress-button/progress-button.service';
import { forkJoin } from 'rxjs';
import { TopLocationGroupConfigModel } from '@shared/header/location-groups/header-location-groups.model';

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
        this.model = new LocationGroupConfigModel();
        this.model.subscriptions = [];
        this.model.sitesLst = [];
        this.model.LCCustomerPickupActions = Constants.LCCustomerPickupActions;
        this.model.LCCustomerPickupReminders = Constants.LCCustomerPickupReminders;
        this.model.LCPrintReturnLabel = Constants.LCPrintReturnLabel;
        this.model.LCDefaultPrinterType = Constants.LCDefaultPrinterType;
        this.model.packageSettingUnitTypes = Constants.PackageSettingUnitTypes;
        this.model.uspsCarrierAccountPagination = Constants.UspsCarrierAccountPageConfig;
        this.model.canadaPostCarrierAccountPagination = Constants.CanadaPostCarrierAccountPageConfig;
        this.model.purolatorCarrierAccountPagination = Constants.PurolatorCarrierAccountPageConfig;
        this.model.workflowProcessList = [];

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
            upsUSStandardDefault: ['', []],
            upsUSExpress1DayDefault: ['', []],
            upsUSExpress2DayDefault: ['', []],
            upsUSExpress3DayDefault: ['', []],
            upsUSReturnLabelShippingTypes: ['', []],

            outboundUsername: ['', []],
            outboundPassword: ['', []],
            outboundCustomerNumber: ['', []],
            outboundLocale: ['', []],
            outboundContractID: ['', []],
            carsPickupNotify: ['', []],
            preferredPickupTime: ['', []],
            closingTime: ['', []],

            uspsShippingTypes: new FormArray([]),
            uspsStandardDefault: ['', []],
            uspsExpress1DayDefault: ['', []],
            uspsExpress2DayDefault: ['', []],
            uspsExpress3DayDefault: ['', []],
            uspsReturnLabelShippingTypes: ['', []],

            enableSmartPost: ['', []],
            fedExShippingTypes: new FormArray([]),
            fedexStandardDefault: ['', []],
            fedexExpress1Default: ['', []],
            fedexExpress2Default: ['', []],
            fedexExpress3Default: ['', []],
            fedExReturnLabelShippingTypes: ['', []],

            canadapostShippingTypes: new FormArray([]),
            canadapostStandardDefault: ['', []],
            canadapostExpress1DayDefault: ['', []],
            canadapostExpress2DayDefault: ['', []],
            canadapostExpress3DayDefault: ['', []],
            canadapostReturnLabelShippingTypes: ['', []],

            //Purolator Carrier types
            purolatorShippingTypes: new FormArray([]),
            purolatorStandardDefault: ['', []],
            purolatorExpress1DayDefault: ['', []],
            purolatorExpress2DayDefault: ['', []],
            purolatorExpress3DayDefault: ['', []],
            purolatorReturnLabelShippingTypes: ['', []],
           
            autoPackingListPopup: ['', []],
            blockPartialStock: ['', []],
            defaultMaxNumberOfShipmentsInPickWave: ['', []],
            displayProductImagesInPickWaveDetails: ['', []],
            enablePnpForSTH: ['', []],
            enablePnpForBOPIS: ['', []],
            blockPartialCancel: ['', []],

            packageSettingsUnitType: ['', []],

            bpmConfigurations: new FormArray([]),
            sthWorkflowProcess: ['', []],
            bopisWorkflowProcess: ['', []],
            transferWorkflowProcess: ['', []]
        });

        const locationGroupCode = this.activeRoute.snapshot.paramMap.get('locationGroupCode');
        this.createService.getLocationGroup(locationGroupCode).subscribe(
            (response) => this.getLocationGroupSuccess(response),
            (response) => this.getLocationGroupError(response.error.message)
        );

        this.configService.getWorkflowProcesses().subscribe(
            (response) => this.getWorkflowProcessesResponse(response),
            (response) => this.getWorkflowProcessesError(response.error.message)
        );

        this.model.subscriptions.push(
            this.activeRoute.params.subscribe(routeParams => {
                const locationGroupCode = this.activeRoute.snapshot.paramMap.get('locationGroupCode');
                const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
                this.fetchLocationGroupConfig(locationGroupCode, siteId);
            })
        );

        this.model.subscriptions.push(
            this._notificationService.LGCUnSavedChangesConfirmation.subscribe((action: any) => {
                if (action.code === ConfirmationDialogNotificationCode.LGCUnSavedChanges) {
                    if (action.buttonType === NotificationLGActions.ConfirmationDialogPrimaryBtnAct) {
                        this.navigateToSiteConfig();
                    }
                    if (action.buttonType === NotificationLGActions.ConfirmationDialogSecondaryBtnAct) {
                        // revert selected site
                        const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
                        this.model.selectedSite = _.find(this.model.sitesLst, { 'id': _.parseInt(siteId) });
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

    private getLocationGroupSuccess(result: { items: LocationGroupModel; }) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupSuccess' + JSON.stringify(result));
        if (result && result.items) {
            const lgModel: LocationGroupModel = <LocationGroupModel>result.items;
            this.fetchSitesData(lgModel.siteIds);
        }
    }

    private getWorkflowProcessesResponse(result: { items: WorkflowProcessModel[]; }) {
        this._loggerService.info('LocationGroupConfigComponent : getWorkflowProcessesResponse' + JSON.stringify(result));
        if (result && result.items) {
            const workflowProcesses: WorkflowProcessModel[] = <WorkflowProcessModel[]>result.items;
            if (workflowProcesses.length > 0) {
                this.model.workflowProcessList = workflowProcesses;
            }
        }
    }

    private getLocationGroupError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupError');
        throw new HttpError(ErrorCode.GetLocationGroupDetailFailed, ErroNotificationType.Toaster);
    }

    private getWorkflowProcessesError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getWorkflowProcessesError');
        throw new HttpError(ErrorCode.GetWorkFlowProcessFailed, ErroNotificationType.Toaster);
    }

    private addCarriersCheckboxes() {
        this.model.LCCarriers.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.carriers as FormArray).push(control);
        });
    }

    private addUPSUSShippingTypesCheckboxes() {
        this.model.LCUPSUSShippingTypes.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.upsUsShippingTypes as FormArray).push(control);
        });
    }

    private addFedExShippingTypesCheckboxes() {
        this.model.LCFedExShippingType.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.fedExShippingTypes as FormArray).push(control);
        });
    }

    private addCanadaPostShippingTypesCheckboxes() {
        this.model.LCCanadaPostShippingType.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.canadapostShippingTypes as FormArray).push(control);
        });
    }

    private addPurolatorShippingTypesCheckboxes() {
        this.model.LCPurolatorShippingType.map((o, i) => {
            const control = new FormControl();
            (this.model.locationGroupConfigForm.controls.purolatorShippingTypes as FormArray).push(control);
        });
    }

    addBoxItem(): void {
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).push(this.createBoxItem());
    }

    removeBoxItem(rowIndex: number) {
        this.markLocationGroupConfigFormDirty();
        (this.model.locationGroupConfigForm.controls.boxItems as FormArray).removeAt(rowIndex);
    }

    markLocationGroupConfigFormDirty() {
        this.model.locationGroupConfigForm.markAsDirty();
    }

    getBPMName(containerName: string, processId: string) {
        return `${containerName} -> ${processId}`;
    }

    siteListChanged() {

        if (this.model.locationGroupConfigForm.pristine) {
            this.navigateToSiteConfig();
        } else {
            this.showUnsavedChangesConfirmationDialog();
        }
    }

    private getCarrierSettingsSuccess(result: CarrierSettingsModel[]) {
        this._loggerService.info('LocationGroupConfigComponent : getCarrierSettingsSuccess' + JSON.stringify(result));
        if (result) {
            const carrierSettingsModel: CarrierSettingsModel[] = <CarrierSettingsModel[]>result;
            this.model.LCCarriers = [];
            this.model.LCDefaultCarrier = [...Constants.LCDefaultCarrier];
            carrierSettingsModel.map((value, index) => {
                // Filter out custom carrier from the returned list
                if (value.id !== Constants.LCCarriers.custom) {
                    const carrierObj = {
                        CarrierType: value.id,
                        CarrierTypeLabel: value.id.toUpperCase(),
                        IsEnabled: false
                    };
                    const carrierDropdownObj = {
                        data: value.id,
                        label: value.id.toUpperCase()
                    };
                    this.model.LCCarriers.push(carrierObj);
                    this.model.LCDefaultCarrier.push(carrierDropdownObj);
                }
            });
        }
    }

    private getAllCarrierRatesWithConfiguredInfoSuccess(result: CarrierShippingType[]) {
        this._loggerService.info('LocationGroupConfigComponent : getAllCarrierRatesWithConfiguredInfoSuccess' + JSON.stringify(result));
        if (result) {
            const carrierShippingType: CarrierShippingType[] = <CarrierShippingType[]>result;

            this.model.LCUPSUSShippingTypes = [];
            this.model.LCUSPSShippingTypes = [];
            this.model.LCFedExShippingType = [];
            this.model.LCCanadaPostShippingType = [];
            this.model.LCPurolatorShippingType = [];

            carrierShippingType.map((value, index) => {
                const shippingTypeObj = {
                    data: value.code,
                    label: value.name
                };
                if (value.rateProvider.toLowerCase() === Constants.LCCarriers.usps) {
                    this.model.LCUSPSShippingTypes.push(shippingTypeObj);
                } else if (value.rateProvider.toLowerCase() === Constants.LCCarriers.ups) {
                    this.model.LCUPSUSShippingTypes.push(shippingTypeObj);
                } else if (value.rateProvider.toLowerCase() === Constants.LCCarriers.fedex) {
                    this.model.LCFedExShippingType.push(shippingTypeObj);
                } else if (value.rateProvider.toLowerCase() === Constants.LCCarriers.canadapost) {
                    this.model.LCCanadaPostShippingType.push(shippingTypeObj);
                } else if (value.rateProvider.toLowerCase() === Constants.LCCarriers.purolator) {
                    this.model.LCPurolatorShippingType.push(shippingTypeObj);
                }
            });
        }
    }

    private navigateToSiteConfig() {
        const locationGroupCode = this.activeRoute.snapshot.paramMap.get('locationGroupCode');
        this.router.navigate([Constants.uiRoutes.locationGroupConfig + '/' + locationGroupCode
            + '/' + this.model.selectedSite.id]);
    }

    private showUnsavedChangesConfirmationDialog() {
        this._confirmationDialogService.openConfirmationDialog(ConfirmationDialogNotificationCode.LGCUnSavedChanges,
            ConfirmationDialogNotificationType.Confirmation);
    }

    private createBoxItem(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            length: ['', Validators.required],
            width: ['', Validators.required],
            height: ['', Validators.required]
        });
    }

    public fetchSitesData = (siteIds: any[]) => {
        this._loggerService.info('LocationGroupConfigComponent : fetchSitesData');
        this.model.sitesLst = [];

        if (this._sharedData._sharedData.items.ctTenant.sites) {
            const sites: SiteModel[] = this._sharedData._sharedData.items.ctTenant.sites;
            if (siteIds && siteIds.length > 0) {
                for (let cnt = 0; cnt < siteIds.length; cnt++) {
                    const siteObj: SiteModel = _.find(sites, { 'id': _.parseInt(siteIds[cnt]) });
                    if (siteObj) {
                        this.model.sitesLst.push(siteObj);
                    }
                }
            }
        }
        const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
        this.model.selectedSite = _.find(this.model.sitesLst, { 'id': _.parseInt(siteId) });
    }

    public fetchLocationGroupConfig = (locationGroupCode: any, siteId: any) => {
        this._loggerService.info('LocationGroupConfigComponent : fetchLocationGroupConfig');
        this._spinner.start();
        this.getAllServicesData(locationGroupCode, siteId);
    }

    private getAllServicesData(locationGroupCode: string, siteId: string) {

        const opts: IRequestOptions = this._sharedData.getSiteHttpHeaders(siteId);

        // get all services observables
        const locationGroupConfig = this.configService.getLocationGroupConfig(locationGroupCode, siteId);
        const carrierSettings = this.configService.getCarrierSettings(opts);
        const carrierRatesWithConfiguredInfo = this.configService.getAllCarrierRatesWithConfiguredInfo(opts);
        const uspsCarrierAccountSets = this.configService.getCarrierAccountSets(this.model.uspsCarrierAccountPagination, Constants.LCCarriers.usps);
        const carrierAccount = this.configService.getCarrierAccount(locationGroupCode, siteId);
        const canadaPostCarrierAccountSets = this.configService.getCarrierAccountSets(this.model.canadaPostCarrierAccountPagination, Constants.LCCarriers.canadapost);
        const purolatorCarrierAccountSets = this.configService.getCarrierAccountSets(this.model.purolatorCarrierAccountPagination, Constants.LCCarriers.purolator);
        // join this services result.
        forkJoin([carrierSettings, carrierRatesWithConfiguredInfo, locationGroupConfig, uspsCarrierAccountSets, carrierAccount, canadaPostCarrierAccountSets, purolatorCarrierAccountSets]).subscribe(response => {
            this._loggerService.info('LocationGroupConfigComponent : forkJoin');

            if (response && response[0] && response[0].items) {
                this.getCarrierSettingsSuccess(response[0].items);
            }

            if (response && response[1] && response[1].items) {
                this.getAllCarrierRatesWithConfiguredInfoSuccess(response[1].items);
            }

            if (response && response[2] && response[2].items) {
                const lgConfigModel: LocationGroupConfigurationModel = <LocationGroupConfigurationModel>response[2].items;
                this.model.lgConfigModel = lgConfigModel;
                this.resetLocationGroupConfigForm();
                this.updateLocationGroupConfigForm(lgConfigModel);
            }

            if (response && response[3] && response[3].items) {
                this.getAllUSPSCarrierAccount(response[3].items);
                this.model.uspsCarrierAccountPagination.totalRecordCount = response[3].total;
            }

            if (response && response[4] && response[4].items) {
                const carrierAccountConfigModel: CarrierAccountSetModel = <CarrierAccountSetModel>response[4].items
                this.updateCarrierAccountsConfigForm(carrierAccountConfigModel);
            }

            if (response && response[5] && response[5].items) {
                this.getAllCanadaPostCarrierAccount(response[5].items);
                this.model.canadaPostCarrierAccountPagination.totalRecordCount = response[5].total;
            }

            if (response && response[6] && response[6].items) {
                this.getAllPurolatorCarrierAccount(response[6].items);
                this.model.purolatorCarrierAccountPagination.totalRecordCount = response[6].total;
            }
        }, (response) => {
            this.getLocationGroupConfigError(response.error.message);
        });
    }

    private getLocationGroupConfigError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigError');
        this._spinner.stop();
        this._tostrService.showError(errmsg);
    }

    private resetLocationGroupConfigForm(): void {
        this.model.locationGroupConfigForm.reset();
        this.model.locationGroupConfigForm.controls.boxItems = new FormArray([]);
        this.model.locationGroupConfigForm.controls.carriers = new FormArray([]);
        this.model.locationGroupConfigForm.controls.upsUsShippingTypes = new FormArray([]);
        this.model.locationGroupConfigForm.controls.uspsShippingTypes = new FormArray([]);
        this.model.locationGroupConfigForm.controls.fedExShippingTypes = new FormArray([]);
        this.model.locationGroupConfigForm.controls.canadapostShippingTypes = new FormArray([]);
        this.model.locationGroupConfigForm.controls.PurolatorShippingTypes = new FormArray([]);
    }

    private updateLocationGroupConfigForm(lgConfigModel: LocationGroupConfigurationModel): void {

        this.model.lgConfigModel = lgConfigModel;

        // create box Types controllers before assign the value
        if (lgConfigModel && lgConfigModel.boxTypes && lgConfigModel.boxTypes.length > 0) {
            lgConfigModel.boxTypes.map(function (value, index) {
                this.addBoxItem();
            }, this);
        }

        this.addCarriersCheckboxes();
        this.addUPSUSShippingTypesCheckboxes();
        this.addFedExShippingTypesCheckboxes();
        this.addUSPSShippingTypesCheckboxes();
        this.addCanadaPostShippingTypesCheckboxes();
        this.addPurolatorShippingTypesCheckboxes();

        let unitedStatesUpsSettings: ShippingMethodMappings;
        let shippingSettingsForFedEx: ShippingMethodMappings;
        let shippingSettingsForUsps: ShippingMethodMappings;
        let shippingSettingsForCanadaPost: ShippingMethodMappings;
        let shippingSettingsForPurolator: ShippingMethodMappings;

        if (lgConfigModel && lgConfigModel.carriers.length > 0) {
            lgConfigModel.carriers.forEach((carrier) => {
                switch (carrier.carrierType.toLowerCase()) {
                    case 'ups':
                        unitedStatesUpsSettings = carrier.shippingMethodMappings;
                        break;

                    case 'usps':
                        shippingSettingsForUsps = carrier.shippingMethodMappings;
                        break;

                    case 'fedex':
                        shippingSettingsForFedEx = carrier.shippingMethodMappings;
                        break;

                    case 'canadapost':
                        shippingSettingsForCanadaPost = carrier.shippingMethodMappings;
                        break;
                    case 'purolator':
                        shippingSettingsForPurolator = carrier.shippingMethodMappings;
                        break;

                }
            });
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
                printReturnLabel: lgConfigModel.printReturnLabel === undefined ? false : lgConfigModel.printReturnLabel,
                defaultPrinterType: lgConfigModel.defaultPrinterType,
                // Box Types
                boxItems: lgConfigModel.boxTypes,
                // UPS Settings
                // UPS US Shipping Types
                upsUsShippingTypes: this.setSelectedUpsUsShippingTypes(unitedStatesUpsSettings),
                upsUSStandardDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.standardDefault : null,
                upsUSExpress1DayDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.express1DayDefault : null,
                upsUSExpress2DayDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.express2DayDefault : null,
                upsUSExpress3DayDefault: unitedStatesUpsSettings ? unitedStatesUpsSettings.express3DayDefault : null,
                upsUSReturnLabelShippingTypes: unitedStatesUpsSettings ? unitedStatesUpsSettings.returnLabelShippingMethod : null,
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
                uspsStandardDefault: shippingSettingsForUsps ? shippingSettingsForUsps.standardDefault : null,
                uspsExpress1DayDefault: shippingSettingsForUsps ? shippingSettingsForUsps.express1DayDefault : null,
                uspsExpress2DayDefault: shippingSettingsForUsps ? shippingSettingsForUsps.express2DayDefault : null,
                uspsExpress3DayDefault: shippingSettingsForUsps ? shippingSettingsForUsps.express3DayDefault : null,
                uspsReturnLabelShippingTypes: shippingSettingsForUsps ? shippingSettingsForUsps.returnLabelShippingMethod : null,

                // Canada Post Settings
                canadapostShippingTypes: this.setSelectedCanadaPostShippingTypes(shippingSettingsForCanadaPost),
                canadapostStandardDefault: shippingSettingsForCanadaPost ? shippingSettingsForCanadaPost.standardDefault : null,
                canadapostExpress1DayDefault: shippingSettingsForCanadaPost ? shippingSettingsForCanadaPost.express1DayDefault : null,
                canadapostExpress2DayDefault: shippingSettingsForCanadaPost ? shippingSettingsForCanadaPost.express2DayDefault : null,
                canadapostExpress3DayDefault: shippingSettingsForCanadaPost ? shippingSettingsForCanadaPost.express3DayDefault : null,
                canadapostReturnLabelShippingTypes: shippingSettingsForCanadaPost ? shippingSettingsForCanadaPost.returnLabelShippingMethod : null,

                //Purolator settings.
                purolatorShippingTypes: this.setSelectedPurolatorShippingTypes(shippingSettingsForPurolator),
                purolatorStandardDefault: shippingSettingsForPurolator ? shippingSettingsForPurolator.standardDefault : null,
                purolatorExpress1DayDefault: shippingSettingsForPurolator ? shippingSettingsForPurolator.express1DayDefault : null,
                purolatorExpress2DayDefault: shippingSettingsForPurolator ? shippingSettingsForPurolator.express2DayDefault : null,
                purolatorExpress3DayDefault: shippingSettingsForPurolator ? shippingSettingsForPurolator.express3DayDefault : null,
                purolatorReturnLabelShippingTypes: shippingSettingsForPurolator ? shippingSettingsForPurolator.returnLabelShippingMethod : null,

                autoPackingListPopup: lgConfigModel.autoPackingListPopup === undefined ? false : lgConfigModel.autoPackingListPopup,
                blockPartialStock: lgConfigModel.blockPartialStock === undefined ? false : lgConfigModel.blockPartialStock,
                defaultMaxNumberOfShipmentsInPickWave: lgConfigModel.defaultMaxNumberOfShipmentsInPickWave,
                displayProductImagesInPickWaveDetails: lgConfigModel.displayProductImagesInPickWaveDetails === undefined ? false : lgConfigModel.displayProductImagesInPickWaveDetails,
                enablePnpForSTH: lgConfigModel.enablePnpForSTH === undefined ? false : lgConfigModel.enablePnpForSTH,
                enablePnpForBOPIS: lgConfigModel.enablePnpForBOPIS === undefined ? false : lgConfigModel.enablePnpForBOPIS,
                blockPartialCancel: lgConfigModel.blockPartialCancel === undefined ? false : lgConfigModel.blockPartialCancel,

                //PakageSettings                
                packageSettingsUnitType: lgConfigModel.packageSettings && lgConfigModel.packageSettings.unitType || '',
            });

            //BPM Configurations
            this.patchBpmConfigurations();
        }
        this._spinner.stop();
    }

    patchBpmConfigurations() {
        var lgConfigModel = this.model.lgConfigModel;

        var sthConfig = lgConfigModel.bpmConfigurations.filter(config => config.shipmentType === Constants.ShipmentType.sth);
        var bopisConfig = lgConfigModel.bpmConfigurations.filter(config => config.shipmentType === Constants.ShipmentType.bopis);
        var transferConfig = lgConfigModel.bpmConfigurations.filter(config => config.shipmentType === Constants.ShipmentType.transfer);

        this.model.locationGroupConfigForm.patchValue({
            sthWorkflowProcess: sthConfig.length > 0 && this.getBPMName(sthConfig[0].workflowContainerId, sthConfig[0].workflowProcessId) || '',
            bopisWorkflowProcess: bopisConfig.length > 0 && this.getBPMName(bopisConfig[0].workflowContainerId, bopisConfig[0].workflowProcessId) || '',
            transferWorkflowProcess: transferConfig.length > 0 && this.getBPMName(transferConfig[0].workflowContainerId, transferConfig[0].workflowProcessId) || '',
        });
    } 


    private updateCarrierAccountsConfigForm(carrierAccountModel: any): void {
        const uspsCarrierAccount = carrierAccountModel.filter(a => a.carrierId === 'usps')
        if (uspsCarrierAccount.length > 0) {
            this.model.selectedUSPSCarrier = {
                data: uspsCarrierAccount[0].code,
                label: uspsCarrierAccount[0].name
            }
        } else {
            this.model.selectedUSPSCarrier = Constants.DefaultUSPSAccount;
        }
        const canadaPostCarrierAccount = carrierAccountModel.filter(a => a.carrierId === Constants.LCCarriers.canadapost);
        if (canadaPostCarrierAccount.length > 0) {
            this.model.selectedCanadaPostCarrier = {
                data: canadaPostCarrierAccount[0].code,
                label: canadaPostCarrierAccount[0].name
            }
        } else {
            this.model.selectedCanadaPostCarrier = Constants.DefaultCanadaPostAccount;
        }

        const purolatorCarrierAccount = carrierAccountModel.filter(a => a.carrierId === Constants.LCCarriers.purolator);
        if (purolatorCarrierAccount.length > 0) {
            this.model.selectedPurolatorCarrier = {
                data: purolatorCarrierAccount[0].code,
                label: purolatorCarrierAccount[0].name
            }
        } else {
            this.model.selectedPurolatorCarrier = Constants.DefaultPurolatorAccount;
        }
    }

    private setSelectedCanadaPostShippingTypes(shippingSettingsForCanadaPost: ShippingMethodMappings): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForCanadaPost) {
            const shippingMethods = shippingSettingsForCanadaPost.shippingMethods;
            this.model.LCCanadaPostShippingType.map((o, i) => {
                const isShippingTypeSelected = _.indexOf(shippingMethods, o.data);
                if (isShippingTypeSelected === -1) {
                    shippingTypeLst.push(false);
                } else {
                    shippingTypeLst.push(true);
                }
            });
        }
        return shippingTypeLst;
    }

    private setSelectedPurolatorShippingTypes(shippingSettingsForPurolator: ShippingMethodMappings): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForPurolator) {
            const shippingMethods = shippingSettingsForPurolator.shippingMethods;
            this.model.LCPurolatorShippingType.map((o, i) => {
                const isShippingTypeSelected = _.indexOf(shippingMethods, o.data);
                if (isShippingTypeSelected === -1) {
                    shippingTypeLst.push(false);
                } else {
                    shippingTypeLst.push(true);
                }
            });
        }
        return shippingTypeLst;
    }

    private setSelectedUspsShippingTypes(shippingSettingsForUsps: ShippingMethodMappings): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForUsps) {
            const shippingMethods = shippingSettingsForUsps.shippingMethods;
            this.model.LCUSPSShippingTypes.map((o, i) => {
                const isShippingTypeSelected = _.indexOf(shippingMethods, o.data);
                if (isShippingTypeSelected === -1) {
                    shippingTypeLst.push(false);
                } else {
                    shippingTypeLst.push(true);
                }
            });
        }
        return shippingTypeLst;
    }

    private setSelectedFedExShippingTypes(shippingSettingsForFedEx: ShippingMethodMappings): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (shippingSettingsForFedEx) {
            const shippingMethods = shippingSettingsForFedEx.shippingMethods;
            this.model.LCFedExShippingType.map((o, i) => {
                const isShippingTypeSelected = _.indexOf(shippingMethods, o.data);
                if (isShippingTypeSelected === -1) {
                    shippingTypeLst.push(false);
                } else {
                    shippingTypeLst.push(true);
                }
            });
        }
        return shippingTypeLst;
    }

    private setSelectedUpsUsShippingTypes(unitedStatesUpsSettingsModel: ShippingMethodMappings): boolean[] {
        const shippingTypeLst: boolean[] = [];
        if (unitedStatesUpsSettingsModel) {
            const shippingMethods = unitedStatesUpsSettingsModel.shippingMethods;
            this.model.LCUPSUSShippingTypes.map((o, i) => {
                const isShippingTypeSelected = _.indexOf(shippingMethods, o.data);
                if (isShippingTypeSelected === -1) {
                    shippingTypeLst.push(false);
                } else {
                    shippingTypeLst.push(true);
                }
            });
        }
        return shippingTypeLst;
    }

    private setSelectedCarriers(carriers: CarrierModel[]): boolean[] {
        const carriersUpr: CarrierModel[] = [];

        carriers.map((v) => {
            const carrierObj: CarrierModel = {} as CarrierModel;
            carrierObj.carrierType = v.carrierType.toUpperCase();
            carrierObj.isEnabled = v.isEnabled;
            carriersUpr.push(carrierObj);
        });
        const carriersLst: boolean[] = [];
        this.model.LCCarriers.map((o, i) => {
            const carrierObj = _.find(carriersUpr, { 'carrierType': (<string>o.CarrierType).toUpperCase() });
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
        lgConfigModel.locationGroupCode = this.model.lgConfigModel.locationGroupCode;
        // ISPU
        lgConfigModel.customerFailedToPickupAfterAction = lgconfigForm.get(['customerFailedToPickupAfterAction']).value;

        let custFailedToPickupDeadline = lgconfigForm.get(['customerFailedToPickupDeadline']).value
        if (custFailedToPickupDeadline != undefined && custFailedToPickupDeadline != "" && isNaN(custFailedToPickupDeadline)) {
            this._tostrService.showError(ErrorCode.NonIntCustomerFailedToPickupDeadline);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;
        }

        lgConfigModel.customerFailedToPickupDeadline = lgconfigForm.get(['customerFailedToPickupDeadline']).value;
        lgConfigModel.sendCustomerPickupReminder = lgconfigForm.get(['sendCustomerPickupReminder']).value;
        // Shipping
        lgConfigModel.carriers = this.getSelectedCarriers(lgconfigForm.get(['carriers']).value);
        lgConfigModel.defaultCarrier = lgconfigForm.get(['defaultCarrier']).value;
        lgConfigModel.printReturnLabel = lgconfigForm.get(['printReturnLabel']).value;
        lgConfigModel.defaultPrinterType = lgconfigForm.get(['defaultPrinterType']).value;
        // Box Types
        lgConfigModel.boxTypes = lgconfigForm.get(['boxItems']).value;

        // Carriers
        lgConfigModel.carriers = [] as CarrierModel[];

        const control = this.model.locationGroupConfigForm.get('carriers')['controls'];

        let index = 0;
        control.forEach((element: { value: any; }) => {

            const shippingType = this.model.LCCarriers[index++];
            switch (shippingType.CarrierType.toLowerCase()) {
                case 'ups':
                    if (element.value) {
                        const upsMethod = {} as CarrierModel;
                        upsMethod.shippingMethodMappings = {} as ShippingMethodMappings;
                        upsMethod.carrierType = shippingType.CarrierType;
                        upsMethod.isEnabled = element.value;
                        upsMethod.shippingMethodMappings.shippingMethods = this.getSelectedUpsUsShippingTypes(lgconfigForm.get(['upsUsShippingTypes']).value);
                        upsMethod.shippingMethodMappings.returnLabelShippingMethod = lgconfigForm.get(['upsUSReturnLabelShippingTypes']).value;
                        upsMethod.shippingMethodMappings.standardDefault = lgconfigForm.get(['upsUSStandardDefault']).value;
                        upsMethod.shippingMethodMappings.express1DayDefault = lgconfigForm.get(['upsUSExpress1DayDefault']).value;
                        upsMethod.shippingMethodMappings.express2DayDefault = lgconfigForm.get(['upsUSExpress2DayDefault']).value;
                        upsMethod.shippingMethodMappings.express3DayDefault = lgconfigForm.get(['upsUSExpress3DayDefault']).value;
                        lgConfigModel.carriers.push(upsMethod);
                    }
                    break;

                case 'usps':
                    if (element.value) {
                        const uspsMethod = {} as CarrierModel;
                        uspsMethod.carrierType = shippingType.CarrierType;
                        uspsMethod.isEnabled = element.value;
                        uspsMethod.shippingMethodMappings = {} as ShippingMethodMappings;
                        uspsMethod.shippingMethodMappings.shippingMethods = this.getSelectedUspsShippingTypes(lgconfigForm.get(['uspsShippingTypes']).value);
                        uspsMethod.shippingMethodMappings.returnLabelShippingMethod = lgconfigForm.get(['uspsReturnLabelShippingTypes']).value;
                        uspsMethod.shippingMethodMappings.standardDefault = lgconfigForm.get(['uspsStandardDefault']).value;
                        uspsMethod.shippingMethodMappings.express1DayDefault = lgconfigForm.get(['uspsExpress1DayDefault']).value;
                        uspsMethod.shippingMethodMappings.express2DayDefault = lgconfigForm.get(['uspsExpress2DayDefault']).value;
                        uspsMethod.shippingMethodMappings.express3DayDefault = lgconfigForm.get(['uspsExpress3DayDefault']).value;
                        lgConfigModel.carriers.push(uspsMethod);
                    }
                    break;

                case 'fedex':
                    if (element.value) {
                        const fedexMethod = {} as CarrierModel;
                        fedexMethod.carrierType = shippingType.CarrierType;
                        fedexMethod.isEnabled = element.value;
                        fedexMethod.shippingMethodMappings = {} as ShippingMethodMappings;
                        fedexMethod.shippingMethodMappings.shippingMethods = this.getSelectedFedExShippingTypes(lgconfigForm.get(['fedExShippingTypes']).value);
                        fedexMethod.shippingMethodMappings.enableSmartPost = lgconfigForm.get(['enableSmartPost']).value;
                        fedexMethod.shippingMethodMappings.returnLabelShippingMethod = lgconfigForm.get(['fedExReturnLabelShippingTypes']).value;
                        fedexMethod.shippingMethodMappings.standardDefault = lgconfigForm.get(['fedexStandardDefault']).value;
                        fedexMethod.shippingMethodMappings.express1DayDefault = lgconfigForm.get(['fedexExpress1Default']).value;
                        fedexMethod.shippingMethodMappings.express2DayDefault = lgconfigForm.get(['fedexExpress2Default']).value;
                        fedexMethod.shippingMethodMappings.express3DayDefault = lgconfigForm.get(['fedexExpress3Default']).value;
                        lgConfigModel.carriers.push(fedexMethod);
                    }
                    break;

                case 'canadapost':
                    if (element.value) {
                        const canadapostMethod = {} as CarrierModel;
                        canadapostMethod.carrierType = shippingType.CarrierType;
                        canadapostMethod.isEnabled = element.value;
                        canadapostMethod.shippingMethodMappings = {} as ShippingMethodMappings;
                        canadapostMethod.shippingMethodMappings.shippingMethods = this.getSelectedCanadaPostShippingTypes(lgconfigForm.get(['canadapostShippingTypes']).value);
                        //canadapostMethod.shippingMethodMappings.enableSmartPost = lgconfigForm.get(['enableSmartPost']).value;
                        canadapostMethod.shippingMethodMappings.returnLabelShippingMethod = lgconfigForm.get(['canadapostReturnLabelShippingTypes']).value;
                        canadapostMethod.shippingMethodMappings.standardDefault = lgconfigForm.get(['canadapostStandardDefault']).value == null || '' ? 'canadapost_Expedited_Parcel' : lgconfigForm.get(['canadapostStandardDefault']).value;
                        canadapostMethod.shippingMethodMappings.express1DayDefault = lgconfigForm.get(['canadapostExpress1DayDefault']).value;
                        canadapostMethod.shippingMethodMappings.express2DayDefault = lgconfigForm.get(['canadapostExpress2DayDefault']).value;
                        canadapostMethod.shippingMethodMappings.express3DayDefault = lgconfigForm.get(['canadapostExpress3DayDefault']).value;
                        lgConfigModel.carriers.push(canadapostMethod);
                    }
                    break;

                case 'purolator':
                    if (element.value) {
                        const purolatorMethod = {} as CarrierModel;
                        purolatorMethod.carrierType = shippingType.CarrierType;
                        purolatorMethod.isEnabled = element.value;
                        purolatorMethod.shippingMethodMappings = {} as ShippingMethodMappings;
                        purolatorMethod.shippingMethodMappings.shippingMethods = this.getSelectedPurolatorShippingTypes(lgconfigForm.get(['purolatorShippingTypes']).value);
                        purolatorMethod.shippingMethodMappings.returnLabelShippingMethod = lgconfigForm.get(['purolatorReturnLabelShippingTypes']).value;
                        purolatorMethod.shippingMethodMappings.standardDefault = lgconfigForm.get(['purolatorStandardDefault']).value;
                        purolatorMethod.shippingMethodMappings.express1DayDefault = lgconfigForm.get(['purolatorExpress1DayDefault']).value;
                        purolatorMethod.shippingMethodMappings.express2DayDefault = lgconfigForm.get(['purolatorExpress2DayDefault']).value;
                        purolatorMethod.shippingMethodMappings.express3DayDefault = lgconfigForm.get(['purolatorExpress3DayDefault']).value;
                        lgConfigModel.carriers.push(purolatorMethod);
                    }
               }
        });

        lgConfigModel.autoPackingListPopup = lgconfigForm.get(['autoPackingListPopup']).value;
        lgConfigModel.blockPartialStock = lgconfigForm.get(['blockPartialStock']).value;

        let numberOfShipmentsInPickWave = lgconfigForm.get(['defaultMaxNumberOfShipmentsInPickWave']).value
        if (numberOfShipmentsInPickWave != undefined && numberOfShipmentsInPickWave != "" && isNaN(numberOfShipmentsInPickWave)) {
            this._tostrService.showError(ErrorCode.NonIntDefaultMaxNumberOfShipmentsInPickWave);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;
        }

        lgConfigModel.defaultMaxNumberOfShipmentsInPickWave = lgconfigForm.get(['defaultMaxNumberOfShipmentsInPickWave']).value;
        lgConfigModel.displayProductImagesInPickWaveDetails = lgconfigForm.get(['displayProductImagesInPickWaveDetails']).value;
        lgConfigModel.enablePnpForSTH = lgconfigForm.get(['enablePnpForSTH']).value;
        lgConfigModel.enablePnpForBOPIS = lgconfigForm.get(['enablePnpForBOPIS']).value;
        lgConfigModel.blockPartialCancel = lgconfigForm.get(['blockPartialCancel']).value;

        // Package Settings
        const packageSettings: PackageSettings = { unitType: "" };
        packageSettings.unitType = lgconfigForm.get(['packageSettingsUnitType']).value;
        lgConfigModel.packageSettings = packageSettings;

        //BPM Configurations
        var bpmConfigurations: BPMConfiguration[] = [];

        var sthProcess = lgconfigForm.get(['sthWorkflowProcess']).value;
        var bopisProcess = lgconfigForm.get(['bopisWorkflowProcess']).value;
        var transferProcess = lgconfigForm.get(['transferWorkflowProcess']).value;

        if (sthProcess && sthProcess !== '' && sthProcess.includes(' -> ')) {
            var sthProcessData = sthProcess.split(' -> ');
            var sthWorkflowProcess = this.model.workflowProcessList.filter(process => process.containerAlias === sthProcessData[0] && process.id === sthProcessData[1]);

            if (sthWorkflowProcess && sthWorkflowProcess.length > 0) {
                var sthConfig: BPMConfiguration = {
                    shipmentType: Constants.ShipmentType.sth, workflowContainerId: sthWorkflowProcess[0].containerAlias, workflowProcessId: sthWorkflowProcess[0].id
                };
                bpmConfigurations.push(sthConfig);
            }
        }

        if (bopisProcess && bopisProcess !== '' && bopisProcess.includes(' -> ')) {
            var bopisProcessData = bopisProcess.split(' -> ');
            var bopisWorkflowProcess = this.model.workflowProcessList.filter(process => process.containerAlias === bopisProcessData[0] && process.id === bopisProcessData[1]);

            if (bopisWorkflowProcess && bopisWorkflowProcess.length > 0) {
                var bopisConfig: BPMConfiguration = {
                    shipmentType: Constants.ShipmentType.bopis, workflowContainerId: bopisWorkflowProcess[0].containerAlias, workflowProcessId: bopisWorkflowProcess[0].id
                };
                bpmConfigurations.push(bopisConfig);
            }
        }

        if (transferProcess && transferProcess !== '' && transferProcess.includes(' -> ')) {
            var transferProcessData = transferProcess.split(' -> ');
            var transferWorkflowProcess = this.model.workflowProcessList.filter(process => process.containerAlias === transferProcessData[0] && process.id === transferProcessData[1]);

            if (transferWorkflowProcess && transferWorkflowProcess.length > 0) {
                var bopisConfig: BPMConfiguration = {
                    shipmentType: Constants.ShipmentType.transfer, workflowContainerId: transferWorkflowProcess[0].containerAlias, workflowProcessId: transferWorkflowProcess[0].id
                };
                bpmConfigurations.push(bopisConfig);
            }
        }

        lgConfigModel.bpmConfigurations = bpmConfigurations;

        // Audit Info
        lgConfigModel.auditInfo = this.model.lgConfigModel.auditInfo;

        // USPS Carrier Account
        const carrierAccountModel = [] as CarrierAccountModel[];
        if (this.model.uspsCarrierAccount && this.model.uspsCarrierAccount.length != 0)
            carrierAccountModel.push({
                locationGroupCode: this.model.lgConfigModel.locationGroupCode,
                siteId: this.model.lgConfigModel.siteId,
                carrierId: Constants.LCCarriers.usps,
                credentialSet: {
                    code: this.model.uspsCarrierAccount.data,
                    carrierId: Constants.LCCarriers.usps,
                    name: this.model.uspsCarrierAccount.label,
                    values: null
                }
            })

        if (this.model.canadaPostCarrierAccount && this.model.canadaPostCarrierAccount.length != 0)
            carrierAccountModel.push({
                locationGroupCode: this.model.lgConfigModel.locationGroupCode,
                siteId: this.model.lgConfigModel.siteId,
                carrierId: Constants.LCCarriers.canadapost,
                credentialSet: {
                    code: this.model.canadaPostCarrierAccount.data,
                    carrierId: Constants.LCCarriers.canadapost,
                    name: this.model.canadaPostCarrierAccount.label,
                    values: null
                }
            })


        if (this.model.purolatorCarrierAccount && this.model.purolatorCarrierAccount.length != 0)
            carrierAccountModel.push({
                locationGroupCode: this.model.lgConfigModel.locationGroupCode,
                siteId: this.model.lgConfigModel.siteId,
                carrierId: Constants.LCCarriers.purolator,
                credentialSet: {
                    code: this.model.purolatorCarrierAccount.data,
                    carrierId: Constants.LCCarriers.purolator,
                    name: this.model.purolatorCarrierAccount.label,
                    values: null
                }
            })

        if (!this.validateShippingTypes(lgconfigForm)) {
            return false;
        }

        if (this.validateLocationGroup(lgConfigModel)) {
            this.updateLocationGroupConfig(lgConfigModel, carrierAccountModel);
        }
    }

    private validateShippingTypes(lgconfigForm: FormGroup): boolean {
        if (lgconfigForm.controls.defaultCarrier.value !== ('' || undefined)) {
            let isAtLeastOneTypeSelected = false;
            switch (lgconfigForm.controls.defaultCarrier.value.toLowerCase()) {
                case 'ups':
                    lgconfigForm.controls.upsUsShippingTypes.value.map((val, index) => {
                        if (val) {
                            isAtLeastOneTypeSelected = true;
                        }
                    });
                    if (!isAtLeastOneTypeSelected) {
                        this._tostrService.showError(ErrorCode.EmptyUPSUsShippingTypes);
                        this._spinner.stop();
                        this._progressButtonService.stop();
                    }
                    break;
                case 'fedex':
                    lgconfigForm.controls.fedExShippingTypes.value.map((val, index) => {
                        if (val) {
                            isAtLeastOneTypeSelected = true;
                        }
                    });
                    if (!isAtLeastOneTypeSelected) {
                        this._tostrService.showError(ErrorCode.EmptyFedExShippingTypes);
                        this._spinner.stop();
                        this._progressButtonService.stop();
                    }
                    break;
                case 'usps':
                    lgconfigForm.controls.uspsShippingTypes.value.map((val, index) => {
                        if (val) {
                            isAtLeastOneTypeSelected = true;
                        }
                    });
                    if (!isAtLeastOneTypeSelected) {
                        this._tostrService.showError(ErrorCode.EmptyUSPSShippingTypes);
                        this._spinner.stop();
                        this._progressButtonService.stop();
                    }
                    break;
                case 'canadapost':
                    lgconfigForm.controls.canadapostShippingTypes.value.map((val, index) => {
                        if (val) {
                            isAtLeastOneTypeSelected = true;
                        }
                    });
                    if (!isAtLeastOneTypeSelected) {
                        this._tostrService.showError(ErrorCode.EmptyCanadaPostShippingTypes);
                        this._spinner.stop();
                        this._progressButtonService.stop();
                    }
                    break;
                case 'purolator':
                    lgconfigForm.controls.purolatorShippingTypes.value.map((val, index) => {
                        if (val) {
                            isAtLeastOneTypeSelected = true;
                        }
                    });
                    if (!isAtLeastOneTypeSelected) {
                        this._tostrService.showError(ErrorCode.EmptyPurolatorShippingTypes);
                        this._spinner.stop();
                        this._progressButtonService.stop();
                    }
                    break;

                default:
                    isAtLeastOneTypeSelected = true;
                    break;
            }
            return isAtLeastOneTypeSelected;
        }
        return true;
    }

    private updateLocationGroupConfig(lgcModel: LocationGroupConfigurationModel, carrierAccountModels: CarrierAccountModel[]) {
        this._loggerService.info('LocationGroupConfigComponent : updateLocationGroupConfig');
        let locationForkJoinList = [];
        const locationGroup = this.configService.updateLocationGroupConfig(lgcModel);
        locationForkJoinList.push(locationGroup);
        if (carrierAccountModels && carrierAccountModels.length != 0) {
            const slectedCarrierAccount = this.configService.SaveCarrierAccount(carrierAccountModels);
            locationForkJoinList.push(slectedCarrierAccount);
        }
        forkJoin(locationForkJoinList).subscribe(response =>
            this.updateLocationGroupConfigSuccess(response),
            (response) => this.updateLocationGroupConfigError(response.error.message));
        let siteIds = [];
        siteIds.push(lgcModel.siteId);
        this.setConfigData(lgcModel.locationGroupId, lgcModel.locationGroupCode, siteIds);
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

    private getSelectedCarriers(carriers: boolean[]): CarrierModel[] {
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

    private getSelectedFedExShippingTypes(shippingSettingsForFedEx: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (shippingSettingsForFedEx) {
            shippingTypeLst = shippingSettingsForFedEx.map((v, i) => v ? this.model.LCFedExShippingType[i].data : null)
                .filter(v => v !== null);
        }
        return shippingTypeLst;
    }

    private getSelectedCanadaPostShippingTypes(shippingSettingsForCanadaPost: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (shippingSettingsForCanadaPost) {
            shippingTypeLst = shippingSettingsForCanadaPost.map((v, i) => v ? this.model.LCCanadaPostShippingType[i].data : null)
                .filter(v => v !== null);
        }
        return shippingTypeLst;
    }

    private getSelectedPurolatorShippingTypes(shippingSettingsForPurolator: boolean[]): string[] {
        let shippingTypeLst: string[] = [];
        if (shippingSettingsForPurolator) {
            shippingTypeLst = shippingSettingsForPurolator.map((v, i) => v ? this.model.LCPurolatorShippingType[i].data : null)
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

    private validateLocationGroup(lgModel: LocationGroupConfigurationModel): boolean {
        if (lgModel && lgModel.defaultPrinterType === ('' || undefined)) {
            this._tostrService.showError(ErrorCode.EmptyDefaultPrintType);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;

        }
        if (lgModel && lgModel.boxTypes.map(boxTypes => boxTypes.name).includes('')) {
            this._tostrService.showError(ErrorCode.EmptyBoxTypeName);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;

        }
        if (lgModel && lgModel.boxTypes.map(boxTypes => boxTypes.length).includes('')) {
            this._tostrService.showError(ErrorCode.EmptyBoxTypeLength);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;

        }
        if (lgModel && lgModel.boxTypes.map(boxTypes => boxTypes.width).includes('')) {
            this._tostrService.showError(ErrorCode.EmptyBoxTypeWidth);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;

        }
        if (lgModel && lgModel.boxTypes.map(boxTypes => boxTypes.height).includes('')) {
            this._tostrService.showError(ErrorCode.EmptyBoxTypeHeight);
            this._spinner.stop();
            this._progressButtonService.stop();
            return false;

        }
        return true;
    }

    private setConfigData(locationGroupId, locationGroupCode, siteIds) {
        const topLocationGroupConfigModel = new TopLocationGroupConfigModel();
        topLocationGroupConfigModel.locationGroupId = locationGroupId;
        topLocationGroupConfigModel.locationGroupCode = locationGroupCode;
        topLocationGroupConfigModel.locationGroupSiteIds = siteIds;
        this._notificationService.notifySetLocationGroupConfigData({ name: NotificationLGActions.locationGroupConfigUpdate, data: topLocationGroupConfigModel });
    }

    private getAllUSPSCarrierAccount(result: CarrierAccountSetModel[]) {
        this._loggerService.info('LocationGroupConfigComponent : getAllUSPSCarrierAccount' + JSON.stringify(result));
        if (result) {
            const carrierAccountType: CarrierAccountSetModel[] = <CarrierAccountSetModel[]>result;
            this.model.uspsCarrierAccountList = [] as SelectedCarrierAccountModel[];
            carrierAccountType.map((value, index) => {
                const carrierAccountObj = {
                    data: value.code,
                    label: value.name
                };
                if (value.carrierId.toLowerCase() === Constants.LCCarriers.usps) {
                    this.model.uspsCarrierAccountList.push(carrierAccountObj);
                }
            });
        }
    }

    private getAllCanadaPostCarrierAccount(result: CarrierAccountSetModel[]) {
        this._loggerService.info('LocationGroupConfigComponent : getAllCanadaPostCarrierAccount' + JSON.stringify(result));
        if (result) {
            const carrierAccountType: CarrierAccountSetModel[] = <CarrierAccountSetModel[]>result;
            this.model.canadaPostCarrierAccountList = [] as SelectedCarrierAccountModel[];
            carrierAccountType.map((value, index) => {
                const carrierAccountObj = {
                    data: value.code,
                    label: value.name
                };
                if (value.carrierId.toLowerCase() === Constants.LCCarriers.canadapost) {
                    this.model.canadaPostCarrierAccountList.push(carrierAccountObj);
                }
            });
        }
    }

    private getAllPurolatorCarrierAccount(result: CarrierAccountSetModel[]) {
        this._loggerService.info('LocationGroupConfigComponent : getAllPurolatorCarrierAccount' + JSON.stringify(result));
        if (result) {
            const carrierAccountType: CarrierAccountSetModel[] = <CarrierAccountSetModel[]>result;
            this.model.purolatorCarrierAccountList = [] as SelectedCarrierAccountModel[];
            carrierAccountType.map((value, index) => {
                const carrierAccountObj = {
                    data: value.code,
                    label: value.name
                };
                if (value.carrierId.toLowerCase() === Constants.LCCarriers.purolator) {
                    this.model.purolatorCarrierAccountList.push(carrierAccountObj);
                }
            });
        }
    }

    public getUSPSCarrierAccounts(pageDetails: any) {
        this.configService.getCarrierAccountSets(pageDetails, Constants.LCCarriers.usps).subscribe(response => {
            this.model.uspsCarrierAccountPagination.totalRecordCount = 0;
            this.getAllUSPSCarrierAccount(response.items);
            this.model.uspsCarrierAccountPagination.totalRecordCount = response.total;
        })
    }

    public getCanadaPostCarrierAccounts(pageDetails: any) {
        this.configService.getCarrierAccountSets(pageDetails, Constants.LCCarriers.canadapost).subscribe(response => {
            this.model.canadaPostCarrierAccountPagination.totalRecordCount = 0;
            this.getAllCanadaPostCarrierAccount(response.items);
            this.model.canadaPostCarrierAccountPagination.totalRecordCount = response.total;
        })
    }

    public getPurolatorCarrierAccounts(pageDetails: any) {
        this.configService.getCarrierAccountSets(pageDetails, Constants.LCCarriers.purolator).subscribe(response => {
            this.model.purolatorCarrierAccountPagination.totalRecordCount = 0;
            this.getAllPurolatorCarrierAccount(response.items);
            this.model.purolatorCarrierAccountPagination.totalRecordCount = response.total;
        })
    }

    public getSelectedUSPSCarrier(SelectedValues: SelectedCarrierAccountModel) {
        this.model.uspsCarrierAccount = [];
        this.model.uspsCarrierAccount = SelectedValues;
    }

    public getSelectedCanadaPostCarrier(SelectedValues: SelectedCarrierAccountModel) {
        this.model.canadaPostCarrierAccount = [];
        this.model.canadaPostCarrierAccount = SelectedValues;
    }

    public getSelectedPurolatorCarrier(SelectedValues: SelectedCarrierAccountModel) {
        this.model.purolatorCarrierAccount = [];
        this.model.purolatorCarrierAccount = SelectedValues;
    }
}
