import { Component, OnInit } from '@angular/core';
import { LoggerService, TostrService } from '@core';
import { SharedDataService } from '@global';
import { LocationGroupConfigModel, LocationGroupConfigurationModel } from './config.model';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Constants } from '@shared';
import { LocationGroupConfigService } from './config.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

@Component({
    selector: 'app-locationgroup-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.css'],
    providers: [LocationGroupConfigService]
})
export class LocationGroupConfigComponent implements OnInit {
    public model: LocationGroupConfigModel;

    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private fb: FormBuilder,
        private configService: LocationGroupConfigService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private _tostrService: TostrService
    ) { }

    ngOnInit() {
        this.model = new LocationGroupConfigModel();
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
            boxItems: this.fb.array([ this.createBoxItem()]),

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

            outboundPassword:  ['', []],
            outboundCustomerNumber:  ['', []],
            outboundLocale:  ['', []],
            outboundContractID:  ['', []],
            carsPickupNotify:  ['', []],
            preferredPickupTime:  ['', []],
            outboundUsername:  ['', []],

            uspsShippingTypes: new FormArray([]),
            uspsStandardDefault:  ['', []],
            uspsExpress1DayDefault:  ['', []],
            uspsExpress2DayDefault:  ['', []],
            uspsExpress3DayDefault:  ['', []],
            uspsReturnLabelShippingTypes:  ['', []],
            closingTime:  ['', []],

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

        this.fetchSitesData();

        const locationGroupId  = this.activeRoute.snapshot.paramMap.get('id');
        const siteId = this.activeRoute.snapshot.paramMap.get('siteId');
        this.model.selectedSite = _.find(this.model.sitesLst, { 'id': _.parseInt(siteId)});

        this.activeRoute.params.subscribe(routeParams => {
            console.log('activeRoute parameters changed !!!!!');
            this.fetchLocationGroupConfig(locationGroupId, siteId);
        });
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

    public fetchSitesData = () => {
        this._loggerService.info('LocationGroupConfigComponent : fetchSitesData');
        if (this._sharedData._sharedData.items.ctTenant.sites) {
            this.model.sitesLst = this._sharedData._sharedData.items.ctTenant.sites;
        }
    }

    public fetchLocationGroupConfig = (locationGroupId, siteId) => {
        this._loggerService.info('LocationGroupConfigComponent : fetchLocationGroupConfig');
        this.configService.getLocationGroupConfig(locationGroupId, siteId).subscribe(response =>
            this.getLocationGroupConfigSuccess(response),
            (response) => this.getLocationGroupConfigError(response.error.message));
    }

    private getLocationGroupConfigSuccess(result) {
        // this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigSuccess' + JSON.stringify(result));
        const lgConfigModel: LocationGroupConfigurationModel =   <LocationGroupConfigurationModel>result;
        // console.log('lgConfigModel --->>>:', lgConfigModel);
        this.resetLocationGroupConfigForm();
        this.updateLocationGroupConfigForm(lgConfigModel);
    }

    private getLocationGroupConfigError(errmsg: string) {
        this._loggerService.info('LocationGroupConfigComponent : getLocationGroupConfigError');
        this._tostrService.showError(errmsg);
    }

    private resetLocationGroupConfigForm(): void {
        this.model.locationGroupConfigForm.patchValue({
            customerFailedToPickupAfterAction: '',
            sendCustomerPickupReminder: '',
            defaultCarrier: 'None',
            printReturnLabel: 'Yes',
            defaultPrinterType: 'Laser'

        });
        console.log('------------resetLocationGroupConfigForm--------------------');
    }

    private updateLocationGroupConfigForm(lgConfigModel: LocationGroupConfigurationModel): void {

        console.log('lgConfigModel --->>>:', lgConfigModel);
        if (lgConfigModel) {
            this.model.locationGroupConfigForm.patchValue({
                // ISPU
                customerFailedToPickupAfterAction: lgConfigModel.customerFailedToPickupAfterAction,
                customerFailedToPickupDeadline: lgConfigModel.customerFailedToPickupDeadline,
                sendCustomerPickupReminder: lgConfigModel.sendCustomerPickupReminder,
                // Shipping
                defaultCarrier: lgConfigModel.defaultCarrier,
                printReturnLabel: lgConfigModel.printReturnLabel,
                defaultPrinterType: lgConfigModel.defaultPrinterType


            });
        }
    }

    private addUSPSShippingTypesCheckboxes() {
        this.model.LCUSPSShippingTypes.map((o, i) => {
            const control = new FormControl(); // if first item set to true, else false
            (this.model.locationGroupConfigForm.controls.uspsShippingTypes as FormArray).push(control);
        });
    }
}
